// Service worker: guarda la app para que abra sin internet.
// El modelo de IA lo guarda WebLLM en su propia caché del navegador.
const VERSION = "tynl-v9";
const SHELL = ["./", "./index.html", "./webllm.js", "./world.js", "./worker.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => (k.startsWith("looptalk-") || k.startsWith("tynl-")) && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!sameOrigin && !isFont) return; // los archivos del modelo los maneja WebLLM
  // La página principal: primero internet (para recibir actualizaciones al momento), si no hay, la copia guardada.
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put("./index.html", copy)); }
      return res;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(
    caches.match(e.request, { ignoreSearch: sameOrigin }).then((hit) => {
      const net = fetch(e.request).then((res) => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit || (e.request.mode === "navigate" ? caches.match("./index.html") : undefined));
      return hit || net;
    })
  );
});
