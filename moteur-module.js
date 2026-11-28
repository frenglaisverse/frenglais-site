/* Moteur commun des modules 2 à 32 : le contenu vit dans modules/mNN.js (window.MOD), le moteur l'affiche
   en huit temps, toujours dans le même ordre. Même mécanique que le module 1 : « Suivant » reste grisé tant que
   l'écran n'est pas fait, seul le premier essai compte, module validé à partir de 90 % réussi du premier coup. */
(function(){
  const D = window.MOD, C = window.Correcteur;
  const $ = s => document.querySelector(s);
  const ecran = $('#ecran'), suiv = $('#suiv'), prec = $('#prec'), verrou = $('#verrou');
  if (!D) { ecran.innerHTML = '<h1>Module introuvable.</h1><p><a href="espace-eleve.html">Retour aux modules</a></p>'; suiv.hidden = prec.hidden = true; return; }
  const N = D.n, CLE = 'frg-m' + N, SEUIL = 90;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const el = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content; };
  const melange = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const OK = t => `<div class="retour-msg ok">${t}</div>`, KO = t => `<div class="retour-msg ko">${t}</div>`;
  /* la voix du livre : court, direct, en franglais, au vouvoiement */
  let _v = 0; const YES = () => ['Exact.', 'C\'est ça.', 'Oui.', 'Juste.', 'Bien vu.'][_v++ % 5];
  let _n = 0; const NON = t => 'Non. ' + t;

  /* état de l'élève, gardé sur l'appareil */
  let E = { step:0, max:0, fini:false, faits:{}, notes:{}, erreurs:[], temps:{} };
  try { Object.assign(E, JSON.parse(localStorage.getItem(CLE) || '{}')); } catch (e) {}
  let P = {}; try { P = JSON.parse(localStorage.getItem('frg-profil') || '{}'); } catch (e) {}
  let M1 = {}; try { M1 = JSON.parse(localStorage.getItem('frg-m1') || '{}'); } catch (e) {}
  const u = new URLSearchParams(location.search);
  const SECTS = { pro:'Professionnels', hotel:'Hôtels', luxe:'Luxe', tour:'Tourisme', immo:'Immobilier' };
  E.sect = (u.get('secteur') && SECTS[u.get('secteur')]) ? u.get('secteur') : (P.secteur && SECTS[P.secteur] ? P.secteur : (M1.sect && SECTS[M1.sect] ? M1.sect : (E.sect || 'pro')));
  E.prenom = E.prenom || P.prenom || M1.prenom || '';
  const ACT = (u.get('activite') || P.activite || '').slice(0, 80);
  const S = () => E.sect;
  const parSecteur = v => (v && typeof v === 'object' && !Array.isArray(v) && (v.pro || v.hotel)) ? (v[S()] || v.pro) : v;
  const sauver = () => { try { localStorage.setItem(CLE, JSON.stringify(E)); localStorage.setItem(CLE + '-pct', String(Math.round(pct()))); } catch (e) {} };
  const PARC = window.FRGA ? FRGA.niveau() : 'std', FOND = PARC === 'fond', APPR = PARC === 'appr';   /* parcours adaptatif */
  const aRevoir = q => { if (!FOND) return; E.revoir = E.revoir || []; if (!E.revoir.some(x => x[0] === q[0])) { E.revoir.push(q); sauver(); } };
  const noter = (cle, ok) => { E.notes = E.notes || {}; if (!(cle in E.notes)) { E.notes[cle] = ok ? 1 : 0; sauver(); } };
  const prenom = t => String(t).replace(/\{prenom\}/g, E.prenom || 'Alex');
  { const t = $('#mod-titre'); if (t) t.textContent = `${N > 24 ? 'Atelier d\'oral ' + (N - 24) + '/8' : 'Module ' + N + ' · ' + N + '/24'} · ${ACT || SECTS[S()]}`; document.title = `${N > 24 ? "Atelier " + (N - 24) : "Module " + N} · ${D.titre} · Frenglais`; }

  const AV = '<span class="av" aria-hidden="true"><svg viewBox="0 0 34 34"><rect width="34" height="34" fill="#8E9AA6"/><ellipse cx="17" cy="21" rx="10" ry="7.5" fill="#A9B3BC"/><circle cx="12" cy="13" r="1.8" fill="#1B2430"/><circle cx="22" cy="13" r="1.8" fill="#1B2430"/><circle cx="14" cy="20" r=".9" fill="#5C6670"/><circle cx="20" cy="20" r=".9" fill="#5C6670"/><path d="M13 24 q4 3 8 0" stroke="#5C6670" stroke-width="1.2" fill="none"/></svg></span>';
  const ENV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';

  /* voix : l'enregistrement de Paul s'il existe (audio/mNN-ecoute.mp3), sinon la synthèse vocale en attendant */
  const voixEN = () => (('speechSynthesis' in window) ? speechSynthesis.getVoices() : []).filter(v => /^en[-_](US|GB)/i.test(v.lang));
  function dire(texte, idx, fin){
    if (!('speechSynthesis' in window)) { fin && fin(false); return; }
    const m = new SpeechSynthesisUtterance(texte.replace(/\{([^|}]+)\|[^}]+\}/g, '$1'));
    const vs = voixEN(); if (vs.length) m.voice = vs[idx % vs.length];
    m.lang = 'en-US'; m.rate = .92; m.pitch = idx % 2 ? 1.08 : .95; m.onend = () => fin && fin(true); m.onerror = () => fin && fin(false);
    speechSynthesis.speak(m);
  }
  function lireDialogue(btn, lignes, note){
    btn.disabled = true;
    const a = new Audio(`audio/m${String(N).padStart(2,'0')}-ecoute.mp3?v=2`);
    a.onended = () => { btn.disabled = false; };
    a.onerror = () => { if (note) note.textContent = 'Voix de synthèse, en attendant l\'enregistrement.'; let k = 0; const suite = ok => { if (ok === false && k === 0) { btn.disabled = false; note && (note.textContent = 'Votre navigateur ne lit pas l\'audio : lisez le texte à l\'étape suivante, puis revenez répondre.'); return; } if (k >= lignes.length) { btn.disabled = false; return; } const [q, t] = lignes[k]; k++; dire(t, q.charCodeAt(0), suite); }; suite(); };
    a.play().catch(() => a.onerror());
  }

  /* ---------- les visuels chocs : un dessin par module ---------- */
  const VIS = {
    /* M2 · la voiture à trois roues : il manque le -s */
    roue: `<svg viewBox="0 0 320 180"><line class="sol" x1="24" y1="151" x2="296" y2="151"/><g class="voiture"><g class="caisse"><path class="f" d="M50 122 q2 -20 28 -23 l24 -27 q7 -8 18 -8 h58 q13 0 21 10 l19 25 q30 3 34 23 v10 h-202 z"/><path class="n" d="M108 96 l18 -21 h26 v21 z M160 75 h20 q6 0 10 5 l12 16 h-42 z"/><line class="tn" x1="156" y1="100" x2="156" y2="128"/><rect class="y" x="242" y="108" width="9" height="8" rx="2"/><circle class="n lw" cx="214" cy="132" r="19"/><circle class="f" cx="214" cy="132" r="6"/></g><g class="roue-s"><g class="roue-tourne"><circle class="n lw" cx="98" cy="132" r="19"/><circle class="f" cx="98" cy="132" r="6"/><path class="tn" d="M98 116 v8 M98 140 v8 M82 132 h8 M106 132 h8"/></g><text class="tb corail" x="98" y="176" text-anchor="middle">-s</text></g></g><g class="manque"><circle class="fant" cx="98" cy="131" r="19"/><text class="tb bleu" x="98" y="137" text-anchor="middle">-s</text><path class="lc clig" d="M58 150 l-12 6 M66 156 l-10 9 M80 158 l-4 11"/></g><g class="vroum"><path class="l" d="M22 104 h16 M14 118 h22 M24 132 h12"/></g><text class="tb vert ok-txt" x="160" y="30" text-anchor="middle">She works.</text></svg>`,
    /* M3 · la lampe UV : went = go + -ed, écrit à l'encre invisible */
    uv: `<svg viewBox="0 0 320 180"><rect class="papier" x="52" y="44" width="170" height="104" rx="6"/><text class="mot" x="68" y="94">went</text><path class="faisceau" d="M262 34 L62 104 L62 140 L200 140 Z"/><text class="encre" x="70" y="130">= go + -ed</text><g transform="rotate(38 262 34)"><rect class="f" x="244" y="20" width="44" height="22" rx="6"/><rect class="n" x="238" y="17" width="10" height="28" rx="3"/><rect class="c" x="268" y="26" width="10" height="10" rx="3"/></g></svg>`,
    /* M4 · REC : l'action est en cours, pas de borne de droite */
    rec: `<svg viewBox="0 0 320 180"><path class="l" d="M40 56 v-20 h22 M258 36 h22 v20 M280 124 v20 h-22 M62 144 h-22 v-20"/><circle class="c clig" cx="62" cy="58" r="7"/><text class="tm" x="76" y="63">REC</text><text class="tm" x="258" y="63" text-anchor="end">00:00:07</text><text class="tb" x="160" y="100" text-anchor="middle">I am working</text><line class="lg" x1="92" y1="122" x2="228" y2="122"/><line class="lg" x1="92" y1="114" x2="92" y2="130"/><path class="lg" d="M218 114 l12 8 l-12 8"/><text class="tm vert" x="92" y="146">début</text><text class="tm vert" x="228" y="146" text-anchor="end">en cours…</text></svg>`,
    /* M5 · l'empreinte dans le ciment : fait avant, visible maintenant */
    ciment: `<svg viewBox="0 0 320 180"><path class="dalle" d="M40 132 l44 -62 h180 l16 62 z"/><path class="dalle2" d="M40 132 h240 v12 h-240 z"/><g transform="rotate(-14 150 100)"><ellipse class="trace" cx="150" cy="92" rx="15" ry="20"/><ellipse class="trace" cx="150" cy="122" rx="10" ry="9"/><path class="tn2" d="M140 86 h20 M139 93 h22 M140 100 h20"/></g><text class="tm" x="84" y="56">T-1</text><text class="tm" x="250" y="56" text-anchor="end">T0</text><path class="ly" d="M112 51 h104 m-9 -6 l9 6 l-9 6"/><text class="tb jaune" x="164" y="36" text-anchor="middle">HAVE + -EN</text></svg>`,
    /* M6 · le rétroviseur dans le rétroviseur : le passé du passé */
    retro: `<svg viewBox="0 0 320 180"><path class="l" d="M160 14 v20"/><rect class="n lw" x="50" y="34" width="220" height="108" rx="40"/><path class="route" d="M110 142 L150 70 h20 L210 142 z"/><path class="tn" d="M160 134 v-12 M160 112 v-10 M160 94 v-8"/><rect class="n lw" x="124" y="50" width="72" height="36" rx="14"/><path class="route" d="M146 86 L156 62 h8 L174 86 z"/><text class="tm corail" x="232" y="124" text-anchor="middle">T-1</text><text class="tm corail" x="160" y="46" text-anchor="middle" style="font-size:10px">T-2</text><text class="tm" x="160" y="164" text-anchor="middle">T0 · vous êtes ici</text></svg>`,
    /* M7 · le clignotant : on annonce ce qui n'a pas encore eu lieu */
    clignotant: `<svg viewBox="0 0 320 180"><path class="routeL" d="M30 150 C120 150 150 120 170 96 S 240 40 296 36"/><path class="tn" d="M40 150 C120 148 150 120 170 96 S 240 40 290 38" stroke-dasharray="10 9"/><g transform="translate(64 112)"><rect class="f" x="0" y="0" width="64" height="30" rx="9"/><path class="n" d="M12 0 l8 -14 h26 l8 14 z"/><circle class="n lw" cx="14" cy="32" r="8"/><circle class="n lw" cx="50" cy="32" r="8"/><rect class="amb clig" x="58" y="6" width="10" height="9" rx="2"/></g><g class="amb"><path class="clig" d="M200 92 l14 -9 v18 z" transform="rotate(-38 207 92)"/><path class="clig d2" d="M226 72 l14 -9 v18 z" transform="rotate(-38 233 72)"/><path class="clig d3" d="M252 52 l14 -9 v18 z" transform="rotate(-38 259 52)"/></g><text class="tb" x="232" y="132" text-anchor="middle">going to</text><text class="tm" x="296" y="26" text-anchor="end">T+1</text></svg>`,
    /* M8 · la barre de réalisation : chaque modal donne un pourcentage */
    barre: `<svg viewBox="0 0 320 180"><text class="tb" x="30" y="50">I ___ come.</text><rect class="fond" x="30" y="84" width="260" height="20" rx="10"/><rect class="y charge" x="30" y="84" width="260" height="20" rx="10"/><g class="tm"><line class="tn" x1="108" y1="78" x2="108" y2="110"/><text x="108" y="128" text-anchor="middle">might</text><text x="108" y="72" text-anchor="middle">30 %</text><line class="tn" x1="160" y1="78" x2="160" y2="110"/><text x="160" y="128" text-anchor="middle">may</text><text x="160" y="72" text-anchor="middle">50 %</text><line class="tn" x1="212" y1="78" x2="212" y2="110"/><text x="212" y="128" text-anchor="middle">should</text><text x="212" y="72" text-anchor="middle">70 %</text><line class="tn" x1="264" y1="78" x2="264" y2="110"/><text x="264" y="128" text-anchor="middle">will</text><text x="264" y="72" text-anchor="middle">90 %</text></g><text class="tm corail" x="30" y="156">Jamais de -s, jamais de to.</text></svg>`,
    /* M9 · les briques : on empile have + -en et be + -ing */
    briques: `<svg viewBox="0 0 320 180"><line class="sol" x1="30" y1="150" x2="290" y2="150"/><g><rect class="by" x="70" y="108" width="180" height="40" rx="6"/><rect class="by" x="92" y="100" width="26" height="10" rx="3"/><rect class="by" x="147" y="100" width="26" height="10" rx="3"/><rect class="by" x="202" y="100" width="26" height="10" rx="3"/><text class="tx" x="160" y="134" text-anchor="middle">HAVE + -EN</text></g><g class="pose"><rect class="bg" x="70" y="60" width="180" height="40" rx="6"/><rect class="bg" x="92" y="52" width="26" height="10" rx="3"/><rect class="bg" x="147" y="52" width="26" height="10" rx="3"/><rect class="bg" x="202" y="52" width="26" height="10" rx="3"/><text class="tx" x="160" y="86" text-anchor="middle">BE + -ING</text></g><text class="tm" x="160" y="170" text-anchor="middle">I have been working</text></svg>`,
    /* M10 · la valise : pour une question, le -s déménage sur does */
    valise: `<svg viewBox="0 0 320 180"><text class="tb" x="44" y="124">Does</text><text class="tb" x="124" y="124">she</text><text class="tb" x="178" y="124">work</text><text class="tb corail" x="236" y="124">?</text><path class="lcd" d="M214 96 C200 44 110 40 78 92"/><path class="lc" d="M70 82 l8 12 l12 -8"/><g class="flot"><rect class="c" x="136" y="34" width="40" height="30" rx="6"/><path class="lc" d="M148 34 v-7 h16 v7"/><text class="tx" x="156" y="55" text-anchor="middle">-s</text></g><line class="tn" x1="178" y1="132" x2="228" y2="132"/><text class="tm" x="203" y="150" text-anchor="middle">verbe nu</text></svg>`,
    /* M11 · le bateau : sinking ou thinking, un son change tout */
    bateau: `<svg viewBox="0 0 320 180"><g transform="rotate(14 110 120)"><path class="f" d="M50 108 h120 l-18 26 h-84 z"/><path class="l" d="M110 108 v-56"/><path class="c" d="M114 56 l38 46 h-38 z"/><rect class="n" x="78" y="94" width="26" height="14" rx="2"/></g><path class="vague" d="M10 140 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/><path class="vague v2" d="M0 156 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/><path class="bulle" d="M150 22 h128 q10 0 10 10 v22 q0 10 -10 10 h-96 l-16 14 l4 -14 h-20 q-10 0 -10 -10 v-22 q0 -10 10 -10z"/><text class="tx nuit" x="214" y="42" text-anchor="middle">What are you</text><text class="tx nuit" x="214" y="58" text-anchor="middle"><tspan class="corailf">th</tspan>inking about?</text></svg>`,
    /* M12 · le pommeau : toute la Courbe tient dans la main */
    pommeau: `<svg viewBox="0 0 320 180"><rect class="gris" x="152" y="104" width="16" height="62" rx="5"/><path class="gris" d="M132 166 h56 l8 10 h-72 z"/><circle class="n lw" cx="160" cy="72" r="56"/><path class="reflet" d="M122 44 q16 -20 44 -22"/><path class="l" d="M118 74 C140 70 152 78 172 73 S 196 70 202 73"/><path class="l" d="M196 66 l8 7 l-8 7"/><g class="tm"><text x="126" y="62" text-anchor="middle">T-1</text><text x="184" y="62" text-anchor="middle">T0</text></g><text class="tm corail" x="126" y="94" text-anchor="middle">-ed</text><text class="tm bleu" x="184" y="94" text-anchor="middle">-s</text></svg>`,
    /* M13 · le couteau suisse : quatre verbes qui font presque tout */
    couteau: `<svg viewBox="0 0 320 180"><path class="f" d="M92 110 L70 40 l10 -4 l28 70 z"/><path class="f" d="M132 104 L128 26 h10 l10 78 z"/><path class="f" d="M180 104 L204 30 l9 4 l-18 72 z"/><path class="f" d="M214 112 L270 62 l7 8 l-52 50 z"/><rect class="c" x="58" y="100" width="204" height="44" rx="22"/><circle class="f" cx="84" cy="122" r="5"/><path class="croix" d="M228 122 h16 M236 114 v16"/><g class="tm"><text x="62" y="30" text-anchor="middle">get</text><text x="133" y="18" text-anchor="middle">make</text><text x="214" y="22" text-anchor="middle">do</text><text x="288" y="58" text-anchor="middle">take</text></g></svg>`,
    /* M14 · le poteau indicateur : la particule donne la direction */
    fleche: `<svg viewBox="0 0 320 180"><line class="sol" x1="90" y1="162" x2="230" y2="162"/><rect class="gris" x="154" y="24" width="12" height="138" rx="4"/><path class="pv" d="M166 34 h84 l16 15 l-16 15 h-84 z"/><text class="tx" x="212" y="54" text-anchor="middle">give up</text><path class="pv2" d="M154 74 h-84 l-16 15 l16 15 h84 z"/><text class="tx" x="106" y="94" text-anchor="middle">give back</text><path class="pv3" d="M166 114 h84 l16 15 l-16 15 h-84 z"/><text class="tx" x="212" y="134" text-anchor="middle">give in</text></svg>`,
    /* M15 · l'accident : « depends of » fonce dans le mur */
    crash: `<svg viewBox="0 0 320 180"><line class="sol" x1="20" y1="150" x2="300" y2="150"/><g class="mur"><rect x="244" y="42" width="34" height="108"/><path class="tn" d="M244 66 h34 M244 90 h34 M244 114 h34 M244 138 h34 M261 42 v24 M252 66 v24 M268 90 v24 M256 114 v24"/></g><g class="fonce"><path class="f" d="M100 128 q2 -14 20 -16 l14 -18 q5 -6 14 -6 h34 q9 0 14 7 l12 17 q20 2 22 16 v8 h-130 z"/><path class="n" d="M138 110 l11 -14 h18 v14 z M172 96 h13 q4 0 7 4 l8 10 h-28 z"/><circle class="n lw" cx="128" cy="138" r="12"/><circle class="n lw" cx="204" cy="138" r="12"/></g><path class="lc clig" d="M232 84 l-14 -8 M234 102 h-16 M232 120 l-14 8"/><text class="tb corail" x="30" y="56">depends of</text><text class="tb vert" x="30" y="84">depends on</text><path class="lc" d="M28 50 h132"/></svg>`,
    /* M16 · le blanc : quatre secondes de silence et la parole est perdue */
    silence: `<svg viewBox="0 0 320 180"><path class="bulle" d="M40 40 h150 q12 0 12 12 v46 q0 12 -12 12 h-96 l-22 20 l5 -20 h-37 q-12 0 -12 -12 v-46 q0 -12 12 -12z"/><circle class="pt clig" cx="88" cy="75" r="7"/><circle class="pt clig d2" cx="115" cy="75" r="7"/><circle class="pt clig d3" cx="142" cy="75" r="7"/><circle class="n lw" cx="248" cy="96" r="38"/><rect class="f" x="242" y="46" width="12" height="12" rx="3"/><path class="l" d="M274 64 l8 -8"/><path class="secteur" d="M248 96 L248 64 A32 32 0 0 1 280 96 Z"/><line class="lc aig" x1="248" y1="96" x2="248" y2="66"/><text class="tb" x="248" y="158" text-anchor="middle">4 s</text><text class="tm" x="115" y="150" text-anchor="middle">Well… let me think.</text></svg>`,
    /* M17 · l'ascenseur : trente secondes pour dire qui vous êtes */
    ascenseur: `<svg viewBox="0 0 320 180"><rect class="n lw" x="96" y="38" width="128" height="124" rx="4"/><rect class="porteg" x="100" y="42" width="58" height="116"/><rect class="ported" x="162" y="42" width="58" height="116"/><g class="perso"><circle cx="160" cy="88" r="11"/><path d="M142 152 v-30 q0 -14 18 -14 t18 14 v30 z"/></g><rect class="n lw" x="132" y="12" width="56" height="20" rx="4"/><text class="tm jaune" x="160" y="27" text-anchor="middle">30 s</text><path class="y" d="M240 92 l8 -12 l8 12 z"/><path class="fond2" d="M240 104 l8 12 l8 -12 z"/><line class="sol" x1="60" y1="163" x2="260" y2="163"/></svg>`,
    /* M18 · l'e-mail : un cadre fixe, quatre lignes qui font tout */
    email: `<svg viewBox="0 0 320 180"><g class="flot"><rect class="papier" x="92" y="20" width="136" height="100" rx="5"/><text class="tm nuit" x="104" y="42">Dear Mr Brown,</text><line class="trait-p" x1="104" y1="56" x2="212" y2="56"/><line class="trait-p" x1="104" y1="68" x2="198" y2="68"/><line class="trait-p" x1="104" y1="80" x2="206" y2="80"/></g><path class="f" d="M60 84 l100 62 l100 -62 v72 q0 6 -6 6 h-188 q-6 0 -6 -6 z"/><path class="tnn" d="M60 162 l76 -50 M260 162 l-76 -50"/><path class="l" d="M60 84 l100 62 l100 -62"/><circle class="c" cx="252" cy="80" r="12"/><text class="tx" x="252" y="85" text-anchor="middle">1</text></svg>`,
    /* M19 · le téléphone : sans les gestes, on épelle */
    telephone: `<svg viewBox="0 0 320 180"><rect class="n lw" x="62" y="20" width="76" height="140" rx="14"/><rect class="ecran" x="70" y="34" width="60" height="104" rx="4"/><circle class="g" cx="100" cy="74" r="14"/><path class="ln" d="M94 70 q-2 8 6 12 q4 0 5 -4 l-4 -3 l-3 2 q-3 -2 -3 -5 l2 -2 l-3 -4z"/><rect class="f" x="88" y="146" width="24" height="4" rx="2"/><path class="lgv clig" d="M152 70 q12 20 0 40"/><path class="lgv clig d2" d="M166 58 q22 32 0 64"/><g class="tm"><rect class="tuile" x="192" y="34" width="100" height="24" rx="6"/><text x="242" y="51" text-anchor="middle">H as in Hotel</text><rect class="tuile" x="192" y="66" width="100" height="24" rx="6"/><text x="242" y="83" text-anchor="middle">A as in Alpha</text><rect class="tuile" x="192" y="98" width="100" height="24" rx="6"/><text x="242" y="115" text-anchor="middle">R as in Romeo</text><rect class="tuile" x="192" y="130" width="100" height="24" rx="6"/><text x="242" y="147" text-anchor="middle">T as in Tango</text></g></svg>`,
    /* M20 · quinze ou cinquante : l'accent du mot fait le prix */
    chiffres: `<svg viewBox="0 0 320 180"><g transform="rotate(-6 92 90)"><path class="f" d="M40 58 h84 l22 32 l-22 32 h-84 q-6 0 -6 -6 v-52 q0 -6 6 -6z"/><circle class="n" cx="126" cy="90" r="5"/><text class="prix" x="78" y="102" text-anchor="middle">15</text></g><g transform="rotate(5 228 90)"><path class="y" d="M176 58 h84 l22 32 l-22 32 h-84 q-6 0 -6 -6 v-52 q0 -6 6 -6z"/><circle class="n" cx="262" cy="90" r="5"/><text class="prix" x="214" y="102" text-anchor="middle">50</text></g><text class="tm" x="92" y="156" text-anchor="middle">fif<tspan class="corailf gras">TEEN</tspan></text><text class="tm" x="228" y="156" text-anchor="middle"><tspan class="corailf gras">FIF</tspan>ty</text><text class="tb corail" x="160" y="40" text-anchor="middle">≠</text></svg>`,
    /* M21 · la balance : comparer, c'est peser deux options */
    balance: `<svg viewBox="0 0 320 180"><path class="gris" d="M124 160 h72 l-10 -10 h-52 z"/><rect class="gris" x="155" y="40" width="10" height="112" rx="3"/><circle class="f" cx="160" cy="38" r="8"/><g transform="rotate(-9 160 38)"><rect class="f" x="62" y="35" width="196" height="6" rx="3"/><path class="tn" d="M70 40 l-22 52 M70 40 l22 52 M250 40 l-22 52 M250 40 l22 52"/><path class="y" d="M40 92 h60 q-4 20 -30 20 t-30 -20z"/><path class="y" d="M220 92 h60 q-4 20 -30 20 t-30 -20z"/><rect class="c" x="232" y="70" width="36" height="22" rx="4"/><text class="tx" x="250" y="86" text-anchor="middle">B</text><rect class="b" x="58" y="76" width="24" height="16" rx="4"/><text class="tx" x="70" y="89" text-anchor="middle" style="font-size:12px">A</text></g><text class="tm" x="268" y="150" text-anchor="middle">bigger than</text></svg>`,
    /* M22 · le train : les idées s'accrochent avec des attelages */
    train: `<svg viewBox="0 0 320 180"><line class="l" x1="14" y1="140" x2="306" y2="140"/><path class="tn" d="M30 140 v8 M60 140 v8 M90 140 v8 M120 140 v8 M150 140 v8 M180 140 v8 M210 140 v8 M240 140 v8 M270 140 v8 M298 140 v8"/><g><path class="f" d="M214 84 h56 q24 4 28 34 v10 h-84 z"/><rect class="n" x="226" y="94" width="26" height="16" rx="3"/><rect class="f" x="276" y="70" width="10" height="18" rx="2"/><circle class="fum flot" cx="282" cy="58" r="6"/><circle class="fum flot d2" cx="294" cy="46" r="4"/><circle class="n lw" cx="232" cy="132" r="9"/><circle class="n lw" cx="278" cy="132" r="9"/></g><g><rect class="f" x="118" y="92" width="76" height="36" rx="5"/><circle class="n lw" cx="136" cy="132" r="9"/><circle class="n lw" cx="176" cy="132" r="9"/></g><g><rect class="f" x="22" y="92" width="76" height="36" rx="5"/><circle class="n lw" cx="40" cy="132" r="9"/><circle class="n lw" cx="80" cy="132" r="9"/></g><line class="att" x1="98" y1="116" x2="118" y2="116"/><line class="att" x1="194" y1="116" x2="214" y2="116"/><text class="tm corail" x="108" y="82" text-anchor="middle">because</text><text class="tm corail" x="204" y="72" text-anchor="middle">so</text></svg>`,
    /* M23 · si… : will + -ed, et le réel devient hypothèse */
    conditionnel: `<svg viewBox="0 0 320 180"><path class="nuage" d="M92 66 q-22 0 -22 -18 q0 -16 18 -18 q6 -18 28 -16 q10 -12 28 -6 q14 -10 30 0 q20 -4 26 12 q20 2 20 20 q0 20 -24 22 q-10 10 -26 4 q-14 10 -30 2 q-16 8 -28 -2 q-12 6 -20 0z"/><text class="tb" x="160" y="52" text-anchor="middle">If I had time…</text><circle class="nuage" cx="112" cy="88" r="6"/><circle class="nuage" cx="100" cy="102" r="4"/><g><rect class="tuileb" x="34" y="118" width="70" height="38" rx="8"/><text class="tb" x="69" y="144" text-anchor="middle">will</text><text class="tb" x="118" y="144" text-anchor="middle">+</text><rect class="tuilec" x="132" y="118" width="60" height="38" rx="8"/><text class="tb" x="162" y="144" text-anchor="middle">-ed</text><path class="l" d="M202 137 h22 m-8 -7 l8 7 l-8 7"/><rect class="tuile" x="234" y="118" width="62" height="38" rx="8"/><text class="tb" x="265" y="144" text-anchor="middle">would</text></g></svg>`,
    /* M24 · la radio : l'anglais réel, tel qu'on le capte */
    radio: `<svg viewBox="0 0 320 180"><path class="l" d="M230 58 l44 -40"/><circle class="c" cx="276" cy="16" r="4"/><rect class="bois" x="50" y="58" width="220" height="100" rx="14"/><rect class="cadran" x="66" y="74" width="120" height="34" rx="6"/><path class="grad" d="M76 82 v8 M88 82 v5 M100 82 v8 M112 82 v5 M124 82 v8 M136 82 v5 M148 82 v8 M160 82 v5 M172 82 v8"/><line class="lc balaie" x1="118" y1="76" x2="118" y2="106"/><text class="tm nuit" x="76" y="103" style="font-size:9px">UK</text><text class="tm nuit" x="176" y="103" text-anchor="end" style="font-size:9px">US</text><circle class="n lw" cx="230" cy="108" r="26"/><circle class="f" cx="230" cy="108" r="6"/><path class="grille" d="M70 124 h112 M70 134 h112 M70 144 h112"/><path class="lgv clig" d="M28 82 q-10 14 0 28"/><path class="lgv clig d2" d="M16 70 q-16 26 0 52"/><text class="tm jaune" x="160" y="42" text-anchor="middle">gonna · wanna · lift</text></svg>`,
    /* M25 · la caméra se retourne : on filme celui qui subit */
    camera: `<svg viewBox="0 0 320 180"><g class="perso estompe"><circle cx="56" cy="82" r="11"/><path d="M38 146 v-30 q0 -14 18 -14 t18 14 v30 z"/></g><g transform="translate(118 56)"><circle class="n lw" cx="14" cy="-6" r="14"/><circle class="n lw" cx="48" cy="-10" r="18"/><rect class="f" x="-4" y="8" width="76" height="46" rx="6"/><path class="f" d="M72 20 l30 -12 v46 l-30 -12z"/><rect class="c clig" x="4" y="16" width="10" height="8" rx="2"/><path class="l" d="M24 54 l-14 46 M44 54 l14 46 M34 54 v46"/></g><rect class="y" x="244" y="96" width="46" height="50" rx="4"/><path class="tnn" d="M244 112 h46 M267 96 v50"/><path class="lcd" d="M96 40 C140 6 220 10 262 76"/><path class="lc" d="M252 66 l10 12 l6 -15"/><line class="sol" x1="20" y1="157" x2="300" y2="157"/><text class="tm" x="267" y="170" text-anchor="middle">is made</text></svg>`,
    /* M26 · la vieille photo : avant, et plus maintenant */
    polaroid: `<svg viewBox="0 0 320 180"><g transform="rotate(-9 110 90)"><rect class="papier vieux" x="56" y="24" width="108" height="128" rx="4"/><rect class="photo sepia" x="66" y="34" width="88" height="84"/><circle class="soleil" cx="134" cy="58" r="10"/><path class="mont" d="M66 118 l26 -34 l18 20 l14 -14 l30 28 z"/><text class="tm nuit" x="110" y="140" text-anchor="middle">I used to…</text></g><g transform="rotate(7 212 96)"><rect class="papier" x="158" y="30" width="108" height="128" rx="4"/><rect class="photo" x="168" y="40" width="88" height="84"/><rect class="imm" x="186" y="64" width="22" height="60"/><rect class="imm" x="212" y="52" width="26" height="72"/><path class="fen" d="M192 72 h10 M192 84 h10 M192 96 h10 M218 62 h14 M218 76 h14 M218 90 h14"/><text class="tm nuit" x="212" y="146" text-anchor="middle">I'm used to…</text></g></svg>`,
    /* M27 · la porte qu'on n'a pas ouverte */
    porte: `<svg viewBox="0 0 320 180"><path class="lueur" d="M176 30 h30 l70 130 h-100 z"/><rect class="n lw" x="108" y="26" width="72" height="134"/><path class="battant" d="M108 26 l52 14 v132 l-52 -12 z"/><circle class="y" cx="150" cy="102" r="4"/><line class="sol" x1="40" y1="160" x2="290" y2="160"/><g class="perso"><circle cx="62" cy="96" r="10"/><path d="M46 158 v-32 q0 -12 16 -12 t16 12 v32 z"/></g><text class="tb" x="240" y="60" text-anchor="middle">should</text><text class="tb jaune" x="240" y="84" text-anchor="middle">have + -en</text></svg>`,
    /* M28 · la marche arrière : chaque verbe recule d'un cran */
    marche: `<svg viewBox="0 0 320 180"><rect class="n lw" x="34" y="24" width="124" height="134" rx="18"/><path class="l" d="M62 52 v78 M96 52 v78 M130 52 v78 M62 91 h68"/><g class="tm"><text x="62" y="44" text-anchor="middle">1</text><text x="96" y="44" text-anchor="middle">3</text><text x="130" y="44" text-anchor="middle">5</text><text x="62" y="148" text-anchor="middle">2</text><text x="96" y="148" text-anchor="middle">4</text></g><circle class="c puls" cx="130" cy="130" r="13"/><text class="tx" x="130" y="135" text-anchor="middle">R</text><g class="tb"><text x="180" y="64" class="corail">was</text><text x="268" y="64">am</text><text x="180" y="104" class="corail">would</text><text x="268" y="104">will</text><text x="180" y="144" class="corail">could</text><text x="268" y="144">can</text></g><path class="lc" d="M260 58 h-18 m8 -6 l-8 6 l8 6 M260 98 h-8 m8 -6 l-8 6 l8 6 M260 138 h-12 m8 -6 l-8 6 l8 6"/></svg>`,
    /* M29 · le curseur : convaincre, c'est le pousser */
    curseur: `<svg viewBox="0 0 320 180"><path class="bulleP" d="M50 26 h220 q10 0 10 10 v26 q0 10 -10 10 h-150 l-16 14 l4 -14 h-58 q-10 0 -10 -10 v-26 q0 -10 10 -10z"/><text class="tx" x="160" y="54" text-anchor="middle">This will save you time.</text><rect class="fond" x="40" y="118" width="240" height="10" rx="5"/><rect class="y" x="40" y="118" width="196" height="10" rx="5"/><circle class="f pousse" cx="236" cy="123" r="15"/><circle class="c pousse" cx="236" cy="123" r="6"/><g class="tm"><text x="60" y="158" text-anchor="middle">might</text><text x="148" y="158" text-anchor="middle">should</text><text x="236" y="158" text-anchor="middle" class="jaune">will</text></g></svg>`,
    /* M30 · trois, deux, un : les trente premières secondes */
    compte: `<svg viewBox="0 0 320 180"><circle class="n lw" cx="112" cy="90" r="62"/><circle class="tnc" cx="112" cy="90" r="48"/><path class="tn" d="M112 28 v124 M50 90 h124"/><path class="balayage" d="M112 90 L112 42 A48 48 0 0 1 160 90 Z"/><text class="gros" x="112" y="112" text-anchor="middle">3</text><g transform="translate(226 46)"><rect class="f" x="-14" y="0" width="28" height="56" rx="14"/><path class="tnn" d="M-14 16 h28 M-14 28 h28 M-14 40 h28"/><path class="l" d="M-24 36 q0 34 24 34 t24 -34 M0 70 v26 M-16 96 h32"/></g></svg>`,
    /* M31 · les clés : la suite vous appartient */
    cles: `<svg viewBox="0 0 320 180"><circle class="l" cx="116" cy="52" r="26" fill="none"/><g transform="translate(34 -30) rotate(24 104 80)"><circle class="y" cx="120" cy="108" r="20"/><circle class="oeil" cx="120" cy="100" r="6"/><rect class="y" x="136" y="103" width="92" height="10" rx="3"/><rect class="y" x="196" y="113" width="10" height="16" rx="2"/><rect class="y" x="214" y="113" width="10" height="11" rx="2"/></g><g transform="translate(-22 2) rotate(-14 88 86)"><rect class="c" x="60" y="92" width="56" height="70" rx="8"/><circle class="oeil" cx="88" cy="104" r="5"/><path class="l" d="M68 132 q12 -5 22 0 t18 0"/><path class="l" d="M102 127 l6 5 l-6 5"/><text class="tm" x="88" y="152" text-anchor="middle">10 min</text></g></svg>`,
    /* M32 · le compteur : trente-deux modules plus tard */
    compteur: `<svg viewBox="0 0 320 180"><path class="arcfond" d="M56 146 a104 104 0 0 1 208 0"/><path class="arcplein tracer" d="M56 146 a104 104 0 0 1 208 0"/><path class="grad" d="M70 146 h12 M84 98 l10 7 M118 62 l6 11 M160 48 v12 M202 62 l-6 11 M236 98 l-10 7 M250 146 h-12"/><g class="tm"><text x="56" y="170" text-anchor="middle">0</text><text x="160" y="78" text-anchor="middle">16</text><text x="264" y="170" text-anchor="middle">32</text></g><line class="lc monte" x1="160" y1="146" x2="160" y2="66"/><circle class="f" cx="160" cy="146" r="9"/><text class="tb" x="160" y="124" text-anchor="middle" style="font-size:15px">24 + 8</text></svg>`
  };

  /* ---------- étapes ---------- */
  const ETAPES = [
    { nom:'Bienvenue', f:bienvenue },
    { nom:'Temps 1 · Posez la Courbe', f:poserCourbe },
    { nom:'Temps 2 · Le déclic', f:choc },
    { nom:'Temps 2 · Les cartes', f:cartes },
    ...(APPR && D.nuances ? [{ nom:'Temps 2 · Nuances', f:nuances }] : []),
    { nom:'Temps 2 · Contrôle', f:controle },
    { nom:'Temps 3 · La vitre', f:vitre },
    ...(APPR && D.expert ? [{ nom:'Temps 3 · Défi expert', f:expert }] : []),
    { nom:'Temps 4 · Comprendre', f:ecoute1 },
    { nom:'Temps 4 · Repérer', f:ecoute2 },
    ...(D.lecture ? [{ nom:'Temps 4 · Lire', f:lecture }] : []),
    { nom:'Temps 5 · Le code', f:code },
    ...(D.machine ? [{ nom:'Temps 5 · La boîte de vitesses', f:boite }] : []),
    { nom:'Temps 6 · Ma version', f:maVersion },
    { nom: N >= 17 ? 'Temps 7 · Le cas pratique' : 'Temps 7 · À voix haute', f:lamantinOral },
    { nom:'Temps 8 · Trois fois plus vite', f:fluidite },
    ...(FOND ? [{ nom:'Révision', f:revision }] : []),
    { nom:'Votre tableau', f:fin }
  ];
  const pct = () => E.fini ? 100 : Math.min(99, (E.max / (ETAPES.length - 1)) * 100);
  const valider = () => { E.faits[E.step] = 1; suiv.disabled = false; verrou.hidden = true; if (E.step + 1 > E.max) E.max = E.step + 1; sauver(); maj(); };
  const TESTEUR = (()=>{try{return !!JSON.parse(localStorage.getItem('frg-cle-tableau')||'""')}catch(e){return false}})();   /* appareil de Paul (clé du tableau de bord) : « Suivant » toujours libre, pour relire sans tout faire */
  function exiger(t){ const f = !!E.faits[E.step]; if (TESTEUR && !f) { suiv.disabled = false; verrou.hidden = false; verrou.textContent = 'Mode test : « Suivant » est libre sur votre appareil.'; return; } suiv.disabled = !f; verrou.hidden = f; verrou.textContent = t || 'Terminez cet écran pour continuer.'; }
  function maj(){ const p = Math.round(pct()); $('#barre').style.width = p + '%'; $('#barre-box').setAttribute('aria-valuenow', p); $('#etape-pct').textContent = p + ' %'; $('#etape-nom').textContent = ETAPES[E.step].nom; }
  function aller(n){
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    E.step = Math.max(0, Math.min(ETAPES.length - 1, n)); sauver(); window.FRG_MOD = { m: N, etape: E.step + 1, total: ETAPES.length };
    ecran.innerHTML = ''; verrou.hidden = true; suiv.disabled = false;
    prec.disabled = E.step === 0; suiv.textContent = E.step === ETAPES.length - 1 ? 'Retour aux modules' : 'Suivant';
    ETAPES[E.step].f(ecran); maj(); ecran.focus({ preventScroll:true }); window.scrollTo({ top:0, behavior:'smooth' });
  }
  suiv.addEventListener('click', () => { if (E.step === ETAPES.length - 1) { location.href = 'espace-eleve.html'; return; } aller(E.step + 1); });
  prec.addEventListener('click', () => aller(E.step - 1));

  /* une question à choix : réutilisée par le rappel, le contrôle, l'écoute et le code */
  /* ordre des choix mélangé, stable pour une même question (pas de position favorite pour la bonne réponse) */
  function ordre(cle, n){ let h = 2166136261; for (const c of String(cle)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); const a = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 13), 1597334677) >>> 0; const k = h % (i + 1); [a[i], a[k]] = [a[k], a[i]]; } return a; }
  function qcm(cont, cle, q, ch, b, ex, surJuste, aide, presque){
    const d = el(`<div class="exo"><p class="phrase">${prenom(q)}</p><div class="choix">${ordre(q, ch.length).map(j => `<button class="puce" type="button" data-j="${j}">${prenom(ch[j])}</button>`).join('')}</div>${FOND && aide ? `<button class="indice-btn" type="button">Un indice</button>` : ''}<div class="r"></div></div>`).firstChild;
    cont.append(d);
    const ib = d.querySelector('.indice-btn'); if (ib) ib.addEventListener('click', () => { ib.outerHTML = `<p class="indice">💡 ${prenom(aide)}</p>`; });
    d.querySelectorAll('.puce').forEach(p => p.addEventListener('click', () => {
      if (d.dataset.fini) return; const j = +p.dataset.j;
      if (presque && presque[j] !== undefined) { noter(cle, true); p.classList.add('presque'); d.dataset.fini = 1; const best = d.querySelector(`.puce[data-j="${b}"]`); if (best) best.classList.add('mieux');
        d.querySelector('.r').innerHTML = `<div class="retour-msg presque"><b>Pas faux.</b> ${prenom(presque[j])}</div>`; surJuste && surJuste(); return; }
      noter(cle, j === b);
      if (j === b) { p.classList.add('ok'); d.dataset.fini = 1; d.querySelector('.r').innerHTML = OK(YES() + (FOND && ex ? ' ' + prenom(ex) : '')); surJuste && surJuste(); }
      else { p.classList.add('ko'); d.querySelector('.r').innerHTML = KO(APPR && !/^(exp|rev)/.test(cle) ? 'Pas tout à fait. Réessayez.' : NON(ex || 'Relisez la question, puis réessayez.')); E.erreurs.push(cle.replace(/\d+$/, '')); if (!/^rev/.test(cle)) aRevoir([q, ch, b, ex, aide]); sauver(); }
    }));
    return d;
  }
  function serieQCM(z, cle, Q, msg){ let bons = 0; const box = el('<div></div>').firstChild; z.append(box);
    Q.forEach(([q, ch, b, ex, aide, presque], i) => qcm(box, cle + i, q, ch, b, ex, () => { if (++bons === Q.length) valider(); }, aide, presque));
    exiger(msg); if (E.faits[E.step]) valider(); }

  /* parcours Approfondi · cartes « Nuance » : les différences fines que les manuels survolent */
  function nuances(z){
    const K = D.nuances; let i = 0;
    z.append(el(`<p class="eyebrow">Temps 2 · Nuances · parcours Approfondi</p><h1>Vous avez la règle. Voici le détail.</h1><div class="carte-lecon speciale" id="carte"></div>
      <div class="cartes-nav"><button class="btn" id="cp" type="button" aria-label="Carte précédente">‹</button><div class="points" id="pts"></div><button class="btn plein" id="cn" type="button">Nuance suivante</button></div>`));
    const c = z.querySelector('#carte'), pts = z.querySelector('#pts'); pts.innerHTML = K.map(() => '<i></i>').join('');
    const montre = () => { const [t, r, x] = K[i]; c.innerHTML = `<span class="num"><b class="etq-carte">Nuance</b> · ${i + 1} / ${K.length}</span><h2>${t}</h2><p>${r}</p>${x ? `<div class="ex">${prenom(x)}</div>` : ''}`;
      pts.querySelectorAll('i').forEach((p, j) => p.classList.toggle('on', j <= i)); z.querySelector('#cp').disabled = i === 0;
      z.querySelector('#cn').textContent = i === K.length - 1 ? 'J\'ai tout lu' : 'Nuance suivante'; if (i === K.length - 1) valider(); };
    z.querySelector('#cp').addEventListener('click', () => { if (i > 0) { i--; montre(); } });
    z.querySelector('#cn').addEventListener('click', () => { if (i < K.length - 1) { i++; montre(); } });
    exiger('Lisez les nuances jusqu\'au bout.'); montre(); if (E.faits[E.step]) valider();
  }
  /* parcours Approfondi · défi expert : pièges, phrases longues, moins d'indices (hors score de validation) */
  function expert(z){
    z.append(el(`<p class="eyebrow">Temps 3 · Défi expert · parcours Approfondi</p><h1>${D.expert.titre || 'Même règle, terrain plus glissant.'}</h1><p>Des phrases plus longues, des pièges que même les bons élèves ratent. L'explication arrive seulement quand c'est juste.</p>`));
    serieQCM(z, 'exp', D.expert.items, 'Trouvez la bonne réponse à chaque question.');
  }
  /* parcours Fondations · révision : tout ce qui a été raté revient, sous forme de questions (hors score de validation) */
  function revision(z){
    const R = (E.revoir || []).slice(-8);
    if (!R.length) { z.append(el(`<p class="eyebrow">Révision · parcours Fondations</p><h1>Rien à revoir.</h1><p>Vous n'avez rien raté dans ce module. Pour ancrer, dites à voix haute trois phrases sur votre journée d'hier, avec le code -ed.</p>`)); valider(); return; }
    z.append(el(`<p class="eyebrow">Révision · parcours Fondations</p><h1>Ce qui vous a résisté revient une dernière fois.</h1><p>${R.length} question${R.length > 1 ? 's' : ''} ratée${R.length > 1 ? 's' : ''} pendant le module. Cette fois, vous avez la réponse en vous. Répéter, c'est ce qui transforme une règle en réflexe.</p>`));
    serieQCM(z, 'rev', R.map(q => [q[0], q[1].slice(), q[2], q[3], q[4]]), 'Répondez juste à chaque question.');
  }

  /* 0 · bienvenue */
  function bienvenue(z){
    z.append(el(`<p class="eyebrow">${N > 24 ? `Module ${N} · ${N} / 32 · Signature` : `Module ${N} · ${N} / 24`} · Arc ${D.arc}</p><h1>${esc(D.titre)}.</h1>${D.sous ? `<p class="sous-titre">${esc(D.sous)}</p>` : ''}
      <div class="choc-visu petit">${VIS[D.choc.visuel] || ''}</div>
      <p>${D.objectif}</p>
      ${window.FRGA ? FRGA.pastille() : ''}
      ${D.franc ? `<div class="franc"><span>Soyons francs</span><p>${D.franc}</p></div>` : ''}
      <div class="retour-msg info">Tous les exemples viennent de votre secteur : <b>${esc(ACT || SECTS[S()])}</b>.</div>
      ${E.prenom ? `<p>Ravi de vous revoir, <b>${esc(E.prenom)}</b>.</p>` : ''}
      <p class="doux petit">Environ 45 minutes, en huit temps. Votre progression est gardée : vous pouvez vous arrêter et reprendre. Module validé à partir de ${SEUIL} % de bonnes réponses du premier coup.</p>`));
    valider();
  }

  /* 1 · le rappel : trois questions des modules précédents */
  function rappel(z){
    z.append(el(`<p class="eyebrow">Temps 1 · Le rappel</p><h1>Trois questions sur ce que vous savez déjà.</h1><p>On retient mieux en allant rechercher ce qu'on a appris. Répondez sans revenir en arrière.</p>`));
    serieQCM(z, 'rappel', D.rappel, 'Répondez juste aux trois questions.');
  }

  /* 2 · le déclic : l'énigme, puis la révélation */
  function choc(z){
    if (D.choc.jeu) return chocJeu(z);
    z.append(el(`<p class="eyebrow">Temps 2 · Le déclic</p><h1>${D.choc.titre}</h1>
      <div class="choc-visu">${VIS[D.choc.visuel] || ''}</div>
      <p class="enigme">${D.choc.enigme}</p>
      <button class="btn plein" id="rev" type="button">Voir la réponse</button>
      <div class="revelation" id="r" hidden><p>${D.choc.reponse}</p><p class="mantra">À vous de le vérifier.</p></div>`));
    const r = z.querySelector('#r'), b = z.querySelector('#rev');
    const ouvrir = () => { r.hidden = false; b.hidden = true; const v = z.querySelector('.choc-visu'); if (v) v.classList.add('revele'); valider(); };
    b.addEventListener('click', ouvrir); exiger('Touchez « Voir la réponse ».'); if (E.faits[E.step]) ouvrir();
  }

  /* déclic en jeu : chaque situation se cadre en photo ou en film ; l'anglais est souple, la réponse « moins naturelle » n'est jamais traitée comme une faute */
  function chocJeu(z){
    const J = D.choc.jeu; let n = 0, faits = 0;
    z.append(el(`<p class="eyebrow">Temps 2 · Le déclic</p><h1>${D.choc.titre}</h1><p>${D.choc.enigme}</p>
      <div class="viseur" id="vis"><span class="vis-c c1"></span><span class="vis-c c2"></span><span class="vis-c c3"></span><span class="vis-c c4"></span><span class="vis-rec">● REC</span><span class="vis-flash"></span>
        <p class="vis-n" id="vn"></p><p class="vis-fr" id="vfr"></p><p class="vis-ctx" id="vctx"></p><p class="vis-en" id="ven" lang="en"></p></div>
      <div class="deux-codes cadre"><button type="button" class="dc" data-c="photo"><svg class="ico-code" viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="9" width="24" height="17" rx="3"/><circle cx="16" cy="17.5" r="5"/><path d="M11 9l2-3h6l2 3"/></svg><b>Photo</b><small>en général</small></button><button type="button" class="dc" data-c="film"><svg class="ico-code" viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="9" width="19" height="15" rx="3"/><path d="M22 14l7-4v13l-7-4z"/></svg><b>Film</b><small>en cours</small></button></div>
      <div id="r"></div><div class="revelation" id="reg" hidden>${D.choc.regle || `<p>${D.choc.reponse}</p>`}<p class="mantra">À vous de le vérifier.</p></div>`));
    const vis = z.querySelector('#vis'), r = z.querySelector('#r'), reg = z.querySelector('#reg'), bts = z.querySelectorAll('.cadre .dc');
    const montre = () => { const [fr, ctx] = J[n]; vis.className = 'viseur'; z.querySelector('#vn').textContent = `${n + 1} / ${J.length}`; z.querySelector('#vfr').textContent = `« ${fr} »`; z.querySelector('#vctx').textContent = ctx; z.querySelector('#ven').textContent = ''; bts.forEach(b => { b.className = 'dc'; b.disabled = false; }); r.innerHTML = ''; };
    bts.forEach(b => b.addEventListener('click', () => { const [, , en, bon, souple] = J[n], c = b.dataset.c; bts.forEach(x => x.disabled = true);
      vis.classList.add(bon === 'film' ? 'tourne' : 'clic'); z.querySelector('#ven').innerHTML = en;
      if (c === bon) { b.classList.add('ok'); r.innerHTML = OK(`${YES()} ${bon === 'film' ? 'On filme : ça se passe maintenant.' : 'Une photo : c\'est vrai en général.'}`); }
      else { b.classList.add('presque'); z.querySelector(`.cadre .dc[data-c="${bon}"]`).classList.add('mieux'); r.innerHTML = `<div class="retour-msg presque"><b>Pas faux.</b> ${souple || 'On vous comprendra. Mais ici, l\'anglais choisirait plutôt l\'autre.'}</div>`; }
      faits++; const nx = el(`<button class="btn plein" type="button">${n < J.length - 1 ? 'Situation suivante' : 'Voir la règle'}</button>`).firstChild; r.append(nx);
      nx.addEventListener('click', () => { if (n < J.length - 1) { n++; montre(); } else { r.innerHTML = ''; reg.hidden = false; z.querySelector('.cadre').hidden = true; vis.hidden = true; valider(); } }); }));
    montre(); exiger('Cadrez les situations, puis lisez la règle.');
    if (E.faits[E.step]) { reg.hidden = false; z.querySelector('.cadre').hidden = true; vis.hidden = true; valider(); }
  }

  /* 3 · les cartes de leçon : une idée par carte */
  function cartes(z){
    const K = D.cartes.map(k => [...k]); let i = 0;
    if (D.mecanisme) K.push([...D.mecanisme, 'Ce qui se passe vraiment']);
    if (D.catch) K.push([...D.catch, 'Le piège']);
    if (D.nobody) K.push([...D.nobody, 'Peu importe · nobody cares']);
    if (D.racine) K.push([...D.racine, 'D\'où ça vient']);
    z.append(el(`<p class="eyebrow">Temps 2 · Les cartes</p><div class="carte-lecon" id="carte"></div>
      <div class="cartes-nav"><button class="btn" id="cp" type="button" aria-label="Carte précédente">‹</button><div class="points" id="pts"></div><button class="btn plein" id="cn" type="button">Carte suivante</button></div>`));
    const c = z.querySelector('#carte'), pts = z.querySelector('#pts'); pts.innerHTML = K.map(() => '<i></i>').join('');
    const montre = () => { const [t, r, x, etq] = K[i]; c.className = 'carte-lecon' + (etq ? ' speciale' : ''); c.innerHTML = `<span class="num">${etq ? `<b class="etq-carte">${etq}</b> · ` : ''}CARTE ${i + 1} / ${K.length}</span><h2>${t}</h2><p>${r}</p>${x ? `<div class="ex">${prenom(x)}</div>` : ''}`;
      pts.querySelectorAll('i').forEach((p, j) => p.classList.toggle('on', j <= i)); z.querySelector('#cp').disabled = i === 0;
      z.querySelector('#cn').textContent = i === K.length - 1 ? 'J\'ai tout lu' : 'Carte suivante'; if (i === K.length - 1) valider(); };
    z.querySelector('#cp').addEventListener('click', () => { if (i > 0) { i--; montre(); } });
    z.querySelector('#cn').addEventListener('click', () => { if (i < K.length - 1) { i++; montre(); } else suiv.click(); });
    exiger(`Lisez les ${K.length} cartes pour continuer.`); montre(); if (E.faits[E.step]) valider();
  }

  /* 4 · contrôle */
  function controle(z){
    z.append(el(`<p class="eyebrow">Temps 2 · Contrôle</p><h1>Trois questions, pour que rien ne reste flou.</h1>`));
    serieQCM(z, 'ctrl', D.controle, 'Répondez juste aux trois questions.');
  }

  /* 5 · la vitre : on touche, le code apparaît au-dessus du mot */
  function vitre(z){
    const V = D.vitre; let n = 0;
    z.append(el(`<p class="eyebrow">Temps 3 · La vitre</p><h1>${V.titre}</h1><p>${V.consigne}</p><div id="v"></div><div id="r"></div>`));
    const v = z.querySelector('#v'), r = z.querySelector('#r');
    if (V.type === 'reveal') {
      let vus = 0; v.innerHTML = `<div class="uv-grille">${V.items.map((it, i) => `<button type="button" class="uv-mot" data-i="${i}"><span class="mot">${it.mot}</span><span class="encre-code">${it.code}</span></button>`).join('')}</div><p class="compteur" id="cpt">0 / ${V.items.length}</p>`;
      v.querySelectorAll('.uv-mot').forEach(b => b.addEventListener('click', () => { if (b.classList.contains('vu')) return; b.classList.add('vu'); vus++; v.querySelector('#cpt').textContent = `${vus} / ${V.items.length}`;
        const it = V.items[+b.dataset.i]; r.innerHTML = OK(it.note || `${it.mot} = ${it.code}`); if (vus === V.items.length) valider(); }));
      exiger('Éclairez tous les mots.'); if (E.faits[E.step]) valider(); return;
    }
    const L = V.items.slice(), deja = new Set();   /* Fondations : chaque phrase ratée revient une fois en fin de série */
    const item = () => {
      const it = L[n]; r.innerHTML = '';
      const box = el(`<div class="exo vitre-exo"><span class="compteur">${n + 1} / ${L.length}${n >= V.items.length ? ' · elle revient' : ''}</span>${V.type === 'modaux' ? `<p class="cible">Chance visée : <b>${it.cible}</b></p><div class="barre-modal"><i style="width:0%"></i><span>0 %</span></div>` : ''}<p class="phrase vitre-phrase">${prenom(it.avant || '')} <span class="trou-v">___</span>${/^[.,!?;:]/.test(it.apres || '') ? '' : ' '}${prenom(it.apres || '')}</p><div class="choix">${(V.type === 'modaux' ? V.modaux.map((m, j) => j) : ordre(it.avant + it.apres, it.options.length)).map(j => `<button class="puce" type="button" data-j="${j}">${prenom(V.type === 'modaux' ? V.modaux[j][0] : it.options[j])}</button>`).join('')}</div>${FOND && it.aide ? '<button class="indice-btn" type="button">Un indice</button>' : ''}</div>`).firstChild;
      v.innerHTML = ''; v.append(box);
      const ib = box.querySelector('.indice-btn'); if (ib) ib.addEventListener('click', () => { ib.outerHTML = `<p class="indice">💡 ${prenom(it.aide)}</p>`; });
      box.querySelectorAll('.puce').forEach(p => p.addEventListener('click', () => {
        if (box.dataset.fini) return; const j = +p.dataset.j;
        const choix = V.type === 'modaux' ? V.modaux[j][0] : it.options[j];
        if (V.type === 'modaux') { const pc = V.modaux[j][1]; box.querySelector('.barre-modal i').style.width = pc + '%'; box.querySelector('.barre-modal span').textContent = pc + ' %'; }
        const juste = V.type === 'modaux' ? choix === it.bon : j === it.bon; if (n < V.items.length) noter('vitre' + n, juste);
        if (!juste) { p.classList.add('ko'); r.innerHTML = KO(APPR ? 'Pas tout à fait.' : (it.indice || 'Pas tout à fait. Regardez le sujet et le repère de temps.'));
          if (FOND && !deja.has(it) && V.type !== 'modaux') { deja.add(it); L.push(it); aRevoir([`${it.avant || ''} ___ ${it.apres || ''}`, it.options, it.bon, it.note, it.aide]); } return; }
        p.classList.add('ok'); box.dataset.fini = 1;
        box.querySelector('.trou-v').outerHTML = `<span class="mc juste">${prenom(choix)}${it.code ? `<span class="etq-v">${it.code}</span>` : ''}</span>`;
        r.innerHTML = OK(it.note || 'Exact.');
        if (n < L.length - 1) { const b = el('<button class="btn plein" type="button">Suivante</button>').firstChild; r.append(b); b.addEventListener('click', () => { n++; item(); }); } else valider();
      }));
    };
    exiger(`Faites les ${V.items.length} phrases.`); item(); if (E.faits[E.step]) valider();
  }

  /* 6 · écoute 1 : comprendre sans le texte */
  function ecoute1(z){
    const Ec = parSecteur(D.ecoute);
    const qui = [...new Set(Ec.lignes.map(l => l[0]))];
    z.append(el(`<p class="eyebrow">Temps 4 · L'écoute · 1 / 2</p><h1>Écoutez, sans le texte.</h1><p>${Ec.intro}</p>
      ${telVocal(qui.length > 1 ? qui.join(' · ') : qui[0], transcription(Ec.lignes), typeEc(qui))}<p class="doux petit">Perdu ? La transcription est là, sous le message. Essayez d'abord sans.</p><div id="qs"></div>`));
    FRGNote.monter(z, secoursEc(Ec.lignes));
    serieQCM(z.querySelector('#qs'), 'ecoute', Ec.q, 'Répondez aux questions.');
  }

  /* message vocal façon iPhone : contact, note vocale, transcription en bulles */
  const SRC_EC = () => `audio/m${String(N).padStart(2,'0')}-ecoute.mp3?v=3`;
  function telVocal(nom, corps, type){ return `<div class="tel" lang="en"><div class="tel-tete"><span class="tel-av" aria-hidden="true">${esc(String(nom).charAt(0))}</span><b>${esc(nom)}</b><small>${type || 'Message vocal'}</small></div><div class="nv-slot" data-src="${SRC_EC()}"></div>${corps ? FRGNote.repliHTML(corps) : '<p class="tel-fin"></p>'}</div>`; }
  /* la transcription : un seul texte qui coule, une ligne par phrase ; à deux voix, le prénom en tête de chaque prise de parole */
  function transcription(lignes, tx){ const qui = [...new Set(lignes.map(l => l[0]))]; let av = null;
    return `<div class="trans">${lignes.map(([q, t]) => { const nom = qui.length > 1 && q !== av ? `<b class="t-qui">${esc(q)}</b>` : ''; av = q; return `<p class="t-l">${nom}${tx ? tx(t) : esc(String(t).replace(/\{([^|}]+)\|[^}]+\}/g, '$1'))}</p>`; }).join('')}</div>`; }
  /* secours : synthèse ligne par ligne si l'enregistrement manque */
  const secoursEc = lignes => (slot, fin) => { let k = 0; const suite = ok => { if (ok === false && k === 0) return fin(false); if (k >= lignes.length) return fin(true); const [q, t] = lignes[k]; k++; dire(t, q.charCodeAt(0), suite); }; suite(); };
  const typeEc = qui => qui.length > 1 ? 'Conversation' : ({ Review: 'Avis client', Speaker: 'Présentation' }[qui[0]] || 'Message vocal');
  /* 7 · écoute 2 : le texte s'affiche, on repère les codes */
  function ecoute2(z){
    const Ec = parSecteur(D.ecoute); let total = 0, vus = 0;
    const tx = t => esc(t).replace(/\{([^|}]+)\|([^|}]+)\}/g, (m, mot, c) => { total++; return `<span class="mc v" data-c="${c}" role="button" tabindex="0">${mot}</span>`; });
    z.append(el(`<p class="eyebrow">Temps 4 · L'écoute · 2 / 2</p><h1>Repérez les codes.</h1><p>Réécoutez le message, puis ouvrez la <b>transcription</b> et touchez chaque mot souligné en pointillé : son code apparaît au-dessus.</p>
      ${(() => { const qui = [...new Set(Ec.lignes.map(l => l[0]))]; return telVocal(qui.length > 1 ? qui.join(' · ') : qui[0], transcription(Ec.lignes, tx), typeEc(qui)); })()}<p class="compteur" id="cpt"></p>`));
    FRGNote.monter(z, secoursEc(Ec.lignes));
    const cpt = z.querySelector('#cpt'), majc = () => cpt.textContent = `${vus} / ${total} codes trouvés`; majc();
    z.querySelectorAll('.v').forEach(v => { const go = () => { if (v.classList.contains('vu')) return; v.classList.add('vu'); v.insertAdjacentHTML('beforeend', `<span class="etq">${esc(v.dataset.c)}</span>`); vus++; majc(); if (vus === total) valider(); };
      v.addEventListener('click', go); v.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
    exiger('Trouvez tous les codes.'); if (E.faits[E.step] || !total) valider();
  }

  /* 8 · le code : exercices notés, un par un */
  /* les deux seuls codes de temps : -s (T0, maintenant) et -ed (T-1, en arrière) */
  const ICO_S = '<svg class="ico-code" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="5" class="pl"/><circle cx="16" cy="16" r="11.5"/></svg>';
  const ICO_ED = '<svg class="ico-code" viewBox="0 0 32 32" aria-hidden="true"><path d="M26 22a10 10 0 1 0-17-9"/><path d="M4 8l5 6 6-5" /></svg>';
  const deuxCodes = (petit) => `<div class="deux-codes${petit ? ' petit' : ''}"><button type="button" class="dc dc-s" data-c="-s">${ICO_S}<b>-s</b><small>T0 · présent</small></button><button type="button" class="dc dc-ed" data-c="-ed">${ICO_ED}<b>-ed</b><small>T-1 · passé</small></button></div>`;
  const codeTemps = c => /-ed\b/.test(String(c).split(';')[0]) ? '-ed' : '-s';
  function code(z){
    const X = D.code; let n = 0;
    z.append(el(`<p class="eyebrow">Temps 5 · Le code</p><h1>À vous. Les mains dans le code.</h1><div class="meca-box"><svg class="meca" viewBox="0 0 320 156" aria-hidden="true"><rect class="m-plaque" x="70" y="14" width="180" height="78" rx="18"/><path class="m-fente" d="M108 38 v30 h104 v-30"/><path class="m-fente2" d="M108 38 v30 h104 v-30"/><text class="m-s m-gros" x="38" y="48">-s</text><text class="m-s" x="38" y="66">T0</text><text class="m-ed m-gros" x="284" y="48">-ed</text><text class="m-ed" x="284" y="66">T-1</text><line class="m-tige" x1="160" y1="132" x2="108" y2="38"><animate attributeName="x2" values="108;108;108;212;212;212;212;108;108" keyTimes="0;.3;.38;.46;.54;.8;.88;.96;1" dur="5s" repeatCount="indefinite"/><animate attributeName="y2" values="38;38;68;68;38;38;68;68;38" keyTimes="0;.3;.38;.46;.54;.8;.88;.96;1" dur="5s" repeatCount="indefinite"/></line><g class="m-pommeau"><circle r="14"/><circle class="m-reflet" cx="-4" cy="-5" r="4"/><animateTransform attributeName="transform" type="translate" values="108 38;108 38;108 68;212 68;212 38;212 38;212 68;108 68;108 38" keyTimes="0;.3;.38;.46;.54;.8;.88;.96;1" dur="5s" repeatCount="indefinite"/></g><rect class="m-socle" x="104" y="124" width="112" height="28" rx="9"/><text class="m-verbe" x="160" y="143">VERBE</text></svg><p>Le verbe, c'est le moteur. Il n'a que <b>deux vitesses</b> : <b class="c-s">-s</b> pour T0, <b class="c-ed">-ed</b> pour T-1. Pas de point mort : visible ou invisible, une vitesse est toujours enclenchée.</p></div><p class="doux petit">Seul votre premier essai compte dans le score.</p><div id="x"></div><div id="r"></div>`));
    const x = z.querySelector('#x'), r = z.querySelector('#r');
    const suivant = () => { if (n < X.length - 1) { const b = el('<button class="btn plein" type="button">Suivant</button>').firstChild; r.append(b); b.addEventListener('click', () => { n++; un(); }); } else valider(); };
    const un = () => {
      const e = X[n]; x.innerHTML = ''; r.innerHTML = ''; const cle = 'code' + n;
      const tete = `<span class="compteur">Exercice ${n + 1} / ${X.length}</span>`;
      if (e.t === 'traduire') {
        const box = el(`<div class="exo">${tete}<p class="consigne petit doux">Traduisez, puis choisissez le code : -s ou -ed.</p><p class="phrase fr-src">« ${prenom(e.fr)} »</p>
          ${e.aide ? `<details class="aide-dep"><summary>Un coup de pouce : les mots utiles</summary><p>${e.aide}</p></details>` : ''}<input class="saisie" id="tr" autocomplete="off" autocapitalize="off" spellcheck="false" lang="en" placeholder="In English…" aria-label="Votre traduction"><button class="btn plein" id="vf" type="button">Vérifier</button><div id="cd"></div></div>`).firstChild; x.append(box);
        const i = box.querySelector('#tr'), vf = box.querySelector('#vf'), cd = box.querySelector('#cd'); let essais = 0;
        const norme = t => t.trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').replace(/[.!?]+$/, '').replace(/\bdo not\b/g, "don't").replace(/\bdoes not\b/g, "doesn't").replace(/\bdid not\b/g, "didn't").replace(/\bi am\b/g, "i'm").replace(/\bis not\b/g, "isn't").replace(/\bwas not\b/g, "wasn't").replace(/\bhave not\b/g, "haven't").replace(/\bhas not\b/g, "hasn't");
        const coder = () => { const bon = codeTemps(e.code);
            cd.innerHTML = `<p class="phrase en-ok" lang="en">${esc(e.bon[0])}</p><p class="consigne petit doux">Quel code porte le temps ? Il n'y en a que deux.</p>${deuxCodes()}`;
            cd.querySelectorAll('.dc').forEach(pu => pu.addEventListener('click', () => { if (cd.dataset.fini) return; const juste = pu.dataset.c === bon; noter(cle + 'c', juste);
              if (juste) { cd.dataset.fini = 1; pu.classList.add('ok'); r.innerHTML = OK(`${YES()} Code complet : <span class="code-par">(${esc(e.code)})</span> ${e.ok || ''}`); suivant(); } else { pu.classList.add('ko'); r.innerHTML = KO(NON(e.ex || 'Regardez le premier verbe : présent ou passé ?')); } })); };
        const verifier = () => { if (box.dataset.fini || !i.value.trim()) return; essais++; const juste = e.bon.map(norme).includes(norme(i.value)); noter(cle, juste);
          if (juste) { box.dataset.fini = 1; i.classList.add('ok'); i.disabled = true; vf.hidden = true; r.innerHTML = ''; coder(); }
          else if (essais < 2) { i.classList.add('ko'); r.innerHTML = KO(NON(e.indice || 'Qui, fait quoi, à quoi. Puis le temps : -s ou -ed ?')); E.erreurs.push('code'); sauver(); }
          else { box.dataset.fini = 1; i.value = e.bon[0]; i.classList.remove('ko'); i.classList.add('corrige'); i.disabled = true; vf.hidden = true; r.innerHTML = ''; coder(); } };
        vf.addEventListener('click', verifier); i.addEventListener('keydown', ev => { if (ev.key === 'Enter') verifier(); }); i.focus({ preventScroll:true }); return;
      }
      if (e.t === 'qcm') { x.insertAdjacentHTML('beforeend', tete); qcm(x, cle, prenom(e.q), e.ch, e.b, e.ex, () => { if (e.ok) r.innerHTML = OK(e.ok); suivant(); }); return; }
      if (e.t === 'trou') {
        const box = el(`<div class="exo">${tete}<p class="consigne petit doux">${e.consigne || 'Complétez.'}</p><p class="phrase">${prenom(e.avant)} <input class="saisie trou-saisie" id="tr" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Votre réponse"> ${prenom(e.apres || '')}</p><button class="btn plein" id="vf" type="button">Vérifier</button></div>`).firstChild; x.append(box);
        const i = box.querySelector('#tr'), vf = box.querySelector('#vf'); let essais = 0;
        const norme = s => s.trim().toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').replace(/[.!?]$/, '');
        const verifier = () => { if (box.dataset.fini || !i.value.trim()) return; essais++; const juste = e.bon.map(norme).includes(norme(i.value)); noter(cle, juste);
          if (juste) { box.dataset.fini = 1; i.classList.add('ok'); i.disabled = true; vf.hidden = true; r.innerHTML = OK(e.ok || 'Exact.'); suivant(); }
          else if (essais < 2) { i.classList.add('ko'); r.innerHTML = KO(e.ex || 'Pas encore. Quel temps ? Quel code ?'); E.erreurs.push('code'); sauver(); }
          else { box.dataset.fini = 1; i.value = e.bon[0]; i.classList.remove('ko'); i.classList.add('corrige'); i.disabled = true; vf.hidden = true; r.innerHTML = KO(`La bonne réponse : <b>${e.bon[0]}</b>. ${e.ex || ''}`); suivant(); } };
        vf.addEventListener('click', verifier); i.addEventListener('keydown', ev => { if (ev.key === 'Enter') verifier(); }); i.focus({ preventScroll:true }); return;
      }
      if (e.t === 'ordre') {
        const box = el(`<div class="exo">${tete}<p class="consigne petit doux">${e.consigne || 'Remettez les blocs dans l\'ordre.'}</p><div class="zone blocs" aria-label="Votre phrase"></div><div class="blocs reserve"></div></div>`).firstChild; x.append(box);
        const zone = box.querySelector('.zone'), res = box.querySelector('.reserve'); let pose = [], rate = false;
        melange(e.blocs.map((b, i) => ({ b, i }))).forEach(({ b, i }) => { const k = document.createElement('button'); k.type = 'button'; k.className = 'bloc'; k.textContent = prenom(b); k.dataset.i = i; res.append(k); });
        box.addEventListener('click', ev => { const k = ev.target.closest('.bloc'); if (!k || box.dataset.fini) return;
          if (k.parentElement === res) { zone.append(k); pose.push(+k.dataset.i); } else { res.append(k); pose = pose.filter(v => v !== +k.dataset.i); }
          if (pose.length === e.blocs.length) { const juste = pose.every((v, j) => v === j); noter(cle, juste);
            if (juste) { box.dataset.fini = 1; zone.classList.add('juste'); r.innerHTML = OK(e.ok || 'Exact.'); suivant(); }
            else { rate = true; r.innerHTML = KO(e.ex || 'Pas tout à fait. Qui fait l\'action ? Commencez par lui.'); } } });
        return;
      }
      if (e.t === 'erreur') {
        const box = el(`<div class="exo">${tete}${e.vraie ? '<p class="vraie-erreur">Une vraie erreur d\'élève</p>' : ''}<p class="consigne petit doux">${e.consigne || 'Touchez le mot qui ne va pas.'}</p><p class="phrase mots-erreur">${e.mots.map((m, i) => `<button type="button" class="mot-e" data-i="${i}">${prenom(m)}</button>`).join(' ')}</p></div>`).firstChild; x.append(box);
        box.querySelectorAll('.mot-e').forEach(b => b.addEventListener('click', () => { if (box.dataset.fini) return; const juste = +b.dataset.i === e.faux; noter(cle, juste);
          if (juste) { box.dataset.fini = 1; b.classList.add('ok'); if (e.bon) b.textContent = e.bon; else b.classList.add('barre'); r.innerHTML = OK(e.ok || (e.bon ? `Exact : <b>${e.bon}</b>.` : 'Exact : ce mot est en trop.')); suivant(); }
          else { b.classList.add('ko'); r.innerHTML = KO(e.ex || 'Ce mot-là est juste. Cherchez le verbe.'); } }));
      }
    };
    exiger(`Faites les ${X.length} exercices.`); un(); if (E.faits[E.step]) valider();
  }

  /* 9 · ma version : écriture libre, corrigée par le lamantin */
  /* le lamantin parle frenglais, de plus en plus anglais au fil des modules : 1–8 léger, 9–16 moitié-moitié, 17–24 surtout anglais, 25–32 anglais seul */
  const NIV_LAM = N <= 8 ? 0 : N <= 16 ? 1 : N <= 24 ? 2 : 3;
  const LAM = (k, ...a) => {
    const T = {
      hello: [p => `Hi${p}! Let's go, en anglais. Je check la forme de vos phrases.`, p => `Hi${p}! Let's go. Write in English, je check la forme.`, p => `Hi${p}! Your turn. Write in English, I'll check the form (la forme).`, p => `Hi${p}! Your turn. Write in English, I'll check the form.`],
      peu: [(n, m) => `J'ai ${n} phrase${n > 1 ? 's' : ''}. I need au moins ${m}.`, (n, m) => `${n} sentence${n > 1 ? 's' : ''}… I need at least ${m}, s'il vous plaît.`, (n, m) => `Only ${n} sentence${n > 1 ? 's' : ''}. I need at least ${m}.`, (n, m) => `Only ${n} sentence${n > 1 ? 's' : ''}. I need at least ${m}.`],
      ok: ['Nice! La forme est juste.', 'Nice! Your form is on point, bien joué.', 'Great job! The form is right (la forme est juste).', 'Great job! Your form is spot on.'],
      corrige: ['Corrigez et renvoyez-moi tout le texte, please.', 'Fix it et renvoyez-moi the whole text.', 'Fix it and send me the whole text again.', 'Fix it and send me the whole text again.'],
      garde: ['OK, je note ces points : ils reviendront dans les prochains modules. Keep going.', 'OK, noted : ces points reviendront plus tard. Keep going.', 'OK, I\'ve noted these points. They\'ll come back later. Keep going.', 'OK, I\'ve noted these points. They\'ll come back later. Keep going.'],
      relis: ['Je relis le reste, one sec…', 'One sec, je relis the rest…', 'One sec, I\'m reading the rest…', 'One sec, I\'m reading the rest…'],
      rien: ['J\'ai relu tout le reste : nothing to fix. Bravo.', 'I read everything : nothing to fix. Bravo !', 'I read everything: nothing to fix. Well done!', 'I read everything: nothing to fix. Well done!'],
      plus: [n => `Pour aller plus loin, ${n > 1 ? n + ' détails' : 'un détail'} à reprendre :`, n => `To go further, ${n > 1 ? n + ' petits détails' : 'un petit détail'} :`, n => `To go further, ${n > 1 ? n + ' small details' : 'one small detail'}:`, n => `To go further, ${n > 1 ? n + ' small details' : 'one small detail'}:`],
      passe: ['Stop. Je vous parle au passé, répondez-moi au passé : le code -ed. Be logical.', 'Wait. Je vous parle au passé : answer in the past, code -ed. Be logical.', 'Wait. I\'m asking in the past: answer in the past (-ed). Be logical.', 'Wait. I\'m asking in the past, so answer in the past. Be logical.'],
      bilanOk: ['Bilan : vous vous êtes fait comprendre à chaque réponse. Well done.', 'Bilan : you were clear à chaque réponse. Well done.', 'Bottom line: you were clear every time. Well done.', 'Bottom line: you were clear every time. Well done.'],
      bilanMoy: ['Bilan : le message passe, c\'est l\'essentiel. Keep going.', 'Bilan : the message gets through, c\'est l\'essentiel.', 'Bottom line: the message gets through. That\'s what matters.', 'Bottom line: the message gets through. That\'s what matters.'],
      surveiller: ['À surveiller', 'Watch out (à surveiller)', 'Watch out', 'Watch out'],
      aucune: ['Aucune erreur de code. Nice.', 'No code errors. Nice !', 'No code errors. Nice!', 'No code errors. Nice!']
    }[k][NIV_LAM];
    return typeof T === 'function' ? T(...a) : T;
  };
  /* relecture du lamantin IA (élève connecté) : une fois la forme validée par les règles, l'IA relit le reste et situe chaque faute dans le texte */
  async function relireIA(txt, msg, consigne){
    let S0 = null; try { S0 = JSON.parse(localStorage.getItem('frg-session') || 'null'); } catch (e) {}
    if (!S0 || !S0.jeton) return;
    const att = msg('lui', '<span class="doux">' + LAM('relis') + '</span>');
    try { const r = await fetch('https://courbe-classement.paulodubmx84.workers.dev/eleve/corriger', { method: 'POST', body: JSON.stringify({ jeton: S0.jeton, module: N, texte: txt, consigne: String(consigne || '').replace(/<[^>]+>/g, '') }) });
      const j = await r.json(); if (!j.ok) { att.remove(); return; }
      if (!j.erreurs.length) { att.innerHTML = LAM('rien'); return; }
      let h = '', k = 0; j.erreurs.forEach((e, i) => { h += esc(j.texte.slice(k, e.debut)) + '<mark class="ia-faute"><sup>' + (i + 1) + '</sup>' + esc(j.texte.slice(e.debut, e.fin)) + '</mark>'; k = e.fin; }); h += esc(j.texte.slice(k));
      att.innerHTML = LAM('plus', j.erreurs.length) + '<span class="ia-texte">' + h + '</span>' + j.erreurs.map((e, i) => `<span class="fix"><b>${i + 1}.</b> <s>${esc(e.extrait)}</s> → ${esc(e.correction)}<span class="doux petit">${esc(e.pourquoi)}</span></span>`).join('');
      E.relu = j.erreurs.map(e => e.extrait + ' → ' + e.correction); sauver();
    } catch (e) { att.remove(); }
  }
  function chatUI(z, titre, sousTitre){
    z.append(el(`<div class="chat" id="chat"><div class="chat-tete">${AV}<div><b>Le lamantin</b><small>${sousTitre}</small></div></div></div>
      <div class="saisie-chat"><textarea id="t" rows="1" placeholder="${titre}" aria-label="Votre texte"></textarea><button class="envoyer" id="env" type="button" aria-label="Envoyer">${ENV}</button></div>`));
    const chat = z.querySelector('#chat');
    const msg = (qui, html) => { const d = document.createElement('div'); d.className = 'msg ' + qui; d.innerHTML = html; chat.append(d); chat.scrollTop = chat.scrollHeight; return d; };
    const ecrit = f => { const d = document.createElement('div'); d.className = 'ecrit'; d.textContent = 'Le lamantin écrit…'; chat.append(d); chat.scrollTop = chat.scrollHeight; setTimeout(() => { d.remove(); f(); }, 800); };
    const t = z.querySelector('#t'); t.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); z.querySelector('#env').click(); } });
    const taille = () => { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 160) + 'px'; }; t.addEventListener('input', taille); setTimeout(taille, 0); z.querySelector('#env').addEventListener('click', () => setTimeout(taille, 0));
    return { msg, ecrit, t, env: z.querySelector('#env') };
  }
  function maVersion(z){
    const V = D.version, min = V.min || 4;
    z.append(el(`<p class="eyebrow">Temps 6 · Ma version</p><h1>${V.titre}</h1><p>${V.consigne}</p>
      <details><summary class="doux petit">Voir un exemple</summary><p class="texte-ref">${esc(prenom(parSecteur(V.exemple)))}</p></details>`));
    if (D.motsM1) { const mots = (M1.nuage || []).map(x => typeof x === 'string' ? x : (x.struct || x.corr || x.brut)).filter(Boolean);
      z.append(el(mots.length ? `<div class="retour-msg info"><b>Vos mots du module 1 :</b> ${mots.map(m => `<span class="pastille-mot">${esc(m)}</span>`).join(' ')}</div>` : '<p class="doux petit">Vos mots du module 1 apparaîtront ici une fois le module 1 fait sur cet appareil.</p>')); }
    const ui = chatUI(z, 'En anglais…', 'Il corrige la forme, jamais ce que vous racontez.');
    z.append(el('<p class="provisoire">Le lamantin vérifie d\'abord vos codes et l\'ordre des mots. Quand c\'est propre, il relit tout le texte avec son IA entraînée à la Courbe des Temps.</p>'));
    const essais = {};
    ui.msg('lui', V.relance ? `Hi${E.prenom ? ' ' + esc(E.prenom) : ''}! ${esc(V.relance)}` : LAM('hello', E.prenom ? ' ' + esc(E.prenom) : ''));
    if (E.version) ui.t.value = E.version;
    ui.env.addEventListener('click', () => { const txt = ui.t.value.trim(); if (!txt) return; E.version = txt; sauver(); ui.msg('moi', esc(txt)); ui.t.value = '';
      const ph = C ? C.phrases(txt) : txt.split(/[.!?]+/).filter(Boolean); const fautes = [];
      if (C) ph.forEach(p => { const a = C.analyser(p); if (a && a.type !== 'ok') { essais[p] = (essais[p] || 0) + 1; fautes.push([p, a]); } });
      ui.ecrit(() => {
        if (ph.length < min) ui.msg('lui', LAM('peu', ph.length, min));
        if (!fautes.length) { if (ph.length >= min) { ui.msg('lui', LAM('ok')); valider(); relireIA(txt, ui.msg, V.consigne); } return; }
        fautes.forEach(([p, a]) => { const second = essais[p] > 1 || a.type === 'calque';
          ui.msg('lui', second ? `« ${esc(p)} »\n${a.indice}<span class="fix">${esc(a.bon)}</span>${a.code ? `<span class="cd">${esc(a.code)}</span>` : ''}` : `« ${esc(p)} »\n${a.indice}\n${LAM('corrige')}`); });
        E.erreurs = (E.erreurs || []).concat([...new Set(fautes.map(f => f[1].type))]); sauver();
        if (Object.values(essais).some(k => k >= 2) && ph.length >= min) { ui.msg('lui', LAM('garde')); valider(); }
      }); });
    exiger(`Écrivez au moins ${min} phrases et envoyez-les au lamantin.`); if (E.faits[E.step]) valider();
  }

  /* 10 · le lamantin (conversation guidée) ou, dès le module 17, le cas pratique du secteur */
  /* Temps 7 à voix haute : le lamantin pose trois questions (écrites). Après chaque réponse, un retour en pop-up. Rien ne quitte l'appareil. */
  function lamantinOral(z){
    const L = parSecteur(D.lamantin), Q0 = L.questions, Q = [Q0[0], Q0[Math.floor(Q0.length / 2)], Q0[Q0.length - 1]].map(q => prenom(q));
    let k = 0, flux = null, rec = null, it = null;
    z.append(el(`<p class="eyebrow">${N >= 17 ? 'Temps 7 · Le cas pratique' : 'Temps 7 · À voix haute'}</p><h1>${N >= 17 && L.situation ? esc(L.situation) : 'Trois questions. Vous répondez à l\'oral.'}</h1>
      <p>Le lamantin joue <b>${esc(L.role)}</b>. Touchez le micro, parlez 30 secondes au plus, en phrases complètes, puis réécoutez-vous. ${L.consigne || ''}</p>
      <div class="chat" id="chat"><div class="chat-tete">${AV}<div><b>Le lamantin</b><small>joue ${esc(L.role)}</small></div></div></div>
      <div class="saisie-chat oral"><div class="pill-oral"><span class="rec-pt" aria-hidden="true"></span><span class="pill-tx">Répondre à voix haute</span><span class="tps" id="tps">30</span></div><button class="envoyer micro-b" id="go" type="button" aria-label="Répondre"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg></button><button class="envoyer stop-b" id="stop" type="button" hidden aria-label="J'ai fini"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/></svg></button></div>
      <p class="provisoire" id="note">Vos réponses restent sur cet appareil. Personne d'autre ne les entend.</p>`));
    const chat = z.querySelector('#chat'), go = z.querySelector('#go'), stop = z.querySelector('#stop'), tps = z.querySelector('#tps');
    const msg = (qui, html) => { const d = document.createElement('div'); d.className = 'msg ' + qui; d.innerHTML = html; chat.append(d); chat.scrollTop = chat.scrollHeight; return d; };
    const poser = () => { msg('lui', esc(Q[k])); };
    const LIGNES = [['Not bad du tout ! Le plus dur, c\'est d\'oser.', 'Nice ! Ça sonne déjà plus naturel.', 'That\'s it ! Vous parlez, et ça s\'entend.'],
      ['Not bad at all ! Le plus dur, c\'est d\'oser.', 'Nice ! You sound plus naturel already.', 'That\'s it ! You\'re speaking, et ça s\'entend.'],
      ['Not bad at all! The hardest part is daring (oser).', 'Nice! You sound more natural already.', 'That\'s it! You\'re really speaking now.'],
      ['Not bad at all! The hardest part is daring.', 'Nice! You sound more natural already.', 'That\'s it! You\'re really speaking now.']][NIV_LAM];
    const CHECK = NIV_LAM < 2 ? ['Chaque verbe porte son code : -s à T0 (he, she, it), -ed à T-1, même invisible.', 'Vous êtes resté dans le même temps : be logical.', 'Qui / fait quoi / à quoi, dans cet ordre.']
      : ['Every verb carries its code: -s at T0, -ed at T-1, even when it\'s invisible.', 'You stayed in the same tense: be logical.', 'Who / does what / to what, in that order.'];
    const popup = (url, fin, suite) => { const d = document.createElement('div'); d.className = 'pop-oral'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
      d.innerHTML = `<div class="pop-carte"><div class="bulle-lam">${AV}<div class="txt">${LIGNES[Math.min(k - 1, 2)]}</div></div>
        ${url ? `<p class="petit"><b>${NIV_LAM < 2 ? 'Réécoutez-vous :' : 'Listen to yourself:'}</b></p><audio controls src="${url}"></audio>` : ''}
        <p class="petit" style="margin-top:14px"><b>${NIV_LAM < 2 ? 'Vérifiez en vous réécoutant :' : 'Check as you listen:'}</b></p><ul class="pop-liste">${CHECK.map(c => `<li>${c}</li>`).join('')}</ul>
        <button class="btn plein" type="button" id="pop-ok">${fin ? (NIV_LAM < 2 ? 'Terminer' : 'Finish') : (NIV_LAM < 2 ? 'Question suivante' : 'Next question')}</button></div>`;
      document.body.append(d); const ok = d.querySelector('#pop-ok'); ok.focus(); ok.addEventListener('click', () => { d.remove(); suite(); }); };
    const apres = url => { msg('moi', url ? `<audio controls src="${url}"></audio>` : '<i>Réponse à voix haute</i>'); k++; const fin = k >= Q.length;
      popup(url, fin, () => { if (!fin) { go.hidden = false; tps.textContent = 30; poser(); }
        else { go.hidden = true; tps.textContent = '✓'; msg('lui', `Thanks${E.prenom ? ', ' + esc(E.prenom) : ''} ! ${NIV_LAM < 3 ? 'Trois réponses à voix haute. Well done.' : 'Three answers out loud. Well done.'}`); if (flux) flux.getTracks().forEach(t => t.stop()); valider(); } }); };
    const finir = () => { clearInterval(it); stop.hidden = true; if (rec && rec.state !== 'inactive') rec.stop(); else apres(null); };
    go.addEventListener('click', async () => { go.hidden = true; stop.hidden = false; let t = 30; tps.textContent = t; rec = null;
      try { if (!flux && navigator.mediaDevices) flux = await navigator.mediaDevices.getUserMedia({ audio:true });
        if (flux && window.MediaRecorder) { const morceaux = []; rec = new MediaRecorder(flux); rec.ondataavailable = e => morceaux.push(e.data);
          rec.onstop = () => apres(URL.createObjectURL(new Blob(morceaux, { type: rec.mimeType }))); rec.start(); } }
      catch (e) { rec = null; z.querySelector('#note').textContent = 'Micro non autorisé : répondez à voix haute, sans enregistrement.'; }
      it = setInterval(() => { t--; tps.textContent = t; if (t <= 0) finir(); }, 1000); });
    stop.addEventListener('click', finir);
    poser();
    exiger('Répondez aux trois questions à voix haute.'); if (E.faits[E.step]) valider();
  }
  /* un e-mail qui ressemble à un e-mail : expéditeur, destinataire, objet, corps, signature */
  function mailHTML(Lc){ const m = /De\s*:\s*([^·]+)·\s*Objet\s*:\s*(.+)/i.exec(Lc.tete || ''); if (!m) return '';
    const de = m[1].trim(), objet = m[2].trim(), lignes = prenom(Lc.texte).split('\n'), heure = '09:4' + (N % 10);
    return `<div class="mail" lang="en"><div class="mail-barre"><span></span><span></span><span></span><b>Inbox</b>${/\{[^|{}]+\|/.test(Lc.texte) ? '<button type="button" class="m-codes" aria-pressed="false" onclick="const m=this.closest(\'.mail\');m.classList.toggle(\'codes\');this.setAttribute(\'aria-pressed\',m.classList.contains(\'codes\'))">codes</button>' : ''}</div>
      <div class="mail-tete"><span class="mail-av" aria-hidden="true">${esc(de.charAt(0))}</span><div><p class="mail-de"><b>${esc(de)}</b> <span>&lt;${esc(de.toLowerCase().replace(/[^a-z]/g, ''))}@company.com&gt;</span></p><p class="mail-a">To: ${esc(E.prenom || 'you')}</p></div><span class="mail-h">${heure}</span></div>
      <p class="mail-objet">${esc(objet)}</p><div class="mail-corps">${prenom(Lc.texte).split(/\n\s*\n/).map(b => `<p>${b.split('\n').map(l => esc(l).replace(/\{([^|{}]+)\|([^{}]+)\}/g, (x, w, c) => `<span class="mcode${/-ed/.test(c.split(';')[0]) ? ' ed' : ''}" data-c="${c}">${w}</span>`)).join('<br>')}</p>`).join('')}</div></div>`; }
  /* lecture : un vrai texte du quotidien (e-mail, note, message), trois questions */
  function lecture(z){
    const Lc = D.lecture;
    z.append(el(`<p class="eyebrow">Temps 4 · Lire</p><h1>${esc(Lc.titre || 'Lisez, puis répondez.')}</h1><p>${esc(Lc.consigne || 'Lisez le texte une fois en entier, sans dictionnaire. Le contexte fait la moitié du travail.')}</p>
      ${mailHTML(Lc) || `<div class="lecture-doc"><p class="lecture-tete">${esc(Lc.tete || '')}</p><div class="lecture-tx">${esc(prenom(Lc.texte)).replace(/\n/g, '<br>')}</div></div>`}`));
    serieQCM(z, 'lec', Lc.q, 'Répondez aux trois questions.');
  }
  function lamantin(z){
    const L = parSecteur(D.lamantin), Q = L.questions; let k = 0, bilan = { ok:0, fautes:[] }; const logique = {};
    z.append(el(`<p class="eyebrow">${N >= 17 ? 'Temps 7 · Le cas pratique' : 'Temps 7 · Le lamantin'}</p><h1>${N >= 17 ? esc(L.situation) : 'Cinq minutes de vraie conversation.'}</h1>
      <p>Le lamantin joue <b>${esc(L.role)}</b>. Répondez en anglais, en phrases complètes. ${L.consigne || ''}</p>`));
    const ui = chatUI(z, 'Votre réponse…', 'joue ' + esc(L.role));
    z.append(el('<p class="provisoire">Le lamantin suit un fil de questions et vérifie vos codes à chaque réponse.</p>'));
    ui.ecrit(() => ui.msg('lui', esc(prenom(Q[0]))));
    ui.env.addEventListener('click', () => { const txt = ui.t.value.trim(); if (!txt || k >= Q.length) return; ui.msg('moi', esc(txt)); ui.t.value = '';
      E.conv = (E.conv || []).slice(-9).concat([Q[k] + ' → ' + txt]); sauver();
      const f = C ? C.phrases(txt).map(p => [p, C.analyser(p)]).find(([, a]) => a && a.type !== 'ok') : null;
      if (txt.split(/\s+/).length < 3 && !f) { ui.ecrit(() => ui.msg('lui', 'Sorry? Tell me a bit more, with a full sentence.\n(Dites-m\'en plus, avec une phrase complète.)')); return; }
      /* Be logical : si la question est au passé, la réponse aussi (une seule relance par question) */
      if (!logique[k] && /\b(did|was|were)\b/i.test(Q[k]) && !PASSE.test(txt)) { logique[k] = 1; bilan.logique = (bilan.logique || 0) + 1;
        ui.ecrit(() => ui.msg('lui', LAM('passe'))); return; }
      if (f) bilan.fautes.push(f); else bilan.ok++; k++;
      ui.ecrit(() => { const reprise = f ? `${['Oh, ', 'Ah, ', 'OK, '][k % 3]}${esc(f[1].bon)} Got it!\n` : ['Nice!\n', 'Great.\n', 'Perfect.\n', 'I see.\n'][k % 4];
        if (k < Q.length) ui.msg('lui', reprise + esc(prenom(Q[k])));
        else { ui.msg('lui', reprise + `Thanks${E.prenom ? ', ' + esc(E.prenom) : ''}!`);
          const f0 = bilan.fautes[0]; setTimeout(() => { ui.msg('lui', `${bilan.ok >= Q.length - 1 ? LAM('bilanOk') : LAM('bilanMoy')}${f0 ? `\n${LAM('surveiller')} : « ${esc(f0[0])} » → ${esc(f0[1].bon)}.` : '\n' + LAM('aucune')}`); valider(); }, 700); } }); });
    exiger(`Répondez aux ${Q.length} messages du lamantin.`); if (E.faits[E.step]) valider();
  }

  /* 11 · trois fois plus vite : 90, 60, 45 secondes. Aux modules 12 et 32, on réécoute sa voix du module 1. */
  function fluidite(z){
    const durees = [90, 60, 45]; let n = 0;
    z.append(el(`<p class="eyebrow">Temps 8 · Trois fois plus vite</p><h1>La même chose, trois fois, de plus en plus vite.</h1>
      <p>${D.fluidite}</p>${E.version ? `<div class="texte-ref">${esc(E.version)}</div>` : ''}
      <div id="m1voix"></div>
      <div class="chrono"><span class="tps" id="tps">90</span><button class="btn plein" id="go" type="button">Essai 1 · 90 s</button><button class="btn" id="stop" type="button" hidden>J'ai fini</button></div>
      <div class="essais">${durees.map(d => `<span>${d} s</span>`).join('')}</div><div id="aud"></div>
      <p class="provisoire" id="note">Si vous autorisez le micro, chaque essai est enregistré sur cet appareil pour que vous puissiez vous réécouter.</p>`));
    if ((N === 12 || N === 32) && window.Voix) Voix.lire('m1-essai-3').then(v => { if (!v) return; const url = URL.createObjectURL(v.blob);
      z.querySelector('#m1voix').innerHTML = `<div class="retour-msg info"><b>Votre voix au module 1.</b> Écoutez-la avant de commencer, puis comparez.<audio controls src="${url}"></audio></div>`; });
    const tps = z.querySelector('#tps'), go = z.querySelector('#go'), stop = z.querySelector('#stop'), aud = z.querySelector('#aud');
    let flux = null, rec = null, it = null;
    const terminer = () => { clearInterval(it); stop.hidden = true; if (rec && rec.state !== 'inactive') rec.stop(); z.querySelectorAll('.essais span')[n].classList.add('fait'); n++;
      if (n < durees.length) { go.hidden = false; go.textContent = `Essai ${n + 1} · ${durees[n]} s`; tps.textContent = durees[n]; }
      else { go.hidden = true; tps.textContent = '✓'; valider(); if (flux) flux.getTracks().forEach(t => t.stop()); } };
    go.addEventListener('click', async () => { go.hidden = true; stop.hidden = false; let t = durees[n]; tps.textContent = t;
      try { if (!flux && navigator.mediaDevices) flux = await navigator.mediaDevices.getUserMedia({ audio:true });
        if (flux && window.MediaRecorder) { const morceaux = []; rec = new MediaRecorder(flux); rec.ondataavailable = e => morceaux.push(e.data); const num = n + 1;
          rec.onstop = () => { const url = URL.createObjectURL(new Blob(morceaux, { type: rec.mimeType })); aud.insertAdjacentHTML('beforeend', `<p class="petit">Essai ${num} : <audio controls src="${url}"></audio></p>`); }; rec.start(); } }
      catch (e) { z.querySelector('#note').textContent = 'Micro non autorisé : faites l\'exercice à voix haute, sans enregistrement.'; }
      it = setInterval(() => { t--; tps.textContent = t; if (t <= 0) terminer(); }, 1000); });
    stop.addEventListener('click', terminer);
    exiger('Faites les trois essais.'); if (E.faits[E.step]) valider();
  }

  /* 12 · le tableau de fin : score, validation à 90 %, suite */
  function fin(z){
    const Nn = Object.entries(E.notes || {}).filter(([k]) => !/^(exp|rev)/.test(k)).map(([, v]) => v), score = Nn.length ? Math.round(Nn.reduce((a, b) => a + b, 0) / Nn.length * 100) : 0;
    const valide = score >= SEUIL; E.fini = true; E.score = score; E.valide = valide; if (valide && !E.dateFin) E.dateFin = Date.now(); sauver(); maj();
    const total = Object.values(E.temps || {}).reduce((a, b) => a + b, 0), mn = s => s < 60 ? `${s} s` : `${Math.round(s / 60)} min`;
    const rates = Object.entries(E.notes || {}).filter(([k, v]) => !v && !/^(exp|rev)/.test(k)).length;
    const aj = window.FRGA && !TESTEUR ? FRGA.ajuster(score, N) : null;
    const msgParc = aj && aj.change ? `<div class="retour-msg info parcours-change">${aj.apres === 'appr' || (aj.avant === 'fond' && aj.apres === 'std') ? 'Vous montez' : 'Vous passez'} au parcours <b>${FRGA.NOMS[aj.apres]}</b> pour le prochain module. ${FRGA.DESC[aj.apres]}</div>` : '';
    try { const S0 = JSON.parse(localStorage.getItem('frg-session') || 'null'); if (S0 && S0.jeton) fetch('https://courbe-classement.paulodubmx84.workers.dev/eleve/resultat', { method: 'POST', body: JSON.stringify({ jeton: S0.jeton, module: N, score, valide, minutes: Math.round(total / 60), erreurs: Object.entries((E.erreurs || []).reduce((o, k) => (o[k] = (o[k] || 0) + 1, o), {})).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => k + ' ×' + v) }) }).catch(() => {}); } catch (e) {}
    const bilan = N % 4 === 0 ? `<div class="retour-msg info">Votre fiche bilan n° ${N / 4} est prête : <a href="bilan.html?bloc=${N / 4}" target="_blank" rel="noopener">voir la fiche</a>.</div>` : '';
    z.append(el(`<p class="eyebrow">Module ${N} · terminé</p><h1>${valide ? `${E.prenom ? esc(E.prenom) + ', module' : 'Module'} validé.` : 'Presque. Encore un tour.'}</h1>
      <div class="carte-fin">
        <div class="retenir uni"><span class="aide">Réussi du premier coup</span><p class="score-grand ${valide ? 'ok' : 'ko'}">${score} %</p><p class="doux petit">${valide ? `Validé, et pas par gentillesse : le seuil est à ${SEUIL} %, vous y êtes.` : `Pas validé. Ce n'est pas une punition, c'est une mesure : ${rates} réponse${rates > 1 ? 's' : ''} fausse${rates > 1 ? 's' : ''} au premier essai, et ici on ne valide pas « à peu près ». Refaites-le : la deuxième fois est celle qui fixe.`}</p></div>
        <div class="retenir"><p class="retenir-titre">À retenir</p><p>${D.retenir}</p></div>
        <div><b>Temps passé</b><span class="score">${mn(total)}</span></div>
        ${D.suite ? `<div class="plus-loin"><b>Prochain module</b><p class="next-titre">${D.suite}</p></div>` : ''}
      </div>
      ${msgParc}
      ${valide ? '' : '<button class="btn plein" id="refaire" type="button">Refaire le module</button>'}
      <div id="mission-box"></div>
      ${tableauIrr()}
      <p style="font-size:20px;font-weight:500;margin-bottom:0">Be logical. Now, spit it.</p><p class="doux petit" style="margin-top:2px">Soyez logique. Et maintenant, dites-le à voix haute.</p>${bilan}`));
    if (valide && window.FRG) FRG.monterMission(z.querySelector('#mission-box'), N, 'fiche.html?n=' + N);
    else { const mb = z.querySelector('#mission-box'); if (mb) mb.innerHTML = '<div class="pdf-verrou" aria-disabled="true"><span class="pdf-ic">🔒</span><div><b>Résumé du module (PDF)</b><span>Disponible quand le module est réussi.</span></div></div>'; }
    const rf = z.querySelector('#refaire');
    if (rf) rf.addEventListener('click', () => { const garde = { prenom:E.prenom, sect:E.sect, temps:E.temps, erreurs:E.erreurs, version:E.version, revoir:E.revoir }; E = Object.assign({ step:0, max:0, fini:false, faits:{}, notes:{} }, garde); sauver(); aller(1); });
  }


  /* ---------- les irréguliers « à ne pas apprendre » : le tableau se remplit tout seul, au fil des rencontres ---------- */
  const IRR = 'be was/were been|have had had|do did done|go went gone|say said said|get got got|make made made|know knew known|think thought thought|take took taken|see saw seen|come came come|give gave given|find found found|tell told told|leave left left|feel felt felt|put put put|bring brought brought|begin began begun|keep kept kept|write wrote written|sit sat sat|stand stood stood|lose lost lost|pay paid paid|meet met met|run ran run|send sent sent|build built built|spend spent spent|buy bought bought|speak spoke spoken|read read read|sell sold sold|hold held held|fall fell fallen|forget forgot forgotten|eat ate eaten|drink drank drunk|drive drove driven|break broke broken|choose chose chosen|grow grew grown|wear wore worn|fly flew flown|catch caught caught|teach taught taught|sleep slept slept|win won won|understand understood understood|hear heard heard|become became become|steal stole stolen|show showed shown'.split('|').map(l => l.split(' '));
  const FORMES = {}; IRR.forEach(([b, p, n]) => { p.split('/').concat([n]).forEach(f => { if (f !== b) FORMES[f] = b; }); });
  const PASSE = new RegExp('\\b(\\w+ed|' + IRR.map(v => v[1].replace('/', '|')).join('|') + '|could|would)\\b', 'i');
  function rencontres(){
    let T = {}; try { T = JSON.parse(localStorage.getItem('frg-irr') || '{}'); } catch (e) {}
    const txt = JSON.stringify([D.ecoute, D.vitre, D.code, D.cartes, D.machine || '']).toLowerCase().replace(/<[^>]+>/g, ' ');
    const nouveaux = [];
    (txt.match(/[a-z]+/g) || []).forEach(w => { const b = FORMES[w]; if (b && !T[b]) { T[b] = N; nouveaux.push(b); } });
    try { localStorage.setItem('frg-irr', JSON.stringify(T)); } catch (e) {}
    return { T, nouveaux };
  }
  function tableauIrr(){
    const { T } = rencontres(); const lignes = IRR.filter(v => T[v[0]]);
    if (!lignes.length) return '';
    return `<details class="irr" ${lignes.some(v => T[v[0]] === N) ? 'open' : ''}><summary><b>Vos verbes irréguliers</b> <span class="doux petit">${lignes.length} rencontré${lignes.length > 1 ? 's' : ''} sur ${IRR.length}</span></summary>
      <p class="doux petit">Ce tableau se remplit tout seul, chaque fois que vous croisez un de ces verbes dans un module.</p>
      <table><thead><tr><th>Base</th><th><span class="c-ed">-ed</span> · T-1</th><th><span class="c-en">-en</span> · après have / be</th></tr></thead><tbody>
      ${lignes.map(v => `<tr class="${T[v[0]] === N ? 'neuf' : ''}"><td>${v[0]}</td><td>${v[1]}</td><td>${v[2]}</td></tr>`).join('')}</tbody></table></details>`;
  }

  /* ---------- 1 · posez la Courbe : on la reconstruit de mémoire à chaque module, elle grandit avec le parcours ---------- */
  function poserCourbe(z){
    const SL = [['T-2', 12, 'haut'], ['T-1', 37, 'haut'], ['T0', 63, 'haut'], ['T+1', 88, 'haut'], ['-ed', 37, 'bas'], ['-s', 63, 'bas']];
    if (N >= 5) SL.push(['BE + -ING', 76, 'bas2']);
    if (N >= 6) SL.push(['HAVE + -EN', 50, 'bas2']);
    if (N >= 7) SL.push(['HAD + -EN', 24, 'bas2']);
    if (N >= 8) SL.push(['WILL', 88, 'bas']);
    const intrus = N >= 8 ? ['-ing seul', 'T+2'] : ['-ing', 'T+2'];
    z.append(el(`<p class="eyebrow">Temps 1 · Posez la Courbe</p><h1>Posez la Courbe.</h1>
      <p>On commence toujours par là. Touchez une étiquette, puis sa place sur la ligne. Deux intrus se sont glissés dans le lot.</p>
      <div class="pose" id="pose">
        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">${window.FRGcourbe ? FRGcourbe({ xs: [120, 370, 630, 880], x0: 20, x1: 968, y: 100, k: .3, couleur: '#1a1a1a', couleurRouge: '#e3191f' }).svg : ''}</svg>
        ${SL.map(([id, x, r], i) => `<button type="button" class="case ${r}" style="left:${x}%" data-i="${i}" aria-label="Emplacement ${i + 1}">?</button>`).join('')}
      </div>
      <div class="banque" id="banque">${melange([...SL.map(s => s[0]), ...intrus]).map(t => `<button type="button" class="etiq">${t}</button>`).join('')}</div>
      <div><button type="button" class="btn plein" id="verif">Vérifier ma Courbe</button></div><div id="r"></div><div id="placer"></div>`));
    const pose = z.querySelector('#pose'), banque = z.querySelector('#banque'), r = z.querySelector('#r'); let choisie = null, essais = 0, finie = false;
    banque.addEventListener('click', e => { const b = e.target.closest('.etiq'); if (!b || finie) return; banque.querySelectorAll('.etiq').forEach(x => x.classList.remove('sel')); choisie = b; b.classList.add('sel'); });
    pose.addEventListener('click', e => { const c = e.target.closest('.case'); if (!c || finie) return;
      if (c.dataset.v) { const b = el(`<button type="button" class="etiq">${c.dataset.v}</button>`).firstChild; banque.append(b); delete c.dataset.v; c.textContent = '?'; c.classList.remove('plein', 'ko'); }
      if (choisie) { c.dataset.v = choisie.textContent; c.textContent = choisie.textContent; c.classList.add('plein'); choisie.remove(); choisie = null; } });
    const suite = () => { finie = true; z.querySelector('#verif').hidden = true; banque.hidden = true; placer(); };
    z.querySelector('#verif').addEventListener('click', () => { essais++; let bons = 0;
      pose.querySelectorAll('.case').forEach(c => { const ok = c.dataset.v === SL[+c.dataset.i][0]; c.classList.toggle('ok', ok); c.classList.toggle('ko', !ok && !!c.dataset.v); if (ok) bons++; });
      noter('courbe', bons === SL.length);
      if (bons === SL.length) { r.innerHTML = OK(`${YES()} Toute la langue tient sur cette ligne.`); suite(); }
      else if (essais >= 2) { pose.querySelectorAll('.case').forEach(c => { c.textContent = SL[+c.dataset.i][0]; c.classList.remove('ko'); c.classList.add('plein', 'corrige'); }); r.innerHTML = KO('Voici la Courbe. Regardez-la dix secondes : vous la reposerez au prochain module.'); E.erreurs.push('courbe'); sauver(); suite(); }
      else r.innerHTML = KO(NON(`${bons} sur ${SL.length}. Les repères T au-dessus de la ligne, les codes en dessous.`)); });
    /* puis : placer sur la Courbe des phrases des modules précédents (le rappel espacé, version Courbe) */
    function placer(){
      const box = z.querySelector('#placer'), Q = D.placer;
      if (!Q) { box.append(el('<h2 class="h2-suite">Et trois questions sur ce que vous savez déjà.</h2>')); let bons = 0; D.rappel.forEach(([q, ch, b, ex], i) => qcm(box, 'rappel' + i, q, ch, b, ex, () => { if (++bons === D.rappel.length) valider(); })); return; }
      box.append(el('<h2 class="h2-suite">Maintenant, placez ces phrases sur la Courbe.</h2><p class="doux petit">Où vit chaque phrase ? Touchez son repère. Son code apparaît.</p>')); let bons = 0;
      Q.forEach(([ph, zone, cd, ex], i) => { const d = el(`<div class="exo"><p class="phrase" lang="en">${prenom(ph)}</p><div class="choix zones">${['T-2', 'T-1', 'T0', 'T+1'].map(t => `<button class="puce" type="button">${t}</button>`).join('')}</div><div class="r"></div></div>`).firstChild; box.append(d);
        d.querySelectorAll('.puce').forEach(pu => pu.addEventListener('click', () => { if (d.dataset.fini) return; const juste = pu.textContent === zone; noter('placer' + i, juste);
          if (juste) { d.dataset.fini = 1; pu.classList.add('ok'); d.querySelector('.r').innerHTML = OK(`${YES()} <span class="code-par">(${esc(cd)})</span>`); if (++bons === Q.length) valider(); }
          else { pu.classList.add('ko'); d.querySelector('.r').innerHTML = KO(NON(ex || 'Cherchez le code sur le verbe : -s ou -ed ?')); E.erreurs.push('placer'); sauver(); } })); });
    }
    exiger('Posez la Courbe, puis placez les phrases.'); if (E.faits[E.step]) { suite(); valider(); }
  }

  /* ---------- la boîte de vitesses : on règle le code, la phrase se déduit ---------- */
  const MODAUX = { will:['will', 'would'], can:['can', 'could'], may:['may', 'might'], shall:['shall', 'should'], must:['must', 'must'] };
  const personne = s => /^i$/i.test(s) ? 'I' : (/^(you|we|they)$/i.test(s) ? 'pl' : 'he');
  function embrayer(M, st){
    const [b, s3, ed, en, ing] = M.verbe, p = personne(st.sujet), ch = [], t = st.t;
    const reste = () => { if (st.have) { ch.push(['have', 'have']); st.be ? ch.push(['been', 'have'], [ing, 'be']) : ch.push([en, 'have']); } else if (st.be) ch.push(['be', 'be'], [ing, 'be']); else ch.push([b, 'v']); };
    if (st.modal) { ch.push([MODAUX[st.modal][t === 'ed' ? 1 : 0], t]); reste(); }
    else if (st.have) { ch.push([t === 'ed' ? 'had' : (p === 'he' ? 'has' : 'have'), t]); st.be ? ch.push(['been', 'have'], [ing, 'be']) : ch.push([en, 'have']); }
    else if (st.be) ch.push([{ s:{ I:'am', he:'is', pl:'are' }, ed:{ I:'was', he:'was', pl:'were' } }[t][p], t], [ing, 'be']);
    else if (st.forme === 'aff') ch.push([t === 'ed' ? ed : (p === 'he' ? s3 : b), t]);
    else ch.push([t === 'ed' ? 'did' : (p === 'he' ? 'does' : 'do'), t], [b, 'v']);
    const suj = [st.sujet, 'suj']; let mots = st.forme === 'q' ? [ch[0], [st.sujet === 'I' ? 'I' : st.sujet.charAt(0).toLowerCase() + st.sujet.slice(1), 'suj'], ...ch.slice(1)] : st.forme === 'neg' ? [suj, ch[0], ['not', 'neg'], ...ch.slice(1)] : [suj, ...ch];
    mots = mots.map(([m, c], i) => [i === 0 ? m.charAt(0).toUpperCase() + m.slice(1) : m, c]);
    const parts = [st.modal ? (t === 'ed' ? `${st.modal} + -ed` : st.modal) : `-${t}`]; if (st.have) parts.push('have + -en'); if (st.be) parts.push('be + -ing');
    if (!st.modal && !st.have && !st.be && st.forme !== 'aff') parts.push(st.forme === 'neg' ? 'do + not' : 'do devant');
    const ou = st.modal ? (st.have ? 'regard sur T-1' : st.modal === 'will' && t === 's' ? 'T+1' : t === 'ed' ? 'T0 · -ed d\'éloignement' : 'T0') : st.have ? (t === 'ed' ? 'T-2' : 'T-1, tourné vers T0') : t === 'ed' ? 'T-1' : 'T0';
    return { html: mots.map(([m, c]) => `<span class="m-${c}">${esc(m)}</span>`).join(' ') + ' ' + esc(M.comp) + (st.forme === 'q' ? '?' : '.'), code: '(' + parts.join(' ; ') + ')', ou };
  }
  function boite(z){
    const M0 = D.machine, M = { ...M0, comp: parSecteur(M0.comp) }, FRC = parSecteur(M0.frc) || '', C0 = { sujet: M.sujets[0], t:'s', forme:'aff', have:false, be:false, modal:'' }; let st = { ...C0 }, n = 0, essais = 0;
    const peut = { t: N >= 3, be: N >= 4, have: N >= 5, will: N >= 7, modaux: N >= 8 };
    const seg = (cle, opts) => `<div class="levier" data-cle="${cle}">${opts.map(([v, lab, cls]) => `<button type="button" data-v="${v}" class="${cls || ''}">${lab}</button>`).join('')}</div>`;
    z.append(el(`<p class="eyebrow">Temps 5 · La boîte de vitesses</p><h1>Réglez le code. La phrase se déduit.</h1>
      <ol class="mode-emploi"><li>Lisez la phrase en français.</li><li>Réglez les leviers : <b>qui</b> fait l'action, puis le <b>type de phrase</b> : on affirme, on dit non (<em>not</em>) ou on pose une question${N >= 3 ? ', puis le <b>code</b> : -s ou -ed' : ''}.</li><li>Touchez <b>Fabriquer la phrase</b> : la machine écrit l'anglais. Si c'est la phrase demandée, c'est gagné.</li></ol>
      <div class="boite">
        <p class="cible"><span class="compteur" id="cpt"></span><span id="fr"></span></p>
        <div class="leviers">
          <div><span class="lab-l">Qui</span>${seg('sujet', M.sujets.map(x => [x, x]))}</div>
          <div><span class="lab-l">Phrase</span>${seg('forme', [['aff', '<b>+</b> J\'affirme'], ['neg', '<b>−</b> Je dis non'], ['q', '<b>?</b> Je demande']])}</div>
          ${peut.t ? `<div><span class="lab-l">Code</span>${seg('t', [['s', ICO_S + '<b>-s</b> T0', 'l-s'], ['ed', ICO_ED + '<b>-ed</b> T-1', 'l-ed']])}</div>` : ''}
          ${peut.have || peut.be ? `<div><span class="lab-l">Aspect</span><div class="levier multi">${peut.have ? '<button type="button" data-b="have" class="l-have">HAVE + -EN</button>' : ''}${peut.be ? '<button type="button" data-b="be" class="l-be">BE + -ING</button>' : ''}</div></div>` : ''}
          ${peut.will ? `<div><span class="lab-l">Modal</span>${seg('modal', [['', 'aucun'], ['will', 'will'], ...(peut.modaux ? [['can', 'can'], ['may', 'may'], ['shall', 'shall'], ['must', 'must']] : [])])}</div>` : ''}
        </div>
        <p class="code-vif" id="cv" aria-live="polite"></p>
        <p class="sortie" id="sortie" lang="en">• • •</p>
        <button class="btn plein" id="emb" type="button">⚙ Fabriquer la phrase</button>
      </div><div id="r"></div>`));
    const fr = z.querySelector('#fr'), cv = z.querySelector('#cv'), sortie = z.querySelector('#sortie'), r = z.querySelector('#r'), emb = z.querySelector('#emb');
    const egal = c => ['sujet', 't', 'forme', 'have', 'be', 'modal'].every(k => (c[k] === undefined ? C0[k] : c[k]) === st[k]);
    const peindre = () => { z.querySelectorAll('.levier[data-cle]').forEach(l => l.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(st[l.dataset.cle]) === b.dataset.v)));
      z.querySelectorAll('.levier.multi button').forEach(b => b.classList.toggle('on', !!st[b.dataset.b])); const g = embrayer(M, st); cv.innerHTML = `${esc(g.code)} <small>${g.ou}</small>`; sortie.innerHTML = '• • •'; };
    const cible = () => { const c = M.cibles[n]; z.querySelector('#cpt').textContent = `Phrase ${n + 1} / ${M.cibles.length}`; fr.textContent = `« ${prenom(c.fr).replace('{c}', FRC)} »`; essais = 0; emb.hidden = false; peindre(); };
    z.querySelector('.leviers').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || emb.hidden) return; const l = b.closest('.levier');
      if (l.dataset.cle) st[l.dataset.cle] = b.dataset.v; else st[b.dataset.b] = !st[b.dataset.b]; r.innerHTML = ''; peindre(); });
    emb.addEventListener('click', () => { const c = M.cibles[n], g = embrayer(M, st), juste = egal(c.etat); essais++; noter('boite' + n, juste); sortie.innerHTML = g.html;
      if (juste) { emb.hidden = true; r.innerHTML = OK(`${YES()} ${c.ok || ''} <span class="code-par">${esc(g.code)}</span>`);
        if (n < M.cibles.length - 1) { const b = el('<button class="btn plein" type="button">Phrase suivante</button>').firstChild; r.append(b); b.addEventListener('click', () => { n++; r.innerHTML = ''; cible(); }); } else { r.insertAdjacentHTML('beforeend', '<p class="mantra">Pas conjugué, pas validé. Vous venez de conjuguer.</p>'); valider(); } }
      else { r.innerHTML = KO(NON(essais < 2 ? `Vous avez dit ça, pas la phrase demandée. ${c.indice || 'Reprenez : qui ? on affirme, on nie ou on demande ? -s ou -ed ?'}` : `La solution : réglez ${Object.entries({ ...C0, ...c.etat }).filter(([k, v]) => v !== C0[k] || k === 'sujet').map(([k, v]) => ({ sujet:v, t: v === 'ed' ? '-ed (T-1)' : '-s (T0)', forme: { aff:'+ J\'affirme', neg:'− Je dis non', q:'? Je demande' }[v], have:'HAVE + -EN', be:'BE + -ING', modal:v }[k])).join(', ')}.`)); E.erreurs.push('boite'); sauver(); } });
    exiger('Réglez la boîte pour chaque phrase.'); cible(); if (E.faits[E.step]) valider();
  }

  /* chrono discret et remise à zéro */
  setInterval(() => { if (document.hidden) return; E.temps = E.temps || {}; E.temps[E.step] = (E.temps[E.step] || 0) + 5; sauver(); }, 5000);
  { const tx = $('#chrono-txt'); let vif = 0; const aff = () => { if (!tx) return; const t = Object.values(E.temps || {}).reduce((a, b) => a + b, 0) + vif % 5; tx.textContent = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
    setInterval(() => { if (!document.hidden) { vif++; aff(); } }, 1000); aff(); }
  { const zb = $('#zero'); let arme = null;
    if (zb) zb.addEventListener('click', () => { if (!arme) { zb.textContent = 'Sûr ? Tout effacer'; zb.classList.add('arme'); arme = setTimeout(() => { arme = null; zb.textContent = 'Recommencer'; zb.classList.remove('arme'); }, 4000); return; }
      try { localStorage.removeItem(CLE); localStorage.removeItem(CLE + '-pct'); } catch (e) {} location.reload(); }); }

  aller(Math.min(E.step || 0, ETAPES.length - 1));
})();
