/* Frenglais · le niveau final. Les tuiles montent ; la plus haute est celle à taper.
   EN : la tuile est en français, on tape l'anglais. FR : la tuile est en anglais, on tape le français.
   Une faute de frappe, ou une tuile qui touche le haut : tout retombe à zéro. Le rythme accélère sans fin.
   Débloqué quand les 32 modules sont validés (sur cet appareil). */
(function(){
  'use strict';
  const $ = s => document.querySelector(s), terrain = $('#terrain'), ec = $('#ec'), inp = $('#in'), sc = $('#sc'), rec = $('#rec'), vit = $('#vit');
  const lire = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[.,!?;:«»"]/g, '').replace(/\s+/g, ' ').trim();
  const brut = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’‘`]/g, "'").replace(/[.,!?;:«»"]/g, '').replace(/\s+/g, ' ').replace(/^\s+/, '');

  /* ---------- débloquage : les 32 modules validés, d'après la progression enregistrée sur le serveur (tous les appareils) ---------- */
  const API = 'https://courbe-classement.paulodubmx84.workers.dev';
  const locaux = () => Array.from({ length: 32 }, (_, i) => i + 1).filter(n => { const l = lire('frg-m' + n, null); return l && l.valide; });
  const essai = /[?&]apercu\b/.test(location.search) || !!window.FRG_APERCU;
  let valides = locaux().length;
  const verrou = (n, msg) => { ec.innerHTML = `<svg class="fg-cadenas" viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true"><rect x="3" y="1" width="6" height="1" fill="#FFD25A"/><rect x="2" y="2" width="1" height="4" fill="#FFD25A"/><rect x="9" y="2" width="1" height="4" fill="#FFD25A"/><rect x="1" y="5" width="10" height="6" fill="#FFD25A"/><rect x="5" y="7" width="2" height="2" fill="#0A1330"/></svg>
      <h1>FRENGLAIS</h1><p>${msg || 'Le niveau final se débloque quand vous avez validé les 32 modules.'}</p><p class="fg-gros">${n} / 32</p><a class="btn plein" href="entrainement.html">Retour à l'entraînement</a>`; };
  async function verifier(){
    if (valides >= 32 || essai) return true;
    let S0 = null; try { S0 = JSON.parse(localStorage.getItem('frg-session') || 'null'); } catch (e) {}
    if (!S0 || !S0.jeton) { verrou(valides, 'Le niveau final se débloque quand vous avez validé les 32 modules. Connectez-vous à votre espace élève pour retrouver votre progression.'); return false; }
    verrou(valides, 'Vérification de votre progression…');
    try { const r = await (await fetch(API + '/eleve/session', { method: 'POST', body: JSON.stringify({ jeton: S0.jeton }) })).json();
      if (r && r.ok) { const serveur = Object.entries(r.prog || {}).filter(([n, p]) => p && p.v && +n >= 1 && +n <= 32).map(([n]) => +n); valides = new Set([...locaux(), ...serveur]).size; } } catch (e) {}
    if (valides >= 32) return true; verrou(valides); return false;
  }
  /* ---------- le contenu : des mots, puis des phrases ; de plus en plus longues ---------- */
  const MOTS = []; Object.values(window.VOCAB || {}).forEach(L => L.forEach((pal, niv) => String(pal).split(';').forEach(p => { const [fr, en] = p.split('|'); if (fr && en) MOTS.push({ fr: fr.trim(), en: en.trim(), niv }); })));
  const PH = (window.FRG_PHRASES || []).map(p => { const [fr, en] = p.split('|'); return { fr, en: en.split('/').map(x => x.trim()) }; });
  const r = a => a[Math.floor(Math.random() * a.length)];
  function tirer(score){
    const sens = Math.random() < .62 ? 'en' : 'fr';
    const phrase = score >= 12 && Math.random() < Math.min(.75, .2 + score / 120);
    if (phrase && sens === 'en') { const p = r(PH); return { sens, montre: p.fr, ok: p.en }; }
    if (phrase && score >= 40) { const p = r(PH); return { sens, montre: p.en[0], ok: [p.fr] }; }
    const niv = Math.min(3, Math.floor(score / 25)), M = MOTS.filter(m => m.niv <= niv), m = r(M.length ? M : MOTS);
    return sens === 'en' ? { sens, montre: m.fr, ok: m.en.split('/').map(x => x.trim()) } : { sens, montre: m.en, ok: m.fr.split('/').map(x => x.trim()) };
  }

  /* ---------- sons 8-bit ---------- */
  let AC = null; const son = (f, d, w = 'square', v = .045, dt = 0) => { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + dt; o.type = w; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d); } catch (e) {} };

  /* ---------- la partie ---------- */
  let tuiles = [], score = 0, best = lire('frg-frenglais-record', 0), vitesse = 0, dernier = 0, prochaine = 0, enJeu = false, raf = 0;
  rec.textContent = best;
  const H = () => terrain.clientHeight, HAUT = 30;
  function creer(t){ const d = document.createElement('div'); d.className = 'fg-tuile ' + (t.sens === 'en' ? 'fr' : 'en'); d.innerHTML = `<i>${t.sens === 'en' ? 'FR' : 'EN'}</i><span>${esc(t.montre)}</span>`; terrain.append(d); t.el = d; t.y = H() - 10; d.style.transform = `translateY(${t.y}px)`; tuiles.push(t); activer(); }
  function activer(){ tuiles.forEach((t, i) => t.el.classList.toggle('active', i === 0)); inp.lang = tuiles[0] ? (tuiles[0].sens === 'fr' ? 'fr' : 'en') : 'en'; inp.placeholder = tuiles[0] ? (tuiles[0].sens === 'fr' ? 'En français…' : 'In English…') : ''; }
  const niveau = () => 1 + Math.floor(score / 10);
  function boucle(ts){
    if (!enJeu) return; const dt = Math.min(.05, (ts - dernier) / 1000 || 0); dernier = ts;
    vitesse = 26 + score * 2.4 + Math.pow(score, 1.35) * .35;              /* pixels par seconde : ça monte doucement, puis vite */
    const ecart = Math.max(70, 150 - score * 1.2);                         /* espace entre deux tuiles */
    const bas = tuiles.length ? tuiles[tuiles.length - 1].y : -1e9;
    if (!tuiles.length || H() - 10 - bas >= ecart) creer(tirer(score + tuiles.length));
    for (const t of tuiles) { t.y -= vitesse * dt; t.el.style.transform = `translateY(${t.y}px)`; }
    if (tuiles[0] && tuiles[0].y <= HAUT) return perdu('La tuile a touché le haut.', tuiles[0]);
    raf = requestAnimationFrame(boucle);
  }
  function majScore(){ sc.textContent = score; vit.textContent = 'VITESSE ' + niveau(); }
  function reussi(){ const t = tuiles.shift(); t.el.classList.add('boum'); setTimeout(() => t.el.remove(), 260); score++; majScore(); inp.value = ''; inp.classList.remove('ko');
    son(523 + Math.min(score, 30) * 18, .07); if (score % 10 === 0) { [784, 988, 1175].forEach((f, i) => son(f, .1, 'square', .04, i * .08)); } activer(); }
  function perdu(raison, t){
    enJeu = false; cancelAnimationFrame(raf); inp.disabled = true; son(200, .2, 'sawtooth', .05); son(110, .35, 'sawtooth', .05, .15);
    const record = score > best; if (record) { best = score; ecrire('frg-frenglais-record', best); rec.textContent = best; }
    const att = t ? t.ok[0] : '';
    ec.hidden = false; ec.innerHTML = `<h1>${record && score ? 'NOUVEAU RECORD' : 'RETOUR A ZERO'}</h1><p class="fg-gros">${score}</p><p>${esc(raison)}${t ? `<br>« ${esc(t.montre)} » → <b>${esc(att)}</b>` : ''}</p><button class="btn plein" id="go" type="button">Rejouer</button><p class="petit doux">Entrée pour rejouer</p>`;
    $('#go').addEventListener('click', partir); $('#go').focus();
  }
  function partir(){
    tuiles.forEach(t => t.el.remove()); tuiles = []; score = 0; majScore(); ec.hidden = true; inp.disabled = false; inp.value = ''; inp.classList.remove('ko'); inp.focus();
    enJeu = true; dernier = performance.now(); raf = requestAnimationFrame(boucle);
  }
  inp.addEventListener('input', () => {
    if (!enJeu || !tuiles[0]) return; const t = tuiles[0], v = brut(inp.value);
    if (!v) return;
    if (t.ok.some(o => norm(o) === norm(inp.value))) return reussi();
    if (!t.ok.some(o => norm(o).startsWith(v))) { inp.classList.add('ko'); perdu('Faute de frappe.', t); }
  });
  $('#f').addEventListener('submit', e => { e.preventDefault(); if (!enJeu) { partir(); return; } const t = tuiles[0]; if (t && !t.ok.some(o => norm(o) === norm(inp.value))) perdu('Ce n\'est pas tout à fait ça.', t); });
  document.addEventListener('keydown', e => { if (!enJeu && e.key === 'Enter' && !ec.hidden && document.activeElement !== inp) { e.preventDefault(); partir(); } });

  verifier().then(ok => { if (!ok) return;
  ec.innerHTML = `<h1>FRENGLAIS</h1><p>Le niveau final. Les tuiles montent : tapez la plus haute avant qu'elle touche le haut.</p><p>Tuile <b style="color:#9DBBFA">EN</b> : elle est en anglais, tapez-la en français.<br>Tuile <b style="color:#F0766F">FR</b> : elle est en français, tapez-la en anglais.<br>Accents facultatifs. Une faute de frappe, et tout retombe à zéro.</p>${valides < 32 ? '<p class="petit doux">Aperçu : normalement débloqué après les 32 modules.</p>' : ''}<button class="btn plein" id="go" type="button">Jouer</button>`;
  $('#go').addEventListener('click', partir); });
  window.FRGFrenglais = { etat: () => ({ score, tuiles: tuiles.map(t => ({ montre: t.montre, ok: t.ok })) }) };
})();
