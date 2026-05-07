import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { BIOMARKERS } from "./biomarkers";

const PhaseRangeSchema = z.object({
  phase: z.string(),
  min: z.number(),
  max: z.number(),
});

const ExtractedMarkerSchema = z.object({
  id: z.string(),
  found: z.boolean(),
  value: z.number().nullable(),
  unit: z.string().nullable(),
  labMin: z.number().nullable(),
  labMax: z.number().nullable(),
  phaseRanges: z.array(PhaseRangeSchema).nullable(),
});

const ExtractionResultSchema = z.object({
  markers: z.array(ExtractedMarkerSchema),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;
export type ExtractedMarker = z.infer<typeof ExtractedMarkerSchema>;

const buildSystemPrompt = (): string => {
  const lines = [
    "Eres un asistente especializado en extraer biomarcadores de PDFs de laboratorios clínicos mexicanos (Salud Digna, Médico Polanco, Chopo, LAPI y otros).",
    "",
    "Tu tarea: leer el PDF y extraer EXACTAMENTE los 22 biomarcadores autorizados que se listan abajo. Devuelve un objeto con `markers` como array; debes incluir SIEMPRE los 22 biomarcadores en ese array, en el mismo orden de la lista.",
    "",
    "Reglas de extracción:",
    "- Para cada biomarcador, si lo encuentras en el PDF: `found: true`, `value` es el número (sin unidades), `unit` es la unidad reportada por el laboratorio (string), `labMin` y `labMax` son los límites del rango de referencia que reporta el laboratorio (números).",
    "- Si NO aparece en el PDF: `found: false` y todos los demás campos en `null`.",
    "- Si el rango aparece como '< X' o '> X' (rango abierto), usa `null` para el lado abierto.",
    "- Decimales con punto, no coma (4.5, no 4,5).",
    "- NO interpretes ni clasifiques los valores. Solo extrae datos crudos del PDF.",
    "- NO inventes datos. Si tienes dudas sobre un valor, marca `found: false`.",
    "",
    "Para Estradiol y Progesterona específicamente:",
    "- Los laboratorios suelen reportar MÚLTIPLES rangos según fase del ciclo (ej. Folicular, Ovulatoria, Lútea, Postmenopáusica, Embarazo). Extrae TODOS los rangos que aparezcan en el PDF y devuélvelos en `phaseRanges` como array de `{phase, min, max}`.",
    "- Usa estos identificadores en lowercase y SIN ACENTOS para el campo `phase`: `folicular`, `lutea`, `postmenopausica`, `ovulatoria`, `embarazo`. Mapea sinónimos del lab a estos IDs (ej. \"Postmenopausia\" → `postmenopausica`, \"Fase folicular\" → `folicular`).",
    "- Si el PDF solo muestra UN rango único (sin desglose por fase), deja `phaseRanges` en `null` y usa `labMin`/`labMax`.",
    "",
    "Para todos los demás biomarcadores: deja `phaseRanges` en `null`.",
    "",
    "Lista de los 22 biomarcadores autorizados:",
    "",
  ];
  for (const b of BIOMARKERS) {
    const synonyms = b.synonyms.length > 0 ? ` | Sinónimos: ${b.synonyms.join(", ")}` : "";
    lines.push(`- id="${b.id}" | ${b.name} | unidad esperada: ${b.unit}${synonyms}`);
  }
  lines.push(
    "",
    'Importante: el campo `id` en tu respuesta debe coincidir EXACTAMENTE con los IDs listados arriba (ej. "tsh", "t4_libre", "anti_tpo"). No inventes IDs nuevos.',
  );
  return lines.join("\n");
};

const SYSTEM_PROMPT = buildSystemPrompt();

let _client: Anthropic | null = null;
const getClient = (): Anthropic => {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY no está configurada. Ponla en .env.local en la raíz del proyecto.",
      );
    }
    _client = new Anthropic();
  }
  return _client;
};

export async function extractBiomarkers(
  pdfBuffer: Buffer,
): Promise<ExtractionResult> {
  const client = getClient();
  const base64 = pdfBuffer.toString("base64");

  const response = await client.messages.parse({
    model: "claude-opus-4-7",
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64,
            },
          },
          {
            type: "text",
            text: "Analiza este PDF de laboratorio y extrae los 22 biomarcadores autorizados según las reglas del sistema. Devuelve el JSON con `markers`.",
          },
        ],
      },
    ],
    output_config: {
      format: zodOutputFormat(ExtractionResultSchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error(
      "Claude no pudo extraer los biomarcadores en formato válido. Es posible que el PDF no sea legible o que contenga un formato no esperado.",
    );
  }
  return response.parsed_output;
}
