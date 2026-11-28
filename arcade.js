/* Frenglais · Entraînement en mode arcade : cinq mondes de Floride, une scène pixel qui réagit à chaque réponse.
   Miami Beach (sprint) · Key West (dictée) · Everglades (chasse) · Cap Canaveral (chantier) · Orlando (cartes).
   Aucune dépendance, aucun chargement extérieur. Les réactions sont déclenchées par les classes ok / ko posées par entrainement.js. */
(function(){
  'use strict';
  const W = 160, H = 64;
  const MONDES = {
    sprint:   { lieu: 'MIAMI BEACH',   jeu: 'SPRINT DES CODES',   ico: 'soleil' },
    dictee:   { lieu: 'KEY WEST',      jeu: 'RADIO KEY WEST',     ico: 'radio' },
    chasse:   { lieu: 'EVERGLADES',    jeu: 'CHASSE AUX ALLIGATORS', ico: 'gator' },
    chantier: { lieu: 'CAP CANAVERAL', jeu: 'ASSEMBLEZ LA FUSEE', ico: 'fusee' },
    cartes:   { lieu: 'ORLANDO',       jeu: 'NUIT DES CARTES',    ico: 'feu' }
  };
  let cv = null, cx = null, monde = null, t0 = 0, raf = 0, ev = [], score = 0, combo = 0, etages = 0, hud = null;

  /* ---------- sons 8-bit ---------- */
  let AC = null; const son = (f, d, w = 'square', v = .05, dt = 0) => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + dt;
    o.type = w; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d); } catch (e) {} };
  const muet = () => { try { return localStorage.getItem('frg-arcade-muet') === '1'; } catch (e) { return false; } };
  const sonOk = () => { if (muet()) return; son(660, .08); son(880, .1, 'square', .05, .07); if (combo >= 3) son(1320, .12, 'square', .04, .15); };
  const sonKo = () => { if (!muet()) { son(180, .18, 'sawtooth', .05); son(120, .25, 'sawtooth', .04, .12); } };

  /* ---------- petits sprites ---------- */
  const R = (x, y, w, h, c) => { cx.fillStyle = c; cx.fillRect(Math.round(x), Math.round(y), w, h); };
  const sprite = (lignes, x, y, pal) => lignes.forEach((l, j) => [...l].forEach((ch, i) => { if (ch !== '.' && pal[ch]) R(x + i, y + j, 1, 1, pal[ch]); }));
  const LAMANTIN = ['..gggggg....', '.gGGGGGGg..g', 'gGGoGGGGGggG', 'gGGGGGGGGGgg', '.gGGGGGGGg.g', '..gg..gg....'];
  const PAL_LAM = { g: '#6B7F8E', G: '#9DB0BD', o: '#111' };
  const palmier = (x, sol, k) => { R(x, sol - 18, 2, 18, '#7A5230'); R(x + 1, sol - 18, 1, 18, '#5C3D22');
    [[-7, -1], [-5, -3], [2, -3], [4, -1], [-3, -4], [0, -5]].forEach(([dx, dy], i) => { const b = Math.sin(k / 20 + i) * .6; for (let s = 0; s < 6; s++) R(x + dx * s / 5 + (dx > 0 ? 1 : 0), sol - 19 + dy * s / 5 + s * s / 9 + b, 2, 1, s % 2 ? '#2E8B57' : '#3DAE6B'); }); };
  const coeur = (x, y, c) => sprite(['.c.c.', 'ccccc', '.ccc.', '..c..'], x, y, { c });

  /* ---------- les scènes ---------- */
  const SCENES = {
    sprint(k){ /* coucher de soleil à Miami Beach, un coureur sur le sable, un lamantin dans l'eau */
      ['#FF9E5E', '#FF8A65', '#F06C7A', '#B85C9E', '#6A4C9C'].forEach((c, i) => R(0, i * 6, W, 6, c)); R(0, 30, W, 4, '#4D3C8C');
      R(98, 14, 18, 2, '#FFD25A'); R(96, 16, 22, 6, '#FFD25A'); R(98, 22, 18, 2, '#FFC14A');
      for (let y = 34; y < 46; y += 2) R(0, y, W, 2, y % 4 ? '#2F7FBF' : '#3B8FD0'); for (let i = 0; i < 12; i++) R(((i * 29 - k * .6) % (W + 20) + W + 20) % (W + 20) - 10, 36 + (i % 3) * 3, 6, 1, '#9FD3F5');
      sprite(LAMANTIN, ((k * .25) % (W + 40)) - 20, 39, PAL_LAM);
      R(0, 46, W, H - 46, '#F2D7A0'); R(0, 46, W, 1, '#FFF1C9'); for (let i = 0; i < 20; i++) R((i * 37 - k * 1.4 % 37 + 37 * 20) % W, 50 + (i % 4) * 3, 2, 1, '#E3BF7E');
      [20, 70, 130].forEach((x, i) => palmier(((x - k * (1 + combo * .15)) % (W + 30) + W + 30) % (W + 30) - 10, 50, k + i * 9));
      const saut = ev.find(e => e.t === 'ok') ? Math.sin(Math.min(1, (k - ev.find(e => e.t === 'ok').k) / 14) * Math.PI) * 10 : 0, chute = ev.find(e => e.t === 'ko');
      const pas = Math.floor(k / 4) % 2, x = 36, y = 41 - saut;
      if (chute) { R(x - 2, 51, 10, 3, '#1C49A5'); R(x + 6, 50, 3, 3, '#F4C7A1'); }
      else { R(x + 2, y, 4, 4, '#F4C7A1'); R(x + 2, y, 4, 1, '#3A2412'); R(x + 1, y + 4, 6, 5, '#F0766F'); R(x + 1 + (pas ? 0 : 3), y + 9, 2, 4, '#1C49A5'); R(x + 4 - (pas ? 0 : 3), y + 9, 2, 4, '#1C49A5'); }
      ev.filter(e => e.t === 'ok').forEach(e => { const d = k - e.k; R(x + 3, y - 6 - d * .6, 3, 3, '#FFD25A'); R(x + 4, y - 5 - d * .6, 1, 1, '#B8862A'); });
    },
    dictee(k){ /* Key West : la bouée du point le plus au sud, une radio qui émet */
      R(0, 0, W, 34, '#7FD0F2'); R(0, 26, W, 8, '#A8E0F7'); [[20, 8], [110, 12]].forEach(([x, y]) => { R(x + (k * .1) % W, y, 16, 3, '#fff'); R(x + 3 + (k * .1) % W, y - 2, 9, 2, '#fff'); });
      for (let y = 34; y < 48; y += 2) R(0, y, W, 2, y % 4 ? '#1E88C9' : '#2A9BDB'); sprite(LAMANTIN, W - ((k * .3) % (W + 40)), 40, PAL_LAM);
      R(0, 48, W, H - 48, '#E9D2A1');
      const bx = 22; R(bx, 18, 16, 30, '#111'); R(bx + 1, 18, 14, 9, '#E3191F'); R(bx + 1, 33, 14, 7, '#FFD25A'); R(bx - 2, 46, 20, 3, '#555'); R(bx + 2, 28, 12, 4, '#fff');
      const rx = 92; R(rx, 36, 34, 14, '#2A3F73'); R(rx + 2, 38, 10, 10, '#0A1330'); R(rx + 22, 38, 10, 10, '#0A1330'); R(rx + 5, 41, 4, 4, '#4D7BE0'); R(rx + 25, 41, 4, 4, '#4D7BE0'); R(rx + 14, 39, 6, 3, '#FFD25A'); R(rx + 16, 30, 1, 6, '#9AA8CC');
      const parle = ev.find(e => e.t === 'ok'); for (let i = 0; i < 3; i++) { const r = ((k / 3 + i * 6) % 18) + (parle ? 6 : 0); if (r < 16 || parle) { R(rx + 17 - r, 30 - r / 2, 1, 1, '#fff'); R(rx + 17 + r, 30 - r / 2, 1, 1, '#fff'); } }
      if (parle) for (let i = 0; i < 4; i++) sprite(['.nn', '.n.', 'nn.'], rx + 10 + i * 8, 22 - ((k - parle.k) * .4) - i * 2, { n: '#FFD25A' });
      if (ev.find(e => e.t === 'ko')) for (let i = 0; i < 40; i++) R(rx + 2 + Math.random() * 30, 37 + Math.random() * 12, 1, 1, Math.random() > .5 ? '#fff' : '#888');
    },
    chasse(k){ /* Everglades : herbes hautes, hydroglisseur, alligators qui sortent la tête */
      R(0, 0, W, 30, '#BFE3C8'); R(0, 22, W, 8, '#A7D6B3'); for (let i = 0; i < 14; i++) { const x = i * 12 + 2; R(x, 14 + (i % 3) * 2, 2, 16, '#4F8A4B'); R(x - 2, 14 + (i % 3) * 2, 6, 3, '#6FAE5B'); }
      for (let y = 30; y < H; y += 2) R(0, y, W, 2, y % 4 ? '#5B7F4E' : '#4E7344');
      const bx = ((k * .5) % (W + 40)) - 30; R(bx, 36, 26, 4, '#E7E2D2'); R(bx + 2, 32, 8, 4, '#F0766F'); R(bx + 16, 26, 8, 10, '#555'); R(bx + 17, 27, 6, 8, Math.floor(k / 2) % 2 ? '#888' : '#666');
      const hit = ev.find(e => e.t === 'ok'), rire = ev.find(e => e.t === 'ko');
      [[40, 50], [92, 46], [130, 54]].forEach(([x, y], i) => { const up = (Math.sin(k / 18 + i * 2) > .2) || hit || rire; if (!up) { R(x, y + 4, 14, 1, '#3E6136'); return; }
        R(x, y, 16, 4, '#2F5D2A'); R(x + 1, y - 1, 3, 2, '#2F5D2A'); R(x + 2, y - 1, 1, 1, rire ? '#E3191F' : '#FFD25A'); R(x + 10, y + 1, 6, 1, '#1F3F1C');
        if (rire && i === 1) { R(x + 9, y - 3, 7, 3, '#2F5D2A'); for (let t = 0; t < 3; t++) R(x + 10 + t * 2, y, 1, 1, '#fff'); }
        if (hit && i === 1) { const d = k - hit.k; for (let s = 0; s < 4; s++) R(x + 6 + Math.cos(s * 1.6 + d / 4) * 9, y - 6 + Math.sin(s * 1.6 + d / 4) * 3, 2, 2, '#FFD25A'); } });
      sprite(LAMANTIN, W - ((k * .2) % (W + 40)), 56, PAL_LAM);
    },
    chantier(k){ /* Cap Canaveral : pas de tir ; un étage de plus à chaque bonne réponse, décollage à la fin */
      R(0, 0, W, H, '#1B2A55'); for (let i = 0; i < 30; i++) R((i * 53) % W, (i * 29) % 40, 1, 1, i % 5 ? '#9AA8CC' : '#fff');
      R(0, 52, W, H - 52, '#3E4A5C'); R(0, 52, W, 1, '#5A6880');
      for (let y = 54; y < H; y += 2) R(0, y, 44, 2, y % 4 ? '#1E88C9' : '#2A9BDB'); sprite(LAMANTIN, 6 + Math.sin(k / 30) * 4, 56, PAL_LAM);
      R(66, 14, 4, 38, '#C0C6D0'); for (let y = 16; y < 52; y += 4) R(68, y, 10, 1, '#C0C6D0');
      const vol = ev.find(e => e.t === 'decollage'), dy = vol ? Math.pow((k - vol.k) / 6, 2) : 0, n = Math.min(etages, 6), base = 50 - dy;
      R(84, base, 14, 2, '#888');
      for (let i = 0; i < n; i++) { const y = base - 6 - i * 6; R(85, y, 12, 6, i % 2 ? '#F4EEDC' : '#E7E2D2'); R(85, y, 12, 1, '#B9B3A3'); if (i === 0) { R(83, y + 2, 2, 4, '#E3191F'); R(97, y + 2, 2, 4, '#E3191F'); } }
      const ny = base - 6 - n * 6; if (n) { R(87, ny + 2, 8, 4, '#E3191F'); R(89, ny, 4, 2, '#E3191F'); R(90, ny - 1, 2, 1, '#E3191F'); R(89, ny + 4, 4, 1, '#4D7BE0'); }
      if (vol) for (let i = 0; i < 18; i++) R(86 + Math.random() * 10, base + 2 + Math.random() * 12, 2, 2, ['#FFD25A', '#F0766F', '#fff'][i % 3]);
      if (ev.find(e => e.t === 'ok') && !vol) for (let i = 0; i < 6; i++) R(84 + Math.random() * 16, base - 8 - n * 6 + Math.random() * 6, 1, 1, '#FFD25A');
      if (ev.find(e => e.t === 'ko')) { R(78, 30, 2, 2, '#E3191F'); if (Math.floor(k / 3) % 2) R(77, 29, 4, 4, '#E3191F'); }
    },
    cartes(k){ /* Orlando, la nuit : montagnes russes et feux d'artifice */
      R(0, 0, W, H, '#140F33'); R(0, 30, W, 20, '#1E1747'); for (let i = 0; i < 26; i++) R((i * 61) % W, (i * 17) % 28, 1, 1, '#C8C2FF');
      cx.fillStyle = '#4D7BE0'; for (let x = 0; x < W; x++) { const y = 40 - Math.abs(Math.sin(x / 22)) * 18; R(x, y, 1, 1, '#F0766F'); if (x % 8 === 0) R(x, y, 1, 52 - y, '#3A3270'); }
      const cxr = (k * 1.2) % W, cyr = 40 - Math.abs(Math.sin(cxr / 22)) * 18; R(cxr, cyr - 3, 5, 3, '#FFD25A');
      R(0, 52, W, H - 52, '#0B0A1F'); for (let y = 54; y < H; y += 2) R(0, y, W, 1, '#1A1A40'); sprite(LAMANTIN, W - ((k * .25) % (W + 40)), 55, { g: '#4A5866', G: '#6E8290', o: '#000' });
      ev.filter(e => e.t === 'ok').forEach((e, j) => { const d = k - e.k, ox = 40 + (e.k * 37) % 80, oy = 14 + (e.k % 3) * 4; const c = ['#FFD25A', '#5FD39A', '#F0766F', '#9DBBFA'][e.k % 4];
        if (d < 10) R(ox, 52 - d * 3.6, 1, 2, '#fff'); else for (let s = 0; s < 12; s++) { const a = s / 12 * Math.PI * 2, r = (d - 10) * 1.1; if (r < 16) R(ox + Math.cos(a) * r, oy + Math.sin(a) * r + (d - 10) * .2, 1, 1, c); } });
      if (ev.find(e => e.t === 'ko')) R(0, 0, W, 2, '#E3191F');
    }
  };

  function boucle(ts){ if (!cv || !monde) return; const k = Math.floor((ts - t0) / 33);
    ev = ev.filter(e => k - e.k < (e.t === 'decollage' ? 120 : 30)); ev.forEach(e => { if (e.k === undefined || e.k < 0) e.k = k; });
    cx.clearRect(0, 0, W, H); SCENES[monde](k);
    if (ev.find(e => e.t === 'ko')) { cx.fillStyle = 'rgba(227,25,31,.18)'; cx.fillRect(0, 0, W, H); }
    raf = requestAnimationFrame(boucle); }

  function majHud(){ if (!hud) return; hud.querySelector('.h-pts').textContent = String(score).padStart(5, '0'); hud.querySelector('.h-combo').textContent = combo >= 2 ? 'COMBO x' + combo : ''; }
  function evenement(t){ if (!monde) return; ev.push({ t, k: -1 });
    if (t === 'ok') { combo++; score += 10 * Math.min(combo, 5); if (monde === 'chantier') etages++; sonOk(); }
    if (t === 'ko') { combo = 0; sonKo(); }
    majHud(); }

  /* les classes ok / ko posées par les exercices déclenchent la scène (une fois par réponse) */
  let dernier = 0;
  const obs = new MutationObserver(ms => { if (!monde) return; const now = Date.now(); if (now - dernier < 250) return;
    for (const m of ms) { const el = m.target; if (m.type !== 'attributes' || !el.classList) continue;
      if (el.classList.contains('ok') && /puce|bloc|en-mot|ok/.test(el.className) && !(m.oldValue || '').includes('ok')) { dernier = now; evenement('ok'); return; }
      if (el.classList.contains('ko') && !(m.oldValue || '').split(' ').includes('ko')) { dernier = now; evenement('ko'); return; } }
    for (const m of ms) for (const n of m.addedNodes || []) { if (n.nodeType !== 1) continue; const r = n.matches('.retour-msg') ? n : n.querySelector && n.querySelector('.retour-msg');
      if (r && r.classList.contains('ok')) { dernier = now; evenement('ok'); return; } if (r && r.classList.contains('ko')) { dernier = now; evenement('ko'); return; } } });

  function entrer(k){
    const sc = document.getElementById('arcade-scene'); if (!sc) return;
    cancelAnimationFrame(raf); monde = k && SCENES[k] ? k : null; ev = []; combo = 0; etages = 0;
    if (!monde) { sc.hidden = true; return; }
    sc.hidden = false; const M = MONDES[monde];
    sc.innerHTML = `<div class="a-hud" aria-hidden="true"><span class="h-lieu">${M.lieu}</span><span class="h-pts">00000</span></div><canvas width="${W}" height="${H}" aria-hidden="true"></canvas><div class="a-bas" aria-hidden="true"><span class="h-jeu">${M.jeu}</span><span class="h-combo"></span><button type="button" class="a-son" aria-label="Couper le son">${muet() ? '🔇' : '🔊'}</button></div>`;
    cv = sc.querySelector('canvas'); cx = cv.getContext('2d'); hud = sc; score = 0; majHud(); t0 = performance.now();
    sc.querySelector('.a-son').addEventListener('click', e => { try { localStorage.setItem('frg-arcade-muet', muet() ? '0' : '1'); } catch (x) {} e.currentTarget.textContent = muet() ? '🔇' : '🔊'; });
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) raf = requestAnimationFrame(boucle); else { SCENES[monde](0); }
  }
  function finir(){ if (!monde) return; if (monde === 'chantier' && etages) evenement('decollage');
    if (!muet()) [523, 659, 784, 1047, 1319].forEach((f, i) => son(f, .14, 'square', .045, i * .1)); }

  /* ---------- la carte de Floride (menu) ---------- */
  function carte(stats){
    const pts = { sprint: [138, 150, 'MIAMI'], dictee: [104, 186, 'KEY WEST'], chasse: [118, 128, 'EVERGLADES'], chantier: [142, 74, 'CAP CANAVERAL'], cartes: [118, 64, 'ORLANDO'] };
    const FL = 'M8 18 H84 V24 H112 V30 H124 V44 H132 V58 H140 V74 H146 V92 H150 V110 H154 V132 H156 V152 H150 V164 H140 V172 H128 V168 H122 V156 H116 V144 H110 V130 H104 V112 H100 V96 H96 V80 H94 V64 H90 V50 H84 V40 H70 V36 H54 V34 H40 V30 H24 V28 H8 Z';
    return `<div class="a-carte"><svg viewBox="0 0 180 200" shape-rendering="crispEdges" aria-hidden="true">
      <rect width="180" height="200" fill="#1E88C9"/>${Array.from({ length: 30 }, (_, i) => `<rect x="${(i * 47) % 180}" y="${(i * 31) % 200}" width="6" height="1" fill="#5DB3E6"/>`).join('')}
      <path d="${FL}" fill="#3DAE6B" stroke="#1F6F43" stroke-width="2"/><path d="M128 168 H134 V176 H142 V182 H150 V186 H160 V190 H104 V186 H116 V180 H124 Z" fill="#E9D2A1" opacity=".9"/>
      <rect x="116" y="118" width="22" height="22" fill="#2E8B57" opacity=".8"/><rect x="106" y="34" width="6" height="4" fill="#E9D2A1"/>
      <g class="a-lam"><rect x="40" y="120" width="12" height="5" fill="#9DB0BD"/><rect x="38" y="121" width="2" height="3" fill="#9DB0BD"/><rect x="50" y="119" width="2" height="2" fill="#111"/></g>
      ${Object.entries(pts).map(([k, [x, y]]) => `<g class="a-pt"><rect x="${x - 5}" y="${y - 5}" width="10" height="10" fill="${stats[k] ? '#FFD25A' : '#F4EEDC'}" stroke="#0A1330" stroke-width="2"/><rect x="${x - 2}" y="${y - 2}" width="4" height="4" fill="#E3191F"/></g>`).join('')}
    </svg><p class="a-titre">FLORIDA · 5 MONDES</p></div>`;
  }


  /* icônes pixel 10 x 10 des mondes */
  const ICO = {
    soleil: ['....yy....', '..yyyyyy..', '.yyyyyyyy.', 'yyyyyyyyyy', 'oooooooooo', '..........', 'bbbbbbbbbb', '.bbbbbbbb.', 'ssssssssss', 'ssssssssss'],
    radio:  ['.......w..', '......w...', '.nnnnnnnnn', 'nkkknyyknn', 'nkbknnnknn', 'nkkkn.kkkn', 'nnnnnnnnnn', '..........', '..........', '..........'],
    gator:  ['..........', '..........', '.g........', 'gGg.......', 'gyGgggggg.', 'gGGGGGGGGg', 'gwGwGGGGGg', '.ggggggggg', '.vvvvvvvvv', 'vvvvvvvvvv'],
    fusee:  ['....rr....', '...rrrr...', '...wwww...', '...wbbw...', '...wwww...', '...wwww...', '..rwwwwr..', '..r.yy.r..', '....oo....', '....y.....'],
    feu:    ['.y...p..g.', '..y.p..g..', 'y..ypg.g..', '.yy.p.gg..', '...ypg....', '..g.p.y...', '.g..p..y..', '....p.....', '....p.....', '....p.....']
  };
  const PICO = { y: '#FFD25A', o: '#FF8A65', b: '#2F7FBF', s: '#F2D7A0', w: '#F4EEDC', n: '#2A3F73', k: '#0A1330', g: '#2F5D2A', G: '#4F8A4B', v: '#4E7344', r: '#E3191F', p: '#F0766F' };
  const icone = nom => `<svg class="a-ico" viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true">${ICO[nom].map((l, j) => [...l].map((c, i) => c !== '.' && PICO[c] ? `<rect x="${i}" y="${j}" width="1" height="1" fill="${PICO[c]}"/>` : '').join('')).join('')}</svg>`;
  window.FRGArcade = { entrer, finir, carte, MONDES, evenement, icone };
  document.addEventListener('DOMContentLoaded', () => { const e = document.getElementById('ecran'); if (e) obs.observe(e, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true }); });
})();
