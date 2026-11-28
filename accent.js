/* Frenglais · « Le pont des sons » : le lamantin traverse le pont de gauche à droite, une pierre par mot bien prononcé.
   Sept sons qui trahissent l'accent français : th (deux façons), i court, r, h, -ed, w.
   La reconnaissance vocale est faite par le navigateur (Chrome, Edge, Safari). Sans elle : on s'enregistre, on se réécoute, on juge. */
(function(){
  'use strict';
  const z = document.getElementById('ecran');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);
  const lire = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const melange = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const norm = t => String(t || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  /* [mot ou phrase, piège entendu à la place (facultatif)] */
  const SONS = {
    ths: { nom: 'TH soufflé', ex: 'think', conseil: 'Langue entre les dents, et soufflez sans voix. Pas de « s » : <em>think</em>, pas <em>sink</em>.',
      mots: [['think', 'sink'], ['three', 'tree'], ['thank you'], ['Thursday'], ['birthday'], ['month'], ['health'], ['both'], ['author'], ['mouth', 'mouse'], ['thin', 'sin'], ['thought', 'sought'], ['third'], ['north'], ['truth'], ['method'], ['theatre'], ['nothing'], ['path', 'pass'], ['faith', 'face'], ['thick', 'sick'], ['thumb'], ['theory'], ['thirsty'], ['thorough'], ['threat'], ['throat'], ['throw'], ['thousand'], ['therapy'], ['marathon'], ['strength']],
      phrases: ['I think it is Thursday', 'three thousand thanks', 'happy birthday to both of you', 'the truth is nothing new', 'my third month in the north', 'I thought about it for a month', 'thank you for your thoughtful email', 'the theatre is north of the bath', 'a thorough method for growth', 'three thirsty athletes'], virelangues: ['Thirty-three thousand thoughts', 'The thief thought three thick thoughts', 'Thin sticks, thick bricks', 'Truth be told, the theory is thorough', 'I thought a thought, but the thought I thought was not the thought I thought I thought'] },
    thv: { nom: 'TH vibré', ex: 'this', conseil: 'Langue entre les dents, avec la voix qui vibre. Pas de « z » ni de « d » : <em>this</em>, pas <em>zis</em>.',
      mots: [['this'], ['that'], ['the'], ['they', 'day'], ['mother'], ['father'], ['brother'], ['weather'], ['together'], ['with'], ['clothes'], ['there', 'dare'], ['those', 'doze'], ['other'], ['rather'], ['breathe'], ['smooth'], ['although'], ['then', 'den'], ['without'], ['these'], ['their'], ['them'], ['though'], ['worthy'], ['bother'], ['leather'], ['feather'], ['northern'], ['soothe'], ['gather'], ['further']],
      phrases: ['this is my brother', 'the weather is rather nice', 'they work together', 'my mother and father', 'those are the other clothes', 'they gathered their leather bags', 'is this the one they mentioned', 'rather than bother them', 'the other brother is further away', 'though the weather was bad'], virelangues: ['The father of the other brother', 'Whether the weather is warm or whether the weather is cold', 'Those three brothers bathe together', 'This, that, these and those', 'They gather their feathers there'] },
    i: { nom: 'I court / I long', ex: 'ship · sheep', conseil: 'Le <em>i</em> court est bref et relâché, presque un « é ». Le long est tendu : <em>ship</em> (bateau) n\'est pas <em>sheep</em> (mouton).',
      mots: [['ship', 'sheep'], ['sheep', 'ship'], ['live', 'leave'], ['leave', 'live'], ['sit', 'seat'], ['seat', 'sit'], ['fill', 'feel'], ['feel', 'fill'], ['chip', 'cheap'], ['cheap', 'chip'], ['hit', 'heat'], ['still', 'steal'], ['rich', 'reach'], ['will', 'wheel'], ['bit', 'beat'], ['fit', 'feet'], ['bin', 'bean'], ['pill', 'peel'], ['grin', 'green'], ['lip', 'leap'], ['mill', 'meal'], ['slip', 'sleep'], ['still'], ['quick'], ['guilty'], ['busy'], ['women'], ['minute']],
      phrases: ['the ship is still here', 'please sit in this seat', 'I feel it will rain', 'a cheap chip', 'live here or leave', 'it is a big ship in the sea', 'please sit still for a minute', 'the women live in the city', 'he will feel better this week', 'a quick trip to the beach'], virelangues: ['Six sick sheep sit on six slim ships', 'Will Jill feel ill if she eats the meal', 'Big ships and cheap sheep', 'Is it his or is it hers, Bill', 'Fill the bin with green beans'] },
    r: { nom: 'R anglais', ex: 'red', conseil: 'Pas de « r » de gorge : la langue recule sans toucher le palais, les lèvres s\'arrondissent un peu.',
      mots: [['red'], ['right'], ['room'], ['rain'], ['really'], ['very'], ['sorry'], ['around'], ['breakfast'], ['world'], ['car'], ['problem'], ['tomorrow'], ['three'], ['restaurant'], ['reception'], ['marry'], ['bring'], ['great'], ['library'], ['rarely'], ['mirror'], ['error'], ['rural'], ['brewery'], ['February'], ['entrepreneur'], ['squirrel'], ['Worcestershire'], ['refrigerator'], ['corridor'], ['priority']],
      phrases: ['the room is really great', 'sorry for the rain', 'breakfast is at three', 'bring the red car tomorrow', 'a restaurant around the corner', 'our priority is the rural area', 'the error is in the mirror', 'rarely early in February', 'a brilliant entrepreneur from Ireland', 'run around the red corridor'], virelangues: ['Red lorry, yellow lorry', 'Rory the warrior and Roger the worrier', 'Round the rugged rock the ragged rascal ran', 'A rural juror', 'Truly rural, truly rural'] },
    h: { nom: 'H soufflé', ex: 'hotel', conseil: 'Le <em>h</em> se souffle, comme de la buée sur une vitre. Sans lui, <em>hair</em> (cheveux) devient <em>air</em>.',
      mots: [['hotel'], ['happy'], ['house'], ['hello'], ['hungry'], ['half'], ['hair', 'air'], ['heat', 'eat'], ['hand', 'and'], ['hear', 'ear'], ['hill', 'ill'], ['his', 'is'], ['heart', 'art'], ['holiday'], ['husband'], ['hospital'], ['behind'], ['perhaps'], ['who'], ['whole', 'hole'], ['hire', 'ire'], ['heat'], ['hurry'], ['honest'], ['hour'], ['heir'], ['behave'], ['inhale'], ['household'], ['hesitate'], ['hierarchy'], ['whose']],
      phrases: ['happy holidays', 'his house is behind the hotel', 'hello I am hungry', 'half an hour', 'he has a heart of gold', 'the honest heir arrived in an hour', 'he hesitated to hire her', 'how high is the hill', 'help him with the heavy heater', 'happy hour at the hotel'], virelangues: ['Harry hurried home to his hungry horse', 'How high his hat hung', 'Hugh has a huge house on a high hill', 'Hello Hannah, how is Henry', 'Have a happy and healthy holiday'] },
    ed: { nom: 'Le -ed', ex: 'worked', conseil: 'Trois prononciations : /t/ après un son sourd (<em>worked</em>), /d/ après un son vibré (<em>played</em>), /ɪd/ après t ou d (<em>wanted</em>). On ne dit jamais « work-èd ».',
      mots: [['worked', 'work'], ['played', 'play'], ['wanted', 'want'], ['called', 'call'], ['booked', 'book'], ['visited', 'visit'], ['missed', 'miss'], ['needed', 'need'], ['cleaned', 'clean'], ['asked', 'ask'], ['decided', 'decide'], ['finished', 'finish'], ['started', 'start'], ['watched', 'watch'], ['opened', 'open'], ['helped', 'help'], ['loved'], ['laughed'], ['decided'], ['hoped'], ['planned'], ['stopped'], ['added'], ['changed'], ['fixed'], ['ended'], ['agreed'], ['arrived']],
      phrases: ['I worked late yesterday', 'she called and asked', 'we visited the museum', 'they booked and paid', 'he finished and started again', 'we hoped they arrived on time', 'she laughed and then she stopped', 'the client added and changed the order', 'I planned it and fixed it', 'they agreed and it ended well'], virelangues: ['He looked, he laughed, he left', 'She wanted, waited, then decided', 'We worked, walked and talked', 'It started, stopped and started again', 'They booked, packed and travelled'] },
    w: { nom: 'W', ex: 'west · vest', conseil: 'Les lèvres en rond, comme pour « ou », sans toucher les dents. <em>West</em> (ouest) n\'est pas <em>vest</em> (gilet).',
      mots: [['west', 'vest'], ['wine', 'vine'], ['wet', 'vet'], ['week'], ['work'], ['water'], ['window'], ['welcome'], ['weather'], ['wonderful'], ['why'], ['what'], ['would', 'wood'], ['world'], ['quick'], ['question'], ['always'], ['swim'], ['twenty'], ['between'], ['wear'], ['weird'], ['worried'], ['wolf'], ['woman'], ['wood', 'would'], ['word'], ['wrong'], ['awkward'], ['software'], ['reward'], ['wealthy']],
      phrases: ['welcome to the west', 'what a wonderful week', 'would you like some wine', 'a quick question', 'twenty windows', 'why would a woman worry', 'the wrong word at the wrong time', 'a wealthy wine merchant in the west', 'we were worried about the weather', 'what a wonderful reward'], virelangues: ['Which witch wished which wicked wish', 'How much wood would a woodchuck chuck', 'We will wait for the white wine', 'Wally the wise wolf went west', 'Wet weather wins the week'] }
  };
  const Reco = window.SpeechRecognition || window.webkitSpeechRecognition;
  let son = null, grand = false, palier = 1, pont = [], pos = 0, essais = 0, rec = null, enregistreur = null;

  function menu(){
    const M = lire('frg-accent', {});
    z.innerHTML = `<h1>Le pont des sons</h1><p>Dis le mot, le lamantin avance.</p>
      <div class="ac-sons">${Object.entries(SONS).map(([k, s]) => `<button type="button" class="en-carte" data-s="${k}"><b>${s.nom}</b><span lang="en">${s.ex}</span><em>${M[k] ? '★'.repeat(Math.min(3, M[k])) : '·'}</em></button>`).join('')}</div>
      <button type="button" class="btn plein ac-grand" id="grand">Le grand pont · tous les sons ${M.grand ? '· record ' + M.grand : ''}</button>
      <p class="doux petit">${Reco ? 'La voix est reconnue par votre navigateur. Frenglais ne reçoit rien.' : 'Enregistrez-vous, réécoutez, jugez. Rien ne quitte l\'appareil.'}</p>
      `;
    z.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { son = b.dataset.s; grand = false; partir(); }));
    z.querySelector('#grand').addEventListener('click', () => { grand = true; palier = 1; son = 'ths'; partir(); });
  }
  /* la difficulté monte toute seule : mots, puis phrases, puis virelangues */
  function pierres(S, niv){ return niv <= 2 ? melange(S.mots).slice(0, 8) : niv <= 4 ? melange(S.phrases).slice(0, 5).map(p => [p]) : melange(S.virelangues || S.phrases).slice(0, 4).map(p => [p]); }
  function partir(){ if (grand) { const K = Object.keys(SONS); son = K[Math.floor(Math.random() * K.length)]; const niv = Math.min(6, Math.ceil(palier / 2));
      pont = niv <= 2 ? melange(K.flatMap(k => SONS[k].mots.map(m => [m[0], m[1] || null, k]))).slice(0, 8) : niv <= 4 ? melange(K.flatMap(k => SONS[k].phrases.map(p => [p, null, k]))).slice(0, 5) : melange(K.flatMap(k => (SONS[k].virelangues || []).map(p => [p, null, k]))).slice(0, 4); }
    else { const M = lire('frg-accent', {}); pont = pierres(SONS[son], (M[son] || 0) + 1); }
    pos = 0; essais = 0; dessiner(); }
  function dessiner(msg){
    if (grand && pont[pos] && pont[pos][2]) son = pont[pos][2]; const S = SONS[son];
    z.innerHTML = `<p class="eyebrow">${grand ? 'Le grand pont · ' + palier : S.nom}</p>
      <div class="ac-pont" id="pont"><div class="ac-rive g"></div>${pont.map((m, i) => `<div class="ac-pierre ${i < pos ? 'faite' : i === pos ? 'ici' : ''}"><span lang="en">${esc(m[0])}</span></div>`).join('')}<div class="ac-rive d">🏁</div>
        <img class="ac-lam" id="lam" src="lamantin-face.webp" alt="" width="54" height="54"></div>
      <p class="ac-cible"><b lang="en">${esc(pont[pos] ? pont[pos][0] : '')}</b> ${pont[pos] ? `<span class="dire" role="button" tabindex="0" aria-label="Écouter le modèle" data-dire="${esc(pont[pos][0])}">🔊</span>` : ''}</p>
      <details class="ac-conseil"><summary>Le geste</summary><span>${S.conseil}</span></details>
      <div class="en-nav ac-btns">${Reco ? '<button class="btn plein ac-micro" id="parler" type="button">🎙 Parler</button>' : '<button class="btn plein ac-micro" id="enr" type="button">🎙 M\'enregistrer</button>'}<button class="btn" id="passer" type="button">Passer</button><button class="btn" id="quitter" type="button">Sons</button></div>
      <div id="r">${msg || ''}</div>`;
    placer(); const r = z.querySelector('#r');
    z.querySelector('#quitter').addEventListener('click', () => { arreter(); menu(); });
    z.querySelector('#passer').addEventListener('click', () => { arreter(); avancer(false); });
    if (Reco) z.querySelector('#parler').addEventListener('click', ecouter); else z.querySelector('#enr').addEventListener('click', enregistrer);
  }
  function placer(){ const p = z.querySelector('#pont'), l = z.querySelector('#lam'); if (!p || !l) return; const P = [...p.querySelectorAll('.ac-pierre')], ou = k => k < 0 ? p.querySelector('.ac-rive.g') : k < pont.length ? P[k] : p.querySelector('.ac-rive.d'), c = ou(pos), a = ou(pos - 1);
    const xy = e => `translate(${e.offsetLeft + e.offsetWidth / 2 - 27}px, ${e.offsetTop - 46}px)`; l.style.transition = 'none'; l.style.transform = xy(a); void l.offsetWidth; l.style.transition = ''; requestAnimationFrame(() => { l.style.transform = xy(c); }); p.scrollTo({ left: c.offsetLeft - p.clientWidth / 2 + c.offsetWidth / 2, behavior: 'smooth' }); }
  function arreter(){ try { rec && rec.abort(); } catch (e) {} rec = null; try { enregistreur && enregistreur.state === 'recording' && enregistreur.stop(); } catch (e) {} }
  function ecouter(){
    const cible = pont[pos], b = z.querySelector('#parler'), r = z.querySelector('#r'); arreter();
    rec = new Reco(); rec.lang = 'en-GB'; rec.maxAlternatives = 5; rec.interimResults = false;
    b.textContent = '● J\'écoute…'; b.disabled = true;
    rec.onresult = e => { const alts = [...e.results[0]].map(a => norm(a.transcript)), but = norm(cible[0]), piege = cible[1] && norm(cible[1]);
      const ok = alts.some(a => a === but || (' ' + a + ' ').includes(' ' + but + ' ') || (but.split(' ').length > 2 && proche(a, but)));
      if (ok && !(piege && alts[0] === piege)) { r.innerHTML = ''; avancer(true); }
      else { essais++; r.innerHTML = `<div class="retour-msg ko">On a entendu « <b lang="en">${esc(e.results[0][0].transcript)}</b> »${piege && alts[0] === piege ? ` : c'est l'autre mot !` : ''}. ${essais >= 3 ? 'Touchez « Passer » si besoin.' : 'Réessayez.'}</div>`; b.textContent = '🎙 Parler'; b.disabled = false; } };
    rec.onerror = e => { b.textContent = '🎙 Parler'; b.disabled = false; r.innerHTML = `<div class="retour-msg info">${e.error === 'not-allowed' ? 'Autorisez le micro pour jouer.' : e.error === 'no-speech' ? 'Je n\'ai rien entendu. Parlez un peu plus fort.' : 'Le micro n\'a pas répondu. Réessayez.'}</div>`; };
    rec.onend = () => { if (b.disabled && b.textContent.startsWith('●')) { b.textContent = '🎙 Parler'; b.disabled = false; } };
    try { rec.start(); } catch (e) { b.textContent = '🎙 Parler'; b.disabled = false; }
  }
  /* pour les phrases : au moins 80 % des mots reconnus */
  function proche(a, b){ const A = a.split(' '), B = b.split(' '); return B.filter(w => A.includes(w)).length / B.length >= .8; }
  async function enregistrer(){
    const b = z.querySelector('#enr'), r = z.querySelector('#r');
    if (enregistreur && enregistreur.state === 'recording') { enregistreur.stop(); return; }
    try { const flux = await navigator.mediaDevices.getUserMedia({ audio: true }), morceaux = [];
      enregistreur = new MediaRecorder(flux); enregistreur.ondataavailable = e => morceaux.push(e.data);
      enregistreur.onstop = () => { flux.getTracks().forEach(t => t.stop()); const url = URL.createObjectURL(new Blob(morceaux)); b.textContent = '🎙 M\'enregistrer';
        r.innerHTML = `<div class="exo"><audio controls src="${url}"></audio><p style="margin:0">Le son y est ?</p><div class="en-nav"><button class="btn" type="button" id="non">Pas encore</button><button class="btn plein" type="button" id="oui">Oui, j'avance</button></div></div>`;
        r.querySelector('#oui').addEventListener('click', () => avancer(true)); r.querySelector('#non').addEventListener('click', () => { r.innerHTML = ''; }); };
      enregistreur.start(); b.textContent = '■ Arrêter'; setTimeout(() => { if (enregistreur.state === 'recording') enregistreur.stop(); }, 5000);
    } catch (e) { r.innerHTML = '<div class="retour-msg info">Autorisez le micro pour jouer.</div>'; }
  }
  function avancer(ok){ pos++; essais = 0;
    if (pos >= pont.length && grand) { const M = lire('frg-accent', {}); M.grand = Math.max(M.grand || 0, palier); ecrire('frg-accent', M); palier++; z.querySelector('#r') && (z.querySelector('#r').innerHTML = '<div class="retour-msg ok">Pont ' + (palier - 1) + ' traversé. Le suivant est plus dur.</div>'); setTimeout(partir, 1200); return; }
    if (pos >= pont.length) { const M = lire('frg-accent', {}); M[son] = (M[son] || 0) + 1; ecrire('frg-accent', M);
      const S0 = lire('frg-entr2', {}); S0.jeux = S0.jeux || {}; const o = S0.jeux.accent || { n: 0, best: 0 }; o.n++; o.best = o.n; S0.jeux.accent = o; ecrire('frg-entr2', S0);
      dessiner(); placer();
      setTimeout(() => { z.querySelector('#r').innerHTML = `<div class="retour-msg ok">Pont traversé ! ${M[son]} fois pour ce son.</div><div class="en-nav"><button class="btn plein" id="enc" type="button">Un autre pont</button><button class="btn" id="aut" type="button">Changer de son</button></div>`;
        z.querySelector('.ac-cible').innerHTML = '🎉'; z.querySelector('#enc').addEventListener('click', partir); z.querySelector('#aut').addEventListener('click', menu); z.querySelector('.ac-btns').hidden = true; }, 50); return; }
    setTimeout(() => dessiner(''), 0);
  }
  menu();
})();
