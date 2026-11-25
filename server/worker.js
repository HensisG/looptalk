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
const MAX_TOKENS = 1500;

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
    if (req.method === "GET" && url.pathname === "/") return json({ ok: true, app: "try-your-new-language", tts: true }, 200, cors);
    if (req.method !== "POST" || !["/chat", "/tts"].includes(url.pathname)) return json({ error: "not found" }, 404, cors);

    if (!env.AI_KEY) return json({ error: "Falta AI_KEY en el servidor" }, 500, cors);
    if (env.APP_CODE && req.headers.get("X-App-Code") !== env.APP_CODE) return json({ error: "Código de acceso incorrecto" }, 401, cors);
    if (url.pathname === "/tts") return tts(req, env, cors);

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

// ---------- voces: una voz natural distinta para cada personaje (Gemini TTS) ----------
const VOICES = new Set(["Zephyr", "Puck", "Charon", "Kore", "Fenrir", "Leda", "Orus", "Aoede", "Callirrhoe", "Autonoe", "Enceladus", "Iapetus", "Umbriel", "Algieba", "Despina", "Erinome", "Algenib", "Rasalgethi", "Laomedeia", "Achernar", "Alnilam", "Schedar", "Gacrux", "Pulcherrima", "Achird", "Zubenelgenubi", "Vindemiatrix", "Sadachbia", "Sadaltager", "Sulafat"]);
const TTS_MODEL = "gemini-3.8-flash-tts";
const TTS_FALLBACK = "gemini-2.5-flash-preview-tts";

async function tts(req, env, cors) {
  let b;
  try { b = await req.json(); } catch { return json({ error: "JSON inválido" }, 400, cors); }
  const text = String(b.text || "").replace(/[*_#]/g, "").slice(0, 700).trim();
  if (!text) return json({ error: "Falta texto" }, 400, cors);
  const voice = VOICES.has(b.voice) ? b.voice : "Kore";
  const style = String(b.style || "").replace(/[:\n]/g, " ").slice(0, 120).trim();
  let last = 0;
  for (const model of [env.TTS_MODEL || TTS_MODEL, env.TTS_MODEL_FALLBACK || TTS_FALLBACK]) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.AI_KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: style ? `${style}: ${text}` : text }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } }
      })
    });
    if (!r.ok) { last = r.status; if ([404, 429, 500, 503].includes(r.status)) continue; break; }
    const j = await r.json();
    const part = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData;
    if (!part) { last = 502; continue; }
    let bytes = Uint8Array.from(atob(part.data), (c) => c.charCodeAt(0));
    if (/L16|pcm/i.test(part.mimeType || "")) bytes = wav(bytes, +((part.mimeType.match(/rate=(\d+)/) || [])[1] || 24000));
    return new Response(bytes, { status: 200, headers: { ...cors, "Content-Type": "audio/wav", "Cache-Control": "no-store" } });
  }
  return json({ error: last === 429 ? "Se acabó el límite gratuito de voces por hoy" : `Voz no disponible (${last})` }, last === 429 ? 429 : 502, cors);
}

// Envuelve audio PCM de 16 bits (mono) en un archivo WAV que el teléfono puede reproducir.
function wav(pcm, rate) {
  const out = new Uint8Array(44 + pcm.length), v = new DataView(out.buffer);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + pcm.length, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, pcm.length, true); out.set(pcm, 44);
  return out;
}
