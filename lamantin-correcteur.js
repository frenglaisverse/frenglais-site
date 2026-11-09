/* Correcteur provisoire du lamantin (module 1) : règles locales, sans IA.
   Il vérifie seulement ce que le module 1 enseigne : ordre sujet-verbe-complément,
   code -s à T0 (he / she / it), code -ed à T-1, cohérence des temps, et le calque « I have 28 years ».
   La version IA, dans la voix de Paul, le remplacera. */
(function(){
  // base : [passé, 3e personne] — les irréguliers sont notés en entier
  const IRR = {be:['was','is'],have:['had','has'],do:['did','does'],go:['went','goes'],get:['got','gets'],make:['made','makes'],take:['took','takes'],
    come:['came','comes'],see:['saw','sees'],know:['knew','knows'],think:['thought','thinks'],give:['gave','gives'],find:['found','finds'],tell:['told','tells'],
    say:['said','says'],buy:['bought','buys'],bring:['brought','brings'],eat:['ate','eats'],drink:['drank','drinks'],drive:['drove','drives'],write:['wrote','writes'],
    read:['read','reads'],speak:['spoke','speaks'],leave:['left','leaves'],meet:['met','meets'],pay:['paid','pays'],sell:['sold','sells'],send:['sent','sends'],
    spend:['spent','spends'],feel:['felt','feels'],keep:['kept','keeps'],lose:['lost','loses'],begin:['began','begins'],choose:['chose','chooses'],
    sleep:['slept','sleeps'],swim:['swam','swims'],run:['ran','runs'],sit:['sat','sits'],stand:['stood','stands'],understand:['understood','understands'],
    teach:['taught','teaches'],learn:['learned','learns'],build:['built','builds'],put:['put','puts'],cut:['cut','cuts'],win:['won','wins'],fly:['flew','flies'],
    wear:['wore','wears'],grow:['grew','grows'],hear:['heard','hears'],hold:['held','holds'],lead:['led','leads'],ride:['rode','rides'],sing:['sang','sings'],
    show:['showed','shows'],become:['became','becomes'],forget:['forgot','forgets'],break:['broke','breaks'],catch:['caught','catches'],fall:['fell','falls'],
    wake:['woke','wakes'],shut:['shut','shuts'],set:['set','sets'],let:['let','lets'],hit:['hit','hits'],cost:['cost','costs']};
  const REG = ('work like love live want need call ask help play watch walk talk start finish visit open close cook clean travel study stay wait answer '+
    'book check serve welcome manage advise prefer enjoy hate move change use try arrive listen look plan sign order wrap paint miss save reach '+
    'organize prepare present deliver explain improve include renovate share stop wish hope decide dance relax rent rest return phone email text fix '+
    'smile laugh shop pick pack land drop film edit design develop learn earn add face fit need').split(' ');
  const V = {};   // forme → {base, t:'base'|'s'|'ed'}
  const reg3 = b => /(s|sh|ch|x|o)$/.test(b) ? b+'es' : /[^aeiou]y$/.test(b) ? b.slice(0,-1)+'ies' : b+'s';
  const regEd = b => /e$/.test(b) ? b+'d' : /[^aeiou]y$/.test(b) ? b.slice(0,-1)+'ied' : /^(stop|plan|drop|shop|travel)$/.test(b) ? (b==='travel'?'traveled':b+b.slice(-1)+'ed') : b+'ed';
  for (const b of REG){ V[b]={base:b,t:'base'}; V[reg3(b)]={base:b,t:'s'}; V[regEd(b)]={base:b,t:'ed',reg:true}; }
  for (const [b,[p,s]] of Object.entries(IRR)){ V[b]={base:b,t:'base'}; V[s]={base:b,t:'s'}; V[p]={base:b,t:'ed'}; }
  V.am={base:'be',t:'s'}; V.are={base:'be',t:'s'}; V.is={base:'be',t:'s'}; V.were={base:'be',t:'ed'};
  // formes régularisées par erreur : buyed, eated, goed…
  const FAUX = {}; for (const [b,[p]] of Object.entries(IRR)) FAUX[regEd(b)] = {base:b, bon:p};
  const PASSE = /\b(yesterday|last (night|week|month|year|summer|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|ago|this morning)\b/i;
  const SUJ3 = /^(he|she|it|my \w+|the \w+|this \w+|our \w+|his \w+|her \w+)$/i;
  const PRON = /^(i|you|we|they|he|she|it)$/i;

  function analyser(phrase){
    const brut = phrase.trim(); if (!brut) return null;
    const mots = brut.replace(/[.!?]+$/,'').split(/\s+/);
    const bas = mots.map(m=>m.toLowerCase().replace(/[^a-z']/g,''));
    // calque : I have 28 years
    const age = /\b(i|he|she|we|they|you)\s+(have|has)\s+(\d+)\s+years?\b(?!\s+old)/i.exec(brut);
    if (age){ const be = {i:'am',he:'is',she:'is'}[age[1].toLowerCase()]||'are';
      return {type:'calque', indice:"En anglais, on ne possède pas son âge : on l'est.", bon: brut.replace(age[0], `${age[1]} ${be} ${age[3]}`)}; }
    // verbe en tête suivi d'un pronom : Work I in a hotel
    if (bas.length>2 && V[bas[0]] && PRON.test(bas[1]) && !/^(do|does|did|is|are|am|was|were|have|has)$/.test(bas[0]))
      return {type:'ordre', indice:"Qui fait quoi ? Le qui vient d'abord.", bon: cap(mots[1])+' '+mots[0].toLowerCase()+' '+mots.slice(2).join(' ')+fin(brut)};
    // irrégulier régularisé : buyed
    for (let i=0;i<bas.length;i++) if (FAUX[bas[i]]) { const f=FAUX[bas[i]];
      return {type:'invisible', indice:"Bonne logique, mauvais verbe : celui-là cache son -ed.", bon: remplace(mots,i,f.bon)+fin(brut), code:`${f.bon} = ${f.base} + -ed`}; }
    // repérer les verbes conjugués (on saute les verbes après to / can / will / did / do…)
    const verbes=[]; for (let i=0;i<bas.length;i++){ const v=V[bas[i]]; if(!v) continue;
      const avant=bas[i-1]||''; if (/^(to|can|could|will|would|should|must|might|may|did|do|does|don't|didn't|doesn't|not)$/.test(avant)) continue;
      if (i===0 && !PRON.test(avant)) { if (v.t!=='base'||bas.length<2) continue; }
      verbes.push({i,...v}); }
    if (!verbes.length) return {type:'ok'};
    const passe = PASSE.test(brut);
    // T-1 marqué mais verbe au présent
    if (passe) for (const v of verbes) if (v.t!=='ed'){ const p=passeDe(v.base);
      return {type:'ed', indice:`« ${PASSE.exec(brut)[0]} » : on est à T-1. Quel code pour ${mots[v.i]} ?`, bon: remplace(mots,v.i,p)+fin(brut), code: IRR[v.base]?`${p} = ${v.base} + -ed (code invisible)`:`${p} (-ed)`}; }
    // T0, troisième personne sans -s
    for (const v of verbes){ if (v.t!=='base') continue; const suj = sujetAvant(bas, v.i);
      if (suj && SUJ3.test(suj) && !/^(people|they|we|you|i)$/.test(suj)) { const s3 = IRR[v.base]?IRR[v.base][1]:reg3(v.base);
        if (v.base==='be') continue;
        return {type:'s', indice:`T0, troisième personne : il manque quelque chose sur « ${mots[v.i]} ».`, bon: remplace(mots,v.i,s3)+fin(brut), code:`${s3} (-s)`}; } }
    // cohérence : passé et présent mélangés dans la même phrase, sans repère de temps
    const aPasse = verbes.some(v=>v.t==='ed'), aPres = verbes.some(v=>v.t!=='ed');
    if (aPasse && aPres && !passe && /\band\b/i.test(brut)){ const premier=verbes[0];
      const cible = verbes.find(v=>(v.t==='ed')!==(premier.t==='ed'));
      const forme = premier.t==='ed' ? passeDe(cible.base) : (sujetAvant(bas,cible.i)&&SUJ3.test(sujetAvant(bas,cible.i))? (IRR[cible.base]?IRR[cible.base][1]:reg3(cible.base)) : cible.base);
      return {type:'coherence', indice:`Tu as commencé ${premier.t==='ed'?'au passé':'au présent'}. Be logical.`, bon: remplace(mots,cible.i,forme)+fin(brut)}; }
    return {type:'ok'};
  }
  const passeDe = b => IRR[b] ? IRR[b][0] : regEd(b);
  const sujetAvant = (bas,i) => { const a=bas[i-1]||'', b=bas[i-2]||''; if (!a) return '';
    if (/^(always|usually|often|never|sometimes|also|really)$/.test(a)) return sujetAvant(bas,i-1);
    if (/^(my|the|this|our|his|her|your|their)$/.test(b)) return b+' '+a; return a; };
  const remplace = (mots,i,f) => mots.map((m,j)=>j===i ? (m[0]===m[0].toUpperCase()&&j===0?cap(f):f) : m).join(' ').replace(/[.!?]+$/,'');
  const fin = s => (/[.!?]$/.test(s.trim()) ? s.trim().slice(-1) : '.');
  const cap = s => s.charAt(0).toUpperCase()+s.slice(1);
  window.Correcteur = { analyser, phrases: t => t.split(/(?<=[.!?])\s+|\n+/).map(s=>s.trim()).filter(Boolean) };
})();
