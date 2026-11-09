/* écran d'ouverture (une fois par visite), puis la Courbe se dessine */
(function ouverture(){
  const o=document.getElementById('ouverture'), piste=document.getElementById('piste');
  const scene=document.getElementById('scene');
  let pret=false, vue=false;
  const lancer=()=>{ if(pret&&vue){ scene.classList.add('vue'); setTimeout(()=>{ if(piste) piste.classList.add('dessin'); },500); } };
  const dessiner=()=>{ pret=true; lancer(); };
  if(scene&&'IntersectionObserver' in window){ const io=new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting)){ vue=true; io.disconnect(); lancer(); } },{threshold:.12}); io.observe(scene); } else vue=true;
  // si la scène est plus haute que l'écran, elle s'arrête quand son bas atteint le bas de l'écran
  const caler=()=>{ if(scene) scene.style.top=Math.min(0,innerHeight-scene.offsetHeight)+'px'; };
  caler(); addEventListener('resize',caler);
  let vu=false; try{ vu=sessionStorage.getItem('frg-ouverture')==='1'; sessionStorage.setItem('frg-ouverture','1'); }catch(e){}
  if(/[?&]ouverture\b/.test(location.search)) vu=false;   // frenglais.co/?ouverture : rejouer l'écran d'ouverture
  const calme=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!o||vu||calme){ if(o) o.remove(); dessiner(); return; }
  document.body.style.overflow='hidden';
  setTimeout(()=>{ o.classList.add('fin'); document.body.style.overflow=''; setTimeout(()=>{ o.remove(); },450); dessiner(); },2400);
})();

/* ---------- démo : toucher une vitre ---------- */
(function demo(){
  const verbes = [
    { base:'jump', s:['jump','s'], ed:['jump','ed'] },
    { base:'live', s:['live','s'], ed:['live','d'] },
    { base:'eat',  s:['eat','s'],  ed:['ate',''],  why:'ate = eat + ed' },
    { base:'go',   s:['go','es'],  ed:['went',''], why:'went = go + ed' },
    { base:'have', s:['ha','s'],   ed:['had',''],  why:'had = have + ed' }
  ];
  let vitre = 'none', v = 0;
  const lab = document.getElementById('demo-lab'), phrase = document.getElementById('demo-phrase'),
        note = document.getElementById('demo-note'), zone = document.getElementById('verbes');
  if (!zone) return;
  zone.innerHTML = verbes.map((x,i)=>`<button type="button" data-v="${i}" aria-pressed="${i===0}">${x.base}</button>`).join('');
  function rendu(){
    const r = verbes[v];
    let sujet = 'I', forme = r.base, code = '', fantome = false, n = '';
    if (vitre === 's'){ sujet = 'She'; forme = r.s[0]; code = r.s[1]; if (r.base==='have') n = 'Même have garde son code : has = ha + -s.'; }
    if (vitre === 'ed'){ forme = r.ed[0]; code = r.ed[1]; if (!code){ fantome = true; n = 'Irrégulier : le code -ed est bien là, mais invisible. ' + r.why + '.'; } }
    lab.textContent = vitre==='s' ? 'T0 · présent · code -s' : vitre==='ed' ? 'T-1 · passé · code -ed' : 'Base verbale · touchez -ed ou -s';
    // le mot entier ; son code (-s / -ed) apparaît au-dessus, dans sa couleur
    const c = vitre==='s' ? 's' : 'ed';
    const mot = vitre==='none' ? forme : forme + `<span class="fin ${c}">${code}<span class="etiq ${c}${fantome?' fant':''}">-${c}</span></span>`;
    phrase.innerHTML = `<span>${sujet} <span class="mc">${mot}</span></span>`;
    note.textContent = n;
    document.querySelectorAll('[data-vitre]').forEach(b=>b.setAttribute('aria-pressed', b.dataset.vitre===vitre));
    zone.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed', +b.dataset.v===v));
  }
  document.querySelectorAll('[data-vitre]').forEach(b=>b.addEventListener('click',()=>{ vitre = vitre===b.dataset.vitre ? 'none' : b.dataset.vitre; rendu(); }));
  zone.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; v=+b.dataset.v; rendu(); });
  rendu();
})();

/* ---------- formulaire de devis ----------
   Envoi par Web3Forms : la clé est publique par conception, elle ne sert
   qu'à faire arriver le message dans la boîte e-mail liée au compte. */
const WEB3FORMS_KEY = '9c80d821-b9dd-4ced-b68f-da52bf63e6ad';
(function formulaire(){
  const f=document.getElementById('form-devis'); if(!f) return;
  const $=id=>document.getElementById(id);
  const etat=$('f-etat'), btn=$('f-envoyer');
  // les champs n'apparaissent que s'ils servent
  function maj(){
    const pro=$('p-pro').checked, ent=$('p-ent').checked;
    $('ligne-secteur').hidden=!(pro||ent);
    $('champ-effectif').hidden=!ent;
    $('champ-societe').hidden=!ent;
    $('champ-tel').hidden=!$('f-rappel').checked;
  }
  f.addEventListener('change',maj); maj();
  const dire=(txt,ok)=>{ etat.className='etat '+(ok?'ok':'ko'); etat.textContent=txt; };
  f.addEventListener('submit',async e=>{
    e.preventDefault(); etat.textContent='';
    const vide=[['f-nom','votre nom'],['f-email','votre e-mail'],['f-msg','votre besoin']].filter(([id])=>!$(id).value.trim());
    if($('f-rappel').checked&&!$('f-tel').value.trim()) vide.push(['f-tel','votre téléphone']);
    if(vide.length){ dire('Il manque '+vide.map(v=>v[1]).join(', ')+'.'); $(vide[0][0]).focus(); return; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('f-email').value.trim())){ dire('Cette adresse e-mail semble incomplète.'); $('f-email').focus(); return; }
    if(!$('f-accord').checked){ dire('Cochez la case d\'accord pour envoyer votre demande.'); return; }
    const d=Object.fromEntries([...new FormData(f).entries()].filter(([k,v])=>v!==''));
    if(d.botcheck) return;
    btn.disabled=true; btn.textContent='Envoi…';
    try{
      const r=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
        body:JSON.stringify({access_key:WEB3FORMS_KEY,subject:`Demande de devis · ${d.profil} · ${d.name}`,from_name:'Site Frenglais',...d})});
      const rep=await r.json().catch(()=>({}));
      if(!r.ok||rep.success===false) throw new Error();
      f.reset(); maj(); window.goatcounter&&goatcounter.count&&goatcounter.count({path:'devis-envoye',title:'devis envoyé',event:true}); dire('Demande envoyée. Votre devis personnalisé arrive très vite.',true);
    }catch(err){ dire('L\'envoi n\'a pas abouti. Réessayez, ou écrivez à contact@frenglais.co.'); }
    finally{ btn.disabled=false; btn.textContent='Envoyer ma demande'; }
  });
})();

/* ---------- coffrets : durée, détail, secteur ---------- */
(function coffrets(){
  const noms={part:{6:"L'Accéléré",16:"L'Intégral",long:"Le Cercle"},ent:{8:"Impulsion",12:"Performance",16:"Leadership"}};
  const rythme={6:"12 modules · 2 par semaine · 45 min à 1 h",long:"Abonnement mensuel · à votre rythme",8:"16 modules · 2 par semaine · 45 min à 1 h",12:"24 modules · 2 par semaine · 45 min à 1 h",16:"32 modules · 2 par semaine · 45 min à 1 h"};
  const objectif={6:"L'essentiel de la méthode, en accéléré",long:"Entretenir et faire progresser votre anglais professionnel, mois après mois",8:"L'essentiel de la méthode, à un rythme soutenu",12:"Le parcours complet, jusqu'au réflexe",16:"Le parcours complet, plus 8 ateliers d'oral et de mise en situation"};
  const inclus={part:["Votre espace et votre suivi","Évaluation orale finale","Tuteurs en option"],
                ent:["Modules de votre secteur","Suivi pour les RH, évaluation orale finale","Devis et facture entreprise"]};
  const exemples={"Reconversion":"Pour changer de métier, avec l'anglais en appui.","Professionnels":"Réunions, e-mails, appels.","Freelance":"Clients, devis, visios en anglais.","Internationaux":"Pour vivre et travailler en anglais.","Hôtellerie":"Check-in, réclamations, room service.","Restauration":"Commandes, allergies, service.","Commerce, luxe":"Accueil et conseil client.","Tourisme":"Visites, réservations, imprévus.","Immobilier":"Visites et négociation.","Sur mesure":"Votre métier, décrit dans votre demande."};
  document.querySelectorAll('.coffret[data-public]').forEach(c=>{
    const pub=c.dataset.public; let duree=pub==='part'?'16':'12', secteur=(c.querySelector('[data-secteur]')||{dataset:{}}).dataset.secteur||'Hôtellerie';
    const q=sel=>c.querySelector(sel), det=q('.details'), plus=q('.plus');
    function rendu(){
      q('.c-nom').textContent=noms[pub][duree]; q('.c-rythme').textContent=rythme[duree];
      q('.c-liste').innerHTML=['<strong>Communiquer partout, en déduisant au lieu de réciter</strong>',objectif[duree],...inclus[pub]].map(x=>`<li>${x}</li>`).join('');
      const ex=q('.secteur-ex'); if(ex) ex.textContent=exemples[secteur];
      c.querySelectorAll('[data-duree]').forEach(b=>b.setAttribute('aria-checked',b.dataset.duree===duree));
      c.querySelectorAll('[data-secteur]').forEach(b=>b.setAttribute('aria-checked',b.dataset.secteur===secteur));
    }
    c.addEventListener('click',e=>{
      const d=e.target.closest('[data-duree]'), s=e.target.closest('[data-secteur]');
      if(d){ duree=d.dataset.duree; rendu(); }
      if(s){ secteur=s.dataset.secteur; rendu(); }
    });
    plus.addEventListener('click',()=>{ const ouvert=det.hidden; det.hidden=!ouvert; plus.setAttribute('aria-expanded',ouvert); plus.setAttribute('aria-label',ouvert?'Masquer le détail':'Voir le détail'); c.classList.toggle('ouvert',ouvert); });
    q('.c-devis').addEventListener('click',()=>{
      if(pub==='ent'){ const r=document.getElementById('p-ent'); if(r){ r.checked=true; r.dispatchEvent(new Event('change',{bubbles:true})); }
        const sl=document.getElementById('f-secteur'); if(sl) sl.value=(secteur==='Sur mesure'?'Autre':secteur); }
      if(pub==='part'){ const id={Professionnels:'p-pro',Freelance:'p-pro',Internationaux:'p-pro',Reconversion:'p-part'}[secteur]; const r=document.getElementById(id); if(r){ r.checked=true; r.dispatchEvent(new Event('change',{bubbles:true})); }
        const m=document.getElementById('f-msg'); if(m&&!m.value&&secteur!=='Professionnels') m.value=`Profil : ${secteur}. `; }
      const fd=document.getElementById('f-duree'); if(fd) fd.value=duree==='long'?'Long terme (abonnement mensuel)':`${duree} semaines`;
    });
    rendu();
  });
})();

/* ---------- Solo : formule, détail, puis le devis pré-rempli ---------- */
(function solo(){
  const c=document.querySelector('[data-solo]'); if(!c) return;
  let fmt='Complète', dur='0 à 3 mois';
  const rendu=()=>c.querySelectorAll('[data-fmt]').forEach(b=>b.setAttribute('aria-checked',b.dataset.fmt===fmt));
  c.addEventListener('click',e=>{ const f=e.target.closest('[data-fmt]'); if(f){ fmt=f.dataset.fmt; dur=f.dataset.dur; rendu(); } });
  const plus=c.querySelector('.solo-plus'), det=c.querySelector('.solo-det');
  plus.addEventListener('click',()=>{ const o=det.hidden; det.hidden=!o; plus.setAttribute('aria-expanded',o); plus.setAttribute('aria-label',o?'Masquer le détail':'Voir ce qui est inclus'); c.classList.toggle('ouvert',o); });
  c.querySelector('.solo-cta').addEventListener('click',()=>{
    const r=document.getElementById('p-part'); if(r){ r.checked=true; r.dispatchEvent(new Event('change',{bubbles:true})); }
    const fd=document.getElementById('f-duree'); if(fd) fd.value=`Solo ${fmt} (${dur})`;
    const m=document.getElementById('f-msg'); if(m&&!m.value) m.value='Solo · ma situation : '; });
  rendu();
})();

/* ---------- les trois coffrets à la même hauteur (fermés), côte à côte ---------- */
(function egaliser(){
  const els=[...document.querySelectorAll('.coffrets > .coffret, .coffrets > .solo')]; if(els.length<2) return;
  function caler(){ els.forEach(e=>e.style.minHeight='');
    if(innerWidth<1000) return;
    const h=Math.max(...els.map(e=>e.offsetHeight)); els.forEach(e=>e.style.minHeight=h+'px'); }
  caler(); addEventListener('resize',caler); if(document.fonts) document.fonts.ready.then(caler);
  document.querySelector('.coffrets').addEventListener('click',e=>{ if(e.target.closest('.plus,.solo-plus')) requestAnimationFrame(()=>{ els.forEach(x=>x.style.minHeight=''); }); });
})();

/* apparition douce au défilement */
(()=>{if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const els=[...document.querySelectorAll('.bloc>h2,.bloc .chapo,.coffrets>*,.courbe-totale,#methode li,.avis-titre,.avis-carte,.devis>*,.metier,.sem-etape,.faq-q')];
els.forEach(e=>{const r=e.getBoundingClientRect();if(r.top<innerHeight*.9)return;const sib=[...e.parentElement.children].filter(x=>els.includes(x));e.style.setProperty('--rv',(Math.max(0,sib.indexOf(e))*90)+'ms');e.classList.add('rv')});
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){const t=x.target;t.classList.add('vu');io.unobserve(t);setTimeout(()=>{t.classList.remove('rv','vu');t.style.removeProperty('--rv')},1000+(parseInt(t.style.getPropertyValue('--rv'))||0))}}),{threshold:.15,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.rv').forEach(e=>io.observe(e));})();

/* « C'est mon quotidien » : pré-remplit le devis avec le profil et le secteur de la carte */
document.querySelectorAll('.m-lien').forEach(a=>a.addEventListener('click',()=>{
  const r=document.getElementById(a.dataset.profil==='pro'?'p-pro':'p-ent'); if(r){ r.checked=true; r.dispatchEvent(new Event('change',{bubbles:true})); }
  const sl=document.getElementById('f-secteur'); if(sl&&a.dataset.secteur) sl.value=a.dataset.secteur;
}));
