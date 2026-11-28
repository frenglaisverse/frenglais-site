/* Frenglais · parcours adaptatif.
   Trois parcours : Fondations (A1–A2), Standard (B1), Approfondi (B2 et plus).
   Départ : le test d'entrée. Ensuite, le parcours s'ajuste après chaque module selon le score du premier coup. */
(function(){
  const K = 'frg-parcours';
  const NOMS = { fond:'Fondations', std:'Standard', appr:'Approfondi' };
  const DESC = {
    fond:'Plus de répétition : les questions ratées reviennent, des indices sont là si vous en avez besoin, chaque réponse est expliquée.',
    std:'Le module complet, au rythme prévu.',
    appr:'Des questions plus exigeantes, moins d\'indices, et des cartes « Nuance » pour aller dans le détail.'
  };
  const ORDRE = ['fond', 'std', 'appr'];
  const DEPUIS_TEST = { A1:'fond', A2:'fond', B1:'std', B2:'appr', C1:'appr', C2:'appr' };
  const lireJ = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  function etat(){
    const p = lireJ(K, null); if (p && NOMS[p.n]) return p;
    const t = lireJ('frg-test-entree', null), n = t && DEPUIS_TEST[String(t.niveau || '').slice(0, 2)];
    return { n: n || 'std', source: n ? 'test' : 'defaut', hist: [] };
  }
  /* après un module : 95 % ou plus du premier coup → on monte ; moins de 70 % → on redescend d'un cran */
  function ajuster(score, module){
    const p = etat(), i = ORDRE.indexOf(p.n); let n = p.n;
    if (p.hist.some(h => h.m === module)) return { avant:p.n, apres:p.n, change:false };   // un module ne compte qu'une fois
    if (score >= 95 && i < 2) n = ORDRE[i + 1]; else if (score < 70 && i > 0) n = ORDRE[i - 1];
    const q = { n, source: p.source === 'defaut' && n !== p.n ? 'ajuste' : (n !== p.n ? 'ajuste' : p.source), hist: [...p.hist, { m:module, s:score, de:p.n, a:n, t:Date.now() }].slice(-40) };
    ecrire(K, q); return { avant:p.n, apres:n, change:n !== p.n };
  }
  function pastille(){
    const p = etat();
    return `<div class="parcours-pastille p-${p.n}"><b>Parcours ${NOMS[p.n]}</b><span>${DESC[p.n]}</span>${p.source === 'defaut' ? '<a href="test.html?type=entree">Faire le test d\'entrée pour ajuster</a>' : ''}</div>`;
  }
  window.FRGA = { niveau: () => etat().n, etat, ajuster, pastille, NOMS, DESC,
    fond: () => etat().n === 'fond', appr: () => etat().n === 'appr' };
})();
