/* Le lamantin IA (élèves de la formation, à vie) : l'élève écrit ce qu'il veut, le lamantin relit, situe chaque faute et l'explique.
   Relectures par jour selon la formule (fixé côté serveur) : Signature en libre accès, les autres formules en accès limité. */
(function(){
  'use strict';
  const API = 'https://courbe-classement.paulodubmx84.workers.dev';
  const N = Math.max(1, Math.min(32, parseInt(new URLSearchParams(location.search).get('n'), 10) || 1));
  const z = document.getElementById('ecran'), esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);
  const lire = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const S0 = lire('frg-session', null), jeton = S0 && S0.jeton, eleve = lire('frg-eleve', {}) || {}, prenom = eleve.prenom || '';
  document.getElementById('etape-nom').textContent = 'Atelier libre';
  const SUJETS = [
    ['Me présenter', 'Présentez-vous : qui vous êtes, votre métier, ce que vous aimez.'],
    ['Ma journée d\'hier', 'Racontez votre journée d\'hier, à T-1 : où, avec qui, ce que vous avez fait.'],
    ['Un e-mail à un client', 'Écrivez un court e-mail à un client : remerciez, proposez une date, concluez.'],
    ['Mon week-end prochain', 'Vos projets pour le week-end prochain : ce que vous allez faire, avec qui.'],
    ['Un problème au travail', 'Décrivez un problème récent au travail et comment vous l\'avez résolu.'],
    ['Mon entreprise', 'Présentez votre entreprise : ce qu\'elle fait, depuis quand, pour qui.']
  ];
  const surligner = (t, E) => { let h = '', k = 0; E.forEach((e, i) => { h += esc(t.slice(k, e.debut)) + '<mark class="ia-faute"><sup>' + (i + 1) + '</sup>' + esc(t.slice(e.debut, e.fin)) + '</mark>'; k = e.fin; }); return h + esc(t.slice(k)); };
  const LANG = N <= 8 ? 0 : N <= 16 ? 1 : N <= 24 ? 2 : 3;
  const bravo = ['Nice job! Rien à reprendre : vos codes sont justes.', 'Nice job! Nothing to fix.', 'Great work: nothing to fix. Your codes are spot on.', 'Great work, nothing to fix.'][LANG];

  z.innerHTML = `<p class="eyebrow">Le lamantin · atelier libre</p><div class="lm-tete"><div class="lamantin" id="lamantin" data-bulle="arrivee" aria-hidden="true"></div><h1>${prenom ? 'Hey ' + esc(prenom) + ', écrivez' : 'Écrivez'} ce que vous voulez, en anglais.</h1></div>
    <p>Un e-mail à envoyer, votre journée, un message pour un client : le lamantin relit, souligne chaque faute à sa place et vous explique pourquoi, avec les mots de la méthode.</p>
    <div class="lm-sujets" aria-label="Idées de sujets">${SUJETS.map(([t, c], i) => `<button class="puce" type="button" data-i="${i}">${t}</button>`).join('')}</div>
    <p class="doux petit" id="lm-consigne">Choisissez une idée, ou écrivez librement. Entre 2 et 12 phrases.</p>
    <textarea id="lm-texte" lang="en" spellcheck="false" placeholder="Write here…">${esc(lire('frg-atelier-brouillon', ''))}</textarea>
    <div class="en-nav"><span class="lm-quota" id="lm-quota"></span><button class="btn plein" id="lm-go" type="button">Faire relire</button></div>
    <div id="lm-res"></div>
    <details class="exo"><summary><b>Mes derniers textes</b></summary><ol class="lm-hist" id="lm-hist"></ol></details>
    <div class="en-nav"><a class="btn" href="entrainement.html?n=${N}">← Les exercices du module ${N}</a><a class="btn" href="espace-eleve.html">Retour aux modules</a></div>`;
  const ta = z.querySelector('#lm-texte'), go = z.querySelector('#lm-go'), res = z.querySelector('#lm-res'), quota = z.querySelector('#lm-quota');
  ta.addEventListener('input', () => ecrire('frg-atelier-brouillon', ta.value));
  z.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => { z.querySelector('#lm-consigne').textContent = SUJETS[+b.dataset.i][1]; z.querySelectorAll('[data-i]').forEach(x => x.classList.toggle('ok', x === b)); ta.focus(); }));
  const hist = () => { const H = lire('frg-atelier', []); z.querySelector('#lm-hist').innerHTML = H.length ? H.map(h => `<li>${new Date(h.d).toLocaleDateString('fr-FR')} · ${h.n} faute${h.n > 1 ? 's' : ''} · <span lang="en">${esc(h.t.slice(0, 90))}${h.t.length > 90 ? '…' : ''}</span></li>`).join('') : '<li class="doux">Pas encore de texte.</li>'; };
  hist();
  const majQuota = (reste, plafond) => { quota.textContent = plafond <= 0 ? 'Le lamantin IA est réservé aux élèves de la formation.' : plafond >= 30 ? `Libre accès, à vie · ${reste} relecture${reste > 1 ? 's' : ''} restante${reste > 1 ? 's' : ''} aujourd'hui` : `${reste} / ${plafond} relecture${plafond > 1 ? 's' : ''} aujourd'hui · à vie`; go.disabled = reste <= 0;
    if (plafond <= 0) res.innerHTML = `<div class="retour-msg info">Le lamantin IA est inclus dans les trois formations, à vie. <a href="index.html#formations">Voir les formations</a></div>`;
    else if (reste <= 0) res.innerHTML = `<div class="retour-msg info">${plafond < 30 ? `Vos ${plafond} relectures du jour sont utilisées : elles reviennent demain. Avec Signature, le lamantin est en libre accès.` : 'Le lamantin fait une pause jusqu\'à demain : beaucoup de relectures aujourd\'hui !'}</div>`; };
  if (!jeton) { quota.textContent = 'Connectez-vous à votre espace élève pour écrire au lamantin.'; go.disabled = true; }
  else fetch(API + '/eleve/atelier', { method: 'POST', body: JSON.stringify({ jeton }) }).then(r => r.json()).then(j => { if (j.ok) majQuota(j.reste, j.plafond); else { quota.textContent = 'Session terminée : reconnectez-vous depuis l\'espace élève.'; go.disabled = true; } }).catch(() => {});
  go.addEventListener('click', async () => {
    const t = ta.value.trim(); if (t.length < 8) { res.innerHTML = '<div class="retour-msg ko">Écrivez au moins une phrase complète.</div>'; return; }
    document.dispatchEvent(new CustomEvent('lamantin:emote'));
    go.disabled = true; res.innerHTML = '<p class="doux">Le lamantin relit, puis vérifie… (quelques secondes)</p>';
    try { const j = await fetch(API + '/eleve/corriger', { method: 'POST', body: JSON.stringify({ jeton, module: N, texte: t, contexte: 'atelier', consigne: z.querySelector('#lm-consigne').textContent }) }).then(r => r.json());
      if (!j.ok) { res.innerHTML = `<div class="retour-msg ${j.raison === 'quota' ? 'info' : 'ko'}">${{ quota: `Vos relectures du jour sont utilisées : elles reviennent demain.${j.formule !== 'signature' ? ' Avec Signature, le lamantin est en libre accès.' : ''}`, session: 'Session terminée : reconnectez-vous depuis l\'espace élève.', court: 'Texte trop court.', indisponible: 'Le lamantin fait une pause. Réessayez dans un moment.' }[j.raison] || 'Le lamantin n\'a pas pu relire. Réessayez.'}</div>`; if (j.raison === 'quota') majQuota(0, j.plafond); else go.disabled = false; return; }
      const E = j.erreurs || [];
      res.innerHTML = `<div class="exo"><p class="ia-texte" lang="en">${surligner(j.texte, E)}</p>${E.length ? `<ol class="ia-liste">${E.map(e => `<li><s lang="en">${esc(e.extrait)}</s> → <b lang="en">${esc(e.correction)}</b><br><span class="doux petit">${esc(e.pourquoi)}</span></li>`).join('')}</ol><p class="doux petit">Corrigez dans le texte, puis faites relire à nouveau.</p>` : `<div class="retour-msg ok">${bravo}</div>`}</div>`;
      document.dispatchEvent(new CustomEvent('lamantin:emote', { detail: E.length ? null : 'courbe' }));
      const H = lire('frg-atelier', []); H.unshift({ d: Date.now(), n: E.length, t: j.texte }); ecrire('frg-atelier', H.slice(0, 20)); hist();
      if (j.plafond != null) majQuota(j.reste, j.plafond); else go.disabled = false;
    } catch (e) { res.innerHTML = '<div class="retour-msg ko">Connexion impossible. Vérifiez votre réseau.</div>'; go.disabled = false; }
  });
})();
