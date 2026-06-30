const CACHE = "caisse-v1";
const APP_SHELL = [
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // On ne touche pas aux requêtes vers Supabase : les données doivent
  // toujours être fraîches, jamais servies depuis le cache.
  if (request.url.includes("supabase.co")) return;
  if (request.method !== "GET") return;

  const isNavigation = request.mode === "navigate";

  if (isNavigation) {
    // Réseau d'abord (avec timeout court), sinon cache, sinon page hors-ligne.
    event.respondWith(
      Promise.race([
        fetch(request),
        new Promise((_, reject) => setTimeout(reject, 4000)),
      ])
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(
          () =>
            caches.match(request).then((cached) => cached) ||
            caches.match("/offline.html")
        )
        .then((r) => r || caches.match("/offline.html"))
    );
    return;
  }

  // Statique (icônes, css, js, fonts) : stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
