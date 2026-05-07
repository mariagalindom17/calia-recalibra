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

/**
 * Clasifica el valor de un biomarcador en VERDE / AMARILLO / ROJO / NO_EVALUABLE.
 *
 * Orden de evaluación:
 *   1. thresholdOnly (Anti-TPO, Anti-TGA): rojo si ≥ redIfAbove, verde si no.
 *   2. cycleDependent (Estradiol, Progesterona): usa el rango por fase
 *      seleccionada por la usuaria; verde/rojo, sin amarillo.
 *   3. RCRC range (verde) — se prioriza sobre todo lo demás.
 *   4. redIfBelow / redIfAbove (umbrales críticos como ferritina <25, B12 <450).
 *   5. Fuera del rango clínico → rojo.
 *   6. Default → amarillo.
 */
export function classify(
  biomarker: Biomarker,
  value: number,
  labRange?: Range,
  cyclePhase?: CyclePhase,
  phaseRanges?: PhaseRange[],
): Classification {
  if (biomarker.thresholdOnly) {
    if (
      biomarker.redIfAbove !== undefined &&
      value >= biomarker.redIfAbove
    ) {
      return {
        zone: "rojo",
        reason: `Valor ≥ ${biomarker.redIfAbove} (positivo)`,
      };
    }
    return {
      zone: "verde",
      reason: `Valor < ${biomarker.redIfAbove} (negativo)`,
    };
  }

  if (biomarker.cycleDependent) {
    if (!cyclePhase || cyclePhase === "no_se") {
      return {
        zone: "no_evaluable",
        reason:
          "Selecciona la fase del ciclo para clasificar este marcador",
      };
    }
    const phaseRange = phaseRanges?.find((p) => p.phase === cyclePhase);
    if (phaseRange) {
      return inside(value, phaseRange)
        ? {
            zone: "verde",
            reason: `Dentro del rango ${phaseRange.min}–${phaseRange.max} para fase ${cyclePhase}`,
          }
        : {
            zone: "rojo",
            reason: `Fuera del rango ${phaseRange.min}–${phaseRange.max} para fase ${cyclePhase}`,
          };
    }
    if (labRange) {
      return inside(value, labRange)
        ? { zone: "verde", reason: "Dentro del rango clínico del laboratorio" }
        : { zone: "rojo", reason: "Fuera del rango clínico del laboratorio" };
    }
    return {
      zone: "no_evaluable",
      reason: `El laboratorio no reportó rango para la fase ${cyclePhase}`,
    };
  }

  if (biomarker.rcrcRange && inside(value, biomarker.rcrcRange)) {
    return { zone: "verde", reason: "Dentro del rango funcional" };
  }

  if (
    biomarker.redIfBelow !== undefined &&
    value < biomarker.redIfBelow
  ) {
    return {
      zone: "rojo",
      reason: `Valor < ${biomarker.redIfBelow} (umbral crítico)`,
    };
  }
  if (
    biomarker.redIfAbove !== undefined &&
    value > biomarker.redIfAbove
  ) {
    return {
      zone: "rojo",
      reason: `Valor > ${biomarker.redIfAbove} (umbral crítico)`,
    };
  }

  const range = labRange ?? biomarker.clinicalFallback;
  if (range && !inside(value, range)) {
    return { zone: "rojo", reason: "Fuera del rango clínico" };
  }

  return {
    zone: "amarillo",
    reason: "Dentro del rango clínico pero fuera del rango funcional",
  };
}
