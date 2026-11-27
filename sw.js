/* Retiré : l'application installable sera réservée à Frenglais Entreprise. Ce fichier désinstalle l'ancienne version. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => { e.waitUntil(self.registration.unregister().then(() => self.clients.matchAll()).then(C => C.forEach(c => c.navigate(c.url)))); });
