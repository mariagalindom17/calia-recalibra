"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";
import { GROUPS, type CyclePhase } from "@/lib/biomarkers";
import type { AnalyzeResponse, AnalyzeResult } from "@/lib/api-types";

const ZONE_STYLES: Record<AnalyzeResult["zone"], string> = {
  verde: "bg-salvia/15 text-salvia border-salvia/40",
  amarillo: "bg-gold/20 text-earth border-gold/50",
  rojo: "bg-peligro/15 text-peligro border-peligro/40",
  no_evaluable: "bg-muted text-earth/60 border-borde/60",
};

const ZONE_LABEL: Record<AnalyzeResult["zone"], string> = {
  verde: "✓ Óptimo",
  amarillo: "⚠ Zona Gris",
  rojo: "✕ Fuera de rango",
  no_evaluable: "— Sin dato",
};

const PHASE_LABEL: Record<CyclePhase, string> = {
  folicular: "Folicular",
  lutea: "Lútea",
  postmenopausica: "Post-menopáusica",
  no_se: "No especificada",
};

const PHASE_OPTIONS: ReadonlyArray<{
  value: CyclePhase;
  label: string;
  desc: string;
}> = [
  {
    value: "folicular",
    label: "Folicular",
    desc: "Día 1 de menstruación a la ovulación",
  },
  {
    value: "lutea",
    label: "Lútea",
    desc: "Día 21 o 7 días antes de la menstruación",
  },
  {
    value: "postmenopausica",
    label: "Post-menopáusica",
    desc: "Sin ciclo menstrual",
  },
  {
    value: "no_se",
    label: "No sé / no aplica",
    desc: "Estradiol y progesterona no se evaluarán",
  },
];

const formatRange = (r: { min: number; max: number } | null): string =>
  r ? `${r.min} – ${r.max}` : "—";

const formatValue = (v: number | null, unit: string | null): string => {
  if (v == null) return "—";
  return unit ? `${v} ${unit}` : `${v}`;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [cyclePhase, setCyclePhase] = useState<CyclePhase>("no_se");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalyzeResponse | null>(null);

  const onFileChange = (f: File | null) => {
    setFile(f);
    setError(null);
    setResults(null);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    onFileChange(f);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0] ?? null;
    if (f && f.type !== "application/pdf") {
      setError("El archivo debe ser un PDF.");
      return;
    }
    onFileChange(f);
  };

  const onSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("cyclePhase", cyclePhase);
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errBody.error ?? `Error del servidor (${res.status})`);
      }
      const data = (await res.json()) as AnalyzeResponse;
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setCyclePhase("no_se");
    setResults(null);
    setError(null);
  };

  const resultsByGroup = (group: 1 | 2 | 3 | 4 | 5): AnalyzeResult[] =>
    results?.results.filter((r) => r.group === group) ?? [];

  return (
    <main className="flex flex-col flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12">
      <header className="mb-10">
        <h1 className="font-display font-light text-4xl sm:text-5xl tracking-tight text-earth">
          Calia lab <span className="text-primary-300">|</span> Recalibra
        </h1>
        <p className="mt-3 text-earth/70 max-w-2xl print:hidden">
          Sube tus labs en PDF y recibe un mapa por colores según los rangos
          funcionales.
        </p>
      </header>

      {!results && (
        <section className="mb-8">
          <fieldset className="mb-6">
            <legend className="text-sm font-medium text-earth mb-3">
              Fase del ciclo (para estradiol y progesterona)
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PHASE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-4 rounded-2xl border bg-white cursor-pointer transition-colors ${
                    cyclePhase === opt.value
                      ? "border-primary-500 shadow-warm-sm"
                      : "border-borde hover:border-primary-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="cyclePhase"
                    value={opt.value}
                    checked={cyclePhase === opt.value}
                    onChange={() => setCyclePhase(opt.value)}
                    className="mt-1 accent-primary-500"
                    disabled={loading}
                  />
                  <span>
                    <span className="block text-sm font-medium text-earth">
                      {opt.label}
                    </span>
                    <span className="block text-xs text-earth/60 mt-0.5">
                      {opt.desc}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 sm:p-12 cursor-pointer transition-colors ${
              isDragging
                ? "border-primary-400 bg-primary-100/40"
                : "border-borde bg-white hover:border-primary-300"
            }`}
          >
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={onInputChange}
              disabled={loading}
            />
            <div className="text-center">
              <p className="text-earth font-medium">
                {file ? file.name : "Arrastra tu PDF aquí o haz clic para elegir"}
              </p>
              <p className="text-sm text-earth/60 mt-1">
                {file ? `${(file.size / 1024).toFixed(0)} KB` : "PDF, máximo 10 MB"}
              </p>
            </div>
          </label>

          {error && (
            <div className="mt-4 p-4 bg-peligro/10 border border-peligro/30 rounded-2xl text-peligro text-sm">
              {error}
            </div>
          )}

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={onSubmit}
              disabled={!file || loading}
              className="px-6 py-3 bg-primary-500 text-cream rounded-lg font-medium disabled:bg-borde disabled:cursor-not-allowed hover:bg-primary-600 transition-colors shadow-warm-sm"
            >
              {loading ? "Analizando…" : "Analizar PDF"}
            </button>
            {file && !loading && (
              <button
                type="button"
                onClick={reset}
                className="px-4 py-3 text-earth/70 hover:text-earth transition-colors"
              >
                Quitar
              </button>
            )}
          </div>

          {loading && (
            <p className="mt-3 text-sm text-earth/60">
              Esto puede tardar 15-40 segundos. Estamos extrayendo los biomarcadores con Claude.
            </p>
          )}
        </section>
      )}

      {results && (
        <section className="mb-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl text-earth">Resultados</h2>
              <p className="text-sm text-earth/60 mt-1">
                Fase del ciclo:{" "}
                <span className="font-medium text-earth">
                  {PHASE_LABEL[results.cyclePhase]}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-primary-500 text-cream rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors shadow-warm-sm"
              >
                Descargar PDF
              </button>
              <button
                type="button"
                onClick={reset}
                className="text-sm text-earth/70 hover:text-earth underline"
              >
                Analizar otro PDF
              </button>
            </div>
          </div>

          {results.cyclePhase === "lutea" && (
            <div className="mb-10">
              <h3 className="font-display text-lg text-primary-700 mb-3">
                Ratio Progesterona / Estradiol (P/E)
              </h3>
              <div
                className={`rounded-2xl border p-4 shadow-warm-sm ${ZONE_STYLES[results.pe.zone]}`}
              >
                <p className="text-sm font-medium">
                  {results.pe.applicable && results.pe.value != null
                    ? `${results.pe.value} · ${results.pe.label}`
                    : results.pe.label}
                </p>
                <p className="text-xs mt-1 opacity-80">{results.pe.reason}</p>
              </div>
            </div>
          )}

          {([1, 2, 3, 4, 5] as const).map((g) => {
            const rows = resultsByGroup(g);
            if (rows.length === 0) return null;
            return (
              <div key={g} className="mb-10">
                <h3 className="font-display text-lg text-primary-700 mb-3">
                  Grupo {g} · {GROUPS[g].name}
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-borde/60 bg-white shadow-warm-sm">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="text-left text-earth/60 border-b border-borde/60 bg-sand/40">
                        <th className="py-3 px-4 font-medium">Marcador</th>
                        <th className="py-3 px-4 font-medium">Valor</th>
                        <th className="py-3 px-4 font-medium">Rango clínico</th>
                        <th className="py-3 px-4 font-medium">Rango funcional</th>
                        <th className="py-3 px-4 font-medium">Zona</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr
                          key={r.id}
                          className="border-b border-borde/30 last:border-0"
                        >
                          <td className="py-3 px-4 font-medium text-earth">
                            {r.name}
                          </td>
                          <td className="py-3 px-4 text-earth font-mono tabular-nums">
                            {formatValue(r.value, r.unit)}
                            {r.conversionStatus === "converted" &&
                              r.reportedValue != null && (
                                <span className="block text-[10px] text-earth/50">
                                  lab: {r.reportedValue} {r.reportedUnit}
                                </span>
                              )}
                            {r.conversionStatus === "unknown" && (
                              <span className="block text-[10px] text-peligro">
                                unidad no reconocida ({r.reportedUnit}) — verifica
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-earth/70 font-mono tabular-nums">
                            {formatRange(r.clinicalRange)}
                          </td>
                          <td className="py-3 px-4 text-earth/70 font-mono tabular-nums">
                            {formatRange(r.rcrcRange)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${ZONE_STYLES[r.zone]}`}
                              title={r.reason}
                            >
                              {ZONE_LABEL[r.zone]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </section>
      )}

      <footer className="mt-auto pt-8 border-t border-borde/60 text-xs text-earth/55 leading-relaxed">
        Este reporte es educativo, no diagnóstico. No reemplaza evaluación
        médica. Los rangos funcionales son de la metodología de Calia Lab.
      </footer>
    </main>
  );
}
