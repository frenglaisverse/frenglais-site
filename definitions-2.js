/* Définitions, suite : paliers 1 à 5 (5 = niveau tuteur). Format : définition|mot|palier|secteur */
(function(){
  const T = `The opposite of early.|late|1|general
A person you know well and like.|friend|1|general
To make food hot so you can eat it.|cook|1|general
The room where you sleep.|bedroom|1|immo
A vehicle with two wheels that you pedal.|bike|1|tour
The place where planes take off and land.|airport|1|tour
A drink made from grapes.|wine|1|hotel
A piece of paper that lets you travel by train or plane.|ticket|1|tour
The person who brings food to your table.|waiter|1|hotel
A place where you can buy food every week, often outside.|market|1|tour
A thing you wear on your wrist to know the time.|watch|1|luxe
Very big and important shop for one brand.|boutique|1|luxe
To go to bed and close your eyes.|sleep|1|general
The money you pay to travel on a bus.|fare|1|tour
A room where several people work at desks.|office|1|pro
To finish a job and stop working forever, usually at 65.|retire|2|pro
A person who is learning a job in a company for a short time.|trainee|2|pro
The total money a company receives from sales.|revenue|2|pro
A written description of your studies and jobs.|CV|2|pro
To ask for a job officially.|apply|2|pro
A meeting with a client to show a product.|demo|2|pro
A short break in a meeting or a show.|interval|2|general
To check a guest out and give them the bill.|settle the bill|2|hotel
A small fridge in a hotel room with drinks.|minibar|2|hotel
A locked box in a hotel room for valuables.|safe|2|hotel
A long, soft coat you wear after a shower.|bathrobe|2|hotel
The person who keeps the wine list in a restaurant.|sommelier|2|hotel
A meal where guests serve themselves.|buffet|2|hotel
A stone that is very hard and shines.|diamond|2|luxe
A small bag held in the hand, for an evening out.|clutch|2|luxe
Leather with a soft, velvety surface.|suede|2|luxe
To make a piece of clothing shorter or tighter.|alter|2|luxe
The face of a watch.|dial|2|luxe
A small bottle of perfume to try.|sample|2|luxe
A car you rent with a driver.|chauffeur|2|tour
The office where tourists get maps and information.|tourist office|2|tour
A bus that goes regularly between two places, like an airport and a hotel.|shuttle|2|tour
A ticket to go somewhere and come back.|return ticket|2|tour
The money you pay to use a motorway.|toll|2|tour
A room under a house, often used for storage.|cellar|2|immo
A room with glass walls attached to a house.|conservatory|2|immo
The person who manages a building for the owners.|property manager|2|immo
To move your things into a new home.|move in|2|immo
A written description of a property for sale.|listing|2|immo
An area of land around or next to a house.|plot|2|immo
To make an old building look new again.|renovate|2|immo
Feeling nervous about something that might happen.|anxious|2|general
To decide not to do something you planned.|cancel|2|general
A strong wish to have something.|desire|2|general
To make somebody believe something false.|deceive|3|general
A person who is very careful about details.|meticulous|3|general
Speaking openly and honestly, sometimes too much.|blunt|3|general
To make something less serious or painful.|alleviate|3|general
A sudden, strong increase.|surge|3|general
Not willing to spend money.|stingy|3|general
To make a situation worse.|aggravate|3|general
Something that slows you down or stops progress.|hindrance|3|general
To talk someone into doing something.|persuade|3|general
Done on purpose.|deliberate|3|general
The money you earn from an investment, as a percentage.|return|3|pro
A plan of action to reach a long-term goal.|strategy|3|pro
To give part of your responsibilities to someone else.|delegate|3|pro
A person who owns shares in a company.|shareholder|3|pro
The joining of two companies into one.|merger|3|pro
A document asking companies to offer a price for a contract.|tender|3|pro
Extra hours worked beyond the normal schedule.|overtime|3|pro
The period at the start of a job when you are being tested.|probation|3|pro
Money you spend for your work and the company pays back.|expenses|3|pro
To contact someone again about something not yet answered.|follow up|3|pro
A short, persuasive presentation of an idea or product.|pitch|3|pro
The percentage of website visitors who buy something.|conversion rate|3|pro
To cut costs by reducing staff.|downsize|3|pro
A guest who comes back again and again.|regular|3|hotel
The money a hotel earns per available room.|revenue per room|3|hotel
The prices that change according to demand.|dynamic pricing|3|hotel
A list of the duties and shifts of the staff.|rota|3|hotel
The process of a guest arriving and getting a key.|check-in|3|hotel
A reservation that is paid in advance and cannot be cancelled.|non-refundable booking|3|hotel
An unhappy guest\'s formal statement of a problem.|complaint|3|hotel
Free extras, like breakfast, offered to say sorry.|goodwill gesture|3|hotel
The value of a gemstone\'s weight.|carat|3|luxe
Made entirely by hand by a skilled worker.|handcrafted|3|luxe
A famous person paid to represent a brand.|ambassador|3|luxe
A product sold only to a few people.|exclusive|3|luxe
A small collection created with another designer.|collaboration|3|luxe
The history and traditions of a fashion house.|heritage|3|luxe
A tour you organise yourself rather than in a group.|independent travel|3|tour
A cheap, basic place to stay for young travellers.|hostel|3|tour
The person who leads and looks after a group of tourists.|tour leader|3|tour
A place famous for its natural beauty, protected by law.|national park|3|tour
A trip combining flights, hotel and activities for one price.|package holiday|3|tour
To arrive at a destination by plane.|land|3|tour
The tax tourists pay per night in a hotel.|tourist tax|3|tour
A clause that must be met before a sale is final.|condition precedent|3|immo
The fee an estate agent earns on a sale.|commission|3|immo
The increase in the value of a property.|capital gain|3|immo
The amount a bank will lend you.|borrowing capacity|3|immo
The official evaluation of a property\'s price.|valuation|3|immo
A house that is not overlooked by neighbours.|secluded|3|immo
Someone who rents a room in a flat shared with others.|flatmate|3|immo
Unwilling to change, even when wrong.|obstinate|4|general
Lasting for a very short time.|ephemeral|4|general
Showing excessive pride in yourself.|arrogant|4|general
To criticise someone strongly.|reprimand|4|general
Done secretly and in a way that is not allowed.|underhand|4|general
A clever way of getting round a rule.|loophole|4|general
To make something unclear or harder to understand.|obscure|4|general
To waste time instead of doing what you should.|procrastinate|4|general
Extremely careful to avoid risks.|risk-averse|4|general
A feeling of unease about something that seems wrong.|misgiving|4|general
A sharp fall in business activity.|downturn|4|pro
Getting another company to do part of your work, often abroad.|offshoring|4|pro
Money owed by a company to others.|liabilities|4|pro
The value of a company\'s possessions.|assets|4|pro
A measurable value that shows how well a goal is being met.|KPI|4|pro
The ability of a company to pay its short-term debts.|liquidity|4|pro
A trial version of a product released to test the market.|pilot|4|pro
To reach an agreement in which both sides give something up.|compromise|4|pro
Comparing your performance with the best in your industry.|benchmarking|4|pro
To sell more rooms than you have, expecting cancellations.|overbook|4|hotel
The percentage of guests who come back.|retention rate|4|hotel
Free products and services a hotel offers its guests.|complimentary amenities|4|hotel
Sending guests to a partner hotel when you are full.|walking|4|hotel
The careful planning of prices to maximise revenue.|yield management|4|hotel
The checks done by a hotel at night to close the day\'s accounts.|night audit|4|hotel
Luxury that is elegant without being showy.|understated|4|luxe
The feeling that a product is rare and desirable.|exclusivity|4|luxe
Too obvious and expensive in a way that lacks taste.|ostentatious|4|luxe
A brand\'s most important store, in a key location.|flagship|4|luxe
To persuade a customer to buy a more expensive item.|upsell|4|luxe
The value a customer believes a product has.|perceived value|4|luxe
Travel that protects nature and local communities.|ecotourism|4|tour
The maximum number of visitors a place can handle.|carrying capacity|4|tour
A person who works remotely while travelling the world.|digital nomad|4|tour
Selling a property in exchange for a lifetime income.|life annuity sale|4|immo
Owning a property without the right to live in it.|bare ownership|4|immo
A building that loses too much heat.|energy-inefficient|4|immo
The ratio of your debts to your income.|debt-to-income ratio|4|immo
A word or phrase that means the same as another.|synonym|4|general
A formal written request signed by many people.|petition|4|general
To recover quickly after a difficulty.|bounce back|4|general
A clear and obvious example of something.|textbook case|4|general
To persuade someone gently by praising them.|flatter|4|general
A natural ability to do something well.|knack|4|general
To speak in a way that makes a problem seem smaller.|play down|4|general
A remark that seems to praise but actually criticises.|backhanded compliment|5|general
To avoid giving a direct answer.|equivocate|5|general
Expressing something indirectly to make it sound less unpleasant.|euphemism|5|general
A small, unimportant detail used to avoid the main issue.|red herring|5|general
Done in a way that is deliberately vague.|noncommittal|5|general
An unpleasant situation where every choice is bad.|catch-22|5|general
To make a problem seem less serious than it is.|downplay|5|general
A sudden insight that solves a problem.|epiphany|5|general
Having two meanings, often deliberately.|ambiguous|5|general
Too willing to obey or please people in power.|obsequious|5|general
Showing a lack of respect in a clever, amusing way.|irreverent|5|general
To weaken something gradually.|undermine|5|general
Something said that is the opposite of what is meant, for humour.|irony|5|general
To deal with a problem by avoiding it.|sidestep|5|general
A situation where people are in strong disagreement.|at loggerheads|5|general
A person who opposes an idea just to test it.|devil\'s advocate|5|general
To start something in a difficult way.|get off on the wrong foot|5|general
To say something that reveals a secret by mistake.|let the cat out of the bag|5|general
To be very close to a decision or result.|on the verge|5|general
A matter that is open to discussion and has no clear answer.|moot point|5|general
A sudden collapse of a company\'s share price.|crash|5|pro
Money paid to a manager to leave a company.|golden handshake|5|pro
A situation where a company is acquired against its will.|hostile takeover|5|pro
Hidden costs that appear after a decision.|knock-on effects|5|pro
The amount of time before a company runs out of cash.|runway|5|pro
To check a company thoroughly before buying it.|due diligence|5|pro
Gaining an advantage by acting before competitors.|first-mover advantage|5|pro
The point at which an idea or product starts spreading rapidly.|tipping point|5|pro
A plan to replace key people when they leave.|succession planning|5|pro
To talk about an issue at length without reaching a decision.|go round in circles|5|pro
A guest\'s experience being turned from bad to excellent.|service recovery|5|hotel
The art of anticipating guests\' needs before they ask.|anticipatory service|5|hotel
The comparison of a hotel\'s revenue to its competitors\'.|RevPAR index|5|hotel
Elegance that seems natural and effortless.|sprezzatura|5|luxe
A product that people buy precisely because it is expensive.|Veblen good|5|luxe
The deliberate limitation of supply to raise desire.|artificial scarcity|5|luxe
The tradition and skills passed on in luxury workshops.|savoir-faire|5|luxe
The practice of placing local culture at the heart of travel.|immersive travel|5|tour
The harmful effects of tourism on a local community.|tourism backlash|5|tour
A legal right to buy a property before anyone else.|right of first refusal|5|immo
The use of borrowed money to increase potential return.|leverage|5|immo
The difference between the asking price and the final price.|negotiation margin|5|immo`;
  window.DEFS = (window.DEFS || []).concat(T.split('\n').map(l => { const [d, w, n, s] = l.split('|'); return [d.replace(/\\'/g, "'"), w.replace(/\\'/g, "'"), +n, s]; }));
})();
