// Service worker: riceve le notifiche push e permette di installare l'app.
const VERSIONE = "mp-2";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(["./", "index.html", "icona-192.png"]))); });
self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== VERSIONE) await caches.delete(k);
  await self.clients.claim();
})()));
// Pagina: prima la rete (per avere sempre l'ultima versione), la copia salvata solo se offline.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSIONE).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { titolo: "Monitor prezzi", testo: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.titolo || "Monitor prezzi", {
    body: d.testo || "", tag: d.tag, icon: "icona-192.png", badge: "icona-192.png",
    data: { url: d.url || "./?vista=avvisi" },
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./?vista=avvisi";
  e.waitUntil(clients.openWindow(url));
});
