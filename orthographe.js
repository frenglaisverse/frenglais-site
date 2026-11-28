/* Correcteur d'orthographe léger pour le jeu des mots : la forme la plus proche parmi les 12 000 mots anglais les plus courants. */
(function(){
  const tout = (window.MOTS_EN||'').split(' '); const rang = new Map(tout.map((m,i)=>[m,i])); const liste = tout.slice(0,15000);   // candidats : les 15 000 plus courants
  const connu = m => rang.has(m) || (m.endsWith('s') && rang.has(m.slice(0,-1))) || (m.endsWith('es') && rang.has(m.slice(0,-2)))
    || (m.endsWith('ed') && (rang.has(m.slice(0,-2))||rang.has(m.slice(0,-1)))) || (m.endsWith('ing') && (rang.has(m.slice(0,-3))||rang.has(m.slice(0,-3)+'e')))
    || (m.endsWith('ies') && rang.has(m.slice(0,-3)+'y'));
  function distance(a,b,max){ if (Math.abs(a.length-b.length)>max) return max+1; const d=[]; for(let i=0;i<=a.length;i++){ d[i]=[i*.8]; }
    for(let j=1;j<=b.length;j++) d[0][j]=j*.8;
    for(let i=1;i<=a.length;i++){ let mini=99; for(let j=1;j<=b.length;j++){ const c=a[i-1]===b[j-1]?0:1;
      d[i][j]=Math.min(d[i-1][j]+.8,d[i][j-1]+.8,d[i-1][j-1]+c); if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]) d[i][j]=Math.min(d[i][j],d[i-2][j-2]+.7); mini=Math.min(mini,d[i][j]); }
      if (mini>max) return max+1; }
    return d[a.length][b.length]; }
  function mot(m){
    const bas=m.toLowerCase(); if (!/^[a-z]+$/.test(bas) || bas.length<3 || connu(bas)) return null;
    if (/^[A-Z]/.test(m) && m.length>1 && m!==m.toUpperCase()) return null;   // nom propre : on n'y touche pas
    const max = bas.length>=7 ? 2 : 1; let mieux=null, md=max+.01;
    for (const w of liste){ if (Math.abs(w.length-bas.length)>max) continue; if (w.length<3) continue; const d0=distance(bas,w,max); if (d0>1.05 && w[0]!==bas[0]) continue; const dd=d0+rang.get(w)/150000; if (dd<md){ md=dd; mieux=w; } }
    return mieux;
  }
  // corrige une entrée (un mot ou une expression) ; renvoie {texte corrigé, changements}
  function corriger(entree){
    const changes=[]; const texte = entree.replace(/[A-Za-z]+/g, m => { const c=mot(m); if(!c) return m; const out = m[0]===m[0].toUpperCase() ? c[0].toUpperCase()+c.slice(1) : c; changes.push([m,out]); return out; });
    return { texte, changes };
  }
  window.Orthographe = { corriger, connu };
})();
