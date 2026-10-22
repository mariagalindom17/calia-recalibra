export type SignalTag = "tiroides" | "glucosa_insulina" | "estres_sueno" | "nutrientes";
export type SignalId = string;
export type SymptomPrompt = { readonly id: SignalId; readonly label: string; readonly tag: SignalTag };
export const FATIGUE_ITEMS = [
  "Mi motivación baja cuando estoy cansada.",
  "El ejercicio me provoca cansancio.",
  "Me canso con facilidad.",
  "El cansancio interfiere con mi funcionamiento físico.",
  "El cansancio me causa problemas con frecuencia.",
  "El cansancio me impide sostener actividad física por mucho tiempo.",
  "El cansancio interfiere con cumplir ciertas tareas y responsabilidades.",
  "El cansancio es uno de mis tres síntomas más incapacitantes.",
  "El cansancio interfiere con mi trabajo, mi familia o mi vida social.",
] as const;

// The tags are ONLY exploratory internal groupings for future professional review.
// Do not show, diagnose from, or infer etiology from these tags or a checkbox total.
export const SYMPTOM_PROMPTS: readonly SymptomPrompt[] = [
  {id:"t1",tag:"tiroides",label:"Me cuesta arrancar desde que despierto, aunque haya dormido."},
  {id:"t2",tag:"tiroides",label:"Tengo frío en manos y pies cuando los demás no."},
  {id:"t3",tag:"tiroides",label:"Se me está cayendo el pelo de la parte de afuera de las cejas."},
  {id:"t4",tag:"tiroides",label:"Se me cae el cabello."},
  {id:"t5",tag:"tiroides",label:"Tengo estreñimiento o la piel más seca que antes."},
  {id:"t6",tag:"tiroides",label:"Subí de peso sin cambiar lo que como."},
  {id:"g1",tag:"glucosa_insulina",label:"Me da sueño o un bajón después de comer."},
  {id:"g2",tag:"glucosa_insulina",label:"Tengo antojos fuertes de pan, dulce o tortilla."},
  {id:"g3",tag:"glucosa_insulina",label:"Si no como a tiempo me pongo irritable o temblorosa."},
  {id:"g4",tag:"glucosa_insulina",label:"Se me está acumulando grasa en el abdomen."},
  {id:"g5",tag:"glucosa_insulina",label:"Necesito algo dulce o un café a media tarde para seguir."},
  {id:"s1",tag:"estres_sueno",label:"Me siento cansada pero acelerada al mismo tiempo."},
  {id:"s2",tag:"estres_sueno",label:"Me despierto entre 2 y 4 am y me cuesta volver a dormir."},
  {id:"s3",tag:"estres_sueno",label:"En la mañana no funciono y en la noche me llega la energía."},
  {id:"s4",tag:"estres_sueno",label:"El ejercicio me deja agotada en lugar de darme energía."},
  {id:"s5",tag:"estres_sueno",label:"Tengo antojo de sal o me mareo al pararme rápido."},
  {id:"n1",tag:"nutrientes",label:"Me falta el aire al subir escaleras o me late fuerte el corazón."},
  {id:"n2",tag:"nutrientes",label:"Se me cae el pelo o tengo las uñas quebradizas."},
  {id:"n3",tag:"nutrientes",label:"Siento hormigueo en manos o pies."},
  {id:"n4",tag:"nutrientes",label:"Tengo las piernas inquietas en la noche."},
  {id:"n5",tag:"nutrientes",label:"Me enfermo seguido o me duelen músculos y huesos sin razón."},
] as const;

// Mix signal areas across three user-facing pages so category names never bias the answers.
export const SYMPTOM_PAGES: readonly (readonly string[])[] = [
  ["t1","s2","g1","n1","t2","g3","s3"],
  ["t3","t4","g2","g4","s1","n2","n3"],
  ["t5","t6","g5","s4","s5","n4","n5"],
] as const;
export const getSignal = (id:string) => SYMPTOM_PROMPTS.find(q => q.id===id);
export function fatigueTotal(scores: readonly (number|null)[]): number|null {
  if(scores.length!==9 || scores.some(x => x==null || !Number.isInteger(x) || x<1 || x>7)) return null;
  return scores.reduce<number>((a,x)=>a+(x??0),0);
}
export function exploratoryTagCounts(ids:readonly string[]):Record<SignalTag,number> {
  const counts:Record<SignalTag,number>={tiroides:0,glucosa_insulina:0,estres_sueno:0,nutrientes:0};
  for(const id of new Set(ids)){const q=getSignal(id);if(q)counts[q.tag]++}
  return counts;
}
