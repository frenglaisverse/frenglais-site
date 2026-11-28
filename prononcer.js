/* Frenglais · prononciation des mots : la meilleure voix anglaise disponible sur l'appareil (voix « naturelles » en priorité). */
(function(){
  'use strict';
  const S = window.speechSynthesis; let voix = null;
  const PREF = [/natural/i, /neural/i, /google uk english/i, /sonia|libby|ryan|arthur|daniel|serena|kate|oliver|martha/i, /google us english/i, /samantha|aaron|nicky/i];
  function choisir(){ if (!S) return null; const V = S.getVoices().filter(v => /^en(-|_)(GB|US|IE|AU)/i.test(v.lang) || /^en$/i.test(v.lang)); if (!V.length) return null;
    for (const r of PREF) { const gb = V.find(v => r.test(v.name) && /GB/i.test(v.lang)), any = V.find(v => r.test(v.name)); if (gb || any) return gb || any; }
    return V.find(v => /GB/i.test(v.lang)) || V[0]; }
  if (S) { voix = choisir(); S.onvoiceschanged = () => { voix = choisir(); }; }
  window.FRGDire = function(texte, lent){ if (!S || !texte) return false; S.cancel(); const u = new SpeechSynthesisUtterance(String(texte).replace(/<[^>]+>/g, ''));
    u.lang = voix ? voix.lang : 'en-GB'; if (voix) u.voice = voix; u.rate = lent ? .7 : .92; S.speak(u); return true; };
  window.FRGDire.dispo = !!S;
  /* bouton haut-parleur : <button class="dire" data-dire="house">🔊</button> */
  document.addEventListener('click', e => { const b = e.target.closest('[data-dire]'); if (!b) return; e.preventDefault(); e.stopPropagation(); const lent = b.dataset.lent === '1'; FRGDire(b.dataset.dire, lent); b.dataset.lent = lent ? '0' : '1'; b.classList.add('dit'); setTimeout(() => b.classList.remove('dit'), 600); }, true);
})();
