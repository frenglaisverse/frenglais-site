window.MOD = {
  n: 4, arc: 1, titre: 'BE + -ING',
  objectif: 'À la fin de ce module, vous décrivez ce qui se passe en ce moment, et ce qui se passait quand quelque chose est arrivé.',
  rappel: [
    ['<em>Did she ___ the client?</em>', ['called', 'call', 'calls'], 1, 'Module 3 : did porte le code, le verbe redevient nu.'],
    ['<em>went</em> =', ['go + -ed', 'go + -s', 'un autre verbe'], 0, 'Module 3 : code invisible.'],
    ['<em>My boss ___ at 9.</em>', ['start', 'starts', 'starting'], 1, 'Module 2 : my boss = he ou she, -s.']
  ],
  choc: {
    visuel: 'rec',
    titre: '« Photo ou film ? »',
    enigme: 'En français, « je travaille » sert à tout. L\'anglais, lui, cadre chaque verbe : une <b>photo</b> (c\'est vrai en général) ou un <b>film</b> (ça tourne, là, maintenant). Cinq situations. À vous de cadrer.',
    jeu: [
      ['Je travaille à Lyon.', 'C\'est mon job, ma vie.', '<b>I work</b> in Lyon.', 'photo', 'On vous comprendra, mais « I\'m working in Lyon » sonne comme une mission provisoire, pas comme votre vie.'],
      ['Je travaille, rappelle-moi plus tard !', 'Là, maintenant, je suis dessus.', '<b>I\'m working</b>, call me back later!', 'film', '« I work, call me back » se comprend. Mais l\'action est en cours : l\'anglais filme.'],
      ['Il pleut beaucoup en Bretagne.', 'Une vérité générale.', 'It <b>rains</b> a lot in Brittany.', 'photo', 'Ça marche aussi. Mais pour une habitude, la photo est plus naturelle.'],
      ['Regarde, il pleut !', 'Ça tombe, sous nos yeux.', 'Look, it\'s <b>raining</b>!', 'film', '« Look, it rains » n\'est pas faux, on vous comprendra. Mais avec <em>look</em>, l\'anglais filme presque toujours.'],
      ['Je comprends.', 'Un état, pas une action.', 'I <b>understand</b>.', 'photo', 'Certains verbes d\'état (understand, know, like, agree) se filment rarement. On le voit à la carte 5.']
    ],
    regle: `<p><b>Toute phrase anglaise tient en trois blocs :</b> qui, fait quoi, à quoi. S + V + Cplt.</p>
      <div class="svc"><span class="h">S</span><span class="h">V</span><span class="h">CPLT</span><span>I</span><span class="v">work</span><span>in Lyon.</span><span>I</span><span class="v">am working</span><span>right now.</span></div>
      <p>Le V n'est pas toujours un seul mot : c'est un <b>groupe verbal</b>. <em>work</em>, ou <em>am working</em>. Et le temps est toujours porté par le premier mot du groupe : <em>am</em> = be + -s, donc T0.</p>
      <p><b>Retenez pour l'instant :</b> -ing ne vient jamais seul. Pas de <em>I working</em> : toujours <b>be</b> devant.</p>
      <p><b>Et l'anglais est souple.</b> « It rains » n'est pas faux : on vous comprendra. Mais quand ça se passe sous vos yeux (<em>look!</em>, <em>right now</em>), be + -ing est le choix naturel.</p>`,
    reponse: '<b>I work</b>, c\'est une photo : ma vie en général. <b>I am working</b>, c\'est la caméra qui tourne : là, maintenant, en cours.'
  },
  cartes: [
    ['BE + -ING = en cours', 'On prend be et on ajoute -ing au verbe : l\'action est en train de se dérouler.', '<em>I <b>am</b> work<b>ing</b>. She <b>is</b> call<b>ing</b> a client.</em>'],
    ['BE porte le code', 'Le verbe en -ing ne change jamais. C\'est be qui prend le temps : am, is, are à T0 ; was, were à T-1.', '<em>She is working (T0) · She was working (T-1)</em>'],
    ['Photo ou film', 'Photo (T0 simple) : une habitude, un fait. Film (be + -ing) : maintenant, ces jours-ci, en cours.', '<em>I work in Nice. · This week, I\'m working in Paris.</em>'],
    ['Le film interrompu', 'À T-1, be + -ing pose le décor ; -ed arrive et coupe la scène.', '<em>I <b>was checking</b> in a guest when the phone <b>rang</b>.</em>'],
    ['Certains verbes ne se filment pas', 'Les verbes d\'état restent presque toujours en photo : know, like, want, need, agree, understand, believe. L\'anglais reste souple (<em>I\'m loving it</em> existe), mais c\'est un effet de style, pas la règle.', '<em>I agree. (pas : I am agree) · I understand.</em>'],
    ['Nier et questionner', 'Be fait tout le travail : il prend not, ou il passe devant.', '<em>He isn\'t working today. · Are you working tomorrow?</em>']
  ],
  controle: [
    ['<em>Look! It ___.</em>', ['rains', 'is raining', 'rained'], 1, 'Carte 3 : maintenant, en cours = film.', '', { 0: '« It rains » fonctionne, on vous comprendra. Mais avec <em>Look!</em>, ça se passe sous vos yeux : <b>is raining</b> est la réponse la plus naturelle.' }],
    ['<em>I ___ dinner when you called.</em>', ['was cooking', 'am cooking', 'cooked'], 0, 'Carte 4 : le décor à T-1, interrompu par -ed.'],
    ['<em>I ___ with you.</em>', ['am agree', 'agree', 'am agreeing'], 1, 'Carte 5 : agree ne se filme pas.']
  ],
  vitre: {
    type: 'choix', titre: 'Photo ou film ?', consigne: 'Choisissez. Quand c\'est juste, le code apparaît au-dessus.',
    items: [
      { avant: 'Right now, the manager', options: ['talks', 'is talking'], bon: 1, apres: 'to a client.', code: 'be + -ing', note: 'Right now : on filme.' },
      { avant: 'She usually', options: ['takes', 'is taking'], bon: 0, apres: 'the train.', code: '-s', note: 'Usually : une habitude, une photo.' },
      { avant: 'When the alarm rang, we', options: ['were sleeping', 'slept'], bon: 0, apres: '.', code: 'be + -ed + -ing', note: 'Le décor de la scène, interrompu.' },
      { avant: 'I', options: ['know', 'am knowing'], bon: 0, apres: 'the answer.', code: '-s invisible', note: 'Know ne se filme pas.' },
      { avant: 'This week, {prenom}', options: ['works', 'is working'], bon: 1, apres: 'from home.', code: 'be + -s + -ing', note: 'This week : une période en cours.' },
      { avant: 'What', options: ['were you doing', 'did you doing'], bon: 0, apres: 'at 8 last night?', code: 'be + -ed + -ing', note: 'Be passe devant et porte le code.' }
    ]
  },
  ecoute: {
    intro: 'Adam rappelle Tom en plein service et lui laisse un message vocal.',
    lignes: [
      ['Adam', "Hey Tom, it's Adam. You called? Sorry, {I'm helping|be + -s + -ing} a guest right now."],
      ['Adam', "{She's looking|be + -s + -ing} for a taxi, and the phone {is ringing|be + -s + -ing} all the time."],
      ['Adam', "Max? {He's having|be + -s + -ing} lunch. He {isn't answering|be + -s + -ing} his phone, I know. He {was working|be + -ed + -ing} all morning, poor guy."],
      ['Adam', "And your report… so the system {crashed|-ed} while you {were preparing|be + -ed + -ing} it? Again?"],
      ['Adam', "I {think|-s invisible} it {needs|-s} an update. Call me back in ten minutes!"]
    ],
    q: [
      ['Que fait Adam en ce moment ?', ['Il déjeune', 'Il aide une cliente', 'Il écrit un rapport'], 1],
      ['Pourquoi Max ne répond pas ?', ['Il déjeune', 'Il est malade', 'Il est en réunion'], 0],
      ['Qu\'est-il arrivé à Tom ?', ['Le système a planté', 'Il a perdu le rapport', 'Il est en retard'], 0]
    ]
  },
  mecanisme: ["Pourquoi vous dites « I work » pour « je suis en train »", "En français, « je travaille » couvre deux idées : en ce moment, et en général. Votre cerveau n'a jamais eu à choisir. L'anglais vous oblige à décider à chaque verbe : photo ou film. Le réflexe se construit en posant la question, pas en apprenant une règle.", "<em>Je travaille (là) → I'm working. · Je travaille (en général) → I work.</em>"],
  franc: "On vous a appris le « présent continu » comme un temps de plus, avec sa liste de règles. Ce n'est pas un temps : c'est une brique, be + -ing, qui se pose sur T0 ou sur T-1. Toujours deux temps.",
  placer: [["She is talking to a client right now.", "T0", "be + -s + -ing", "Is : be porte le -s. On est à T0."], ["I was cooking when you called.", "T-1", "be + -ed + -ing ; -ed", "Was : be porte le -ed."], ["They visited Rome last year.", "T-1", "-ed", "Visited : le -ed se voit."]],
  catch: ["Les verbes d'état ne filment pas", "Know, like, want, need, agree décrivent un état, pas une action : pas de -ing.", "<em><s>I am knowing him.</s> → I know him.</em>"],
  machine: {"sujets": ["I", "She", "They"], "verbe": ["call", "calls", "called", "called", "calling"], "comp": {"pro": "the client", "hotel": "the guest", "luxe": "the client", "tour": "the group", "immo": "the buyer"}, "frc": {"pro": "le client", "hotel": "le client", "luxe": "la cliente", "tour": "le groupe", "immo": "l'acheteur"}, "cibles": [{"fr": "J'appelle {c} en ce moment.", "etat": {"sujet": "I", "be": true}, "ok": "Am porte le temps, calling ne bouge pas."}, {"fr": "Elle appelle {c} en ce moment.", "etat": {"sujet": "She", "be": true}, "ok": "Is = be + -s."}, {"fr": "Elle était en train d'appeler {c}.", "etat": {"sujet": "She", "t": "ed", "be": true}, "ok": "Was : be porte le -ed.", "indice": "En cours, mais dans le passé."}, {"fr": "Est-ce qu'ils sont en train d'appeler {c} ?", "etat": {"sujet": "They", "be": true, "forme": "q"}, "ok": "Be passe devant tout seul : pas de do."}, {"fr": "Elle appelle {c} tous les lundis.", "etat": {"sujet": "She"}, "ok": "Une habitude : pas de -ing. Soyez logique.", "indice": "Tous les lundis : une habitude, ou une action en cours ?"}]},
  code: [
    {"t": "traduire", "fr": "Je suis en train d'écrire un e-mail.", "bon": ["I'm writing an email", "I am writing an email", "I'm writing an e-mail", "I am writing an e-mail"], "code": "be + -s + -ing", "faux": ["-s", "be + -ed + -ing"], "ok": "Am porte le temps, writing ne bouge pas.", "indice": "En cours, maintenant : be + -ing."},
    {"t": "traduire", "fr": "Il pleuvait quand je suis parti.", "bon": ["It was raining when I left"], "code": "be + -ed + -ing ; -ed", "faux": ["be + -s + -ing ; -ed", "-ed ; -ed"], "ok": "Was raining : en cours à T-1. Left : l'action qui coupe.", "indice": "Deux actions : une en cours, une qui la coupe."},
    { t: 'trou', avant: 'Listen! Someone', apres: 'at the door. (knock)', bon: ['is knocking'], ex: 'Maintenant : be + -ing.' },
    { t: 'trou', avant: 'They', apres: 'when the boss arrived. (talk)', bon: ['were talking'], ex: 'Le décor à T-1 : were + -ing.' },
    { t: 'qcm', q: 'I ___ what you mean.', ch: ['understand', 'am understanding', 'understanding'], b: 0, ex: 'Understand ne se filme pas.' },
    { t: 'qcm', q: 'She ___ to work every day.', ch: ['is driving', 'drives', 'driving'], b: 1, ex: 'Every day : une habitude, photo.' },
    { t: 'erreur', mots: ['I', 'am', 'agree', 'with', 'you.'], faux: 1, bon: '', ok: 'Exact : <em>I agree.</em> Agree ne se filme pas, et il n\'a pas besoin de be.', ex: 'Agree ne se filme pas : cherchez le mot en trop.' },
    { t: 'qcm', q: 'Quelle question est juste ?', ch: ['What you are doing?', 'What are you doing?', 'What you doing?'], b: 1, ex: 'Pour questionner, be passe devant le sujet.' },
    { t: 'ordre', blocs: ['I was', 'checking the bill', 'when the client', 'came back.'], ex: 'Le décor, puis ce qui l\'interrompt.' },
    { t: 'trou', avant: 'He', apres: 'today. He is sick. (not / work)', bon: ['isn\'t working', 'is not working'], ex: 'Be + not + -ing.' }
  ],
  version: {
    titre: 'Ce que vous êtes en train de faire.', min: 4,
    consigne: 'En 4 à 6 phrases : ce que vous faites en ce moment dans votre vie (cette semaine, ce mois-ci), puis une scène passée : ce que vous faisiez quand quelque chose est arrivé.',
    exemple: 'This month, I am learning English. My team is preparing a big event. Yesterday, I was writing an email when my boss called me. He wanted a meeting.',
    relance: 'What are you doing en ce moment, dans votre vie ? Je check vos be + -ing.'
  },
  lamantin: {
    role: 'un collègue au téléphone',
    questions: ['Hi {prenom}, it\'s me! What are you doing right now?', 'And what is your team working on this week?', 'What were you doing yesterday at 5 pm?', 'Are you working this weekend?', 'What are you reading or watching at the moment?']
  },
  fluidite: 'Décrivez à voix haute ce qui se passe autour de vous, comme un reporter : en 90 secondes, puis 60, puis 45.',
  retenir: '<b>be + -ing</b> filme l\'action en cours. Be porte le code (is, was) ; le verbe en -ing ne change jamais. Les verbes d\'état (know, like, agree) restent en photo.',
  suite: 'Module 5 · HAVE + -EN'
};

/* ---------- parcours adaptatif ---------- */
(function(M){
  [ 'Right now : photo ou film ?', 'Usually : une habitude. Photo ou film ?', 'Une scène en cours, coupée par l\'alarme.', 'Know se filme-t-il ?', 'This week : une période en cours.', 'Be passe devant et porte le code de T-1.' ].forEach((a, i) => { if (M.vitre.items[i]) M.vitre.items[i].aide = a; });
  [ 'Look! : ça se passe maintenant.', 'Une action en cours, interrompue par called.', 'Agree est un verbe d\'état.' ].forEach((a, i) => { if (M.controle[i]) M.controle[i][4] = a; });
  M.nuances = [
    ['Le film qui agace', 'Always + be + -ing exprime une habitude qui énerve ou surprend. C\'est le seul cas où « toujours » se filme.', '<em>He\'s <b>always</b> forgetting his keys! · You\'re always complaining.</em>'],
    ['Think, have, see : deux sens', 'Certains verbes d\'état se filment quand ils changent de sens. Think = penser (avis) en photo, réfléchir en film. Have = posséder en photo, vivre une expérience en film.', '<em>I think it\'s a good idea. · I\'m thinking about it. · She has a car. · We\'re having lunch.</em>'],
    ['Be + -ing pour un projet', 'Un rendez-vous déjà organisé se dit en film à T0, même s\'il est demain. C\'est la façon la plus naturelle de parler d\'un plan fixé.', '<em>I\'m <b>meeting</b> the client tomorrow at 10.</em>'],
    ['Le film qui adoucit', 'Be + -ing rend une demande ou une remarque moins frontale. Très utile au téléphone et en réunion.', '<em>I <b>was wondering</b> if you had a minute. · We\'re hoping to finish today.</em>'],
    ['Les deux scènes en parallèle', 'Deux actions en cours en même temps à T-1 : while + be + -ing des deux côtés.', '<em><b>While</b> I was cooking, the kids were doing their homework.</em>']
  ];
  M.expert = { "titre": "Photo ou film : les cas qui piègent.", "items": [ [ "<em>I ___ about changing jobs, but I haven't decided yet.</em>", [ "think", "am thinking", "thought" ], 1, "Think = réfléchir, une réflexion en cours : film." ], [ "<em>This soup ___ amazing!</em>", [ "tastes", "is tasting", "taste" ], 0, "Taste = avoir un goût : verbe d'état, photo." ], [ "<em>He ___ late! It's so annoying.</em>", [ "always arrives", "always is arriving", "is always arriving" ], 2, "Always + film : l'habitude qui agace." ], [ "<em>We ___ the client at 3 pm tomorrow. It's in the calendar.</em>", [ "meet", "are meeting", "were meeting" ], 1, "Un rendez-vous organisé : film à T0." ], [ "<em>While she ___ the presentation, her phone ___.</em>", [ "was giving / rang", "gave / was ringing", "was giving / was ringing" ], 0, "Le décor en film (was giving), l'interruption en -ed (rang)." ], [ "<em>I ___ what you mean.</em>", [ "am seeing", "am see", "see" ], 2, "See = comprendre ici : verbe d'état, photo." ] ] };
})(window.MOD);

/* ---------- lecture ---------- */
window.MOD.lecture = {
 "titre": "Le point de l'équipe.",
 "tete": "De : David · Objet : Team update, Wednesday 11 am",
 "texte": "Hi all,\n\nHere{'s|be + -s} where we {are|be + -s} this morning.\n\nRight now, Tom {is presenting|be + -s + -ing} the new offer to the Johnson group. Anna {is working|be + -s + -ing} from home today because her son {is|be + -s} sick. The marketing team {is preparing|be + -s + -ing} the spring campaign, and they{'re testing|be + -s + -ing} two new slogans this week.\n\nOne problem: yesterday at 4 pm, when the power {went off|-ed invisible}, I {was sending|be + -ed + -ing} the invoices, so some of them {didn't leave|do + -ed ; not}. I{'m sending|be + -s + -ing} them again now.\n\nThanks,\nDavid",
 "q": [
  [
   "Pourquoi Anna travaille-t-elle de chez elle ?",
   [
    "Le bureau est fermé",
    "Son fils est malade",
    "Elle prépare la campagne"
   ],
   1,
   "« because her son is sick »"
  ],
  [
   "Que faisait l'auteur quand le courant a coupé ?",
   [
    "Il présentait l'offre",
    "Il était en réunion",
    "Il envoyait les factures"
   ],
   2,
   "« when the power went off, I was sending the invoices »"
  ],
  [
   "<em>they're testing two new slogans this week</em> : photo ou film ?",
   [
    "Film : en cours cette semaine",
    "Photo : une habitude",
    "Du passé"
   ],
   0,
   "This week : une période en cours, be + -ing."
  ]
 ]
};
