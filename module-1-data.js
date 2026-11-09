/* Module 1 · Tout l'anglais tient sur une ligne — contenu, en cinq versions de secteur.
   Codes dans les dialogues : {mot|s} ou {mot|ed} ; {mot|ed|inv} = code invisible (irrégulier). */
window.M1 = {
  secteurs: {
    pro:   { nom: 'Professionnels', ico: '💼' },
    hotel: { nom: 'Hôtels', ico: '🛎️' },
    luxe:  { nom: 'Luxe', ico: '👜' },
    tour:  { nom: 'Tourisme', ico: '🧭' },
    immo:  { nom: 'Immobilier', ico: '🏡' }
  },

  /* Temps 1 · mots à cocher */
  mots: {
    pro:   ['meeting','email','deadline','team','call','client','report','office'],
    hotel: ['check-in','room','key','breakfast','guest','booking','lobby','towel'],
    luxe:  ['bag','watch','size','gift','price','store','brand','receipt'],
    tour:  ['tour','ticket','map','museum','guide','beach','bus','schedule'],
    immo:  ['house','kitchen','garden','rent','price','visit','owner','floor']
  },

  /* Temps 3 · vitre A : sujet / verbe / complément ; la 3e phrase est au passé */
  phrasesA: {
    pro:   [['The client','needs','a new offer','Le client','a besoin d\'','une nouvelle offre',0],['My team','works','in Paris','Mon équipe','travaille','à Paris',0],['We','sent','the report','Nous','avons envoyé','le rapport',1]],
    hotel: [['The guest','wants','a bigger room','Le client','veut','une chambre plus grande',0],['The receptionist','gives','the key','Le réceptionniste','donne','la clé',0],['We','served','breakfast','Nous','avons servi','le petit-déjeuner',1]],
    luxe:  [['The client','loves','this bag','La cliente','adore','ce sac',0],['She','tries','the watch','Elle','essaie','la montre',0],['He','bought','a gift','Il','a acheté','un cadeau',1]],
    tour:  [['The group','visits','the museum','Le groupe','visite','le musée',0],['The guide','shows','the map','Le guide','montre','la carte',0],['They','missed','the bus','Ils','ont raté','le bus',1]],
    immo:  [['The buyer','likes','the garden','L\'acheteur','aime','le jardin',0],['The agent','opens','the door','L\'agent','ouvre','la porte',0],['They','visited','the house','Ils','ont visité','la maison',1]]
  },
  /* verbe : [base, code, invisible?] pour la vitre B */
  verbesA: {
    pro:   [['need','s'],['work','s'],['send','ed',true]],
    hotel: [['want','s'],['give','s'],['serve','ed']],
    luxe:  [['love','s'],['try','s'],['buy','ed',true]],
    tour:  [['visit','s'],['show','s'],['miss','ed']],
    immo:  [['like','s'],['open','s'],['visit','ed']]
  },

  /* Temps 4 · dialogues */
  ecoute: {
    pro: { lignes: [
      ['Anna','Hi Tom. The client {called|ed} this morning.'],
      ['Tom','Really? What {did|ed|inv} she want?'],
      ['Anna','She {needs|s} the new offer before Friday. She {liked|ed} our first version, but she {wants|s} a lower price.'],
      ['Tom','OK. I {finished|ed} the report yesterday. I can add the new price and send it today.'],
      ['Anna','Perfect. She always {answers|s} fast.'] ],
      q: [['Quand la cliente a-t-elle appelé ?',['Ce matin','Hier','Vendredi'],0],['Que veut-elle changer ?',['Le prix','La date','Le rapport'],0]] },
    hotel: { lignes: [
      ['Guest','Good evening. I {booked|ed} a room for two nights.'],
      ['Receptionist','Welcome! Your name, please?'],
      ['Guest','Martin. I {called|ed} last week, I {asked|ed} for a sea view.'],
      ['Receptionist','Yes, I {see|s} it. Your room {faces|s} the sea. Breakfast {starts|s} at seven.'],
      ['Guest','Great. My wife {loves|s} the sea.'] ],
      q: [['Pour combien de nuits ?',['Deux','Une','Sept'],0],['Qu\'a demandé le client la semaine dernière ?',['Une vue sur la mer','Un petit-déjeuner en chambre','Une plus grande chambre'],0]] },
    luxe: { lignes: [
      ['Client','Hello. I {saw|ed|inv} this bag in your window yesterday.'],
      ['Advisor','Of course. It {comes|s} in black and in beige.'],
      ['Client','My sister {bought|ed|inv} the black one. I {prefer|s} the beige.'],
      ['Advisor','Excellent choice. It also {fits|s} a laptop.'],
      ['Client','Perfect, I\'ll take it. It\'s a gift.'] ],
      q: [['Quand la cliente a-t-elle vu le sac ?',['Hier','Ce matin','La semaine dernière'],0],['Quelle couleur choisit-elle ?',['Beige','Noir','Les deux'],0]] },
    tour: { lignes: [
      ['Tourist','Excuse me, we {missed|ed} the bus to the museum.'],
      ['Guide','No problem. Another bus {leaves|s} at two.'],
      ['Tourist','We {waited|ed} for an hour this morning!'],
      ['Guide','I\'m sorry. The first bus {left|ed|inv} early. The museum {closes|s} at six, you {have|s} time.'],
      ['Tourist','Thank you. You {saved|ed} our day.'] ],
      q: [['Qu\'est-il arrivé ce matin ?',['Ils ont raté le bus','Le musée était fermé','Ils se sont perdus'],0],['À quelle heure part le prochain bus ?',['À deux heures','À six heures','À midi'],0]] },
    immo: { lignes: [
      ['Agent','So, this is the living room. The owners {renovated|ed} it last year.'],
      ['Buyer','It {looks|s} great. And the garden?'],
      ['Agent','The garden {faces|s} south. It {gets|s} the sun all day.'],
      ['Buyer','We {visited|ed} three houses yesterday. None of them {had|ed|inv} a garden like this.'],
      ['Agent','The price {includes|s} the garage, too.'] ],
      q: [['Qu\'ont fait les propriétaires l\'an dernier ?',['Ils ont rénové le salon','Ils ont vendu le garage','Ils ont planté le jardin'],0],['Combien de maisons les acheteurs ont-ils visitées hier ?',['Trois','Deux','Aucune'],0]] }
  },

  /* Temps 5 · série 1 (remettre dans l'ordre) */
  ordre: {
    pro:   [['She','works','in Lyon'],['The meeting','starts','at nine'],['We','signed','the contract'],['I','called','the client'],['They','sent','the invoice']],
    hotel: [['The guest','needs','a taxi'],['The pool','opens','at eight'],['I','cleaned','the room'],['We','booked','a table'],['She','lost','her key']],
    luxe:  [['This watch','costs','a lot'],['She','loves','leather'],['I','wrapped','the gift'],['The client','paid','by card'],['He','chose','the black one']],
    tour:  [['The boat','leaves','at noon'],['The guide','speaks','English'],['We','visited','the old town'],['They','missed','the train'],['I','booked','the tour']],
    immo:  [['The house','has','a pool'],['The owner','lives','in London'],['They','visited','the flat'],['We','signed','the offer'],['He','sold','his house']]
  },
  /* série 2 : [phrase, 0 = T0 / 1 = T-1, invisible ?] */
  courbe: {
    pro:   [['She works in Lyon.',0],['The meeting starts at nine.',0],['My boss likes short emails.',0],['He answers every call.',0],['We signed the contract.',1],['I called the client.',1],['They sent the invoice.',1,1],['She left early.',1,1]],
    hotel: [['The guest needs a taxi.',0],['Breakfast ends at ten.',0],['The pool opens at eight.',0],['He speaks French.',0],['I cleaned the room.',1],['The guest checked out.',1],['We booked a table.',1],['She lost her key.',1,1]],
    luxe:  [['This watch costs a lot.',0],['The store closes at seven.',0],['She loves leather.',0],['He wears a size 42.',0],['I wrapped the gift.',1],['The client paid by card.',1,1],['We ordered the bag.',1],['He chose the black one.',1,1]],
    tour:  [['The boat leaves at noon.',0],['The guide speaks English.',0],['It rains a lot here.',0],['The museum opens on Sunday.',0],['We visited the old town.',1],['They missed the train.',1],['I booked the tour.',1],['The group ate on the beach.',1,1]],
    immo:  [['The house has a pool.',0],['The owner lives in London.',0],['The kitchen faces the garden.',0],['It needs some work.',0],['They visited the flat.',1],['We signed the offer.',1],['The owners painted the walls.',1],['He sold his house.',1,1]]
  },
  /* série 3 · trouve l'erreur : [phrase fausse, [choix], bonne réponse, explication] */
  erreurs: [
    ['Yesterday, the client call me.', ['Yesterday, the client called me.','Yesterday, the client calls me.','Yesterday, the client is call me.'], 0, 'Yesterday : on est à T-1. Code -ed : called.'],
    ['The guest want a bigger room.', ['The guest is want a bigger room.','The guest wants a bigger room.','The guest want a bigger rooms.'], 1, 'T0, troisième personne (the guest = he / she) : il manque le code -s.'],
    ['I visited Paris every summer and I love it.', ['I visited Paris every summer and I loves it.','I visit Paris every summer and I love it.','I visiting Paris every summer and I love it.'], 1, 'Be logical : tu commences au présent, tu continues au présent (ou tout au passé : I visited… and I loved it).'],
    ['Want the client a new offer.', ['The client wants a new offer.','The client a new offer wants.','A new offer wants the client.'], 0, 'Qui, fait quoi, à quoi : le sujet d\'abord, puis le verbe, puis le complément.'],
    ['She buyed the bag.', ['She buys the bag yesterday.','She bought the bag.','She buy the bag.'], 1, 'Bonne logique, mauvais verbe : buy cache son -ed. Bought = buy + -ed.']
  ],

  /* Temps 6 · exemple affiché */
  exemple: {
    pro:   'My name is Léa. I work in a bank in Lyon. I manage a small team. I love tennis. Yesterday, I called three clients.',
    hotel: 'My name is Léa. I work in a hotel in Nice. I welcome the guests and I give the keys. I love the sea. Yesterday, I helped a family from Texas.',
    luxe:  'My name is Léa. I work in a jewelry store in Monaco. I advise the clients. I love watches. Yesterday, I sold a necklace to a client from New York.',
    tour:  'My name is Léa. I work as a guide in Avignon. I show the city to tourists. I love history. Yesterday, I visited the palace with a group from Canada.',
    immo:  'My name is Léa. I work in a real estate agency in Cannes. I show houses to buyers. I love old villas. Yesterday, I visited a house with a pool.'
  },

  /* Temps 7 · le lamantin joue un rôle */
  role: {
    pro:   ['un nouveau collègue américain', ['Hi! I\'m new here. What do you do in the team?','Nice! What did you do yesterday at work?','Cool. Do you like your job? Why?','What time does your day start?','Last one: what did you eat for lunch yesterday?']],
    hotel: ['un client qui arrive de Miami', ['Hi! I booked a room. What time does breakfast start?','Perfect. And what time does the pool open?','I arrived from Miami this morning. Where do you recommend for dinner?','Did you work here last summer?','Last one: what do guests usually ask you?']],
    luxe:  ['une cliente qui cherche un cadeau', ['Hello! I need a gift for my husband. What do you recommend?','He loves watches. What do you have?','Nice. What did other clients buy this week?','How much does it cost?','Last one: do you gift-wrap?']],
    tour:  ['un touriste un peu perdu', ['Excuse me! We missed our tour this morning. What can we do?','We waited for an hour! When does the next tour leave?','What did the other tourists do this morning?','Do you speak French too?','Last one: what do you recommend for tonight?']],
    immo:  ['un acheteur qui visite', ['Hi! I love the garden. When did the owners buy the house?','Does the house have a garage?','What did the owners change last year?','How many bedrooms does it have?','Last one: do you like this neighborhood?']]
  }
};
