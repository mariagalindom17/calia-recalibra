import {
  type Biomarker,
  type CyclePhase,
  type Range,
  type Zone,
} from "./biomarkers";

export type Classification = {
  zone: Zone;
  reason: string;
};

export type PhaseRange = {
  phase: string;
  min: number;
  max: number;
};

const inside = (value: number, range: Range): boolean =>
  value >= range.min && value <= range.max;

// Techo de progesterona folicular cuando el lab no reporta rango de fase.
// En folicular la progesterona es normalmente baja (<~1.5 ng/mL); por arriba
// de esto es "elevada para folicular" y hay que revisarlo.
const PROG_FOLICULAR_CEILING_FALLBACK = 1.5; // ng/mL (canónico)

// Progesterona en fase lútea (rangos funcionales)
const PROG_LUTEA_OPTIMA = 15; // ng/mL: óptimo ≥ 15
const PROG_LUTEA_MINIMA = 5; // ng/mL: <5 sugiere no ovulación

/**
 * Anticuerpos (Anti-TPO / Anti-TGA) — semáforo ADAPTATIVO.
 *
 * El óptimo funcional Calia es <3, pero "3" solo tiene sentido en un ensayo
 * cuya escala lo permite. Por eso usamos el corte que reporta el propio lab
 * (labRange.max) como referencia clínica, y adaptamos:
 *   - Si el corte del lab ≤ óptimo (ensayo de escala chica, ej. 0–0.9):
 *       ≥ corte → rojo (positivo) · < corte → verde.
 *   - Si el corte del lab > óptimo (ensayo normal, ej. 0–34):
 *       < óptimo → verde · óptimo–corte → amarillo (vigilar) · ≥ corte → rojo.
 *   - Si el lab no reporta corte: no forzamos rojo; ≥ óptimo → amarillo
 *     (con nota de confirmar el ensayo).
 */
function classifyAntibody(
  biomarker: Biomarker,
  value: number,
  labRange?: Range,
): Classification {
  const optimo = biomarker.redIfAbove ?? 3;
  const corte = labRange?.max;

  if (corte === undefined) {
    return value >= optimo
      ? {
          zone: "amarillo",
          reason: `Sobre el óptimo funcional (<${optimo}). Confirmar ensayo/unidad del laboratorio para leerlo con precisión.`,
        }
      : { zone: "verde", reason: `Bajo el óptimo funcional (<${optimo})` };
  }

  if (corte <= optimo) {
    // Ensayo de escala pequeña: el óptimo <3 no aplica; usamos el corte del lab.
    return value >= corte
      ? { zone: "rojo", reason: `Positivo: ≥ corte del laboratorio (${corte})` }
      : { zone: "verde", reason: `Negativo: < corte del laboratorio (${corte})` };
  }

  if (value < optimo) {
    return { zone: "verde", reason: `Óptimo funcional (<${optimo})` };
  }
  if (value < corte) {
    return {
      zone: "amarillo",
      reason: `Sobre el óptimo funcional (<${optimo}) pero bajo el corte del laboratorio (${corte}) — vigilar`,
    };
  }
  return { zone: "rojo", reason: `Positivo: ≥ corte del laboratorio (${corte})` };
}

/**
 * Progesterona — depende de la fase (regla asimétrica).
 *   Lútea: se interpreta (óptimo ≥15; 5–15 subóptima; <5 sin ovulación).
 *   Folicular: baja es lo ESPERADO (no se marca); pero ALTA sí es notable.
 *   Posmenopausia: baja esperada (no se marca); alta es notable.
 */
function classifyProgesterona(
  value: number,
  cyclePhase: CyclePhase,
  labRange?: Range,
  phaseRange?: Range,
): Classification {
  if (cyclePhase === "lutea") {
    if (value >= PROG_LUTEA_OPTIMA) {
      return { zone: "verde", reason: `Óptima en fase lútea (≥${PROG_LUTEA_OPTIMA} ng/mL)` };
    }
    if (value >= PROG_LUTEA_MINIMA) {
      return {
        zone: "amarillo",
        reason: `Función lútea subóptima (${PROG_LUTEA_MINIMA}–${PROG_LUTEA_OPTIMA} ng/mL)`,
      };
    }
    return {
      zone: "rojo",
      reason: `Muy baja para fase lútea (<${PROG_LUTEA_MINIMA} ng/mL): sugiere ciclo sin ovulación`,
    };
  }

  // Folicular y posmenopausia: baja = esperada; alta = notable.
  const ceiling =
    phaseRange?.max ?? labRange?.max ?? PROG_FOLICULAR_CEILING_FALLBACK;
  const faseTxt = cyclePhase === "postmenopausica" ? "posmenopausia" : "fase folicular";

  if (value > ceiling) {
    return {
      zone: "amarillo",
      reason: `Progesterona elevada para ${faseTxt} (> ${ceiling}). Verifica el día del ciclo en que te la hiciste; si es correcto, coméntalo con tu médica.`,
    };
  }
  if (cyclePhase === "postmenopausica") {
    return { zone: "verde", reason: "Baja es lo esperado en posmenopausia" };
  }
  return {
    zone: "no_evaluable",
    reason:
      "En fase folicular la progesterona baja es lo esperado. Para leerla, repite el estudio en día 21 (fase lútea).",
  };
}

/**
 * Estradiol — depende de la fase, sin alarmismo (fluctúa mucho en peri).
 */
function classifyEstradiol(
  value: number,
  cyclePhase: CyclePhase,
  labRange?: Range,
  phaseRange?: Range,
): Classification {
  const range = phaseRange ?? labRange;

  if (cyclePhase === "postmenopausica") {
    if (range && value > range.max) {
      return { zone: "amarillo", reason: "Estradiol elevado para posmenopausia — notable" };
    }
    return { zone: "verde", reason: "Estradiol bajo es lo esperado en posmenopausia" };
  }

  if (!range) {
    return {
      zone: "no_evaluable",
      reason: "El laboratorio no reportó rango de referencia para esta fase",
    };
  }
  if (inside(value, range)) {
    return { zone: "verde", reason: `Dentro del rango de referencia para fase ${cyclePhase}` };
  }
  return {
    zone: "amarillo",
    reason: `Fuera del rango de referencia para fase ${cyclePhase} (el estradiol fluctúa mucho en perimenopausia)`,
  };
}

/**
 * FSH — no depende del ciclo pero sí del estatus menopáusico.
 * En posmenopausia una FSH alta es lo ESPERADO, no una alarma.
 */
function classifyFsh(
  biomarker: Biomarker,
  value: number,
  cyclePhase: CyclePhase,
): Classification {
  const rcrc = biomarker.rcrcRange!;
  if (cyclePhase === "postmenopausica") {
    if (value >= rcrc.max) {
      return { zone: "verde", reason: "FSH elevada es lo esperado en posmenopausia" };
    }
    return inside(value, rcrc)
      ? { zone: "verde", reason: "Dentro del rango funcional" }
      : { zone: "amarillo", reason: "FSH baja para posmenopausia — revisar" };
  }
  if (inside(value, rcrc)) {
    return { zone: "verde", reason: "Dentro del rango funcional" };
  }
  if (value > rcrc.max) {
    return {
      zone: "amarillo",
      reason: "FSH elevada: puede indicar transición perimenopáusica (>25 sugiere peri)",
    };
  }
  return { zone: "amarillo", reason: "FSH baja — revisar" };
}

/**
 * Clasifica el valor (YA en unidad canónica) en VERDE / AMARILLO / ROJO / NO_EVALUABLE.
 * `labRange` y `phaseRanges` también deben venir en unidad canónica.
 */
export function classify(
  biomarker: Biomarker,
  value: number,
  labRange?: Range,
  cyclePhase?: CyclePhase,
  phaseRanges?: PhaseRange[],
): Classification {
  const phase: CyclePhase = cyclePhase ?? "no_se";

  // 1. Anticuerpos (adaptativo).
  if (biomarker.thresholdOnly) {
    return classifyAntibody(biomarker, value, labRange);
  }

  // 2. Marcadores dependientes de fase (estradiol, progesterona).
  if (biomarker.cycleDependent) {
    if (phase === "no_se") {
      return {
        zone: "no_evaluable",
        reason: "Selecciona la fase del ciclo para clasificar este marcador",
      };
    }
    const phaseRange = phaseRanges?.find((p) => p.phase === phase);
    const pr: Range | undefined = phaseRange
      ? { min: phaseRange.min, max: phaseRange.max }
      : undefined;

    if (biomarker.id === "progesterona") {
      return classifyProgesterona(value, phase, labRange, pr);
    }
    if (biomarker.id === "estradiol") {
      return classifyEstradiol(value, phase, labRange, pr);
    }
  }

  // 3. FSH (dependiente del estatus menopáusico).
  if (biomarker.id === "fsh" && biomarker.rcrcRange) {
    return classifyFsh(biomarker, value, phase);
  }

  // 4. Rango funcional RCRC (verde).
  if (biomarker.rcrcRange && inside(value, biomarker.rcrcRange)) {
    return { zone: "verde", reason: "Dentro del rango funcional" };
  }

  // 5. Umbrales críticos.
  if (biomarker.redIfBelow !== undefined && value < biomarker.redIfBelow) {
    return { zone: "rojo", reason: `Valor < ${biomarker.redIfBelow} (umbral crítico)` };
  }
  if (biomarker.redIfAbove !== undefined && value > biomarker.redIfAbove) {
    return { zone: "rojo", reason: `Valor > ${biomarker.redIfAbove} (umbral crítico)` };
  }

  // 6. Fuera del rango clínico → rojo.
  const range = labRange ?? biomarker.clinicalFallback;
  if (range && !inside(value, range)) {
    return { zone: "rojo", reason: "Fuera del rango clínico" };
  }

  // 7. Default → amarillo (dentro del clínico, fuera del funcional).
  return {
    zone: "amarillo",
    reason: "Dentro del rango clínico pero fuera del rango funcional",
  };
}
