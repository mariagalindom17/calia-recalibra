// Landing interest capture: no health information accepted, no persistence in app.
// Enable only after privacy review and configuration of a trusted HTTPS webhook.
export const runtime = "nodejs";
const MAX_LENGTH = 4096;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({error:"Origen no permitido."},{status:403});
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({error:"Formato de solicitud inválido."},{status:415});
  }
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return Response.json({error:"No pudimos leer la solicitud."},{status:400});
  }
  if (raw.length > MAX_LENGTH) {
    return Response.json({error:"Solicitud demasiado grande."},{status:413});
  }
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return Response.json({error:"Datos inválidos."},{status:400});
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return Response.json({error:"Datos inválidos."},{status:400});
  }
  const fields = data as Record<string, unknown>;
  if (typeof fields.company === "string" && fields.company.trim()) {
    // Honeypot: do not retain bot-submitted data.
    return Response.json({ok:true});
  }
  const nombre = typeof fields.nombre === "string" ? fields.nombre.trim() : "";
  const email = typeof fields.email === "string" ? fields.email.trim().toLowerCase() : "";
  if (nombre.length < 2 || nombre.length > 80 || !EMAIL.test(email) || email.length > 254 || fields.consentimiento !== true) {
    return Response.json({error:"Verifica tu nombre, correo y autorización para registrar tus datos."},{status:400});
  }
  // Fail closed until privacy notice, webhook and operational review are complete.
  const url = process.env.CALIA_LEADS_WEBHOOK_URL;
  if (process.env.CALIA_LEADS_ENABLED !== "true" || !url || !process.env.NEXT_PUBLIC_CALIA_PRIVACY_URL) {
    return Response.json({error:"El registro todavía no está habilitado. No se guardaron tus datos."},{status:503});
  }
  let webhook: URL;
  try {
    webhook = new URL(url);
    if (webhook.protocol !== "https:") throw new Error("Only HTTPS allowed");
  } catch {
    return Response.json({error:"El registro no está disponible en este momento."},{status:503});
  }
  try {
    const res = await fetch(webhook, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        fuente:"calia-score-formulario",
        nombre,email,
        consentimiento:true,
        fecha:new Date().toISOString(),
      }),
      cache:"no-store",
      signal:AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error("Webhook rejected lead");
    return Response.json({ok:true});
  } catch {
    return Response.json({error:"No pudimos registrar tus datos. No damos por completado el envío; inténtalo más tarde."},{status:502});
  }
}
