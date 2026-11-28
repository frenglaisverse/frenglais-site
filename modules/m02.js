window.MOD = {
  n: 2, arc: 1, titre: 'T0, le temps le plus simple',
  objectif: 'À la fin de ce module, vous parlez de votre routine, de votre métier et de vos goûts, et vous posez une question au présent sans hésiter.',
  rappel: [
    ['Une phrase anglaise, c\'est d\'abord…', ['qui, fait quoi, à quoi', 'le verbe, puis le sujet', 'un ordre libre'], 0, 'Module 1 : sujet, verbe, complément. Toujours.'],
    ['<em>I work in Nice.</em> Quel temps ?', ['T-1', 'T0', 'T+1'], 1, 'Module 1 : sans -ed, on est à T0.'],
    ['Combien y a-t-il de temps en anglais ?', ['Douze', 'Quatre', 'Deux, T-1 et T0'], 2, 'Module 1 : deux temps, deux codes. Le reste se pose autour.']
  ],
  choc: {
    visuel: 'roue',
    titre: '« She work at reception. »',
    enigme: 'La phrase se comprend. Pourtant, un anglophone l\'entend comme une voiture qui roule sur trois roues. Qu\'est-ce qui manque ?',
    reponse: 'La quatrième roue : le <b>-s</b>. <em>She works.</em> Avec he, she ou it, le présent porte un -s. Sans lui, la phrase avance, mais elle grince.'
  },
  cartes: [
    ['T0 a un seul code visible', 'Le -s s\'ajoute au verbe avec <b>he, she, it</b> et tout ce qu\'on peut remplacer par eux (my manager, the hotel). Avec I, you, we, they : pas de -s visible.', '<em>I work · she work<b>s</b> · the hotel open<b>s</b> at 7</em>'],
    ['Cinq usages du présent', 'Une habitude, une vérité générale, un goût, un état, un horaire. Tout ce qui est vrai en ce moment de votre vie, pas seulement maintenant.', '<em>I start at 8. Water boils at 100°. She likes tea. He lives in Monaco. The train leaves at 6.</em>'],
    ['-s, -es, -ies', 'On ajoute -es après s, sh, ch, x et o ; après une consonne, y devient -ies. L\'orthographe change, le code reste le même : -s.', '<em>wash → washes · go → goes · study → studies</em>'],
    ['Pour nier : do not, does not', 'On ne touche pas au verbe : on ajoute <b>don\'t</b> ou <b>doesn\'t</b> devant. Le -s déménage sur does, le verbe redevient nu.', '<em>She work<b>s</b> → She doe<b>s</b>n\'t work.</em>'],
    ['Pour questionner : do, does devant', 'Do ou does passe devant le sujet. Là aussi, le -s saute sur does.', '<em>Does she work today? · Do you like your job?</em>'],
    ['Les codes déguisés de T0', 'Trois verbes se déguisent : <b>have → has</b>, <b>be → is</b> (am, are avec I, you, we, they), et <b>do → does</b>, qui se prononce « deuz ». Le code -s est là, simplement déguisé.', '<em>{prenom} has a meeting. · She is in Nice. · He does the reports.</em>']
  ],
  controle: [
    ['<em>My colleague ___ English.</em>', ['speak', 'speaks', 'speaking'], 1, 'Carte 1 : my colleague = he ou she, donc -s.'],
    ['<em>She ___ like coffee.</em>', ['don\'t', 'doesn\'t', 'not'], 1, 'Carte 4 : avec she, c\'est doesn\'t. Le -s a déménagé.'],
    ['<em>Does he ___ on Sundays?</em>', ['works', 'work', 'working'], 1, 'Carte 5 : le -s est sur does, le verbe redevient nu.']
  ],
  vitre: {
    type: 'choix', titre: 'Où va le -s ?', consigne: 'Choisissez la bonne forme. Quand c\'est juste, le code apparaît au-dessus du verbe.',
    items: [
      { avant: 'The manager', options: ['check', 'checks'], bon: 1, apres: 'the bookings every morning.', code: '-s', note: 'The manager = he ou she : -s.' },
      { avant: 'We', options: ['open', 'opens'], bon: 0, apres: 'at nine.', code: '-s invisible', note: 'Avec we, le code -s existe mais ne se voit pas.' },
      { avant: '{prenom}', options: ['have', 'has'], bon: 1, apres: 'two meetings today.', code: 'have + -s', note: 'Code invisible : has = have + -s.' },
      { avant: 'She', options: ['doesn\'t', 'don\'t'], bon: 0, apres: 'work on Mondays.', code: 'do + -s', note: 'Le -s déménage sur does.' },
      { avant: '', options: ['Does', 'Do'], bon: 0, apres: 'your boss speak English?', code: 'do + -s', note: 'Your boss = he ou she : does.' },
      { avant: 'The shop', options: ['close', 'closes'], bon: 1, apres: 'at 7 pm.', code: '-s', note: 'Un horaire, troisième personne : -s.' }
    ]
  },
  ecoute: {
    intro: 'Mark laisse un message vocal à Nina, qui commence lundi. Écoutez autant de fois que vous voulez, puis répondez.',
    lignes: [
      ['Mark', "Hi Nina, Mark here. Welcome aboard! A few tips for Monday."],
      ['Mark', "I {start|-s invisible} at eight, but Julia {opens|-s} the office at seven thirty."],
      ['Mark', "And what {does|do + -s} she do after that? She {checks|-s} the emails, then she {calls|-s} the clients. I {prepare|-s invisible} the meetings."],
      ['Mark', "Now, Saturdays. {Do|do, -s invisible} we work? Me, no, I {don't|do + not, -s invisible}."],
      ['Mark', "Julia {works|-s} one Saturday a month, but she {doesn't|do + -s + not} mind."],
      ['Mark', "And the boss? He {has|have + -s} lunch with us every Friday. He {loves|-s} Italian food, so… pizza day! See you Monday."]
    ],
    q: [
      ['Qui ouvre le bureau ?', ['Mark', 'Julia', 'Le patron'], 1],
      ['Julia travaille le samedi…', ['jamais', 'un samedi par mois', 'tous les samedis'], 1],
      ['Que fait le patron le vendredi ?', ['Il déjeune avec l\'équipe', 'Il ne vient pas', 'Il appelle les clients'], 0]
    ]
  },
  franc: 'Vous avez « fait » le présent en sixième. Et il y a de bonnes chances que vous disiez encore <em>she work</em>. Ce n\'est pas un problème de niveau. C\'est qu\'on vous a fait réciter une règle sans jamais vous faire sentir ce que coûte son oubli. Ici, chaque -s oublié se voit.',
  mecanisme: ['Pourquoi vous oubliez le -s', 'À l\'oral, le français ne marque presque plus la personne : <em>je parle, tu parles, il parle, ils parlent</em> se prononcent pareil. Votre oreille a donc appris à ignorer les terminaisons. Quand l\'anglais en garde une seule, votre cerveau la classe comme un bruit. Ce n\'est pas de la négligence : c\'est un réflexe à remplacer, et un réflexe ne se remplace qu\'en le pratiquant.', '<em>il parle = ils parlent (à l\'oreille) · he speak<b>s</b> ≠ they speak</em>'],
  placer: [
    ['I work in Nice.', 'T0', '-s invisible', 'Pas de -ed : la phrase vit à T0.'],
    ['She called this morning.', 'T-1', '-ed', 'Called : le code -ed se voit.'],
    ['The hotel opens at seven.', 'T0', '-s', 'Opens : le code -s se voit.']
  ],
  catch: ['Un seul -s par phrase', 'Dès que do ou does apparaît, le verbe redevient nu. Deux -s dans la même phrase, c\'est un code de trop.', '<em><s>She doesn\'t works.</s> → She doesn\'t work.</em>'],
  nobody: ['« I work » ou « I am working » ?', 'Vous avez peut-être appris à hésiter entre les deux. Dans une vraie conversation, le message passe dans les deux cas. On posera BE + -ING au module 4. D\'ici là, T0 suffit pour tout dire.', '<em>I work here. · I\'m working here. → on vous comprend.</em>'],
  racine: ['Pourquoi un seul -s ?', 'Il y a mille ans, l\'anglais conjuguait comme le français : une terminaison par personne. Elles sont toutes tombées, sauf une. Chez Shakespeare, on lit encore <em>he singeth</em>. Le -s de he, she, it est la dernière survivante.', '<em>he singeth → he sings</em>'],
  machine: {
    sujets: ['I', 'She', 'They'], verbe: ['work', 'works', 'worked', 'worked', 'working'],
    comp: { pro:'with international clients', hotel:'at reception', luxe:'in a boutique', tour:'with tourists', immo:'in an agency' },
    frc: { pro:'avec des clients internationaux', hotel:'à la réception', luxe:'en boutique', tour:'avec des touristes', immo:'en agence' },
    cibles: [
      { fr: 'Je travaille {c}.', etat: { sujet:'I' }, ok: 'Avec I, le -s ne se voit pas. Le code, lui, est bien là.' },
      { fr: 'Elle travaille {c}.', etat: { sujet:'She' }, ok: 'She : le -s se voit.', indice: 'Qui fait l\'action ?' },
      { fr: 'Elle ne travaille pas {c}.', etat: { sujet:'She', forme:'neg' }, ok: 'Le -s a déménagé sur does.' },
      { fr: 'Est-ce qu\'ils travaillent {c} ?', etat: { sujet:'They', forme:'q' }, ok: 'Do passe devant. Rien d\'autre ne bouge.' },
      { fr: 'Est-ce qu\'elle travaille {c} ?', etat: { sujet:'She', forme:'q' }, ok: 'Does devant, verbe nu. Vous avez la boîte en main.' }
    ]
  },
  code: [
    { t: 'traduire', fr: 'Mon responsable parle anglais.', aide: 'responsable = <em>manager</em> · parler = <em>speak</em> · anglais = <em>English</em> (avec majuscule)', bon: ['My manager speaks English', 'My boss speaks English'], code: '-s', faux: ['-ed', 'do + -s'], ok: 'My manager = he ou she : le -s se voit.', indice: 'Qui ? My manager. Fait quoi ? À quoi ?' },
    { t: 'traduire', fr: 'Je ne travaille pas le lundi.', aide: 'travailler = <em>work</em> · ne… pas = <em>don\'t</em> · le lundi = <em>on Mondays</em>', bon: ["I don't work on Mondays", "I don't work on Monday", "I don't work Mondays"], code: '-s invisible ; do + not', faux: ['-ed ; do + not', '-s ; be + not'], ok: 'Do porte le temps, not le suit, le verbe reste nu.', indice: 'Pour nier à T0 : do + not devant le verbe.' },
    { t: 'trou', avant: 'She', apres: 'Spanish. (not / speak)', bon: ['doesn\'t speak', 'does not speak'], ex: 'Négation avec she : doesn\'t + verbe nu.' },
    { t: 'qcm', q: '___ your company have an office in London?', ch: ['Do', 'Does', 'Is'], b: 1, ex: 'Your company = it : does.' },
    { t: 'erreur', mots: ['My', 'boss', 'speak', 'three', 'languages.'], faux: 2, bon: 'speaks', ex: 'Cherchez le verbe : my boss = he ou she.' },
    { t: 'erreur', mots: ['Does', 'she', 'works', 'here?'], faux: 2, bon: 'work', ex: 'Le -s est déjà sur does.' },
    { t: 'ordre', blocs: ['The restaurant', 'doesn\'t open', 'on Mondays.'], ex: 'Qui ? Fait quoi ? Quand ?' },
    { t: 'trou', avant: 'My assistant', apres: 'to the gym after work. (go)', bon: ['goes'], ex: 'Go devient goes : -es après o.' }
  ],
  version: {
    titre: 'Votre journée type.', min: 4,
    consigne: 'En 4 à 6 phrases, au présent : à quelle heure vous commencez, ce que vous faites, ce que fait un collègue (avec -s), ce que vous ne faites pas, et ce que vous aimez dans votre travail.',
    exemple: 'I start at 8. I answer the emails first. My colleague Paul checks the reservations. I don\'t work on Sundays. I like my job because I meet people every day.',
    relance: 'Racontez-moi votre journée type. Je check vos -s.'
  },
  lamantin: {
    role: 'un nouveau collègue curieux',
    questions: ['Hi {prenom}! I\'m new here. What time do you start in the morning?', 'And what does your manager do?', 'Do you work on weekends?', 'What do you like in your job?', 'Does your company have clients abroad?']
  },
  fluidite: 'Racontez votre routine à voix haute, du réveil au soir : en 90 secondes, puis 60, puis 45. Mêmes idées, plus d\'aisance.',
  retenir: 'À T0, un seul code visible : <b>-s</b> avec he, she, it. Pour nier ou questionner, do / does fait le travail et le -s déménage dessus.',
  suite: 'Module 3 · T-1, toujours simple'
};

/* ---------- parcours adaptatif ---------- */
(function(M){
  [ 'Remplacez « the manager » par un pronom : he ou she ?', 'Avec we, le code -s se voit-il ?', '{prenom} = he ou she. Et have se déguise…',
    'Le -s doit bien aller quelque part : sur do.', 'Your boss = he ou she : quelle forme de do ?', 'The shop = it.' ].forEach((a, i) => { if (M.vitre.items[i]) M.vitre.items[i].aide = a; });
  [ 'My colleague = he ou she ?', 'Avec she, c\'est do qui prend le -s.', 'Le -s est déjà sur does : que devient le verbe ?' ].forEach((a, i) => { if (M.controle[i]) M.controle[i][4] = a; });
  M.nuances = [
    ['T0 qui parle du futur', 'Un horaire officiel ou un programme fixé se dit à T0, même s\'il est demain. C\'est une vérité du calendrier, donc une photo.', '<em>The train leave<b>s</b> at 6:40 tomorrow. · The conference start<b>s</b> on Monday.</em>'],
    ['Do pour insister', 'Dans une phrase affirmative, do / does ajoute de la force, comme « vraiment » ou « si, si ». Le -s passe sur does, le verbe redevient nu.', '<em>I <b>do</b> like your idea. · She <b>does</b> work hard, believe me.</em>'],
    ['Le -s s\'entend de trois façons', 'Works se dit avec un « s », plays avec un « z », watches avec « iz ». À l\'oral, ce petit son est le seul signe de T0 : si vous l\'avalez, la phrase grince.', '<em>works /s/ · plays /z/ · watches /iz/</em>'],
    ['Each, everybody, neither : un par un', 'Ces mots regardent les gens un par un, donc ils prennent le -s, même quand on pense à un groupe.', '<em>Every guest receive<b>s</b> a key. · Neither of them speak<b>s</b> French.</em>'],
    ['The team : un ou plusieurs ?', 'En américain, the team, the staff, the company prennent le -s (une entité). En britannique, on entend aussi « the team are ». Les deux existent : soyez cohérent.', '<em>US : The team work<b>s</b> remotely. · UK : The team are working remotely.</em>']
  ];
  M.expert = { "titre": "T0, terrain glissant.", "items": [ [ "<em>The news ___ good this morning.</em>", [ "are", "be", "is" ], 2, "News est singulier en anglais : is. Comme information, advice." ], [ "<em>What time ___ the restaurant open on Sundays?</em>", [ "do", "does", "is" ], 1, "The restaurant = it : does porte le -s, open reste nu." ], [ "<em>Everyone in the office ___ the new manager.</em>", [ "likes", "like", "are liking" ], 0, "Everyone se regarde un par un : -s. Et like ne se filme pas." ], [ "<em>She ___ to the gym twice a week, but she ___ it.</em>", [ "go / don't enjoy", "goes / doesn't enjoys", "goes / doesn't enjoy" ], 2, "Deux verbes, deux codes : goes, puis doesn't + verbe nu." ], [ "<em>Who ___ the keys to the meeting room?</em>", [ "have", "has", "does have" ], 1, "Quand who est le sujet, pas de does : who = une personne, donc has." ], [ "<em>Neither of my colleagues ___ Spanish.</em>", [ "speaks", "speak", "speaking" ], 0, "Neither regarde un par un : speaks (on entend parfois speak à l'oral, mais l'écrit soigné garde le -s)." ] ] };
})(window.MOD);

/* ---------- lecture ---------- */
window.MOD.lecture = {
 "titre": "Un e-mail de bienvenue.",
 "tete": "De : Laura · Objet : Your first week",
 "texte": "Hi {prenom},\n\nWelcome to the team! Here{'s|be + -s} how a normal day {works|-s}.\n\nJulia {opens|-s} the office at 7:30, but most of us {arrive|-s invisible} around nine. Sophie {manages|-s} the bookings and {answers|-s} the phone in the morning. I usually {check|-s invisible} my emails first, then I {meet|-s invisible} the clients.\n\nWe {don't work|do + -s ; not} on Sundays, and the café downstairs {offers|-s} us a free coffee on Fridays.\n\nIf you {need|-s invisible} anything, ask Mark: he {knows|-s} everything about the printers!\n\nSee you on Monday,\nLaura",
 "q": [
  [
   "Que fait Sophie le matin ?",
   [
    "Elle ouvre le bureau",
    "Elle rencontre les clients",
    "Elle gère les réservations et répond au téléphone"
   ],
   2,
   "« Sophie manages the bookings and answers the phone in the morning. »"
  ],
  [
   "Quand le café est-il offert ?",
   [
    "Le vendredi",
    "Le lundi",
    "Tous les jours"
   ],
   0,
   "« a free coffee on Fridays »"
  ],
  [
   "Dans « he knows everything », pourquoi <em>knows</em> ?",
   [
    "C'est du passé",
    "He : code -s",
    "C'est un pluriel"
   ],
   1,
   "He, she, it à T0 : le -s se voit."
  ]
 ]
};
