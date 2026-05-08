import { NextRequest } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { extractBiomarkers } from "@/lib/claude";
import { classify } from "@/lib/classify";
import {
  BIOMARKERS,
  type CyclePhase,
  type Range,
  type Zone,
} from "@/lib/biomarkers";
import type { AnalyzeResponse, AnalyzeResult } from "@/lib/api-types";

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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json(
        { error: "No autenticada." },
        { status: 401 },
      );
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

    const extractedById = new Map(
      extraction.markers.map((m) => [m.id, m]),
    );

    const results: AnalyzeResult[] = BIOMARKERS.map((b) => {
      const extracted = extractedById.get(b.id);
      const found =
        extracted?.found === true && typeof extracted.value === "number";

      let labRange: Range | null = null;
      if (
        extracted?.labMin != null &&
        extracted?.labMax != null
      ) {
        labRange = { min: extracted.labMin, max: extracted.labMax };
      }

      let phaseRangeUsed: Range | null = null;
      if (
        b.cycleDependent &&
        cyclePhase !== "no_se" &&
        extracted?.phaseRanges
      ) {
        const matched = extracted.phaseRanges.find(
          (p) => p.phase === cyclePhase,
        );
        if (matched) {
          phaseRangeUsed = { min: matched.min, max: matched.max };
        }
      }

      let zone: Zone = "no_evaluable";
      let reason = "No reportado en el PDF";

      if (found && extracted) {
        const result = classify(
          b,
          extracted.value!,
          labRange ?? undefined,
          cyclePhase,
          extracted.phaseRanges ?? undefined,
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
        value: extracted?.value ?? null,
        reportedUnit: extracted?.unit ?? null,
        labRange,
        zone,
        reason,
        rcrcRange: b.rcrcRange ?? null,
        clinicalRange:
          phaseRangeUsed ?? labRange ?? b.clinicalFallback ?? null,
      };
    });

    // Increment quota only after successful analysis
    await client.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...meta,
        lastAnalysisDate: today,
        analysesToday: usedToday + 1,
      },
    });

    const body: AnalyzeResponse = { results, cyclePhase };
    return Response.json(body);
  } catch (e) {
    console.error("Error en /api/analyze:", e);
    const msg = e instanceof Error ? e.message : "Error desconocido al analizar el PDF.";
    return Response.json({ error: msg }, { status: 500 });
  }
}
