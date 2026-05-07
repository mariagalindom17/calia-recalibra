import type { CyclePhase, Range, Zone } from "./biomarkers";

export type AnalyzeResult = {
  id: string;
  name: string;
  group: 1 | 2 | 3 | 4 | 5;
  unit: string;
  found: boolean;
  value: number | null;
  reportedUnit: string | null;
  labRange: Range | null;
  zone: Zone;
  reason: string;
  rcrcRange: Range | null;
  clinicalRange: Range | null;
};

export type AnalyzeResponse = {
  results: AnalyzeResult[];
  cyclePhase: CyclePhase;
};

export type AnalyzeError = {
  error: string;
};
