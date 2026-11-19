/* Espace élève · le parcours : tuiles qui défilent (curseur), déblocage « module validé + date de sortie »,
   et quatre micro-entraînements optionnels par module (écrit, écoute, oral, lecture), derrière le bouton +. */
(function(){
  'use strict';
  const TITRES = ['Repères et codes',"T0, le temps le plus simple","T-1, toujours simple","BE + -ING","HAVE + -EN","T-2, le passé dans le passé","T+1, l'éléphant dans la pièce","Les modaux","Empiler les briques","Poser des questions","Spit it : dites-le","Toute la Courbe","Les quatre couteaux suisses","Les verbes à particule","Le verbe choisit sa préposition","Ne plus bloquer","Se présenter pour de vrai","Écrire un e-mail","Téléphone et visio","Chiffres, dates, heures, prix","Comparer et décrire","Relier ses idées","Si…","L'anglais réel","Le passif","Les habitudes passées","Les regrets","Rapporter des paroles","Convaincre","Prendre la parole","Continuer seul","Le grand oral"];
  /* calendrier de sortie : modules 1 et 2 au lancement, puis deux par semaine ; les 8 modules avancés ensuite. À régler au lancement. */
  const AP = window.FRG_APERCU || null;
  const LANCEMENT = AP ? Date.now() - 864e5 * 21 : Date.parse('2026-12-01T00:00:00+01:00');
  const sortie = n => LANCEMENT + Math.floor((n - 1) / 2) * 7 * 864e5 + (n > 24 ? 14 * 864e5 : 0);
  const MODULES_EN_LIGNE = !!AP;   /* passe à true quand les pages des modules sont publiées */
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
    if (Date.now() < sortie(n)) return { k: 'date', txt: 'Sortie le ' + new Date(sortie(n)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) };
    if (n > 1 && !valide(n - 1)) return { k: 'avant', txt: 'Validez le module ' + (n - 1) };
    return { k: 'ouvert', txt: lire('frg-m' + n + '-pct', 0) > 0 ? 'Reprendre' : 'À faire' };
  }
  const ouvert = n => ['ok', 'ouvert'].includes(statut(n).k);
  const lien = n => n === 1 ? 'module-1.html' : 'module.html?n=' + n;
  const CADENAS = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

  function dessiner(){
    piste.querySelectorAll('.pc-tuile').forEach(x => x.remove());
    for (let n = 1; n <= 32; n++) { const s = statut(n), t = document.createElement('button'); t.type = 'button';
      t.className = 'tb-module pc-tuile pc-' + s.k + (n > 24 ? ' pc-avance' : ''); t.dataset.n = n; t.setAttribute('role', 'listitem');
      const pct = s.k === 'ouvert' ? lire('frg-m' + n + '-pct', 0) : s.k === 'ok' ? 100 : 0;
      t.innerHTML = `${n > 24 ? '<span class="tb-etiq sig">Signature</span>' : ''}<div class="tb-num">${String(n).padStart(2, '0')}</div>${['ok', 'ouvert'].includes(s.k) ? '' : `<span class="tb-cadenas" aria-label="Verrouillé">${CADENAS}</span>`}
        <div class="tb-corps"><strong>${esc(TITRES[n - 1])}</strong><span class="pc-etat">${s.k === 'ok' ? '✓ ' : ''}${esc(s.txt)}</span>${pct ? `<div class="tb-mini"><i style="width:${pct}%"></i></div>` : ''}</div>`;
      piste.append(t); }
    const nb = Array.from({ length: maxModule() }, (_, i) => i + 1).filter(valide).length;
    const r = $('#pc-compte'); if (r) r.textContent = ETAT.formule ? nb + ' / ' + maxModule() + ' validés' : '24 modules · 32 avec Signature';
    if (choisi == null) { let c = 1; for (let n = 1; n <= maxModule(); n++) if (statut(n).k === 'ouvert') { c = n; break; } choisi = ETAT.formule ? c : 1; }
    selectionner(choisi, false); majCurseur();
  }
  function selectionner(n, defiler = true){
    choisi = n; piste.querySelectorAll('.pc-tuile').forEach(t => t.classList.toggle('pc-choisi', +t.dataset.n === n));
    const t = piste.querySelector(`.pc-tuile[data-n="${n}"]`); if (t) requestAnimationFrame(() => piste.scrollTo({ left: t.offsetLeft - (piste.clientWidth - t.offsetWidth) / 2, behavior: defiler ? 'smooth' : 'auto' }));
    const s = statut(n), o = ouvert(n), d = $('#pc-detail'); if (!d) return;
    const fait = lire('frg-entr', {})[n] || {};
    d.innerHTML = `<div class="pc-d-tete"><div><p class="pc-d-num">${n > 24 ? 'Module avancé · Signature' : 'Module ' + n + ' / 24'}</p><h3>${esc(TITRES[n - 1])}</h3><p class="pc-d-etat pc-e-${s.k}">${s.k === 'ok' ? '✓ ' : ''}${esc(s.txt)}</p></div>
      <div class="pc-d-actions">${o && MODULES_EN_LIGNE ? `<a class="btn btn-bleu" href="${lien(n)}">${s.k === 'ok' ? 'Revoir le module' : s.txt === 'Reprendre' ? 'Reprendre' : 'Commencer'}</a>` : `<span class="pc-d-verrou">${CADENAS} ${o ? 'Ouverture à la mise en ligne' : esc(s.txt)}</span>`}
      <button type="button" class="pc-plus" aria-expanded="false" aria-controls="pc-entr" ${o ? '' : 'disabled'} title="${o ? 'Micro-entraînements' : 'Disponible quand le module est ouvert'}">+ <span>S'entraîner</span></button></div></div>
      <div class="pc-entr" id="pc-entr" hidden>
        <p class="pc-entr-sous">Facultatif, 2 à 3 minutes chacun. Refaites-les autant que vous voulez : les questions changent.</p>
        <div class="pc-entr-grille">${[['ecrit', 'Écrit', 'Quatre questions tirées du module'], ['ecoute', 'Écoute', 'Le dialogue, puis deux questions'], ['oral', 'Oral', '60 secondes, à voix haute'], ['lecture', 'Lecture', 'Lisez, trouvez le code des verbes']].map(([k, l, s2]) =>
          `<button type="button" class="pc-entr-c" data-e="${k}"><b>${l}${fait[k] ? ' <i>✓</i>' : ''}</b><span>${s2}</span></button>`).join('')}</div>
        <div class="pc-ex" id="pc-ex"></div></div>`;
    const plus = d.querySelector('.pc-plus'), box = d.querySelector('#pc-entr');
    plus.addEventListener('click', () => { const ouvre = box.hidden; box.hidden = !ouvre; plus.setAttribute('aria-expanded', ouvre); plus.classList.toggle('on', ouvre); });
    d.querySelectorAll('[data-e]').forEach(b => b.addEventListener('click', () => entrainer(n, b.dataset.e)));
    majCurseur();
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
  async function entrainer(n, k){
    const z = $('#pc-ex'); z.innerHTML = '<p class="pc-ex-msg">Chargement…</p>'; z.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    let D; try { D = await charger(n); } catch (e) { z.innerHTML = '<p class="pc-ex-msg">Cet entraînement arrive avec la mise en ligne du module.</p>'; return; }
    ({ ecrit, ecoute, oral, lecture })[k](z, D, n);
  }
  function quiz(z, items, n, k, titre){
    let i = 0, bons = 0;
    const suivant = () => { if (i >= items.length) { z.innerHTML = `<div class="pc-ex-fin"><b>${bons} / ${items.length}</b> ${bons === items.length ? 'Sans faute.' : bons >= items.length / 2 ? 'Bien. Refaites-le demain : les questions changeront.' : 'À reprendre : relisez les cartes du module, puis recommencez.'}</div><button type="button" class="pc-lien" data-r>Recommencer</button>`; noterFait(n, k); z.querySelector('[data-r]').onclick = () => entrainer(n, k); return; }
      const q = items[i]; z.innerHTML = `<p class="pc-ex-titre">${titre} · ${i + 1} / ${items.length}</p><p class="pc-ex-q">${q.q}</p><div class="pc-ex-ch">${q.ch.map((c, j) => `<button type="button" data-j="${j}">${c}</button>`).join('')}</div><p class="pc-ex-r"></p>`;
      z.querySelectorAll('[data-j]').forEach(b => b.addEventListener('click', () => { if (z.dataset.r === String(i)) return; z.dataset.r = String(i); const ok = +b.dataset.j === q.b; if (ok) bons++;
        b.classList.add(ok ? 'ok' : 'ko'); if (!ok) z.querySelector(`[data-j="${q.b}"]`).classList.add('ok');
        z.querySelector('.pc-ex-r').innerHTML = (ok ? '<b>Exact.</b> ' : '<b>Pas tout à fait.</b> ') + (q.ex || '');
        setTimeout(() => { i++; suivant(); }, ok ? 1100 : 2600); })); };
    z.dataset.r = ''; suivant();
  }
  function ecrit(z, D, n){
    let P = [];
    if (n === 1) {
      P = D.erreurs.map(([f, ch, b, ex]) => ({ q: `Quelle est la bonne version de « <em>${esc(f)}</em> » ?`, ch: ch.map(esc), b, ex }));
      P = P.concat((D.courbe[secteur()] || D.courbe.pro).map(([p, t]) => ({ q: `<em>${esc(p)}</em> Sur la Courbe ?`, ch: ['T0 (-s)', 'T-1 (-ed)'], b: t ? 1 : 0, ex: t ? 'Le verbe porte -ed, visible ou invisible.' : 'Base ou -s : on est à T0.' })));
    } else {
      P = (D.controle || []).map(([q, ch, b, ex]) => ({ q, ch, b, ex }));
      for (const c of D.code || []) {
        if (c.t === 'qcm') P.push({ q: esc(c.q), ch: c.ch.map(esc), b: c.b, ex: c.ex });
        if (c.t === 'erreur' && !c.vraie) { const idx = melange([c.faux, ...melange(c.mots.map((m, j) => j).filter(j => j !== c.faux && /[a-z]/i.test(c.mots[j]))).slice(0, 2)]);
          P.push({ q: `Quel mot est faux ? « <em>${esc(c.mots.join(' '))}</em> »`, ch: idx.map(j => esc(c.mots[j].replace(/[.,?!]$/, ''))), b: idx.indexOf(c.faux), ex: (c.bon ? 'Il fallait <b>' + esc(c.bon) + '</b>. ' : '') + (c.ex || '') }); }
        if (c.t === 'trou') { const faux = (D.code.filter(x => x.t === 'trou' && x !== c).map(x => x.bon[0])).slice(0, 2); if (faux.length < 2) continue; const ch = melange([c.bon[0], ...faux]);
          P.push({ q: `<em>${esc(c.avant)} ___ ${esc(c.apres)}</em>`, ch: ch.map(esc), b: ch.indexOf(c.bon[0]), ex: c.ex }); } }
    }
    quiz(z, melange(P).slice(0, 4), n, 'ecrit', 'Écrit');
  }
  function lecteur(z, src, lignes, apres){
    const a = new Audio(src), btn = z.querySelector('[data-lire]');
    btn.onclick = () => { btn.disabled = true; a.currentTime = 0; a.play().then(() => {}).catch(tts); };
    a.onended = () => { btn.disabled = false; apres(); };
    a.onerror = tts;
    function tts(){ if (!('speechSynthesis' in window)) { btn.disabled = false; apres(); return; } speechSynthesis.cancel(); let k = 0;
      const un = () => { if (k >= lignes.length) { btn.disabled = false; apres(); return; } const u = new SpeechSynthesisUtterance(nu(lignes[k][1])); u.lang = 'en-US'; u.rate = .92; u.onend = () => { k++; setTimeout(un, 200); }; speechSynthesis.speak(u); }; un(); }
  }
  function ecoute(z, D, n){
    const E = n === 1 ? (D.ecoute[secteur()] || D.ecoute.pro) : D.ecoute, src = n === 1 ? 'audio/m01-ecoute-' + (D.ecoute[secteur()] ? secteur() : 'pro') + '.mp3' : 'audio/m' + String(n).padStart(2, '0') + '-ecoute.mp3';
    if (!E || !E.q) { z.innerHTML = '<p class="pc-ex-msg">Pas d\'écoute dans ce module.</p>'; return; }
    z.innerHTML = `<p class="pc-ex-titre">Écoute</p><p class="pc-ex-q">${E.intro ? esc(E.intro) : 'Écoutez le dialogue, sans le texte.'}</p><button type="button" class="btn btn-bleu" data-lire>▶ Écouter</button> <button type="button" class="pc-lien" data-go>J'ai écouté, aux questions</button>`;
    const go = () => quiz(z, melange(E.q).slice(0, 2).map(([q, ch, b]) => { const o = melange(ch.map((c, j) => ({ c, j }))); return { q: esc(q), ch: o.map(x => esc(x.c)), b: o.findIndex(x => x.j === b), ex: '' }; }), n, 'ecoute', 'Écoute');
    lecteur(z, src, E.lignes, () => {}); z.querySelector('[data-go]').onclick = go;
  }
  function oral(z, D, n){
    const consigne = n === 1 ? 'Présentez-vous à voix haute : qui vous êtes, ce que vous faites au travail (T0), une chose que vous aimez, et une chose faite hier (T-1).' : (D.fluidite || 'Parlez du thème du module, à voix haute.').replace(/en 90 secondes, puis 60, puis 45\.?/i, 'pendant 60 secondes.');
    z.innerHTML = `<p class="pc-ex-titre">Oral · 60 secondes</p><p class="pc-ex-q">${esc(consigne)}</p><div class="pc-oral"><span class="pc-chrono">60</span><button type="button" class="btn btn-bleu" data-go>Lancer le chrono</button></div><p class="pc-ex-r doux">Si vous l'autorisez, votre voix est enregistrée sur cet appareil seulement, pour vous réécouter.</p><div data-audio></div>`;
    const go = z.querySelector('[data-go]'), ch = z.querySelector('.pc-chrono');
    go.onclick = async () => { go.disabled = true; let rec = null, bouts = [], flux = null;
      try { flux = await navigator.mediaDevices.getUserMedia({ audio: true }); rec = new MediaRecorder(flux); rec.ondataavailable = e => bouts.push(e.data); rec.start(); } catch (e) {}
      let t = 60; ch.textContent = t; const it = setInterval(() => { t--; ch.textContent = t; if (t <= 0) { clearInterval(it); fin(); } }, 1000);
      function fin(){ ch.textContent = '✓'; go.hidden = true;
        const apres = () => { z.querySelector('.pc-ex-r').innerHTML = '<b>Bravo.</b> Réécoutez-vous : chaque verbe porte-t-il le bon code ? Demain, refaites-le sans pause.'; noterFait(n, 'oral'); };
        if (rec) { rec.onstop = () => { const u = URL.createObjectURL(new Blob(bouts, { type: bouts[0] && bouts[0].type || 'audio/webm' })); z.querySelector('[data-audio]').innerHTML = `<audio controls src="${u}"></audio>`; flux.getTracks().forEach(x => x.stop()); apres(); }; rec.stop(); } else apres(); } };
  }
  function lecture(z, D, n){
    const L = n === 1 ? (D.ecoute[secteur()] || D.ecoute.pro).lignes : (D.ecoute && D.ecoute.lignes) || [];
    const V = []; L.forEach(([, t]) => t.replace(/\{([^|}]+)\|([^}]+)\}/g, (m, mot, c) => { V.push({ mot, c: n === 1 ? codeM1(c) : c.trim() }); return m; }));
    if (V.length < 3) { z.innerHTML = '<p class="pc-ex-msg">Pas de lecture dans ce module.</p>'; return; }
    const codes = [...new Set(V.map(v => v.c).concat(['-s', '-ed', 'be + -ing']))];
    const texte = L.map(([q, t]) => `<p><b>${esc(q)}</b> ${esc(nu(t))}</p>`).join('');
    const items = melange(V).slice(0, 4).map(v => { const ch = melange([v.c, ...melange(codes.filter(c => c !== v.c)).slice(0, 2)]); return { q: `Dans le texte, <b>${esc(v.mot)}</b> porte quel code ?`, ch: ch.map(esc), b: ch.indexOf(v.c), ex: '' }; });
    z.innerHTML = `<p class="pc-ex-titre">Lecture</p><div class="pc-texte">${texte}</div><div data-q><button type="button" class="btn btn-bleu" data-go>J'ai lu, aux questions</button></div>`;
    z.querySelector('[data-go]').onclick = () => quiz(z.querySelector('[data-q]'), items, n, 'lecture', 'Lecture');
  }

  /* l'espace élève appelle FRGParcours.maj(session) à la connexion et à la déconnexion */
  window.FRGParcours = { maj: r => { ETAT = { formule: r ? r.formule : (AP ? AP.formule : null), prog: (r && r.prog) || {} }; choisi = null; dessiner(); } };
  dessiner();
})();
