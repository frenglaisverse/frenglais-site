/* Frenglais · briques communes du parcours : réglages, missions, volume hebdomadaire, niveau CECRL, rapport élève.
   Tout reste sur l'appareil de l'élève ; le rapport part par WhatsApp vers le tuteur. */
(function(){
  const FRG = window.FRG = window.FRG || {};

  /* ---------- réglages (à compléter par Paul) ---------- */
  FRG.config = Object.assign({
    whatsapp: '',              /* numéro WhatsApp Business au format international, sans + ni espaces : 33612345678 */
    minutesParSemaine: 5,      /* jours de Minute Courbe attendus par semaine */
    seuilVolume: 80,           /* % de volume hebdomadaire tenu sous lequel l'objectif de niveau est compromis */
    seuilModule: 90            /* % pour valider un module */
  }, FRG.config || {});

  const lire = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  FRG.lire = lire; FRG.ecrire = ecrire;
  /* ---------- démo prospect : un code invité ouvre quelques modules pour une durée limitée ---------- */
  FRG.API = 'https://courbe-classement.paulodubmx84.workers.dev';
  FRG.demo = () => { const d = lire('frg-demo', null); return d && d.expire > Date.now() ? d : null; };
  FRG.demoExpiree = () => { const d = lire('frg-demo', null); return !!(d && d.expire <= Date.now()); };
  FRG.demoVerifier = async code => { const r = await fetch(FRG.API + '/invite/verifier', { method: 'POST', body: JSON.stringify({ code }) }).then(x => x.json());
    if (r.ok) ecrire('frg-demo', { code, nom: r.nom, expire: r.expire, modules: r.modules }); return r; };
  /* page de module ouverte hors du périmètre de la démo : on remplace le contenu par un message */
  FRG.demoGarde = n => { const d = FRG.demo(), exp = FRG.demoExpiree(); if (!d && !exp) return;
    if (d && d.modules.includes(n)) return;
    document.addEventListener('DOMContentLoaded', () => { const m = document.createElement('div'); m.style.cssText = 'position:fixed;inset:64px 0 0;z-index:50;background:var(--fond,#F5F6FA);overflow:auto'; document.body.appendChild(m);
      m.innerHTML = '<div style="max-width:560px;margin:12vh auto;text-align:center;padding:0 20px"><p class="eyebrow">' + (exp ? 'Démo terminée' : 'Hors démo') + '</p><h1 style="font-size:clamp(28px,5vw,40px);margin:.2em 0">' + (exp ? 'Votre accès démo est terminé.' : 'Ce module fait partie de la formation complète.') + '</h1><p class="lead">Pour ouvrir tout le parcours, demandez un devis : on cale le format avec vous.</p><p style="margin-top:24px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a class="btn" href="index.html#devis">Demander un devis</a><a class="btn btn-contour" href="modules.html">Retour aux modules</a></p></div>'; }); };
  const JOUR = 864e5, SEM = 7 * JOUR;
  FRG.jourCle = (t = Date.now()) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  /* identité locale de l'élève (pour que le tuteur range ses rapports) */
  FRG.id = () => { let i = lire('frg-id', null); if (!i) { i = Math.random().toString(36).slice(2, 8).toUpperCase(); ecrire('frg-id', i); } return i; };
  FRG.prenom = () => { const m1 = lire('frg-m1', {}) || {}; return m1.prenom || ''; };
  FRG.secteur = () => { const m1 = lire('frg-m1', {}) || {}; return (lire('frg-profil', {}) || {}).secteur || m1.sect || ''; };
  FRG.debut = () => { let d = lire('frg-debut', null); if (d === null) { d = Date.now(); ecrire('frg-debut', d); } return +d; };
  FRG.rythme = () => +(lire('frg-rythme', 2)) || 2;

  /* ---------- missions « dans la vraie vie » : une par module, envoyée au tuteur par WhatsApp ---------- */
  FRG.MISSIONS = {
    1: ['Vocal · 30 secondes', 'Trois choses que vous faites chaque semaine (T0, -s), puis trois choses que vous avez faites hier (T-1, -ed).'],
    2: ['Écrit · 5 phrases', 'Décrivez la semaine type d\'un collègue, avec he ou she. Chaque -s doit être là.'],
    3: ['Vocal · 45 secondes', 'Racontez votre dernier week-end. Uniquement du T-1 : chaque verbe porte son -ed, visible ou invisible.'],
    4: ['Photo + 4 phrases', 'Photographiez votre lieu de travail (sans visage) et écrivez ce que les gens sont en train de faire : be + -ing.'],
    5: ['Écrit · 5 phrases', 'Cinq choses que vous avez accomplies cette année et qui comptent encore aujourd\'hui : I have + -en.'],
    6: ['Vocal · 45 secondes', 'Racontez un imprévu : ce qui s\'était passé avant que vous arriviez (had + -en), puis ce que vous avez fait.'],
    7: ['Écrit · 5 lignes', 'Votre semaine prochaine : ce qui est déjà prévu (going to) et une décision que vous prenez maintenant (will).'],
    8: ['Écrit · 4 phrases', 'Quatre projets, un modal chacun : will, should, may, might. Notez le pourcentage à côté.'],
    9: ['Vocal · 30 secondes', 'Depuis quand faites-vous votre métier, et depuis quand êtes-vous à votre poste actuel ? have been + -ing, for, since.'],
    10: ['Écrit · 6 questions', 'Préparez six questions à poser à un client ou un collègue anglophone. Si l\'occasion se présente, posez-en une pour de vrai.'],
    11: ['Vocal · 45 secondes', 'Lisez « I think three things are worth it », puis présentez-vous en exagérant TH, R et le I court.'],
    12: ['Vocal · 1 minute', 'Votre parcours sur toute la Courbe : un souvenir (T-2, T-1), votre poste (bilan), aujourd\'hui (T0), demain (T+1).'],
    13: ['Écrit · 6 phrases', 'Votre journée d\'hier avec seulement get, make, do et take. Aucun autre verbe d\'action.'],
    14: ['Repérage', 'Regardez dix minutes d\'une série ou d\'un podcast en anglais. Envoyez trois verbes à particule entendus, avec le moment exact.'],
    15: ['Écrit · 5 phrases', 'Cinq phrases de votre métier avec depend on, listen to, wait for, reply to, deal with.'],
    16: ['Vocal · 45 secondes', 'Choisissez trois objets autour de vous dont vous ignorez le nom anglais. Décrivez-les sans les nommer.'],
    17: ['Vocal · 30 secondes', 'Votre présentation d\'ascenseur : qui vous êtes, ce que vous faites, ce que vous cherchez.'],
    18: ['Capture d\'écran', 'Écrivez un vrai e-mail en anglais (envoyé, ou prêt à l\'être) et envoyez la capture.'],
    19: ['Vocal · message', 'Laissez un message comme sur un répondeur : votre nom épelé, un numéro, la raison de l\'appel.'],
    20: ['Vocal · 30 secondes', 'Lisez à voix haute cinq chiffres de votre journée : un prix, une heure, une date, un numéro, une quantité.'],
    21: ['Photo + 4 phrases', 'Comparez deux produits ou deux offres réels : prix, qualité, avantage. -er, more, the -est.'],
    22: ['Écrit · 5 phrases', 'Un paragraphe sur un choix récent, relié par because, so, however et although.'],
    23: ['Vocal · 45 secondes', '« If I had a free year, I would… » Puis une condition réelle : « If I finish early tomorrow, I will… »'],
    24: ['Repérage', 'Écoutez cinq minutes d\'anglais réel. Envoyez trois expressions entendues que vous n\'auriez pas dites vous-même.'],
    25: ['Photo + 4 phrases', 'Un objet ou un service de votre métier : comment il est fabriqué, vérifié, livré. Uniquement au passif.'],
    26: ['Vocal · 45 secondes', '« When I was a child, I used to… » Puis une chose à laquelle vous êtes habitué aujourd\'hui : I\'m used to + -ing.'],
    27: ['Écrit · 3 phrases', 'Trois regrets ou soulagements : should have, could have, would have + -en.'],
    28: ['Écrit · 4 phrases', 'Rapportez une vraie conversation de votre journée : he said, she told me, they asked if…'],
    29: ['Vocal · 1 minute', 'Convainquez-moi d\'essayer quelque chose que vous aimez : avis net, preuve, objection retournée, proposition.'],
    30: ['Vidéo ou vocal · 90 secondes', 'Une prise de parole complète : une ouverture forte, un plan en trois points, une conclusion.'],
    31: ['Écrit · votre plan', 'Votre plan des quatre prochaines semaines : dix minutes par jour, accrochées à quoi, avec quel contenu.'],
    32: ['Vocal · 3 minutes', 'Votre grand oral. Puis réécoutez votre voix du module 1 et écrivez une phrase sur ce qui a changé.']
  };
  FRG.missions = () => lire('frg-missions', {});
  FRG.missionFaite = n => { const m = FRG.missions(); m[n] = Date.now(); ecrire('frg-missions', m); };

  /* lien WhatsApp prérempli (si le numéro n'est pas encore réglé, on renvoie null et la page propose de copier) */
  FRG.whatsapp = texte => FRG.config.whatsapp ? 'https://wa.me/' + FRG.config.whatsapp + '?text=' + encodeURIComponent(texte) : null;
  FRG.texteMission = n => { const [type, cons] = FRG.MISSIONS[n] || ['', '']; const p = FRG.prenom();
    return `Mission du module ${n} · ${p || 'élève'} (${FRG.id()})\n${type} : ${cons}\n\n→ Ma mission ci-dessous :\n`; };

  /* ---------- volume hebdomadaire : ce qui conditionne les résultats ---------- */
  FRG.semaineDe = t => Math.max(0, Math.floor((t - FRG.debut()) / SEM));
  FRG.volume = (data) => {
    /* data facultatif : rapport décodé (côté tuteur). Sinon, on lit l'appareil. */
    const d = data || FRG.collecter();
    const debut = d.debut, rythme = d.rythme, now = d.genere || Date.now();
    const nbSem = Math.max(1, Math.floor((now - debut) / SEM) + 1);
    const S = Array.from({ length: nbSem }, (_, i) => ({ semaine: i + 1, modules: 0, minutes: 0, missions: 0, atelier: !!(d.ateliers && d.ateliers[i + 1]) }));
    const sem = t => Math.min(nbSem - 1, Math.max(0, Math.floor((t - debut) / SEM)));
    Object.values(d.modules || {}).forEach(m => { if (m.valide && m.date) S[sem(m.date)].modules++; });
    Object.keys(d.minute || {}).forEach(j => { const t = new Date(j + 'T12:00:00').getTime(); S[sem(t)].minutes++; });
    Object.values(d.missions || {}).forEach(t => { S[sem(t)].missions++; });
    const cfg = Object.assign({}, FRG.config, d.cfg || {});
    const avecAtelier = !!d.atelierPrevu;
    S.forEach((s, i) => {
      const partielle = i === nbSem - 1 ? Math.min(1, ((now - debut) % SEM) / SEM + 1 / 7) : 1;
      const parts = [Math.min(1, s.modules / rythme), Math.min(1, s.minutes / cfg.minutesParSemaine), Math.min(1, s.missions / rythme)];
      const poids = [0.5, 0.3, 0.2];
      if (avecAtelier) { parts.push(s.atelier ? 1 : 0); poids.splice(0, 3, 0.45, 0.25, 0.15, 0.15); }
      s.pct = Math.round(100 * parts.reduce((a, p, k) => a + p * poids[k], 0));
      s.enCours = i === nbSem - 1 && partielle < 1;
    });
    const closes = S.filter(s => !s.enCours);
    const moyenne = closes.length ? Math.round(closes.reduce((a, s) => a + s.pct, 0) / closes.length) : null;
    return { semaines: S, moyenne, tenu: moyenne === null ? null : moyenne >= cfg.seuilVolume, seuil: cfg.seuilVolume, cible: { modules: rythme, minutes: cfg.minutesParSemaine, missions: rythme, atelier: avecAtelier } };
  };

  /* ---------- niveau CECRL : calcul à partir des bandes du test ---------- */
  FRG.NIVEAUX = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  FRG.TOEIC = { A1: 120, A2: 225, B1: 550, B2: 785, C1: 945 };  /* seuils d'entrée ETS (écoute + lecture, sur 990) */
  FRG.niveauDepuisBandes = bandes => {
    /* bandes : [{niveau, bons, total}] dans l'ordre A1 → C1. Un niveau est acquis si ≥ 5/8 sur sa bande
       et ≥ 4/8 sur chacune des bandes inférieures. */
    let acquis = null;
    for (let i = 0; i < bandes.length; i++) {
      const b = bandes[i], basOk = bandes.slice(0, i).every(x => x.bons / x.total >= 0.5);
      if (b.bons / b.total >= 0.625 && basOk) acquis = b.niveau; else if (!basOk) break;
    }
    return acquis || 'Débutant';
  };
  FRG.rangNiveau = n => { const i = FRG.NIVEAUX.indexOf((n || '').replace('+', '')); return i < 0 ? -1 : i; };
  FRG.niveauGlobal = (ecrit, oral) => { if (!oral) return ecrit; return FRG.rangNiveau(oral) < FRG.rangNiveau(ecrit) ? oral : ecrit; };

  /* ---------- le rapport de l'élève : tout ce que le tuteur doit savoir, en un code ---------- */
  FRG.collecter = () => {
    const modules = {};
    for (let n = 1; n <= 32; n++) { const e = lire('frg-m' + n, null); if (!e) continue;
      const N = Object.values(e.notes || {}), score = e.score != null ? e.score : (N.length ? Math.round(N.reduce((a, b) => a + b, 0) / N.length * 100) : null);
      modules[n] = { score, valide: !!(e.fini && (e.valide || (e.valide === undefined && score >= 90))), date: e.dateFin || null, fini: !!e.fini,
        temps: Math.round(Object.values(e.temps || {}).reduce((a, b) => a + b, 0) / 60), erreurs: (e.erreurs || []).slice(-20) }; }
    const mi = lire('frg-minute', {}) || {};
    return { v: 1, id: FRG.id(), prenom: FRG.prenom(), nom: lire('frg-nom', ''), secteur: FRG.secteur(), debut: FRG.debut(), rythme: FRG.rythme(), genere: Date.now(),
      modules, minute: mi.jours || {}, missions: FRG.missions(), tests: { entree: lire('frg-test-entree', null), sortie: lire('frg-test-sortie', null) } };
  };
  const b64 = u8 => { let s = ''; u8.forEach(c => s += String.fromCharCode(c)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const deb64 = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); const bin = atob(s); return Uint8Array.from(bin, c => c.charCodeAt(0)); };
  FRG.encoder = async obj => { const txt = new TextEncoder().encode(JSON.stringify(obj));
    if (window.CompressionStream) { const cs = new Blob([txt]).stream().pipeThrough(new CompressionStream('deflate-raw')); return 'FRG1z.' + b64(new Uint8Array(await new Response(cs).arrayBuffer())); }
    return 'FRG1.' + b64(txt); };
  FRG.decoder = async code => { const m = String(code).match(/FRG1(z?)\.([A-Za-z0-9_-]+)/); if (!m) throw new Error('Code introuvable dans le message.');
    let u8 = deb64(m[2]); if (m[1]) { const ds = new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw')); u8 = new Uint8Array(await new Response(ds).arrayBuffer()); }
    return JSON.parse(new TextDecoder().decode(u8)); };
  /* ---------- certificat de fin de parcours (même rendu côté élève et côté tuteur) ---------- */
  const SECT = { pro:'Professionnels', hotel:'Hôtellerie', luxe:'Luxe', tour:'Tourisme', immo:'Immobilier' };
  FRG.nomSecteur = s => SECT[s] || '';
  FRG.donneesCertificat = (d, extra = {}) => {
    const vals = Object.entries(d.modules || {}).filter(([n, m]) => m.valide && +n <= 24).map(([, m]) => m), scores = vals.map(m => m.score).filter(x => x != null);
    const sortie = d.tests && d.tests.sortie, entree = d.tests && d.tests.entree, vol = FRG.volume(d);
    const ecrit = sortie ? sortie.niveau : null, oral = extra.oral || null;
    return { prenom: d.prenom, nom: extra.nom || d.nom || '', secteur: FRG.nomSecteur(d.secteur), debut: d.debut, fin: sortie ? sortie.date : d.genere,
      valides: vals.length, moyenne: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      entree: entree ? entree.niveau : null, ecrit, oral, global: ecrit ? FRG.niveauGlobal(ecrit, oral) : null,
      engagement: vol.moyenne, tenu: vol.tenu, seuil: vol.seuil, numero: 'FRG-' + new Date(sortie ? sortie.date : d.genere).getFullYear() + '-' + (d.id || '') };
  };
  FRG.manquesCertificat = c => { const m = []; if (c.valides < 24) m.push(`valider les 24 modules (${c.valides} / 24)`); if (!c.ecrit) m.push('passer le test de sortie'); return m; };
  FRG.CSS_CERTIF = `.certif{position:relative;max-width:900px;margin:0 auto;aspect-ratio:297/210;background:#FBFAF6;color:#0E1B3D;border-radius:6px;padding:4.2% 5.4%;box-shadow:0 20px 60px rgba(14,27,61,.14);display:flex;flex-direction:column;gap:2.2%;font-family:var(--f-txt,system-ui);overflow:hidden;container-type:inline-size}
.certif::before{content:"";position:absolute;inset:1.6%;border:1.5px solid #1C49A5;border-radius:3px;pointer-events:none}
.certif::after{content:"";position:absolute;inset:2.4%;border:.5px solid rgba(28,73,165,.35);border-radius:2px;pointer-events:none}
.certif .c-tete{display:flex;justify-content:space-between;align-items:flex-start}
.certif .c-tete img{width:16cqw;height:auto}
.certif .c-num{font:500 1.35cqw var(--f-mono,monospace);color:#4A5578;text-align:right;line-height:1.5}
.certif .c-sur{white-space:nowrap;font:600 1.5cqw var(--f-mono,monospace);letter-spacing:.24em;text-transform:uppercase;color:#1C49A5;margin:0}
.certif h2{font:600 4.6cqw/1.05 var(--f-txt,system-ui);letter-spacing:-.02em;margin:.4cqw 0 0}
.certif .c-nom{font:600 3.6cqw/1.1 var(--f-txt,system-ui);margin:0;border-bottom:1px solid rgba(14,27,61,.18);padding-bottom:.8cqw}
.certif .c-txt{font-size:1.65cqw;line-height:1.5;margin:0;color:#24304F;max-width:60%}
.certif .c-grille{display:grid;grid-template-columns:repeat(4,1fr);gap:1.4cqw;margin-top:auto}
.certif .c-grille div{border-top:2px solid #1C49A5;padding-top:.8cqw}
.certif .c-grille b{display:block;font:700 3.4cqw/1 var(--f-txt,system-ui);color:#1C49A5}
.certif .c-grille span{font-size:1.3cqw;color:#4A5578;line-height:1.35;display:block;margin-top:.4cqw}
.certif .c-courbe{position:absolute;right:6%;top:47%;width:30%;opacity:.9}
.certif .c-pied{display:flex;justify-content:space-between;align-items:flex-end;gap:2cqw}
.certif .c-sign{font:italic 500 2.2cqw var(--f-txt,system-ui);border-top:1px solid rgba(14,27,61,.3);padding-top:.5cqw;min-width:28%}
.certif .c-sign small{display:block;font:normal 1.2cqw var(--f-txt,system-ui);color:#4A5578}
.certif .c-mention{font-size:1.05cqw;color:#4A5578;max-width:58%;line-height:1.45;margin:0}
.certif .c-filigrane{position:absolute;inset:0;display:grid;place-items:center;font:800 13cqw var(--f-txt,system-ui);color:rgba(240,118,111,.13);transform:rotate(-14deg);pointer-events:none;letter-spacing:.05em}
@media print{@page{size:A4 landscape;margin:0}body{background:#fff!important}.certif{box-shadow:none;border-radius:0;max-width:none;width:297mm;height:210mm;aspect-ratio:auto}.non-imprime{display:none!important}}`;
  FRG.certificatHTML = (c, logo, apercu) => {
    const dt = t => t ? new Date(t).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' }) : '—';
    const e = s => String(s == null ? '' : s).replace(/[&<>"]/g, x => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[x]));
    const progression = c.entree && c.global ? (FRG.rangNiveau(c.global) > FRG.rangNiveau(c.entree) ? `progression de ${e(c.entree)} à ${e(c.global)}` : `niveau ${e(c.global)} confirmé`) : '';
    return `<div class="certif">${apercu ? '<div class="c-filigrane">APERÇU</div>' : ''}
      <div class="c-tete"><img src="${logo}" alt="Frenglais"><div class="c-num">Certificat n° ${e(c.numero)}<br>Délivré le ${dt(c.fin)}</div></div>
      <div><p class="c-sur">Certificat de fin de parcours · Courbe des Temps</p><h2>Anglais, en partant de la base.</h2></div>
      <p class="c-nom">${e([c.prenom, c.nom].filter(Boolean).join(' ')) || '—'}</p>
      <p class="c-txt">a suivi le parcours complet Frenglais${c.secteur ? `, version ${e(c.secteur)},` : ''} du ${dt(c.debut)} au ${dt(c.fin)}, a validé ${c.valides} modules sur 24 avec un seuil de ${FRG.config.seuilModule} % de réussite au premier essai${progression ? `, et atteste d'une ${progression}` : ''}.</p>
      <svg class="c-courbe" viewBox="0 0 300 90" aria-hidden="true"><path d="M8 50 C70 44 110 56 160 48 S240 42 286 48" fill="none" stroke="#0E1B3D" stroke-width="3" stroke-linecap="round"/><path d="M276 40 l11 8 l-11 8" fill="none" stroke="#0E1B3D" stroke-width="3" stroke-linecap="round"/><g font-family="monospace" font-size="12" fill="#0E1B3D" text-anchor="middle"><text x="40" y="30">T-2</text><text x="110" y="30">T-1</text><text x="185" y="30">T0</text><text x="255" y="30">T+1</text></g><rect x="92" y="60" width="36" height="20" rx="5" fill="#F0766F"/><text x="110" y="74" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">-ed</text><rect x="169" y="60" width="32" height="20" rx="5" fill="#1C49A5"/><text x="185" y="74" font-size="12" font-weight="700" fill="#fff" text-anchor="middle">-s</text></svg>
      <div class="c-grille">
        <div><b>${e(c.global || '—')}</b><span>Niveau global (CECRL)${c.entree ? `<br>à l'entrée : ${e(c.entree)}` : ''}</span></div>
        <div><b>${e(c.ecrit || '—')}</b><span>Compréhension et structure<br>test de sortie</span></div>
        <div><b>${e(c.oral || '—')}</b><span>Expression orale<br>évaluée par le tuteur</span></div>
        <div><b>${c.moyenne != null ? c.moyenne + ' %' : '—'}</b><span>Réussite moyenne<br>engagement ${c.engagement != null ? c.engagement + ' %' : '—'}</span></div>
      </div>
      <div class="c-pied"><p class="c-mention">Niveau évalué par Frenglais selon le Cadre européen commun de référence pour les langues (CECRL), à partir du test de sortie et de l'évaluation orale. Le niveau global retient la plus basse des deux évaluations. Ce certificat atteste du suivi et du niveau mesuré en fin de formation ; il ne remplace pas une certification officielle (TOEIC, Linguaskill, Cambridge).</p>
      <div class="c-sign">Paul Moreaux<small>Fondateur de Frenglais · ancien enseignant Fulbright</small></div></div>
    </div>`;
  };
  /* ---------- bloc « mission » : affiché en fin de module ---------- */
  FRG.monterMission = (box, n, ficheHref) => {
    const [type, cons] = FRG.MISSIONS[n] || ['', '']; const faite = FRG.missions()[n];
    box.insertAdjacentHTML('beforeend', `<div class="mission-bloc">
      <p class="eyebrow" style="color:inherit;opacity:.8">Votre défi · dans la vraie vie</p>
      <h2>${type}</h2><p>${cons}</p>
      <p class="petit" style="opacity:.8">À relever seul, avant le prochain module. Avant de cocher, vérifiez-vous : chaque phrase dit qui, fait quoi, à quoi ? Chaque verbe porte le bon code ? Dites-la une fois à voix haute.</p>
      <div class="ligne-m"><button class="btn plein" id="m-ok" type="button" ${faite ? 'disabled' : ''}>${faite ? 'Fait ✓' : 'Fait'}</button>
      ${ficheHref ? `<a class="btn ${faite ? '' : 'pdf-grise'}" id="m-resume" href="${faite ? ficheHref : '#'}" ${faite ? '' : 'aria-disabled="true" tabindex="-1" title="Touchez « Fait » pour débloquer le résumé"'}>${faite ? '' : '🔒 '}Télécharger le résumé du module (PDF)</a>` : ''}</div>
      <p class="petit" style="opacity:.8;margin:0">Il compte dans votre rythme de la semaine.</p></div>`);
    const ok = box.querySelector('#m-ok');
    ok.addEventListener('click', () => { FRG.missionFaite(n); ok.disabled = true; ok.textContent = 'Fait ✓'; const r = box.querySelector('#m-resume'); if (r) { r.classList.remove('pdf-grise'); r.removeAttribute('aria-disabled'); r.removeAttribute('tabindex'); r.removeAttribute('title'); r.href = r.dataset.href || ficheHref; r.textContent = 'Télécharger le résumé du module (PDF)'; r.classList.add('plein'); } });
  };

  /* ---------- envoyer le rapport au tuteur ---------- */
  FRG.envoyerRapport = async (info) => {
    const code = await FRG.encoder(FRG.collecter()), p = FRG.prenom();
    const texte = `Bilan Frenglais · ${p || 'élève'} (${FRG.id()})\nPaul, voici mon bilan. Le code ci-dessous contient mes modules et mes scores.\n\n${code}`;
    const lien = FRG.whatsapp(texte);
    if (lien) { window.open(lien, '_blank', 'noopener'); if (info) info.textContent = 'WhatsApp s\'ouvre avec votre bilan. Il ne reste qu\'à appuyer sur Envoyer.'; return; }
    try { await navigator.clipboard.writeText(texte); if (info) info.textContent = 'Bilan copié. Collez-le dans un message à Paul et envoyez-le.'; }
    catch (e) { if (info) info.textContent = 'Copie impossible ici. Code de votre bilan : ' + code.slice(0, 40) + '…'; }
    return texte;
  };
})();
/* ---------- note vocale façon iPhone : lecture, onde qui se remplit, durée, transcription repliable ---------- */
(function(){
  let enCours = null;
  const fmt = s => !isFinite(s) || s < 0 ? '0:00' : Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  const ICO_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>', ICO_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z"/></svg>';
  /* src : fichier audio (ou blob) ; o.secours(fin) : lecture de secours (synthèse) si le fichier manque ; o.petit ; o.lien : élément de transcription à replier */
  function note(src, o){
    o = o || {};
    const n = o.petit ? 22 : 34; let h = 2166136261; for (const c of String(o.graine || src)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    const barres = Array.from({ length: n }, (_, i) => { h = Math.imul(h ^ (h >>> 13), 1597334677) >>> 0; const base = 0.25 + (h % 1000) / 1000 * 0.75, env = Math.sin(Math.PI * (i + .5) / n) * .35 + .65; return Math.max(.18, base * env); });
    const d = document.createElement('div'); d.className = 'note-v' + (o.petit ? ' petit' : ''); d.lang = 'fr';
    d.innerHTML = `<button type="button" class="nv-play" aria-label="Écouter">${ICO_PLAY}</button><div class="nv-onde" role="slider" aria-label="Position" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">${barres.map(v => `<i style="height:${Math.round(v * 100)}%"></i>`).join('')}</div><span class="nv-t">0:00</span>`;
    const bt = d.querySelector('.nv-play'), onde = d.querySelector('.nv-onde'), t = d.querySelector('.nv-t'), bs = [...onde.children];
    const a = new Audio(); a.preload = 'metadata'; a.src = src; let duree = NaN, secoursActif = false, lisant = false;
    const peindre = p => { const k = Math.round(p * n); bs.forEach((b, i) => b.classList.toggle('lu', i < k)); onde.setAttribute('aria-valuenow', Math.round(p * 100)); };
    const etat = on => { lisant = on; d.classList.toggle('joue', on); bt.innerHTML = on ? ICO_PAUSE : ICO_PLAY; bt.setAttribute('aria-label', on ? 'Pause' : 'Écouter'); };
    a.addEventListener('loadedmetadata', () => { duree = a.duration; if (isFinite(duree)) t.textContent = fmt(duree); });
    a.addEventListener('timeupdate', () => { if (isFinite(a.duration)) { peindre(a.currentTime / a.duration); t.textContent = fmt(a.currentTime); d.dispatchEvent(new CustomEvent('nvtemps', { bubbles: true, detail: a.currentTime / a.duration })); } else t.textContent = fmt(a.currentTime); });
    a.addEventListener('pause', () => d.dispatchEvent(new CustomEvent('nvtemps', { bubbles: true, detail: -1 })));
    a.addEventListener('ended', () => { etat(false); peindre(0); t.textContent = isFinite(a.duration) ? fmt(a.duration) : fmt(a.currentTime); o.fin && o.fin(true); });
    let echec = false; a.addEventListener('error', () => { echec = true; if (o.secours) t.textContent = ''; });
    const arreter = () => { if (secoursActif) { try { speechSynthesis.cancel(); } catch (e) {} secoursActif = false; etat(false); peindre(0); } else { a.pause(); etat(false); } };
    const jouer = () => {
      if (enCours && enCours !== arreter) enCours(); enCours = arreter;
      if (echec && o.secours) { secoursActif = true; etat(true); let p = 0; const it = setInterval(() => { if (!secoursActif) return clearInterval(it); p = (p + .02) % 1; peindre(p); }, 200);
        o.secours(ok => { clearInterval(it); secoursActif = false; etat(false); peindre(0); o.fin && o.fin(ok); }); return; }
      a.play().then(() => etat(true)).catch(() => { echec = true; if (o.secours) jouer(); });
    };
    bt.addEventListener('click', () => lisant ? arreter() : jouer());
    const viser = x => { if (!isFinite(a.duration) || echec) return; const r = onde.getBoundingClientRect(); a.currentTime = Math.max(0, Math.min(1, (x - r.left) / r.width)) * a.duration; peindre(a.currentTime / a.duration); if (!lisant) jouer(); };
    onde.addEventListener('click', e => viser(e.clientX));
    onde.addEventListener('keydown', e => { if (!isFinite(a.duration)) return; if (e.key === 'ArrowRight') a.currentTime = Math.min(a.duration, a.currentTime + 5); if (e.key === 'ArrowLeft') a.currentTime = Math.max(0, a.currentTime - 5); if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); lisant ? arreter() : jouer(); } });
    d.audio = a; d.jouer = jouer; d.arreter = arreter;
    return d;
  }
  /* bouton « Transcription » qui déplie un bloc */
  function repli(corps, ouvert){
    const w = document.createElement('div'); w.className = 'tr-repli' + (ouvert ? ' ouvert' : '');
    w.innerHTML = `<button type="button" class="tr-tog" aria-expanded="${ouvert ? 'true' : 'false'}"><span>Transcription</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button><div class="tr-corps"${ouvert ? '' : ' hidden'}></div>`;
    const c = w.querySelector('.tr-corps'); if (typeof corps === 'string') c.innerHTML = corps; else c.append(corps);
    return w;
  }
  /* remplace chaque <div class="nv-slot" data-src> par une note vocale ; secours(src, fin) optionnel */
  function monter(racine, secours){
    (racine || document).querySelectorAll('.nv-slot').forEach(s => { const src = s.dataset.src; const nv = note(src, { petit: s.classList.contains('petit'), graine: s.dataset.graine, secours: secours ? fin => secours(s, fin) : null }); s.replaceWith(nv); });
    (racine || document).querySelectorAll('audio[controls]').forEach(au => { if (au.closest('.note-v')) return; const nv = note(au.src, { petit: true, graine: 'voix' + Math.random() }); au.replaceWith(nv); });
  }
  const repliHTML = (corps, ouvert) => `<div class="tr-repli${ouvert ? ' ouvert' : ''}"><button type="button" class="tr-tog" aria-expanded="${ouvert ? 'true' : 'false'}"><span>Transcription</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button><div class="tr-corps"${ouvert ? '' : ' hidden'}>${corps}</div></div>`;
  document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('.tr-tog'); if (!b) return; const w = b.closest('.tr-repli'), c = w.querySelector('.tr-corps'), o = c.hidden; c.hidden = !o; w.classList.toggle('ouvert', o); b.setAttribute('aria-expanded', o ? 'true' : 'false'); if (o && w.dataset.ouvert !== '1') { w.dataset.ouvert = '1'; w.dispatchEvent(new CustomEvent('ouvert', { bubbles: true })); } });
  /* la transcription suit l'audio : la phrase entendue s'éclaire (estimation au prorata de la longueur du texte) */
  document.addEventListener('nvtemps', e => { const tel = e.target.closest('.tel'); if (!tel) return; const L = [...tel.querySelectorAll('.trans .t-l')]; if (!L.length) return;
    const p = e.detail; if (p < 0) { L.forEach(l => l.classList.remove('dit')); return; }
    const tot = L.reduce((a, l) => a + l.textContent.length, 0); let c = 0, k = 0; for (; k < L.length; k++) { c += L[k].textContent.length; if (c / tot >= p) break; }
    L.forEach((l, i) => l.classList.toggle('dit', i === Math.min(k, L.length - 1))); });
  window.FRGNote = { note, repli, repliHTML, monter };
  /* toute balise <audio controls> ajoutée plus tard (vos enregistrements) devient une note vocale */
  if (window.MutationObserver) new MutationObserver(ms => { for (const m of ms) for (const x of m.addedNodes) if (x.nodeType === 1 && (x.matches('audio[controls]') || x.querySelector('audio[controls]'))) { monter(x.parentNode || x); } }).observe(document.documentElement, { childList: true, subtree: true });
})();

/* présence : un battement toutes les 2 minutes tant qu'une page élève est ouverte (pastille « en ligne » du tableau de bord) */
(function(){ const API='https://courbe-classement.paulodubmx84.workers.dev'; const go=()=>{ if(document.hidden) return; let S0=null; try{ S0=JSON.parse(localStorage.getItem('frg-session')||'null'); }catch(e){} if(!S0||!S0.jeton) return; fetch(API+'/eleve/present',{method:'POST',body:JSON.stringify({jeton:S0.jeton})}).catch(()=>{}); }; setTimeout(go,4000); setInterval(go,120000); document.addEventListener('visibilitychange',()=>{ if(!document.hidden) go(); }); })();
