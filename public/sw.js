// R6 Codex Service Worker – network-first für Seiten (immer aktuell online,
// Cache-Fallback offline), cache-first für unveränderliche statische Assets.
const CACHE = "r6codex-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Seiten: erst Netzwerk, offline aus dem Cache.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put(req, res.clone());
          return res;
        } catch {
          return (await caches.match(req)) || (await caches.match("/")) || Response.error();
        }
      })(),
    );
    return;
  }

  // Statische Assets: erst Cache, sonst Netzwerk (und cachen).
  if (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/icons") ||
    url.pathname.startsWith("/img") ||
    url.pathname.startsWith("/maps-img")
  ) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, res.clone());
        return res;
      })(),
    );
  }
});
