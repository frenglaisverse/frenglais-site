/* Frenglais · Entraînement : cinq exercices par module, construits à partir du contenu du module.
   1 Sprint des codes (60 s) · 2 Dictée trouée (la voix de Paul) · 3 Chasse aux erreurs · 4 Le chantier (reconstruire) · 5 Cartes mémoire.
   Les questions sont tirées au hasard à chaque partie ; les records et les cartes maîtrisées restent sur l'appareil. */
(function(){
  'use strict';
  const q = new URLSearchParams(location.search), N = Math.max(1, Math.min(32, parseInt(q.get('n'), 10) || 1));
  const z = document.getElementById('ecran'), $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);
  const lire = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const melange = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const sans = t => String(t || '').replace(/<[^>]+>/g, '');
  const norm = t => sans(t).toLowerCase().replace(/[’‘]/g, "'").replace(/[.,!?;:…"]/g, '').replace(/\s+/g, ' ').trim();
  const secteur = () => { const p = lire('frg-profil', {}); return (p && p.secteur) || 'pro'; };
  const CODE = /\{([^|}]+)\|([^}]+)\}/g, nu = t => String(t).replace(CODE, '$1');
  const OK = t => `<div class="retour-msg ok">${t}</div>`, KO = t => `<div class="retour-msg ko">${t}</div>`, INFO = t => `<div class="retour-msg info">${t}</div>`;
  const EX = [
    { k: 'sprint', nom: 'Sprint des codes', lieu: 'Miami Beach', ico: 'soleil', d: '60 secondes sur la plage. Chaque bonne réponse fait sauter le coureur, les combos rapportent double.' },
    { k: 'dictee', nom: 'Radio Key West', lieu: 'Key West', ico: 'radio', d: 'Le message vocal passe à la radio. Retrouvez chaque verbe conjugué.' },
    { k: 'chasse', nom: 'Chasse aux alligators', lieu: 'Everglades', ico: 'gator', d: 'Huit phrases, des alligators cachés dedans. Trouvez le mot faux, assommez-le, réparez.' },
    { k: 'chantier', nom: 'Assemblez la fusée', lieu: 'Cap Canaveral', ico: 'fusee', d: 'Chaque phrase remise dans l\'ordre ajoute un étage. À la fin : décollage.' },
    { k: 'cartes', nom: 'Nuit des cartes', lieu: 'Orlando', ico: 'feu', d: 'Les règles du module en cartes. Chaque carte sue lance un feu d\'artifice.' }
  ];
  const JEUX = [['courbe/', '📈', 'La Courbe du jour', 'Le défi quotidien'], ['vol.html', '🦭', 'Le lamantin volant', 'Vocabulaire, sans fin'], ['quiz.html', '🃏', 'Le quiz', 'Définitions et traductions'], ['accent.html', '🎙', 'Le pont des sons', 'Th, i, r, h, -ed, w'], ['frenglais.html', '🏁', 'Frenglais', (() => { const v = Array.from({ length: 32 }, (_, i) => lire('frg-m' + (i + 1), null)).filter(l => l && l.valide).length; return v >= 32 ? 'Le niveau final : tapez en FR et en EN, de plus en plus vite' : '🔒 Le niveau final · ' + v + ' / 32 modules validés'; })()]];
  const STATS = () => lire('frg-entr2', {}), noter = (k, v) => { const S = STATS(); S[N] = S[N] || {}; const o = S[N][k] || { n: 0, best: 0 }; o.n++; o.best = Math.max(o.best, v); o.last = Date.now(); S[N][k] = o; ecrire('frg-entr2', S); return o; };

  /* ---------- données du module, ramenées à une forme commune ---------- */
  function charger(n = N){
    return new Promise((ok, ko) => { const s = document.createElement('script');
      s.src = n === 1 ? 'module-1-data.js' : 'modules/m' + String(n).padStart(2, '0') + '.js';
      s.onload = () => { const D = n === 1 ? window.M1 : window.MOD; s.remove(); D ? ok(D) : ko(); }; s.onerror = () => { s.remove(); ko(); }; document.head.append(s); });
  }
  /* la répétition avant tout : chaque partie reprend aussi les modules précédents (le dernier, l'avant-dernier, un plus ancien au hasard),
     et les questions ratées reviennent jusqu'à être réussies deux fois de suite */
  const AREV = 'frg-arevoir', idDe = x => JSON.stringify(x, (k, v) => ['m', 'arev', 'rp', 'gen', 'rap'].includes(k) ? undefined : v).slice(0, 160);
  const aRevoir = t => lire(AREV, []).filter(x => x.t === t && x.m <= N);
  function rater(t, it, m){ if (!it || it.gen) return; const L = lire(AREV, []), id = idDe(it), e = L.find(x => x.id === id);
    if (e) e.c = 2; else L.unshift({ id, t, it, m: m || N, c: 2 }); ecrire(AREV, L.slice(0, 120)); }
  function reussir(it){ if (!it) return; const L = lire(AREV, []), id = idDe(it), e = L.find(x => x.id === id); if (!e) return; e.c--; ecrire(AREV, e.c <= 0 ? L.filter(x => x !== e) : L); }
  const tag = it => it && it.m && it.m !== N ? `<span class="en-rappel">Rappel · module ${it.m}</span>` : it && it.arev ? '<span class="en-rappel">À revoir</span>' : it && it.gen && it.rap ? `<span class="en-rappel">Rappel · ${esc(it.rap)}</span>` : '';
  const tirerRevoir = (t, n) => melange(aRevoir(t)).slice(0, n).map(x => Object.assign({}, x.it, { arev: 1, m: x.m }));
  const CARTES_M1 = [
    ['Qui, fait quoi, à quoi', 'Une phrase anglaise se construit toujours dans cet ordre : le sujet, le verbe, le complément.', '<em>The client needs a new offer.</em>'],
    ['T0 : le code -s', 'Au présent, he, she, it et tout ce qui les remplace prennent -s.', '<em>She works in Nice.</em>'],
    ['T-1 : le code -ed', 'Tout ce qui est fini, coupé de maintenant, porte -ed.', '<em>We called the client.</em>'],
    ['Le code peut être invisible', 'Les verbes dits irréguliers portent aussi -ed, à l\'encre invisible.', '<em>went = go + -ed · bought = buy + -ed</em>'],
    ['Soyez logique', 'On reste au même temps tant que le repère ne change pas.', '<em>Yesterday, I helped a family and they thanked me.</em>'],
    ['Le piège', 'Yesterday + have : deux repères qui se contredisent.', '<em>Yesterday I have seen him → Yesterday I saw him.</em>']
  ];
  function adapter(D, n = N){
    const S = secteur(), A = {};
    A.titre = n === 1 ? 'Repères et codes' : D.titre;
    /* QCM : contrôle, rappel, code, expert, placer */
    const Q = [];
    if (n === 1) {
      D.erreurs.forEach(([f, ch, b, ex]) => Q.push({ q: `La bonne version de « <em>${esc(f)}</em> » ?`, ch: ch.map(esc), b, ex }));
      (D.courbe[S] || D.courbe.pro).forEach(([p, t]) => Q.push({ q: `<em>${esc(p)}</em> Sur la Courbe ?`, ch: ['T0 · -s', 'T-1 · -ed'], b: t ? 1 : 0, ex: t ? 'Le verbe porte -ed, visible ou invisible : T-1.' : 'Le verbe porte -s ou rien : T0.' }));
    } else {
      [...(D.controle || []), ...(D.rappel || []), ...((D.expert && D.expert.items) || [])].forEach(([qq, ch, b, ex]) => Q.push({ q: qq, ch, b, ex }));
      (D.code || []).forEach(c => { if (c.t === 'qcm') Q.push({ q: c.q, ch: c.ch, b: c.b, ex: c.ex }); });
      (D.placer || []).forEach(([p, t, , ex]) => { const ch = melange(['T-2', 'T-1', 'T0', 'T+1'].filter(x => x !== t)).slice(0, 2).concat(t); const m = melange(ch); Q.push({ q: `<em>${esc(p)}</em> Sur la Courbe ?`, ch: m, b: m.indexOf(t), ex }); });
    }
    A.qcm = Q;
    /* le message vocal : lignes codées + audio de Paul */
    const ec = n === 1 ? (D.ecoute[S] || D.ecoute.pro) : D.ecoute;
    A.lignes = ec ? ec.lignes.map(l => l[1]) : [];
    A.qui = ec && ec.lignes[0] ? ec.lignes[0][0] : '';
    A.q = (ec && ec.q) || [];
    A.audio = n === 1 ? 'audio/m01-ecoute-' + (D.ecoute[S] ? S : 'pro') + '.mp3' : 'audio/m' + String(n).padStart(2, '0') + '-ecoute.mp3';
    /* erreurs : celles du module, puis des phrases du message vocal piégées automatiquement */
    const ER = [];
    (D.code || []).forEach(c => { if (c.t === 'erreur' && !c.vraie) ER.push({ mots: c.mots, faux: c.faux, bon: c.bon, ex: c.ex }); });
    if (n === 1) D.erreurs.forEach(([f, ch, b, ex]) => { const bon = ch[b], m = f.split(' '), mb = bon.split(' ');
      const i = m.findIndex((w, k) => w !== mb[k]); if (i > -1 && m.length === mb.length) ER.push({ mots: m, faux: i, bon: mb[i].replace(/[.,!?]$/, ''), ex }); });
    A.lignes.forEach(l => { const v = [...l.matchAll(CODE)].filter(m => /(^|[^a-z])(s|ed)([^a-z]|$)|-s|-ed/.test(m[2])); if (!v.length) return; const x = v[Math.floor(Math.random() * v.length)], mot = x[1];
      const pieg = pieger(mot); if (!pieg) return;
      const phrase = nu(l.replace(x[0], '§')), mots = phrase.split(' '), i = mots.findIndex(w => w.includes('§'));
      if (i < 0 || mots.length > 22) return; const bonMot = mots[i].replace('§', mot); mots[i] = mots[i].replace('§', pieg);
      ER.push({ mots, faux: i, bon: bonMot.replace(/[.,!?…]+$/, ''), ex: 'Le code attendu ici : ' + esc(x[2].split('|')[0].replace(/^(s|ed)$/, '-$1').replace(/ invisible$/, ' (invisible)')) + '.' }); });
    A.erreurs = ER;
    A.justes = A.lignes.map(nu).filter(t => t.split(' ').length <= 18);
    /* chantier : phrases à reconstruire */
    const P = [];
    if (n === 1) (D.ordre[S] || D.ordre.pro).forEach(b => P.push({ fr: '', blocs: b.map(x => x) }));
    (D.code || []).forEach(c => { if (c.t === 'ordre') P.push({ fr: '', blocs: c.blocs }); if (c.t === 'traduire') P.push({ fr: c.fr, blocs: decouper(c.bon[0] + '.') }); });
    A.lignes.map(nu).forEach(t => t.split(/(?<=[.!?])\s+/).forEach(s => { const w = s.trim().split(' '); if (w.length >= 4 && w.length <= 10 && !/[…]/.test(s)) P.push({ fr: '', blocs: decouper(s.trim()) }); }));
    A.phrases = P;
    /* cartes : règles, nuances, codes invisibles, le piège */
    const C = n === 1 ? CARTES_M1.slice() : [...(D.cartes || [])];
    (D.nuances || []).forEach(x => C.push(x));
    if (D.vitre && D.vitre.items) D.vitre.items.slice(0, 6).forEach(it => it.mot && it.code && C.push(['Le code de « ' + it.mot + ' »', 'Quel est le code caché ?', '<em>' + esc(it.mot) + ' = ' + esc(it.code) + '</em>']));
    if (D.catch && n > 1) C.push(['Le piège · ' + sans(D.catch[0]), sans(D.catch[1]), D.catch[2]]);
    A.cartes = C.filter(c => c && c[0]);
    return A;
  }
  /* une forme fausse crédible : le code oublié, ou le mauvais code */
  function pieger(m){
    const w = m.toLowerCase(), I = { went: 'go', saw: 'see', came: 'come', left: 'leave', had: 'have', bought: 'buy', sent: 'send', met: 'meet', told: 'tell', did: 'do', was: 'is', were: 'are', heard: 'hear', found: 'find', thought: 'think', took: 'take', got: 'get', made: 'make', said: 'say', knew: 'know', gave: 'give', ate: 'eat', drove: 'drive', wrote: 'write', is: 'are', are: 'is', has: 'have', have: 'has', does: 'do', do: 'does', "doesn't": "don't", "don't": "doesn't", "didn't": "don't", "isn't": "aren't", "aren't": "isn't", "wasn't": "weren't" };
    if (I[w]) return m[0] === m[0].toUpperCase() ? I[w][0].toUpperCase() + I[w].slice(1) : I[w];
    if (/[a-z]ied$/.test(w)) return m.replace(/ied$/, 'y');
    if (/[a-z]{2}ed$/.test(w)) { if (/([bdgmnprt])\1ed$/.test(w)) return m.slice(0, -3);
      if (/(lv|rv|rg|ng|rs|ns|rc|nc|dg|ps|rs|ls)ed$/.test(w) || (/(^|[^aeiou])[aiouy][^aeiouwxy]ed$/.test(w) && !/(ited|ered|ened|oned|ited)$/.test(w))) return m.slice(0, -1);
      return m.slice(0, -2); }
    if (/[a-z]ies$/.test(w)) return m.replace(/ies$/, 'y');
    if (/[a-z](sh|ch|x|o)es$/.test(w)) return m.replace(/es$/, '');
    if (/[a-z]{2}s$/.test(w) && !/ss$/.test(w)) return m.replace(/s$/, '');
    if (/'s$/.test(w) || /'re$/.test(w) || /'m$/.test(w) || /'ll$/.test(w) || /'ve$/.test(w) || /'d$/.test(w)) return null;
    if (/^[a-z]{3,}$/.test(w) && !/ing$/.test(w)) return m + 's';
    return null;
  }
  /* découpe en blocs de sens : sujet, verbe, le reste en petits groupes */
  function decouper(s){ const w = s.split(' '); if (w.length <= 4) return w; const B = []; let i = 0; while (i < w.length) { const t = w.length - i > 5 ? 2 : w.length - i <= 2 ? w.length - i : 2; B.push(w.slice(i, i + t).join(' ')); i += t; } return B; }

  /* anti-répétition : on sert d'abord ce qui a été le moins vu, et le générateur invente des phrases nouvelles */
  const GEN = !!window.FRGGen;
  function choisir(liste, cle, n, id = x => JSON.stringify(x).slice(0, 120)){
    const k = 'frg-vusm-' + N + '-' + cle, C = lire(k, {}), m = melange(liste).sort((a, b) => (C[id(a)] || 0) - (C[id(b)] || 0)).slice(0, n);
    m.forEach(x => { C[id(x)] = (C[id(x)] || 0) + 1; }); ecrire(k, C); return m; }
  /* plus on avance dans les modules, plus on passe du choix multiple à l'écrit, puis à l'oral */
  const RECO = window.SpeechRecognition || window.webkitSpeechRecognition;
  const PART = N <= 2 ? [1, 0, 0] : N <= 5 ? [.75, .25, 0] : N <= 8 ? [.6, .4, 0] : N <= 16 ? [.4, .45, .15] : N <= 24 ? [.2, .55, .25] : [.1, .5, .4];
  function modalite(){ const r = Math.random(); const m = r < PART[0] ? 'qcm' : r < PART[0] + PART[1] ? 'ecrit' : 'oral'; return m === 'oral' && !RECO ? 'ecrit' : m; }
  const BADGE = { ecrit: '<span class="en-mode">✍️ À écrire</span>', oral: '<span class="en-mode">🎙 À dire</span>', qcm: '' };
  /* champ de réponse écrite ou orale : fin(ok, saisi) */
  function saisir(box, attendu, mode, fin, consigne){
    const bon = [].concat(attendu), juste = v => bon.some(b => norm(v) === norm(b));
    if (mode === 'oral') {
      box.innerHTML = `<p class="doux petit">${consigne || 'Dites la réponse à voix haute.'}</p><button class="btn plein en-micro" type="button">🎙 Parler</button><div class="en-ent"></div>`;
      const b = box.querySelector('.en-micro'), e = box.querySelector('.en-ent'); let fini = false;
      b.addEventListener('click', () => { const rec = new RECO(); rec.lang = 'en-GB'; rec.maxAlternatives = 5; b.disabled = true; b.textContent = '● J\'écoute…';
        rec.onresult = ev => { const alts = [...ev.results[0]].map(a => norm(a.transcript)), ok = alts.some(a => bon.some(x => a === norm(x) || (' ' + a + ' ').includes(' ' + norm(x) + ' ')));
          e.innerHTML = `<p class="doux petit">Entendu : « <span lang="en">${esc(ev.results[0][0].transcript)}</span> »</p>`; if (!fini) { fini = true; fin(ok, ev.results[0][0].transcript); } };
        rec.onerror = () => { b.disabled = false; b.textContent = '🎙 Parler'; e.innerHTML = '<p class="doux petit">Je n\'ai rien entendu. Réessayez.</p>'; };
        rec.onend = () => { if (!fini) { b.disabled = false; b.textContent = '🎙 Parler'; } };
        try { rec.start(); } catch (x) { b.disabled = false; } });
      return;
    }
    box.innerHTML = `<form class="en-saisie"><input type="text" lang="en" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${consigne || 'Votre réponse'}" aria-label="Votre réponse"><button class="btn plein" type="submit">OK</button></form>`;
    const f = box.querySelector('form'), inp = f.querySelector('input'); setTimeout(() => inp.focus({ preventScroll: true }), 30);
    f.addEventListener('submit', ev => { ev.preventDefault(); if (!inp.value.trim()) return; inp.disabled = true; f.querySelector('button').disabled = true; const ok = juste(inp.value); inp.classList.add(ok ? 'ok' : 'ko'); fin(ok, inp.value); }, { once: true });
  }
  /* ---------- habillage ---------- */
  const nom = document.getElementById('mod-titre'), rail = document.getElementById('etape-nom'), pct = document.getElementById('etape-pct'), barre = document.getElementById('barre');
  const avancer = (i, n, t) => { rail.textContent = t; pct.textContent = n ? (i + ' / ' + n) : ''; barre.style.width = n ? Math.round(i / n * 100) + '%' : '0'; };
  let A = null, minuteur = null;
  const arreter = () => { if (minuteur) clearInterval(minuteur); minuteur = null; speechSynthesis && speechSynthesis.cancel && speechSynthesis.cancel(); };

  const lancer = k => { if (window.FRGArcade) FRGArcade.entrer(k); ({ sprint, dictee, chasse, chantier, cartes })[k](); };
  function menu(){
    arreter(); if (window.FRGArcade) FRGArcade.entrer(null); avancer(0, 0, 'Entraînement · module ' + N); const S = (STATS()[N]) || {};
    z.innerHTML = `<p class="eyebrow">Entraînement · module ${N}</p><h1>${esc(A.titre)}</h1>
      <p>Cinq exercices pour fixer le module, à refaire autant que vous voulez : les questions changent à chaque partie, et chacune reprend aussi les modules d'avant. Comptez 3 à 5 minutes chacun.</p>${(() => { const n = lire(AREV, []).filter(x => x.m <= N).length; return n ? INFO(`<b>${n} question${n > 1 ? 's' : ''} à revoir</b> : celles que vous avez ratées reviennent dans vos prochaines parties, jusqu'à être réussies deux fois.`) : ''; })()}
      ${window.FRGArcade ? FRGArcade.carte(S) : ''}
      <div class="en-grille">${EX.map(e => { const s = S[e.k]; return `<button class="en-carte" type="button" data-k="${e.k}"><span class="en-ico" aria-hidden="true">${window.FRGArcade ? FRGArcade.icone(e.ico) : ''}</span><small class="a-lieu">${e.lieu}</small><b>${e.nom}</b><span>${e.d}</span><em>${s ? (e.k === 'sprint' ? 'HI-SCORE ' + s.best : e.k === 'cartes' ? s.best + ' carte' + (s.best > 1 ? 's' : '') + ' maîtrisée' + (s.best > 1 ? 's' : '') : 'Meilleur : ' + s.best + ' %') + ' · ' + s.n + ' partie' + (s.n > 1 ? 's' : '') : 'Pas encore joué'}</em></button>`; }).join('')}</div>
      <p class="eyebrow" style="margin-top:8px">Les jeux</p>
      <div class="en-grille en-jeux">${JEUX.map(([h, i, n, d]) => `<a class="en-carte en-jeu" href="${h}"><span class="en-ico" aria-hidden="true">${i}</span><b>${n}</b><span>${d}</span></a>`).join('')}</div>
      <div class="en-lam"><img src="lamantin-pixel.png" alt="" width="56" height="56" style="image-rendering:pixelated;flex:none"><div style="flex:1"><b>Le lamantin IA</b><span>Pratique : il vous corrige. Inclus dans votre formation, à vie : 3 relectures par jour avec L\'Intégral, libre accès avec Signature.</span></div><a class="btn plein" href="lamantin.html?n=${N}">Écrire au lamantin</a></div>
      <div class="en-nav">${N > 1 ? `<a class="btn" href="entrainement.html?n=${N - 1}">← Module ${N - 1}</a>` : '<span></span>'}<a class="btn" href="espace-eleve.html">Retour aux modules</a>${N < 32 ? `<a class="btn" href="entrainement.html?n=${N + 1}">Module ${N + 1} →</a>` : ''}</div>`;
    z.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => lancer(b.dataset.k)));
  }
  const fin = (titre, texte, k, val) => { arreter(); const o = noter(k, val); if (window.FRGArcade) FRGArcade.finir();
    z.innerHTML = `<p class="eyebrow">${esc(EX.find(e => e.k === k).nom)} · terminé</p><h1>${titre}</h1>${texte}
      <p class="doux petit">${o.n} partie${o.n > 1 ? 's' : ''} jouée${o.n > 1 ? 's' : ''} · ${k === 'sprint' ? 'record ' + o.best + ' pts' : k === 'cartes' ? 'record ' + o.best + ' cartes' : 'meilleur score ' + o.best + ' %'}</p>
      <div class="en-nav"><button class="btn plein" type="button" id="rejouer">Rejouer</button><button class="btn" type="button" id="menu">Les 5 exercices</button></div>`;
    z.querySelector('#rejouer').addEventListener('click', () => lancer(k)); z.querySelector('#menu').addEventListener('click', menu); };
  const vide = k => { z.innerHTML = `<h1>Bientôt</h1><p>Cet exercice arrive avec le contenu complet du module.</p><div><button class="btn" id="menu" type="button">Les 5 exercices</button></div>`; z.querySelector('#menu').addEventListener('click', menu); };

  /* ---------- 1 · Sprint des codes ---------- */
  function sprint(){
    if (A.qcm.length < 4 && !GEN) return vide('sprint');
    arreter(); let t = 60, pts = 0, serie = 0, bons = 0, vus = 0, pile = choisir(A.qcm, 'sprint', A.qcm.length), i = 0; const rates = [];
    z.innerHTML = `<p class="eyebrow">Miami Beach · Sprint des codes</p><div class="en-sprint-tete"><span class="compte" id="t">1:00</span><span class="en-pts"><b id="pts">0</b> pts</span><span class="en-serie" id="serie"></span></div><div id="qz"></div>`;
    const qz = z.querySelector('#qz'), te = z.querySelector('#t'), pe = z.querySelector('#pts'), se = z.querySelector('#serie');
    const poser = () => { if (i >= pile.length) { pile = choisir(A.qcm, 'sprint', A.qcm.length); i = 0; } const rr = Math.random(), rv = tirerRevoir('qcm', 1)[0], x = rv && rr < .18 ? rv : A.rap.qcm.length && rr < .4 ? A.rap.qcm[Math.floor(Math.random() * A.rap.qcm.length)] : GEN && (!pile.length || rr < .7) ? FRGGen.qcm(N) : pile[i++], o = melange(x.ch.map((c, j) => ({ c, j })));
      const md = /___/.test(x.q) && !/<|\/|\(/.test(sans(x.ch[x.b])) ? modalite() : 'qcm';
      if (md !== 'qcm') { qz.innerHTML = `${tag(x)}${BADGE[md]}<p class="phrase en-q">${x.q}</p><div id="sz"></div><div id="r"></div>`;
        saisir(qz.querySelector('#sz'), md === 'oral' ? sans(x.q).replace(/_{3}/, sans(x.ch[x.b])).replace(/\s*\.$/, '') : sans(x.ch[x.b]), md, ok => { vus++;
          if (ok) { bons++; serie++; pts += serie >= 3 ? 3 : 2; reussir(x); qz.querySelector('#r').innerHTML = OK('+2'); } else { serie = 0; rater('qcm', x, x.m); rates.push(x); qz.querySelector('#r').innerHTML = KO('Réponse : <b lang="en">' + x.ch[x.b] + '</b>. ' + (x.ex || '')); }
          pe.textContent = pts; se.textContent = serie >= 3 ? 'COMBO x2' : serie ? 'SERIE ' + serie : ''; setTimeout(() => { if (t > 0) poser(); }, ok ? 600 : 2200); }, md === 'oral' ? 'Dites toute la phrase.' : 'Écrivez la forme qui manque');
        return; }
      qz.innerHTML = `${tag(x)}<p class="phrase en-q">${x.q}</p><div class="choix col">${o.map(c => `<button class="puce" type="button" data-j="${c.j}">${c.c}</button>`).join('')}</div><div id="r"></div>`;
      qz.querySelectorAll('.puce').forEach(p => p.addEventListener('click', () => { if (qz.dataset.l) return; qz.dataset.l = 1; vus++; const ok = +p.dataset.j === x.b;
        if (ok) { bons++; serie++; pts += serie >= 3 ? 2 : 1; p.classList.add('ok'); reussir(x); } else { serie = 0; rater('qcm', x, x.m); p.classList.add('ko'); qz.querySelector(`[data-j="${x.b}"]`).classList.add('ok'); rates.push(x); qz.querySelector('#r').innerHTML = KO(x.ex || 'Regardez la bonne réponse.'); }
        pe.textContent = pts; se.textContent = serie >= 3 ? 'COMBO x2' : serie ? 'SERIE ' + serie : '';
        setTimeout(() => { delete qz.dataset.l; if (t > 0) poser(); }, ok ? 450 : 1900); })); };
    poser(); avancer(0, 0, 'Sprint en cours');
    minuteur = setInterval(() => { t--; te.textContent = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); barre.style.width = Math.round((60 - t) / 60 * 100) + '%';
      if (t <= 0) { const R = STATS()[N] && STATS()[N].sprint, record = !R || pts > R.best;
        fin(`${pts} points${record && pts ? ', nouveau record' : ''}.`, `<p>${bons} bonne${bons > 1 ? 's' : ''} réponse${bons > 1 ? 's' : ''} sur ${vus}.</p>${rates.length ? `<div class="exo"><b>À revoir</b>${rates.slice(0, 5).map(x => `<p style="margin:0">${x.q} → <b>${x.ch[x.b]}</b><br><span class="doux petit">${x.ex || ''}</span></p>`).join('')}</div>` : OK('Aucune erreur. Visez plus de points la prochaine fois.')}`, 'sprint', pts); } }, 1000);
  }

  /* ---------- 2 · Dictée trouée ---------- */
  function dictee(gen){
    const lignes = gen || A.lignes, L = lignes.filter(l => CODE.test(l)); CODE.lastIndex = 0; if (!L.length && GEN) return dictee(FRGGen.message(N, 5)); if (!L.length) return vide('dictee');
    arreter(); let total = 0; const nbv = lignes.reduce((a, l) => a + (l.match(/\{/g) || []).length, 0), part = .6 + Math.random() * .25; let rest = Math.max(4, Math.round(nbv * part)), vus = 0;
    const html = lignes.map(l => esc(l).replace(/\{([^|}]+)\|([^}]+)\}/g, (m, mot, c) => { vus++; if (nbv - vus + 1 > rest && Math.random() > part) return mot; rest--; total++; return `<span class="en-trou"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" data-bon="${esc(mot)}" data-c="${esc(c.split('|')[0])}" size="${Math.max(4, mot.length)}" aria-label="verbe manquant"></span>`; }).replace(/&#39;/g, "'"));
    z.innerHTML = `<p class="eyebrow">Key West · Radio</p><h1>Retrouvez les ${total} verbes conjugués.</h1>
      <p>${gen ? 'Un message inédit passe à la radio' : 'Écoutez le message de ' + esc(A.qui || 'votre collègue')}, autant de fois que vous voulez, et écrivez chaque verbe manquant tel que vous l'entendez.</p>
      <div class="en-lecteur"><button class="btn plein" id="ec" type="button">▶ Écouter le message</button><button class="btn" id="lent" type="button">Un peu plus lent</button>${GEN ? '<button class="btn" id="autre" type="button">📻 Un autre message</button>' : ''}</div>
      <div class="en-dictee" lang="en">${html.map(l => `<p>${l}</p>`).join('')}</div>
      <div class="en-nav"><button class="btn" id="indice" type="button">Un indice</button><button class="btn plein" id="ver" type="button">Vérifier</button></div><div id="r"></div>`;
    const a = new Audio(gen ? '' : A.audio); let lent = false;
    const voix = () => { try { speechSynthesis.cancel(); const vs = speechSynthesis.getVoices().filter(v => /^en[-_](GB|US)/i.test(v.lang)); const u = new SpeechSynthesisUtterance(lignes.map(nu).join(' ')); u.lang = 'en-GB'; if (vs.length) u.voice = vs.find(v => /natural|premium|enhanced|google/i.test(v.name)) || vs[0]; u.rate = lent ? .75 : .92; speechSynthesis.speak(u); } catch (e) {} };
    z.querySelector('#ec').addEventListener('click', () => { if (gen) return voix(); a.playbackRate = lent ? .8 : 1; a.currentTime = 0; a.play().catch(voix); });
    const autre = z.querySelector('#autre'); if (autre) autre.addEventListener('click', () => { arreter(); dictee(FRGGen.message(N, 4 + Math.floor(Math.random() * 3))); });
    z.querySelector('#lent').addEventListener('click', e => { lent = !lent; e.target.classList.toggle('plein', lent); e.target.textContent = lent ? 'Vitesse lente ✓' : 'Un peu plus lent'; });
    a.onerror = () => { if (!gen) z.querySelector('#r').innerHTML = INFO('L\'enregistrement de ce module arrive bientôt : la voix de votre appareil lit le message en attendant.'); };
    const champs = [...z.querySelectorAll('.en-trou input')]; champs.forEach((c, k) => c.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); (champs[k + 1] || z.querySelector('#ver')).focus(); } }));
    z.querySelector('#indice').addEventListener('click', () => { const c = champs.find(c => norm(c.value) !== norm(c.dataset.bon)); if (!c) return; c.value = c.dataset.bon.slice(0, Math.min(c.dataset.bon.length - 1, Math.max(1, Math.ceil(c.dataset.bon.length / 3)))); c.focus(); c.classList.add('indice'); });
    z.querySelector('#ver').addEventListener('click', () => { let bons = 0; champs.forEach(c => { const ok = norm(c.value) === norm(c.dataset.bon); if (ok) bons++; c.classList.toggle('ok', ok); c.classList.toggle('ko', !ok);
        let t = c.parentNode.querySelector('.etq'); if (!t) { t = document.createElement('span'); t.className = 'etq'; c.parentNode.append(t); } t.textContent = ok ? (c.dataset.c === 's' ? '-s' : c.dataset.c === 'ed' ? '-ed' : c.dataset.c) : c.dataset.bon; });
      const p = Math.round(bons / total * 100);
      z.querySelector('#r').innerHTML = (p === 100 ? OK('Les ' + total + ' verbes, sans faute. Votre oreille entend maintenant les codes.') : KO(`${bons} / ${total}. Sous chaque case rouge : le verbe attendu. Réécoutez en regardant le texte, puis corrigez.`))
        + `<div class="en-nav"><button class="btn plein" type="button" id="finir">Terminer</button></div>`;
      if (A.q.length) { const [qq, ch, b] = A.q[Math.floor(Math.random() * A.q.length)], o = melange(ch.map((c, j) => ({ c, j }))); z.querySelector('#r').insertAdjacentHTML('afterbegin', `<div class="exo"><b>Et vous avez compris ?</b><p style="margin:0">${qq}</p><div class="choix" id="cq">${o.map(c => `<button class="puce" type="button" data-j="${c.j}">${esc(c.c)}</button>`).join('')}</div></div>`);
        z.querySelectorAll('#cq .puce').forEach(pp => pp.addEventListener('click', () => { if (z.querySelector('#cq').dataset.f) return; z.querySelector('#cq').dataset.f = 1; pp.classList.add(+pp.dataset.j === b ? 'ok' : 'ko'); z.querySelector(`#cq [data-j="${b}"]`).classList.add('ok'); })); }
      z.querySelector('#finir').addEventListener('click', () => fin(p === 100 ? 'Sans faute.' : p + ' % des verbes trouvés.', `<p>La dictée entraîne les deux à la fois : l'oreille, et le réflexe du code. Refaites-la demain sans l'indice.</p>`, 'dictee', p)); });
  }

  /* ---------- 3 · Chasse aux erreurs ---------- */
  function chasse(){
    if (A.erreurs.length < 3 && !GEN) return vide('chasse');
    arreter(); const rev = tirerRevoir('erreurs', 2), rap = choisir(A.rap.erreurs, 'chasse-r', 2), cur = choisir(A.erreurs, 'chasse', 2), pieges = [...rev, ...rap, ...cur, ...(GEN ? Array.from({ length: Math.max(0, 8 - rev.length - rap.length - cur.length) }, () => FRGGen.erreur(N)) : [])].slice(0, 8), justes = [...choisir(A.justes, 'juste', 1), ...(GEN ? [FRGGen.juste(N)] : [])].map(t => ({ mots: t.split(' '), faux: -1 }));
    const tours = melange([...pieges, ...justes]); let i = 0, bons = 0;
    const tour = () => { if (i >= tours.length) { const p = Math.round(bons / tours.length * 100); return fin(`${bons} / ${tours.length}.`, `<p>${p >= 80 ? 'Votre œil repère le code qui manque. C\'est exactement ce que fera votre interlocuteur, sans vous le dire.' : 'Le réflexe : pour chaque phrase, cherchez le verbe, puis demandez-vous quel temps et quel code.'}</p>`, 'chasse', p); }
      const x = tours[i]; avancer(i, tours.length, 'Chasse aux erreurs');
      z.innerHTML = `<p class="eyebrow">Everglades · ${i + 1} / ${tours.length}</p>${tag(x)}<h1>Un mot est-il faux ?</h1><p>Touchez le mot faux. Si la phrase est juste, dites-le.</p>
        <p class="en-chasse" lang="en">${x.mots.map((m, k) => `<button type="button" class="en-mot" data-k="${k}">${esc(m)}</button>`).join(' ')}</p>
        <div><button class="btn" type="button" id="juste">Cette phrase est juste</button></div><div id="r"></div>`;
      const r = z.querySelector('#r'); let essai = 0;
      const suite = ok => { if (ok) { bons++; reussir(x); } else if (x.faux >= 0) rater('erreurs', x, x.m); r.insertAdjacentHTML('beforeend', `<div class="en-nav"><button class="btn plein" type="button" id="suiv">Suivante</button></div>`); z.querySelector('#suiv').addEventListener('click', () => { i++; tour(); }); z.querySelector('#juste').disabled = true; z.querySelectorAll('.en-mot').forEach(b => b.disabled = true); };
      z.querySelector('#juste').addEventListener('click', () => { if (x.faux < 0) { r.innerHTML = OK('Exact : rien à reprendre. Savoir laisser une phrase juste, c\'est aussi un réflexe.'); suite(true); }
        else { r.innerHTML = KO('Il y avait un piège : <b>' + esc(x.mots[x.faux]) + '</b> → <b>' + esc(x.bon) + '</b>. ' + (x.ex || '')); z.querySelector(`[data-k="${x.faux}"]`).classList.add('ko'); suite(false); } });
      z.querySelectorAll('.en-mot').forEach(b => b.addEventListener('click', () => { const k = +b.dataset.k;
        if (k !== x.faux) { essai++; b.classList.add('ko-l'); r.innerHTML = KO(x.faux < 0 ? 'Ce mot est juste. Et les autres ?' : 'Ce mot-là est juste. Cherchez le verbe.'); if (essai >= 2) { if (x.faux >= 0) z.querySelector(`[data-k="${x.faux}"]`).classList.add('ko'); r.innerHTML = KO(x.faux < 0 ? 'La phrase était juste.' : 'Le mot faux : <b>' + esc(x.mots[x.faux]) + '</b> → <b>' + esc(x.bon) + '</b>. ' + (x.ex || '')); suite(false); } return; }
        b.classList.add('ko'); const ch = melange([...new Set([x.bon, pieger(x.bon), x.mots[x.faux].replace(/[.,!?…]+$/, '')].filter(Boolean))]);
        const md = modalite(); if (md !== 'qcm') { r.innerHTML = INFO(md === 'oral' ? 'Trouvé. Dites la phrase corrigée.' : 'Trouvé. Écrivez la bonne forme.') + '<div id="sz"></div>'; b.classList.add('ko');
          const phraseJuste = x.mots.map((w, k) => k === x.faux ? x.bon + (w.match(/[.,!?…]+$/) || [''])[0] : w).join(' ');
          saisir(r.querySelector('#sz'), md === 'oral' ? phraseJuste.replace(/[.,!?…]+$/, '') : x.bon, md, ok => { r.insertAdjacentHTML('beforeend', ok ? OK('Réparé. ' + (x.ex || '')) : KO('Il fallait <b>' + esc(x.bon) + '</b>. ' + (x.ex || ''))); b.textContent = x.bon; b.classList.remove('ko'); b.classList.add('ok'); suite(ok && essai === 0); });
          return; }
        r.innerHTML = INFO('Trouvé. Quelle est la bonne forme ?') + `<div class="choix">${ch.map(c => `<button class="puce" type="button" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
        r.querySelectorAll('[data-c]').forEach(p => p.addEventListener('click', () => { const ok = p.dataset.c === x.bon; p.classList.add(ok ? 'ok' : 'ko'); r.insertAdjacentHTML('beforeend', ok ? OK('Réparé. ' + (x.ex || '')) : KO('Il fallait <b>' + esc(x.bon) + '</b>. ' + (x.ex || ''))); b.textContent = x.bon; b.classList.remove('ko'); b.classList.add('ok'); suite(ok && essai === 0); }, { once: true })); })); };
    tour();
  }

  /* ---------- 4 · Le chantier ---------- */
  function chantier(){
    const base = A.phrases.filter(p => p.blocs.length >= 3), rev = tirerRevoir('phrases', 1), rap = choisir(A.rap.phrases.filter(p => p.blocs.length >= 3), 'chantier-r', 2), cur = choisir(base, 'chantier', GEN ? 2 : 6), P = melange([...rev, ...rap, ...cur, ...(GEN ? Array.from({ length: Math.max(0, 8 - rev.length - rap.length - cur.length) }, () => FRGGen.blocs(N)) : [])]).slice(0, 8); if (P.length < 2) return vide('chantier');
    arreter(); let i = 0, bons = 0;
    const tour = () => { if (i >= P.length) { const p = Math.round(bons / P.length * 100); return fin(`${bons} / ${P.length} du premier coup.`, `<p>Qui, fait quoi, à quoi : l'ordre ne bouge jamais. ${p >= 80 ? 'Il devient un réflexe.' : 'Refaites le chantier : chaque partie est différente.'}</p>`, 'chantier', p); }
      const x = P[i], bon = x.blocs.join(' '); let mel = melange(x.blocs.map((b, k) => ({ b, k }))); if (mel.every((m, k) => m.k === k)) mel = mel.reverse();
      avancer(i, P.length, 'Le chantier'); let pose = [], essai = 0; const md = modalite();
      if (md !== 'qcm') { z.innerHTML = `<p class="eyebrow">Cap Canaveral · étage ${i + 1} / ${P.length}</p>${tag(x)}${BADGE[md]}<h1>${x.fr ? (md === 'oral' ? 'Dites-le en anglais.' : 'Écrivez-le en anglais.') : (md === 'oral' ? 'Dites la phrase dans l\'ordre.' : 'Écrivez la phrase dans l\'ordre.')}</h1>${x.fr ? `<p class="phrase">« ${esc(x.fr)} »</p>` : `<p class="en-melange" lang="en">${mel.map(m => `<span>${esc(m.b)}</span>`).join(' ')}</p>`}<div id="sz"></div><div id="r"></div>`;
        saisir(z.querySelector('#sz'), bon.replace(/[.!?]+$/, ''), md, ok => { if (ok) { bons++; reussir(x); } else rater('phrases', x, x.m); z.querySelector('#r').innerHTML = (ok ? OK('Exact.') : KO('La phrase : <b lang="en">' + esc(bon) + '</b>')) + `<div class="en-nav"><button class="btn plein" id="suiv" type="button">Suivante</button></div>`; z.querySelector('#suiv').addEventListener('click', () => { i++; tour(); }); }, md === 'oral' ? 'Dites toute la phrase.' : 'Votre phrase');
        return; }
      z.innerHTML = `<p class="eyebrow">Cap Canaveral · étage ${i + 1} / ${P.length}</p>${tag(x)}<h1>${x.fr ? 'Dites-le en anglais.' : 'Remettez la phrase dans l\'ordre.'}</h1>${x.fr ? `<p class="phrase">« ${esc(x.fr)} »</p>` : '<p>Touchez les blocs dans l\'ordre. Touchez un bloc posé pour le retirer.</p>'}
        <div class="en-pose" id="pose" lang="en"></div><div class="choix" id="blocs" lang="en">${mel.map(m => `<button class="bloc" type="button" data-k="${m.k}">${esc(m.b)}</button>`).join('')}</div><div id="r"></div>`;
      const poseE = z.querySelector('#pose'), blocs = z.querySelector('#blocs'), r = z.querySelector('#r');
      const rendre = () => { poseE.innerHTML = pose.map((k, j) => `<button class="bloc pose" type="button" data-j="${j}">${esc(x.blocs[k])}</button>`).join('') || '<span class="doux petit">Votre phrase se construit ici.</span>';
        poseE.querySelectorAll('[data-j]').forEach(b => b.addEventListener('click', () => { const k = pose.splice(+b.dataset.j, 1)[0]; blocs.querySelector(`[data-k="${k}"]`).hidden = false; rendre(); }));
        if (pose.length === x.blocs.length) { const tente = pose.map(k => x.blocs[k]).join(' ');
          if (norm(tente) === norm(bon)) { if (!essai) { bons++; reussir(x); } else rater('phrases', x, x.m); r.innerHTML = OK(essai ? 'C\'est ça.' : 'Du premier coup.') + `<div class="en-nav"><button class="btn plein" id="suiv" type="button">Suivante</button></div>`; z.querySelector('#suiv').addEventListener('click', () => { i++; tour(); }); }
          else { essai++; r.innerHTML = KO(essai >= 2 ? 'La bonne phrase : <b lang="en">' + esc(bon) + '</b>. Reconstruisez-la pour continuer.' : 'Pas tout à fait. Commencez par qui fait l\'action, puis le verbe.'); } } else r.innerHTML = ''; };
      blocs.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => { pose.push(+b.dataset.k); b.hidden = true; rendre(); })); rendre(); };
    tour();
  }

  /* ---------- 5 · Cartes mémoire ---------- */
  function cartes(){
    if (A.cartes.length < 3) return vide('cartes');
    arreter(); if (GEN) { A.cartes = A.cartes.filter(c => !c.gen); for (let j = 0; j < 8; j++) { const x = FRGGen.nouvelle(N); const c = ['Quelle forme ? <span lang="en" style="display:block;font-weight:500;margin-top:8px">' + esc((x.avant ? x.avant + ' ' : '') + '___ ' + x.apres + x.fin) + '</span>', x.ex, '<em>' + esc(FRGGen.entiere(x)) + '</em>']; c.gen = 1; A.cartes.push(c); } }
    A.cartes = A.cartes.filter(c => !c.rp); [...choisir(A.rap.cartes, 'cartes-r', 3), ...tirerRevoir('cartes', 2).map(o => { const c = [o[0], o[1], o[2]]; c.m = o.m; c.arev = 1; return c; })].forEach(c => { const d = [c[0], c[1], c[2]]; d.m = c.m; d.arev = c.arev; d.rp = 1; A.cartes.push(d); });
    const cle = 'frg-cartes-' + N, M = lire(cle, {}); let pile = melange(A.cartes.map((c, k) => k)).sort((a, b) => (M[a] || 0) - (M[b] || 0)), sues = new Set(), vues = 0;
    const tour = () => { if (!pile.length) { const n = Object.values(lire(cle, {})).filter(v => v >= 2).length; return fin(`${sues.size} carte${sues.size > 1 ? 's' : ''} sue${sues.size > 1 ? 's' : ''} sur ${A.cartes.length}.`, `<p>${n} carte${n > 1 ? 's' : ''} maîtrisée${n > 1 ? 's' : ''} au total (sue deux fois ou plus). Celles que vous avez ratées passent en premier la prochaine fois.</p>`, 'cartes', n); }
      const k = pile.shift(), c = A.cartes[k]; vues++; avancer(sues.size, A.cartes.length, 'Cartes mémoire');
      z.innerHTML = `<p class="eyebrow">Orlando · ${sues.size} / ${A.cartes.length} cartes</p>${tag(c)}
        <button class="en-flip" type="button" id="flip" aria-label="Retourner la carte"><span class="en-recto"><small>Question</small><b>${c[0]}</b><span class="doux petit">Dites la règle et un exemple, à voix haute. Puis retournez.</span></span><span class="en-verso" hidden><small>Réponse</small><span>${c[1]}</span>${c[2] ? `<span class="en-exemple" lang="en">${c[2]}</span>` : ''}</span></button>
        <div class="en-nav" id="eval" hidden><button class="btn" type="button" id="non">À revoir</button><button class="btn plein" type="button" id="oui">Je savais</button></div>`;
      const fl = z.querySelector('#flip');
      fl.addEventListener('click', () => { fl.classList.add('retourne'); fl.querySelector('.en-recto').hidden = true; fl.querySelector('.en-verso').hidden = false; z.querySelector('#eval').hidden = false; }, { once: true });
      z.querySelector('#oui').addEventListener('click', () => { reussir([c[0], c[1], c[2]]); const m = lire(cle, {}); m[k] = (m[k] || 0) + 1; ecrire(cle, m); sues.add(k); tour(); });
      z.querySelector('#non').addEventListener('click', () => { if (!c.gen) rater('cartes', [c[0], c[1], c[2]], c.m); const m = lire(cle, {}); m[k] = 0; ecrire(cle, m); pile.splice(Math.min(2, pile.length), 0, k); tour(); }); };
    tour();
  }

  charger().then(async D => { A = adapter(D);
    const avant = [...new Set([N - 1, N - 2, N > 3 ? 1 + Math.floor(Math.random() * (N - 3)) : 0].filter(k => k >= 1))];
    A.rap = { qcm: [], erreurs: [], phrases: [], cartes: [] };
    for (const k of avant) { try { const B = adapter(await charger(k), k); ['qcm', 'erreurs', 'phrases', 'cartes'].forEach(c => (B[c] || []).forEach(it => { if (Array.isArray(it)) { const o = it.slice(); o.m = k; A.rap[c].push(o); } else A.rap[c].push(Object.assign({}, it, { m: k })); })); } catch (e) {} } nom.textContent = 'Entraînement · module ' + N; const x = q.get('x'); ({ sprint, dictee, chasse, chantier, cartes })[x] ? lancer(x) : menu(); })
    .catch(() => { z.innerHTML = '<h1>Bientôt</h1><p>Les exercices de ce module arrivent avec sa mise en ligne.</p><div><a class="btn" href="espace-eleve.html">Retour aux modules</a></div>'; });
  window.FRGEntr = { EX };
})();
