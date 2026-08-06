import { NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { extractBiomarkers } from "@/lib/claude";
import { classify, type PhaseRange } from "@/lib/classify";
import {
  BIOMARKERS,
  type CyclePhase,
  type Range,
  type Zone,
} from "@/lib/biomarkers";
import { toCanonicalValue, convertRange } from "@/lib/units";
import type {
  AnalyzeResponse,
  AnalyzeResult,
  PeRatioResult,
} from "@/lib/api-types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const DAILY_LIMIT = 10;

const VALID_PHASES: readonly CyclePhase[] = [
  "folicular",
  "lutea",
  "postmenopausica",
  "no_se",
] as const;

type RateLimitMeta = {
  lastAnalysisDate?: string;
  analysesToday?: number;
};

const todayInMexicoCity = (): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

/**
 * Ratio Progesterona/Estradiol — solo se calcula en fase lútea, y se lee junto
 * con los valores absolutos (no solo el número).
 */
function computePeRatio(
  cyclePhase: CyclePhase,
  progesterona: number | null,
  estradiol: number | null,
): PeRatioResult {
  if (cyclePhase !== "lutea") {
    return {
      applicable: false,
      value: null,
      zone: "no_evaluable",
      label: "No aplica",
      reason: "El ratio P/E solo se calcula en fase lútea (≈ día 21).",
    };
  }
  if (progesterona == null || estradiol == null || estradiol <= 0) {
    return {
      applicable: false,
      value: null,
      zone: "no_evaluable",
      label: "No calculable",
      reason:
        "Faltan estradiol y/o progesterona con valor válido para calcular el ratio.",
    };
  }

  const ratio = (progesterona * 1000) / estradiol;
  const rounded = Math.round(ratio);

  if (ratio >= 300 && ratio <= 500) {
    return {
      applicable: true,
      value: rounded,
      zone: "verde",
      label: "Óptimo",
      reason: `Ratio P/E ${rounded} (óptimo 300–500).`,
    };
  }
  if (ratio >= 100 && ratio < 300) {
    return {
      applicable: true,
      value: rounded,
      zone: "amarillo",
      label: "Funcional, por debajo del óptimo",
      reason: `Ratio P/E ${rounded} (funcional 100–500; óptimo arriba de 300).`,
    };
  }
  if (ratio > 500) {
    return {
      applicable: true,
      value: rounded,
      zone: "amarillo",
      label: "Muy alto",
      reason: `Ratio P/E ${rounded} (>500) — revísalo con tu médica.`,
    };
  }
  // ratio < 100 → leer con los valores absolutos
  if (estradiol >= 100) {
    return {
      applicable: true,
      value: rounded,
      zone: "amarillo",
      label: "Dominancia estrogénica funcional",
      reason: `Ratio P/E ${rounded} (<100) con estrógeno normal/alto: sugiere dominancia estrogénica funcional.`,
    };
  }
  return {
    applicable: true,
    value: rounded,
    zone: "amarillo",
    label: "Posible agotamiento hormonal",
    reason: `Ratio P/E ${rounded} (<100) con ambas hormonas bajas: sugiere agotamiento hormonal (se trata distinto a la dominancia).`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "No autenticada." }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const meta = (user.privateMetadata ?? {}) as RateLimitMeta;
    const today = todayInMexicoCity();
    const usedToday =
      meta.lastAnalysisDate === today ? meta.analysesToday ?? 0 : 0;

    if (usedToday >= DAILY_LIMIT) {
      return Response.json(
        {
          error: `Alcanzaste el límite de ${DAILY_LIMIT} análisis por día. Vuelve mañana o contacta a Calia Lab si necesitas más.`,
        },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("pdf");
    const cyclePhaseRaw = formData.get("cyclePhase");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "No se recibió ningún PDF en el campo 'pdf'." },
        { status: 400 },
      );
    }
    if (file.type !== "application/pdf") {
      return Response.json(
        { error: "El archivo debe ser un PDF (application/pdf)." },
        { status: 400 },
      );
    }
    if (file.size > MAX_PDF_BYTES) {
      return Response.json(
        { error: "El PDF excede el tamaño máximo de 10 MB." },
        { status: 400 },
      );
    }

    const cyclePhase: CyclePhase = VALID_PHASES.includes(
      cyclePhaseRaw as CyclePhase,
    )
      ? (cyclePhaseRaw as CyclePhase)
      : "no_se";

    const buffer = Buffer.from(await file.arrayBuffer());
    const extraction = await extractBiomarkers(buffer);

    const extractedById = new Map(extraction.markers.map((m) => [m.id, m]));

    // Guardamos los valores canónicos de estradiol y progesterona para el P/E.
    let estradiolCanonical: number | null = null;
    let progesteronaCanonical: number | null = null;

    const results: AnalyzeResult[] = BIOMARKERS.map((b) => {
      const extracted = extractedById.get(b.id);
      const found =
        extracted?.found === true && typeof extracted.value === "number";

      // ── Conversión de unidades a canónica ──
      let canonicalValue: number | null = null;
      let conversionStatus: AnalyzeResult["conversionStatus"] = null;
      if (found && extracted && extracted.value != null) {
        const conv = toCanonicalValue(b.id, extracted.value, extracted.unit);
        canonicalValue = conv.value;
        conversionStatus = conv.conversion.status;
      }

      // Rango clínico del lab → convertir a canónica con el mismo factor.
      let labRange: Range | null = null;
      if (extracted?.labMin != null && extracted?.labMax != null) {
        labRange = convertRange(b.id, extracted.unit, extracted.labMin, extracted.labMax);
      }

      // Rangos por fase → convertir cada uno a canónica.
      let phaseRanges: PhaseRange[] | undefined;
      if (extracted?.phaseRanges) {
        phaseRanges = extracted.phaseRanges.map((p) => {
          const r = convertRange(b.id, extracted.unit, p.min, p.max);
          return { phase: p.phase, min: r.min, max: r.max };
        });
      }

      // Rango de la fase seleccionada (para mostrar como "rango clínico").
      let phaseRangeUsed: Range | null = null;
      if (b.cycleDependent && cyclePhase !== "no_se" && phaseRanges) {
        const matched = phaseRanges.find((p) => p.phase === cyclePhase);
        if (matched) phaseRangeUsed = { min: matched.min, max: matched.max };
      }

      if (b.id === "estradiol" && canonicalValue != null) estradiolCanonical = canonicalValue;
      if (b.id === "progesterona" && canonicalValue != null) progesteronaCanonical = canonicalValue;

      let zone: Zone = "no_evaluable";
      let reason = "No reportado en el PDF";

      if (found && canonicalValue != null) {
        const result = classify(
          b,
          canonicalValue,
          labRange ?? undefined,
          cyclePhase,
          phaseRanges,
        );
        zone = result.zone;
        reason = result.reason;
      }

      return {
        id: b.id,
        name: b.name,
        group: b.group,
        unit: b.unit,
        found,
        value: canonicalValue,
        reportedValue: extracted?.value ?? null,
        reportedUnit: extracted?.unit ?? null,
        conversionStatus,
        labRange,
        zone,
        reason,
        rcrcRange: b.rcrcRange ?? null,
        clinicalRange: phaseRangeUsed ?? labRange ?? b.clinicalFallback ?? null,
      };
    });

    const pe = computePeRatio(cyclePhase, progesteronaCanonical, estradiolCanonical);

    // Increment quota only after successful analysis
    await client.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...meta,
        lastAnalysisDate: today,
        analysesToday: usedToday + 1,
      },
    });

    const body: AnalyzeResponse = { results, cyclePhase, pe };
    return Response.json(body);
  } catch (e) {
    console.error("Error en /api/analyze:", e);
    const msg =
      e instanceof Error ? e.message : "Error desconocido al analizar el PDF.";
    return Response.json({ error: msg }, { status: 500 });
  }
}
