"use client";

import { useState } from "react";
import Image from "next/image";
import {
  FATIGUE_ITEMS,
  SYMPTOM_PAGES,
  getSignal,
  fatigueTotal,
} from "@/lib/energy-questionnaire";
import { calculateEnergyScore } from "@/lib/energy-score";
import "./score.css";

const SCREENS = [
  {title:"Tu nivel de energía",icon:"energy",sub:"Empecemos con una sola pregunta."},
  {title:"Cómo impacta el cansancio",icon:"clipboard",sub:"Piensa en cómo te sentiste durante la última semana."},
  {title:"Lo que has notado",icon:"moon",sub:"Primera parte · últimos tres meses."},
  {title:"Lo que has notado",icon:"pulse",sub:"Segunda parte · últimos tres meses."},
  {title:"Lo que has notado",icon:"lotus",sub:"Última parte · últimos tres meses."},
  {title:"Tu punto de partida",icon:"chart",sub:"Un resumen de tus respuestas, no un diagnóstico."},
] as const;

function Icon3D({name,size=96}:{name:string;size?:number}){
  return <Image alt="" aria-hidden="true" src={`/brand/icons-3d/${name}.svg`} width={size} height={size} unoptimized className="es-icon" />;
}

export default function EnergyScorePage(){
  const [step,setStep]=useState(1);
  const [energy,setEnergy]=useState<number|null>(null);
  const [fatigue,setFatigue]=useState<(number|null)[]>(Array(9).fill(null));
  const [selected,setSelected]=useState<string[]>([]);
  const [error,setError]=useState("");
  const values=SCREENS[step-1];
  const total=fatigueTotal(fatigue);
  const validatedTotal=total??0;
  const score=calculateEnergyScore(energy,total);
  const isSignificant=total!==null && total>=36;
  const answered=fatigue.filter(v=>v!==null).length;

  const go=(to:number)=>{
    setError("");
    setStep(to);
    window.scrollTo({top:0,behavior:"smooth"});
  };
  const next=()=>{
    if(step===1 && energy===null){
      setError("Selecciona cómo está tu energía para continuar.");
      return;
    }
    if(step===2 && answered!==FATIGUE_ITEMS.length){
      setError(`Te faltan ${FATIGUE_ITEMS.length-answered} respuestas para continuar.`);
      return;
    }
    go(Math.min(step+1,6));
  };
  const reset=()=>{
    setStep(1);setEnergy(null);
    setFatigue(Array(9).fill(null));setSelected([]);setError("");
    window.scrollTo({top:0,behavior:"smooth"});
  };
  const toggle=(id:string)=>{
    setSelected(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);
  };

  return (
    <main className="es-app">
      <header className="es-top">
        <div className="es-brand" aria-label="Calia Lab">calia lab<span aria-hidden="true">✦</span></div>
        <p>Más energía para todo lo que viene.</p>
      </header>
      <div className="es-layout">
        <aside className="es-aside">
          <span className="es-kicker">CALIA LAB · TU ENERGÍA</span>
          <h1>Conocerte es el primer paso.</h1>
          <p>Responde a tu ritmo. Tus respuestas te ayudarán a reconocer cómo te sientes y qué vale la pena explorar.</p>
          <Icon3D name={values.icon} size={172}/>
          <div className="es-aside-foot">
            <strong>Un paso a la vez.</strong>
            <span>El cuestionario no identifica la causa médica de tus síntomas ni sustituye una consulta.</span>
          </div>
        </aside>
        <section className="es-main" aria-labelledby="es-screen-heading">
          <div className="es-progress-top">
            <span>PASO {step} DE 6</span>
            <span>{Math.round(step/6*100)}%</span>
          </div>
          <div className="es-progress-track" aria-label={`Paso ${step} de seis`} role="progressbar" aria-valuemin={1} aria-valuemax={6} aria-valuenow={step}>
            <span style={{width:`${(step/6)*100}%`}}/>
          </div>

          <div className="es-title-row">
            <div><span className="es-kicker">{step===6?"TU RESUMEN":step===1?"PARTE 1 · ENERGÍA":step===2?"PARTE 1 · ÚLTIMA SEMANA":"PARTE 2 · ÚLTIMOS 3 MESES"}</span>
              <h2 id="es-screen-heading">{values.title}</h2><p>{values.sub}</p>
            </div>
            <div className="es-small-icon"><Icon3D name={values.icon} size={92}/></div>
          </div>

          {step===1&&<div className="es-body">
            <fieldset className="es-fieldset">
              <legend>Del 1 al 10, ¿cómo está tu energía en un día normal?</legend>
              <p className="es-hint">1 = sin energía para nada · 10 = me sobra energía</p>
              <div className="es-scale es-scale-energy">
                {Array.from({length:10},(_,i)=>i+1).map(n=><button key={n} type="button" className={`es-number ${energy===n?"is-active":""}`} aria-pressed={energy===n} onClick={()=>{setEnergy(n);setError("");}}>{n}</button>)}
              </div>
              <div className="es-scale-labels"><span>Sin energía</span><span>Me sobra energía</span></div>
            </fieldset>
          </div>}

          {step===2&&<div className="es-body">
            <p className="es-instructions">¿Qué tan de acuerdo estás con cada frase? Marca un número para cada una.</p>
            <div className="es-legend"><span>1 = Totalmente en desacuerdo</span><span>7 = Totalmente de acuerdo</span></div>
            <p className="es-hint">Respondidas: <strong>{answered} de 9</strong></p>
            <div className="es-fatigue-list">
              {FATIGUE_ITEMS.map((label,i)=><fieldset key={i} className="es-fatigue-item">
                <legend><span>{String(i+1).padStart(2,"0")}</span> {label}</legend>
                <div className="es-scale es-scale-seven">
                  {Array.from({length:7},(_,j)=>j+1).map(n=><button type="button" key={n} className={`es-number ${fatigue[i]===n?"is-active":""}`} aria-label={`${label} · ${n} de 7`} aria-pressed={fatigue[i]===n} onClick={()=>{setFatigue(old=>old.map((v,k)=>k===i?n:v));setError("");}}>{n}</button>)}
                </div>
              </fieldset>)}
            </div>
          </div>}

          {step>=3&&step<=5&&<div className="es-body">
            <p className="es-instructions">Marca todo lo que hayas experimentado en los últimos tres meses. Si ninguna frase va contigo, puedes continuar sin marcar.</p>
            <div className="es-check-list">
              {SYMPTOM_PAGES[step-3].map(id=>{
                const q=getSignal(id);
                if(!q)return null;
                return <label key={id} className={`es-check ${selected.includes(id)?"is-checked":""}`}>
                  <input type="checkbox" checked={selected.includes(id)} onChange={()=>toggle(id)}/>
                  <span>{q.label}</span>
                </label>;
              })}
            </div>
            <p className="es-hint">No hay respuestas correctas. Estos síntomas pueden tener distintas explicaciones y requieren contexto.</p>
          </div>}

          {step===6&&<div className="es-results">
            <article className="es-score-primary" aria-label="Tu score de energía Calia Lab">
              <div className="es-score-primary-head"><span className="es-kicker">TU SCORE DE ENERGÍA</span><Icon3D name="energy" size={100}/></div>
              <div className="es-score-value">{score}<span>/ 100</span></div>
              <div className="es-bar es-score-bar" aria-hidden="true"><span style={{width:`${score??0}%`}}/></div>
              <p><strong>Este es tu punto de partida.</strong> Combina tu energía percibida y cómo interfiere el cansancio con tus actividades.</p>
              <p className="es-score-disclaimer">Índice orientativo diseñado por Calia Lab; no es una escala clínica validada, no identifica enfermedades ni determina la causa de tu cansancio.</p>
            </article>
            <div className="es-results-grid">
              <article className="es-result-card es-result-energy">
                <p className="es-kicker">ENERGÍA QUE REPORTASTE</p>
                <div className="es-big-number">{energy}<span>/ 10</span></div>
                <p>Tu calificación personal de un día normal.</p>
              </article>
              <article className="es-result-card">
                <p className="es-kicker">IMPACTO DEL CANSANCIO</p>
                <div className="es-big-number">{validatedTotal}<span>/ 63</span></div>
                <p><strong>{isSignificant?"Tus respuestas reflejan una interferencia importante del cansancio.":"Tu puntuación está por debajo del valor de referencia de 36."}</strong></p>
                <p>Suma de nueve respuestas (9 a 63). El valor de referencia de 36 no es un diagnóstico.</p>
              </article>
            </div>
            <details className="es-formula">
              <summary>¿Cómo se calculó mi score?</summary>
              <p>El score va de 0 a 100. La mitad proviene de tu energía percibida del 1 al 10, convertida a una escala de 0 a 100. La otra mitad proviene de la suma de las nueve respuestas de fatiga (9 a 63), invertida para que menos interferencia signifique más energía. Redondeamos el resultado al número entero más cercano.</p>
              <p>Fórmula: 50 × (energía − 1) / 9 + 50 × (63 − suma de fatiga) / 54.</p>
              <p>Es una propuesta inicial de Calia Lab, no un instrumento médico validado. Requiere revisión y validación antes de usarlo para decisiones clínicas.</p>
            </details>
            <article className="es-summary">
              <div className="es-summary-head"><Icon3D name="chart" size={64}/><div><span className="es-kicker">OBSERVACIONES</span><h3>Tu punto de partida</h3></div></div>
              <p>Marcaste <strong>{selected.length} de 21</strong> experiencias de los últimos tres meses. Se usan como pistas para conversar con un profesional, no para decirte de dónde viene tu cansancio.</p>
              <details>
                <summary>Ver las experiencias que marqué ({selected.length})</summary>
                {selected.length?<ul>{selected.map(id=><li key={id}>{getSignal(id)?.label}</li>)}</ul>:<p>No marcaste ninguna de las opciones.</p>}
              </details>
              <div className="es-advice"><strong>¿Qué sigue?</strong><p>Observa tus cambios, considera tus antecedentes y consulta con un profesional si el cansancio persiste, limita tu vida diaria o tienes otros síntomas. Si notas falta de aire nueva o intensa, dolor de pecho o desmayo, busca atención médica inmediata.</p></div>
              <p className="es-hint">Puedes conservar una copia impresa de este resumen. Por ahora, el cuestionario no almacena respuestas ni ofrece seguimiento automático.</p>
            </article>
          </div>}

          {error&&<p className="es-error" role="alert">{error}</p>}
          <div className="es-actions">
            {step>1&&<button type="button" className="es-btn es-btn-secondary" onClick={()=>go(step-1)}>← Atrás</button>}
            {step<6?<button type="button" className="es-btn es-btn-primary" onClick={next}>{step===5?"Ver mi resumen":"Siguiente"} <span aria-hidden="true">→</span></button>:
              <><button type="button" className="es-btn es-btn-secondary" onClick={reset}>Empezar de nuevo</button><button type="button" className="es-btn es-btn-primary" onClick={()=>window.print()}>Imprimir mi resumen ↗</button></>}
          </div>
          <p className="es-privacy">Tus respuestas permanecen en este navegador mientras esta página esté abierta. No se envían ni almacenan en los servidores de Calia Lab.</p>
        </section>
      </div>
      <footer className="es-footer"><strong>Calia Lab</strong><span>Más energía para todo lo que viene.</span></footer>
    </main>
  );
}
