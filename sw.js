/* Frenglais · application installable. Les pages viennent toujours du réseau en priorité : chaque mise à jour du site
   arrive au prochain démarrage, sans rien installer. Sans connexion, on sert la dernière version gardée. */
const CACHE = 'frenglais-v1';
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/', '/espace-eleve.html', '/style.css', '/logo-nav.webp', '/icone-192.png']).catch(() => {}))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(K => Promise.all(K.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; const u = new URL(r.url); if (r.method !== 'GET' || u.origin !== location.origin || r.headers.has('range') || /\.(mp4|webm|mp3)$/.test(u.pathname) || u.pathname.startsWith('/tableau')) return;
  e.respondWith(fetch(r).then(rep => { if (rep.ok && rep.type === 'basic') { const c = rep.clone(); caches.open(CACHE).then(k => k.put(r, c)); } return rep; })
    .catch(() => caches.match(r).then(m => m || (r.mode === 'navigate' ? caches.match('/espace-eleve.html') : Response.error()))));
});
