/* Frenglais · « Le quiz » : une définition ou un mot, quatre réponses. Quatre modes, six listes, plus de 3 700 questions possibles.
   Les erreurs reviennent dans la même partie, puis dans les suivantes. */
(function(){
  'use strict';
  const z = document.getElementById('ecran'), rail = document.getElementById('etape-nom'), pct = document.getElementById('etape-pct'), barre = document.getElementById('barre');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);
  const lire = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const melange = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const LISTES = { general: 'Général', pro: 'Monde pro', hotel: 'Hôtellerie', luxe: 'Luxe', tour: 'Tourisme', immo: 'Immobilier' };
  const MODES = { def: ['Définitions', 'definition → word'], fren: ['FR → EN', 'maison → house'], enfr: ['EN → FR', 'house → maison'], chrono: ['Marathon', '8 s · une erreur = fin'] };
  const prof = lire('frg-profil', {}) || {}; let liste = LISTES[prof.secteur] ? prof.secteur : 'general', mode = 'def', niveau = 1;
  /* paliers : 1, 2, 3 (+ mots en plus), 5 = expert (dernière chaîne) */
  const voc = k => { const L = window.VOCAB[k] || window.VOCAB.general; return L.map((t, i) => t.split(';').map(p => { const [fr, en] = p.split('|'); return { fr, en, n: L.length >= 4 && i === L.length - 1 ? 5 : Math.min(3, i + 1) }; })).flat(); };
  const AREV = 'frg-quiz-revoir';

  function question(m){
    const V = voc(liste), defs = window.DEFS.filter(d => liste === 'general' || d[3] === liste || d[3] === 'general');
    const t = m === 'chrono' ? melange(['def', 'fren', 'enfr'])[0] : m;
    if (t === 'def' && defs.length >= 4) { const pool = defs.filter(d => d[2] >= niveau - 1 && d[2] <= niveau).length >= 6 ? defs.filter(d => d[2] >= niveau - 1 && d[2] <= niveau) : defs, d = pool[Math.floor(Math.random() * pool.length)];
      const autres = melange(defs.filter(x => x[1] !== d[1] && Math.abs(x[2] - d[2]) <= 1)).slice(0, 3).map(x => x[1]);
      return { t, q: `<span lang="en">${esc(d[0])}</span> <span class="dire" role="button" tabindex="0" aria-label="Écouter" data-dire="${esc(d[0])}">🔊</span>`, bon: d[1], ch: melange([d[1], ...autres]), lang: 'en', id: 'd:' + d[1] }; }
    const vise = niveau >= 4 ? [3, 5] : [niveau - 1, niveau], pool = V.filter(x => x.n >= vise[0] && x.n <= vise[1]), x = pool[Math.floor(Math.random() * pool.length)];
    const proches = melange(V.filter(y => y.en !== x.en && y.fr !== x.fr && Math.abs(y.n - x.n) <= 1)).slice(0, 3);
    if (t === 'enfr') return { t, q: `Que veut dire <b lang="en">${esc(x.en)}</b> <span class="dire" role="button" tabindex="0" aria-label="Écouter" data-dire="${esc(x.en)}">🔊</span> ?`, bon: x.fr, ch: melange([x.fr, ...proches.map(y => y.fr)]), lang: 'fr', id: 'e:' + x.en };
    return { t, q: `Comment dit-on <b>${esc(x.fr)}</b> en anglais ?`, bon: x.en, ch: melange([x.en, ...proches.map(y => y.en)]), lang: 'en', id: 'f:' + x.fr };
  }

  function partie(){
    const chrono = mode === 'chrono', total = chrono ? Infinity : 20; let i = 0, bons = 0, serie = 0, best = 0, minuteur = null; const rates = [], revoir = lire(AREV, []).filter(r => r.l === liste).slice(0, 4);
    const file = []; revoir.forEach(r => file.push(Object.assign({}, r.q, { rev: 1 })));
    const suivante = () => { clearInterval(minuteur); if (i >= total) return fin();
      let x = file.length && (i % 4 === 3 || i < revoir.length) ? file.shift() : question(mode); x.ch = melange(x.ch);
      /* 20 questions : on monte de palier en palier ; marathon : un palier tous les 60 bons d'affilée, jusqu'au niveau tuteur */
      niveau = chrono ? Math.min(5, 1 + Math.floor(serie / 60)) : bons >= 17 ? 5 : bons >= 13 ? 4 : bons >= 9 ? 3 : bons >= 4 ? 2 : 1; i++;
      rail.textContent = MODES[mode][0] + ' · ' + LISTES[liste]; pct.textContent = chrono ? 'série ' + serie : i + ' / ' + total; barre.style.width = chrono ? '0' : Math.round((i - 1) / total * 100) + '%';
      z.innerHTML = `${x.rev ? '<span class="en-rappel">À revoir</span>' : ''}<p class="qz-q">${x.q}</p>
        ${chrono ? '<div class="qz-temps"><i id="tps"></i></div>' : ''}
        <div class="qz-grille">${x.ch.map((c, k) => `<button class="qz-op" type="button" data-c="${esc(c)}" lang="${x.lang}"><kbd>${k + 1}</kbd><span class="qz-t">${esc(c)}</span>${x.lang === 'en' ? `<span class="dire" role="button" tabindex="0" aria-label="Écouter" data-dire="${esc(c)}">🔊</span>` : ''}</button>`).join('')}</div><div id="r"></div>`;
      const ops = [...z.querySelectorAll('.qz-op')], r = z.querySelector('#r'); let fait = false;
      const repondre = c => { if (fait) return; fait = true; clearInterval(minuteur); const ok = c === x.bon;
        ops.forEach(o => { if (o.dataset.c === x.bon) o.classList.add('ok'); else if (o.dataset.c === c) o.classList.add('ko'); o.disabled = true; });
        const R = lire(AREV, []);
        if (ok) { bons++; serie++; best = Math.max(best, serie); const k = R.findIndex(y => y.q.id === x.id); if (k > -1 && x.rev) { R.splice(k, 1); ecrire(AREV, R); } }
        else { serie = 0; rates.push(x); if (!R.some(y => y.q.id === x.id)) { R.unshift({ l: liste, q: { t: x.t, q: x.q, bon: x.bon, ch: x.ch, lang: x.lang, id: x.id } }); ecrire(AREV, R.slice(0, 150)); } if (!chrono) file.push(Object.assign({}, x, { rev: 1 })); }
        if (chrono && !ok) { r.innerHTML = `<div class="retour-msg ko">${c ? 'Raté' : 'Temps écoulé'} : la réponse était <b lang="${x.lang}">${esc(x.bon)}</b>.</div>`; setTimeout(fin, 1500); return; }
        r.innerHTML = ok ? (serie >= 5 ? `<div class="retour-msg ok">🔥 ×${serie}</div>` : '') : `<div class="retour-msg ko">→ <b lang="${x.lang}">${esc(x.bon)}</b> ${x.lang === 'en' ? `<span class="dire" role="button" tabindex="0" aria-label="Écouter" data-dire="${esc(x.bon)}">🔊</span>` : ''}</div>`;
        setTimeout(suivante, ok ? 650 : 1700); };
      ops.forEach(o => o.addEventListener('click', () => repondre(o.dataset.c)));
      document.onkeydown = e => { const n = +e.key; if (n >= 1 && n <= 4 && ops[n - 1]) repondre(ops[n - 1].dataset.c); };
      if (chrono) { let t = 8; const b = z.querySelector('#tps'); b.style.width = '100%'; minuteur = setInterval(() => { t -= .1; b.style.width = Math.max(0, t / 8 * 100) + '%'; if (t <= 0) repondre(''); }, 100); } };
    const fin = () => { clearInterval(minuteur); document.onkeydown = null; barre.style.width = '100%';
      const S = lire('frg-entr2', {}); S.jeux = S.jeux || {}; const o = S.jeux.quiz || { n: 0, best: 0 }; o.n++; o.best = Math.max(o.best, chrono ? best : bons); S.jeux.quiz = o; ecrire('frg-entr2', S);
      const rec = lire('frg-quiz-rec', {}), cle = mode + '-' + liste, valeur = chrono ? best : bons, nouveau = valeur > (rec[cle] || 0); if (nouveau) { rec[cle] = valeur; ecrire('frg-quiz-rec', rec); }
      z.innerHTML = `<p class="eyebrow">${MODES[mode][0]} · ${LISTES[liste]}</p><h1>${chrono ? best + ' bonne' + (best > 1 ? 's' : '') + ' réponse' + (best > 1 ? 's' : '') + ' d\'affilée' : bons + ' / 20'}${nouveau && valeur ? ', nouveau record !' : '.'}</h1>
        ${rates.length ? `<div class="exo"><b>À revoir</b>${[...new Map(rates.map(x => [x.id, x])).values()].slice(0, 8).map(x => `<p style="margin:0">${x.q.replace(/<span class="dire"[^>]*>.*?<\/span>/g, '').replace(/<[^>]+>/g, '').slice(0, 90)} → <b lang="${x.lang}">${esc(x.bon)}</b></p>`).join('')}<p class="doux petit" style="margin:6px 0 0">Ces questions reviendront au début de votre prochaine partie.</p></div>` : '<div class="retour-msg ok">Aucune erreur. Essayez une autre liste, ou le contre-la-montre.</div>'}
        <div class="en-nav"><button class="btn plein" id="re" type="button">Rejouer</button><button class="btn" id="menu" type="button">Changer de mode</button></div>`;
      z.querySelector('#re').addEventListener('click', partie); z.querySelector('#menu').addEventListener('click', menu); };
    suivante();
  }

  function menu(){
    document.onkeydown = null; rail.textContent = 'Le quiz'; pct.textContent = ''; barre.style.width = '0'; const rec = lire('frg-quiz-rec', {}), nrev = lire(AREV, []).length;
    z.innerHTML = `<h1>Le quiz</h1><p>Une question, quatre réponses.</p>
      ${nrev ? `<span class="en-rappel">${nrev} à revoir</span>` : ''}
      <div class="qz-modes">${Object.entries(MODES).map(([k, [n, d]]) => `<button type="button" class="en-carte ${k === mode ? 'qz-on' : ''}" data-m="${k}"><b>${n}</b><span>${d}</span></button>`).join('')}</div>
      <div class="choix">${Object.entries(LISTES).map(([k, n]) => `<button type="button" class="puce ${k === liste ? 'ok' : ''}" data-l="${k}">${n}</button>`).join('')}</div>
      <p class="doux petit" id="rec"></p>
      <div class="en-nav"><button class="btn plein" id="go" type="button">Jouer</button></div>`;
    const majRec = () => { const v = rec[mode + '-' + liste]; z.querySelector('#rec').textContent = v ? 'Votre record ici : ' + v + (mode === 'chrono' ? ' d\'affilée' : ' / 20') : ''; }; majRec();
    z.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.m; z.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('qz-on', x === b)); majRec(); }));
    z.querySelectorAll('[data-l]').forEach(b => b.addEventListener('click', () => { liste = b.dataset.l; z.querySelectorAll('[data-l]').forEach(x => x.classList.toggle('ok', x === b)); majRec(); }));
    z.querySelector('#go').addEventListener('click', partie);
  }
  menu();
})();
