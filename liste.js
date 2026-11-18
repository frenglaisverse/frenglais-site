/* Liste « être prévenu(e) en premier » : formulaire léger, présent sur plusieurs pages (délégation : marche aussi pour les écrans créés plus tard) */
(function(){
  var API='https://courbe-classement.paulodubmx84.workers.dev';
  document.addEventListener('submit',async function(e){
    var f=e.target.closest&&e.target.closest('form.liste-form');if(!f)return;e.preventDefault();
    var i=f.querySelector('input[type=email]'),b=f.querySelector('button'),m=f.querySelector('.liste-msg'),hp=f.querySelector('.liste-hp'),v=(i.value||'').trim();
    if(hp&&hp.value)return;
    if(!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)){m.textContent='Cette adresse semble incomplète.';m.className='liste-msg ko';i.focus();return;}
    b.disabled=true;var t0=b.textContent;b.textContent='…';
    try{var r=await fetch(API+'/liste/inscrire',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:v,source:f.dataset.source||'site',page:location.pathname})});var j=await r.json();
      if(j.ok){f.classList.add('fait');m.className='liste-msg ok';m.textContent=j.deja?'Vous êtes déjà sur la liste. À très vite !':'C’est noté : vous serez prévenu(e) en premier. Un e-mail de confirmation arrive.';i.value='';
        try{localStorage.setItem('frg-liste','1');}catch(x){}
        if(window.goatcounter&&goatcounter.count)goatcounter.count({path:'liste-'+(f.dataset.source||'site'),title:'liste '+(f.dataset.source||''),event:true});}
      else{m.className='liste-msg ko';m.textContent=j.erreur||'Une erreur est survenue.';}}
    catch(x){m.className='liste-msg ko';m.textContent='Connexion impossible, réessayez.';}
    b.disabled=false;b.textContent=t0;
  });
})();
