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
    pro:   ['meeting','email','deadline','team','call','client','report','office','invoice','stakeholder','follow-up','overtime'],
    hotel: ['check-in','room','key','breakfast','guest','booking','lobby','towel','housekeeping','overbooked','complimentary','amenities'],
    luxe:  ['bag','watch','size','gift','price','store','brand','receipt','tailored','craftsmanship','refund','limited edition'],
    tour:  ['tour','ticket','map','museum','guide','beach','bus','schedule','itinerary','sightseeing','landmark','layover'],
    immo:  ['house','kitchen','garden','rent','price','visit','owner','floor','mortgage','landlord','down payment','listing']
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
      ['Tom','Hey Anna, Tom here. Mrs Carter {called|ed} this morning.'],
      ['Tom','She {needs|s} the new offer by Friday.'],
      ['Tom','She {liked|ed} our first draft… but honestly, she {thinks|s} {it\'s|s} too expensive.'],
      ['Tom','Good news: I {finished|ed} the report last night, so I can change the price and send it today.'],
      ['Tom','She usually {replies|s} within the hour, so we\'ll know fast. Talk soon!'] ],
      q: [['Quand la cliente a-t-elle appelé ?',['Ce matin','Hier soir','Vendredi'],0],['Qu\'est-ce qui la gêne ?',['Le prix','La date','Le rapport'],0]] },
    hotel: { lignes: [
      ['Mr Martin','Hi, good evening! My name {is|s} Martin. I {booked|ed} a room for two nights, from Friday.'],
      ['Mr Martin','I {called|ed} last week and {asked|ed} for a sea view.'],
      ['Mr Martin','{Is|s} that still possible? My wife {loves|s} waking up to the sea.'],
      ['Mr Martin','Our train {gets|s} in at nine, so we {need|s|inv} a late check-in.'],
      ['Mr Martin','Thanks so much, and see you on Friday!'] ],
      q: [['Pour combien de nuits ?',['Deux','Une','Quatre'],0],['Qu\'a demandé le client la semaine dernière ?',['Une vue sur la mer','Un petit-déjeuner en chambre','Une chambre plus grande'],0]] },
    luxe: { lignes: [
      ['Julien','Hello, this {is|s} Julien. I {saw|ed|inv} a bag in your window yesterday, the small leather one.'],
      ['Julien','{Is|s} it still available? I {know|s|inv} it {comes|s} in black and in beige.'],
      ['Julien','My sister {bought|ed|inv} the black one last month, so… I {prefer|s|inv} the beige.'],
      ['Julien','{It\'s|s} a gift, actually, for her birthday on Saturday.'],
      ['Julien','Could you keep it for me? I can come tomorrow at noon. Thanks!'] ],
      q: [['Quand le client a-t-il vu le sac ?',['Hier','Ce matin','Le mois dernier'],0],['Quelle couleur choisit-il ?',['Beige','Noir','Les deux'],0]] },
    tour: { lignes: [
      ['Marco','Hi everyone, Marco here, your guide. I {know|s|inv} you {missed|ed} the bus to the museum this morning.'],
      ['Marco','You {waited|ed} for an hour, and nobody {came|ed|inv}. {I\'m|s} so sorry.'],
      ['Marco','The first bus {left|ed|inv} early today, and nobody {told|ed|inv} me.'],
      ['Marco','Don\'t worry: {there\'s|s} another one. It {leaves|s} at two, from the same stop.'],
      ['Marco','The museum {closes|s} at six, so you still {have|s|inv} plenty of time. See you there!'] ],
      q: [['Qu\'est-il arrivé ce matin ?',['Ils ont raté le bus','Le musée était fermé','Ils se sont perdus'],0],['À quelle heure part le prochain bus ?',['À deux heures','À six heures','À midi'],0]] },
    immo: { lignes: [
      ['Hugo','Hi love, {it\'s|s} me. {I\'m|s} at the house on Rose Street right now.'],
      ['Hugo','The owners {renovated|ed} the living room last year. It {looks|s} amazing.'],
      ['Hugo','And the garden… it {faces|s} south, so it {gets|s} the sun all day.'],
      ['Hugo','Honestly, we {visited|ed} three houses yesterday, and none of them {had|ed|inv} a garden like this.'],
      ['Hugo','Oh, and the price {includes|s} the garage. Call me back!'] ],
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
    ['I visited Paris every summer and I love it.', ['I visited Paris every summer and I loves it.','I visit Paris every summer and I love it.','I visiting Paris every summer and I love it.'], 1, 'Soyez logique : vous commencez au présent, vous continuez au présent (ou tout au passé : I visited… and I loved it).'],
    ['Want the client a new offer.', ['The client wants a new offer.','The client a new offer wants.','A new offer wants the client.'], 0, 'Qui, fait quoi, à quoi : le sujet d\'abord, puis le verbe, puis le complément.'],
    ['She buyed the bag.', ['She buys the bag yesterday.','She bought the bag.','She buy the bag.'], 1, 'Bonne logique, mauvais verbe : buy cache son -ed. Bought = buy + -ed.']
  ],

  /* Courbe bilingue : une phrase du secteur, au passé précis */
  bilingue: {
    pro:   ['Hier, la cliente a signé le contrat à 17 h.', 'Yesterday, the client signed the contract at five.', 'has signed'],
    hotel: ['Hier soir, le client a quitté l\'hôtel à 23 h.', 'The guest checked out at eleven last night.', 'has checked out'],
    luxe:  ['Hier, la cliente a acheté le sac en fin de journée.', 'Yesterday, the client bought the bag at the end of the day.', 'has bought'],
    tour:  ['Ce matin, le groupe a raté le bus de 9 h.', 'This morning, the group missed the nine o\'clock bus.', 'has missed'],
    immo:  ['La semaine dernière, les acheteurs ont visité la villa.', 'Last week, the buyers visited the villa.', 'have visited']
  },

  /* Essorage : un vrai texte du secteur ; {verbe|code} ou {verbe|ed|inv} */
  essorage: {
    pro:   ['Weekly report.', 'On Monday, our team {met|ed|inv} the new client. She {wants|s} a full offer before Friday. We {sent|ed|inv} a first draft on Tuesday and she {called|ed} back the same day. Our manager usually {reviews|s} every offer, so he {checked|ed} the prices. Today, the team {works|s} on the final version.'],
    hotel: ['Night log · Room 214.', 'At 1 a.m., the guest {called|ed} reception. He {said|ed|inv} the air conditioning {stopped|ed} working. Our technician {checked|ed} it and {replaced|ed} a filter. The guest usually {wakes|s} up at seven and {has|s} breakfast on the terrace. Breakfast {starts|s} at seven, so we {moved|ed} his wake-up call to six thirty.'],
    luxe:  ['Store diary.', 'Yesterday, a client from New York {visited|ed} the boutique. She {tried|ed} three watches and {chose|ed|inv} the gold one. Her husband {paid|ed|inv} by card. She usually {shops|s} in Paris, but she {loves|s} our window. We {wrapped|ed} the gift and {delivered|ed} it to her hotel.'],
    tour:  ['Guide\'s notes.', 'This morning, the group {missed|ed} the boat. We {waited|ed} for the next one and {visited|ed} the old port. The boat {leaves|s} every hour in summer. At noon, everybody {ate|ed|inv} on the beach. The group {wants|s} a night tour, so I {booked|ed} one for tomorrow.'],
    immo:  ['Visit report.', 'Yesterday, the Martins {visited|ed} the villa in Cannes. They {loved|ed} the garden. The house {has|s} four bedrooms and the kitchen {faces|s} the sea. The owners {renovated|ed} the pool last year. Mr. Martin {asked|ed} for the price and {made|ed|inv} an offer this morning.']
  },

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
