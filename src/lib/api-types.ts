import type { CyclePhase, Range, Zone } from "./biomarkers";
import type { ConversionStatus } from "./units";

export type AnalyzeResult = {
  id: string;
  name: string;
  group: 1 | 2 | 3 | 4 | 5;
  unit: string;
  found: boolean;
  value: number | null; // valor YA convertido a la unidad canónica
  reportedValue: number | null; // valor original tal como lo reportó el lab
  reportedUnit: string | null; // unidad original del lab
  conversionStatus: ConversionStatus | null; // canonical | converted | assumed | unknown
  labRange: Range | null; // rango clínico del lab, en unidad canónica
  zone: Zone;
  reason: string;
  rcrcRange: Range | null;
  clinicalRange: Range | null;
};

/** Ratio Progesterona/Estradiol — solo aplica en fase lútea. */
export type PeRatioResult = {
  applicable: boolean;
  value: number | null; // (Prog × 1000) / Estradiol
  zone: Zone;
  label: string; // óptimo / funcional bajo / dominancia estrogénica / agotamiento
  reason: string;
};

export type AnalyzeResponse = {
  results: AnalyzeResult[];
  cyclePhase: CyclePhase;
  pe: PeRatioResult;
};

export type AnalyzeError = {
  error: string;
};
