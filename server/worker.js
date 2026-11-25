// Try Your New Language — servidor intermedio gratuito (Cloudflare Worker).
// Guarda la clave de la IA en secreto y reenvía las conversaciones de la app.
// La app nunca ve la clave: solo conoce la dirección de este Worker y un código de acceso.
//
// Variables (en Cloudflare → tu Worker → Settings → Variables and Secrets):
//   AI_KEY       (secreto)  clave de Google AI Studio (o de otro proveedor compatible con OpenAI)
//   APP_CODE     (secreto)  código de acceso que escribes una vez en la app
//   ALLOW_ORIGIN (texto)    p. ej. https://hensisg.github.io  (varios separados por coma)
//   AI_URL       (texto, opcional)  por defecto, la API de Gemini compatible con OpenAI
//   AI_MODEL     (texto, opcional)  por defecto gemini-flash-lite-latest (rápido)
//   AI_MODEL_FALLBACK (texto, opcional)  por defecto gemini-flash-latest (si el principal está saturado)

const DEFAULT_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
// Los alias "-latest" siempre apuntan al modelo vigente, así la app no se rompe cuando Google retira uno.
// "Lite" responde en ~1 s, lo que hace la charla fluida; el "Flash" normal queda de respaldo.
const DEFAULT_MODEL = "gemini-flash-lite-latest";
const FALLBACK_MODEL = "gemini-flash-latest";
const MAX_MESSAGES = 40;
const MAX_CHARS = 24000;
const MAX_TOKENS = 600;

function corsHeaders(req, env) {
  const origin = req.headers.get("Origin") || "";
  const allowed = (env.ALLOW_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
  const ok = allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : allowed[0] || "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-App-Code",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

const json = (obj, status, headers) =>
  new Response(JSON.stringify(obj), { status, headers: { ...headers, "Content-Type": "application/json" } });

export default {
  async fetch(req, env) {
    const cors = corsHeaders(req, env);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/") return json({ ok: true, app: "try-your-new-language" }, 200, cors);
    if (req.method !== "POST" || url.pathname !== "/chat") return json({ error: "not found" }, 404, cors);

    if (!env.AI_KEY) return json({ error: "Falta AI_KEY en el servidor" }, 500, cors);
    if (env.APP_CODE && req.headers.get("X-App-Code") !== env.APP_CODE) return json({ error: "Código de acceso incorrecto" }, 401, cors);

    let body;
    try { body = await req.json(); } catch { return json({ error: "JSON inválido" }, 400, cors); }
    const messages = Array.isArray(body.messages) ? body.messages.slice(-MAX_MESSAGES) : null;
    if (!messages || !messages.length) return json({ error: "Faltan mensajes" }, 400, cors);
    let size = 0;
    for (const m of messages) {
      if (!m || !["system", "user", "assistant"].includes(m.role) || typeof m.content !== "string") return json({ error: "Mensaje inválido" }, 400, cors);
      size += m.content.length;
    }
    if (size > MAX_CHARS) return json({ error: "Conversación demasiado larga" }, 413, cors);

    const call = (p) => fetch(env.AI_URL || DEFAULT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.AI_KEY}` },
      body: JSON.stringify(p)
    });
    // Si el modelo principal está saturado (503), sin cupo (429) o retirado (404), se prueba el de respaldo.
    const models = [env.AI_MODEL || DEFAULT_MODEL, env.AI_MODEL_FALLBACK || FALLBACK_MODEL];
    let upstream;
    for (const model of models) {
      const payload = {
        model,
        messages,
        stream: !!body.stream,
        temperature: Math.max(0, Math.min(1.5, +body.temperature || 0.7)),
        max_tokens: Math.max(16, Math.min(MAX_TOKENS, +body.max_tokens || 200)),
        // Sin "pensar" el modelo responde mucho más rápido. Si el modelo no lo acepta, se reintenta sin esto.
        reasoning_effort: env.AI_REASONING || "none"
      };
      upstream = await call(payload);
      if (upstream.status === 400) { delete payload.reasoning_effort; upstream = await call(payload); }
      if (![404, 429, 500, 503].includes(upstream.status)) break;
    }

    if (!upstream.ok) {
      const txt = await upstream.text();
      const msg = upstream.status === 429 ? "Se acabó el límite gratuito por ahora. Espera un minuto o mañana."
        : upstream.status === 503 ? "La IA de Google está saturada en este momento. Intenta otra vez en un minuto."
        : `La IA respondió ${upstream.status}`;
      return json({ error: msg, detail: txt.slice(0, 300) }, upstream.status === 429 ? 429 : 502, cors);
    }
    return new Response(upstream.body, {
      status: 200,
      headers: { ...cors, "Content-Type": body.stream ? "text/event-stream" : "application/json", "Cache-Control": "no-store" }
    });
  }
};
