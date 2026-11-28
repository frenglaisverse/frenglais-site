/* Enregistrements vocaux gardés sur l'appareil (IndexedDB).
   Seuls ceux du module 1 sont conservés : l'élève les réécoute aux modules 12 et 32 pour mesurer son progrès. */
(function(){
  const BASE = 'frenglais-voix', TABLE = 'enregistrements';
  const ouvrir = () => new Promise((ok, ko) => {
    if (!('indexedDB' in window)) return ko(new Error('indisponible'));
    const r = indexedDB.open(BASE, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(TABLE);
    r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error);
  });
  const tx = async (mode, f) => { const db = await ouvrir(); return new Promise((ok, ko) => { const t = db.transaction(TABLE, mode); const s = t.objectStore(TABLE); const r = f(s); t.oncomplete = () => ok(r && r.result); t.onerror = () => ko(t.error); }); };
  window.Voix = {
    garder: (cle, blob) => tx('readwrite', s => s.put({ blob, date: Date.now() }, cle)).catch(() => null),
    lire: cle => tx('readonly', s => s.get(cle)).then(v => v || null).catch(() => null),
    effacer: cle => tx('readwrite', s => s.delete(cle)).catch(() => null)
  };
})();
