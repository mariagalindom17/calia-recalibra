/**
 * Configuración de los 22 biomarcadores autorizados de la metodología RCRC.
 *
 * (El brief original mencionaba 23 marcadores, pero al desglosar los grupos
 * suman 22. Confirmar con María si falta uno.)
 *
 * Cada marcador define:
 *   - rcrcRange: zona VERDE (rango funcional RCRC)
 *   - clinicalFallback: rango clínico de respaldo cuando el lab no lo reporta
 *   - redIfBelow / redIfAbove: umbrales que fuerzan ROJO sin importar lo demás
 *   - cycleDependent: solo se evalúa contra el rango clínico del lab (ciclo menstrual)
 *   - thresholdOnly: solo importa el umbral de redIfAbove (anticuerpos)
 */

export type Zone = "verde" | "amarillo" | "rojo" | "no_evaluable";

export type Range = { min: number; max: number };

export type CyclePhase = "folicular" | "lutea" | "postmenopausica" | "no_se";

export type BiomarkerGroup = {
  id: 1 | 2 | 3 | 4 | 5;
  name: string;
};

export const GROUPS: Record<1 | 2 | 3 | 4 | 5, BiomarkerGroup> = {
  1: { id: 1, name: "Hormonal sexual" },
  2: { id: 2, name: "Tiroideo" },
  3: { id: 3, name: "Metabólico" },
  4: { id: 4, name: "Estrés" },
  5: { id: 5, name: "Nutrientes" },
};

export type Biomarker = {
  id: string;
  name: string;
  synonyms: string[];
  group: 1 | 2 | 3 | 4 | 5;
  unit: string;
  rcrcRange?: Range;
  clinicalFallback?: Range;
  redIfBelow?: number;
  redIfAbove?: number;
  cycleDependent?: boolean;
  thresholdOnly?: boolean;
  notes?: string;
};

export const BIOMARKERS: Biomarker[] = [
  // ─────────── GRUPO 1: Hormonal sexual ───────────
  {
    id: "fsh",
    name: "FSH",
    synonyms: [
      "Hormona folículo estimulante",
      "Hormona foliculoestimulante",
      "Folitropina",
      "Folículo estimulante",
    ],
    group: 1,
    unit: "mIU/mL",
    rcrcRange: { min: 2.5, max: 10.2 },
  },
  {
    id: "lh",
    name: "LH",
    synonyms: ["Hormona luteinizante", "Lutropina"],
    group: 1,
    unit: "mIU/mL",
    rcrcRange: { min: 1.9, max: 12.5 },
  },
  {
    id: "estradiol",
    name: "Estradiol",
    synonyms: ["E2", "17-beta-estradiol", "17β-estradiol", "17 beta estradiol"],
    group: 1,
    unit: "pg/mL",
    cycleDependent: true,
    notes:
      "Se evalúa contra el rango clínico del laboratorio según fase del ciclo.",
  },
  {
    id: "progesterona",
    name: "Progesterona",
    synonyms: ["P4", "Pg"],
    group: 1,
    unit: "ng/mL",
    cycleDependent: true,
    notes:
      "Se evalúa contra el rango clínico del laboratorio según fase del ciclo.",
  },
  {
    id: "prolactina",
    name: "Prolactina",
    synonyms: ["PRL"],
    group: 1,
    unit: "ng/mL",
    rcrcRange: { min: 5.18, max: 25.53 },
  },
  {
    id: "dhea_s",
    name: "DHEA-S",
    synonyms: [
      "DHEAS",
      "DHEA-Sulfato",
      "Sulfato de DHEA",
      "Sulfato de dehidroepiandrosterona",
      "Dehidroepiandrosterona sulfato",
    ],
    group: 1,
    unit: "µg/dL",
    rcrcRange: { min: 200, max: 380 },
  },
  {
    id: "testosterona_total",
    name: "Testosterona total",
    synonyms: ["T total", "TT", "Testosterona"],
    group: 1,
    unit: "ng/dL",
    rcrcRange: { min: 15, max: 70 },
  },
  {
    id: "testosterona_libre",
    name: "Testosterona libre",
    synonyms: ["T libre", "TL", "Free T", "Testosterona libre calculada"],
    group: 1,
    unit: "pg/mL",
    rcrcRange: { min: 1.1, max: 6.4 },
  },

  // ─────────── GRUPO 2: Tiroideo ───────────
  {
    id: "tsh",
    name: "TSH",
    synonyms: [
      "Hormona estimulante de la tiroides",
      "Tirotropina",
      "Tirotrofina",
      "Hormona tireoestimulante",
    ],
    group: 2,
    unit: "µUI/mL",
    rcrcRange: { min: 0.5, max: 2.0 },
    clinicalFallback: { min: 0.45, max: 4.5 },
  },
  {
    id: "t4_libre",
    name: "T4 libre",
    synonyms: ["Tiroxina libre", "fT4", "T4L", "Free T4"],
    group: 2,
    unit: "ng/dL",
    rcrcRange: { min: 1.0, max: 1.5 },
    clinicalFallback: { min: 0.82, max: 1.77 },
  },
  {
    id: "t3_libre",
    name: "T3 libre",
    synonyms: ["Triyodotironina libre", "fT3", "T3L", "Free T3"],
    group: 2,
    unit: "pg/mL",
    rcrcRange: { min: 2.5, max: 4.0 },
    clinicalFallback: { min: 2.0, max: 4.4 },
  },
  {
    id: "t4_total",
    name: "T4 total",
    synonyms: ["Tiroxina total", "T4T", "Tiroxina"],
    group: 2,
    unit: "µg/dL",
    rcrcRange: { min: 6.0, max: 12 },
    clinicalFallback: { min: 4.5, max: 12 },
  },
  {
    id: "t3_total",
    name: "T3 total",
    synonyms: ["Triyodotironina total", "T3T", "Triyodotironina"],
    group: 2,
    unit: "ng/dL",
    rcrcRange: { min: 100, max: 180 },
    clinicalFallback: { min: 71, max: 180 },
  },
  {
    id: "anti_tpo",
    name: "Anti-TPO",
    synonyms: [
      "Anticuerpos antiperoxidasa",
      "Anticuerpos anti-peroxidasa tiroidea",
      "ATPO",
      "TPOAb",
      "Anti-microsomales",
      "Anti-peroxidasa tiroidea",
    ],
    group: 2,
    unit: "UI/mL",
    thresholdOnly: true,
    redIfAbove: 3,
  },
  {
    id: "anti_tga",
    name: "Anti-TGA",
    synonyms: [
      "Anticuerpos antitiroglobulina",
      "Anticuerpos anti-tiroglobulina",
      "ATGA",
      "Anti-Tg",
      "TgAb",
      "Anti-tiroglobulina",
    ],
    group: 2,
    unit: "UI/mL",
    thresholdOnly: true,
    redIfAbove: 3,
  },

  // ─────────── GRUPO 3: Metabólico ───────────
  {
    id: "glucosa_ayunas",
    name: "Glucosa en ayunas",
    synonyms: [
      "Glucosa basal",
      "Glucosa en ayuno",
      "Glucemia basal",
      "Glucemia en ayuno",
      "Glucosa",
    ],
    group: 3,
    unit: "mg/dL",
    rcrcRange: { min: 75, max: 85 },
    clinicalFallback: { min: 65, max: 99 },
  },
  {
    id: "hba1c",
    name: "HbA1c",
    synonyms: [
      "Hemoglobina glucosilada",
      "Hemoglobina glicosilada",
      "A1C",
      "HbA1C",
    ],
    group: 3,
    unit: "%",
    rcrcRange: { min: 4.6, max: 5.3 },
    clinicalFallback: { min: 4.8, max: 5.6 },
  },
  {
    id: "insulina",
    name: "Insulina basal",
    synonyms: ["Insulina", "Insulina en ayunas", "Insulina sérica"],
    group: 3,
    unit: "µUI/mL",
    rcrcRange: { min: 3, max: 6 },
    redIfAbove: 6.1,
    // <3 cae fuera de RCRC y sin rango clínico → AMARILLO (default)
  },

  // ─────────── GRUPO 4: Estrés ───────────
  {
    id: "cortisol_am",
    name: "Cortisol matutino sérico",
    synonyms: ["Cortisol AM", "Cortisol matutino", "Cortisol sérico", "Cortisol"],
    group: 4,
    unit: "µg/dL",
    rcrcRange: { min: 10, max: 15 },
  },

  // ─────────── GRUPO 5: Nutrientes ───────────
  {
    id: "ferritina",
    name: "Ferritina",
    synonyms: ["Ferritin"],
    group: 5,
    unit: "ng/mL",
    rcrcRange: { min: 70, max: 100 },
    clinicalFallback: { min: 15, max: 150 },
    redIfBelow: 25,
  },
  {
    id: "b12",
    name: "Vitamina B12",
    synonyms: ["B12", "Cobalamina", "Cianocobalamina", "Vitamina B-12"],
    group: 5,
    unit: "pg/mL",
    rcrcRange: { min: 1000, max: 2000 },
    clinicalFallback: { min: 200, max: 900 },
    redIfBelow: 450,
    // OJO: para B12 el RCRC (1000-2000) está ARRIBA del clínico (200-900).
    // Valores entre 901 y 999 caerán como ROJO bajo la regla literal del spec
    // ("fuera de clínico = rojo"). María: confirmar si prefieres que esa zona
    // sea AMARILLO (sub-óptimo pero no deficiente) en vez de ROJO.
  },
  {
    id: "vitamina_d",
    name: "Vitamina D 25-OH",
    synonyms: [
      "25-hidroxivitamina D",
      "Calcidiol",
      "Vit D3",
      "25(OH)D",
      "25-OH-D",
      "Vitamina D",
      "Vit D",
    ],
    group: 5,
    unit: "ng/mL",
    rcrcRange: { min: 75, max: 95 },
    clinicalFallback: { min: 30, max: 100 },
    redIfBelow: 30,
  },
];

export const BIOMARKER_BY_ID: Record<string, Biomarker> = Object.fromEntries(
  BIOMARKERS.map((b) => [b.id, b]),
);
