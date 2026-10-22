/**
 * Conversión de unidades a la unidad canónica de cada biomarcador.
 *
 * Bug crítico original: la herramienta comparaba el valor crudo del lab contra
 * el rango canónico SIN convertir. Si el lab reportaba en otra unidad (ej.
 * testosterona en ng/mL cuando el canónico es ng/dL) el semáforo salía mal.
 *
 * Principio: cada marcador tiene una unidad canónica (la de biomarkers.ts).
 * Al ingresar un valor, lo convertimos desde la unidad reportada por el lab a
 * la canónica; TODO el semáforo se calcula sobre la canónica.
 *
 * Los factores son el punto de partida del spec (validar contra formatos reales
 * de Salud Digna / Biomédica / Chopo). `factor` tal que:
 *     valor_canonico = valor_reportado * factor
 */

import { BIOMARKER_BY_ID } from "./biomarkers";

export type ConversionStatus =
  | "canonical" // el lab ya reporta en la unidad canónica
  | "converted" // se convirtió desde una unidad alterna conocida
  | "assumed" // el lab no reportó unidad → se asume canónica
  | "unknown"; // unidad no reconocida → no se convierte, se marca

export type Conversion = {
  factor: number;
  status: ConversionStatus;
  from: string | null;
  to: string;
};

/**
 * Normaliza un string de unidad para comparar:
 * minúsculas, µ/μ/mc → u, sin espacios, y unifica el orden UI/IU → iu.
 * Ej: "µUI/mL" → "uiu/ml", "mUI/mL" → "miu/ml", "ng/dL" → "ng/dl".
 */
export function normalizeUnit(raw: string | null | undefined): string {
  if (!raw) return "";
  let s = raw.toLowerCase().trim();
  s = s.replace(/µ|μ/g, "u"); // micro symbol → u
  s = s.replace(/mc/g, "u"); // mcg → ug
  s = s.replace(/\s+/g, ""); // sin espacios
  s = s.replace(/ui/g, "iu"); // UI (español) ↔ IU (inglés)
  return s;
}

/**
 * Tabla de unidades alternas por marcador.
 * clave = unidad alterna normalizada, valor = factor (canonico = reportado * factor).
 * La unidad canónica se toma de biomarkers.ts (b.unit) y siempre tiene factor 1.
 */
const ALT_UNITS: Record<string, Record<string, number>> = {
  // ── Hormonal sexual ──
  testosterona_total: { "ng/ml": 100 }, // 1 ng/mL = 100 ng/dL
  testosterona_libre: { "ng/dl": 10, "ng/l": 1 }, // 1 ng/dL = 10 pg/mL; pg/mL = ng/L
  estradiol: { "pmol/l": 1 / 3.671 },
  progesterona: { "nmol/l": 1 / 3.18 },
  dhea_s: { "umol/l": 1 / 0.02714, "ug/ml": 100 },
  prolactina: { "ug/l": 1 }, // ng/mL = µg/L
  fsh: { "iu/l": 1, "u/l": 1, "uiu/ml": 1 }, // mIU/mL = IU/L
  lh: { "iu/l": 1, "u/l": 1, "uiu/ml": 1 },

  // ── Tiroideo ──
  tsh: { "miu/l": 1, "uu/ml": 1, "iu/ml": 1 }, // µUI/mL = mIU/L
  t4_libre: { "pmol/l": 1 / 12.87, "ng/l": 0.1 }, // ng/dL
  t3_libre: { "pmol/l": 1 / 1.536, "ng/l": 1 }, // pg/mL = ng/L
  t4_total: { "nmol/l": 1 / 12.87 }, // µg/dL
  t3_total: { "ng/ml": 100, "nmol/l": 1 / 0.0154 }, // ng/dL

  // ── Metabólico ──
  glucosa_ayunas: { "mmol/l": 18.0182 },
  // hba1c: mmol/mol es afín (no multiplicativo) → se maneja aparte más abajo
  insulina: { "pmol/l": 1 / 6.945, "uu/ml": 1, "miu/l": 1 },

  // ── Estrés ──
  cortisol_am: { "nmol/l": 1 / 27.59 },

  // ── Nutrientes ──
  ferritina: { "ug/l": 1, "ng/l": 0.001 }, // ng/mL = µg/L
  b12: { "pmol/l": 1 / 0.738, "ng/l": 1 }, // pg/mL = ng/L
  vitamina_d: { "nmol/l": 1 / 2.496 },
};

/**
 * Devuelve la conversión para un marcador dado su unidad reportada.
 */
export function getConversion(
  biomarkerId: string,
  reportedUnit: string | null,
): Conversion {
  const b = BIOMARKER_BY_ID[biomarkerId];
  const canonical = normalizeUnit(b?.unit ?? "");
  const reported = normalizeUnit(reportedUnit);

  if (!reported) {
    return { factor: 1, status: "assumed", from: reportedUnit, to: b?.unit ?? "" };
  }
  if (reported === canonical) {
    return { factor: 1, status: "canonical", from: reportedUnit, to: b?.unit ?? "" };
  }
  const alt = ALT_UNITS[biomarkerId]?.[reported];
  if (alt !== undefined) {
    return { factor: alt, status: "converted", from: reportedUnit, to: b?.unit ?? "" };
  }
  return { factor: 1, status: "unknown", from: reportedUnit, to: b?.unit ?? "" };
}

/**
 * Convierte un valor (y opcionalmente un rango) a unidad canónica.
 * hba1c en mmol/mol se convierte con la fórmula afín IFCC → NGSP.
 */
export function toCanonicalValue(
  biomarkerId: string,
  value: number,
  reportedUnit: string | null,
): { value: number; conversion: Conversion } {
  // Caso especial afín: HbA1c mmol/mol (IFCC) → % (NGSP)
  if (biomarkerId === "hba1c" && normalizeUnit(reportedUnit) === "mmol/mol") {
    return {
      value: value * 0.09148 + 2.152,
      conversion: { factor: NaN, status: "converted", from: reportedUnit, to: "%" },
    };
  }
  const conversion = getConversion(biomarkerId, reportedUnit);
  return { value: value * conversion.factor, conversion };
}

/** Convierte los dos extremos de un rango con el mismo factor. */
export function convertRange(
  biomarkerId: string,
  reportedUnit: string | null,
  min: number,
  max: number,
): { min: number; max: number } {
  const { factor } = getConversion(biomarkerId, reportedUnit);
  const f = Number.isFinite(factor) ? factor : 1;
  return { min: min * f, max: max * f };
}
