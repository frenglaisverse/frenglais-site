/* Module 1 · lecteur : un écran par étape. Contenu dans module-1-data.js, correcteur dans lamantin-correcteur.js. */
(function(){
  const D = window.M1, C = window.Correcteur;
  const $ = s => document.querySelector(s);
  const ecran = $('#ecran'), suiv = $('#suiv'), prec = $('#prec'), verrou = $('#verrou');
  const CLE = 'frg-m1';
  let E = { sect:null, step:0, max:0, fini:false, nuage:[], version:'', faits:{} };
  try { Object.assign(E, JSON.parse(localStorage.getItem(CLE)||'{}')); } catch(e){}
  const sauver = () => { try { localStorage.setItem(CLE, JSON.stringify(E)); localStorage.setItem('frg-m1-pct', String(Math.round(pct()))); } catch(e){} };
  const el = (html) => { const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content; };
  const esc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const telVocal=(nom,corps,src,ouvert)=>`<div class="tel" lang="en"><div class="tel-tete"><span class="tel-av" aria-hidden="true">${esc(String(nom).charAt(0))}</span><b>${esc(nom)}</b><small>Message vocal</small></div>${src?`<div class="nv-slot" data-src="${src}"></div>`:''}${corps?FRGNote.repliHTML(corps,ouvert):'<p class="tel-fin"></p>'}</div>`;
  const ordre = (cle, n) => { let h = 2166136261; for (const c of String(cle)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); const a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 13), 1597334677) >>> 0; const k = h % (i + 1); [a[i], a[k]] = [a[k], a[i]]; } return a; };
  const melange = a => { const b=[...a]; for(let i=b.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } return b; };
  // secteur : fixé à l'inscription (plus tard par la plateforme) ; ?secteur=hotel pour l'aperçu
  let ACT='';
  try { const u=new URLSearchParams(location.search), P=JSON.parse(localStorage.getItem('frg-profil')||'{}');
    const q=u.get('secteur')||P.secteur; if (q&&D.secteurs[q]) E.sect=q;
    ACT=(u.get('activite')||P.activite||'').slice(0,80); if(P.ident) E.ident=P.ident; if(P.prenom&&!E.prenom) E.prenom=P.prenom; } catch(e){}
  if (!E.sect) E.sect='pro';
  const S = () => E.sect;
  { const t=document.getElementById('mod-titre'); if(t) t.textContent='Module 1 · Repères et codes · '+(ACT||D.secteurs[E.sect].nom); }
  // score : seul le premier essai de chaque question compte
  const PARC = window.FRGA ? FRGA.niveau() : 'std', FOND = PARC==='fond', APPR = PARC==='appr';   /* parcours adaptatif */
  const aRevoir=q=>{ if(!FOND) return; E.revoir=E.revoir||[]; if(!E.revoir.some(x=>x[0]===q[0])){ E.revoir.push(q); sauver(); } };
  if (window.FRGM) FRGM.init(1);
  const noter=(cle,ok)=>{ if (window.FRGM) FRGM.rep(cle,ok); E.notes=E.notes||{}; if(!(cle in E.notes)){ E.notes[cle]=ok?1:0; sauver(); } };
  const AV = '<span class="av" aria-hidden="true"><svg viewBox="0 0 34 34"><rect width="34" height="34" fill="#8E9AA6"/><ellipse cx="17" cy="21" rx="10" ry="7.5" fill="#A9B3BC"/><circle cx="12" cy="13" r="1.8" fill="#1B2430"/><circle cx="22" cy="13" r="1.8" fill="#1B2430"/><circle cx="14" cy="20" r=".9" fill="#5C6670"/><circle cx="20" cy="20" r=".9" fill="#5C6670"/><circle cx="17" cy="23" r=".9" fill="#5C6670"/></svg></span>';
  const OK = (t) => `<div class="retour-msg ok">${t}</div>`, KO = (t) => `<div class="retour-msg ko">${t}</div>`;

  /* ---------- synthèse vocale (en attendant les vraies voix) ---------- */
  const voix = () => (speechSynthesis.getVoices()||[]).filter(v=>/^en[-_]US/i.test(v.lang));
  function dire(texte, idx=0, fin){
    if (!('speechSynthesis' in window)) { fin&&fin(); return false; }
    const u = new SpeechSynthesisUtterance(texte.replace(/\{([^|}]+)\|[^}]+\}/g,'$1'));
    const vs = voix(); if (vs.length) u.voice = vs[idx % vs.length];
    u.lang='en-US'; u.rate=.92; u.pitch = idx%2 ? 1.08 : .95; u.onend = () => fin&&fin();
    speechSynthesis.speak(u); return true;
  }
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => {};

  /* ---------- étapes ---------- */
  const ETAPES = [
    { nom:'Bienvenue', f:secteur },
    { nom:'Temps 1 · Le jeu', f:jeu1 },
    { nom:'Temps 1 · Ce que vous connaissez', f:jeu2 },
    { nom:'Temps 2 · Le déclic', f:declic },
    { nom:'Temps 2 · Trois passés, un seul', f:bilingue },
    ...(APPR ? [{ nom:'Temps 2 · Nuances', f:nuances1 }] : []),
    { nom:'Temps 2 · Contrôle', f:controle },
    { nom:'Temps 3 · Vitre A', f:vitreA },
    { nom:'Temps 3 · Vitre B', f:vitreB },
    { nom:'Temps 3 · La Courbe à trous', f:trous },
    { nom:'Temps 4 · Comprendre', f:ecoute1 },
    { nom:'Temps 4 · Repérer', f:ecoute2 },
    { nom:'Temps 4 · Répéter', f:ecoute3 },
    { nom:'Temps 5 · Remettez dans l\'ordre', f:serie1 },
    { nom:'Temps 5 · Essorez les phrases', f:essorer },
    { nom:'Temps 5 · Réparez la phrase', f:serie3 },
    ...(APPR ? [{ nom:'Temps 5 · Défi expert', f:expert1 }] : []),
    { nom:'Temps 6 · Ma version', f:maVersion },
    { nom:'Temps 7 · À voix haute', f:conversation },
    { nom:'Temps 8 · Trois fois plus vite', f:fluidite },
    ...(FOND ? [{ nom:'Révision', f:revision1 }] : []),
    { nom:'Votre tableau', f:fin }
  ];
  const pct = () => E.fini ? 100 : Math.min(99, (E.max / (ETAPES.length-1)) * 100);
  let fait = false;
  const valider = (msg) => { fait = true; E.faits[E.step]=1; suiv.disabled=false; verrou.hidden=true; if (E.step+1>E.max){ E.max=E.step+1; } sauver(); maj(); };
  const TESTEUR = (()=>{try{return !!JSON.parse(localStorage.getItem('frg-cle-tableau')||'""')}catch(e){return false}})();
  function exiger(t){ fait = !!E.faits[E.step]; if (TESTEUR && !fait) { suiv.disabled = false; verrou.hidden = false; verrou.textContent = 'Mode test : « Suivant » est libre sur votre appareil.'; return; } suiv.disabled = !fait; verrou.hidden = fait; verrou.textContent = t || 'Terminez cet écran pour continuer.'; }
  function maj(){ const p=Math.round(pct()); $('#barre').style.width=p+'%'; $('#barre-box').setAttribute('aria-valuenow',p); $('#etape-pct').textContent=p+' %'; $('#etape-nom').textContent=ETAPES[E.step].nom; }
  function aller(n){
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    E.step = Math.max(0, Math.min(ETAPES.length-1, n)); sauver(); window.FRG_MOD = { m: 1, etape: E.step + 1, total: ETAPES.length }; if (window.FRGM) FRGM.etape(ETAPES[E.step].nom);
    ecran.innerHTML=''; fait=false; verrou.hidden=true; suiv.disabled=false;
    prec.disabled = E.step===0; suiv.textContent = E.step===ETAPES.length-1 ? 'Retour à l\'espace élève' : 'Suivant';
    ETAPES[E.step].f(ecran); maj(); ecran.focus({preventScroll:true}); window.scrollTo({top:0,behavior:'smooth'});
  }
  suiv.addEventListener('click',()=>{ if (E.step===ETAPES.length-1){ location.href='espace-eleve.html'; return; } aller(E.step+1); });
  prec.addEventListener('click',()=>aller(E.step-1));

  /* 0 · accueil : le secteur est défini à l'inscription (devis et échange avec le client) */
  function secteur(z){
    const s=D.secteurs[S()];
    if(!E.prenom){ try{ const el=JSON.parse(localStorage.getItem('frg-eleve')||'null'); const p=el&&String(el.prenom||'').replace(/\(.*?\)/g,'').trim().split(/\s+/)[0]; if(p){ E.prenom=p; sauver(); } }catch(e){} }
    z.append(el(`<p class="eyebrow">Module 1 · 1 / 24 · Repères et codes</p>
      <h1>Tout l'anglais tient sur une ligne.</h1>
      <figure class="ct-fig"><svg class="courbe-totale" viewBox="0 0 760 250" role="img" aria-label="La Courbe des Temps complète, simplifiée : T-2, T-1, T0, T+1, les codes -ed et -s, BE + -ING, HAVE et HAD + -EN, WILL">
<path class="arc" d="M122 92 Q206 62 288 92"/><path class="arc" d="M302 92 Q386 62 468 92"/>
<text class="t-arc" x="205" y="56" text-anchor="middle">HAD + -EN</text>
<text class="t-arc" x="385" y="56" text-anchor="middle">HAVE + -EN</text>
<text class="ct-rep loin" x="110" y="112" text-anchor="middle">T-2</text>
<text class="ct-rep" x="290" y="112" text-anchor="middle">T-1</text>
<text class="ct-rep" x="470" y="112" text-anchor="middle">T0</text>
<text class="ct-rep loin" x="650" y="112" text-anchor="middle">T+1</text>
<path class="ligne" d="M30 130 C150 124 230 136 330 129 S520 124 620 131 S700 129 722 130"/>
<path class="ligne" d="M706 116 L724 130 L706 144"/>
<path class="tic" d="M290 120 V140 M470 120 V140"/><path class="tic loin" d="M110 120 V140 M650 120 V140"/>
<g class="code-ed"><rect x="263" y="152" width="54" height="30" rx="9"/><text x="290" y="173" text-anchor="middle">-ed</text></g>
<g class="code-s"><rect x="447" y="152" width="46" height="30" rx="9"/><text x="470" y="173" text-anchor="middle">-s</text></g>
<path class="ing" d="M262 200 h-5 v20 h5 M257 210 H316 M309 204 L317 210 L309 216"/>
<path class="ing" d="M442 200 h-5 v20 h5 M437 210 H496 M489 204 L497 210 L489 216"/>
<text class="t-ing" x="290" y="242" text-anchor="middle">BE + -ING</text>
<text class="t-ing" x="470" y="242" text-anchor="middle">BE + -ING</text>
<text class="t-fut" x="650" y="172" text-anchor="middle">WILL</text>
</svg><figcaption>La Courbe des Temps : deux temps, T-1 et T0, et tout le reste posé autour.</figcaption></figure>
      <p>À la fin de ce module, vous savez que toute la langue tient sur une seule ligne, et vous lisez n'importe quelle phrase par sa structure, avant ses mots.</p>
      <div class="retour-msg info">${ACT?`Ce module est préparé pour votre activité : <b>${esc(ACT)}</b>. Tous les exemples viennent de votre quotidien.`:`Tous les exemples viennent de votre secteur : <b>${s.nom}</b>.`}</div>
      <label class="petit" for="prenom"><b>Votre prénom</b></label><input class="saisie" id="prenom" type="text" autocomplete="given-name" maxlength="40" value="${esc(E.prenom||'')}" placeholder="Prénom">
      ${window.FRGA ? FRGA.pastille() : ''}
      <p class="doux petit">Environ 50 minutes, en huit temps. Votre progression est gardée : vous pouvez vous arrêter et reprendre.</p>`));
    const pr=z.querySelector('#prenom'); const ok=()=>{ E.prenom=pr.value.trim(); sauver(); if(E.prenom) valider(); else exiger('Écrivez votre prénom pour commencer.'); };
    pr.addEventListener('input',ok); exiger('Écrivez votre prénom pour commencer.'); if(E.prenom) valider();
  }
  /* 1 · le jeu des mots connus */
  function jeu1(z){
    z.append(el(`<p class="eyebrow">Temps 1 · Un premier jeu</p>
      <h1>Écrivez tous les mots anglais que vous connaissez.</h1>
      <p>Sans réfléchir, sans dictionnaire : mots, expressions, références. Appuyez sur Entrée après chacun. Vous avez 2 minutes : si vous séchez avant, touchez « J'ai fini ».</p>
      <div class="chrono"><span class="compte" id="cpt">2:00</span><button class="btn plein" id="go" type="button">Lancer le chrono</button><button class="btn" id="stop1" type="button" hidden>J'ai fini</button></div>
      <input class="saisie" id="mot" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Un mot, puis Entrée" disabled>
      <div class="nuage" id="nuage"></div><div id="res"></div>`));
    const nuage=z.querySelector('#nuage'), inp=z.querySelector('#mot'), cpt=z.querySelector('#cpt');
    const ajoute = x => { if (typeof x==='string') x={brut:x,corr:x}; const s=document.createElement('span');
      if (x.corr!==x.brut){ s.className='corrige'; s.innerHTML=`<s>${esc(x.brut)}</s> ${esc(x.corr)}`; s.title='Orthographe corrigée'; } else s.textContent=x.corr;
      if (x.struct){ s.className='corrige'; s.innerHTML=`<s>${esc(x.brut)}</s> ${esc(x.struct)}`; s.title='Structure corrigée'; }
      nuage.append(s); };
    (E.nuage||[]).forEach(ajoute);
    inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); inp.value.split(/[,;\/]+/).map(m=>m.trim()).filter(Boolean).forEach(m=>{
      const o = window.Orthographe ? Orthographe.corriger(m) : {texte:m};
      const x={brut:m, corr:o.texte};
      if (o.texte.split(/\s+/).length>=3 && C){ const a=C.analyser(o.texte); if(a && a.type!=='ok') x.struct=a.bon.replace(/[.]$/,''); }   // une phrase : on vérifie aussi sujet, verbe, complément
      E.nuage.push(x); ajoute(x); }); inp.value=''; sauver(); } });
    const stop1=z.querySelector('#stop1');
    z.querySelector('#go').addEventListener('click',e=>{ e.target.disabled=true; e.target.hidden=true; stop1.hidden=false; inp.disabled=false; inp.focus(); E.nuage=[]; nuage.innerHTML=''; let t=120;
      stop1.onclick=()=>{ if(!E.nuage.length){ z.querySelector('#res').innerHTML=KO('Écrivez au moins un mot avant de finir. Même <em>hello</em> compte.'); inp.focus(); return; } t=1; };
      const it=setInterval(()=>{ t--; cpt.textContent=Math.floor(t/60)+':'+String(t%60).padStart(2,'0'); if(t<=0&&!E.nuage.length){ t=30; z.querySelector('#res').innerHTML=KO('Le temps est passé, mais il faut au moins un mot. Je vous laisse 30 secondes de plus : même <em>hello</em> compte.'); inp.focus(); return; }
        if(t<=0){ clearInterval(it); inp.disabled=true; stop1.hidden=true; z.querySelector('#res').innerHTML=''; const n=E.nuage.length;
        const nc=E.nuage.filter(x=>x.corr!==x.brut||x.struct).length;
        z.querySelector('#res').innerHTML = OK(`${n} mot${n>1?'s':''}. ${n>=10?'Pas mal du tout.':'C\'est déjà une base.'}${nc?` J'ai corrigé l'orthographe de ${nc} entrée${nc>1?'s':''} : regardez la bonne forme, à côté.`:''} On garde votre nuage : il reviendra au module 12.`); valider(); } },1000); });
    exiger('Lancez le chrono et écrivez vos mots.'); if (E.faits[E.step]) valider();
  }

  /* 2 · tick + bascule */
  function jeu2(z){
    const mots=D.mots[S()];
    z.append(el(`<p class="eyebrow">Temps 1 · Ceux que vous connaissez</p>
      <h1>Et ceux-là ?</h1>
      <div class="choix">${mots.map(m=>`<button class="puce" type="button" aria-pressed="false">${m}</button>`).join('')}</div>
      <div id="bascule"></div>`));
    z.querySelectorAll('.puce').forEach(b=>b.addEventListener('click',()=>b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true')));
    const bas = z.querySelector('#bascule');
    const btn = el(`<button class="btn plein" type="button">J'ai coché</button>`).firstChild; bas.append(btn);
    btn.addEventListener('click',()=>{ const n=z.querySelectorAll('.puce[aria-pressed="true"]').length;
      bas.innerHTML = `<div class="retour-msg info"><p><b>${n} sur ${mots.length}. Très bien.</b></p><p>Maintenant, la vraie question : à quoi servent tous ces mots si on ne sait pas les relier entre eux ? Un mot qu'on ne sait pas utiliser ne vaut rien. Ce module vous montre comment les relier.</p></div>`; valider(); });
    exiger('Cochez vos mots, puis validez.'); if (E.faits[E.step]) valider();
  }

  /* 3 · le déclic : 11 cartes, une idée par carte */
  function cartes(){
    const a=D.phrasesA[S()][0], pres={pro:['needs','needed'],hotel:['wants','wanted'],luxe:['loves','loved'],tour:['visits','visited'],immo:['likes','liked']}[S()];
    return [
      ['Une phrase, trois blocs.', 'Une phrase anglaise répond toujours à trois questions, dans cet ordre : <b>qui ?</b> <b>fait quoi ?</b> <b>à quoi, à qui ?</b> C\'est le sujet, le verbe, le complément.', `<em>${a[0]} / ${a[1]} / ${a[2]}.</em><small>${a[3]} / ${a[4]} / ${a[5]}.</small>`],
      ['Vous le savez déjà.', 'C\'est le même ordre qu\'en français. Une grande partie de l\'anglais se comprend donc par logique, avant même de connaître tous les mots. Si vous reconnaissez le verbe, vous savez où est le sujet : juste avant.', ''],
      ['Le verbe porte le temps.', 'Dans les trois blocs, un seul dit <b>quand</b> : le verbe. C\'est lui qu\'on regarde pour savoir si l\'on parle du présent ou du passé.', `<em>${a[0]} ${pres[0]}…</em> (maintenant)<br><em>${a[0]} ${pres[1]}…</em> (avant)`],
      ['Deux temps, pas un de plus.', 'L\'anglais n\'a que deux temps : <b>T0</b>, le présent, et <b>T-1</b>, le passé (le prétérit). Tout ce que vous allez apprendre ensuite se place autour de ces deux points.', ''],
      ['Le code de T0 : <span class="code s">-s</span>', 'À T0, on prend la base du verbe (<em>work, want, love</em>). Avec <em>he, she, it</em>, ou un nom au singulier (<em>the guest, my boss</em>), on ajoute -s. Avec <em>I, you, we, they</em>, le code est là, mais il ne se voit pas. On écrit quand même (-s) entre parenthèses, pour dire « T0 ».', '<em>She works.</em> (-s)<br><em>They work.</em> (-s), code invisible'],
      ['Le code de T-1 : <span class="code ed">-ed</span>', 'À T-1, on ajoute -ed à la base, avec tous les sujets, sans exception. Si le verbe finit déjà par -e, on ajoute seulement -d.', '<em>I worked, she worked, they worked.</em><br><em>live → lived</em>'],
      ['Le code invisible.', 'Certains verbes cachent leur -ed : ce sont les irréguliers. Le code est là, simplement invisible. On ne les récite pas : on les rencontre, on les reconnaît, et ils restent.', '<em>went</em> = <em>go</em> + -ed · <em>bought</em> = <em>buy</em> + -ed · <em>ate</em> = <em>eat</em> + -ed'],
      ['Même BE suit la règle.', 'Le verbe le plus irrégulier de la langue garde ses codes.', '<em>am, is, are</em> = <em>be</em> + -s : T0<br><em>was, were</em> = <em>be</em> + -ed : T-1'],
      ['Soyez cohérent.', 'Si vous commencez au présent, continuez au présent. Si vous commencez au passé, restez au passé. C\'est la règle qui compte le plus pour être compris. En anglais : <b>be logical</b>, soyez logique. Vous reverrez cette formule à chaque module.', '<em>Yesterday, I helped a family and they thanked me.</em>'],
      ['Tout tient sur la ligne.', 'Sur la Courbe complète, vous voyez aussi T-2, T+1 et deux « aspects » : BE + -ING et HAVE + -EN. Ce ne sont pas de nouveaux temps : ils se posent sur T0 ou sur T-1. On les étudie dans les modules 4 à 7. Pour l\'instant, retenez qu\'ils existent et qu\'ils tiennent sur la même ligne.', ''],
      ['Ce que vous savez maintenant.', 'Dites ces trois phrases à voix haute.', '1. Une phrase, c\'est qui, fait quoi, à quoi.<br>2. Il n\'y a que deux temps : T0 et T-1.<br>3. -s, c\'est le code du présent ; -ed, celui du passé, même quand il est invisible.']
    ];
  }
  function declic(z){
    const K=cartes(); let i=0;
    z.append(el(`<p class="eyebrow">Temps 2 · Le déclic</p>
      <div class="carte-lecon" id="carte"></div>
      <div class="cartes-nav"><button class="btn" id="cp" type="button">‹</button><div class="points" id="pts"></div><button class="btn plein" id="cn" type="button">Carte suivante</button></div>`));
    const c=z.querySelector('#carte'), pts=z.querySelector('#pts');
    pts.innerHTML=K.map(()=>'<i></i>').join('');
    const montre=()=>{ const [t,r,x]=K[i]; c.innerHTML=`<span class="num">CARTE ${i+1} / ${K.length}</span><h2>${t}</h2><p>${r}</p>${x?`<div class="ex">${x}</div>`:''}`;
      pts.querySelectorAll('i').forEach((p,j)=>p.classList.toggle('on',j<=i)); z.querySelector('#cp').disabled=i===0;
      z.querySelector('#cn').textContent = i===K.length-1 ? 'J\'ai tout lu' : 'Carte suivante';
      if (i===K.length-1) valider(); };
    z.querySelector('#cp').addEventListener('click',()=>{ if(i>0){i--;montre();} });
    z.querySelector('#cn').addEventListener('click',()=>{ if(i<K.length-1){i++;montre();} else suiv.click(); });
    exiger('Lisez les onze cartes pour continuer.'); montre(); if (E.faits[E.step]) valider();
  }

  /* 4 · trois questions de contrôle */
  function controle(z){
    const Q=[
      ['<em>They work in Nice.</em> Quel temps, quel code ?', ['T0 (-s), code invisible avec they','T-1 (-ed)','Aucun code'], 0, 'Carte 5 : avec <em>I, you, we, they</em>, le code -s est là, mais il ne se voit pas.'],
      ['<em>She bought a gift.</em> Quel temps ?', ['T0 (-s)','T-1 (-ed), code invisible','On ne peut pas savoir'], 1, 'Carte 7 : <em>bought</em> = <em>buy</em> + -ed. Le code est invisible, mais il est là.'],
      ['<em>I visit the museum and I loved it.</em> Qu\'est-ce qui ne va pas ?', ['Il manque un -s','L\'ordre des mots','La cohérence : deux temps différents'], 2, 'Carte 9 : vous commencez au présent, vous continuez au présent. Soyez logique.']];
    z.append(el(`<p class="eyebrow">Temps 2 · Contrôle</p><h1>Trois questions, pour que rien ne reste flou.</h1><div id="qs"></div>`));
    const qs=z.querySelector('#qs'); let bons=0;
    const AIDES=['Avec they, le code -s existe-t-il ? Se voit-il ?','Bought vient d\'un verbe très courant : buy.','Regardez les deux verbes : sont-ils dans le même temps ?'];
    serieQ(qs,'ctrl',Q.map((q,i)=>[...q,AIDES[i]]),'Répondez juste aux trois questions.');
  }

  /* QCM adaptatif : indice (Fondations), explication même si juste (Fondations), moins d'aide (Approfondi), ratés mémorisés pour la révision */
  function serieQ(box,cle,Q,msg){ let bons=0;
    Q.forEach(([q,ch,b,ex,aide],n)=>{ const d=el(`<div class="exo"><p class="phrase">${q}</p><div class="choix">${ordre(q,ch.length).map(j=>`<button class="puce" type="button" data-j="${j}">${ch[j]}</button>`).join('')}</div>${FOND&&aide?'<button class="indice-btn" type="button">Un indice</button>':''}<div class="r"></div></div>`).firstChild; box.append(d);
      const ib=d.querySelector('.indice-btn'); if(ib) ib.addEventListener('click',()=>{ if (window.FRGM) FRGM.indice(); ib.outerHTML=`<p class="indice">💡 ${aide}</p>`; });
      d.querySelectorAll('.puce').forEach(p=>p.addEventListener('click',()=>{ if(d.dataset.fini) return; const j=+p.dataset.j; if (window.FRGM) FRGM.lib(cle+n, q); noter(cle+n, j===b);
        if (j===b){ p.classList.add('ok'); d.dataset.fini=1; d.querySelector('.r').innerHTML=OK('Exact.'+(FOND&&ex?' '+ex:'')); if(++bons===Q.length) valider(); }
        else { p.classList.add('ko'); d.querySelector('.r').innerHTML=KO(APPR&&!/^(exp|rev)/.test(cle)?'Pas tout à fait. Réessayez.':ex); if(!/^rev/.test(cle)) aRevoir([q,ch,b,ex,aide]); } })); });
    exiger(msg); if (E.faits[E.step]) valider(); }

  /* parcours Approfondi · nuances du module 1 */
  function nuances1(z){
    const K=[
      ['Will n\'est pas un temps', 'Will est un modal, comme can ou must : il ne porte aucun code. C\'est pour ça que la Courbe n\'a que deux temps. T+1 se construit avec will, be going to, ou même T0.', '<em>I <b>will</b> call you. · I\'m <b>going to</b> call you. · The meeting <b>starts</b> at 9.</em>'],
      ['Le passé composé n\'a pas d\'équivalent unique', '« J\'ai travaillé » se traduit worked (T-1) ou have worked (HAVE + -EN) selon que le moment est fini ou non. Le français mélange, l\'anglais tranche.', '<em>I worked there in 2019. · I have worked here since 2019.</em>'],
      ['Le code invisible se voit à la négation', 'Pour vérifier qu\'un verbe irrégulier est bien à T-1, mettez-le à la négation : did apparaît. Went devient didn\'t go.', '<em>She <b>went</b> home. → She <b>didn\'t go</b> home.</em>'],
      ['L\'ordre bouge, la logique non', 'On peut déplacer un repère de temps (yesterday, at 8) en tête ou en fin de phrase. Le bloc qui / fait quoi / à quoi, lui, ne se coupe jamais.', '<em><b>Yesterday</b>, I called the client. · I called the client <b>yesterday</b>.</em>']];
    let i=0;
    z.append(el(`<p class="eyebrow">Temps 2 · Nuances · parcours Approfondi</p><h1>Vous avez la règle. Voici le détail.</h1><div class="carte-lecon speciale" id="carte"></div>
      <div class="cartes-nav"><button class="btn" id="cp" type="button" aria-label="Carte précédente">‹</button><button class="btn plein" id="cn" type="button">Nuance suivante</button></div>`));
    const c=z.querySelector('#carte');
    const montre=()=>{ const [t,r,x]=K[i]; c.innerHTML=`<span class="num"><b class="etq-carte">Nuance</b> · ${i+1} / ${K.length}</span><h2>${t}</h2><p>${r}</p><div class="ex">${x}</div>`; z.querySelector('#cp').disabled=i===0; z.querySelector('#cn').textContent=i===K.length-1?'J\'ai tout lu':'Nuance suivante'; if(i===K.length-1) valider(); };
    z.querySelector('#cp').addEventListener('click',()=>{ if(i>0){ i--; montre(); } });
    z.querySelector('#cn').addEventListener('click',()=>{ if(i<K.length-1){ i++; montre(); } });
    exiger('Lisez les nuances jusqu\'au bout.'); montre(); if (E.faits[E.step]) valider();
  }
  /* parcours Approfondi · défi expert (hors score de validation) */
  function expert1(z){
    z.append(el(`<p class="eyebrow">Temps 5 · Défi expert · parcours Approfondi</p><h1>Même logique, terrain plus glissant.</h1><p>Des phrases plus longues, des codes cachés. L'explication arrive seulement quand c'est juste.</p><div id="qs"></div>`));
    serieQ(z.querySelector('#qs'),'exp',[
      ['<em>My manager ___ the report yesterday and ___ it to the client this morning.</em>', ['checked / sent','checks / sent','checked / send'], 0, 'Deux actions finies, deux codes -ed : checked (visible), sent (send + -ed, invisible).'],
      ['<em>Every morning, the team ___ coffee before the meeting ___.</em>', ['has / starts','have / start','has / start'], 0, 'The team et the meeting = it : deux codes -s. Has = have + -s.'],
      ['Quelle phrase est logique ?', ['When I arrived, she leaves.','When I arrive, she left.','When I arrived, she left.'], 2, 'Be logical : les deux actions sont à T-1.'],
      ['<em>Our clients usually ___ by email, but yesterday one of them ___.</em>', ['write / called','writes / calls','write / calls'], 0, 'Usually = habitude, T0 (they : -s invisible). Yesterday = T-1 : called.'],
      ['Où est le code dans <em>She didn\'t like it</em> ?', ['Sur like','Sur did (do + -ed)','Il n\'y en a pas'], 1, 'Did porte le -ed, like reste nu. Un seul code par verbe.']
    ],'Trouvez la bonne réponse à chaque question.');
  }
  /* parcours Fondations · révision : ratés du module + un tour d'entraînement (hors score de validation) */
  function revision1(z){
    const R=(E.revoir||[]).slice(-5), BASE=[
      ['<em>He ___ in a hotel.</em>', ['work','works','worked yesterday'], 1, 'He = une seule personne, T0 : code -s.', 'He, she, it : quel code à T0 ?'],
      ['<em>Last week, we ___ a new client.</em>', ['meet','meets','met'], 2, 'Last week = T-1 : met = meet + -ed (invisible).', 'Last week : quel temps ?'],
      ['Remettez dans l\'ordre : <em>coffee / I / drink</em>', ['I drink coffee','Coffee I drink','Drink I coffee'], 0, 'Qui (I) / fait quoi (drink) / à quoi (coffee).', 'Commencez par qui fait l\'action.'],
      ['<em>They ___ English at work.</em>', ['speak','speaks','speaked'], 0, 'They : le code -s est invisible.', 'Avec they, le -s se voit-il ?']];
    const Q=[...R, ...BASE.filter(b=>!R.some(r=>r[0]===b[0]))].slice(0,8);
    z.append(el(`<p class="eyebrow">Révision · parcours Fondations</p><h1>Un dernier tour, pour que ça devienne un réflexe.</h1><p>${R.length?`Les ${R.length} question${R.length>1?'s':''} qui vous ont résisté, puis l'essentiel du module.`:'Vous n\'avez rien raté : voici l\'essentiel du module, une dernière fois.'} Répéter, c'est ce qui transforme une règle en réflexe.</p><div id="qs"></div>`));
    serieQ(z.querySelector('#qs'),'rev',Q,'Répondez juste à chaque question.');
  }

  /* 5 · vitre A : remettre les blocs dans l'ordre */
  function ordonner(cont, blocs, surFini){
    cont.innerHTML=`<div class="zone blocs" aria-label="Votre phrase"></div><div class="blocs reserve"></div>`;
    const zone=cont.querySelector('.zone'), res=cont.querySelector('.reserve'); let pose=[];
    melange(blocs.map((b,i)=>({b,i}))).forEach(({b,i})=>{ const x=document.createElement('button'); x.type='button'; x.className='bloc'; x.textContent=b; x.dataset.i=i; res.append(x); });
    cont.addEventListener('click',e=>{ const x=e.target.closest('.bloc'); if(!x||cont.dataset.fini) return;
      if (x.parentElement===res){ zone.append(x); pose.push(+x.dataset.i); } else { res.append(x); pose=pose.filter(v=>v!==+x.dataset.i); }
      if (pose.length===blocs.length){ if (pose.every((v,k)=>v===k)){ cont.dataset.fini=1; zone.querySelectorAll('.bloc').forEach((b,k)=>b.classList.add('r'+k)); surFini(true); }
        else surFini(false); } });
  }
  function vitreA(z){
    const P=D.phrasesA[S()]; let n=0;
    z.append(el(`<p class="eyebrow">Temps 3 · Vitre A</p><h1>Qui, fait quoi, à quoi.</h1><p>Touchez les blocs dans le bon ordre pour construire la phrase. Touchez un bloc posé pour le retirer.</p><div id="v"></div><div id="r"></div>`));
    const v=z.querySelector('#v'), r=z.querySelector('#r');
    const suivante=()=>{ const p=P[n]; r.innerHTML=''; const box=document.createElement('div'); box.className='exo'; box.innerHTML=`<span class="compteur">Phrase ${n+1} / ${P.length}</span><div class="o"></div>`; v.innerHTML=''; v.append(box);
      ordonner(box.querySelector('.o'), p.slice(0,3), ok=>{ noter('vitreA'+n, ok); if(!ok){ r.innerHTML=KO('Pas tout à fait. Qui fait l\'action ? Commencez par lui.'); return; }
        r.innerHTML=`<div class="retour-msg ok"><p>Bravo. En français, dans le même ordre :</p><div class="trad"><span>${p[3]}</span><span>${p[4]}</span><span>${p[5]}</span></div><p>Vous voyez ? Le même ordre. Vous le saviez déjà.</p></div>`;
        if (n<P.length-1){ const b=el(`<button class="btn plein" type="button">Phrase suivante</button>`).firstChild; r.append(b); b.addEventListener('click',()=>{ n++; suivante(); }); } else valider(); }); };
    exiger('Construisez les trois phrases.'); suivante(); if (E.faits[E.step]) valider();
  }

  /* 6 · vitre B : la Courbe complète */
  function vitreB(z){
    const P=D.phrasesA[S()], V=D.verbesA[S()]; const vus=new Set();
    z.append(el(`<p class="eyebrow">Temps 3 · Vitre B</p><h1>Tout tient sur une ligne.</h1>
      <p>Voici toute la Courbe. Pour l'instant, seuls <b>T-1</b> et <b>T0</b> comptent : ils sont grisés tant que vous ne les avez pas touchés. Touchez-les. Le reste, touchez-le par curiosité.</p>
      <div class="courbe"><svg viewBox="0 0 720 190" role="img" aria-label="La Courbe des Temps : T-2, T-1, T0, T+1">
        <path class="arc" d="M120 70 Q 210 20 300 70" stroke="#B8891F"/><text class="lab" x="210" y="34" text-anchor="middle" fill="#B8891F" style="fill:#B8891F">HAVE + -EN</text>
        <path class="arc" d="M480 112 h 80" stroke="#2F8A64"/><text class="lab" x="520" y="135" text-anchor="middle" style="fill:#2F8A64">BE + -ING</text>
        <path class="ligne" d="M30 92 C 200 86, 400 98, 680 90"/><path class="ligne" d="M664 80 L682 90 L664 100"/>
        <g class="pt loin" data-p="t-2" tabindex="0" role="button" aria-label="T-2"><rect x="86" y="44" width="68" height="70" fill="transparent"/><circle cx="120" cy="91" r="9"/><text x="120" y="66" text-anchor="middle">T-2</text></g>
        <g class="pt ed" data-p="t-1" tabindex="0" role="button" aria-label="T-1, le passé"><rect x="266" y="44" width="68" height="70" fill="transparent"/><circle cx="300" cy="92" r="11"/><text x="300" y="66" text-anchor="middle">T-1</text></g>
        <g class="pt" data-p="t0" tabindex="0" role="button" aria-label="T0, le présent"><rect x="446" y="44" width="68" height="70" fill="transparent"/><circle cx="480" cy="92" r="11"/><text x="480" y="66" text-anchor="middle">T0</text></g>
        <g class="pt loin" data-p="t+1" tabindex="0" role="button" aria-label="T+1"><rect x="586" y="44" width="68" height="70" fill="transparent"/><circle cx="620" cy="90" r="9"/><text x="620" y="66" text-anchor="middle">T+1</text></g>
      </svg></div>
      <div class="posee" id="posee" aria-live="polite"></div><div id="r"></div>`));
    const posee=z.querySelector('#posee'), r=z.querySelector('#r');
    const phrase = (p,v,code) => { const inv = v[2]; const etq = `<span class="etq ${code}${inv?' inv':''}">-${code}</span>`;
      return `<span>${p[0]}</span> <span class="mc">${p[1]}${etq}</span> <span>${p[2]}.</span>`; };
    z.querySelectorAll('.pt').forEach(g=>{ const go=()=>{ z.querySelectorAll('.pt').forEach(x=>x.classList.remove('actif')); g.classList.add('actif','touche'); const k=g.dataset.p;
      if (k==='t0'){ posee.innerHTML=phrase(P[0],V[0],'s'); r.innerHTML=OK('T0, le présent : le code <b>-s</b> s\'allume sur le verbe.'); vus.add(k); }
      else if (k==='t-1'){ const inv=V[2][2]; posee.innerHTML=phrase(P[2],V[2],'ed'); r.innerHTML=OK(inv?`T-1, le passé : <em>${P[2][1]}</em> = <em>${V[2][0]}</em> + -ed. Le code est invisible, mais il est là (en pointillé).`:'T-1, le passé : le code <b>-ed</b> s\'allume sur le verbe.'); vus.add(k); }
      else { posee.innerHTML=''; r.innerHTML=`<div class="bulle-lam">${AV}<div class="txt">Patience, on zoome là-dessus later. Retenez juste que ça existe, et que ça tient sur la même ligne.</div></div>`; }
      if (vus.size===2){ r.insertAdjacentHTML('beforeend','<div class="retour-msg info"><b>Voici la base de tout.</b> La fondation de n\'importe quel <em>skyscraper</em> (gratte-ciel).</div>'); valider(); } };
      g.addEventListener('click',go); g.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } }); });
    exiger('Touchez T0 et T-1.'); if (E.faits[E.step]) valider();
  }

  /* 7-9 · écoute */
  const lignes = () => D.ecoute[S()].lignes;
  const nu = t => t.replace(/\{([^|}]+)\|[^}]+\}/g,'$1');
  function lireTout(btn, fin){ const L=lignes(); let k=0; btn.disabled=true;
    const enr=new Audio('audio/m01-ecoute-'+S()+'.mp3'); enr.onended=()=>{ btn.disabled=false; fin&&fin(); };
    enr.onerror=()=>{ const vn=document.getElementById('voixnote'); if(vn) vn.textContent='Voix de synthèse, en attendant l\'enregistrement.'; un(); }; enr.play().catch(()=>{}); return;
    function un(){ if(k>=L.length){ btn.disabled=false; fin&&fin(); return; } const ok=dire(L[k][1], k%2, ()=>{ k++; setTimeout(un,250); }); if(!ok){ btn.disabled=false; fin&&fin(false); } } }
  function _ancien(btn, fin){ const L=lignes(); let k=0;
    const un=()=>{ if(k>=L.length){ btn.disabled=false; fin&&fin(); return; } const ok=dire(L[k][1], k%2, ()=>{ k++; setTimeout(un,250); }); if(!ok){ btn.disabled=false; fin&&fin(false); } }; un(); }
  const secoursM1=(slot,fin)=>{ const L=lignes(); let k=0; const un=()=>{ if(k>=L.length) return fin(true); const ok=dire(L[k][1], k%2, ()=>{ k++; setTimeout(un,250); }); if(ok===false) fin(false); }; un(); };
  function ecoute1(z){
    const Ec=D.ecoute[S()]; let bons=0;
    z.append(el(`<p class="eyebrow">Temps 4 · L'écoute · 1 / 3</p><h1>Écoutez, sans le texte.</h1>
      <p>Un message vocal d'une minute, un peu au-dessus de votre niveau. C'est voulu : vous comprenez grâce au contexte. Écoutez autant de fois que vous voulez, puis répondez.</p>
      ${telVocal(lignes()[0][0],`<div class="trans">${lignes().map(([,t])=>`<p class="t-l">${esc(nu(t)).replace(/&#39;/g,"'")}</p>`).join('')}</div>`,'audio/m01-ecoute-'+S()+'.mp3')}
      <p class="doux petit">Perdu ? La transcription est là, sous le message. Essayez d'abord sans.</p>
      <div id="qs"></div>`));
    FRGNote.monter(z, secoursM1);
    const qs=z.querySelector('#qs');
    Ec.q.forEach(([q,ch,b],qi)=>{ const d=el(`<div class="exo"><p class="phrase">${q}</p><div class="choix">${ordre(q,ch.length).map(j=>`<button class="puce" type="button" data-j="${j}">${ch[j]}</button>`).join('')}</div></div>`).firstChild; qs.append(d);
      d.querySelectorAll('.puce').forEach(p=>p.addEventListener('click',()=>{ if(d.dataset.fini) return; noter('ecoute'+qi, +p.dataset.j===b); if(+p.dataset.j===b){ p.classList.add('ok'); d.dataset.fini=1; if(++bons===Ec.q.length) valider(); } else p.classList.add('ko'); })); });
    exiger('Répondez aux deux questions.'); if (E.faits[E.step]) valider();
  }
  function ecoute2(z){
    const L=lignes(); let total=0, vus=0;
    const tx = t => t.replace(/\{([^|}]+)\|([^|}]+)(\|inv)?\}/g,(m,mot,c,inv)=>{ total++; return `<span class="mc v" data-c="${c}" data-inv="${inv?1:''}" role="button" tabindex="0">${mot}</span>`; });
    z.append(el(`<p class="eyebrow">Temps 4 · L'écoute · 2 / 3</p><h1>Repérez les codes.</h1>
      <p>Ouvrez la <b>transcription</b>. <b class="consigne-forte">Touchez chaque verbe conjugué</b> (souligné en pointillé) : il s'allume et son code apparaît au-dessus.</p>
      ${telVocal(L[0][0],`<div class="trans">${L.map(([q,t])=>`<p class="t-l">${tx(esc(t).replace(/&#39;/g,"'"))}</p>`).join('')}</div>`,'audio/m01-ecoute-'+S()+'.mp3')}
      <p class="compteur" id="cpt"></p>`));
    FRGNote.monter(z, secoursM1);
    const cpt=z.querySelector('#cpt'); const majc=()=>cpt.textContent=`${vus} / ${total} codes trouvés`; majc();
    z.querySelectorAll('.v').forEach(v=>{ const go=()=>{ if(v.classList.contains('vu')) return; v.classList.add('vu'); const c=v.dataset.c, inv=v.dataset.inv;
      v.insertAdjacentHTML('beforeend',`<span class="etq ${c}${inv?' inv':''}">-${c}</span>`); vus++; majc(); if(vus===total) valider(); };
      v.addEventListener('click',go); v.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } }); });
    z.append(el(`<p class="doux petit">En pointillé : le code invisible, là où il ne se voit pas. <em>I work</em> = work + -s invisible, <em>went</em> = <em>go</em> + -ed.</p>`));
    exiger('Touchez tous les verbes conjugués.'); if (E.faits[E.step]) valider();
  }
  /* micro local : on s'enregistre, on se réécoute ; rien ne quitte l'appareil */
  let fluxMicro=null;
  function micro(box, maxS, surFin){
    const b=el(`<button class="btn micro" type="button"><span aria-hidden="true">🎙</span> À vous</button>`).firstChild; box.append(b); let rec=null, it=null;
    b.addEventListener('click',async()=>{
      if(rec&&rec.state==='recording'){ rec.stop(); return; }
      try{ if(!fluxMicro) fluxMicro=await navigator.mediaDevices.getUserMedia({audio:true}); }catch(e){ b.outerHTML='<span class="doux petit">Micro non autorisé : répétez à voix haute.</span>'; surFin&&surFin(null); return; }
      const morceaux=[]; rec=new MediaRecorder(fluxMicro); rec.ondataavailable=e=>morceaux.push(e.data);
      rec.onstop=()=>{ clearTimeout(it); b.classList.remove('rec'); b.innerHTML='<span aria-hidden="true">🎙</span> Recommencer'; const bl=new Blob(morceaux,{type:rec.mimeType});
        let a=box.querySelector('audio'); if(!a){ a=document.createElement('audio'); a.controls=true; box.append(a); } a.src=URL.createObjectURL(bl); surFin&&surFin(bl); };
      rec.start(); b.classList.add('rec'); b.innerHTML='<span aria-hidden="true">■</span> Stop'; it=setTimeout(()=>{ if(rec.state==='recording') rec.stop(); },(maxS||12)*1000); });
  }
  function ecoute3(z){
    const L=lignes(); const faits=new Set();
    z.append(el(`<p class="eyebrow">Temps 4 · L'écoute · 3 / 3</p><h1>Répétez, phrase par phrase.</h1>
      <p>Écoutez une phrase, puis touchez <b>À vous</b> et répétez-la en imitant le rythme. Réécoutez-vous, recommencez si besoin. Exagérez : comme au théâtre.</p>
      <p class="doux petit">Vos enregistrements restent sur votre appareil. Personne d'autre ne les entend.</p>
      ${telVocal(L[0][0],`<div class="dialogue">${L.map(([q,t],k)=>`<div class="replique rep3" data-k="${k}"><div class="nv-slot petit" data-src="audio/m01-${S()}-l${k+1}.mp3" data-k="${k}"></div><span class="tx">${esc(nu(t)).replace(/&#39;/g,"'")}</span><div class="mic-zone"></div></div>`).join('')}</div>`,'',true)}
      <button class="btn" id="fini" type="button">J'ai répété les ${L.length} phrases</button>`));
    FRGNote.monter(z, (slot, fin)=>{ const k=+slot.dataset.k; faits.add(k); const ok=dire(L[k][1], k%2, ()=>fin(true)); if(ok===false) fin(false); });
    if (window.MediaRecorder && navigator.mediaDevices) z.querySelectorAll('.rep3').forEach(r=>micro(r.querySelector('.mic-zone'), 12));
    z.querySelector('#fini').addEventListener('click',()=>{ valider(); suiv.click(); });
    exiger('Répétez les phrases, puis confirmez.'); if (E.faits[E.step]) valider();
  }

  /* 10-12 · le code */
  function serie1(z){
    const P=D.ordre[S()]; let n=0;
    z.append(el(`<p class="eyebrow">Temps 5 · Le code · série 1</p><h1>Remettez dans l'ordre.</h1><p>Comme la vitre A, mais sans les couleurs.</p><div id="v"></div><div id="r"></div>`));
    const v=z.querySelector('#v'), r=z.querySelector('#r');
    const go=()=>{ v.innerHTML=`<div class="exo"><span class="compteur">Phrase ${n+1} / ${P.length}</span><div class="o"></div></div>`; r.innerHTML='';
      ordonner(v.querySelector('.o'), P[n], ok=>{ noter('ordre'+n, ok); if(!ok){ r.innerHTML=KO('Qui fait l\'action ? Le qui vient d\'abord, puis le verbe.'); return; }
        r.innerHTML=OK('Juste.'); if(n<P.length-1){ setTimeout(()=>{ n++; go(); },700); } else { r.innerHTML=OK('Les cinq phrases sont justes.'); valider(); } }); };
    exiger('Remettez les cinq phrases dans l\'ordre.'); go(); if (E.faits[E.step]) valider();
  }
  function serie2(z){
    const P=melange(D.courbe[S()]); let n=0, fautes=0;
    z.append(el(`<p class="eyebrow">Temps 5 · Le code · série 2</p><h1>T0 ou T-1 ?</h1><p>Placez chaque phrase sur la Courbe. Regardez le verbe : c'est lui qui porte le temps.</p><div class="exo"><span class="compteur" id="c"></span><p class="phrase" id="ph"></p><div class="choix"><button class="puce" type="button" data-t="1">T-1 <span class="code ed">-ed</span></button><button class="puce" type="button" data-t="0">T0 <span class="code s">-s</span></button></div><div id="r"></div></div>`));
    const ph=z.querySelector('#ph'), r=z.querySelector('#r'), c=z.querySelector('#c');
    const go=()=>{ c.textContent=`Phrase ${n+1} / ${P.length}`; ph.textContent=P[n][0]; r.innerHTML=''; z.querySelectorAll('[data-t]').forEach(b=>b.className='puce'); };
    z.querySelectorAll('[data-t]').forEach(b=>b.addEventListener('click',()=>{ if(n>=P.length) return; const [p,t,inv]=P[n];
      if (+b.dataset.t===t){ b.classList.add('ok'); r.innerHTML=OK(t ? (inv?'T-1 (-ed), code invisible : un irrégulier.':'T-1 (-ed).') : (/^(I|You|We|They)\b/.test(p)?'T0 (-s), code invisible.':'T0 (-s).'));
        setTimeout(()=>{ n++; if(n<P.length) go(); else { r.innerHTML=OK(`Fini${fautes?`, avec ${fautes} hésitation${fautes>1?'s':''}`:', sans faute'}.`); valider(); } },800); }
      else { fautes++; b.classList.add('ko'); r.innerHTML=KO(t ? (inv?'Regardez bien le verbe : c\'est un irrégulier, son -ed est invisible.':'Il y a un -ed sur le verbe : c\'est le passé.') : 'Le verbe est à la base ou avec un -s : c\'est le présent.'); } }));
    exiger('Placez les huit phrases.'); go(); if (E.faits[E.step]) valider();
  }
  function serie3(z){
    const P=D.erreurs; let n=0;
    z.append(el(`<p class="eyebrow">Temps 5 · Le code · série 3</p><h1>Réparez la phrase.</h1><p>La phrase barrée contient une erreur que font vraiment les élèves. Touchez la version <b>corrigée</b>.</p><div class="exo"><span class="compteur" id="c"></span><p class="phrase" id="ph"></p><div class="choix" id="ch"></div><div id="r"></div></div>`));
    const go=()=>{ const [p,ch]=P[n]; z.querySelector('#c').textContent=`Phrase ${n+1} / ${P.length}`; z.querySelector('#ph').innerHTML=`<s>${esc(p)}</s>`; z.querySelector('#r').innerHTML='';
      const box=z.querySelector('#ch'); box.innerHTML=ordre(ch.join('|'),ch.length).map(j=>`<button class="puce" type="button" data-j="${j}">${esc(ch[j])}</button>`).join('');
      box.querySelectorAll('.puce').forEach(b=>b.addEventListener('click',()=>{ if(box.dataset.fini==n) return; const ok=+b.dataset.j===P[n][2];
        noter('erreur'+n, ok); b.classList.add(ok?'ok':'ko'); z.querySelector('#r').innerHTML=(ok?OK:KO)(P[n][3]);
        if(ok){ box.dataset.fini=n; setTimeout(()=>{ n++; if(n<P.length) go(); else { z.querySelector('#r').innerHTML=OK('Les cinq erreurs sont corrigées. Ce sont les plus fréquentes : vous les repérerez maintenant partout.'); valider(); } },1400); } })); };
    exiger('Corrigez les cinq phrases.'); go(); if (E.faits[E.step]) valider();
  }

  /* 13 · ma version, corrigée par le lamantin */
  /* relecture du lamantin : IA de Cloudflare côté serveur, seulement pour un élève connecté ; sans réseau ou sans quota, on n'affiche rien de plus */
  async function relire(txt, msg){
    let S0=null; try{ S0=JSON.parse(localStorage.getItem('frg-session')||'null'); }catch(e){}
    if (!S0||!S0.jeton) return;
    const att=msg('lui','<span class="doux">Je relis le reste, one sec…</span>');
    try { const r=await fetch('https://courbe-classement.paulodubmx84.workers.dev/eleve/corriger',{method:'POST',body:JSON.stringify({ jeton:S0.jeton, module:1, texte:txt, consigne:'Se présenter en 4 à 5 phrases : qui, son travail (T0), une chose aimée, une chose faite hier (T-1).' })});
      const j=await r.json(); if(!j.ok){ att.remove(); return; }
      if(!j.erreurs.length){ att.innerHTML='J\'ai relu tout le reste : nothing to fix. Bravo.'; return; }
      let h='', k=0; j.erreurs.forEach((e,i)=>{ h+=esc(j.texte.slice(k,e.debut))+'<mark class="ia-faute"><sup>'+(i+1)+'</sup>'+esc(j.texte.slice(e.debut,e.fin))+'</mark>'; k=e.fin; }); h+=esc(j.texte.slice(k));
      att.innerHTML='Pour aller plus loin, '+(j.erreurs.length>1?j.erreurs.length+' détails':'un détail')+' à reprendre :<span class="ia-texte">'+h+'</span>'+j.erreurs.map((e,i)=>`<span class="fix"><b>${i+1}.</b> <s>${esc(e.extrait)}</s> → ${esc(e.correction)}<span class="doux petit">${esc(e.pourquoi)}</span></span>`).join('');
      E.relu=j.erreurs.map(e=>e.extrait+' → '+e.correction); sauver();
    } catch(e){ att.remove(); }
  }
  /* présentation à voix haute, envoyée à Paul : une seule par élève */
  function presentationOrale(z){
    if (z.querySelector('#pres-o')) return;
    const box=el(`<div class="pres-o" id="pres-o"><p class="eyebrow" style="margin:0">Pour Paul</p><h2>Lisez votre présentation à voix haute.</h2>
      <p>Enregistrez-vous (2 minutes maximum), réécoutez, recommencez autant que vous voulez. Quand c'est votre meilleure prise, envoyez-la : <b>Paul l'écoute personnellement</b>. Une seule présentation par élève.</p>
      <div class="mic-zone"></div><p class="petit" id="pres-msg"></p></div>`).firstChild; z.append(box);
    const m=box.querySelector('#pres-msg'), zone=box.querySelector('.mic-zone');
    if (localStorage.getItem('frg-pres-envoyee')) { zone.remove(); m.innerHTML='✓ Votre présentation est partie chez Paul.'; return; }
    if (!(window.MediaRecorder && navigator.mediaDevices)) { m.textContent='Votre navigateur ne permet pas d\'enregistrer. Essayez depuis un téléphone récent ou Chrome.'; return; }
    let blob=null, t0=0;
    const env=el(`<button class="btn plein" type="button" disabled>Envoyer à Paul</button>`).firstChild;
    zone.addEventListener('click',e=>{ if(e.target.closest('.micro')) t0=Date.now(); },true);
    micro(zone, 120, b=>{ blob=b; env.disabled=!b; });
    zone.after(env);
    env.addEventListener('click',async()=>{ if(!blob) return; let S0=null; try{ S0=JSON.parse(localStorage.getItem('frg-session')||'null'); }catch(e){}
      if(!S0||!S0.jeton){ m.textContent='Connectez-vous à votre espace élève pour l\'envoyer à Paul.'; return; }
      env.disabled=true; m.textContent='Envoi…';
      try{ const b64=await new Promise((ok,ko)=>{ const r=new FileReader(); r.onload=()=>ok(String(r.result).split(',')[1]); r.onerror=ko; r.readAsDataURL(blob); });
        const r=await fetch('https://courbe-classement.paulodubmx84.workers.dev/eleve/presentation',{method:'POST',body:JSON.stringify({jeton:S0.jeton,audio:b64,type:blob.type,duree:Math.round((Date.now()-t0)/1000),texte:E.version||''})});
        const j=await r.json();
        if(j.ok||j.deja){ try{ localStorage.setItem('frg-pres-envoyee','1'); }catch(e){} zone.remove(); env.remove(); m.innerHTML='✓ Envoyée. Paul va l\'écouter. Thank you'+(E.prenom?', '+esc(E.prenom):'')+' !'; }
        else { env.disabled=false; m.textContent=j.erreur||'Envoi impossible. Réessayez.'; } }
      catch(e){ env.disabled=false; m.textContent='Connexion impossible. Réessayez dans un instant.'; } });
  }
  function maVersion(z){
    z.append(el(`<p class="eyebrow">Temps 6 · Ma version</p><h1>Présentez-vous.</h1>
      <p>En 4 à 5 phrases : qui vous êtes, ce que vous faites au travail (T0), une chose que vous aimez, et une chose que vous avez faite hier (T-1). Pas de dictionnaire pour l'instant : utilisez les mots que vous avez.</p>
      <details><summary class="doux petit">Voir un exemple</summary><p class="texte-ref">${esc(D.exemple[S()].replace('Léa', E.prenom||'Léa'))}</p></details>
      <div class="chat" id="chat"><div class="chat-tete">${AV}<div><b>Le lamantin</b><small>Il corrige la forme, jamais ce que vous racontez.</small></div></div></div>
      <div class="saisie-chat"><textarea id="t" rows="1" placeholder="My name is…" aria-label="Votre présentation"></textarea><button class="envoyer" id="env" type="button" aria-label="Envoyer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button></div>
      <p class="provisoire">Le lamantin vérifie d'abord ce que le module 1 enseigne : l'ordre des blocs, les codes -s et -ed, la cohérence. Quand c'est juste, il relit le reste.</p>`));
    const chat=z.querySelector('#chat'), t=z.querySelector('#t'), env=z.querySelector('#env');
    const taille=()=>{ t.style.height='auto'; t.style.height=Math.min(t.scrollHeight,160)+'px'; }; t.addEventListener('input',taille); setTimeout(taille,0); env.addEventListener('click',()=>setTimeout(taille,0));
    const msg=(qui,html)=>{ const d=document.createElement('div'); d.className='msg '+qui; d.innerHTML=html; chat.append(d); chat.scrollTop=chat.scrollHeight; return d; };
    let essais={}, phrasesOk=0;
    msg('lui',`Hi${E.prenom?' '+esc(E.prenom):''}! Let's go : présentez-vous en 4 ou 5 phrases.`+' Je check juste l\'ordre de vos phrases et leurs codes. Le reste, later.');
    if (E.version){ t.value=E.version; }
    env.addEventListener('click',()=>{ const txt=t.value.trim(); if(!txt) return; E.version=txt; sauver(); msg('moi',esc(txt)); t.value='';
      const ph=C.phrases(txt); let fautes=[];
      ph.forEach(p=>{ const a=C.analyser(p); if(a&&a.type!=='ok'){ essais[p]=(essais[p]||0)+1; fautes.push([p,a]); } });
      if (window.FRGM) FRGM.ecrit({ ph: ph.length, mots: txt.split(/\s+/).filter(Boolean).length, fautes: fautes.map(f=>f[1].type) });
      setTimeout(()=>{
        if (ph.length<4){ msg('lui',`J'ai ${ph.length} phrase${ph.length>1?'s':''}. I need au moins 4 : qui vous êtes, votre travail, ce que vous aimez, et hier.`); }
        if (!fautes.length){ if (ph.length>=4){ msg('lui','Nice job ! Vos deux temps sont on point, et vos phrases sont dans le bon ordre. Toute la suite se construit là-dessus.'); valider(); relire(txt, msg); presentationOrale(z); } return; }
        fautes.forEach(([p,a])=>{ const deuxieme = (Object.keys(essais).some(k=>essais[k]>1)) || (a.type==='calque');
          if (!deuxieme) msg('lui', `« ${esc(p)} »\n${a.indice}\nCorrigez et renvoyez-moi tout le texte, please.`);
          else msg('lui', `« ${esc(p)} »\n${a.indice}<span class="fix">${esc(a.bon)}</span>${a.code?`<span class="cd">${esc(a.code)}</span>`:''}`); });
        const types=[...new Set(fautes.map(f=>f[1].type))]; E.erreurs=(E.erreurs||[]).concat(types); sauver();
        if (Object.values(essais).some(n=>n>=2) && ph.length>=4){ msg('lui','OK, je note ces points : ils reviendront dans les prochains modules. Keep going, cette étape est validée.'); valider(); }
      },500); });
    t.addEventListener('keydown',e=>{ if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){ e.preventDefault(); env.click(); } });
    exiger('Écrivez votre présentation et envoyez-la au lamantin.'); if (E.faits[E.step]) { valider(); presentationOrale(z); }
  }

  /* 14 · défi oral : le lamantin pose trois questions, l'élève répond à voix haute et se réécoute */
  function conversation(z){
    const [role, Q] = D.role[S()]; const qs=[Q[0],Q[Math.floor(Q.length/2)],Q[Q.length-1]]; let k=0, flux=null;
    z.append(el(`<p class="eyebrow">Temps 7 · À voix haute</p><h1>Trois questions. Vous répondez à l'oral.</h1>
      <p>Le lamantin joue <b>${role}</b>. Pour chaque question : lisez-la, touchez le micro, parlez 30 secondes au plus, puis réécoutez-vous. Une ou deux phrases suffisent, avec T0 et T-1.</p>
      <div class="chat" id="chat"><div class="chat-tete">${AV}<div><b>Le lamantin</b><small>joue ${role}</small></div></div></div>
      <div class="saisie-chat oral" id="oral"><div class="pill-oral"><span class="rec-pt" aria-hidden="true"></span><span class="pill-tx">Répondre à voix haute</span><span class="tps" id="tps">30</span></div><button class="envoyer micro-b" id="go" type="button" aria-label="Répondre"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg></button><button class="envoyer stop-b" id="stop" type="button" hidden aria-label="J'ai fini"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"/></svg></button></div>
      <p class="provisoire" id="note">Vos réponses restent sur cet appareil. Personne d'autre ne les entend.</p>`));
    const chat=z.querySelector('#chat'), go=z.querySelector('#go'), stop=z.querySelector('#stop'), tps=z.querySelector('#tps');
    const msg=(qui,html)=>{ const d=document.createElement('div'); d.className='msg '+qui; d.innerHTML=html; chat.append(d); chat.scrollTop=chat.scrollHeight; return d; };
    const MODELES={"pro": ["I'm a project manager. I organize the meetings and I talk to the clients.", "Yes, I like my job because I meet new people every day.", "Yesterday, I ate a salad with my colleagues."], "hotel": ["Breakfast starts at seven, and it ends at ten.", "I recommend the restaurant on the beach. The fish is excellent.", "They usually ask for a taxi or a good restaurant."], "luxe": ["I recommend this watch. It's very elegant.", "This week, a lot of clients bought this bag.", "Yes, of course. We wrap all the gifts for free."], "tour": ["No problem. Another tour leaves at two o'clock.", "They visited the old town and they took a lot of photos.", "I recommend a walk by the river. It's beautiful at night."], "immo": ["They bought the house in 2015.", "Last year, they renovated the kitchen.", "Yes, I love it. It's quiet and close to the beach."]};   /* une réponse possible par question : affichée en Fondations, sur demande en Standard */
    const poser=()=>{ const q=(k===0&&E.prenom?`Hi ${E.prenom}! `:'')+qs[k].replace(/^(Hi|Hello)! /,''); msg('lui',esc(q));
      const m=(MODELES[S()]||MODELES.pro)[k]; if(APPR||!m) return;
      const d=msg('aide-rep', FOND ? `<b>Vous pouvez répondre :</b> « ${esc(m)} »<br><span class="doux petit">Lisez-la à voix haute, ou adaptez-la à vous.</span>` : `<button class="lien-txt" type="button">Besoin d'aide ? Voir une réponse possible</button>`);
      const b=d.querySelector('.lien-txt'); if(b) b.addEventListener('click',()=>{ d.innerHTML=`<b>Une réponse possible :</b> « ${esc(m)} »`; }); };
    let rec=null, it=null;
    const fin=()=>{ clearInterval(it); stop.hidden=true; if(rec&&rec.state!=='inactive') rec.stop(); else apres(null); };
    /* après chaque réponse : un retour en pop-up, avant de passer à la suite */
    const LIGNES_LAM=['Not bad du tout ! Le plus dur, c\'est d\'oser. Done.','Nice ! Vous parlez déjà, et ça, ça ne s\'apprend pas dans un livre.','That\'s it ! Trois réponses à voix haute dès le module 1 : la plupart des gens n\'osent pas avant des années.'];
    const popup=(url, fin, suite)=>{ const d=document.createElement('div'); d.className='pop-oral'; d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true');
      d.innerHTML=`<div class="pop-carte"><div class="bulle-lam">${AV}<div class="txt">${LIGNES_LAM[Math.min(k-1,2)]}</div></div>
        ${url?`<p class="petit"><b>Réécoutez-vous :</b></p><audio controls src="${url}"></audio>`:''}
        <p class="petit" style="margin-top:14px"><b>Vérifiez en vous réécoutant :</b></p>
        <ul class="pop-liste"><li>Chaque verbe porte son code : -s à T0 (he, she, it), -ed à T-1, même invisible.</li><li>Vous êtes resté dans le même temps : be logical.</li><li>Qui / fait quoi / à quoi, dans cet ordre.</li></ul>
        <button class="btn plein" type="button" id="pop-ok">${fin?'Terminer':'Question suivante'}</button></div>`;
      document.body.append(d); const ok=d.querySelector('#pop-ok'); ok.focus(); ok.addEventListener('click',()=>{ d.remove(); suite(); }); };
    const apres=(url)=>{ msg('moi', url?`<audio controls src="${url}"></audio>`:'<i>Réponse à voix haute</i>');
      k++; const fin=k>=qs.length;
      popup(url, fin, ()=>{ if(!fin){ go.hidden=false; tps.textContent=30; poser(); }
        else { go.hidden=true; tps.textContent='✓'; msg('lui','Thanks'+(E.prenom?', '+esc(E.prenom):'')+' ! Trois réponses en anglais, à voix haute. Well done.'); if(flux) flux.getTracks().forEach(t=>t.stop()); valider(); } }); };
    go.addEventListener('click',async()=>{ go.hidden=true; stop.hidden=false; let t=30; tps.textContent=t;
      try{ if(!flux && navigator.mediaDevices) flux=await navigator.mediaDevices.getUserMedia({audio:true});
        if(flux && window.MediaRecorder){ const morceaux=[]; rec=new MediaRecorder(flux); rec.ondataavailable=e=>morceaux.push(e.data); const num=k+1;
          rec.onstop=()=>{ const bl=new Blob(morceaux,{type:rec.mimeType}); if(window.Voix) Voix.garder('m1-oral-'+num, bl); apres(URL.createObjectURL(bl)); }; rec.start(); } }
      catch(e){ rec=null; z.querySelector('#note').textContent='Micro non autorisé : répondez à voix haute, sans enregistrement.'; }
      it=setInterval(()=>{ t--; tps.textContent=t; if(t<=0) fin(); },1000); });
    stop.addEventListener('click',fin);
    poser();
    exiger('Répondez aux trois questions à voix haute.'); if (E.faits[E.step]) valider();
  }

  /* 15 · trois fois plus vite */
  function fluidite(z){
    const texte = E.version || D.exemple[S()]; const durees=[90,60,45]; let n=0; const audios=[];
    z.append(el(`<p class="eyebrow">Temps 8 · Trois fois plus vite</p><h1>La même chose, trois fois, de plus en plus vite.</h1>
      <p>Redites votre présentation à voix haute. D'abord en 90 secondes, puis en 60, puis en 45. Mêmes mots, plus d'aisance. Essayez de ne pas lire.</p>
      <div class="texte-ref">${esc(texte)}</div>
      <div class="chrono"><span class="tps" id="tps">90</span><button class="btn plein" id="go" type="button">Essai 1 · 90 s</button><button class="btn" id="stop" type="button" hidden>J'ai fini</button></div>
      <div class="essais">${durees.map(d=>`<span>${d} s</span>`).join('')}</div>
      <p class="doux petit">Exagérez les sons. Comme au théâtre.</p><div id="aud"></div>
      <p class="provisoire" id="note">Si vous l'autorisez, chaque essai est gardé sur cet appareil. Vous réentendrez votre voix au module 12, puis à la fin du parcours : la différence vous surprendra.</p>`));
    const tps=z.querySelector('#tps'), go=z.querySelector('#go'), stop=z.querySelector('#stop'), aud=z.querySelector('#aud');
    let flux=null, rec=null, it=null;
    let tRest=0; const terminer=()=>{ clearInterval(it); if (window.FRGM) FRGM.fluide(n, durees[n]-Math.max(0,tRest), durees[n]); stop.hidden=true; if(rec&&rec.state!=='inactive') rec.stop(); z.querySelectorAll('.essais span')[n].classList.add('fait'); n++;
      if(n<durees.length){ go.hidden=false; go.textContent=`Essai ${n+1} · ${durees[n]} s`; tps.textContent=durees[n]; } else { go.hidden=true; tps.textContent='✓'; valider(); if(flux) flux.getTracks().forEach(t=>t.stop()); } };
    go.addEventListener('click',async()=>{ go.hidden=true; stop.hidden=false; let t=durees[n]; tps.textContent=t;
      try{ if(!flux && navigator.mediaDevices) flux=await navigator.mediaDevices.getUserMedia({audio:true});
        if(flux && window.MediaRecorder){ const morceaux=[]; rec=new MediaRecorder(flux); rec.ondataavailable=e=>morceaux.push(e.data);
          const num=n+1; rec.onstop=()=>{ const bl=new Blob(morceaux,{type:rec.mimeType}); if(window.Voix) Voix.garder('m1-essai-'+num, bl); const u=URL.createObjectURL(bl); audios.push(u); aud.insertAdjacentHTML('beforeend',`<p class="petit">Essai ${num} : <audio controls src="${u}"></audio></p>`); }; rec.start(); } }
      catch(e){ z.querySelector('#note').textContent='Micro non autorisé : faites l\'exercice à voix haute, sans enregistrement.'; }
      tRest=t; it=setInterval(()=>{ t--; tRest=t; tps.textContent=t; if(t<=0) terminer(); },1000); });
    stop.addEventListener('click',terminer);
    exiger('Faites les trois essais.'); if (E.faits[E.step]) valider();
  }


  /* Courbe bilingue : le français a trois passés, l'anglais un seul */
  function bilingue(z){
    const [fr,en,piege]=D.bilingue[S()];
    z.append(el(`<p class="eyebrow">Temps 2 · Frenglais</p><h1>En français, trois façons de dire le passé. En anglais, une seule.</h1>
      <p>Regardez la colonne T-1 : le français y range « je voyais », « j'ai vu » et « je vis ». Touchez le bouton pour voir ce que l'anglais met à la place.</p>
      <div id="bi-zone"><div class="bi" aria-label="Courbe bilingue">
        <div class="t hors">T-2</div><div class="t">T-1</div><div class="t">T0</div><div class="t hors">T+1</div>
        <div class="fr hors"><span>J'avais vu</span></div>
        <div class="fr t1"><span>Je voyais</span><span>J'ai vu</span><span>Je vis</span><span class="fl" aria-hidden="true">↓ en anglais, les trois deviennent…</span></div>
        <div class="fr"><span>Je vois</span></div><div class="fr hors"><span>Je verrai</span></div>
        <div class="an hors">I had seen</div><div class="an t1" id="an-t1">?</div><div class="an">I see</div><div class="an hors">I will see</div>
      </div></div>
      <div><button type="button" class="btn plein" id="fusion">Voir la version anglaise</button></div>
      <div id="suite" hidden>
        <p><b>Je voyais, j'ai vu, je vis : en anglais, les trois se disent <em>I saw</em>.</b> Un seul passé, avec un seul code : -ed (ici invisible, <em>saw</em> = <em>see</em> + -ed). Moins de choix, donc plus simple. Ne cherchez pas l'équivalent de chaque temps français : si c'est fini, c'est -ed.</p>
        <p class="choc">« ${esc(fr)} »</p>
        <p class="en" lang="en">${esc(en)}</p><div class="nv-slot petit" data-src="audio/m01-bilingue-${S()}.mp3"></div>
        <p>Le piège : traduire « a signé » mot à mot par <em>${esc(piege)}</em>. Le moment est précis (hier, à une heure donnée) et c'est fini : l'anglais met simplement -ed.</p>
        <p class="doux petit">L'anglais reste souple : selon le contexte, d'autres formulations existent. C'est simplement le choix le plus naturel quand le moment passé est précis.</p>
      </div>`));
    const zone=z.querySelector('#bi-zone'), b=z.querySelector('#fusion');
    const montrer=()=>{ zone.classList.add('fusion'); z.querySelector('#an-t1').textContent='I saw'; z.querySelector('#suite').hidden=false; b.hidden=true; valider(); };
    b.addEventListener('click',montrer);
    FRGNote.monter(z, (slot, fin)=>{ const ok=dire(en,0,()=>fin(true)); if(ok===false) fin(false); });
    exiger('Touchez « Voir la version anglaise ».'); if (E.faits[E.step]) montrer();
  }

  /* Courbe à trous : la reconstruire de mémoire */
  function trous(z){
    z.append(el(`<p class="eyebrow">Temps 3 · La Courbe elle-même</p><h1>Complétez la Courbe, sans regarder.</h1>
      <p><b>Au-dessus de la ligne</b>, écrivez les quatre repères de temps, du plus ancien au plus récent : ils commencent tous par la lettre T. <b>En dessous</b>, écrivez le code que porte le verbe au passé, puis au présent : un tiret suivi d'une ou deux lettres.</p>
      <p class="doux petit">Les étiquettes vous disent ce que contient chaque case. C'est l'effort de mémoire qui fixe la Courbe : essayez d'abord seul.</p>
      <div class="trous">
        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true"><path d="M20 100 C200 92 300 108 450 99 S700 92 960 100" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" vector-effect="non-scaling-stroke"/><path d="M944 86 L964 100 L944 114" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>
        ${[['15%','r1','avant le passé'],['38%','r2','le passé'],['62%','r3','le présent'],['85%','r4','le futur']].map(r=>`<span class="trou-et haut" style="left:${r[0]}">${r[2]}</span><input class="trou haut" style="left:${r[0]}" id="tr-${r[1]}" placeholder="T…" aria-label="Repère de temps : ${r[2]}" autocomplete="off" autocapitalize="characters" spellcheck="false">`).join('')}
        <input class="trou bas" style="left:38%" id="tr-c1" placeholder="-…" aria-label="Code du verbe au passé" autocomplete="off" autocapitalize="off" spellcheck="false"><span class="trou-et bas" style="left:38%">code du passé</span>
        <input class="trou bas" style="left:62%" id="tr-c2" placeholder="-…" aria-label="Code du verbe au présent" autocomplete="off" autocapitalize="off" spellcheck="false"><span class="trou-et bas" style="left:62%">code du présent</span>
      </div>
      <div class="ligne-btn"><button type="button" class="btn plein" id="verif">Vérifier ma Courbe</button><button type="button" class="btn" id="coup-oeil">Je sèche : revoir la Courbe 3 secondes</button></div><div id="r"></div>`));
    const att={'tr-r1':'t-2','tr-r2':'t-1','tr-r3':'t0','tr-r4':'t+1','tr-c1':'-ed','tr-c2':'-s'};
    const norm=v=>v.toLowerCase().replace(/\s+/g,'').replace(/[−–—]/g,'-').replace(/^t(\d)/,'t+$1').replace(/^t\+0$/,'t0').replace(/^(ed|s)$/,'-$1');
    let essais=0;
    z.querySelector('#coup-oeil').addEventListener('click',ev=>{ const b=ev.currentTarget; b.disabled=true; const anciens={};
      for(const [id,v] of Object.entries(att)){ const i=z.querySelector('#'+id); anciens[id]=[i.value,i.placeholder]; i.value=''; i.placeholder=v.toUpperCase(); i.classList.add('vu'); }
      setTimeout(()=>{ for(const [id] of Object.entries(att)){ const i=z.querySelector('#'+id); i.placeholder=anciens[id][1]; i.classList.remove('vu'); } b.textContent='À vous, de mémoire'; z.querySelector('#tr-r1').focus(); },3000); });
    z.querySelector('#verif').addEventListener('click',()=>{ essais++; let bons=0;
      for (const [id,v] of Object.entries(att)){ const i=z.querySelector('#'+id), ok=norm(i.value)===v; i.classList.toggle('ok',ok); i.classList.toggle('ko',!ok&&i.value!==''); if(ok) bons++; } noter('trous', bons===6);
      const r=z.querySelector('#r');
      if (bons===6){ r.innerHTML=OK('Parfait : T-2, T-1, T0, T+1, et les deux codes. Toute la langue tient sur cette ligne.'); valider(); return; }
      if (essais>=2){ r.innerHTML=KO('Voici la réponse : T-2, T-1, T0, T+1 au-dessus ; -ed sous T-1, -s sous T0. Recopiez-la une fois pour la fixer.'); for(const [id,v] of Object.entries(att)) z.querySelector('#'+id).placeholder=v.toUpperCase(); E.erreurs=(E.erreurs||[]).concat(['courbe']); sauver(); valider(); }
      else r.innerHTML=KO(`${bons} sur 6. Les cases en rouge sont à revoir. Rappel : les repères vont de T-2 à T+1, et les deux codes sont ceux du passé et du présent.`); });
    exiger('Complétez la Courbe.'); if (E.faits[E.step]) valider();
  }

  /* Essorer : toucher les verbes d'un vrai texte, puis donner leur code */
  function essorer(z){
    const [titre,texte]=D.essorage[S()]; const verbes=[]; let n=0;
    const html = esc(texte).replace(/\{([^|}]+)\|([^|}]+)(\|inv)?\}|([A-Za-z.'0-9:-]+)/g,(m,v,c,inv,mot)=>{
      if (v){ verbes.push({mot:v,c,inv:!!inv}); return `<button type="button" class="mot" data-v="${verbes.length-1}">${v}</button>`; }
      return `<button type="button" class="mot">${mot}</button>`; });
    z.append(el(`<p class="eyebrow">Temps 5 · Mise en situation</p><h1>Essorez les phrases. Regardez ce qui en sort.</h1>
      <p>Un vrai texte de votre métier. <b>Sans chercher à traduire</b>, touchez chaque verbe conjugué : ce sont eux qui portent le temps. Puis essorez.</p>
      ${(()=>{ const de={pro:'Anna',hotel:'Night reception',luxe:'Store manager',tour:'Marco',immo:'Hugo'}[S()]||'Team';
        return `<div class="mail" lang="en"><div class="mail-barre"><span></span><span></span><span></span><b>Inbox</b></div><div class="mail-tete"><span class="mail-av" aria-hidden="true">${esc(de.charAt(0))}</span><div><p class="mail-de"><b>${esc(de)}</b> <span>&lt;${de.toLowerCase().replace(/[^a-z]/g,'')}@company.com&gt;</span></p><p class="mail-a">To: ${esc(E.prenom||'you')}</p></div><span class="mail-h">08:12</span></div><p class="mail-objet">${esc(titre.replace(/\.$/,''))}</p><div class="mail-corps"><div class="situ en" id="situ">${html}</div></div></div>`; })()}
      <div class="nav-situ"><button type="button" class="btn plein" id="essorer">Essorer</button><span class="doux petit" id="cpt">0 mot touché</span></div>
      <div id="r"></div><div id="codes" hidden></div>`));
    const situ=z.querySelector('#situ'), cpt=z.querySelector('#cpt'), r=z.querySelector('#r');
    situ.addEventListener('click',e=>{ const b=e.target.closest('.mot'); if(!b||situ.classList.contains('essore')) return; b.setAttribute('aria-pressed', b.getAttribute('aria-pressed')!=='true'); n=situ.querySelectorAll('.mot[aria-pressed="true"]').length; cpt.textContent=`${n} mot${n>1?'s':''} touché${n>1?'s':''}`; });
    z.querySelector('#essorer').addEventListener('click',e=>{ situ.classList.add('essore'); e.target.hidden=true; let trouves=0, faux=0;
      situ.querySelectorAll('.mot').forEach(b=>{ const v=b.dataset.v, p=b.getAttribute('aria-pressed')==='true';
        if (v!==undefined){ const x=verbes[+v]; b.dataset.code=x.c; if(x.inv) b.dataset.irr='1'; b.classList.add(p?'trouve':'manque'); if(p) trouves++; }
        else if (p){ b.classList.add('faux-mot'); faux++; } else b.classList.add('muet'); });
      r.innerHTML = `<div class="retour-msg ${trouves===verbes.length&&!faux?'ok':'info'}">Il reste ${verbes.length} verbes. Vous en avez trouvé ${trouves}${faux?`, et touché ${faux} mot${faux>1?'s':''} qui n'en ${faux>1?'sont':'est'} pas`:''}. Tout le reste, c'est du décor : le temps, ce sont les verbes qui le portent.</div>`;
      noter('verbes', trouves===verbes.length && !faux); if (trouves<verbes.length){ E.erreurs=(E.erreurs||[]).concat(['verbes']); sauver(); }
      const codes=z.querySelector('#codes'); codes.hidden=false;
      codes.innerHTML=`<h2>Maintenant, le code de chaque verbe</h2><div class="codes-grille">${verbes.map((x,i)=>`<div class="exo" data-i="${i}"><span class="en">${x.mot}</span><div class="choix"><button class="puce" type="button" data-c="ed"><span class="code ed">-ed</span></button><button class="puce" type="button" data-c="s"><span class="code s">-s</span></button></div><small class="doux"></small></div>`).join('')}</div>`;
      let ok=0;
      codes.querySelectorAll('.exo').forEach(d=>d.addEventListener('click',ev=>{ const b=ev.target.closest('[data-c]'); if(!b||d.dataset.fini) return; const x=verbes[+d.dataset.i]; noter('code'+d.dataset.i, b.dataset.c===x.c);
        if (b.dataset.c===x.c){ b.classList.add('ok'); d.dataset.fini=1; d.querySelector('small').textContent = x.inv ? 'Code invisible : un irrégulier.' : (x.c==='s'?'T0.':'T-1.'); if(++ok===verbes.length){ codes.insertAdjacentHTML('beforeend',OK('Tous les codes sont justes. Vous venez de lire un vrai texte par sa structure.')); valider(); } }
        else { b.classList.add('ko'); d.querySelector('small').textContent = x.inv ? 'Regardez : c\'est un irrégulier, son -ed est caché.' : 'Regardez la fin du verbe, et le repère de temps.'; E.erreurs=(E.erreurs||[]).concat(['code']); sauver(); } })); });
    exiger('Essorez le texte, puis donnez le code de chaque verbe.'); if (E.faits[E.step]) valider();
  }

  /* fin · tableau élève (le tableau formateur viendra avec le serveur du lamantin) */
  function fin(z){
    E.fini=true; sauver(); maj();
    const tps=E.temps||{}, total=Object.values(tps).reduce((a,b)=>a+b,0);
    const mn=s=>s<60?`${s} s`:`${Math.round(s/60)} min`;
    const groupes={}; ETAPES.forEach((e,i)=>{ const g=e.nom.split(' · ')[0]; if(/^Temps/.test(g)) groupes[g]=(groupes[g]||0)+(tps[i]||0); });
    const max=Math.max(1,...Object.values(groupes));
    const NOMS={s:'le -s oublié à T0',ed:'le -ed oublié à T-1',invisible:'les irréguliers régularisés',coherence:'la cohérence des temps',ordre:'l\'ordre des mots',calque:'les calques du français',courbe:'la Courbe de mémoire',verbes:'repérer les verbes',code:'le code des verbes'};
    const err={}; (E.erreurs||[]).forEach(t=>err[t]=(err[t]||0)+1);
    const top=Object.entries(err).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const N=Object.entries(E.notes||{}).filter(([k])=>!/^(exp|rev)/.test(k)).map(([,v])=>v), score=N.length?Math.round(N.reduce((a,b)=>a+b,0)/N.length*100):0;
    const SEUIL=90, valide=score>=SEUIL, rates=N.filter(v=>!v).length; E.score=score; E.valide=valide; if(valide&&!E.dateFin) E.dateFin=Date.now(); sauver();
    const aj=window.FRGA&&!TESTEUR?FRGA.ajuster(score,1):null;
    const msgParc=aj&&aj.change?`<div class="retour-msg info parcours-change">Pour le module 2, vous passez au parcours <b>${FRGA.NOMS[aj.apres]}</b>. ${FRGA.DESC[aj.apres]}</div>`:'';
    z.append(el(`<p class="eyebrow">Module 1 · Repères et codes · terminé</p><h1>${valide?`${E.prenom?esc(E.prenom)+', le':'Le'} premier étage est posé.`:'Presque. Encore un tour.'}</h1>
      <div class="retenir uni"><span class="aide">Réussi du premier coup</span><p class="score-grand ${valide?'ok':'ko'}">${score} %</p><p class="doux petit">${valide?`Module validé. Seuil : ${SEUIL} %.`:`Il faut ${SEUIL} % pour valider. ${rates} question${rates>1?'s':''} ratée${rates>1?'s':''} au premier essai.`}</p></div>
      ${msgParc}
      ${valide?'':'<button class="btn plein" id="refaire" type="button">Refaire le module</button>'}
      <div class="carte-fin">
        <div class="retenir"><p class="retenir-titre">À retenir</p><div class="retenir-duo"><div><strong>T-1</strong><span class="pastille ed">-ed</span><span>même invisible : <em>went</em>, <em>bought</em></span></div><div><strong>T0</strong><span class="pastille s">-s</span><span>même invisible : <em>I work</em></span></div></div><p>Une phrase, c'est qui, fait quoi, à quoi. Et vous restez cohérent : be logical.</p></div>
        <div><b>Temps passé</b><span class="score">${mn(total)}</span><div class="f-temps">${Object.entries(groupes).map(([g,v])=>`<div><span>${g}</span><i style="width:${Math.round(v/max*100)}%"></i><span>${mn(v)}</span></div>`).join('')}</div></div>
        <div><b>À surveiller dans les prochains modules</b>${top.length?`<div class="f-puces">${top.map(([t,n])=>`<span>${NOMS[t]||t} · ${n}</span>`).join('')}</div><p class="doux petit">Ces points reviennent dans les modules suivants, jusqu'à disparaître.</p>`:'<p>Rien à signaler : aucune erreur qui revient. Nice job!</p>'}</div>
        <div class="plus-loin"><b>Prochain module</b><p class="next-titre">T0, le temps le plus simple</p><p>On zoome sur le présent, et sur <em>do / does</em> pour poser des questions.</p></div>
      </div>
      <div id="mission-box"></div>
      <p style="font-size:20px;font-weight:500;margin-bottom:0">Be logical. Now, spit it.</p><p class="doux petit" style="margin-top:2px">Soyez logique. Et maintenant, dites-le à voix haute.</p><p class="doux petit" id="envoi"></p>
      <div class="retour-msg info">Tous les 4 modules, une fiche d'une page résume vos progrès : ce qui est acquis, ce qui revient encore. La première arrive après le module 4. <a href="bilan.html?bloc=1" target="_blank" rel="noopener">Voir à quoi elle ressemble</a></div>`));
    if(valide&&window.FRG) FRG.monterMission(z.querySelector('#mission-box'),1,'fiche.html?n=1');
    else { const mb=z.querySelector('#mission-box'); if(mb) mb.innerHTML='<div class="pdf-verrou" aria-disabled="true"><span class="pdf-ic">🔒</span><div><b>Résumé du module (PDF)</b><span>Disponible quand le module est réussi.</span></div></div>'; }
    const rf=z.querySelector('#refaire');
    if(rf) rf.addEventListener('click',()=>{ const garde={prenom:E.prenom,sect:E.sect,temps:E.temps,erreurs:E.erreurs,version:E.version,nuage:E.nuage,envoye:E.envoye}; E=Object.assign({step:0,max:0,fini:false,faits:{},notes:{}},garde); sauver(); location.reload(); });
    enregistrer(score, valide, total, top.map(([t,n])=>`${NOMS[t]||t} (${n})`));
  }

  /* progression enregistrée sur le serveur Frenglais (session de l'espace élève), visible dans le tableau de bord de Paul */
  async function enregistrer(score, valide, total, erreurs){
    const box=document.getElementById('envoi'); let S0=null; try{ S0=JSON.parse(localStorage.getItem('frg-session')||'null'); }catch(e){}
    if (!S0||!S0.jeton){ if(box) box.textContent='Progression gardée sur cet appareil.'; return; }
    try { const r=await fetch('https://courbe-classement.paulodubmx84.workers.dev/eleve/resultat',{method:'POST',body:JSON.stringify({ jeton:S0.jeton, module:1, score, valide, mes: window.FRGM ? FRGM.resume() : null, minutes:Math.round(total/60), erreurs })});
      const j=await r.json().catch(()=>({})); if(box) box.textContent = j.ok ? 'Progression enregistrée.' : 'Progression gardée sur cet appareil.'; }
    catch(e){ if(box) box.textContent='Progression gardée sur cet appareil.'; }
  }

  /* chrono discret : temps passé par étape, pour le tableau */
  setInterval(()=>{ if(document.hidden) return; E.temps=E.temps||{}; E.temps[E.step]=(E.temps[E.step]||0)+5; sauver(); },5000);
  /* petit chrono en bas à gauche : temps total passé sur le module */
  { const tx=$('#chrono-txt'); let vif=0;
    const aff=()=>{ if(!tx) return; const t=Object.values(E.temps||{}).reduce((a,b)=>a+b,0)+vif%5; tx.textContent=Math.floor(t/60)+':'+String(t%60).padStart(2,'0'); };
    setInterval(()=>{ if(!document.hidden){ vif++; aff(); } },1000); aff(); }
  /* recommencer à zéro : deux appuis pour confirmer, sans boîte de dialogue */
  { const z=$('#zero'); let arme=null;
    if(z) z.addEventListener('click',()=>{ if(!arme){ z.textContent='Sûr ? Tout effacer'; z.classList.add('arme'); arme=setTimeout(()=>{ arme=null; z.textContent='Recommencer'; z.classList.remove('arme'); },4000); return; }
      try{ localStorage.removeItem(CLE); localStorage.removeItem('frg-m1-pct'); }catch(e){} location.reload(); }); }

  // reprise là où l'élève s'était arrêté
  aller(Math.min(E.step, E.max));
})();
