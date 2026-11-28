/* Frenglais · générateur de phrases : des phrases toujours nouvelles, au temps du module.
   ~140 verbes × plusieurs compléments × 34 sujets × repères de temps × 20 formes (affirmative, négative, question, aspects, modaux,
   passif, conditionnel…) : des centaines de milliers de combinaisons. Les formes s'ouvrent au fil des modules, et 35 % des phrases
   reprennent les modules d'avant. Chaque phrase a sa forme juste, des formes fausses crédibles et l'explication dans les mots de la méthode. */
(function(){
  'use strict';
  /* irréguliers : base → [T-1, -en] */
  const IRR = { begin:['began','begun'], bring:['brought','brought'], build:['built','built'], buy:['bought','bought'], catch:['caught','caught'], choose:['chose','chosen'], come:['came','come'], cut:['cut','cut'], do:['did','done'], drink:['drank','drunk'], drive:['drove','driven'], eat:['ate','eaten'], find:['found','found'], fly:['flew','flown'], forget:['forgot','forgotten'], get:['got','got'], give:['gave','given'], go:['went','gone'], have:['had','had'], hear:['heard','heard'], keep:['kept','kept'], know:['knew','known'], lead:['led','led'], leave:['left','left'], lose:['lost','lost'], make:['made','made'], meet:['met','met'], pay:['paid','paid'], put:['put','put'], read:['read','read'], run:['ran','run'], say:['said','said'], see:['saw','seen'], sell:['sold','sold'], send:['sent','sent'], speak:['spoke','spoken'], spend:['spent','spent'], take:['took','taken'], teach:['taught','taught'], tell:['told','told'], think:['thought','thought'], understand:['understood','understood'], wear:['wore','worn'], win:['won','won'], write:['wrote','written'] };
  const DOUBLE = ['plan', 'stop', 'shop', 'travel', 'cancel', 'chat', 'admit', 'control'];
  const s3 = b => /(s|sh|ch|x|z|o)$/.test(b) ? b + 'es' : /[^aeiou]y$/.test(b) ? b.slice(0, -1) + 'ies' : b + 's';
  const ed = b => IRR[b] ? IRR[b][0] : DOUBLE.includes(b) ? b + b.slice(-1) + 'ed' : /e$/.test(b) ? b + 'd' : /[^aeiou]y$/.test(b) ? b.slice(0, -1) + 'ied' : b + 'ed';
  const en = b => IRR[b] ? IRR[b][1] : ed(b);
  const ing = b => /ie$/.test(b) ? b.slice(0, -2) + 'ying' : /[^e]e$/.test(b) && b !== 'see' ? b.slice(0, -1) + 'ing' : DOUBLE.includes(b) || /^(run|get|put|cut|win|begin)$/.test(b) ? b + b.slice(-1) + 'ing' : b + 'ing';
  /* [base, compléments] : chaque verbe garde des compléments qui ont du sens avec lui */
  const BASE = [
    ['call', ['the client', 'the hotel', 'a taxi', 'the supplier', 'my manager']], ['send', ['the invoice', 'the quote', 'an email', 'the contract', 'the photos']],
    ['check', ['the emails', 'the figures', 'the bookings', 'the schedule', 'the stock']], ['prepare', ['the meeting', 'the presentation', 'the budget', 'the rooms', 'a report']],
    ['write', ['a report', 'an email', 'the minutes', 'a proposal', 'a review']], ['sign', ['the contract', 'the agreement', 'the documents', 'the lease']],
    ['meet', ['the new team', 'the client', 'our partners', 'the director', 'the investors']], ['finish', ['the project', 'the report', 'the training', 'the inventory']],
    ['answer', ['the phone', 'the emails', 'the question', 'the customers']], ['update', ['the website', 'the database', 'the price list', 'the planning']],
    ['pay', ['the bill', 'the invoice', 'the suppliers', 'the rent']], ['read', ['the contract', 'the report', 'the reviews', 'the newsletter']],
    ['organise', ['the event', 'a meeting', 'the trip', 'the training day']], ['present', ['the results', 'the new offer', 'the project', 'the budget']],
    ['manage', ['the team', 'the budget', 'the shop', 'the bookings']], ['lead', ['the meeting', 'the team', 'the project']],
    ['hire', ['two new people', 'an assistant', 'a designer']], ['train', ['the new staff', 'the interns', 'the team']],
    ['discuss', ['the budget', 'the contract', 'the problem', 'the schedule']], ['print', ['the documents', 'the tickets', 'the menu']],
    ['open', ['the office', 'the shop', 'a new account', 'the doors']], ['close', ['the office', 'the deal', 'the shop', 'the file']],
    ['start', ['the meeting', 'the project', 'a new job', 'the presentation']], ['change', ['the plan', 'the password', 'the date', 'the menu']],
    ['fix', ['the printer', 'the problem', 'the website', 'the heating']], ['need', ['a new laptop', 'more time', 'your help', 'a quote']],
    ['ask', ['a question', 'the manager', 'for the bill', 'for help']], ['help', ['the customers', 'the new colleague', 'the guests']],
    ['explain', ['the rules', 'the process', 'the price', 'the problem']], ['confirm', ['the booking', 'the order', 'the meeting', 'the date']],
    ['receive', ['the parcel', 'the payment', 'your message', 'the order']], ['deliver', ['the order', 'the parcels', 'the furniture']],
    ['order', ['a taxi', 'new chairs', 'the supplies', 'lunch']], ['offer', ['a discount', 'a free coffee', 'a solution']],
    ['accept', ['the offer', 'the invitation', 'the conditions']], ['refuse', ['the offer', 'the delivery', 'the invitation']],
    ['recommend', ['the restaurant', 'this hotel', 'the new product']], ['plan', ['the trip', 'the launch', 'the next step', 'the budget']],
    ['book', ['a table', 'a room', 'the flights', 'a meeting room']], ['welcome', ['the guests', 'the visitors', 'the new staff']],
    ['clean', ['the rooms', 'the kitchen', 'the lobby', 'the pool']], ['serve', ['breakfast', 'dinner', 'the drinks', 'the guests']],
    ['cancel', ['the booking', 'the meeting', 'the order', 'the trip']], ['carry', ['the luggage', 'the boxes', 'the bags']],
    ['cook', ['dinner', 'the fish', 'a special menu']], ['sell', ['the bag', 'the flat', 'three watches', 'tickets']],
    ['buy', ['a gift', 'new furniture', 'the tickets', 'a car']], ['show', ['the new collection', 'the flat', 'the room', 'the results']],
    ['wrap', ['the present', 'the gift', 'the box']], ['choose', ['a watch', 'the colour', 'the menu', 'a hotel']],
    ['try', ['the jacket', 'the new dish', 'a different approach']], ['visit', ['the museum', 'the factory', 'the new office', 'Miami']],
    ['take', ['the train', 'a taxi', 'notes', 'the elevator', 'a break']], ['miss', ['the bus', 'the train', 'the meeting', 'the deadline']],
    ['catch', ['the train', 'the plane', 'the bus']], ['drive', ['the van', 'the clients to the airport']],
    ['rent', ['a flat', 'a car', 'a boat', 'an office']], ['renovate', ['the kitchen', 'the bathroom', 'the lobby']],
    ['find', ['a buyer', 'a solution', 'the keys', 'a new supplier']], ['make', ['an offer', 'a decision', 'a mistake', 'a reservation', 'a phone call']],
    ['build', ['a new hotel', 'the website', 'a team']], ['repair', ['the roof', 'the lift', 'the air conditioning']],
    ['move', ['the furniture', 'the meeting', 'the boxes']], ['paint', ['the walls', 'the office', 'the door']],
    ['give', ['a presentation', 'the keys', 'a discount', 'feedback']], ['get', ['the results', 'a promotion', 'the job', 'an answer']],
    ['keep', ['the receipts', 'the keys', 'a copy']], ['leave', ['the office', 'a message', 'the keys at reception']],
    ['lose', ['the keys', 'the file', 'the contract', 'a client']], ['forget', ['the password', 'the meeting', 'the documents']],
    ['tell', ['the truth', 'the client', 'a story']], ['bring', ['the documents', 'coffee', 'the samples']],
    ['spend', ['the budget', 'two hours on it', 'the weekend in Key West']], ['win', ['the contract', 'the award', 'a new client']],
    ['teach', ['English', 'the new procedure', 'the interns']], ['see', ['the director', 'the new offices', 'the problem']],
    ['hear', ['the news', 'the alarm', 'a strange noise']], ['wear', ['a uniform', 'a badge', 'a suit']],
    ['eat', ['lunch', 'a sandwich', 'a salad']], ['drink', ['coffee', 'a smoothie', 'water']],
    ['run', ['the shop', 'the hotel', 'a marathon']], ['contact', ['the supplier', 'the bank', 'the lawyer']],
    ['study', ['the file', 'the market', 'the offer']], ['test', ['the app', 'the new menu', 'the system']],
    ['launch', ['the new product', 'the campaign', 'the website']], ['improve', ['the service', 'the website', 'our results']],
    ['reduce', ['the costs', 'the price', 'the waiting time']], ['increase', ['the prices', 'the budget', 'sales']],
    ['share', ['the file', 'the results', 'an office']], ['invite', ['the clients', 'the whole team', 'our partners']],
    ['thank', ['the team', 'the client', 'the staff']], ['arrange', ['a meeting', 'the transfer', 'a visit']],
    ['download', ['the file', 'the app', 'the report']], ['install', ['the software', 'the new printer', 'the screens']],
    ['review', ['the contract', 'the figures', 'the menu']], ['translate', ['the brochure', 'the website', 'the email']],
    ['collect', ['the keys', 'the parcels', 'the guests at the airport']], ['count', ['the money', 'the guests', 'the boxes']],
    ['describe', ['the problem', 'the room', 'the new product']], ['follow', ['the procedure', 'the rules', 'the plan']],
    ['protect', ['the data', 'the brand', 'our clients']], ['support', ['the team', 'the project', 'our clients']]
  ];
  const V = BASE.map(([b, comps]) => [b, s3(b), ed(b), en(b), ing(b), comps]);
  /* sujets : [texte, personne] · 3 = he / she / it (le code -s se voit), 1 = I, 0 = les autres */
  const S = [['I', 1], ['She', 3], ['He', 3], ['We', 0], ['They', 0], ['You', 0], ['My manager', 3], ['Our team', 3], ['The guests', 0], ['My colleagues', 0], ['The client', 3], ['Our company', 3],
    ['Sarah', 3], ['Tom', 3], ['Mr Lee', 3], ['Mrs Garcia', 3], ['The receptionist', 3], ['The new intern', 3], ['Our clients', 0], ['The interns', 0], ['My boss', 3], ['The director', 3],
    ['Jake and Mia', 0], ['The hotel', 3], ['The sales team', 3], ['Our partners', 0], ['The chef', 3], ['My assistant', 3], ['The tourists', 0], ['Emma', 3], ['The agency', 3], ['Leo', 3], ['Our suppliers', 0], ['The manager', 3]];
  const R = {
    t0: ['every day', 'on Mondays', 'every morning', 'twice a week', 'every Friday', 'every month', 'at nine', 'in the evening', 'every summer', 'on weekdays'],
    t1: ['yesterday', 'last week', 'on Monday', 'two days ago', 'last month', 'this morning', 'last night', 'in 2019', 'an hour ago', 'last summer'],
    ing: ['right now', 'at the moment', 'today', 'this week', 'now'],
    ing1: ['when you called', 'when the alarm rang', 'at ten last night', 'when I arrived', 'all morning'],
    en: ['already', 'just', 'never', 'recently'],
    enIng: ['for two hours', 'since this morning', 'for three years', 'since January', 'all day'],
    t2b: ['When I arrived,', 'When the client called,', 'By the time we got there,', 'Before the meeting started,'],
    fut: ['tomorrow', 'next week', 'on Friday', 'next month', 'tonight', 'in two days', 'next year'],
    mod: [['can', 'Can : la capacité, la possibilité.'], ['should', 'Should = shall + -ed : le conseil, environ 70 %.'], ['must', 'Must : l\'obligation forte, ou la quasi-certitude.'], ['might', 'Might = may + -ed : peut-être, environ 30 %.'], ['may', 'May : c\'est possible, environ 50 %.'], ['could', 'Could = can + -ed : une possibilité plus lointaine.']],
    si: ['If I had more time,', 'If we had the budget,', 'If she were here,', 'If they asked me,', 'If the client agreed,'],
    used: ['when I was young', 'ten years ago', 'before the crisis', 'in my first job']
  };
  const r = a => a[Math.floor(Math.random() * a.length)];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const bas = s => /^(She|He|We|They|You|My|Our|The|It)\b/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s;
  const uniq = a => a.filter((x, i) => x && a.indexOf(x) === i);
  /* quelles formes s'ouvrent à quel module (le module en cours pèse plus) */
  const TOUT = ['t0', 't1', 'ing', 'ing1', 'en', 'enIng', 't2', 'fut', 'go', 'mod', 'neg0', 'neg1', 'q0', 'q1', 'qIng', 'qEn', 'qF', 'negF'];
  const TEMPS = n => n === 1 ? ['t0', 't1'] : n === 2 ? ['t0', 't0', 'neg0', 'q0'] : n === 3 ? ['t1', 't1', 'neg1', 'q1', 't0'] : n === 4 ? ['ing', 'ing', 'ing1', 'qIng', 't0', 't1'] : n === 5 ? ['en', 'en', 'qEn', 't1'] : n === 6 ? ['t2', 't2', 't1', 'en'] : n === 7 ? ['fut', 'fut', 'go', 'negF', 'qF'] : n === 8 ? ['mod', 'mod', 'fut'] :
    n === 9 ? ['enIng', 'enIng', 'en', 'ing'] : n === 10 ? ['q0', 'q1', 'qEn', 'qIng', 'qF'] : n < 23 ? TOUT :
    n === 23 ? ['si', 'si', 'mod', 't1'] : n === 25 ? ['pass0', 'pass1', 'pass0', 'en'] : n === 26 ? ['used', 'used', 't1'] : n === 27 ? ['mhave', 'mhave', 'mod', 't2'] : [...TOUT, 'si', 'pass0', 'pass1', 'used', 'mhave'];
  const beT0 = p => p === 1 ? 'am' : p === 3 ? 'is' : 'are', beT1 = p => p === 0 ? 'were' : 'was', hv = p => p === 3 ? 'has' : 'have', doT0 = p => p === 3 ? 'does' : 'do';
  const NOMS_T = { t0: 'T0, le -s', t1: 'T-1, le -ed', ing: 'be + -ing', ing1: 'be + -ing à T-1', en: 'have + -en', enIng: 'have + -en + be + -ing', t2: 'T-2', fut: 'T+1', go: 'going to', mod: 'les modaux', neg0: 'la négation', neg1: 'la négation à T-1', q0: 'la question', q1: 'la question à T-1', qEn: 'la question', qIng: 'la question', qF: 'la question', negF: 'will not', si: 'if + -ed', pass0: 'le passif', pass1: 'le passif', used: 'used to', mhave: 'modal + have + -en' };
  const pluriel = c => /(s|people|staff)$/.test(c) && !/(news|business|class|glass|bus)$/.test(c) ? 0 : 3;

  /* une phrase : { avant, juste, faux[], apres, fin, ex, code } — la phrase complète = avant + juste + apres + fin */
  function phrase(n){
    const k = n > 1 && Math.random() < .35 ? 1 + Math.floor(Math.random() * (n - 1)) : n, t = r(TEMPS(k)), v = r(V); let [sj, p] = r(S);
    const c = r(v[5]); let marq = '', avant = sj, juste, faux, apres = c, ex, code, fin = '.';
    if (t === 't0') { const m = marq = r(R.t0); juste = p === 3 ? v[1] : v[0]; faux = p === 3 ? [v[0], v[2]] : [v[1], v[4]]; apres = c + ' ' + m;
      ex = p === 3 ? `${sj} = he, she ou it : au T0, le code -s se voit. <b>${v[1]}</b>.` : `${sj} : au T0, le code -s est invisible. <b>${v[0]}</b>, sans -s.`; code = '-s'; }
    else if (t === 't1') { const m = marq = r(R.t1); juste = v[2]; faux = uniq([p === 3 ? v[1] : v[0], v[0] === v[2] ? v[1] : v[0], v[4]]).filter(x => x !== juste).slice(0, 2);
      if (/ago|yesterday|last|in 2019/.test(m) && Math.random() < .5) { avant = cap(m) + ', ' + bas(sj); apres = c; marq = ''; } else apres = c + ' ' + m;
      ex = `${cap(m)} : c'est fini, T-1. Le code -ed${v[2].endsWith('ed') ? '' : ', ici invisible (' + v[2] + ' = ' + v[0] + ' + -ed)'} : <b>${v[2]}</b>.`; code = '-ed'; }
    else if (t === 'neg0') { const m = marq = r(R.t0), d = doT0(p); juste = d + 'n\'t ' + v[0]; faux = [d + 'n\'t ' + v[1], (d === 'does' ? 'don\'t' : 'doesn\'t') + ' ' + v[0]]; apres = c + ' ' + m;
      ex = `À la négation, le code -s passe sur do : <b>${d}n't</b>, et le verbe reste nu (<b>${v[0]}</b>).`; code = 'do + -s ; not'; }
    else if (t === 'neg1') { const m = marq = r(R.t1); juste = 'didn\'t ' + v[0]; faux = ['didn\'t ' + v[2], 'don\'t ' + v[0]]; apres = c + ' ' + m;
      ex = `T-1 à la négation : le -ed passe sur did. Le verbe reste nu : <b>didn't ${v[0]}</b>, jamais « didn't ${v[2]} ».`; code = 'do + -ed ; not'; }
    else if (t === 'q0') { const m = r(R.t0), d = doT0(p); avant = ''; juste = cap(d); faux = [cap(d === 'does' ? 'do' : 'does'), cap(p === 0 ? 'are' : 'is')]; apres = bas(sj) + ' ' + v[0] + ' ' + c + ' ' + m; fin = '?';
      ex = `Une question au T0 : do passe devant, et c'est lui qui porte le -s. Avec ${bas(sj)} : <b>${cap(d)}</b>.`; code = 'do + -s ; ?'; }
    else if (t === 'q1') { const m = r(R.t1); avant = ''; juste = 'Did'; faux = [cap(doT0(p)), p === 0 ? 'Were' : 'Was']; apres = bas(sj) + ' ' + v[0] + ' ' + c + ' ' + m; fin = '?';
      ex = `Une question à T-1 : <b>Did</b> passe devant et porte le -ed. Le verbe reste nu (${v[0]}).`; code = 'do + -ed ; ?'; }
    else if (t === 'ing') { const m = marq = r(R.ing), be = beT0(p); juste = be + ' ' + v[4]; faux = [p === 3 ? v[1] : v[0], (be === 'is' ? 'are' : 'is') + ' ' + v[4]]; apres = c + ' ' + m;
      ex = `${cap(m)} : l'action est en cours, be + -ing. Avec ${sj}, be devient ${be} : <b>${be} ${v[4]}</b>.`; code = 'be + -s + -ing'; }
    else if (t === 'ing1') { const m = marq = r(R.ing1), be = beT1(p); juste = be + ' ' + v[4]; faux = [v[2], (be === 'was' ? 'were' : 'was') + ' ' + v[4]]; apres = c + ' ' + m;
      ex = `Une action en cours dans le passé : be + -ed + -ing. Avec ${sj} : <b>${be} ${v[4]}</b>.`; code = 'be + -ed + -ing'; }
    else if (t === 'qIng') { const m = r(R.ing), be = beT0(p); avant = ''; juste = cap(be); faux = [cap(doT0(p)), cap(be === 'is' ? 'are' : 'is')]; apres = bas(sj) + ' ' + v[4] + ' ' + c + ' ' + m; fin = '?';
      ex = `Avec be + -ing, pas de do : <b>${cap(be)}</b> passe devant.`; code = 'be + -s + -ing ; ?'; }
    else if (t === 'en') { const m = r(R.en), h = hv(p); juste = h + ' ' + m + ' ' + v[3]; faux = [(h === 'has' ? 'have' : 'has') + ' ' + m + ' ' + v[3], h + ' ' + m + ' ' + v[0]]; apres = c;
      ex = `${cap(m)} : le résultat se voit maintenant, have + -en. Avec ${sj} : <b>${h} ${m} ${v[3]}</b>.`; code = 'have + -s + -en'; }
    else if (t === 'qEn') { avant = ''; const h = hv(p); juste = cap(h); faux = [cap(h === 'has' ? 'have' : 'has'), cap(doT0(p))]; apres = bas(sj) + ' ever ' + v[3] + ' ' + c; fin = '?';
      ex = `Avec have + -en, c'est have qui passe devant : <b>${cap(h)}</b>.`; code = 'have + -s + -en ; ?'; }
    else if (t === 'enIng') { const m = marq = r(R.enIng), h = hv(p); juste = h + ' been ' + v[4]; faux = [beT0(p) + ' ' + v[4], h + ' ' + v[4]]; apres = c + ' ' + m;
      ex = `${cap(m)} : ça a commencé avant et ça dure encore. have + -en + be + -ing : <b>${h} been ${v[4]}</b>.`; code = 'have + -s + -en ; be + -ing'; }
    else if (t === 't2') { const d = r(R.t2b); avant = d + ' ' + bas(sj); juste = 'had already ' + v[3]; faux = [hv(p) + ' already ' + v[3], 'already ' + v[2]]; apres = c;
      ex = `Deux moments passés : celui d'avant passe à T-2, had + -en. <b>had already ${v[3]}</b>.`; code = 'have + -ed + -en'; }
    else if (t === 'fut') { const m = marq = r(R.fut); juste = 'will ' + v[0]; faux = ['will ' + v[1], 'will ' + v[4]]; apres = c + ' ' + m;
      ex = `${cap(m)} : T+1. Après will, le verbe reste nu : <b>will ${v[0]}</b>.`; code = 'will'; }
    else if (t === 'negF') { const m = marq = r(R.fut); juste = 'won\'t ' + v[0]; faux = ['won\'t ' + v[1], 'don\'t ' + v[0]]; apres = c + ' ' + m;
      ex = `Will + not = <b>won't</b>, et le verbe reste nu.`; code = 'will ; not'; }
    else if (t === 'qF') { const m = r(R.fut); avant = ''; juste = 'Will'; faux = [cap(doT0(p)), 'Did']; apres = bas(sj) + ' ' + v[0] + ' ' + c + ' ' + m; fin = '?';
      ex = `T+1 : <b>Will</b> passe devant, le verbe reste nu.`; code = 'will ; ?'; }
    else if (t === 'go') { const m = marq = r(R.fut), be = beT0(p); juste = be + ' going to ' + v[0]; faux = [be + ' going to ' + v[1], (p === 3 ? 'go' : 'goes') + ' to ' + v[0]]; apres = c + ' ' + m;
      ex = `Un projet déjà décidé : be going to + verbe nu. <b>${be} going to ${v[0]}</b>.`; code = 'be + going to'; }
    else if (t === 'si') { avant = r(R.si) + ' ' + bas(sj); juste = 'would ' + v[0]; faux = ['will ' + v[0], 'would ' + v[2]]; apres = c;
      ex = `If + -ed : on s'éloigne de la réalité. La suite prend aussi le -ed : will + -ed = <b>would</b>, et le verbe reste nu.`; code = 'will + -ed'; }
    else if (t === 'pass0') { const m = r(R.t0), po = pluriel(c); avant = cap(c); juste = (po === 3 ? 'is ' : 'are ') + v[3]; faux = [(po === 3 ? 'is ' : 'are ') + v[0], v[3]]; apres = m;
      ex = `Le passif : ce qui compte, c'est l'action, pas qui la fait. be + -en : <b>${juste}</b>.`; code = 'be + -s + -en'; }
    else if (t === 'pass1') { const m = r(R.t1), po = pluriel(c); avant = cap(c); juste = (po === 3 ? 'was ' : 'were ') + v[3]; faux = [(po === 3 ? 'was ' : 'were ') + v[0], (po === 3 ? 'is ' : 'are ') + v[3]]; apres = m;
      ex = `Passif à T-1 : be + -ed + -en. <b>${juste}</b>.`; code = 'be + -ed + -en'; }
    else if (t === 'used') { const m = marq = r(R.used); juste = 'used to ' + v[0]; faux = ['use to ' + v[0], 'used to ' + v[4]]; apres = c + ' ' + m;
      ex = `Une habitude passée, finie : <b>used to</b> + verbe nu. Use + -ed.`; code = 'use + -ed'; }
    else if (t === 'mhave') { const [mo, e, cd] = r([['should have', 'Un regret ou un reproche : should + have + -en.', 'shall + -ed ; have + -en'], ['could have', 'Une possibilité passée qui ne s\'est pas faite : could + have + -en.', 'can + -ed ; have + -en'], ['might have', 'Peut-être, dans le passé : might + have + -en.', 'may + -ed ; have + -en']]);
      juste = mo + ' ' + v[3]; faux = [mo + ' ' + v[2], mo.replace(' have', '') + ' ' + v[2]]; apres = c; ex = `${e} <b>${juste}</b>.`; code = cd; }
    else { const [mo, e] = r(R.mod); juste = mo + ' ' + v[0]; faux = [mo + ' ' + v[1], mo + ' to ' + v[0]]; apres = c;
      ex = `${e} Après un modal, le verbe reste nu, sans to ni -s : <b>${mo} ${v[0]}</b>.`; code = mo; }
    faux = uniq(faux).filter(x => x !== juste).slice(0, 2);
    return { avant, juste, faux, apres, fin, comp: c, marq, ex, code, t, rap: k !== n && !TEMPS(n).includes(t) ? NOMS_T[t] : '', id: avant + '|' + juste + '|' + apres };
  }
  /* mémoire anti-répétition : on écarte les phrases déjà vues récemment */
  const lire = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  function nouvelle(n){
    const k = 'frg-vus-' + n, vus = lire(k, []); let x = phrase(n);
    for (let i = 0; i < 30 && vus.includes(x.id); i++) x = phrase(n);
    vus.push(x.id); ecrire(k, vus.slice(-800)); return x;
  }
  const entiere = x => (x.avant ? x.avant + ' ' : '') + x.juste + ' ' + x.apres + x.fin;
  window.FRGGen = { phrase, nouvelle, entiere, TEMPS, taille: () => V.length,
    /* question à choix : la phrase à trous */
    qcm(n){ const x = nouvelle(n); const ch = [x.juste, ...x.faux]; return { q: `<em>${x.avant ? x.avant + ' ' : ''}___ ${x.apres}${x.fin}</em>`, ch, b: 0, ex: x.ex, gen: 1, rap: x.rap }; },
    /* une phrase piégée : un mot faux à trouver */
    erreur(n){ let x = nouvelle(n), f = x.faux.find(y => y.split(' ').length === x.juste.split(' ').length); for (let i = 0; !f && i < 20; i++) { x = nouvelle(n); f = x.faux.find(y => y.split(' ').length === x.juste.split(' ').length); } if (!f) f = x.faux[0];
      const m = ((x.avant ? x.avant + ' ' : '') + f + ' ' + x.apres + x.fin).split(' '), deb = x.avant ? x.avant.split(' ').length : 0, lg = f.split(' ').length;
      const jm = x.juste.split(' '), fm = f.split(' '); let k = fm.findIndex((w, i) => w !== jm[i]); if (k < 0) k = 0;
      return { gen: 1, rap: x.rap, mots: m, faux: deb + k, bon: jm.length === fm.length ? jm[k] : x.juste, ex: x.ex, remplace: jm.length === fm.length ? null : { de: deb, lg } }; },
    /* une phrase juste, à reconstruire */
    blocs(n){ const x = nouvelle(n); let B;
      if (!x.avant) { const w = x.apres.split(' '); B = [x.juste, w[0], w.slice(1, 3).join(' '), w.slice(3).join(' ') + x.fin].filter(b => b && b !== x.fin); if (!/[?.]$/.test(B[B.length - 1])) B[B.length - 1] += x.fin; }
      else { const a = x.avant.split(/,\s*/); B = [...(a.length > 1 ? [a[0] + ','] : []), a[a.length - 1], x.juste]; if (x.marq && x.apres.endsWith(x.marq) && x.apres !== x.marq) B.push(x.comp, x.marq + x.fin); else B.push(x.apres + x.fin); }
      return { fr: '', blocs: B, gen: 1, rap: x.rap }; },
    juste(n){ return entiere(nouvelle(n)); },
    /* un message inventé, pour la radio : phrases du niveau, verbes marqués {mot|code} */
    message(n, nb = 5){ const L = []; for (let i = 0; i < nb; i++) { const x = nouvelle(n); L.push((x.avant ? x.avant + ' ' : '') + '{' + x.juste + '|' + x.code + '} ' + x.apres + x.fin); } return L; }
  };
})();
