/* Tests de niveau Frenglais : deux formes parallèles (entrée, sortie), même structure, items différents.
   Sources : CECRL, volume complémentaire 2020 (Conseil de l'Europe) pour les niveaux et les niveaux « plus » (A2+, B1+, B2+) ;
   English Grammar Profile (Cambridge, English Profile) pour placer chaque point de grammaire au niveau où les apprenants le maîtrisent ;
   Core Inventory for General English (British Council / EAQUALS) pour les fonctions de communication.
   6 paliers (A1 → C2) × 8 questions = 48 : 4 grammaire, 1 vocabulaire, 1 interaction, 1 lecture, 1 écoute.
   Item : [question, options (la bonne en premier, mélangées à l'écran), index de la bonne, compétence, texte ou audio, explication, 'point de grammaire|module'] */
(function () {
  var S = 'structure', L = 'lexique', F = 'interaction', R = 'lecture', E = 'ecoute';
  window.TESTS = {
    /* tant que Paul n'a pas enregistré les écoutes du test, elles sont retirées : 42 questions au lieu de 48 */
    audiosPrets: true,
    entree: {
      A1: [
        ['<em>She ___ in Paris.</em>', ['lives', 'live', 'living'], 0, S, '', 'Au présent (T0), après <em>she</em> : le code -s. <em>She lives.</em>', 'Présent simple : le -s de he, she, it|2'],
        ['<em>___ you French?</em>', ['Are', 'Do', 'Is'], 0, S, '', 'Avec une nationalité ou un adjectif, la question se fait avec <em>be</em> : <em>Are you French?</em>', 'Be : questions et réponses|2'],
        ['<em>There ___ two hotels in the village.</em>', ['are', 'is', 'have'], 0, S, '', 'Il y a + pluriel : <em>there are</em>. Jamais <em>have</em> pour « il y a ».', 'There is / there are|2'],
        ['<em>Is this your phone? — Yes, it\'s ___.</em>', ['mine', 'my', 'me'], 0, S, '', '<em>Mine</em> = le mien, seul. <em>My</em> a besoin d\'un nom après : <em>my phone</em>.', 'Possessifs : my / mine|'],
        ['Le contraire de <em>cheap</em> :', ['expensive', 'small', 'early'], 0, L, '', '<em>Cheap</em> = bon marché. <em>Expensive</em> = cher.', ''],
        ['Quelqu\'un vous dit <em>Nice to meet you.</em> Vous répondez :', ['Nice to meet you too.', 'I\'m fine, thank you.', 'See you tomorrow.'], 0, F, '', 'À une première rencontre, on renvoie la formule. <em>I\'m fine</em> répond à <em>How are you?</em>', ''],
        ['Où travaille Tom ?', ['Dans un hôtel', 'Dans une banque', 'Dans une école'], 0, R, 'Hi, I\'m Tom. I work in a hotel in Nice. I start at seven.', '<em>I work in a hotel</em> : je travaille dans un hôtel.', ''],
        ['Quel âge a Sam ?', ['32 ans', '22 ans', '13 ans'], 0, E, 'audio/test-e-a1.mp3', '<em>Thirty-two</em> = 32. Attention : <em>thirty</em> (30), <em>thirteen</em> (13).', '']
      ],
      A2: [
        ['<em>Yesterday I ___ to the bank.</em>', ['went', 'go', 'have gone'], 0, S, '', '<em>Yesterday</em> : T-1, c\'est fini. <em>Went</em> = <em>go</em> + -ed invisible.', 'Prétérit : verbes irréguliers|3'],
        ['<em>___ she work on Sundays?</em>', ['Does', 'Do', 'Is'], 0, S, '', 'Question au T0 avec <em>she</em> : <em>does</em> porte le code -s, le verbe reste nu.', 'Présent simple : questions avec do / does|2'],
        ['<em>This hotel is ___ than the one in Lyon.</em>', ['nicer', 'more nice', 'nicest'], 0, S, '', 'Adjectif court : -er. <em>Nicer than</em>. Le superlatif, c\'est <em>the nicest</em>.', 'Comparatif des adjectifs courts|'],
        ['<em>Look! It ___ again.</em>', ['is raining', 'rains', 'rain'], 0, S, '', '<em>Look!</em> : ça se passe sous nos yeux, be + -ing.', 'Présent continu (be + -ing)|4'],
        ['<em>To book a table</em>, c\'est :', ['réserver une table', 'lire à table', 'payer l\'addition'], 0, L, '', '<em>To book</em> = réserver. Un <em>booking</em> = une réservation.', ''],
        ['Au restaurant, pour demander l\'addition poliment :', ['Could we have the bill, please?', 'Give me the bill.', 'I want pay now.'], 0, F, '', '<em>Could we have… please?</em> : la demande polie standard. <em>Give me</em> sonne comme un ordre.', ''],
        ['La piscine ferme à…', ['20 h', '10 h', '7 h'], 0, R, 'Dear guests, breakfast is served from 7 to 10 am. The pool closes at 8 pm.', '<em>The pool closes at 8 pm</em> : 8 pm = 20 h.', ''],
        ['Que propose Mark ?', ['Se voir vendredi', 'Annuler la réunion', 'Venir demain'], 0, E, 'audio/test-e-a2.mp3', '<em>Can we meet on Friday instead?</em> : <em>instead</em> = à la place.', '']
      ],
      B1: [
        ['<em>I ___ here since 2019.</em>', ['have worked', 'work', 'worked'], 0, S, '', '<em>Since</em> + un point de départ, et ça dure encore : have + -en. En français on dit « je travaille ici depuis », pas en anglais.', 'Present perfect avec since / for|5'],
        ['<em>If it rains tomorrow, we ___ inside.</em>', ['will stay', 'stay', 'would stay'], 0, S, '', '<em>If</em> + T0, puis le résultat au futur : <em>will stay</em>.', 'Conditionnel réel : if + présent, will|7'],
        ['<em>When you called, I ___ dinner.</em>', ['was having', 'had', 'have had'], 0, S, '', 'Une action en cours, interrompue par une autre : be (au passé) + -ing.', 'Passé continu : action interrompue|4'],
        ['<em>The contract ___ yesterday.</em>', ['was signed', 'signed', 'has signed'], 0, S, '', 'Le contrat ne signe pas : il est signé. Passif au T-1 : <em>was</em> + -en.', 'Passif au prétérit|'],
        ['<em>We\'ve run out of paper</em> veut dire :', ['nous n\'avons plus de papier', 'nous avons couru chercher du papier', 'nous avons jeté le papier'], 0, L, '', '<em>To run out of</em> = ne plus en avoir.', ''],
        ['En réunion, vous n\'êtes pas d\'accord. La formule juste :', ['I see your point, but I\'m not sure it\'s the best option.', 'You are wrong.', 'I disagree you.'], 0, F, '', 'On reconnaît l\'idée, puis on nuance. <em>I disagree you</em> est faux : <em>I disagree with you</em>.', ''],
        ['Que recevront les passagers ?', ['Un bon pour un repas', 'Un remboursement', 'Un nouveau billet'], 0, R, 'We regret to inform you that your flight has been delayed by two hours. Passengers will receive a meal voucher at the gate.', '<em>A meal voucher</em> = un bon pour un repas.', ''],
        ['Quand le produit sortira-t-il probablement ?', ['En mai', 'En mars', 'Il est annulé'], 0, E, 'audio/test-e-b1.mp3', '<em>We were going to launch it in March</em> (prévu, pas fait), <em>so it\'ll probably be May</em>.', '']
      ],
      B2: [
        ['<em>By the time you read this, I ___ Paris.</em>', ['will have left', 'will leave', 'have left'], 0, S, '', '<em>By the time</em> : l\'action sera terminée avant ce moment futur. Will have + -en.', 'Futur antérieur : will have + -en|7'],
        ['<em>She ___ have forgotten: she never misses a meeting.</em>', ['can\'t', 'mustn\'t', 'shouldn\'t'], 0, S, '', 'Déduction : c\'est impossible. <em>Can\'t have</em> + -en. <em>Mustn\'t</em> est une interdiction.', 'Modaux de déduction au passé|8'],
        ['<em>I wish I ___ more time to prepare last week.</em>', ['had had', 'had', 'would have'], 0, S, '', 'Regret sur le passé : un cran plus loin, T-2. <em>I wish I had had</em>.', 'Wish + regret sur le passé|6'],
        ['<em>He asked me where ___.</em>', ['I was going', 'was I going', 'I am going'], 0, S, '', 'Question rapportée : ordre normal (sujet + verbe), et le temps recule d\'un cran.', 'Discours indirect : questions|'],
        ['<em>To be on the fence</em> veut dire :', ['hésiter', 'être mis à l\'écart', 'être en avance'], 0, L, '', '<em>On the fence</em> : assis sur la barrière, on n\'a pas choisi son camp.', ''],
        ['Un client mécontent vous écrit. La réponse la plus professionnelle :', ['I\'m sorry to hear that. Let me look into it and get back to you today.', 'It\'s not our fault.', 'OK, no problem.'], 0, F, '', 'Empathie, action, délai : <em>look into it</em> (examiner), <em>get back to you</em> (revenir vers vous).', ''],
        ['Que regrettent les managers ?', ['D\'avoir soutenu la mesure', 'Que les coûts aient baissé', 'D\'avoir quitté l\'entreprise'], 0, R, 'Although the new policy was meant to cut costs, it has ended up increasing the administrative workload, which many managers now regret having supported.', '<em>Regret having supported</em> : regretter d\'avoir soutenu.', ''],
        ['Qu\'est-ce qui est vrai ?', ['Deux clients ont déjà signé', 'Les clients se sont plaints', 'Ils ont changé de salle'], 0, E, 'audio/test-e-b2.mp3', '<em>The clients didn\'t seem to mind, and two of them have already signed.</em>', '']
      ],
      C1: [
        ['<em>Not until the results came in ___ how serious the problem was.</em>', ['did we realise', 'we realised', 'we did realise'], 0, S, '', 'Après <em>Not until</em> en tête de phrase : inversion, comme une question. <em>Did we realise.</em>', 'Inversion après une négation en tête|'],
        ['<em>The project, ___ funding was cut last year, has been revived.</em>', ['whose', 'which', 'who\'s'], 0, S, '', '<em>Whose</em> = dont le / dont la (possession). <em>Who\'s</em> = <em>who is</em>.', 'Relatives : whose|'],
        ['<em>It\'s high time we ___ a decision.</em>', ['made', 'make', 'will make'], 0, S, '', '<em>It\'s high time</em> + T-1 : on aurait déjà dû. Le passé exprime ici l\'irréel, pas le temps.', 'Irréel du présent : it\'s time + prétérit|'],
        ['<em>Had I known about the strike, I ___ earlier.</em>', ['would have left', 'would leave', 'had left'], 0, S, '', 'Hypothèse sur le passé, avec inversion (<em>Had I known</em> = <em>If I had known</em>) : would have + -en.', 'Conditionnel irréel du passé, inversé|6'],
        ['<em>To cut corners</em> veut dire :', ['bâcler pour gagner du temps', 'réduire légalement les coûts', 'prendre un raccourci en voiture'], 0, L, '', '<em>To cut corners</em> : faire au plus vite, au détriment de la qualité.', ''],
        ['Pour critiquer un planning en réunion, avec diplomatie :', ['With respect, I\'d question whether the timeline is realistic.', 'Your timeline is crazy.', 'The timeline is obviously bad.'], 0, F, '', 'Au niveau C1, on nuance : <em>with respect</em>, <em>I\'d question whether…</em> Le désaccord passe sans blesser.', ''],
        ['Que suggère le rapport ?', ['Que la responsabilité revient au conseil, sans le dire', 'Que le conseil n\'a reçu aucun avertissement', 'Il accuse ouvertement le conseil'], 0, R, 'The report stops short of blaming the board, yet its account of how warnings were repeatedly shelved leaves little doubt as to where responsibility lies.', '<em>Stops short of blaming</em> : il ne va pas jusqu\'à accuser, mais le sous-entend.', ''],
        ['Selon l\'orateur…', ['Consulter l\'équipe plus tôt aurait limité les critiques', 'Le projet est un échec total', 'L\'équipe a été consultée à temps'], 0, E, 'audio/test-e-c1.mp3', '<em>Had the team been consulted earlier</em> : si l\'équipe avait été consultée plus tôt, ce qui n\'a pas été le cas.', '']
      ],
      C2: [
        ['<em>Little ___ that the deal had already collapsed.</em>', ['did they know', 'they knew', 'knew they'], 0, S, '', '<em>Little</em> en tête, au sens de « pas du tout » : inversion avec l\'auxiliaire. <em>Little did they know.</em>', 'Inversion après little / rarely / seldom|'],
        ['<em>The launch was postponed, ___ came as no surprise to anyone.</em>', ['which', 'what', 'that'], 0, S, '', '<em>Which</em> reprend toute la proposition précédente (« ce qui »). <em>That</em> ne s\'emploie jamais après une virgule.', 'Relative reprenant une proposition : which|'],
        ['<em>She would sooner resign ___ accept those terms.</em>', ['than', 'rather', 'that'], 0, S, '', '<em>Would sooner… than</em> : plutôt… que. Une préférence forte, au registre soutenu.', 'Would sooner / would rather … than|8'],
        ['<em>Were the merger ___ ahead, hundreds of jobs would be at risk.</em>', ['to go', 'going', 'go'], 0, S, '', '<em>Were</em> + sujet + <em>to</em> + verbe : hypothèse soutenue, sans <em>if</em>. <em>Were the merger to go ahead.</em>', 'Hypothèse soutenue : were … to|'],
        ['<em>A moot point</em>, c\'est :', ['un point discutable, sans réponse tranchée', 'un point essentiel et urgent', 'un point réglé depuis longtemps'], 0, L, '', '<em>Moot</em> : ouvert au débat, ou devenu sans intérêt pratique. Registre soutenu.', ''],
        ['Un participant monopolise la parole en réunion. Vous recadrez avec tact :', ['If I could just bring in a few other voices at this point…', 'Stop talking, please.', 'You talk too much.'], 0, F, '', 'Au niveau C2, on gère l\'interaction sans heurter : on ouvre la parole aux autres plutôt que de couper.', ''],
        ['Quel est le ton du texte ?', ['Ironique : il souligne l\'écart entre le discours et les faits', 'Admiratif envers la direction', 'Neutre et purement factuel'], 0, R, 'In what the board no doubt considers a triumph of transparency, the annual report devotes eleven pages to the company\'s values and a single footnote to the forty per cent drop in profits.', '<em>No doubt considers a triumph</em> : l\'auteur n\'y croit pas. Onze pages sur les valeurs, une note sur la chute des bénéfices : l\'ironie est dans le contraste.', ''],
        ['Que pense l\'oratrice du nouveau plan ?', ['Qu\'il est bien conçu sur le papier, mais irréaliste', 'Qu\'il faut l\'appliquer tout de suite', 'Qu\'il est plus simple que l\'ancien'], 0, E, 'audio/test-e-c2.mp3', '<em>It reads beautifully, but…</em> : le compliment prépare la critique. <em>Doesn\'t survive contact with reality</em> : il ne tient pas face au réel.', '']
      ]
    },
    sortie: {
      A1: [
        ['<em>He ___ tennis on Saturdays.</em>', ['plays', 'play', 'playing'], 0, S, '', 'T0 avec <em>he</em> : code -s. <em>He plays.</em>', 'Présent simple : le -s de he, she, it|2'],
        ['<em>___ they from Spain?</em>', ['Are', 'Is', 'Do'], 0, S, '', 'Avec une origine, la question se fait avec <em>be</em> : <em>Are they from Spain?</em>', 'Be : questions et réponses|2'],
        ['<em>There ___ a pharmacy near the hotel.</em>', ['is', 'are', 'has'], 0, S, '', 'Il y a + singulier : <em>there is</em>.', 'There is / there are|2'],
        ['<em>This is Tom. ___ office is on the second floor.</em>', ['His', 'He', 'Him'], 0, S, '', 'Le possesseur est Tom, un homme : <em>his</em> (son, sa).', 'Possessifs : my / mine|'],
        ['Le contraire de <em>early</em> :', ['late', 'fast', 'cold'], 0, L, '', '<em>Early</em> = tôt. <em>Late</em> = tard.', ''],
        ['Pour vous présenter :', ['My name is Julie and I\'m from Lyon.', 'I have Julie, I am of Lyon.', 'Me Julie, Lyon.'], 0, F, '', '<em>My name is…</em>, <em>I\'m from…</em> : les deux formules de base.', ''],
        ['Quand Anna travaille-t-elle ?', ['La nuit', 'Le matin', 'Le week-end'], 0, R, 'Hello, I\'m Anna. I\'m a nurse. I work at night.', '<em>At night</em> = la nuit.', ''],
        ['Comment s\'appelle le chien ?', ['Max', 'Paul', 'Mike'], 0, E, 'audio/test-s-a1.mp3', '<em>The dog\'s name is Max.</em>', '']
      ],
      A2: [
        ['<em>Last week we ___ a new client.</em>', ['met', 'meet', 'have met'], 0, S, '', '<em>Last week</em> : T-1. <em>Met</em> = <em>meet</em> + -ed invisible.', 'Prétérit : verbes irréguliers|3'],
        ['<em>___ you call him yesterday?</em>', ['Did', 'Do', 'Have'], 0, S, '', 'Question au T-1 : <em>did</em> porte le code, le verbe reste nu.', 'Présent simple : questions avec do / does|2'],
        ['<em>This room is ___ than the other one.</em>', ['bigger', 'more big', 'biggest'], 0, S, '', 'Adjectif court : -er, et la consonne double : <em>bigger</em>.', 'Comparatif des adjectifs courts|'],
        ['<em>Listen! Someone ___ at the door.</em>', ['is knocking', 'knocks', 'knock'], 0, S, '', '<em>Listen!</em> : ça se passe maintenant, be + -ing.', 'Présent continu (be + -ing)|4'],
        ['À l\'hôtel, <em>to check out</em> veut dire :', ['quitter l\'hôtel', 'vérifier une liste', 'sortir dîner'], 0, L, '', '<em>Check in</em> = arriver ; <em>check out</em> = rendre la chambre.', ''],
        ['Au téléphone, pour demander à parler à quelqu\'un :', ['Could I speak to Mr Brown, please?', 'I want Mr Brown.', 'Give me Mr Brown.'], 0, F, '', '<em>Could I speak to…, please?</em> : la formule polie au téléphone.', ''],
        ['Combien paie un enfant de 8 ans ?', ['Rien', '12 €', '10 €'], 0, R, 'The museum is closed on Mondays. Tickets are 12 euros, free for children under 10.', '<em>Free for children under 10</em> : gratuit pour les moins de 10 ans.', ''],
        ['Où attend le taxi ?', ['Devant l\'hôtel', 'À la gare', 'Au parking'], 0, E, 'audio/test-s-a2.mp3', '<em>It\'s waiting in front of the hotel.</em>', '']
      ],
      B1: [
        ['<em>She ___ for this company for ten years.</em>', ['has worked', 'works', 'is working'], 0, S, '', '<em>For ten years</em> et ça dure encore : have + -en.', 'Present perfect avec since / for|5'],
        ['<em>If you ___ early, you\'ll get a good seat.</em>', ['arrive', 'will arrive', 'arrived'], 0, S, '', 'Après <em>if</em>, pas de <em>will</em> : T0, puis le résultat au futur.', 'Conditionnel réel : if + présent, will|7'],
        ['<em>While she ___ to work, her phone rang.</em>', ['was driving', 'drove', 'has driven'], 0, S, '', 'L\'action de fond, en cours : be (au passé) + -ing. Le téléphone l\'interrompt.', 'Passé continu : action interrompue|4'],
        ['<em>The rooms ___ every morning.</em>', ['are cleaned', 'clean', 'are cleaning'], 0, S, '', 'Les chambres ne nettoient pas : elles sont nettoyées. Passif au T0 : <em>are</em> + -en.', 'Passif au prétérit|'],
        ['<em>To put off a meeting</em> veut dire :', ['la reporter', 'l\'annuler définitivement', 'la commencer'], 0, L, '', '<em>To put off</em> = repousser à plus tard.', ''],
        ['Pour proposer une solution à un collègue :', ['Why don\'t we ask the client for more time?', 'We must to ask the client.', 'Ask the client, no?'], 0, F, '', '<em>Why don\'t we…?</em> : proposer sans imposer. <em>Must to</em> est faux : après un modal, le verbe reste nu.', ''],
        ['Que se passe-t-il ?', ['L\'ascenseur ne fonctionne pas', 'L\'hôtel ferme', 'Jeudi est un jour férié'], 0, R, 'Due to maintenance work, the lift will be out of order until Thursday. We apologise for any inconvenience.', '<em>Out of order</em> = en panne.', ''],
        ['Quand a lieu la réunion ?', ['Mardi', 'Lundi', 'Ce matin'], 0, E, 'audio/test-s-b1.mp3', '<em>The meeting\'s now on Tuesday, not Monday.</em>', '']
      ],
      B2: [
        ['<em>This time next week, we ___ on a beach.</em>', ['will be lying', 'will lie', 'are lying'], 0, S, '', 'Une action en cours à un moment précis du futur : will be + -ing.', 'Futur antérieur : will have + -en|7'],
        ['<em>He ___ have taken the train: his car is still here.</em>', ['must', 'can\'t', 'shouldn\'t'], 0, S, '', 'Déduction quasi certaine : <em>must have</em> + -en.', 'Modaux de déduction au passé|8'],
        ['<em>If only I ___ his advice.</em>', ['had taken', 'took', 'would take'], 0, S, '', 'Regret sur le passé : T-2, <em>had taken</em>.', 'Wish + regret sur le passé|6'],
        ['<em>She told me she ___ the report the day before.</em>', ['had finished', 'has finished', 'finishes'], 0, S, '', 'Au discours indirect, le temps recule d\'un cran : <em>I finished</em> devient <em>she had finished</em>.', 'Discours indirect : questions|'],
        ['<em>To take something for granted</em> veut dire :', ['le considérer comme acquis', 'accepter un cadeau', 'prendre une décision'], 0, L, '', '<em>For granted</em> : comme allant de soi.', ''],
        ['Un client ne répond pas depuis une semaine. Pour le relancer :', ['I\'m just following up on my email from last week.', 'Why don\'t you answer?', 'You forgot my email.'], 0, F, '', '<em>To follow up on</em> = relancer, sans reproche.', ''],
        ['Qu\'a fait le conseil ?', ['Il a remis en question l\'expansion', 'Il a doublé l\'expansion', 'Il a démissionné'], 0, R, 'Despite a promising start, sales stalled in the second quarter, prompting the board to reconsider the expansion it had approved only months earlier.', '<em>To reconsider</em> = reconsidérer, remettre en question.', ''],
        ['Qu\'est-ce qui est vrai ?', ['Ils devront travailler le week-end', 'La date limite est repoussée', 'Il a refusé le projet'], 0, E, 'audio/test-s-b2.mp3', '<em>Now we\'ll have to work through the weekend.</em>', '']
      ],
      C1: [
        ['<em>Rarely ___ such a convincing argument.</em>', ['have I heard', 'I have heard', 'I heard'], 0, S, '', 'Après <em>Rarely</em> en tête : inversion. <em>Have I heard.</em>', 'Inversion après une négation en tête|'],
        ['<em>The manager, ___ I had spoken the day before, was not available.</em>', ['to whom', 'who', 'whose'], 0, S, '', 'Parler à quelqu\'un : la préposition remonte devant le relatif, et <em>who</em> devient <em>whom</em>. Registre soutenu.', 'Relatives : whose|'],
        ['<em>I\'d rather you ___ the client yourself.</em>', ['called', 'call', 'will call'], 0, S, '', '<em>I\'d rather</em> + quelqu\'un + T-1 : le passé exprime le souhait, pas le temps.', 'Irréel du présent : it\'s time + prétérit|'],
        ['<em>Had it not been for her help, we ___ the deadline.</em>', ['would have missed', 'would miss', 'had missed'], 0, S, '', 'Hypothèse sur le passé : would have + -en.', 'Conditionnel irréel du passé, inversé|6'],
        ['<em>To play devil\'s advocate</em> veut dire :', ['défendre volontairement la position opposée', 'jouer le rôle du méchant', 'plaider au tribunal'], 0, L, '', 'Se faire l\'avocat du diable, pour tester un argument.', ''],
        ['Pour refuser une demande tout en préservant la relation :', ['I\'m afraid that won\'t be possible this time, but I\'d be happy to help next month.', 'No, it\'s impossible.', 'I can\'t, sorry, bye.'], 0, F, '', '<em>I\'m afraid…</em> adoucit le refus ; la contre-proposition garde la relation.', ''],
        ['Que sous-entend le texte ?', ['Le rapport annuel passe un problème sous silence', 'Les synergies ont dépassé les attentes', 'La fusion a été annulée'], 0, R, 'While the merger was hailed as a triumph, insiders point out that the promised synergies have yet to materialise, a fact conspicuously absent from the annual report.', '<em>Conspicuously absent</em> : absent, et ça se remarque.', ''],
        ['Que recommande l\'orateur ?', ['Revenir à l\'ancien système pour l\'instant', 'Garder la nouvelle procédure', 'Supprimer toute procédure'], 0, E, 'audio/test-s-c1.mp3', '<em>We\'d be better off going back to the old system</em> : mieux vaudrait revenir à l\'ancien système.', '']
      ],
      C2: [
        ['<em>Hardly ___ the meeting started when the fire alarm went off.</em>', ['had', 'has', 'did'], 0, S, '', '<em>Hardly… when</em> : à peine… que. Inversion avec <em>had</em>, au T-2.', 'Inversion après little / rarely / seldom|'],
        ['<em>He missed the deadline again, ___ annoyed the whole team.</em>', ['which', 'what', 'that'], 0, S, '', '<em>Which</em> reprend toute l\'idée précédente (« ce qui »).', 'Relative reprenant une proposition : which|'],
        ['<em>It\'s not so much the price ___ the delay that worries me.</em>', ['as', 'than', 'but'], 0, S, '', '<em>Not so much… as</em> : moins… que. Une nuance de registre soutenu.', 'Would sooner / would rather … than|8'],
        ['<em>Should you have any questions, ___ hesitate to contact us.</em>', ['do not', 'not', 'does not'], 0, S, '', '<em>Should you…</em> = <em>If you…</em>, en registre soutenu ; la suite est un impératif : <em>do not hesitate</em>.', 'Hypothèse soutenue : were … to|'],
        ['<em>To beat about the bush</em> veut dire :', ['tourner autour du pot', 'travailler dans l\'urgence', 'abandonner un projet'], 0, L, '', 'L\'image est la même qu\'en français : on évite le sujet.', ''],
        ['Votre directeur critique votre travail. Vous reformulez avec tact pour clarifier :', ['If I\'ve understood you correctly, the concern is less the budget than the timing?', 'So you think I\'m wrong.', 'What do you mean?'], 0, F, '', 'Reformuler pour vérifier, sans se défendre : la marque d\'un échange maîtrisé.', ''],
        ['Quel est le ton du texte ?', ['Sceptique : l\'auteur doute des promesses', 'Enthousiaste', 'Technique et neutre'], 0, R, 'The app promises to "revolutionise" how we work, a claim made, with remarkable consistency, by every productivity tool launched in the past decade.', '<em>With remarkable consistency</em> : la même promesse, toujours. L\'auteur n\'y croit pas.', ''],
        ['Que pense l\'orateur de la proposition ?', ['Il la juge intéressante mais prématurée', 'Il la rejette totalement', 'Il veut l\'appliquer demain'], 0, E, 'audio/test-s-c2.mp3', '<em>I\'m not against it in principle, it\'s just that the timing couldn\'t be worse.</em>', '']
      ]
    },
    /* ce que le CECRL (volume complémentaire 2020) dit de chaque niveau, en « vous pouvez » */
    descripteurs: {
      A1: 'Vous comprenez et utilisez des expressions familières et quotidiennes. Vous pouvez vous présenter, poser des questions simples et répondre, si l\'interlocuteur parle lentement.',
      A2: 'Vous comprenez des phrases isolées sur des sujets familiers : travail, achats, environnement proche. Vous communiquez lors de tâches simples et habituelles, et vous racontez au passé avec des moyens simples.',
      'A2+': 'Vous participez plus activement à la conversation, avec un peu d\'aide. Vous décrivez en termes simples votre travail, votre environnement, ce que vous ressentez.',
      B1: 'Vous comprenez l\'essentiel d\'un message clair sur un sujet familier. Vous vous débrouillez dans la plupart des situations de voyage et de travail, vous racontez une expérience et donnez votre avis brièvement.',
      'B1+': 'Vous échangez des informations avec plus de précision et d\'assurance. Vous faites face à l\'imprévu, vous résumez et vous expliquez un problème.',
      B2: 'Vous comprenez le contenu essentiel de textes complexes. Vous échangez avec spontanéité et aisance, sans tension, et vous défendez un point de vue en nuançant.',
      'B2+': 'Vous argumentez efficacement, vous reliez vos idées avec aisance et vous commencez à adapter votre registre à votre interlocuteur.',
      C1: 'Vous comprenez des textes longs et exigeants, y compris l\'implicite. Vous vous exprimez couramment, avec précision, et vous adaptez votre registre à la situation professionnelle.',
      C2: 'Vous comprenez sans effort pratiquement tout ce que vous lisez ou entendez. Vous restituez faits et arguments avec cohérence, et vous rendez les nuances les plus fines, même dans des situations complexes.'
    },
    /* écoutes : un message, une seule voix, à enregistrer par Paul */
    audios: {
      'test-e-a1': 'Hi, I\'m Sam. I\'m thirty-two, and I live in London with my brother.',
      'test-e-a2': 'Hi, it\'s Mark. Sorry, I can\'t come to the meeting tomorrow. Can we meet on Friday instead?',
      'test-e-b1': 'We were going to launch the product in March, but the supplier had a problem, so it\'ll probably be May. Honestly, I\'d rather wait than launch something unfinished.',
      'test-e-b2': 'Had we known the venue was that small, we\'d have booked somewhere else. Still, the clients didn\'t seem to mind, and two of them have already signed.',
      'test-e-c1': 'I wouldn\'t go so far as to say it was a failure, but had the team been consulted earlier, a good deal of the backlash could have been avoided.',
      'test-e-c2': 'It reads beautifully, I\'ll grant you that. But a plan that assumes every supplier delivers on time and every client pays within thirty days doesn\'t survive its first contact with reality.',
      'test-s-a1': 'Hello, this is Paul. I have two children and a dog. The dog\'s name is Max.',
      'test-s-a2': 'Hello, this is reception. Your taxi is here. It\'s waiting in front of the hotel.',
      'test-s-b1': 'I\'ve been trying to reach you all morning. The client changed the date, so the meeting\'s now on Tuesday, not Monday.',
      'test-s-b2': 'If I\'d known the deadline was Friday, I\'d never have agreed to take on the extra project. Now we\'ll have to work through the weekend.',
      'test-s-c1': 'Far from solving the problem, the new procedure has merely shifted it elsewhere. Frankly, we\'d be better off going back to the old system until we\'ve thought this through.',
      'test-s-c2': 'Look, I\'m not against it in principle. It\'s a clever idea. It\'s just that the timing couldn\'t be worse, with the audit next month and half the team on leave.'
    }
  };
  if (!window.TESTS.audiosPrets) ['entree', 'sortie'].forEach(function (k) { Object.keys(window.TESTS[k]).forEach(function (n) { window.TESTS[k][n] = window.TESTS[k][n].filter(function (it) { return it[3] !== E; }); }); });
})();
