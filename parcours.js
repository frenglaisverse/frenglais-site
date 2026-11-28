/* Espace élève · le parcours : tuiles qui défilent (curseur), déblocage « module validé + date de sortie »,
   et quatre micro-entraînements optionnels par module (écrit, écoute, oral, lecture), derrière le bouton +. */
(function(){
  'use strict';
  const TITRES = ['Repères et codes',"T0, le temps le plus simple","T-1, toujours simple","BE + -ING","HAVE + -EN","T-2, le passé dans le passé","T+1, l'éléphant dans la pièce","Les modaux","HAVE BEEN + -ING","Poser des questions","Spit it : dites-le","Toute la Courbe","Les quatre couteaux suisses","Les verbes à particule","Le verbe choisit sa préposition","Ne plus bloquer","Se présenter pour de vrai","Écrire un e-mail","Téléphone et visio","Chiffres, dates, heures, prix","Comparer et décrire","Relier ses idées","Si…","L'anglais réel","Le passif","Les habitudes passées","Les regrets","Rapporter des paroles","Convaincre","Prendre la parole","Continuer seul","Le grand oral"];
  /* calendrier propre à chaque élève : à partir de sa première connexion (jamais avant le lancement), les 4 premiers modules la semaine 1, puis deux par semaine */
  const AP = window.FRG_APERCU || null;
  const LANCEMENT = AP ? Date.now() - 864e5 * 21 : Date.parse('2026-12-01T00:00:00+01:00');
  const dfr = (t, o) => new Date(t).toLocaleDateString('fr-FR', o).replace(/(^|\s)1(?= )/, '$11er');   /* « 1er décembre » */
  const JOUR = 864e5, minuit = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  let DEBUT = null;   /* première connexion de l'élève (serveur), sinon aujourd'hui */
  const depart = () => minuit(Math.max(LANCEMENT, DEBUT || Date.now()));
  const sortie = n => depart() + (n <= 4 ? 0 : Math.ceil((n - 4) / 2) * 7 * JOUR);
  const MODULES_EN_LIGNE = true;   /* pages des modules publiées */
  const PUBLIES = AP ? 32 : 4;      /* modules validés par Paul et en ligne ; les suivants affichent « Bientôt » */
  const $ = s => document.querySelector(s), esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const lire = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const piste = $('.tb-modules'); if (!piste) return;
  let ETAT = { formule: AP ? AP.formule : null, prog: {} }, choisi = null;

  const valide = n => { const p = ETAT.prog[n]; if (p && p.v) return true; if (AP && AP.valides && AP.valides.includes(n)) return true; const l = lire('frg-m' + n, null); return !!(l && l.valide); };
  const maxModule = () => ETAT.formule === 'signature' ? 32 : 24;
  function statut(n){
    if (!ETAT.formule) return { k: 'visiteur', txt: 'Avec la formation' };
    if (n > maxModule()) return { k: 'sig', txt: 'Avec Signature' };
    if (valide(n)) return { k: 'ok', txt: 'Validé' };
    if (n > PUBLIES) return { k: 'date', txt: 'Bientôt' };
    if (Date.now() < sortie(n) && !ETAT.testeur) return { k: 'date', txt: 'Ouvre le ' + dfr(sortie(n), { day: 'numeric', month: 'short' }) };
    if (n > 1 && !valide(n - 1)) return { k: 'avant', txt: 'Validez le module ' + (n - 1) };
    return { k: 'ouvert', txt: lire('frg-m' + n + '-pct', 0) > 0 ? 'Reprendre' : 'À faire' };
  }
  const ouvert = n => ['ok', 'ouvert'].includes(statut(n).k);
  const lien = n => n === 1 ? 'module-1.html' : 'module.html?n=' + n;
  const CADENAS = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

  function dessiner(){
    piste.querySelectorAll('.pc-tuile').forEach(x => x.remove());
    for (let n = 1; n <= 32; n++) { const s = statut(n), t = document.createElement('button'); t.type = 'button';
      const flou = s.k === 'visiteur' && n > 4;   // visiteur : les 4 premiers modules lisibles, la suite floutée
      t.className = 'tb-module pc-tuile pc-' + s.k + (n > 24 ? ' pc-avance' : '') + (flou ? ' pc-flou' : '') + (['ok', 'ouvert'].includes(s.k) ? '' : ' pc-bloque'); t.dataset.n = n; t.setAttribute('role', 'listitem'); if (flou) t.setAttribute('aria-label', 'Module ' + n + ', réservé aux élèves');
      const pct = s.k === 'ouvert' ? lire('frg-m' + n + '-pct', 0) : s.k === 'ok' ? 100 : 0;
      t.innerHTML = `${n > 24 ? '<span class="tb-etiq sig">Signature</span>' : ''}<div class="tb-num">${String(n).padStart(2, '0')}</div>${icoM(n)}${['ok', 'ouvert'].includes(s.k) ? '' : `<span class="tb-cadenas" aria-label="Verrouillé">${CADENAS}</span>`}
        <div class="tb-corps"><strong${flou ? ' aria-hidden="true"' : ''}>${esc(TITRES[n - 1])}</strong><span class="pc-etat">${s.k === 'ok' ? '✓ ' : ''}${flou ? 'Réservé aux élèves' : esc(s.txt)}</span>${pct ? `<div class="tb-mini"><i style="width:${pct}%"></i></div>` : ''}</div>`;
      piste.append(t); }
    const nb = Array.from({ length: maxModule() }, (_, i) => i + 1).filter(valide).length;
    const r = $('#pc-compte'); if (r) r.textContent = ETAT.formule ? nb + ' / ' + maxModule() + ' validés' : '24 modules · 32 avec Signature';
    if (choisi == null) { let c = 1; for (let n = 1; n <= maxModule(); n++) if (statut(n).k === 'ouvert') { c = n; break; } choisi = ETAT.formule ? c : 1; }
    selectionner(choisi, false); majCurseur();
  }
  function selectionner(n, defiler = true){
    choisi = n; piste.querySelectorAll('.pc-tuile').forEach(t => t.classList.toggle('pc-choisi', +t.dataset.n === n));
    const t = piste.querySelector(`.pc-tuile[data-n="${n}"]`); if (t) requestAnimationFrame(() => piste.scrollTo({ left: t.offsetLeft - (piste.clientWidth - t.offsetWidth) / 2, behavior: defiler ? 'smooth' : 'auto' }));
    const s = statut(n), o = ouvert(n), d = $('#pc-detail'), flou = s.k === 'visiteur' && n > 4; if (!d) return;
    const fait = lire('frg-entr', {})[n] || {};
    d.innerHTML = `<div class="pc-d-tete"><div><p class="pc-d-num">${n > 24 ? 'Module avancé · Signature' : 'Module ' + n + ' / 24'}</p><h3${flou ? ' class="pc-flou-t" aria-hidden="true"' : ''}>${esc(TITRES[n - 1])}</h3><p class="pc-d-etat pc-e-${s.k}">${flou ? 'Réservé aux élèves de la formation' : s.k === 'date' && s.txt.startsWith('Ouvre') ? 'Ouvre le ' + dfr(sortie(n), { weekday: 'long', day: 'numeric', month: 'long' }) : (s.k === 'ok' ? '✓ ' : '') + esc(s.txt)}</p></div>
      <div class="pc-d-actions">${flou ? '<a class="btn btn-bleu" href="index.html#formations">Voir les formules</a>' : o && MODULES_EN_LIGNE ? `<a class="btn btn-bleu" href="${lien(n)}">${s.k === 'ok' ? 'Revoir le module' : s.txt === 'Reprendre' ? 'Reprendre' : 'Commencer'}</a>` : s.k === 'date' && n === 1 ? '<a class="btn btn-bleu" href="introduction.html">En attendant : l’Introduction (10 min)</a>' : `<span class="pc-d-verrou">${CADENAS} ${o ? 'Ouverture à la mise en ligne' : s.k === 'date' ? 'Verrouillé' : esc(s.txt)}</span>`}
      <button type="button" class="pc-plus" aria-expanded="false" aria-controls="pc-entr" ${o ? '' : 'disabled'} hidden title="${o ? 'Micro-entraînements' : 'Disponible quand le module est ouvert'}">+ <span>S'entraîner</span></button></div></div>
      <div class="pc-entr" id="pc-entr" hidden>
        <p class="pc-entr-sous">Facultatif, 2 à 3 minutes chacun. Les questions changent à chaque fois, et la difficulté monte : vocabulaire, nuances, pièges.</p>
        <div class="pc-entr-grille">${[['ecrit', 'Écrit', 'Codes, vocabulaire, nuances'], ['ecoute', 'Écoute', 'Le dialogue, puis les questions'], ['oral', 'Oral', 'À voix haute, au chrono'], ['lecture', 'Lecture', 'Lisez, comprenez, trouvez les codes']].map(([k, l, s2]) =>
          `<button type="button" class="pc-entr-c" data-e="${k}"><b>${l}${fait[k] ? ' <i>✓</i>' : ''}</b><span>${s2}</span><em class="pc-niv">${NIV[niveau(n, k)]}</em></button>`).join('')}</div>
        <div class="pc-ex" id="pc-ex"></div></div>`;
    const plus = d.querySelector('.pc-plus'), box = d.querySelector('#pc-entr');
    plus.addEventListener('click', () => { const ouvre = box.hidden; box.hidden = !ouvre; plus.setAttribute('aria-expanded', ouvre); plus.classList.toggle('on', ouvre); });
    d.querySelectorAll('[data-e]').forEach(b => b.addEventListener('click', () => entrainer(n, b.dataset.e)));
    rangEntr(n, s, o, flou); tuileEntr(); majCurseur();
  }
  /* ---------- rangée « Entraînement » sous les modules : 5 exercices par module + le lamantin en libre accès ---------- */
  /* une petite icône discrète par module, en rapport avec son contenu */
  const ICO_M = ["<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M15.5 8.5l-2 5-5 2 2-5z\"/>", "<circle cx=\"12\" cy=\"12\" r=\"8\"/><circle cx=\"12\" cy=\"12\" r=\"2.5\" fill=\"currentColor\"/>", "<path d=\"M9 7H5V3\"/><path d=\"M5.5 7A8 8 0 1 1 4 13\"/>", "<rect x=\"3\" y=\"7\" width=\"13\" height=\"10\" rx=\"2\"/><path d=\"M16 11l5-3v8l-5-3\"/><circle cx=\"7\" cy=\"12\" r=\"1.3\" fill=\"currentColor\"/>", "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M8 12.5l2.8 2.8 5.7-5.8\"/>", "<path d=\"M11 7H7V3\"/><path d=\"M7.5 7A7 7 0 1 1 6 12\"/><path d=\"M6 7H3V4\"/>", "<path d=\"M4 12h13\"/><path d=\"M13 7l5 5-5 5\"/><circle cx=\"20\" cy=\"5\" r=\"1.5\" fill=\"currentColor\"/>", "<path d=\"M4 18a8 8 0 0 1 16 0\"/><path d=\"M12 18l4-6\"/><path d=\"M8 7l.01 0M16 7l.01 0\"/>", "<path d=\"M20 12a8 8 0 1 1-2.3-5.6\"/><path d=\"M20 4v4h-4\"/><path d=\"M12 8v4l3 2\"/>", "<path d=\"M9 9a3 3 0 1 1 4 2.8c-.8.4-1 1-1 2v.5\"/><circle cx=\"12\" cy=\"18\" r=\"1\" fill=\"currentColor\"/>", "<path d=\"M4 6h16v10H9l-5 4z\"/>", "<path d=\"M3 16c4 0 4-8 9-8s5 6 9 6\"/><path d=\"M18 11l3 3-3 3\"/>", "<rect x=\"3\" y=\"11\" width=\"18\" height=\"6\" rx=\"3\"/><path d=\"M6.5 11l8.5-6 2 2-6.5 4\"/><circle cx=\"17.5\" cy=\"14\" r=\".6\"/>", "<path d=\"M5 5h6v3a2 2 0 1 0 4 0V5h4v6h-3a2 2 0 1 0 0 4h3v4H5z\"/>", "<path d=\"M4 12h9\"/><path d=\"M10 9l3 3-3 3\"/><rect x=\"14\" y=\"6\" width=\"6\" height=\"12\" rx=\"1\"/>", "<rect x=\"5\" y=\"11\" width=\"14\" height=\"9\" rx=\"2\"/><path d=\"M8 11V8a4 4 0 0 1 7.5-2\"/>", "<rect x=\"4\" y=\"5\" width=\"16\" height=\"14\" rx=\"2\"/><circle cx=\"9\" cy=\"11\" r=\"2\"/><path d=\"M6.5 16c1-2 4-2 5 0M14 10h4M14 13h3\"/>", "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M3 7l9 6 9-6\"/>", "<path d=\"M6 3h4l1 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 1v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z\"/>", "<rect x=\"4\" y=\"5\" width=\"16\" height=\"15\" rx=\"2\"/><path d=\"M4 10h16M9 3v4M15 3v4\"/>", "<path d=\"M12 4v16M6 20h12\"/><path d=\"M4 8h16\"/><path d=\"M4 8l-2 6h4zM20 8l-2 6h4z\"/>", "<path d=\"M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1\"/><path d=\"M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1\"/>", "<path d=\"M12 21v-8\"/><path d=\"M12 13L6 6M12 13l6-7\"/><path d=\"M4 6h4M16 6h4\"/>", "<path d=\"M5 15a7 7 0 1 1 11 3l-2 3\"/><path d=\"M9 12a3 3 0 1 1 5 2\"/>", "<path d=\"M4 8h14l-3-3M20 16H6l3 3\"/>", "<path d=\"M7 3h10M7 21h10\"/><path d=\"M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9\"/>", "<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M9 15c1.5-1.5 4.5-1.5 6 0\"/><path d=\"M9 9.5h.01M15 9.5h.01\"/>", "<path d=\"M4 5h11v8H8l-4 3z\"/><path d=\"M15 9h5v8l-3-2h-6v-2\"/>", "<path d=\"M7 11V6a2 2 0 1 1 4 0v5\"/><path d=\"M11 10V5a2 2 0 1 1 4 0v6\"/><path d=\"M15 11V8a2 2 0 1 1 4 0v5a7 7 0 0 1-14 0v-2a2 2 0 1 1 4 0\"/>", "<rect x=\"9\" y=\"3\" width=\"6\" height=\"11\" rx=\"3\"/><path d=\"M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8 21h8\"/>", "<path d=\"M12 21s-7-5-7-11a7 7 0 0 1 14 0c0 6-7 11-7 11z\"/><circle cx=\"12\" cy=\"10\" r=\"2.5\"/>", "<path d=\"M7 4h10v5a5 5 0 0 1-10 0z\"/><path d=\"M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8\"/>"];
  /* icônes en pixels, façon borne d'arcade : une couleur par chapitre (couleur + ombre), pour savoir où l'on en est */
  const PIXM = ["000007e01e78381c300c60e663e6436246c267c66706300c381c1e7807e00000", "0000000007e01c38381c300c23c427e467e423c4318c381c1c380ff000000000", "000031c03ff03c383c08000c0004000420042004300c38181c3007e000000000", "0000000000001f807fe2403e483e5c325c32483e40367fe21f80000000000000", "000007e01e78381c300c6006603640624cc267866306300c381c1e7807e00000", "000008004be07f387f0c000c000410041804180c0c0c0e3803f0000000000000", "00000006000f000f00c6006000303ff83ff80030006000c00000000000000000", "00000000000000000c30000007e00c301838306c20c420842184000000000000", "000001000fe61c3e183e319c2180618460c42064300c101c1c3807f001000000", "00000000000003c006600660006000e001800180000001800180018000000000", "0000000000003ffc7ffe6006600660066006600667fe6ffc7800700000000000", "0000000000000000018003e006300c1c180e1006600e400c0000000000000000", "00000000006000f001b007e01ff07ffe601e401a601e3ffe0ff0000000000000", "000000001f383f7c336c316c31fc307c30403078307c300c3ffc1ff800000000", "000000000000007c007e024603c63fc63fc603c60246007e007c000000000000", "0000018007e006600c000c000ff01ff8300c300c300c300c300c1ff80ff00000", "000000001ff83ffc60066e066f7e6b066f766e367f0661063ffc3ffc00000000", "0000000000007ffe7ffe781e5c3a47e243c2400240027ffe7ffe000000000000", "00003e006300230023003700360016001b3c0dfe06e2030201e2007e00000000", "000006601ff83ffc642660067ffe6006600660066006600660043ffc0ff00000", "00000000018001803ffc7ffe6186718ef18ff18f0180018001801ff80ff00000", "0000003000f801cc008607860fcc180c301833f061c0600033801f000c000000", "0000000000003c3c3c3c0c30066003c001800180018001800180018001800000", "00000000000007e01c3013d837e8266824683048300800100030006000400000", "00000000002000303ff83ff800000000000000001ffc1ffc0c00040000000000", "00000ff00460066003c003c0066004200020006000c00380060004000ff00000", "0000000007e01c38381c300c24242004600423c4366c381c1c380ff000000000", "000000003fe07fe06060607c607e60666fe67ff671fe200e0000000000000000", "000001c00f600b780b7c1f6c3f6c3f6c300c300c300c18180c3007e000000000", "000003c006600660066006600660166816e81bd808100ff003c001800ff00000", "000007e00e70181811c833cc366c33cc33cc101818180c30066003c001800000", "00000ff00ff0381c781e381c381c0c30066003c001800180018000000ff00000"];
  const CHAP = n => n <= 7 ? ['#F0766F', '#A8322A'] : n <= 16 ? ['#4C7BEA', '#18388F'] : n <= 24 ? ['#2FAE79', '#17664A'] : ['#E9AE3C', '#94640F'];
  window.FRG_CHAP = CHAP;
  const pixD = h => { let d = ''; for (let y = 0; y < 16; y++){ const v = parseInt(h.substr(y * 4, 4), 16); let x = 0; while (x < 16){ if (v & (1 << (15 - x))){ let l = 1; while (x + l < 16 && (v & (1 << (15 - x - l)))) l++; d += `M${x} ${y}h${l}v1h-${l}z`; x += l; } else x++; } } return d; };
  const icoM = n => { const h = PIXM[n - 1]; if (!h) return ''; const [c, o] = CHAP(n), d = pixD(h);
    return `<svg class="pc-ico pc-pix" viewBox="-.5 -.5 17.5 17.5" shape-rendering="crispEdges" aria-hidden="true"><path d="${d}" fill="${o}" transform="translate(1 1)"/><path d="${d}" fill="${c}"/></svg>`; };
  /* icônes pixel 10 × 10, la même famille partout (entraînement, jeux, scores) */
  const PIX = {
    soleil: ['....yy....', '..yyyyyy..', '.yyyyyyyy.', 'yyyyyyyyyy', 'oooooooooo', '..........', 'bbbbbbbbbb', '.bbbbbbbb.', 'ssssssssss', 'ssssssssss'],
    radio: ['.......w..', '......w...', '.nnnnnnnnn', 'nkkknyyknn', 'nkbknnnknn', 'nkkkn.kkkn', 'nnnnnnnnnn', '..........', '..........', '..........'],
    gator: ['..........', '..........', '.g........', 'gGg.......', 'gyGgggggg.', 'gGGGGGGGGg', 'gwGwGGGGGg', '.ggggggggg', '.vvvvvvvvv', 'vvvvvvvvvv'],
    fusee: ['....rr....', '...rrrr...', '...wwww...', '...wbbw...', '...wwww...', '...wwww...', '..rwwwwr..', '..r.yy.r..', '....oo....', '....y.....'],
    feu: ['.y...p..g.', '..y.p..g..', 'y..ypg.g..', '.yy.p.gg..', '...ypg....', '..g.p.y...', '.g..p..y..', '....p.....', '....p.....', '....p.....'],
    courbe: ['..........', '..........', '.......rr.', '......r..r', 'bb...r....', '..b.r.....', '...rr.....', '..........', 'kkkkkkkkkk', '..........'],
    vol: ['..........', '...mmmm...', '..mMMMMm..', '.mMkMMMMm.', '.mMMMMMMmm', '..mMMMMm.m', '...m..m...', 'bbbbbbbbbb', '.bb.bb.bb.', '..........'],
    quiz: ['.wwwwww...', '.wkkkkw...', '.wwwwwwyy.', '.wkkkkwyy.', '.wwwwwwyy.', '.wkkwwwyy.', '.wwwwwwyy.', '...yyyyyy.', '...yyyyyy.', '..........'],
    accent: ['...nnnn...', '..nwwwwn..', '..nwwwwn..', '..nwwwwn..', '..nwwwwn..', '.n.nnnn.n.', '.n......n.', '..nn..nn..', '....nn....', '...nnnn...'],
    final: ['kk.ww.kk.w', 'kk.ww.kk.w', 'ww.kk.ww.k', 'ww.kk.ww.k', 'kk.ww.kk.w', 'kk.ww.kk.w', 'n.........', 'n.........', 'n.........', 'n.........'],
    trophee: ['.yyyyyyyy.', 'yyyyyyyyyy', 'y.yyyyyy.y', '.yyyyyyyy.', '..yyyyyy..', '...yyyy...', '....yy....', '....yy....', '..oooooo..', '..oooooo..'],
    pdf: ['.wwwww....', '.wwwwwr...', '.wkkkwrr..', '.wwwwwww..', '.wkkkkkw..', '.wwwwwww..', '.rrrrrrw..', '.rwrwrrw..', '.rrrrrrw..', '.wwwwwww..']
  };
  const PIXC = { y: '#FFD25A', o: '#E0A526', b: '#2F7FBF', s: '#F2D7A0', w: '#F4EEDC', n: '#2A3F73', k: '#0A1330', g: '#2F5D2A', G: '#4F8A4B', v: '#4E7344', r: '#E3191F', p: '#F0766F', m: '#6B7F8E', M: '#9DB0BD' };
  const pix = (nom, t = 28) => `<svg class="pix" viewBox="0 0 10 10" width="${t}" height="${t}" shape-rendering="crispEdges" aria-hidden="true">${(PIX[nom] || PIX.quiz).map((l, j) => [...l].map((c, i) => c !== '.' && PIXC[c] ? `<rect x="${i}" y="${j}" width="1" height="1" fill="${PIXC[c]}"/>` : '').join('')).join('')}</svg>`;
  const EXOS = [['sprint', 'soleil', 'Sprint des codes', 'Miami Beach · 60 s chrono, combos x2'], ['dictee', 'radio', 'Radio Key West', 'Key West · le message vocal, verbe par verbe'], ['chasse', 'gator', 'Chasse aux alligators', 'Everglades · trouvez le mot faux, réparez-le'], ['chantier', 'fusee', 'Assemblez la fusée', 'Cap Canaveral · une phrase, un étage'], ['cartes', 'feu', 'Nuit des cartes', 'Orlando · les règles en cartes']];
  const score = (k, x) => x ? `${pix('trophee', 14)} ${x.best}${k === 'sprint' ? ' pts' : k === 'cartes' ? ' cartes' : ' %'}` : 'Nouveau';
  /* les jeux se débloquent un par un : le premier au bout de 2 semaines, puis toutes les 2 semaines (Frenglais : après les 32 modules) */
  const JEUX_ORDRE = { 'vol.html': 1, 'quiz.html': 2, 'accent.html': 3 };
  const ouvJeu = h => JEUX_ORDRE[h] ? depart() + JEUX_ORDRE[h] * 14 * JOUR : 0;
  function rangEntr(n, s, o, flou){
    const r = $('#en-piste'), t = $('#en-titre'); if (!r) return;
    const dispo = o && MODULES_EN_LIGNE, S = (lire('frg-entr2', {})[n]) || {}, F = ETAT.formule;
    if (t) t.textContent = 'Module ' + n + ' · ' + TITRES[n - 1];
    const bloque = flou ? 'Réservé aux élèves' : !F ? 'Avec la formation' : !o ? esc(s.txt) : 'À la mise en ligne';
    /* les tuiles (le lamantin IA est en haut, dans « Votre parcours ») : icône + nom, le score dans l'icône, les règles derrière « + » */
    const maxi = o => Math.max(0, ...Object.values(o || {}).map(v => +v || 0));
    const tuile = (k, i, nom, regle, lien, sc, verrou) => `<div class="en-c${verrou ? ' en-off' : ''}" role="listitem">${verrou ? `<span class="en-lien">` : `<a class="en-lien" href="${lien}">`}<span class="en-i" aria-hidden="true">${pix(i, 30)}${sc ? `<span class="en-sc">${sc}</span>` : ''}${verrou ? `<span class="en-cad">${CADENAS}</span>` : ''}</span><b>${nom}</b>${verrou ? '</span>' : '</a>'}<button class="en-plus" type="button" aria-label="Les règles : ${nom}" aria-expanded="false">+</button><p class="en-regle" hidden>${regle}${verrou ? `<br><small>${CADENAS} ${verrou}</small>` : ''}</p></div>`;
    const acc = lire('frg-accent', {});
    r.innerHTML = EXOS.map(([k, i, nom, d]) => { const x = S[k]; return tuile(k, i, nom, d, `entrainement.html?n=${n}&x=${k}`, x ? x.best + (k === 'sprint' ? '' : k === 'cartes' ? '' : '%') : '', dispo ? '' : bloque); }).join('')
      + [['courbe/', 'courbe', 'Courbe du jour', 'Une phrase en français tirée de l\'actualité, chaque jour. Trouvez la bonne traduction.', true, ''], ['vol.html', 'vol', 'Lamantin volant', 'Faites voler le lamantin à travers la bonne traduction. Une erreur : on recommence.', false, maxi(lire('frg-vol', {}))], ['quiz.html', 'quiz', 'Le quiz', 'Une définition, quatre réponses. Les erreurs reviennent.', false, maxi(lire('frg-quiz-rec', {}))], ['accent.html', 'accent', 'Pont des sons', 'Traversez le pont en prononçant : th, i court, r, h, -ed, w.', false, acc.grand || ''], ['frenglais.html', 'final', 'Frenglais', 'Le niveau final : tapez en français et en anglais, de plus en plus vite. Débloqué après les 32 modules.', false, +lire('frg-frenglais-record', 0) || '']]
        .map(([h, i, nom, d, libre, sc]) => { const dj = ouvJeu(h), tard = !libre && dj && Date.now() < dj;
          return tuile(i, i, nom, d, h, sc || '', (libre || (F && MODULES_EN_LIGNE && !tard)) ? '' : (!F ? 'Avec la formation' : tard ? 'Débloqué le ' + dfr(dj, { day: 'numeric', month: 'long' }) : 'À la mise en ligne')); }).join('');
    r.querySelectorAll('.en-plus').forEach(b => b.addEventListener('click', () => { const p = b.nextElementSibling, ouvrir = p.hidden; r.querySelectorAll('.en-regle').forEach(x => { x.hidden = true; x.previousElementSibling.setAttribute('aria-expanded', 'false'); x.previousElementSibling.textContent = '+'; }); p.hidden = !ouvrir; b.setAttribute('aria-expanded', ouvrir); b.textContent = ouvrir ? '×' : '+'; }));
    const c = $('#en-compte'); if (c) { const tot = Object.values(lire('frg-entr2', {})).reduce((a, m) => a + Object.values(m).reduce((b, e) => b + (e.n || 0), 0), 0); c.textContent = tot ? tot + ' partie' + (tot > 1 ? 's' : '') + ' jouée' + (tot > 1 ? 's' : '') : '5 exercices par module'; }
  }
  /* ---------- tuile « Entraînement », à part des modules : une bulle compte les exercices à faire en attendant la suite ---------- */
  function tuileEntr(){
    const t = $('#en-tuile'); if (!t) return;
    if (!ETAT.formule || !MODULES_EN_LIGNE) { t.hidden = true; return; }
    const S = lire('frg-entr2', {}), ouverts = []; for (let n = 1; n <= maxModule(); n++) if (ouvert(n)) ouverts.push(n);
    const reste = n => EXOS.filter(([k]) => !(S[n] && S[n][k])).length, total = ouverts.reduce((a, n) => a + reste(n), 0);
    const cible = ouverts.find(n => reste(n)) || ouverts[ouverts.length - 1] || 1;
    let prochain = null; for (let n = 1; n <= maxModule(); n++) if (statut(n).k === 'date') { prochain = n; break; }
    t.hidden = false; t.href = 'entrainement.html?n=' + cible;
    t.querySelector('.en-bulle').textContent = total > 99 ? '99+' : total; t.querySelector('.en-bulle').hidden = !total;
    t.classList.toggle('en-tout-fait', !total && ouverts.length > 0);
    t.querySelector('.en-t-sous').textContent = total
      ? total + ' exercice' + (total > 1 ? 's' : '') + ' à faire' + (prochain ? ' en attendant le module ' + prochain + ' (' + dfr(sortie(prochain), { weekday: 'long', day: 'numeric', month: 'long' }) + ')' : '') + '. On commence par le module ' + cible + '.'
      : ouverts.length ? 'Tout est fait. Battez vos records, ou écrivez au lamantin.' : 'Les exercices s’ouvrent avec vos modules. En attendant, le lamantin corrige déjà vos phrases.';
    t.setAttribute('aria-label', 'Entraînement : ' + t.querySelector('.en-t-sous').textContent);
  }
  /* curseur sous les tuiles */
  const cur = $('#pc-curseur');
  function majCurseur(){ if (cur && choisi) { cur.value = choisi; cur.style.setProperty('--p', ((choisi - 1) / 31 * 100) + '%'); } }
  if (cur) cur.addEventListener('input', () => selectionner(+cur.value));
  piste.addEventListener('click', e => { const t = e.target.closest('.pc-tuile'); if (t) selectionner(+t.dataset.n); });
  const fl = (d) => () => piste.scrollBy({ left: d * piste.clientWidth * .8, behavior: 'smooth' });
  if ($('#pc-g')) $('#pc-g').addEventListener('click', fl(-1)); if ($('#pc-d')) $('#pc-d').addEventListener('click', fl(1));

  /* ---------- micro-entraînements ---------- */
  const DONNEES = {};
  function charger(n){ if (DONNEES[n]) return Promise.resolve(DONNEES[n]);
    return new Promise((ok, ko) => { const s = document.createElement('script'), avant = window.MOD;
      s.src = n === 1 ? 'module-1-data.js' : 'modules/m' + String(n).padStart(2, '0') + '.js';
      s.onload = () => { const D = n === 1 ? window.M1 : window.MOD; window.MOD = avant; s.remove(); if (!D) return ko(); DONNEES[n] = D; ok(D); };
      s.onerror = () => { s.remove(); ko(); }; document.head.append(s); }); }
  const melange = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const secteur = () => { const p = lire('frg-profil', {}); return p.secteur || 'pro'; };
  const nu = t => String(t).replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
  const codeM1 = c => { const [x, , inv] = c.split('|'); return x === 's' ? '-s' : inv ? '-ed (invisible)' : '-ed'; };
  function noterFait(n, k){ const F = lire('frg-entr', {}); F[n] = F[n] || {}; F[n][k] = (F[n][k] || 0) + 1; ecrire('frg-entr', F);
    const b = document.querySelector(`[data-e="${k}"] b`); if (b && !b.querySelector('i')) b.insertAdjacentHTML('beforeend', ' <i>✓</i>'); }
  /* difficulté : les modules avancés partent plus haut, et chaque entraînement monte d'un niveau toutes les 3 réussites */
  const niveau = (n, k) => Math.min(3, (n <= 8 ? 1 : n <= 16 ? 2 : 3) + Math.floor((((lire('frg-entr', {})[n] || {})[k]) || 0) / 3));
  const NIV = ['', 'Niveau 1', 'Niveau 2 · plus dur', 'Niveau 3 · expert'];
  async function entrainer(n, k){
    const z = $('#pc-ex'); z.innerHTML = '<p class="pc-ex-msg">Chargement…</p>'; z.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    let D; try { D = await charger(n); } catch (e) { z.innerHTML = '<p class="pc-ex-msg">Cet entraînement arrive avec la mise en ligne du module.</p>'; return; }
    ({ ecrit, ecoute, oral, lecture })[k](z, D, n);
  }
  function quiz(z, items, n, k, titre){
    let i = 0, bons = 0;
    const lv = niveau(n, k);
    const suivant = () => { if (i >= items.length) { z.innerHTML = `<div class="pc-ex-fin"><b>${bons} / ${items.length}</b> ${bons === items.length ? 'Sans faute.' : bons >= items.length / 2 ? 'Bien. Refaites-le demain : les questions changeront.' : 'À reprendre : relisez les cartes du module, puis recommencez.'}</div><button type="button" class="pc-lien" data-r>Recommencer</button>`; noterFait(n, k); if (niveau(n, k) > lv) z.insertAdjacentHTML('afterbegin', `<p class="pc-monte">↑ ${NIV[niveau(n, k)]} débloqué : la prochaine fois, ce sera plus exigeant.</p>`); z.querySelector('[data-r]').onclick = () => entrainer(n, k); return; }
      const q = items[i]; z.innerHTML = `<p class="pc-ex-titre">${titre} · ${NIV[lv]} · ${i + 1} / ${items.length}</p><p class="pc-ex-q">${q.q}</p><div class="pc-ex-ch">${q.ch.map((c, j) => `<button type="button" data-j="${j}">${c}</button>`).join('')}</div><p class="pc-ex-r"></p>`;
      z.querySelectorAll('[data-j]').forEach(b => b.addEventListener('click', () => { if (z.dataset.r === String(i)) return; z.dataset.r = String(i); const ok = +b.dataset.j === q.b; if (ok) bons++;
        b.classList.add(ok ? 'ok' : 'ko'); if (!ok) z.querySelector(`[data-j="${q.b}"]`).classList.add('ok');
        z.querySelector('.pc-ex-r').innerHTML = (ok ? '<b>Exact.</b> ' : '<b>Pas tout à fait.</b> ') + (q.ex || '');
        setTimeout(() => { i++; suivant(); }, ok ? 1100 : 2600); })); };
    z.dataset.r = ''; suivant();
  }
  const qcm = (q, bon, faux, ex) => { const ch = melange([bon, ...faux]); return { q, ch: ch.map(esc), b: ch.indexOf(bon), ex }; };
  const sansBalises = t => String(t).replace(/<[^>]+>/g, '');
  /* fausses réponses crédibles : les erreurs que font vraiment les élèves (code en trop, code oublié, mauvais auxiliaire) */
  function variantes(bon){
    const m = String(bon).split(' '), d = m.length - 1, der = m[d], V = new Set();
    const sw = { "don't": ["doesn't", "didn't"], "doesn't": ["don't", "didn't"], "didn't": ["don't", "doesn't"], is: ['are', 'was'], are: ['is', 'were'], was: ['were', 'is'], were: ['was', 'are'], has: ['have', 'had'], have: ['has', 'had'], had: ['has', 'have'], do: ['does', 'did'], does: ['do', 'did'], did: ['do', 'does'], will: ['would', 'shall'], would: ['will', 'should'], can: ['could', 'may'], could: ['can', 'might'] };
    m.forEach((w, i) => (sw[w.toLowerCase()] || []).forEach(x => V.add([...m.slice(0, i), x, ...m.slice(i + 1)].join(' '))));
    const avec = w => [...m.slice(0, d), w].join(' '), connu = !!sw[der.toLowerCase()];
    if (connu) {}
    else if (/ed$/.test(der)) { const b0 = /ied$/.test(der) ? der.replace(/ied$/, 'y') : /([zvcgsu])ed$/.test(der) ? der.replace(/ed$/, 'e') : der.replace(/ed$/, ''); V.add(avec(b0)); V.add(avec(b0.replace(/y$/, 'ie') + 's')); }
    else if (/s$/.test(der) && der.length > 3) { const b0 = der.replace(/(sh|ch|x|o)es$/, '$1').replace(/ies$/, 'y').replace(/([^s])s$/, '$1'); V.add(avec(b0)); V.add(avec(b0 + (b0.endsWith('e') ? 'd' : 'ed'))); }
    else if (/ing$/.test(der)) V.add([...m.slice(0, d), der.replace(/ing$/, '')].join(' '));
    else if (/^[a-z]+$/.test(der) && m.length > 1) { V.add([...m.slice(0, d), der + (der.endsWith('e') ? 'd' : 'ed')].join(' ')); V.add([...m.slice(0, d), der + 's'].join(' ')); }
    else if (m.length === 1 && !connu) { V.add(der + 's'); V.add(der + (der.endsWith('e') ? 'd' : 'ed')); }
    V.delete(bon); return melange([...V]);
  }
  /* questions de base : les exercices du module */
  function base(D, n){
    if (n === 1) return D.erreurs.map(([f, ch, b, ex]) => ({ q: `Quelle est la bonne version de « <em>${esc(f)}</em> » ?`, ch: ch.map(esc), b, ex }))
      .concat((D.courbe[secteur()] || D.courbe.pro).map(([p, t]) => ({ q: `<em>${esc(p)}</em> Sur la Courbe ?`, ch: ['T0 (-s)', 'T-1 (-ed)'], b: t ? 1 : 0, ex: t ? 'Le verbe porte -ed, visible ou invisible.' : 'Base ou -s : on est à T0.' })));
    const P = (D.controle || []).map(([q, ch, b, ex]) => ({ q, ch, b, ex }));
    for (const c of D.code || []) {
      if (c.t === 'qcm') P.push({ q: esc(c.q), ch: c.ch.map(esc), b: c.b, ex: c.ex });
      if (c.t === 'erreur' && !c.vraie) { const idx = melange([c.faux, ...melange(c.mots.map((m, j) => j).filter(j => j !== c.faux && /[a-z]/i.test(c.mots[j]))).slice(0, 2)]);
        P.push({ q: `Quel mot est faux ? « <em>${esc(c.mots.join(' '))}</em> »`, ch: idx.map(j => esc(c.mots[j].replace(/[.,?!]$/, ''))), b: idx.indexOf(c.faux), ex: (c.bon ? 'Il fallait <b>' + esc(c.bon) + '</b>. ' : '') + (c.ex || '') }); }
      if (c.t === 'trou') { const faux = variantes(c.bon[0]).slice(0, 2); if (faux.length < 2) faux.push(...D.code.filter(x => x.t === 'trou' && x !== c).map(x => x.bon[0]).slice(0, 2 - faux.length)); if (faux.length < 2) continue;
        P.push(qcm(`<em>${esc(c.avant)} ___ ${esc(c.apres)}</em>`, c.bon[0], faux, c.ex)); } }
    return P;
  }
  /* niveau 2 : vocabulaire et repères */
  function vocab(D, n){
    const P = [], S = secteur();
    if (n === 1) { const A = D.phrasesA[S] || D.phrasesA.pro, paires = A.flatMap(a => [[a[0], a[3]], [a[1], a[4]], [a[2], a[5]]]);
      paires.forEach(([en, fr]) => P.push(qcm(`Que veut dire « <em>${esc(en)}</em> » ?`, fr, melange(paires.filter(p => p[1] !== fr)).slice(0, 2).map(p => p[1]), '')));
      return P; }
    const M = D.machine; if (M && M.comp && M.frc) { const ks = Object.keys(M.comp); ks.forEach(k => P.push(qcm(`Que veut dire « <em>${esc(M.comp[k])}</em> » ?`, M.frc[k], melange(ks.filter(x => x !== k && M.frc[x] !== M.frc[k])).slice(0, 2).map(x => M.frc[x]), ''))); }
    (D.code || []).filter(c => c.t === 'traduire').forEach((c, _, T) => { const autres = T.filter(x => x !== c).map(x => x.bon[0]); if (autres.length >= 1) P.push(qcm(`Comment dire « ${esc(c.fr)} » ?`, c.bon[0], melange(autres).slice(0, 2), c.ok || '')); });
    (D.placer || []).forEach(([p, t, code, ex]) => P.push(qcm(`<em>${esc(p)}</em> Sur la Courbe ?`, t, ['T-2', 'T-1', 'T0', 'T+1'].filter(x => x !== t).slice(0, 2), ex)));
    return P;
  }
  /* niveau 3 : nuances, différences, pièges */
  function nuances(D, n){
    const P = [];
    if (n === 1) { const B = D.bilingue[secteur()] || D.bilingue.pro, [fr, en, piege] = B, v = piege.split(' ').pop(), faux = en.replace(v, piege);
      if (faux !== en) P.push(qcm(`« ${esc(fr)} » : la version la plus naturelle ?`, en, [faux], 'Moment précis et terminé : le prétérit, le code -ed.'));
      return P.concat(base(D, n).slice(0, 3)); }
    for (const x of [D.catch, D.nobody].filter(Boolean)) { const m = /<s>(.*?)<\/s>\s*→\s*(.*?)(<\/em>|$)/.exec(x[2] || ''); if (m) P.push(qcm(`${esc(x[0])} : laquelle est juste ?`, sansBalises(m[2]).trim(), [sansBalises(m[1]).trim()], esc(x[1]))); }
    const C = D.cartes || []; C.forEach(c => { const autres = C.filter(x => x !== c); if (autres.length >= 2) P.push(qcm(`Quelle règle correspond à « ${esc(sansBalises(c[0]))} » ?`, sansBalises(c[1]).slice(0, 140), melange(autres).slice(0, 2).map(x => sansBalises(x[1]).slice(0, 140)), '')); });
    if (D.mecanisme) P.push(qcm(`Vrai ou faux : ${esc(sansBalises(D.mecanisme[0]))}, c'est surtout un réflexe à remplacer, pas un manque de niveau.`, 'Vrai', ['Faux'], esc(sansBalises(D.mecanisme[1]))));
    return P;
  }
  function ecrit(z, D, n){
    const lv = niveau(n, 'ecrit'), B = melange(base(D, n)), V = melange(vocab(D, n)), N = melange(nuances(D, n));
    const items = lv === 1 ? B.slice(0, 4) : lv === 2 ? melange([...B.slice(0, 3), ...V.slice(0, 3)]) : melange([...B.slice(0, 2), ...V.slice(0, 3), ...N.slice(0, 3)]);
    quiz(z, items.length ? items : B.slice(0, 4), n, 'ecrit', 'Écrit');
  }
  function lecteur(z, src, lignes, apres, max = 99){
    const a = new Audio(src), btn = z.querySelector('[data-lire]'); let nb = 0;
    btn.onclick = () => { nb++; btn.disabled = true; a.playbackRate = max === 1 ? 1.05 : 1; a.currentTime = 0; a.play().then(() => {}).catch(tts); };
    a.onended = () => { btn.disabled = nb >= max; if (nb >= max) btn.textContent = 'Écoute unique terminée'; apres(); };
    a.onerror = tts;
    function tts(){ if (!('speechSynthesis' in window)) { btn.disabled = false; apres(); return; } speechSynthesis.cancel(); let k = 0;
      const un = () => { if (k >= lignes.length) { btn.disabled = false; apres(); return; } const u = new SpeechSynthesisUtterance(nu(lignes[k][1])); u.lang = 'en-US'; u.rate = .92; u.onend = () => { k++; setTimeout(un, 200); }; speechSynthesis.speak(u); }; un(); }
  }
  function codesDialogue(L, n){ const V = []; L.forEach(([, t]) => t.replace(/\{([^|}]+)\|([^}]+)\}/g, (m, mot, c) => { V.push({ mot, c: n === 1 ? codeM1(c) : c.trim() }); return m; })); return V; }
  function questionsCodes(V, nb){ const codes = [...new Set(V.map(v => v.c).concat(['-s', '-ed', 'be + -ing']))];
    return melange(V).slice(0, nb).map(v => qcm(`<b>${esc(v.mot)}</b> porte quel code ?`, v.c, melange(codes.filter(c => c !== v.c)).slice(0, 2), '')); }
  function ecoute(z, D, n){
    const lv = niveau(n, 'ecoute'), E = n === 1 ? (D.ecoute[secteur()] || D.ecoute.pro) : D.ecoute, src = n === 1 ? 'audio/m01-ecoute-' + (D.ecoute[secteur()] ? secteur() : 'pro') + '.mp3' : 'audio/m' + String(n).padStart(2, '0') + '-ecoute.mp3';
    if (!E || !E.q) { z.innerHTML = '<p class="pc-ex-msg">Pas d\'écoute dans ce module.</p>'; return; }
    const consigne = lv === 3 ? 'Une seule écoute, comme dans la vraie vie. Concentrez-vous sur les verbes.' : lv === 2 ? 'Écoutez, puis répondez : le sens, et le code de deux verbes entendus.' : (E.intro ? esc(E.intro) : 'Écoutez le dialogue, sans le texte.');
    z.innerHTML = `<p class="pc-ex-titre">Écoute · ${NIV[lv]}</p><p class="pc-ex-q">${consigne}</p><button type="button" class="btn btn-bleu" data-lire>▶ Écouter</button> <button type="button" class="pc-lien" data-go>J'ai écouté, aux questions</button>`;
    const sens = melange(E.q).map(([q, ch, b]) => { const o = melange(ch.map((c, j) => ({ c, j }))); return { q: esc(q), ch: o.map(x => esc(x.c)), b: o.findIndex(x => x.j === b), ex: '' }; });
    const items = lv === 1 ? sens.slice(0, 2) : [...sens.slice(0, lv === 2 ? 2 : 3), ...questionsCodes(codesDialogue(E.lignes, n), lv === 2 ? 2 : 3)];
    lecteur(z, src, E.lignes, () => {}, lv === 3 ? 1 : 99); z.querySelector('[data-go]').onclick = () => quiz(z, items, n, 'ecoute', 'Écoute');
  }
  function oral(z, D, n){
    const consigne = n === 1 ? 'Présentez-vous à voix haute : qui vous êtes, ce que vous faites au travail (T0), une chose que vous aimez, et une chose faite hier (T-1).' : (D.fluidite || 'Parlez du thème du module, à voix haute.').replace(/en 90 secondes, puis 60, puis 45\.?/i, 'pendant 60 secondes.');
    const lv = niveau(n, 'oral'), duree = [0, 60, 90, 120][lv], defi = ['', '', 'Défi : au moins une négation, une question, et un verbe à code invisible.', 'Défi : sans pause et sans rien lire ; reliez vos idées avec but, because, so, although.'][lv];
    z.innerHTML = `<p class="pc-ex-titre">Oral · ${NIV[lv]} · ${duree} secondes</p><p class="pc-ex-q">${esc(consigne.replace('60 secondes', duree + ' secondes'))}</p>${defi ? `<p class="pc-defi">${defi}</p>` : ''}<div class="pc-oral"><span class="pc-chrono">${duree}</span><button type="button" class="btn btn-bleu" data-go>Lancer le chrono</button></div><p class="pc-ex-r doux">Si vous l'autorisez, votre voix est enregistrée sur cet appareil seulement, pour vous réécouter.</p><div data-audio></div>`;
    const go = z.querySelector('[data-go]'), ch = z.querySelector('.pc-chrono');
    go.onclick = async () => { go.disabled = true; let rec = null, bouts = [], flux = null;
      try { flux = await navigator.mediaDevices.getUserMedia({ audio: true }); rec = new MediaRecorder(flux); rec.ondataavailable = e => bouts.push(e.data); rec.start(); } catch (e) {}
      let t = duree; ch.textContent = t; const it = setInterval(() => { t--; ch.textContent = t; if (t <= 0) { clearInterval(it); fin(); } }, 1000);
      function fin(){ ch.textContent = '✓'; go.hidden = true;
        const apres = () => { z.querySelector('.pc-ex-r').innerHTML = '<b>Bravo.</b> Réécoutez-vous : chaque verbe porte-t-il le bon code ? Demain, refaites-le sans pause.'; noterFait(n, 'oral'); };
        if (rec) { rec.onstop = () => { const u = URL.createObjectURL(new Blob(bouts, { type: bouts[0] && bouts[0].type || 'audio/webm' })); z.querySelector('[data-audio]').innerHTML = `<audio controls src="${u}"></audio>`; flux.getTracks().forEach(x => x.stop()); apres(); }; rec.stop(); } else apres(); } };
  }
  function lecture(z, D, n){
    const lv = niveau(n, 'lecture'), E = n === 1 ? (D.ecoute[secteur()] || D.ecoute.pro) : (D.ecoute || {}), L = E.lignes || [];
    const V = codesDialogue(L, n); if (V.length < 3) { z.innerHTML = '<p class="pc-ex-msg">Pas de lecture dans ce module.</p>'; return; }
    const texte = (n === 1 && lv === 3 && D.essorage) ? (() => { const es = D.essorage[secteur()] || D.essorage.pro; return `<p><b>${esc(es[0])}</b> ${esc(nu(es[1]))}</p>`; })() : L.map(([q, t]) => `<p><b>${esc(q)}</b> ${esc(nu(t))}</p>`).join('');
    const quiDit = melange(L.filter(l => nu(l[1]).length > 18)).slice(0, 2).map(([q, t]) => qcm(`Qui dit « <em>${esc(nu(t).slice(0, 70))}${nu(t).length > 70 ? '…' : ''}</em> » ?`, q, [...new Set(L.map(l => l[0]).filter(x => x !== q))].slice(0, 2), ''));
    const sens = (E.q || []).map(([q, ch, b]) => qcm(esc(q), ch[b], ch.filter((_, j) => j !== b), ''));
    const VV = (n === 1 && lv === 3 && D.essorage) ? codesDialogue([['', (D.essorage[secteur()] || D.essorage.pro)[1]]], 1) : V;
    const items = lv === 1 ? questionsCodes(VV, 4) : lv === 2 ? melange([...questionsCodes(VV, 3), ...quiDit.slice(0, 1), ...melange(sens).slice(0, 2)]) : melange([...questionsCodes(VV, 4), ...quiDit, ...melange(sens).slice(0, 2)]);
    z.innerHTML = `<p class="pc-ex-titre">Lecture · ${NIV[lv]}</p><div class="pc-texte">${texte}</div><div data-q><button type="button" class="btn btn-bleu" data-go>J'ai lu, aux questions</button></div>`;
    z.querySelector('[data-go]').onclick = () => quiz(z.querySelector('[data-q]'), items.filter(x => x.b >= 0), n, 'lecture', 'Lecture');
  }

  /* l'espace élève appelle FRGParcours.maj(session) à la connexion et à la déconnexion */
  window.FRGParcours = { pix, EXOS, etat: () => ({ formule: ETAT.formule, enLigne: !!MODULES_EN_LIGNE }), valides: () => Array.from({ length: 32 }, (_, i) => i + 1).filter(valide),
    maj: r => { ETAT = { formule: r ? r.formule : (AP ? AP.formule : null), prog: (r && r.prog) || {}, testeur: !!(r && r.testeur) }; DEBUT = r && r.debut ? +r.debut : null; ecrire('frg-depart', depart()); choisi = null; dessiner(); document.dispatchEvent(new CustomEvent('frg-parcours', { detail: r })); } };
  dessiner();
})();
