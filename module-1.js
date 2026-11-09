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
  const melange = a => { const b=[...a]; for(let i=b.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } return b; };
  const S = () => E.sect || 'hotel';
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
    { nom:'Ton secteur', f:secteur },
    { nom:'Temps 1 · Le jeu', f:jeu1 },
    { nom:'Temps 1 · Ce que tu connais', f:jeu2 },
    { nom:'Temps 2 · Le déclic', f:declic },
    { nom:'Temps 2 · Contrôle', f:controle },
    { nom:'Temps 3 · Vitre A', f:vitreA },
    { nom:'Temps 3 · Vitre B', f:vitreB },
    { nom:'Temps 4 · Comprendre', f:ecoute1 },
    { nom:'Temps 4 · Repérer', f:ecoute2 },
    { nom:'Temps 4 · Répéter', f:ecoute3 },
    { nom:'Temps 5 · Remets dans l\'ordre', f:serie1 },
    { nom:'Temps 5 · T0 ou T-1 ?', f:serie2 },
    { nom:'Temps 5 · Trouve l\'erreur', f:serie3 },
    { nom:'Temps 6 · Ma version', f:maVersion },
    { nom:'Temps 7 · Le lamantin', f:conversation },
    { nom:'Temps 8 · Trois fois plus vite', f:fluidite },
    { nom:'Terminé', f:fin }
  ];
  const pct = () => E.fini ? 100 : Math.min(99, (E.max / (ETAPES.length-1)) * 100);
  let fait = false;
  const valider = (msg) => { fait = true; E.faits[E.step]=1; suiv.disabled=false; verrou.hidden=true; if (E.step+1>E.max){ E.max=E.step+1; } sauver(); maj(); };
  function exiger(t){ fait = !!E.faits[E.step]; suiv.disabled = !fait; verrou.hidden = fait; verrou.textContent = t || 'Termine cet écran pour continuer.'; }
  function maj(){ const p=Math.round(pct()); $('#barre').style.width=p+'%'; $('#barre-box').setAttribute('aria-valuenow',p); $('#etape-pct').textContent=p+' %'; $('#etape-nom').textContent=ETAPES[E.step].nom; }
  function aller(n){
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    E.step = Math.max(0, Math.min(ETAPES.length-1, n)); sauver();
    ecran.innerHTML=''; fait=false; verrou.hidden=true; suiv.disabled=false;
    prec.disabled = E.step===0; suiv.textContent = E.step===ETAPES.length-1 ? 'Retour à l\'espace élève' : 'Suivant';
    ETAPES[E.step].f(ecran); maj(); ecran.focus({preventScroll:true}); window.scrollTo({top:0,behavior:'smooth'});
  }
  suiv.addEventListener('click',()=>{ if (E.step===ETAPES.length-1){ location.href='espace-eleve.html'; return; } aller(E.step+1); });
  prec.addEventListener('click',()=>aller(E.step-1));

  /* 0 · secteur */
  function secteur(z){
    z.append(el(`<p class="eyebrow">Module 1 · Tout l'anglais tient sur une ligne</p>
      <h1>Avant de commencer : ton secteur.</h1>
      <p>Tous les exemples du module viennent de ton métier. Tu pourras le changer à tout moment en revenant ici.</p>
      <div class="secteurs">${Object.entries(D.secteurs).map(([k,s])=>`<button class="puce" type="button" data-k="${k}" aria-pressed="${E.sect===k}"><span aria-hidden="true">${s.ico}</span>${s.nom}</button>`).join('')}</div>
      <p class="doux petit">Environ 50 minutes. Ta progression est gardée sur cet appareil : tu peux t'arrêter et reprendre.</p>`));
    z.querySelectorAll('[data-k]').forEach(b=>b.addEventListener('click',()=>{ E.sect=b.dataset.k; z.querySelectorAll('[data-k]').forEach(x=>x.setAttribute('aria-pressed',x===b)); valider(); }));
    exiger('Choisis ton secteur pour commencer.'); if (E.sect) valider();
  }

  /* 1 · le jeu des mots connus */
  function jeu1(z){
    z.append(el(`<p class="eyebrow">Temps 1 · Let's play a first game</p>
      <h1>Écris tous les mots anglais que tu connais.</h1>
      <p>Sans réfléchir, sans dictionnaire : mots, expressions, références. Valide chaque mot avec Entrée. Tu as 60 secondes.</p>
      <div class="chrono"><span class="compte" id="cpt">60</span><button class="btn plein" id="go" type="button">Lancer le chrono</button></div>
      <input class="saisie" id="mot" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Un mot, puis Entrée" disabled>
      <div class="nuage" id="nuage"></div><div id="res"></div>`));
    const nuage=z.querySelector('#nuage'), inp=z.querySelector('#mot'), cpt=z.querySelector('#cpt');
    const ajoute = m => { const s=document.createElement('span'); s.textContent=m; nuage.append(s); };
    (E.nuage||[]).forEach(ajoute);
    inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); const m=inp.value.trim(); if(m){ E.nuage.push(m); ajoute(m); inp.value=''; sauver(); } } });
    z.querySelector('#go').addEventListener('click',e=>{ e.target.disabled=true; inp.disabled=false; inp.focus(); E.nuage=[]; nuage.innerHTML=''; let t=60;
      const it=setInterval(()=>{ t--; cpt.textContent=t; if(t<=0){ clearInterval(it); inp.disabled=true; const n=E.nuage.length;
        z.querySelector('#res').innerHTML = OK(`${n} mot${n>1?'s':''}. ${n>=10?'Pas mal du tout.':'C\'est déjà une base.'} On garde ton nuage : il reviendra au module 12.`); valider(); } },1000); });
    exiger('Lance le chrono et écris tes mots.'); if (E.faits[E.step]) valider();
  }

  /* 2 · tick + bascule */
  function jeu2(z){
    const mots=D.mots[S()];
    z.append(el(`<p class="eyebrow">Temps 1 · Tick ceux que tu connais</p>
      <h1>Et ceux-là ?</h1>
      <div class="choix">${mots.map(m=>`<button class="puce" type="button" aria-pressed="false">${m}</button>`).join('')}</div>
      <div id="bascule"></div>`));
    z.querySelectorAll('.puce').forEach(b=>b.addEventListener('click',()=>b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true')));
    const bas = z.querySelector('#bascule');
    const btn = el(`<button class="btn plein" type="button">J'ai coché</button>`).firstChild; bas.append(btn);
    btn.addEventListener('click',()=>{ const n=z.querySelectorAll('.puce[aria-pressed="true"]').length;
      bas.innerHTML = `<div class="retour-msg info"><p><b>${n} sur ${mots.length}. Très bien.</b></p><p>Maintenant, la vraie question : à quoi servent tous ces mots si on ne sait pas les relier entre eux ? Un mot qu'on ne sait pas utiliser ne vaut rien. Ce module te montre comment les relier.</p></div>`; valider(); });
    exiger('Coche tes mots, puis valide.'); if (E.faits[E.step]) valider();
  }

  /* 3 · le déclic : vidéo (à venir) + 11 cartes */
  function cartes(){
    const a=D.phrasesA[S()][0], pres={pro:['needs','needed'],hotel:['wants','wanted'],luxe:['loves','loved'],tour:['visits','visited'],immo:['likes','liked']}[S()];
    return [
      ['Une phrase, trois blocs.', 'Une phrase anglaise répond toujours à trois questions, dans cet ordre : <b>qui ?</b> <b>fait quoi ?</b> <b>à quoi, à qui ?</b> C\'est le sujet, le verbe, le complément.', `<em>${a[0]} / ${a[1]} / ${a[2]}.</em><small>${a[3]} / ${a[4]} / ${a[5]}.</small>`],
      ['Tu le sais déjà.', 'C\'est le même ordre qu\'en français. Une grande partie de l\'anglais se comprend donc par logique, avant même de connaître tous les mots. Si tu reconnais le verbe, tu sais où est le sujet : juste avant.', ''],
      ['Le verbe porte le temps.', 'Dans les trois blocs, un seul dit <b>quand</b> : le verbe. C\'est lui qu\'on regarde pour savoir si l\'on parle du présent ou du passé.', `<em>${a[0]} ${pres[0]}…</em> (maintenant)<br><em>${a[0]} ${pres[1]}…</em> (avant)`],
      ['Deux temps, pas un de plus.', 'L\'anglais n\'a que deux temps : <b>T0</b>, le présent, et <b>T-1</b>, le passé (le prétérit). Tout ce que tu vas apprendre ensuite se place autour de ces deux points.', ''],
      ['Le code de T0 : <span class="code s">-s</span>', 'À T0, on prend la base du verbe (<em>work, want, love</em>). Avec <em>he, she, it</em>, ou un nom au singulier (<em>the guest, my boss</em>), on ajoute -s. Avec <em>I, you, we, they</em>, le code est là, mais il ne se voit pas. On écrit quand même (-s) entre parenthèses, pour dire « T0 ».', '<em>She works.</em> (-s)<br><em>They work.</em> (-s), code invisible'],
      ['Le code de T-1 : <span class="code ed">-ed</span>', 'À T-1, on ajoute -ed à la base, avec tous les sujets, sans exception. Si le verbe finit déjà par -e, on ajoute seulement -d.', '<em>I worked, she worked, they worked.</em><br><em>live → lived</em>'],
      ['Le code invisible.', 'Certains verbes cachent leur -ed : ce sont les irréguliers. Le code est là, simplement invisible. On ne les récite pas : on les rencontre, on les reconnaît, et ils restent.', '<em>went</em> = <em>go</em> + -ed · <em>bought</em> = <em>buy</em> + -ed · <em>ate</em> = <em>eat</em> + -ed'],
      ['Même BE suit la règle.', 'Le verbe le plus irrégulier de la langue garde ses codes.', '<em>am, is, are</em> = <em>be</em> + -s : T0<br><em>was, were</em> = <em>be</em> + -ed : T-1'],
      ['Sois cohérent.', 'Si tu commences au présent, continue au présent. Si tu commences au passé, reste au passé. C\'est la règle qui compte le plus pour être compris. Be logical, bro / sis.', '<em>Yesterday, I helped a family and they thanked me.</em>'],
      ['Tout tient sur la ligne.', 'Sur la Courbe complète, tu vois aussi T-2, T+1 et deux « aspects » : BE + -ING et HAVE + -EN. Ce ne sont pas de nouveaux temps : ils se posent sur T0 ou sur T-1. On les étudie dans les modules 4 à 7. Pour l\'instant, retiens qu\'ils existent et qu\'ils tiennent sur la même ligne.', ''],
      ['Ce que tu sais maintenant.', 'Dis ces trois phrases à voix haute.', '1. Une phrase, c\'est qui, fait quoi, à quoi.<br>2. Il n\'y a que deux temps : T0 et T-1.<br>3. -s, c\'est le code du présent ; -ed, celui du passé, même quand il est invisible.']
    ];
  }
  function declic(z){
    const K=cartes(); let i=0;
    z.append(el(`<p class="eyebrow">Temps 2 · Le déclic</p>
      <div class="video-bientot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="2.5" y="5" width="13" height="14" rx="3"/><path d="M15.5 10.2 21 7v10l-5.5-3.2"/></svg><span>La vidéo de Paul arrive bientôt ici. En attendant, tout est dans les cartes : une idée par carte.</span></div>
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
    exiger('Lis les onze cartes pour continuer.'); montre(); if (E.faits[E.step]) valider();
  }

  /* 4 · trois questions de contrôle */
  function controle(z){
    const Q=[
      ['<em>They work in Nice.</em> Quel temps, quel code ?', ['T0 (-s), code invisible avec they','T-1 (-ed)','Aucun code'], 0, 'Carte 5 : avec <em>I, you, we, they</em>, le code -s est là, mais il ne se voit pas.'],
      ['<em>She bought a gift.</em> Quel temps ?', ['T0 (-s)','T-1 (-ed), code invisible','On ne peut pas savoir'], 1, 'Carte 7 : <em>bought</em> = <em>buy</em> + -ed. Le code est invisible, mais il est là.'],
      ['<em>I visit the museum and I loved it.</em> Qu\'est-ce qui ne va pas ?', ['Il manque un -s','L\'ordre des mots','La cohérence : deux temps différents'], 2, 'Carte 9 : tu commences au présent, tu continues au présent. Be logical.']];
    z.append(el(`<p class="eyebrow">Temps 2 · Contrôle</p><h1>Trois questions, pour que rien ne reste flou.</h1><div id="qs"></div>`));
    const qs=z.querySelector('#qs'); let bons=0;
    Q.forEach(([q,ch,b,ex],n)=>{ const d=el(`<div class="exo"><p class="phrase">${q}</p><div class="choix">${ch.map((c,j)=>`<button class="puce" type="button" data-j="${j}">${c}</button>`).join('')}</div><div class="r"></div></div>`).firstChild; qs.append(d);
      d.querySelectorAll('.puce').forEach(p=>p.addEventListener('click',()=>{ if(d.dataset.fini) return; const j=+p.dataset.j;
        if (j===b){ p.classList.add('ok'); d.dataset.fini=1; d.querySelector('.r').innerHTML=OK('Exact.'); bons++; if(bons===Q.length) valider(); }
        else { p.classList.add('ko'); d.querySelector('.r').innerHTML=KO(ex); } })); });
    exiger('Réponds juste aux trois questions.'); if (E.faits[E.step]) valider();
  }

  /* 5 · vitre A : remettre les blocs dans l'ordre */
  function ordonner(cont, blocs, surFini){
    cont.innerHTML=`<div class="zone blocs" aria-label="Ta phrase"></div><div class="blocs reserve"></div>`;
    const zone=cont.querySelector('.zone'), res=cont.querySelector('.reserve'); let pose=[];
    melange(blocs.map((b,i)=>({b,i}))).forEach(({b,i})=>{ const x=document.createElement('button'); x.type='button'; x.className='bloc'; x.textContent=b; x.dataset.i=i; res.append(x); });
    cont.addEventListener('click',e=>{ const x=e.target.closest('.bloc'); if(!x||cont.dataset.fini) return;
      if (x.parentElement===res){ zone.append(x); pose.push(+x.dataset.i); } else { res.append(x); pose=pose.filter(v=>v!==+x.dataset.i); }
      if (pose.length===blocs.length){ if (pose.every((v,k)=>v===k)){ cont.dataset.fini=1; zone.querySelectorAll('.bloc').forEach((b,k)=>b.classList.add('r'+k)); surFini(true); }
        else surFini(false); } });
  }
  function vitreA(z){
    const P=D.phrasesA[S()]; let n=0;
    z.append(el(`<p class="eyebrow">Temps 3 · Vitre A</p><h1>Qui, fait quoi, à quoi.</h1><p>Touche les blocs dans le bon ordre pour construire la phrase. Touche un bloc posé pour le retirer.</p><div id="v"></div><div id="r"></div>`));
    const v=z.querySelector('#v'), r=z.querySelector('#r');
    const suivante=()=>{ const p=P[n]; r.innerHTML=''; const box=document.createElement('div'); box.className='exo'; box.innerHTML=`<span class="compteur">Phrase ${n+1} / ${P.length}</span><div class="o"></div>`; v.innerHTML=''; v.append(box);
      ordonner(box.querySelector('.o'), p.slice(0,3), ok=>{ if(!ok){ r.innerHTML=KO('Pas tout à fait. Qui fait l\'action ? Commence par lui.'); return; }
        r.innerHTML=`<div class="retour-msg ok"><p>Bravo. En français, dans le même ordre :</p><div class="trad"><span>${p[3]}</span><span>${p[4]}</span><span>${p[5]}</span></div><p>Tu vois ? Le même ordre. Tu le savais déjà.</p></div>`;
        if (n<P.length-1){ const b=el(`<button class="btn plein" type="button">Phrase suivante</button>`).firstChild; r.append(b); b.addEventListener('click',()=>{ n++; suivante(); }); } else valider(); }); };
    exiger('Construis les trois phrases.'); suivante(); if (E.faits[E.step]) valider();
  }

  /* 6 · vitre B : la Courbe complète */
  function vitreB(z){
    const P=D.phrasesA[S()], V=D.verbesA[S()]; const vus=new Set();
    z.append(el(`<p class="eyebrow">Temps 3 · Vitre B</p><h1>Tout tient sur une ligne.</h1>
      <p>Voici toute la Courbe. Pour l'instant, seuls <b>T-1</b> et <b>T0</b> sont actifs : touche-les. Touche aussi le reste, par curiosité.</p>
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
    z.querySelectorAll('.pt').forEach(g=>{ const go=()=>{ z.querySelectorAll('.pt').forEach(x=>x.classList.remove('actif')); g.classList.add('actif'); const k=g.dataset.p;
      if (k==='t0'){ posee.innerHTML=phrase(P[0],V[0],'s'); r.innerHTML=OK('T0, le présent : le code <b>-s</b> s\'allume sur le verbe.'); vus.add(k); }
      else if (k==='t-1'){ const inv=V[2][2]; posee.innerHTML=phrase(P[2],V[2],'ed'); r.innerHTML=OK(inv?`T-1, le passé : <em>${P[2][1]}</em> = <em>${V[2][0]}</em> + -ed. Le code est invisible, mais il est là (en pointillé).`:'T-1, le passé : le code <b>-ed</b> s\'allume sur le verbe.'); vus.add(k); }
      else { posee.innerHTML=''; r.innerHTML=`<div class="bulle-lam">${AV}<div class="txt">Patience, on zoome là-dessus plus tard. Retiens juste que ça existe, et que ça tient sur la même ligne.</div></div>`; }
      if (vus.size===2){ r.insertAdjacentHTML('beforeend','<div class="retour-msg info"><b>Voici la base de tout.</b> La fondation digne de n\'importe quel <em>skyscraper</em>.</div>'); valider(); } };
      g.addEventListener('click',go); g.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } }); });
    exiger('Touche T0 et T-1.'); if (E.faits[E.step]) valider();
  }

  /* 7-9 · écoute */
  const lignes = () => D.ecoute[S()].lignes;
  const nu = t => t.replace(/\{([^|}]+)\|[^}]+\}/g,'$1');
  function lireTout(btn, fin){ const L=lignes(); let k=0; btn.disabled=true;
    const un=()=>{ if(k>=L.length){ btn.disabled=false; fin&&fin(); return; } const ok=dire(L[k][1], k%2, ()=>{ k++; setTimeout(un,250); }); if(!ok){ btn.disabled=false; fin&&fin(false); } }; un(); }
  function ecoute1(z){
    const Ec=D.ecoute[S()]; let bons=0;
    z.append(el(`<p class="eyebrow">Temps 4 · L'écoute · 1 / 3</p><h1>Écoute, sans le texte.</h1>
      <p>Un dialogue d'une minute, un peu au-dessus de ton niveau. C'est voulu : tu comprends grâce au contexte. Écoute autant de fois que tu veux, puis réponds.</p>
      <button class="btn plein lecture" id="ec" type="button"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>Écouter le dialogue</button>
      <p class="provisoire" id="voixnote">Voix provisoire : les enregistrements avec deux voix américaines arrivent bientôt.</p>
      <div id="qs"></div>`));
    z.querySelector('#ec').addEventListener('click',e=>lireTout(e.currentTarget, ok=>{ if(ok===false) z.querySelector('#voixnote').textContent='Ton navigateur ne lit pas l\'audio : lis le dialogue à l\'étape suivante, puis reviens répondre.'; }));
    const qs=z.querySelector('#qs');
    Ec.q.forEach(([q,ch,b])=>{ const d=el(`<div class="exo"><p class="phrase">${q}</p><div class="choix">${ch.map((c,j)=>`<button class="puce" type="button" data-j="${j}">${c}</button>`).join('')}</div></div>`).firstChild; qs.append(d);
      d.querySelectorAll('.puce').forEach(p=>p.addEventListener('click',()=>{ if(d.dataset.fini) return; if(+p.dataset.j===b){ p.classList.add('ok'); d.dataset.fini=1; if(++bons===Ec.q.length) valider(); } else p.classList.add('ko'); })); });
    exiger('Réponds aux deux questions.'); if (E.faits[E.step]) valider();
  }
  function ecoute2(z){
    const L=lignes(); let total=0, vus=0;
    const tx = t => t.replace(/\{([^|}]+)\|([^|}]+)(\|inv)?\}/g,(m,mot,c,inv)=>{ total++; return `<span class="mc v" data-c="${c}" data-inv="${inv?1:''}" role="button" tabindex="0">${mot}</span>`; });
    z.append(el(`<p class="eyebrow">Temps 4 · L'écoute · 2 / 3</p><h1>Repère les codes.</h1>
      <p>Le texte s'affiche. Touche chaque verbe souligné en pointillé : son code apparaît au-dessus.</p>
      <div class="dialogue">${L.map(([q,t])=>`<div class="replique"><b>${q}</b><span class="tx">${tx(esc(t).replace(/&#39;/g,"'"))}</span></div>`).join('')}</div>
      <p class="compteur" id="cpt"></p>`));
    const cpt=z.querySelector('#cpt'); const majc=()=>cpt.textContent=`${vus} / ${total} codes trouvés`; majc();
    z.querySelectorAll('.v').forEach(v=>{ const go=()=>{ if(v.classList.contains('vu')) return; v.classList.add('vu'); const c=v.dataset.c, inv=v.dataset.inv;
      v.insertAdjacentHTML('beforeend',`<span class="etq ${c}${inv?' inv':''}">-${c}</span>`); vus++; majc(); if(vus===total) valider(); };
      v.addEventListener('click',go); v.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } }); });
    z.append(el(`<p class="doux petit">En pointillé : le code invisible. <em>Did</em> = <em>do</em> + -ed, <em>saw</em> = <em>see</em> + -ed, <em>left</em> = <em>leave</em> + -ed.</p>`));
    exiger('Touche tous les verbes soulignés.'); if (E.faits[E.step]) valider();
  }
  function ecoute3(z){
    const L=lignes(); const faits=new Set();
    z.append(el(`<p class="eyebrow">Temps 4 · L'écoute · 3 / 3</p><h1>Répète, phrase par phrase.</h1>
      <p>Écoute une réplique, puis répète-la à voix haute, en imitant le rythme. Exagère : comme au théâtre.</p>
      <div class="dialogue">${L.map(([q,t],k)=>`<div class="replique"><button class="btn lecture" type="button" data-k="${k}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>${q}</button><span class="tx">${esc(nu(t)).replace(/&#39;/g,"'")}</span></div>`).join('')}</div>
      <button class="btn" id="fini" type="button">J'ai répété les ${L.length} répliques</button>`));
    z.querySelectorAll('[data-k]').forEach(b=>b.addEventListener('click',()=>{ speechSynthesis&&speechSynthesis.cancel(); dire(L[+b.dataset.k][1], +b.dataset.k%2); faits.add(b.dataset.k); }));
    z.querySelector('#fini').addEventListener('click',()=>{ valider(); suiv.click(); });
    exiger('Répète les répliques, puis confirme.'); if (E.faits[E.step]) valider();
  }

  /* 10-12 · le code */
  function serie1(z){
    const P=D.ordre[S()]; let n=0;
    z.append(el(`<p class="eyebrow">Temps 5 · Le code · série 1</p><h1>Remets dans l'ordre.</h1><p>Comme la vitre A, mais sans les couleurs.</p><div id="v"></div><div id="r"></div>`));
    const v=z.querySelector('#v'), r=z.querySelector('#r');
    const go=()=>{ v.innerHTML=`<div class="exo"><span class="compteur">Phrase ${n+1} / ${P.length}</span><div class="o"></div></div>`; r.innerHTML='';
      ordonner(v.querySelector('.o'), P[n], ok=>{ if(!ok){ r.innerHTML=KO('Qui fait l\'action ? Le qui vient d\'abord, puis le verbe.'); return; }
        r.innerHTML=OK('Juste.'); if(n<P.length-1){ setTimeout(()=>{ n++; go(); },700); } else { r.innerHTML=OK('Les cinq phrases sont justes.'); valider(); } }); };
    exiger('Remets les cinq phrases dans l\'ordre.'); go(); if (E.faits[E.step]) valider();
  }
  function serie2(z){
    const P=melange(D.courbe[S()]); let n=0, fautes=0;
    z.append(el(`<p class="eyebrow">Temps 5 · Le code · série 2</p><h1>T0 ou T-1 ?</h1><p>Place chaque phrase sur la Courbe. Regarde le verbe : c'est lui qui porte le temps.</p><div class="exo"><span class="compteur" id="c"></span><p class="phrase" id="ph"></p><div class="choix"><button class="puce" type="button" data-t="1">T-1 <span class="code ed">-ed</span></button><button class="puce" type="button" data-t="0">T0 <span class="code s">-s</span></button></div><div id="r"></div></div>`));
    const ph=z.querySelector('#ph'), r=z.querySelector('#r'), c=z.querySelector('#c');
    const go=()=>{ c.textContent=`Phrase ${n+1} / ${P.length}`; ph.textContent=P[n][0]; r.innerHTML=''; z.querySelectorAll('[data-t]').forEach(b=>b.className='puce'); };
    z.querySelectorAll('[data-t]').forEach(b=>b.addEventListener('click',()=>{ if(n>=P.length) return; const [p,t,inv]=P[n];
      if (+b.dataset.t===t){ b.classList.add('ok'); r.innerHTML=OK(t ? (inv?'T-1 (-ed), code invisible : un irrégulier.':'T-1 (-ed).') : (/^(I|You|We|They)\b/.test(p)?'T0 (-s), code invisible.':'T0 (-s).'));
        setTimeout(()=>{ n++; if(n<P.length) go(); else { r.innerHTML=OK(`Fini${fautes?`, avec ${fautes} hésitation${fautes>1?'s':''}`:', sans faute'}.`); valider(); } },800); }
      else { fautes++; b.classList.add('ko'); r.innerHTML=KO(t ? (inv?'Regarde bien le verbe : c\'est un irrégulier, son -ed est invisible.':'Il y a un -ed sur le verbe : c\'est le passé.') : 'Le verbe est à la base ou avec un -s : c\'est le présent.'); } }));
    exiger('Place les huit phrases.'); go(); if (E.faits[E.step]) valider();
  }
  function serie3(z){
    const P=D.erreurs; let n=0;
    z.append(el(`<p class="eyebrow">Temps 5 · Le code · série 3</p><h1>Trouve l'erreur.</h1><p>Ce sont les erreurs que font vraiment les élèves. Choisis la bonne version.</p><div class="exo"><span class="compteur" id="c"></span><p class="phrase" id="ph"></p><div class="choix" id="ch"></div><div id="r"></div></div>`));
    const go=()=>{ const [p,ch]=P[n]; z.querySelector('#c').textContent=`Phrase ${n+1} / ${P.length}`; z.querySelector('#ph').innerHTML=`<s>${esc(p)}</s>`; z.querySelector('#r').innerHTML='';
      const box=z.querySelector('#ch'); box.innerHTML=ch.map((c,j)=>`<button class="puce" type="button" data-j="${j}">${esc(c)}</button>`).join('');
      box.querySelectorAll('.puce').forEach(b=>b.addEventListener('click',()=>{ if(box.dataset.fini==n) return; const ok=+b.dataset.j===P[n][2];
        b.classList.add(ok?'ok':'ko'); z.querySelector('#r').innerHTML=(ok?OK:KO)(P[n][3]);
        if(ok){ box.dataset.fini=n; setTimeout(()=>{ n++; if(n<P.length) go(); else { z.querySelector('#r').innerHTML=OK('Les cinq erreurs sont corrigées. Ce sont les plus fréquentes : tu les repéreras maintenant partout.'); valider(); } },1400); } })); };
    exiger('Corrige les cinq phrases.'); go(); if (E.faits[E.step]) valider();
  }

  /* 13 · ma version, corrigée par le lamantin */
  function maVersion(z){
    z.append(el(`<p class="eyebrow">Temps 6 · Ma version</p><h1>Présente-toi.</h1>
      <p>En 4 à 5 phrases : qui tu es, ce que tu fais au travail (T0), une chose que tu aimes, et une chose que tu as faite hier (T-1). Pas de dictionnaire pour l'instant : utilise les mots que tu as.</p>
      <details><summary class="doux petit">Voir un exemple</summary><p class="texte-ref">${esc(D.exemple[S()])}</p></details>
      <div class="chat" id="chat"><div class="chat-tete">${AV}<div><b>Le lamantin</b><small>Il corrige la forme, jamais ce que tu racontes.</small></div></div></div>
      <div class="saisie-chat"><textarea id="t" rows="3" placeholder="My name is…" aria-label="Ta présentation"></textarea><button class="envoyer" id="env" type="button" aria-label="Envoyer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button></div>
      <p class="provisoire">Correcteur provisoire : il vérifie ce que le module 1 enseigne (l'ordre, les codes, la cohérence, l'âge). La version complète, dans la voix de Paul, arrive bientôt.</p>`));
    const chat=z.querySelector('#chat'), t=z.querySelector('#t'), env=z.querySelector('#env');
    const msg=(qui,html)=>{ const d=document.createElement('div'); d.className='msg '+qui; d.innerHTML=html; chat.append(d); chat.scrollTop=chat.scrollHeight; return d; };
    let essais={}, phrasesOk=0;
    msg('lui','Hi! Vas-y, présente-toi. Je regarde juste l\'ordre de tes phrases et leurs codes. Le reste, on s\'en occupe plus tard.');
    if (E.version){ t.value=E.version; }
    env.addEventListener('click',()=>{ const txt=t.value.trim(); if(!txt) return; E.version=txt; sauver(); msg('moi',esc(txt)); t.value='';
      const ph=C.phrases(txt); let fautes=[];
      ph.forEach(p=>{ const a=C.analyser(p); if(a&&a.type!=='ok'){ essais[p]=(essais[p]||0)+1; fautes.push([p,a]); } });
      setTimeout(()=>{
        if (ph.length<4){ msg('lui',`J'ai ${ph.length} phrase${ph.length>1?'s':''}. Il m'en faut au moins 4 : qui tu es, ton travail, ce que tu aimes, et hier.`); }
        if (!fautes.length){ if (ph.length>=4){ msg('lui','Nice job! Tes deux temps sont justes, et tes phrases sont dans le bon ordre. Toute la suite se construit là-dessus.'); valider(); } return; }
        fautes.forEach(([p,a])=>{ const deuxieme = (Object.keys(essais).some(k=>essais[k]>1)) || (a.type==='calque');
          if (!deuxieme) msg('lui', `« ${esc(p)} »\n${a.indice}\nCorrige et renvoie tout le texte.`);
          else msg('lui', `« ${esc(p)} »\n${a.indice}<span class="fix">${esc(a.bon)}</span>${a.code?`<span class="cd">${esc(a.code)}</span>`:''}`); });
        const types=[...new Set(fautes.map(f=>f[1].type))]; E.erreurs=(E.erreurs||[]).concat(types); sauver();
        if (Object.values(essais).some(n=>n>=2) && ph.length>=4){ msg('lui','On garde ces points pour ton prochain point avec le tuteur. Tu peux continuer : le module est validé.'); valider(); }
      },500); });
    t.addEventListener('keydown',e=>{ if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){ e.preventDefault(); env.click(); } });
    exiger('Écris ta présentation et envoie-la au lamantin.'); if (E.faits[E.step]) valider();
  }

  /* 14 · conversation scénarisée avec le lamantin */
  function conversation(z){
    const [role, Q] = D.role[S()]; let k=0, bilan={ok:0,fautes:[]};
    z.append(el(`<p class="eyebrow">Temps 7 · Le lamantin</p><h1>Cinq minutes de vraie conversation.</h1>
      <p>Le lamantin joue <b>${role}</b>. Réponds en anglais, avec T0 et T-1. S'il ne comprend pas, reformule : c'est comme ça qu'on progresse.</p>
      <div class="chat" id="chat"><div class="chat-tete">${AV}<div><b>Le lamantin</b><small>joue ${role}</small></div></div></div>
      <div class="saisie-chat"><textarea id="t" rows="2" placeholder="Ta réponse…" aria-label="Ta réponse"></textarea><button class="envoyer" id="env" type="button" aria-label="Envoyer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button></div>
      <p class="provisoire">Conversation guidée provisoire. La version libre, où le lamantin comprend vraiment tes réponses, arrive avec le correcteur IA.</p>`));
    const chat=z.querySelector('#chat'), t=z.querySelector('#t'), env=z.querySelector('#env');
    const msg=(qui,html)=>{ const d=document.createElement('div'); d.className='msg '+qui; d.innerHTML=html; chat.append(d); chat.scrollTop=chat.scrollHeight; };
    const ecrit=(f)=>{ const d=document.createElement('div'); d.className='ecrit'; d.textContent='Le lamantin écrit…'; chat.append(d); chat.scrollTop=chat.scrollHeight; setTimeout(()=>{ d.remove(); f(); },900); };
    ecrit(()=>msg('lui',esc(Q[0])));
    env.addEventListener('click',()=>{ const txt=t.value.trim(); if(!txt||k>=Q.length) return; msg('moi',esc(txt)); t.value='';
      const ph=C.phrases(txt); const f=ph.map(p=>[p,C.analyser(p)]).find(([,a])=>a&&a.type!=='ok');
      if (txt.split(/\s+/).length<3 && !f){ ecrit(()=>msg('lui','Sorry, you mean…? Tell me a bit more, with a full sentence.')); return; }
      if (f){ bilan.fautes.push(f); } else bilan.ok++;
      k++;
      ecrit(()=>{ const reprise = f ? `${['Oh, ','Ah, ','OK, '][k%3]}${esc(f[1].bon)} Got it!\n` : ['Nice!\n','Great.\n','Cool.\n','I see.\n'][k%4];
        if (k<Q.length) msg('lui', reprise + esc(Q[k]));
        else { msg('lui', reprise + 'Thanks, that was great!');
          setTimeout(()=>{ const f0=bilan.fautes[0]; msg('lui', `Bilan ! ${bilan.ok>=3?'Tes phrases à T0 et T-1 sont nickel, tu te fais très bien comprendre.':'Tu t\'es fait comprendre à chaque réponse, c\'est l\'essentiel.'}${f0?`\nUne seule chose à surveiller : « ${esc(f0[0])} » → ${esc(f0[1].bon)}${f0[1].code?` (${esc(f0[1].code)})`:''}. Be logical.`:'\nAucune erreur de code. Spit it, bro / sis : tu es prêt pour le module 2.'}`); valider(); },900); } }); });
    t.addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); env.click(); } });
    exiger('Réponds aux cinq messages du lamantin.'); if (E.faits[E.step]) valider();
  }

  /* 15 · trois fois plus vite */
  function fluidite(z){
    const texte = E.version || D.exemple[S()]; const durees=[90,60,45]; let n=0; const audios=[];
    z.append(el(`<p class="eyebrow">Temps 8 · Trois fois plus vite</p><h1>La même chose, trois fois, de plus en plus vite.</h1>
      <p>Redis ta présentation à voix haute. D'abord en 90 secondes, puis en 60, puis en 45. Mêmes mots, plus d'aisance. Essaie de ne pas lire.</p>
      <div class="texte-ref">${esc(texte)}</div>
      <div class="chrono"><span class="tps" id="tps">90</span><button class="btn plein" id="go" type="button">Essai 1 · 90 s</button><button class="btn" id="stop" type="button" hidden>J'ai fini</button></div>
      <div class="essais">${durees.map(d=>`<span>${d} s</span>`).join('')}</div>
      <p class="doux petit">Exagère les sons. Comme au théâtre.</p><div id="aud"></div>
      <p class="provisoire" id="note">Si tu l'autorises, chaque essai est enregistré sur cet appareil pour que tu puisses t'écouter. Ils seront transmis au tuteur quand l'espace en ligne ouvrira.</p>`));
    const tps=z.querySelector('#tps'), go=z.querySelector('#go'), stop=z.querySelector('#stop'), aud=z.querySelector('#aud');
    let flux=null, rec=null, it=null;
    const terminer=()=>{ clearInterval(it); stop.hidden=true; if(rec&&rec.state!=='inactive') rec.stop(); z.querySelectorAll('.essais span')[n].classList.add('fait'); n++;
      if(n<durees.length){ go.hidden=false; go.textContent=`Essai ${n+1} · ${durees[n]} s`; tps.textContent=durees[n]; } else { go.hidden=true; tps.textContent='✓'; valider(); if(flux) flux.getTracks().forEach(t=>t.stop()); } };
    go.addEventListener('click',async()=>{ go.hidden=true; stop.hidden=false; let t=durees[n]; tps.textContent=t;
      try{ if(!flux && navigator.mediaDevices) flux=await navigator.mediaDevices.getUserMedia({audio:true});
        if(flux && window.MediaRecorder){ const morceaux=[]; rec=new MediaRecorder(flux); rec.ondataavailable=e=>morceaux.push(e.data);
          const num=n+1; rec.onstop=()=>{ const u=URL.createObjectURL(new Blob(morceaux,{type:rec.mimeType})); audios.push(u); aud.insertAdjacentHTML('beforeend',`<p class="petit">Essai ${num} : <audio controls src="${u}"></audio></p>`); }; rec.start(); } }
      catch(e){ z.querySelector('#note').textContent='Micro non autorisé : fais l\'exercice à voix haute, sans enregistrement.'; }
      it=setInterval(()=>{ t--; tps.textContent=t; if(t<=0) terminer(); },1000); });
    stop.addEventListener('click',terminer);
    exiger('Fais les trois essais.'); if (E.faits[E.step]) valider();
  }

  /* 16 · fin */
  function fin(z){
    E.fini=true; sauver(); maj();
    z.append(el(`<p class="eyebrow">Module 1 · terminé</p><h1>Tout l'anglais tient sur une ligne. Tu l'as vu.</h1>
      <p>Tu sais maintenant lire une phrase par sa structure, placer un verbe sur T0 ou T-1, et reconnaître ses codes, même invisibles.</p>
      <div class="retour-msg info"><b>Les trois phrases à garder :</b><br>1. Une phrase, c'est qui, fait quoi, à quoi.<br>2. Il n'y a que deux temps : T0 et T-1.<br>3. -s, c'est le code du présent ; -ed, celui du passé, même quand il est invisible.</div>
      <p class="doux">Prochain module : <b>T0, le temps le plus simple</b>. On zoome sur le présent, et sur <em>do / does</em> pour poser des questions.</p>
      <p style="font-size:20px;font-weight:500">Be logical. Now, spit it.</p>`));
  }

  // reprise là où l'élève s'était arrêté
  aller(E.sect ? Math.min(E.step, E.max) : 0);
})();
