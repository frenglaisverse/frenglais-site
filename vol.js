/* Frenglais · « Le lamantin volant » : un mot français en haut, des portes en anglais. Passez par la bonne traduction.
   Une erreur ou un choc : on recommence du début. Plus on avance, plus ça va vite, plus il y a de portes, plus les mots sont durs.
   Plus de 300 mots par liste, mélangés à chaque partie : personne n'arrive au bout. */
(function(){
  'use strict';
  const cv = document.getElementById('jeu'), cx = cv.getContext('2d'), z = document.getElementById('ecran');
  const lire = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const melange = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const LISTES = { general: 'Général', pro: 'Monde pro', hotel: 'Hôtellerie', luxe: 'Luxe', tour: 'Tourisme', immo: 'Immobilier' };
  const prof = lire('frg-profil', {}) || {}; let liste = new URLSearchParams(location.search).get('liste') || (LISTES[prof.secteur] ? prof.secteur : 'general');
  const paliers = k => (window.VOCAB[k] || window.VOCAB.general).map(t => t.split(';').map(p => p.split('|')));
  const img = new Image(); img.src = 'lamantin-face.webp';
  let W = 0, H = 0, dpr = 1, etat = "menu", perso, tuyaux, score = 0, vitesse, file, mot, rafale, meilleur, raf = 0, dernier = 0, flash = 0, erreurMsg = '';
  const PX = 3; /* un pixel du jeu = 3 pixels écran : le rendu « pixel » de la Courbe du jour */
  function taille(){ const r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = Math.round(W / PX); cv.height = Math.round(H / PX); cx.setTransform(1 / PX, 0, 0, 1 / PX, 0, 0); cx.imageSmoothingEnabled = false; }
  addEventListener('resize', taille);

  /* la file de mots : palier 1 mélangé, puis 2, puis 3, puis tout, sans fin */
  function nouvelleFile(){ const P = paliers(liste), exp = P.length >= 4 ? P[P.length - 1] : [], mil = P.slice(2, P.length >= 4 ? -1 : undefined).flat(); return [...melange(P[0]), ...melange(P[1]), ...melange(mil), ...melange(exp), ...melange([...mil, ...exp]), ...melange(P.flat())]; }
  function portes(){ const P = paliers(liste).flat(); return score < 15 ? 2 : score < 45 ? 3 : 4; }
  function prochain(){ mot = file.shift(); if (!file.length) file = nouvelleFile();
    const n = portes(), P = paliers(liste).flat(), autres = melange(P.filter(p => p[1].toLowerCase() !== mot[1].toLowerCase())).slice(0, n - 1).map(p => p[1]);
    const ch = melange([mot[1], ...autres]); const marge = 70, haut = H - 60, gap = Math.max(84, Math.min(130, (haut - marge) / n - 26 - score * .25));
    const pas = (haut - marge) / n; tuyaux.push({ x: W + 40, n, ch, bon: ch.indexOf(mot[1]), y: ch.map((_, i) => marge + pas * i + pas / 2), gap, passe: false }); }
  function partir(){ taille(); etat = 'jeu'; perso = { x: Math.max(70, W * .22), y: H * .45, v: 0 }; tuyaux = []; score = 0; vitesse = 2.6; file = nouvelleFile(); rafale = 0; flash = 0; erreurMsg = '';
    meilleur = (lire('frg-vol', {})[liste] || 0); prochain(); z.hidden = true; cv.focus(); dernier = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(boucle); }
  function battre(){ if (etat === 'jeu') perso.v = -6.2; else if (etat !== 'jeu') partir(); }
  cv.addEventListener('pointerdown', e => { e.preventDefault(); battre(); });
  addEventListener('keydown', e => { if (e.code === 'Space' || e.code === 'ArrowUp') { if (document.activeElement && /INPUT|SELECT|TEXTAREA|BUTTON|A/.test(document.activeElement.tagName) && etat !== 'jeu') return; e.preventDefault(); battre(); } });

  function perdre(raison){ etat = 'fin'; cancelAnimationFrame(raf); const M = lire('frg-vol', {}), rec = score > (M[liste] || 0); if (rec) { M[liste] = score; ecrire('frg-vol', M); }
    const S = lire('frg-entr2', {}); S.jeux = S.jeux || {}; const o = S.jeux.vol || { n: 0, best: 0 }; o.n++; o.best = Math.max(o.best, score); S.jeux.vol = o; ecrire('frg-entr2', S);
    dessiner(); setTimeout(() => menu(`<p class="eyebrow">${raison}</p><h1>${score} mot${score > 1 ? 's' : ''}${rec && score ? ', nouveau record !' : '.'}</h1>${erreurMsg}<p class="doux">Record : ${Math.max(score, meilleur)}</p>`), 650); }

  function boucle(t){ const dt = Math.min(2, (t - dernier) / 16.67); dernier = t;
    perso.v += .36 * dt; perso.y += perso.v * dt; vitesse = 2.6 + Math.min(3.4, score * .07);
    tuyaux.forEach(p => p.x -= vitesse * dt);
    const p = tuyaux[0], lg = 64;
    if (p && !p.passe && perso.x + 18 > p.x && perso.x - 18 < p.x + lg) {
      const k = p.y.findIndex(y => Math.abs(perso.y - y) < p.gap / 2 - 14);
      if (k < 0) { erreurMsg = `<p><b>${mot[0]}</b> = <b lang="en">${mot[1]}</b> <span class="dire" role="button" tabindex="0" data-dire="${mot[1]}">🔊</span></p>`; return perdre('Choc !'); }
      if (perso.x - 18 > p.x + lg - 4 || perso.x > p.x + lg / 2) { if (k !== p.bon) { erreurMsg = `<p><b>${mot[0]}</b> = <b lang="en">${mot[1]}</b> <span class="dire" role="button" tabindex="0" data-dire="${mot[1]}">🔊</span>, pas <s lang="en">${p.ch[k]}</s></p>`; return perdre('Mauvaise porte'); }
        p.passe = true; score++; rafale++; flash = 1; if (lire('frg-vol-son', true) && window.FRGDire) FRGDire(mot[1]); prochain(); }
    }
    if (p && p.x < -lg) tuyaux.shift();
    if (perso.y > H - 30 || perso.y < 8) { erreurMsg = `<p><b>${mot[0]}</b> = <b lang="en">${mot[1]}</b> <span class="dire" role="button" tabindex="0" data-dire="${mot[1]}">🔊</span></p>`; return perdre(perso.y > H - 30 ? 'Plouf !' : 'Trop haut !'); }
    dessiner(); raf = requestAnimationFrame(boucle); }

  function dessiner(){
    const B = ['#1C49A5', '#1A3F93', '#173682', '#132C70', '#10245C', '#0E1B3D']; B.forEach((c, i) => { cx.fillStyle = c; cx.fillRect(0, H * i / B.length, W, H / B.length + 1); });
    cx.fillStyle = 'rgba(244,238,220,.5)'; for (let i = 0; i < 24; i++) { const sx = (i * 97 + 13) % W, sy = 60 + (i * 53) % (H * .5); cx.fillRect(sx, sy, 3, 3); }
    /* l'eau en bas */
    cx.fillStyle = 'rgba(110,149,240,.35)'; cx.fillRect(0, H - 30, W, 30); cx.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < W; i += 40) cx.fillRect((i - (performance.now() / 20) % 40), H - 30, 22, 2);
    /* les portes */
    tuyaux.forEach(p => { const lg = 64; cx.fillStyle = '#5FD39A';
      let haut = 50; p.y.forEach((y, i) => { cx.fillRect(p.x, haut, lg, (y - p.gap / 2) - haut); haut = y + p.gap / 2; });
      cx.fillRect(p.x, haut, lg, (H - 30) - haut);
      p.y.forEach((y, i) => { cx.fillStyle = '#2E8B6E'; cx.fillRect(p.x - 6, y - p.gap / 2 - 6, lg + 12, 6); cx.fillRect(p.x - 6, y + p.gap / 2, lg + 12, 6);
        cx.font = '21px VT323, monospace'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
        const t = p.ch[i], w = cx.measureText(t).width + 18, bx = p.x + lg / 2; cx.fillStyle = '#FFD25A'; cx.fillRect(bx - w / 2, y - 13, w, 26); cx.fillStyle = '#0E1B3D'; cx.fillText(t, bx, y + 1); }); });
    /* le lamantin */
    if (perso) { cx.save(); cx.translate(perso.x, perso.y); cx.rotate(Math.max(-.5, Math.min(.9, perso.v * .07)));
      if (img.complete && img.naturalWidth) { cx.beginPath(); cx.arc(0, 0, 23, 0, 7); cx.closePath(); cx.fillStyle = '#9DBBFA'; cx.fill(); cx.save(); cx.clip(); cx.drawImage(img, -26, -26, 52, 52); cx.restore(); cx.strokeStyle = '#fff'; cx.lineWidth = 2; cx.stroke(); } else { cx.fillStyle = '#9DBBFA'; cx.beginPath(); cx.arc(0, 0, 18, 0, 7); cx.fill(); } cx.restore(); }
    /* le mot à traduire et le score */
    cx.fillStyle = 'rgba(8,15,38,.72)'; cx.fillRect(0, 0, W, 46); cx.fillStyle = '#fff'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.font = '15px "Press Start 2P", monospace'; cx.fillText(mot ? mot[0] : '', W / 2, 24);
    cx.textAlign = 'left'; cx.font = '15px "Press Start 2P", monospace'; cx.fillStyle = flash > 0 ? '#7FD6AE' : '#E8EEFB'; cx.fillText(score + '', 14, 24); flash = Math.max(0, flash - .05);
    cx.textAlign = 'right'; cx.fillStyle = 'rgba(232,238,251,.7)'; cx.font = '21px VT323, monospace'; cx.fillText('record ' + Math.max(meilleur || 0, score || 0), W - 14, 24);
  }

  function menu(tete){ etat = 'menu'; z.hidden = false; const M = lire('frg-vol', {});
    z.innerHTML = `${tete || '<h1>Le lamantin volant</h1><p>Passe par la bonne traduction. Touche pour voler.</p><p class="doux">Une erreur : retour au début.</p>'}
      <div class="vl-listes">${Object.entries(LISTES).map(([k, n]) => `<button type="button" class="puce ${k === liste ? 'ok' : ''}" data-l="${k}">${n}<small>${M[k] ? 'record ' + M[k] : ''}</small></button>`).join('')}</div>
      <label class="vl-son"><input type="checkbox" id="son" ${lire('frg-vol-son', true) ? 'checked' : ''}> 🔊 Dire chaque mot réussi</label><div class="en-nav"><button class="btn plein" id="go" type="button">${etat === 'menu' && tete ? 'Rejouer' : 'Jouer'}</button></div>`;
    z.querySelectorAll('[data-l]').forEach(b => b.addEventListener('click', () => { liste = b.dataset.l; z.querySelectorAll('[data-l]').forEach(x => x.classList.toggle('ok', x === b)); }));
    z.querySelector('#son').addEventListener('change', e => ecrire('frg-vol-son', e.target.checked)); z.querySelector('#go').addEventListener('click', partir); }
  window.FRGVol = { etat: () => ({ etat, perso, tuyaux, score }) };
  taille(); perso = { x: Math.max(70, W * .22), y: H * .45, v: 0 }; tuyaux = []; mot = null; dessiner(); menu();
})();
