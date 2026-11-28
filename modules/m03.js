window.MOD = {
  n: 3, arc: 1, titre: 'T-1, toujours simple', exp: [{ x: 'paquets', ou: 'courbe' }],
  objectif: 'À la fin de ce module, vous racontez votre week-end ou votre journée de travail d\'hier, et vous repérez le -ed même quand il se cache.',
  rappel: [
    ['<em>She ___ in a bank.</em>', ['work', 'works', 'working'], 1, 'Module 2 : she, donc -s.'],
    ['<em>___ he speak English?</em>', ['Do', 'Does', 'Is'], 1, 'Module 2 : he, donc does.'],
    ['Sur la Courbe, T-1 porte le code…', ['-s', '-ed', '-ing'], 1, 'Module 1 : T-1 = -ed.']
  ],
  choc: {
    visuel: 'uv',
    titre: '« went » n\'a pas de -ed ?',
    enigme: 'On vous a appris une liste de 150 verbes irréguliers à réciter. Et si leur -ed était là, simplement écrit à l\'encre invisible ?',
    reponse: 'Passez la lampe : <b>went = go + -ed</b>. Les irréguliers ne trichent pas, ils cachent leur code. Vous n\'avez pas à les réciter : vous les reconnaîtrez au fil des modules.'
  },
  cartes: [
    ['T-1 = détaché du présent', 'Le code -ed marque tout ce qui est fini, coupé de maintenant : hier, la semaine dernière, en 2019.', '<em>I call<b>ed</b> the client yesterday.</em>'],
    ['Un seul code pour tout le monde', 'À T-1, pas de -s : I, you, he, she, we, they prennent tous -ed.', '<em>I work<b>ed</b> · she work<b>ed</b> · they work<b>ed</b></em>'],
    ['-ed, -d, -ied, consonne doublée', 'On ajoute -d après un e ; après une consonne, y devient -ied ; et quand le verbe finit par consonne + voyelle + consonne, avec l\'accent sur la fin, la dernière consonne se double.', '<em>arrive → arrived · study → studied · stop → stopped · mais visit → visited</em>'],
    ['Le code invisible', 'Certains verbes écrivent leur -ed à l\'encre invisible : went, ate, had, saw, took… Le code est là, le temps est T-1.', '<em>{prenom} <b>went</b> to Paris. (go + -ed)</em>'],
    ['Nier et questionner : did', 'Did porte le -ed et le verbe redevient nu. Jamais deux codes dans la même phrase.', '<em>I didn\'t call. · Did you call?</em>'],
    ['Les repères de T-1', 'Yesterday, last week, last year, ago, in 2020 : ils annoncent T-1, donc -ed.', '<em>Two days ago, we <b>opened</b> a new office.</em>']
  ],
  controle: [
    ['<em>Yesterday, she ___ the report.</em>', ['finish', 'finishes', 'finished'], 2, 'Carte 6 : yesterday, donc T-1, donc -ed.'],
    ['<em>Did you ___ the email?</em>', ['sent', 'send', 'sends'], 1, 'Carte 5 : le code est sur did, le verbe redevient nu.'],
    ['<em>took</em>, c\'est…', ['take + -ed, code invisible', 'un autre temps', 'un participe'], 0, 'Carte 4 : took = take + -ed.']
  ],
  vitre: {
    type: 'reveal', titre: 'Passez la lampe UV.', consigne: 'Touchez chaque verbe : son code invisible s\'allume.',
    items: [
      { mot: 'went', code: 'go + -ed' }, { mot: 'ate', code: 'eat + -ed' }, { mot: 'had', code: 'have + -ed' }, { mot: 'saw', code: 'see + -ed' },
      { mot: 'took', code: 'take + -ed' }, { mot: 'made', code: 'make + -ed' }, { mot: 'got', code: 'get + -ed' }, { mot: 'came', code: 'come + -ed' },
      { mot: 'said', code: 'say + -ed' }, { mot: 'told', code: 'tell + -ed' }
    ]
  },
  ecoute: {
    intro: 'Lundi matin, Lou laisse un message vocal à son collègue Sam sur un incident de vendredi soir.',
    lignes: [
      ['Lou', "Hey Sam, Lou here. You {heard|hear + -ed} about Friday night? Yeah, I {had|have + -ed} a problem."],
      ['Lou', "A client {called|-ed} at eleven. The heating {stopped|-ed} in his room."],
      ['Lou', "So what {did|do + -ed} I do? I {moved|-ed} him to another room, and I {sent|send + -ed} a message to the technician."],
      ['Lou', "{Did|do + -ed} he come? Yeah, he {came|come + -ed} on Saturday morning and {fixed|-ed} it in ten minutes."],
      ['Lou', "And the client? He {left|leave + -ed} a great review. He actually {liked|-ed} the new room better! Friday night {was|be + -ed} a success, in the end."]
    ],
    q: [
      ['Quel était le problème ?', ['Le chauffage', 'La clé', 'Le bruit'], 0],
      ['Quand le technicien est-il venu ?', ['Vendredi soir', 'Samedi matin', 'Lundi'], 1],
      ['Comment a réagi le client ?', ['Il est parti fâché', 'Il a laissé un très bon avis', 'Il a demandé un remboursement'], 1]
    ]
  },
  franc: 'On vous a fait réciter des colonnes de verbes irréguliers. Combien en sortez-vous sans réfléchir, au milieu d\'une phrase ? Réciter n\'est pas parler. Ce tableau était un test de mémoire déguisé en cours d\'anglais. On ne le récitera pas ici : on va comprendre ce qu\'il cachait.',
  mecanisme: ['Pourquoi vous dites « I have seen him yesterday »', 'Parce que <em>j\'ai vu</em> et <em>I have seen</em> se ressemblent : avoir + participe. Vous calquez la forme. Or l\'anglais ne choisit pas selon la forme, il choisit selon le moment : fini et daté (yesterday, last week, in 2019), c\'est -ed. Tant que vous traduisez des formes au lieu de placer des moments sur la Courbe, l\'erreur reviendra.', '<em>Hier, j\'ai vu Paul. → Yesterday, I <b>saw</b> Paul.</em>'],
  placer: [
    ['She checks the emails.', 'T0', '-s', 'Checks : le code -s se voit.'],
    ['I saw this bag yesterday.', 'T-1', 'see + -ed, code invisible', 'Saw = see + -ed. Et yesterday annonce T-1.'],
    ['He doesn\'t work on Mondays.', 'T0', '-s ; do + not', 'Does porte le -s : T0.']
  ],
  catch: ['Jamais deux -ed', 'Dès que did apparaît, le verbe redevient nu. « Did you went » : deux codes pour une seule phrase, c\'est un de trop.', '<em><s>Did you went?</s> → Did you go?</em>'],
  nobody: ['J\'ai vécu, je vivais, je vécus', 'Trois passés en français, un seul code en anglais. N\'essayez pas de faire correspondre les temps : si c\'est fini et détaché de maintenant, c\'est -ed.', '<em>I lived in Florida. = j\'ai vécu, je vivais, je vécus en Floride</em>'],
  racine: ['Pourquoi « went » ?', 'Go n\'a jamais eu de passé à lui. Il a pris celui d\'un autre verbe, <em>wend</em> (cheminer), qui faisait went. Les irréguliers sont les verbes les plus anciens et les plus usés de la langue : l\'usage les a polis au lieu de les ranger. Voilà pourquoi on les rencontre, on ne les récite pas.', '<em>go · went (emprunté à wend) · gone</em>'],
  machine: {
    sujets: ['I', 'She', 'They'], verbe: ['work', 'works', 'worked', 'worked', 'working'],
    comp: { pro:'with international clients', hotel:'at reception', luxe:'in a boutique', tour:'with tourists', immo:'in an agency' },
    frc: { pro:'avec des clients internationaux', hotel:'à la réception', luxe:'en boutique', tour:'avec des touristes', immo:'en agence' },
    cibles: [
      { fr: 'J\'ai travaillé {c}. (hier)', etat: { sujet:'I', t:'ed' }, ok: 'Passé composé en français, -ed en anglais.', indice: 'Hier : quel repère sur la Courbe ?' },
      { fr: 'Elle travaillait {c}. (en 2019)', etat: { sujet:'She', t:'ed' }, ok: 'Imparfait ou passé composé : même code. Et plus de -s à T-1.' },
      { fr: 'Elle n\'a pas travaillé {c}. (hier)', etat: { sujet:'She', t:'ed', forme:'neg' }, ok: 'Le -ed est sur did, le verbe redevient nu.' },
      { fr: 'Est-ce qu\'ils ont travaillé {c} ? (la semaine dernière)', etat: { sujet:'They', t:'ed', forme:'q' }, ok: 'Did devant. Un seul code.' },
      { fr: 'Elle travaille {c}. (tous les jours)', etat: { sujet:'She', t:'s' }, ok: 'Soyez logique : tous les jours, c\'est T0. Vous changez de vitesse sans y penser.', indice: 'Tous les jours : est-ce fini ?' }
    ]
  },
  code: [
    { t: 'traduire', fr: 'Hier, j\'ai appelé le client.', aide: 'hier = <em>yesterday</em> · appeler = <em>call</em> · le client = <em>the client</em>', bon: ['Yesterday, I called the client', 'Yesterday I called the client', 'I called the client yesterday'], code: '-ed', faux: ['-s ; have + -en', '-s'], ok: 'Hier est daté et fini : T-1. Le français dit « j\'ai appelé », l\'anglais dit -ed.', indice: 'Hier : quel repère ? Donc quel code ?' },
    { t: 'traduire', fr: 'Elle n\'est pas venue lundi.', aide: 'venir = <em>come</em> · ne… pas, au passé = <em>didn\'t</em> · lundi = <em>on Monday</em>', bon: ["She didn't come on Monday", "She didn't come Monday"], code: '-ed ; do + not', faux: ['-ed ; be + not', '-s ; do + not'], ok: 'Did porte le -ed, come redevient nu.', indice: 'Pour nier à T-1 : did + not, puis le verbe nu.' },
    { t: 'qcm', q: 'Yesterday, I ___ a plane to Rome.', ch: ['have taken', 'took', 'take'], b: 1, ex: 'Yesterday est daté et fini : T-1, donc -ed. Took = take + -ed, sans have.' },
    { t: 'trou', avant: 'She', apres: 'the meeting yesterday. (organize)', bon: ['organized', 'organised'], ex: 'Organize + -d.' },
    { t: 'trou', avant: 'I', apres: 'the file. (not / receive)', bon: ['didn\'t receive', 'did not receive'], ex: 'Négation : didn\'t + verbe nu.' },
    { t: 'qcm', q: '___ they arrive on time?', ch: ['Do', 'Did', 'Does'], b: 1, ex: 'Une question à T-1 : did.' },
    { t: 'erreur', mots: ['Did', 'you', 'went', 'to', 'the', 'meeting?'], faux: 2, bon: 'go', ex: 'Le code est sur did : le verbe redevient nu.' },
    { t: 'ordre', blocs: ['Two days ago,', 'the guests', 'checked out', 'early.'], ex: 'Le repère de temps, puis qui, fait quoi.' },
    { t: 'trou', avant: 'He', apres: 'lunch with the team. (have)', bon: ['had'], ex: 'Have + -ed = had.' }
  ],
  version: {
    titre: 'Votre week-end, ou votre dernière journée de travail.', min: 4,
    consigne: 'En 4 à 6 phrases, à T-1 : où vous êtes allé, ce que vous avez fait, avec qui, une chose que vous n\'avez pas faite. Utilisez au moins un verbe à code invisible.',
    exemple: 'Last Saturday, I went to the market with my wife. We bought fresh fish. In the evening, we watched a film. I didn\'t work on Sunday.',
    relance: 'Racontez-moi votre week-end. Je check vos -ed, même invisibles. Go!'
  },
  lamantin: {
    role: 'un ami qui revient de vacances',
    questions: ['Hey {prenom}! What did you do last weekend?', 'Where did you go?', 'Who did you see there?', 'Did you eat something good?', 'What did you do yesterday at work?']
  },
  fluidite: 'Racontez votre journée d\'hier à voix haute : en 90 secondes, puis 60, puis 45. Chaque verbe porte son -ed, visible ou invisible.',
  retenir: 'À T-1, tout le monde prend <b>-ed</b>, parfois à l\'encre invisible (went = go + -ed). Pour nier ou questionner, <b>did</b> porte le code et le verbe redevient nu.',
  suite: 'Module 4 · BE + -ING'
};

/* ---------- parcours adaptatif ---------- */
(function(M){
  [ 'Yesterday : quel temps ? Et quel code ?', 'Le code est déjà sur did : que devient le verbe ?', 'Took vient d\'un verbe que vous connaissez. Lequel ?' ].forEach((a, i) => { if (M.controle[i]) M.controle[i][4] = a; });
  M.nuances = [
    ['Used to : l\'habitude finie', 'Pour une habitude du passé qui n\'existe plus, used to + verbe nu. Le code -ed est sur used.', '<em>I <b>used to</b> work in Paris. (j\'y travaillais, plus maintenant)</em>'],
    ['Would : le souvenir qui revient', 'Dans un récit, would raconte une habitude passée avec une touche de nostalgie. Seulement pour des actions, jamais pour un état.', '<em>Every summer, we <b>would</b> drive to the coast.</em>'],
    ['Le -ed s\'entend de trois façons', 'Worked se dit « t », played « d », wanted « id ». Le « id » n\'apparaît qu\'après t ou d : c\'est la seule fois où le -ed ajoute une syllabe.', '<em>worked /t/ · played /d/ · wanted /id/</em>'],
    ['T-1 pour la politesse', 'T-1 éloigne la demande, donc l\'adoucit. « I wanted to ask you » est plus poli que « I want to ask you », même si c\'est maintenant.', '<em>I <b>was</b> wondering if you could help me. · I <b>wanted</b> to ask you something.</em>'],
    ['Ago compte à partir de maintenant', 'Ago se place après la durée et part du moment où l\'on parle. Jamais avec since, jamais avec HAVE + -EN.', '<em>She left two hours <b>ago</b>. (pas : since two hours)</em>']
  ];
  M.expert = { "titre": "T-1, terrain glissant.", "items": [ [ "<em>I ___ to call you, but I ___ my phone at home.</em>", [ "wanted / left", "want / leave", "wanted / leaved" ], 0, "Deux actions à T-1, deux codes : wanted (visible), left (leave + -ed, invisible)." ], [ "<em>Where ___ you ___ your last holiday?</em>", [ "did / spent", "do / spent", "did / spend" ], 2, "Did porte le -ed, spend reste nu. Jamais deux codes." ], [ "<em>When I was a student, I ___ in a bar on weekends.</em>", [ "use to work", "used to work", "used to worked" ], 1, "Used to : le -ed est sur used, work reste nu." ], [ "<em>He ___ the meeting because nobody ___ him.</em>", [ "missed / told", "misses / told", "missed / tell" ], 0, "Be logical : tout le récit est à T-1. Told = tell + -ed." ], [ "<em>I ___ you were coming today!</em>", [ "don't knew", "didn't knew", "didn't know" ], 2, "Didn't porte le code, know reste nu." ], [ "<em>She ___ in Miami for two years, then she moved back to France.</em>", [ "has lived", "lived", "lives" ], 1, "Une période terminée (then she moved back) : T-1 simple." ] ] };
})(window.MOD);

/* ---------- lecture ---------- */
window.MOD.lecture = {
 "titre": "Un rapport d'incident.",
 "tete": "De : Lou · Objet : Incident report, Friday night",
 "texte": "Hi team,\n\nQuick report on Friday night.\n\nAt 10 pm, a guest {called|-ed} reception because the lift {stopped|-ed} between two floors. Our technician {arrived|-ed} ten minutes later and {opened|-ed} the doors. Nobody {was hurt|be + -ed + -en}.\n\nThe guest {stayed|-ed} very calm, but she {didn't want|do + -ed ; not} to take the lift again, so we {gave|-ed invisible} her a room on the first floor.\n\nOn Saturday, the company {repaired|-ed} the lift and {tested|-ed} it twice.\n\nBest,\nLou",
 "q": [
  [
   "Que s'est-il passé ?",
   [
    "L'ascenseur s'est bloqué entre deux étages",
    "Le chauffage est tombé en panne",
    "Une cliente s'est blessée"
   ],
   0,
   "« the lift stopped between two floors »"
  ],
  [
   "Pourquoi lui a-t-on donné une autre chambre ?",
   [
    "Sa chambre était sale",
    "Elle ne voulait plus prendre l'ascenseur",
    "Elle l'avait réservée"
   ],
   1,
   "« she didn't want to take the lift again »"
  ],
  [
   "<em>gave</em> = ?",
   [
    "go + -ed",
    "get + -ed",
    "give + -ed"
   ],
   2,
   "Code invisible : gave = give + -ed."
  ]
 ]
};
