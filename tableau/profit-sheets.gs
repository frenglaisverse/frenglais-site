/* Frenglais · onglet Profit du tableau de bord
   À coller dans le Sheet « Cours particuliers » : Extensions > Apps Script, tout remplacer, Enregistrer,
   puis choisir la fonction « installer » et cliquer sur Exécuter (une seule fois, accepter les autorisations).
   Le script lit vos trois Sheets et envoie seulement les totaux (et le prénom + la date de dernière modification
   de chaque élève, pour les rappels) à votre serveur Frenglais. Rien d'autre ne sort. */

const API = 'https://courbe-classement.paulodubmx84.workers.dev/profit/sheet';
const JETON = '__JETON__';
const COURS_ONGLET = 2131467706;                                     // gid de l'onglet des cours particuliers
const BARB_ID = '1jWElZ0NQakEDjgJol4-p0Xid8op9445cEhLQcu5f6IE', BARB_ONGLET = 726881942;
const IMM_ID = '1vzkSGQOJXVjD5ugfubAebg7hEhHRc5eT', IMM_ONGLET = 366715783;
const BARB_CELLULE = '';   // si la lecture automatique se trompe : mettez ici la cellule du mois, ex. 'Feuille1!C14'

/* ---------- installation ---------- */
function installer() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('surModifCours').forSpreadsheet(SpreadsheetApp.getActive()).onEdit().create();
  try { ScriptApp.newTrigger('surModifBarb').forSpreadsheet(BARB_ID).onEdit().create(); } catch (e) {}
  ScriptApp.newTrigger('toutEnvoyer').timeBased().everyMinutes(10).create();
  DriveApp.getRootFolder(); // autorisation Drive : nécessaire pour lire le fichier Immersion s'il est au format Excel
  const P = PropertiesService.getScriptProperties(), E = JSON.parse(P.getProperty('eleves') || '{}');
  const c = lireCours(); (c.noms || []).forEach(n => { if (!E[n]) E[n] = Date.now(); }); P.setProperty('eleves', JSON.stringify(E));
  toutEnvoyer(true);
}
function toutEnvoyer(force) {
  envoyer('cours', donneesCours());
  envoyer('barb', lireBarb());
  const P = PropertiesService.getScriptProperties(), t = +(P.getProperty('immT') || 0);
  if (force === true || Date.now() - t > 29 * 60000) { P.setProperty('immT', String(Date.now())); envoyer('imm', lireImm()); }
}
function surModifCours(e) {
  try { const c = lireCours(), r = e && e.range;
    if (r && c.feuille === r.getSheet().getName()) { const n = c.ligneNom[r.getRow()];
      if (n) { const P = PropertiesService.getScriptProperties(), E = JSON.parse(P.getProperty('eleves') || '{}'); E[n] = Date.now(); P.setProperty('eleves', JSON.stringify(E)); } }
    envoyer('cours', donneesCours(c)); } catch (x) { console.log(x); } }
function surModifBarb() { try { envoyer('barb', lireBarb()); } catch (x) { console.log(x); } }
function envoyer(source, data) {
  const r = UrlFetchApp.fetch(API, { method: 'post', contentType: 'application/json', muteHttpExceptions: true, payload: JSON.stringify({ jeton: JETON, source, data }) });
  console.log(source + ' → ' + r.getResponseCode() + ' ' + r.getContentText()); }

/* ---------- outils ---------- */
const MOIS = { jan: 1, janv: 1, january: 1, janvier: 1, feb: 2, fev: 2, fevr: 2, february: 2, fevrier: 2, mar: 3, mars: 3, march: 3, apr: 4, avr: 4, april: 4, avril: 4, may: 5, mai: 5,
  jun: 6, june: 6, juin: 6, jul: 7, juil: 7, july: 7, juillet: 7, aug: 8, aou: 8, august: 8, aout: 8, sep: 9, sept: 9, september: 9, septembre: 9, oct: 10, october: 10, octobre: 10,
  nov: 11, november: 11, novembre: 11, dec: 12, december: 12, decembre: 12 };
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[-–—_:.|/]+/g, ' ').replace(/\s+/g, ' ').trim();
function nombre(v) { if (typeof v === 'number') return v; if (v instanceof Date || v === '' || v == null) return null;
  let s = String(v).replace(/[^\d,.\-]/g, ''); if (!/\d/.test(s)) return null;
  if (s.includes(',') && s.includes('.')) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  else if (s.includes(',')) s = /,\d{3}$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.');
  const n = parseFloat(s); return isFinite(n) ? n : null; }
function cleMois(m, y) { const d = new Date(); if (!y) { y = d.getFullYear(); if (m > d.getMonth() + 1) y--; } return y + '-' + String(m).padStart(2, '0'); }
function moisDe(txt) { const t = norm(txt); let m = t.match(/^([a-z]+)(?: (\d{2}|\d{4}))?$/) || t.match(/^(\d{4}) ([a-z]+)$/);
  if (!m) return null; let mo = m[1], y = m[2]; if (/^\d/.test(mo)) { const z = mo; mo = y; y = z; } if (!MOIS[mo]) return null;
  return cleMois(MOIS[mo], y ? (y.length === 2 ? 2000 + +y : +y) : 0); }
function voisin(V, r, c) { for (let k = c + 1; k < Math.min(V[r].length, c + 12); k++) { const n = nombre(V[r][k]); if (n !== null) return { v: n, r, c: k }; }
  for (let k = r + 1; k < Math.min(V.length, r + 6); k++) { const n = nombre(V[k][c]); if (n !== null) return { v: n, r: k, c }; } return null; }
function A1(f, r, c) { let L = ''; c++; while (c > 0) { const m = (c - 1) % 26; L = String.fromCharCode(65 + m) + L; c = Math.floor((c - 1) / 26); } return f + '!' + L + (r + 1); }
function feuilles(ss, gid) { const L = ss.getSheets(), f = L.find(s => s.getSheetId() === gid); return f ? [f].concat(L.filter(s => s !== f)) : L; }

/* ---------- cours particuliers : TOTAL × « owed <mois> », TOTAL × « PAID », TOTAL × « TOTAL OWED » ---------- */
function lireCours() {
  const ss = SpreadsheetApp.getActive();
  for (const f of feuilles(ss, COURS_ONGLET)) {
    const V = f.getDataRange().getValues(), nom = f.getName(), out = { feuille: nom, owed: {}, ou: {}, noms: [], ligneNom: {} };
    // 1) intitulés réunis dans une seule cellule (« TOTAL -- owed nov »)
    V.forEach((L, r) => L.forEach((x, c) => { if (typeof x !== 'string' || !x.trim()) return; const t = norm(x), v = voisin(V, r, c); if (!v) return;
      let m; if ((m = t.match(/^total owed (\S+)( \d{2,4})?$/)) && MOIS[m[1]]) { const k = cleMois(MOIS[m[1]], m[2] ? (m[2].trim().length === 2 ? 2000 + +m[2] : +m[2]) : 0); out.owed[k] = v.v; out.ou['owed ' + k] = A1(nom, v.r, v.c); }
      else if (/^total total owed$/.test(t)) { out.totalOwed = v.v; out.ou.totalOwed = A1(nom, v.r, v.c); }
      else if (/^total paid$/.test(t)) { out.totalPaid = v.v; out.ou.totalPaid = A1(nom, v.r, v.c); } }));
    // 2) tableau : ligne d'en-têtes (owed nov, PAID, TOTAL OWED…) et ligne « TOTAL » en bas
    let hr = -1; for (let r = 0; r < Math.min(V.length, 30) && hr < 0; r++) if (V[r].some(x => /^(owed \S+|paid|total owed|total paid)$/.test(norm(x)))) hr = r;
    if (hr >= 0) { let tr = -1; for (let r = hr + 1; r < V.length && tr < 0; r++) if (V[r].slice(0, 4).some(x => /^total$/.test(norm(x)))) tr = r;
      const fin = tr > 0 ? tr : V.length; let nc = -1;
      for (let c = 0; c < Math.min(V[0].length, 4) && nc < 0; c++) { let n = 0; for (let r = hr + 1; r < fin; r++) if (typeof V[r][c] === 'string' && V[r][c].trim() && nombre(V[r][c]) === null) n++; if (n >= 1) nc = c; }
      const val = c => { if (tr > 0) return nombre(V[tr][c]); let s = 0, ok = false; for (let r = hr + 1; r < fin; r++) { const n = nombre(V[r][c]); if (n !== null) { s += n; ok = true; } } return ok ? s : null; };
      V[hr].forEach((h, c) => { const t = norm(h), v = val(c); if (v === null) return; let m;
        if ((m = t.match(/^owed (\S+)( \d{2,4})?$/)) && MOIS[m[1]]) { const k = cleMois(MOIS[m[1]], m[2] ? (m[2].trim().length === 2 ? 2000 + +m[2] : +m[2]) : 0); if (!(k in out.owed)) { out.owed[k] = v; out.ou['owed ' + k] = A1(nom, tr > 0 ? tr : hr, c); } }
        else if (t === 'total owed' && out.totalOwed == null) { out.totalOwed = v; out.ou.totalOwed = A1(nom, tr > 0 ? tr : hr, c); }
        else if ((t === 'paid' || t === 'total paid') && out.totalPaid == null) { out.totalPaid = v; out.ou.totalPaid = A1(nom, tr > 0 ? tr : hr, c); } });
      if (nc >= 0) for (let r = hr + 1; r < fin; r++) { const n = String(V[r][nc] || '').trim(); if (n && nombre(n) === null && !/^(total|owed|paid|sum|somme)/i.test(n)) { out.noms.push(n); out.ligneNom[r + 1] = n; } } }
    if (Object.keys(out.owed).length || out.totalOwed != null) return out;
  }
  return { feuille: '', owed: {}, ou: {}, noms: [], ligneNom: {}, erreur: 'intitulés « TOTAL / owed » introuvables' };
}
function donneesCours(c) { c = c || lireCours(); const E = JSON.parse(PropertiesService.getScriptProperties().getProperty('eleves') || '{}'), eleves = {};
  c.noms.forEach(n => eleves[n] = E[n] || Date.now());
  return { owed: c.owed, totalOwed: c.totalOwed, totalPaid: c.totalPaid, ou: c.ou, eleves, feuille: c.feuille, erreur: c.erreur || '' }; }

/* ---------- TalkWithBarb : montant du mois (intitulé de mois + nombre à côté, ou journal daté) ---------- */
function lireBarb() {
  const ss = SpreadsheetApp.openById(BARB_ID), out = { mois: {}, ou: {} };
  if (BARB_CELLULE) { const r = ss.getRange(BARB_CELLULE), k = cleMois(new Date().getMonth() + 1); out.mois[k] = nombre(r.getValue()); out.ou[k] = BARB_CELLULE; out.methode = 'cellule fixée'; return out; }
  for (const f of feuilles(ss, BARB_ONGLET)) { const V = f.getDataRange().getValues(), nom = f.getName();
    // a) une cellule « November », « nov 2026 »… suivie d'un montant
    V.forEach((L, r) => L.forEach((x, c) => { let k = null;
      if (x instanceof Date && x.getDate() === 1) k = cleMois(x.getMonth() + 1, x.getFullYear());
      else if (typeof x === 'string' && x.length < 30) k = moisDe(x);
      if (!k || k in out.mois) return; const v = voisin(V, r, c); if (v) { out.mois[k] = v.v; out.ou[k] = A1(nom, v.r, v.c); } }));
    if (Object.keys(out.mois).length) { out.methode = 'intitulé du mois'; return out; }
    // b) journal : une colonne de dates + une colonne de montants
    let hr = -1, cd = -1, cm = -1; for (let r = 0; r < Math.min(V.length, 15) && hr < 0; r++) V[r].forEach((h, c) => { const t = norm(h);
      if (cd < 0 && /date|day|jour/.test(t)) cd = c; if (cm < 0 && /amount|total|pay|earn|montant|rate|\$|€|usd|eur/.test(t)) cm = c; if (cd >= 0 && cm >= 0) hr = r; });
    if (hr >= 0) { for (let r = hr + 1; r < V.length; r++) { const d = V[r][cd], n = nombre(V[r][cm]); if (d instanceof Date && n !== null) { const k = cleMois(d.getMonth() + 1, d.getFullYear()); out.mois[k] = (out.mois[k] || 0) + n; } }
      out.ou.journal = A1(nom, hr, cd) + ' / ' + A1(nom, hr, cm); out.methode = 'journal daté'; return out; } }
  out.erreur = 'mois introuvable : renseignez BARB_CELLULE en haut du script'; return out;
}

/* ---------- Immersion : une ligne « Video Name » = 25 $ ; le mois vient d'une colonne date, sinon du jour où la vidéo apparaît ---------- */
function ouvrirImm() {
  try { return { ss: SpreadsheetApp.openById(IMM_ID), tmp: null }; } catch (e) {}
  const tok = ScriptApp.getOAuthToken(), r = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + IMM_ID + '/copy?supportsAllDrives=true', { method: 'post', contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + tok }, payload: JSON.stringify({ name: 'frenglais-profit-temporaire', mimeType: 'application/vnd.google-apps.spreadsheet' }) });
  const id = JSON.parse(r.getContentText()).id; return { ss: SpreadsheetApp.openById(id), tmp: id }; }
function lireImm() {
  const o = ouvrirImm(), out = { mois: {}, total: 0 };
  try { for (const f of feuilles(o.ss, IMM_ONGLET)) { const V = f.getDataRange().getValues(); let hr = -1, cv = -1, cd = -1;
      for (let r = 0; r < Math.min(V.length, 15) && hr < 0; r++) V[r].forEach((h, c) => { if (/^video name/.test(norm(h))) { hr = r; cv = c; } });
      if (hr < 0) continue; V[hr].forEach((h, c) => { if (cd < 0 && c !== cv && /date|uploaded|submitted|added|published|mois|month/.test(norm(h))) cd = c; });
      const P = PropertiesService.getScriptProperties(), auj = cleMois(new Date().getMonth() + 1, new Date().getFullYear()); let sansDate = 0;
      for (let r = hr + 1; r < V.length; r++) { const n = String(V[r][cv] || '').trim(); if (!n) continue; out.total++;
        let k = null; const d = cd >= 0 ? V[r][cd] : null; if (d instanceof Date) k = cleMois(d.getMonth() + 1, d.getFullYear()); else if (d) k = moisDe(String(d));
        if (k) out.mois[k] = (out.mois[k] || 0) + 1; else sansDate++; }
      // sans date : chaque nouvelle ligne apparue depuis le dernier passage compte pour le mois en cours
      const avant = P.getProperty('immDernier'), A = JSON.parse(P.getProperty('immAjouts') || '{}');
      if (avant !== null && sansDate > +avant) A[auj] = (A[auj] || 0) + sansDate - +avant;
      P.setProperty('immDernier', String(sansDate)); P.setProperty('immAjouts', JSON.stringify(A));
      Object.entries(A).forEach(([k, n]) => out.mois[k] = (out.mois[k] || 0) + n);
      out.methode = cd >= 0 ? 'colonne date' : 'suivi des ajouts'; out.feuille = f.getName(); return out; }
    out.erreur = 'colonne « Video Name » introuvable'; return out;
  } finally { if (o.tmp) UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + o.tmp + '?supportsAllDrives=true', { method: 'delete', headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true }); }
}
