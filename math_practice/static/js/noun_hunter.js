// Noun Hunter Game JavaScript

class NounHunterGame {
    constructor() {
        this.difficulty = 'easy';
        this.currentSentence = null;
        this.score = 0;
        this.streak = 0;
        this.correct = 0;
        this.total = 0;
        this.hintUsed = false;
        this.achievements = {
            firstNoun: false,
            streak5: false,
            perfect10: false,
            nounMaster: false
        };
        
        this.sentences = {
            easy: [
                { text: "On the couch sleeps a fluffy cat.", noun: "cat", hint: "What sleeps on the couch?" },
                { text: "Playing fetch is what my dog loves.", noun: "dog", hint: "Who loves playing fetch?" },
                { text: "Look at the beautiful book over there.", noun: "book", hint: "What is beautiful?" },
                { text: "Yesterday Sarah ate her lunch quickly.", noun: "Sarah", hint: "Who ate lunch?" },
                { text: "Brightly shines the warm sun today.", noun: "sun", hint: "What shines brightly?" },
                { text: "Delicious cookies were baked by my mom.", noun: "mom", hint: "Who baked cookies?" },
                { text: "Green leaves grow on that tall tree.", noun: "tree", hint: "What has green leaves?" },
                { text: "In the morning sings a little bird.", noun: "bird", hint: "What sings in the morning?" },
                { text: "Down the street drives a red car.", noun: "car", hint: "What drives down the street?" },
                { text: "Every day our teacher helps us learn.", noun: "teacher", hint: "Who helps us learn?" },
                { text: "Very high bounced the rubber ball.", noun: "ball", hint: "What bounced very high?" },
                { text: "Yesterday my friend came to visit me.", noun: "friend", hint: "Who came to visit?" },
                { text: "Sweet is the smell of that flower.", noun: "flower", hint: "What smells sweet?" },
                { text: "Every morning Dad reads the newspaper.", noun: "Dad", hint: "Who reads the newspaper?" },
                { text: "Loudly rang the phone in the hall.", noun: "phone", hint: "What rang loudly?" },
                { text: "In the yard plays a happy puppy.", noun: "puppy", hint: "What plays in the yard?" },
                { text: "Across the sky floats a white cloud.", noun: "cloud", hint: "What floats across the sky?" },
                { text: "On the desk sits a new pencil.", noun: "pencil", hint: "What sits on the desk?" },
                { text: "Under the bridge flows a small river.", noun: "river", hint: "What flows under the bridge?" },
                { text: "Behind the house grows a big garden.", noun: "garden", hint: "What grows behind the house?" },
                { text: "Inside the box hides a little mouse.", noun: "mouse", hint: "What hides in the box?" },
                { text: "Through the window shines bright light.", noun: "light", hint: "What shines through the window?" },
                { text: "Near the lake stands a tall tower.", noun: "tower", hint: "What stands near the lake?" },
                { text: "Around the corner waits my sister Anna.", noun: "Anna", hint: "Who waits around the corner?" },
                { text: "In the classroom hangs a big clock.", noun: "clock", hint: "What hangs in the classroom?" },
                { text: "Above the mountains flies an eagle.", noun: "eagle", hint: "What flies above the mountains?" },
                { text: "Beside the road grows a pine tree.", noun: "tree", hint: "What grows beside the road?" },
                { text: "Within the story lives a brave knight.", noun: "knight", hint: "Who lives in the story?" },
                { text: "Outside the door sits our neighbor Mike.", noun: "Mike", hint: "Who sits outside the door?" },
                { text: "Between the pages lies a bookmark.", noun: "bookmark", hint: "What lies between the pages?" },
                { text: "At the store works my uncle Tom.", noun: "Tom", hint: "Who works at the store?" },
                { text: "Over the fence jumped a brown rabbit.", noun: "rabbit", hint: "What jumped over the fence?" },
                { text: "From the kitchen comes a nice smell.", noun: "smell", hint: "What comes from the kitchen?" },
                { text: "With the children plays their cheerful nanny.", noun: "nanny", hint: "Who plays with the children?" },
                { text: "Past the school walks my friend Jenny.", noun: "Jenny", hint: "Who walks past the school?" },
                { text: "Into the pond splashed a big frog.", noun: "frog", hint: "What splashed into the pond?" },
                { text: "After dinner comes sweet dessert always.", noun: "dessert", hint: "What comes after dinner?" },
                { text: "During recess rings the loud bell.", noun: "bell", hint: "What rings during recess?" },
                { text: "Across the field runs a wild deer.", noun: "deer", hint: "What runs across the field?" },
                { text: "Before bedtime reads a story Mom.", noun: "Mom", hint: "Who reads a story?" },
                { text: "Along the path grows colorful grass.", noun: "grass", hint: "What grows along the path?" },
                { text: "Throughout the day shines the bright moon.", noun: "moon", hint: "What shines throughout the day?" },
                { text: "Near the playground stands a wooden bench.", noun: "bench", hint: "What stands near the playground?" },
                { text: "Beside me sits my cousin Lisa.", noun: "Lisa", hint: "Who sits beside me?" },
                { text: "Underneath the table hides a toy truck.", noun: "truck", hint: "What hides underneath the table?" },
                { text: "During lunch eats an apple Sam.", noun: "Sam", hint: "Who eats an apple?" },
                { text: "Beyond the hills rises the morning star.", noun: "star", hint: "What rises beyond the hills?" },
                { text: "Among the toys lies a stuffed bear.", noun: "bear", hint: "What lies among the toys?" },
                { text: "Around the building walks the security guard.", noun: "guard", hint: "Who walks around the building?" },
                { text: "From the oven smells fresh bread.", noun: "bread", hint: "What smells fresh?" },
                { text: "At the zoo lives a tall giraffe.", noun: "giraffe", hint: "What lives at the zoo?" },
                { text: "Behind the barn sleeps our old horse.", noun: "horse", hint: "What sleeps behind the barn?" },
                { text: "Above the clouds flies a small plane.", noun: "plane", hint: "What flies above the clouds?" },
                { text: "Near the forest lives a wise owl.", noun: "owl", hint: "What lives near the forest?" },
                { text: "Under the stars camps our scout troop.", noun: "troop", hint: "What camps under the stars?" },
                { text: "Across the room stands my brother Jack.", noun: "Jack", hint: "Who stands across the room?" },
                { text: "Inside the cage chirps a yellow bird.", noun: "bird", hint: "What chirps inside the cage?" },
                { text: "Through the air soars a paper kite.", noun: "kite", hint: "What soars through the air?" },
                { text: "On the shelf sits an old vase.", noun: "vase", hint: "What sits on the shelf?" },
                { text: "Down the hill rolls a red wagon.", noun: "wagon", hint: "What rolls down the hill?" },
                { text: "Within the cave sleeps a big bat.", noun: "bat", hint: "What sleeps in the cave?" },
                { text: "Beyond the gate waits my aunt Mary.", noun: "Mary", hint: "Who waits beyond the gate?" },
                { text: "Along the shore walks a happy crab.", noun: "crab", hint: "What walks along the shore?" },
                { text: "Against the wall leans a blue bike.", noun: "bike", hint: "What leans against the wall?" },
                { text: "Throughout the night hoots an owl.", noun: "owl", hint: "What hoots throughout the night?" },
                { text: "Beside the fire sits my grandfather Bill.", noun: "Bill", hint: "Who sits beside the fire?" },
                { text: "Below the nest waits a baby bird.", noun: "bird", hint: "What waits below the nest?" },
                { text: "Around the pond swims a fat duck.", noun: "duck", hint: "What swims around the pond?" },
                { text: "During spring blooms a cherry tree.", noun: "tree", hint: "What blooms during spring?" },
                { text: "Among the flowers buzzes a busy bee.", noun: "bee", hint: "What buzzes among the flowers?" },
                { text: "Across the bridge walks my teacher Mrs. Lee.", noun: "Mrs. Lee", hint: "Who walks across the bridge?" },
                { text: "Inside the barn stands a brown cow.", noun: "cow", hint: "What stands inside the barn?" },
                { text: "Near the window sits a gray cat.", noun: "cat", hint: "What sits near the window?" },
                { text: "Above the grass flies a small butterfly.", noun: "butterfly", hint: "What flies above the grass?" },
                { text: "Behind the curtain hides my sister Kate.", noun: "Kate", hint: "Who hides behind the curtain?" },
                { text: "Underneath the porch lives a little spider.", noun: "spider", hint: "What lives underneath the porch?" }
            ],
            medium: [
                { text: "For the test studied all the students.", noun: "students", hint: "Who studied for the test?" },
                { text: "Wonderful stories are told by my grandmother.", noun: "grandmother", hint: "Who tells stories?" },
                { text: "Suddenly crashed the old computer again.", noun: "computer", hint: "What crashed suddenly?" },
                { text: "Around the garden flew beautiful butterflies.", noun: "butterflies", hint: "What flew around the garden?" },
                { text: "During assembly the principal announced winners.", noun: "principal", hint: "Who announced the winners?" },
                { text: "The guitar is played well by my brother.", noun: "brother", hint: "Who plays the guitar?" },
                { text: "Many interesting books can be found at the library.", noun: "library", hint: "Where can books be found?" },
                { text: "In our garden grow fresh vegetables daily.", noun: "vegetables", hint: "What grows in the garden?" },
                { text: "An important discovery was made by the scientist.", noun: "scientist", hint: "Who made a discovery?" },
                { text: "Across the sky moved dark clouds quickly.", noun: "clouds", hint: "What moved across the sky?" },
                { text: "Last week the competition was won by my sister.", noun: "sister", hint: "Who won the competition?" },
                { text: "Very fast ran the talented athlete today.", noun: "athlete", hint: "Who ran very fast?" },
                { text: "On the wall hang many colorful paintings.", noun: "paintings", hint: "What hangs on the wall?" },
                { text: "A beautiful song was played by the musician.", noun: "musician", hint: "Who played a song?" },
                { text: "In the forest live many wild animals.", noun: "animals", hint: "What lives in the forest?" },
                { text: "Across the ocean sailed the mighty battleship.", noun: "battleship", hint: "What sailed across the ocean?" },
                { text: "Through the telescope observed the astronomer carefully.", noun: "astronomer", hint: "Who observed through the telescope?" },
                { text: "Above the stage performed talented dancers gracefully.", noun: "dancers", hint: "Who performed above the stage?" },
                { text: "Inside the museum displayed ancient artifacts proudly.", noun: "artifacts", hint: "What was displayed in the museum?" },
                { text: "Beneath the surface swim colorful tropical fish.", noun: "fish", hint: "What swims beneath the surface?" },
                { text: "Throughout the valley echoed loud thunder rumbling.", noun: "thunder", hint: "What echoed throughout the valley?" },
                { text: "Beyond the horizon appeared mysterious islands slowly.", noun: "islands", hint: "What appeared beyond the horizon?" },
                { text: "Within the cave discovered explorers rare crystals.", noun: "explorers", hint: "Who discovered rare crystals?" },
                { text: "Against the wall leaned several wooden ladders.", noun: "ladders", hint: "What leaned against the wall?" },
                { text: "During winter visit migrating birds our region.", noun: "birds", hint: "What visits during winter?" },
                { text: "Among the crowd stood famous celebrities quietly.", noun: "celebrities", hint: "Who stood among the crowd?" },
                { text: "Behind the curtain waited nervous performers anxiously.", noun: "performers", hint: "Who waited behind the curtain?" },
                { text: "Beside the fountain played cheerful children happily.", noun: "children", hint: "Who played beside the fountain?" },
                { text: "Near the entrance gathered curious visitors eagerly.", noun: "visitors", hint: "Who gathered near the entrance?" },
                { text: "Around the campfire told storytellers exciting tales.", noun: "storytellers", hint: "Who told tales around the campfire?" },
                { text: "Through the marketplace wandered eager shoppers constantly.", noun: "shoppers", hint: "Who wandered through the marketplace?" },
                { text: "Beneath the waves swam graceful dolphins playfully.", noun: "dolphins", hint: "What swam beneath the waves?" },
                { text: "Along the railroad traveled freight trains regularly.", noun: "trains", hint: "What traveled along the railroad?" },
                { text: "Above the treetops soared magnificent eagles proudly.", noun: "eagles", hint: "What soared above the treetops?" },
                { text: "Within the laboratory conducted experiments careful researchers.", noun: "researchers", hint: "Who conducted experiments?" },
                { text: "Across the desert traveled weary nomads slowly.", noun: "nomads", hint: "Who traveled across the desert?" },
                { text: "Behind the scenes worked dedicated technicians diligently.", noun: "technicians", hint: "Who worked behind the scenes?" },
                { text: "Throughout the stadium cheered excited spectators loudly.", noun: "spectators", hint: "Who cheered throughout the stadium?" },
                { text: "Beside the river grazed peaceful cattle quietly.", noun: "cattle", hint: "What grazed beside the river?" },
                { text: "Among the ruins studied ancient historians carefully.", noun: "historians", hint: "Who studied among the ruins?" },
                { text: "Under the moonlight prowled stealthy predators silently.", noun: "predators", hint: "What prowled under the moonlight?" },
                { text: "Within the factory assembled skilled workers quickly.", noun: "workers", hint: "Who assembled within the factory?" },
                { text: "Beyond the clouds appeared distant airplanes suddenly.", noun: "airplanes", hint: "What appeared beyond the clouds?" },
                { text: "During the ceremony performed traditional musicians beautifully.", noun: "musicians", hint: "Who performed during the ceremony?" },
                { text: "Across the bridge marched determined soldiers bravely.", noun: "soldiers", hint: "Who marched across the bridge?" },
                { text: "Inside the greenhouse cultivated exotic orchids carefully.", noun: "orchids", hint: "What was cultivated in the greenhouse?" },
                { text: "Throughout the neighborhood patrolled vigilant officers regularly.", noun: "officers", hint: "Who patrolled throughout the neighborhood?" },
                { text: "Beneath the surface discovered marine biologists fascinating creatures.", noun: "biologists", hint: "Who discovered fascinating creatures?" },
                { text: "Along the coastline nested numerous seabirds peacefully.", noun: "seabirds", hint: "What nested along the coastline?" },
                { text: "Through the countryside wandered traveling merchants regularly.", noun: "merchants", hint: "Who wandered through the countryside?" },
                { text: "Above the valley circled hungry vultures patiently.", noun: "vultures", hint: "What circled above the valley?" },
                { text: "Within the temple meditated devoted monks silently.", noun: "monks", hint: "Who meditated within the temple?" },
                { text: "Across the tundra migrated caribou herds seasonally.", noun: "herds", hint: "What migrated across the tundra?" },
                { text: "Behind the counter served friendly baristas cheerfully.", noun: "baristas", hint: "Who served behind the counter?" },
                { text: "Throughout the jungle prowled dangerous jaguars stealthily.", noun: "jaguars", hint: "What prowled throughout the jungle?" },
                { text: "Beneath the canopy nested colorful parrots noisily.", noun: "parrots", hint: "What nested beneath the canopy?" },
                { text: "Among the reefs swam tropical angelfish gracefully.", noun: "angelfish", hint: "What swam among the reefs?" },
                { text: "During the harvest gathered hardworking farmers diligently.", noun: "farmers", hint: "Who gathered during harvest?" },
                { text: "Within the palace lived wealthy merchants comfortably.", noun: "merchants", hint: "Who lived within the palace?" },
                { text: "Across the tightrope balanced brave acrobats carefully.", noun: "acrobats", hint: "Who balanced across the tightrope?" },
                { text: "Above the prairie soared majestic hawks freely.", noun: "hawks", hint: "What soared above the prairie?" },
                { text: "Throughout the cavern hung sleeping bats quietly.", noun: "bats", hint: "What hung in the cavern?" },
                { text: "Behind the podium spoke passionate politicians loudly.", noun: "politicians", hint: "Who spoke behind the podium?" },
                { text: "Beneath the iceberg swam curious penguins playfully.", noun: "penguins", hint: "What swam beneath the iceberg?" },
                { text: "Among the vines grew delicious grapes abundantly.", noun: "grapes", hint: "What grew among the vines?" },
                { text: "During the monsoon gathered dark thunderclouds heavily.", noun: "thunderclouds", hint: "What gathered during monsoon?" },
                { text: "Within the workshop crafted talented artisans carefully.", noun: "artisans", hint: "Who crafted in the workshop?" },
                { text: "Across the savanna roamed elephant herds peacefully.", noun: "herds", hint: "What roamed across the savanna?" },
                { text: "Above the treetops swung agile monkeys energetically.", noun: "monkeys", hint: "What swung above the treetops?" },
                { text: "Throughout the mansion wandered curious tourists eagerly.", noun: "tourists", hint: "Who wandered through the mansion?" },
                { text: "Beneath the waterfall splashed rainbow trout vigorously.", noun: "trout", hint: "What splashed beneath the waterfall?" },
                { text: "Among the shelves arranged busy librarians methodically.", noun: "librarians", hint: "Who arranged among the shelves?" },
                { text: "During the parade marched colorful floats slowly.", noun: "floats", hint: "What marched during the parade?" },
                { text: "Within the hive buzzed worker bees constantly.", noun: "bees", hint: "What buzzed within the hive?" },
                { text: "Across the rapids paddled experienced kayakers bravely.", noun: "kayakers", hint: "Who paddled across the rapids?" },
                { text: "Above the amphitheater echoed powerful voices dramatically.", noun: "voices", hint: "What echoed above the amphitheater?" }
            ],
            hard: [
                { text: "The key to success is happiness in life.", noun: "happiness", hint: "What is the key to success? (It's an abstract noun)" },
                { text: "At the university teaches mathematics Dr. Johnson.", noun: "Dr. Johnson", hint: "Who teaches mathematics? (It's a proper noun)" },
                { text: "Different things to different people means freedom.", noun: "freedom", hint: "What means different things? (It's an idea)" },
                { text: "The tallest mountain in the world is Mount Everest.", noun: "Mount Everest", hint: "What is the tallest mountain? (It's a proper noun)" },
                { text: "People overcome their fears through courage and strength.", noun: "courage", hint: "What helps people overcome fears? (It's an abstract noun)" },
                { text: "Through South America flows the mighty Amazon River.", noun: "Amazon River", hint: "What flows through South America? (It's a proper noun)" },
                { text: "Over time can be developed intelligence and skill.", noun: "intelligence", hint: "What can be developed? (It's an abstract concept)" },
                { text: "Her research findings were published by Professor Smith.", noun: "Professor Smith", hint: "Who published research? (It's a proper noun)" },
                { text: "The world becomes better through kindness and care.", noun: "kindness", hint: "What makes the world better? (It's an abstract noun)" },
                { text: "Very old and historic is the Great Wall of China.", noun: "Great Wall of China", hint: "What is very old? (It's a proper noun)" },
                { text: "To achievement and success leads determination always.", noun: "determination", hint: "What leads to achievement? (It's an abstract noun)" },
                { text: "The capital of Japan is the city of Tokyo.", noun: "Tokyo", hint: "What is the capital? (It's a proper noun - a place)" },
                { text: "Difficult problems are solved through creativity and thought.", noun: "creativity", hint: "What helps solve problems? (It's an abstract noun)" },
                { text: "For many years ruled the country Queen Elizabeth.", noun: "Queen Elizabeth", hint: "Who ruled for many years? (It's a proper noun)" },
                { text: "With age and experience comes wisdom and understanding.", noun: "wisdom", hint: "What comes with experience? (It's an abstract noun)" },
                { text: "Throughout history demonstrated humanity remarkable bravery.", noun: "bravery", hint: "What did humanity demonstrate? (It's an abstract noun)" },
                { text: "In France stands the famous Eiffel Tower tall.", noun: "Eiffel Tower", hint: "What stands in France? (It's a proper noun)" },
                { text: "True success requires honesty and hard work.", noun: "honesty", hint: "What does success require? (It's an abstract noun)" },
                { text: "Explored the Pacific Ocean Captain James Cook bravely.", noun: "Captain James Cook", hint: "Who explored the Pacific Ocean? (It's a proper noun)" },
                { text: "Within every person exists unique creativity and talent.", noun: "creativity", hint: "What exists within people? (It's an abstract noun)" },
                { text: "Near Egypt flows the historic Nile River northward.", noun: "Nile River", hint: "What flows near Egypt? (It's a proper noun)" },
                { text: "Great leaders demonstrate unwavering integrity always.", noun: "integrity", hint: "What do great leaders demonstrate? (It's an abstract noun)" },
                { text: "In New York City towers the Empire State Building.", noun: "Empire State Building", hint: "What towers in NYC? (It's a proper noun)" },
                { text: "Through life guides us compassion and empathy.", noun: "compassion", hint: "What guides us through life? (It's an abstract noun)" },
                { text: "Wrote famous plays and sonnets William Shakespeare.", noun: "William Shakespeare", hint: "Who wrote famous plays? (It's a proper noun)" },
                { text: "The foundation of relationships is trust and respect.", noun: "trust", hint: "What is the foundation of relationships? (It's an abstract noun)" },
                { text: "Beyond Europe lies the vast continent of Asia.", noun: "Asia", hint: "What lies beyond Europe? (It's a proper noun)" },
                { text: "Innovation drives progress forward in society always.", noun: "innovation", hint: "What drives progress? (It's an abstract noun)" },
                { text: "Discovered America in fourteen ninety-two Christopher Columbus.", noun: "Christopher Columbus", hint: "Who discovered America? (It's a proper noun)" },
                { text: "Achievement requires perseverance and dedication every day.", noun: "perseverance", hint: "What does achievement require? (It's an abstract noun)" },
                { text: "The path to mastery demands patience and practice.", noun: "patience", hint: "What does mastery demand? (It's an abstract noun)" },
                { text: "In ancient Greece taught philosophy the great Socrates.", noun: "Socrates", hint: "Who taught philosophy? (It's a proper noun)" },
                { text: "Strong bonds create lasting friendship between people.", noun: "friendship", hint: "What creates strong bonds? (It's an abstract noun)" },
                { text: "Across India stretches the sacred Ganges River peacefully.", noun: "Ganges River", hint: "What stretches across India? (It's a proper noun)" },
                { text: "Personal growth requires humility and self-reflection always.", noun: "humility", hint: "What does personal growth require? (It's an abstract noun)" },
                { text: "Painted the ceiling beautifully Renaissance artist Michelangelo.", noun: "Michelangelo", hint: "Who painted the ceiling? (It's a proper noun)" },
                { text: "True character reveals itself through adversity and trials.", noun: "adversity", hint: "What reveals character? (It's an abstract noun)" },
                { text: "In California stands the magnificent Golden Gate Bridge.", noun: "Golden Gate Bridge", hint: "What stands in California? (It's a proper noun)" },
                { text: "Inner strength comes from resilience and determination.", noun: "resilience", hint: "What gives inner strength? (It's an abstract noun)" },
                { text: "Composed beautiful symphonies the talented Ludwig van Beethoven.", noun: "Ludwig van Beethoven", hint: "Who composed symphonies? (It's a proper noun)" },
                { text: "Peace brings harmony to all living creatures.", noun: "harmony", hint: "What does peace bring? (It's an abstract noun)" },
                { text: "Through Russia flows the longest Volga River majestically.", noun: "Volga River", hint: "What flows through Russia? (It's a proper noun)" },
                { text: "Scientific progress depends upon curiosity and experimentation.", noun: "curiosity", hint: "What does progress depend on? (It's an abstract noun)" },
                { text: "Led India to independence the peaceful Mahatma Gandhi.", noun: "Mahatma Gandhi", hint: "Who led India to independence? (It's a proper noun)" },
                { text: "Real learning happens through mistakes and reflection.", noun: "reflection", hint: "What helps learning happen? (It's an abstract noun)" },
                { text: "In Rome towers the ancient and historic Colosseum.", noun: "Colosseum", hint: "What towers in Rome? (It's a proper noun)" },
                { text: "Lasting change requires commitment and consistency always.", noun: "commitment", hint: "What does lasting change require? (It's an abstract noun)" },
                { text: "Sailed around the world the brave Ferdinand Magellan.", noun: "Ferdinand Magellan", hint: "Who sailed around the world? (It's a proper noun)" },
                { text: "True wealth lies in gratitude and contentment.", noun: "gratitude", hint: "Where does true wealth lie? (It's an abstract noun)" },
                { text: "In Australia lies the great and colorful Great Barrier Reef.", noun: "Great Barrier Reef", hint: "What lies in Australia? (It's a proper noun)" },
                { text: "Effective leadership demonstrates vision and inspiration daily.", noun: "vision", hint: "What does leadership demonstrate? (It's an abstract noun)" },
                { text: "Discovered gravity and motion Sir Isaac Newton brilliantly.", noun: "Sir Isaac Newton", hint: "Who discovered gravity? (It's a proper noun)" },
                { text: "Meaningful life requires purpose and passion always.", noun: "purpose", hint: "What does meaningful life require? (It's an abstract noun)" },
                { text: "Through challenges develops strength and character gradually.", noun: "strength", hint: "What develops through challenges? (It's an abstract noun)" },
                { text: "In Egypt built magnificent pyramids ancient Pharaohs grandly.", noun: "Pharaohs", hint: "Who built the pyramids? (It's a proper noun)" },
                { text: "True happiness comes from generosity and kindness.", noun: "generosity", hint: "What brings happiness? (It's an abstract noun)" },
                { text: "Through China winds the historic Yangtze River endlessly.", noun: "Yangtze River", hint: "What winds through China? (It's a proper noun)" },
                { text: "Personal excellence requires discipline and focus daily.", noun: "discipline", hint: "What does excellence require? (It's an abstract noun)" },
                { text: "Revolutionized physics the brilliant Albert Einstein dramatically.", noun: "Albert Einstein", hint: "Who revolutionized physics? (It's a proper noun)" },
                { text: "Great achievements stem from ambition and effort.", noun: "ambition", hint: "What do achievements stem from? (It's an abstract noun)" },
                { text: "In Peru towers the ancient Machu Picchu majestically.", noun: "Machu Picchu", hint: "What towers in Peru? (It's a proper noun)" },
                { text: "Lasting relationships need honesty and communication always.", noun: "honesty", hint: "What do relationships need? (It's an abstract noun)" },
                { text: "Painted the Mona Lisa the genius Leonardo da Vinci.", noun: "Leonardo da Vinci", hint: "Who painted the Mona Lisa? (It's a proper noun)" },
                { text: "Mental wellness requires balance and self-care regularly.", noun: "balance", hint: "What does wellness require? (It's an abstract noun)" },
                { text: "Across Turkey spans the famous Bosphorus Strait historically.", noun: "Bosphorus Strait", hint: "What spans across Turkey? (It's a proper noun)" },
                { text: "Team success depends on cooperation and unity.", noun: "cooperation", hint: "What does team success depend on? (It's an abstract noun)" },
                { text: "Led civil rights movement courageously Dr. Martin Luther King Jr.", noun: "Dr. Martin Luther King Jr.", hint: "Who led the civil rights movement? (It's a proper noun)" },
                { text: "Creative expression flows through imagination and inspiration.", noun: "imagination", hint: "What does expression flow through? (It's an abstract noun)" },
                { text: "In London stands the historic Big Ben tower prominently.", noun: "Big Ben", hint: "What stands in London? (It's a proper noun)" },
                { text: "Professional growth demands adaptability and learning constantly.", noun: "adaptability", hint: "What does growth demand? (It's an abstract noun)" },
                { text: "Discovered radium and polonium Marie Curie courageously.", noun: "Marie Curie", hint: "Who discovered radium? (It's a proper noun)" },
                { text: "Human progress relies on innovation and collaboration.", noun: "collaboration", hint: "What does progress rely on? (It's an abstract noun)" },
                { text: "Through Africa flows the mighty Congo River powerfully.", noun: "Congo River", hint: "What flows through Africa? (It's a proper noun)" },
                { text: "Effective communication needs clarity and empathy always.", noun: "clarity", hint: "What does communication need? (It's an abstract noun)" },
                { text: "Founded modern nursing practice Florence Nightingale compassionately.", noun: "Florence Nightingale", hint: "Who founded modern nursing? (It's a proper noun)" },
                { text: "Spiritual growth comes through meditation and mindfulness.", noun: "meditation", hint: "What brings spiritual growth? (It's an abstract noun)" },
                { text: "In Brazil stretches the enormous Amazon Rainforest densely.", noun: "Amazon Rainforest", hint: "What stretches in Brazil? (It's a proper noun)" },
                { text: "Healthy living requires moderation and consistency daily.", noun: "moderation", hint: "What does healthy living require? (It's an abstract noun)" },
                { text: "Developed theory of evolution Charles Darwin scientifically.", noun: "Charles Darwin", hint: "Who developed evolution theory? (It's a proper noun)" },
                { text: "Emotional intelligence involves awareness and regulation carefully.", noun: "awareness", hint: "What does emotional intelligence involve? (It's an abstract noun)" },
                { text: "In Paris illuminates the sparkling Eiffel Tower nightly.", noun: "Eiffel Tower", hint: "What illuminates in Paris? (It's a proper noun)" }
            ]
        };
        
        this.initializeElements();
        this.bindEvents();
        this.generateNewSentence();
    }
    
    initializeElements() {
        this.difficultySelect = document.getElementById('difficulty');
        this.sentenceDisplay = document.getElementById('sentence-display');
        this.feedbackElement = document.getElementById('feedback');
        this.hintBtn = document.getElementById('hint-btn');
        this.hintText = document.getElementById('hint-text');
        this.skipBtn = document.getElementById('skip-btn');
        this.nextBtn = document.getElementById('new-sentence-btn');
        this.resetBtn = document.getElementById('resetBtn');
        
        // Stats elements
        this.scoreElement = document.getElementById('score');
        this.streakElement = document.getElementById('streak');
        this.correctElement = document.getElementById('correct');
        this.totalElement = document.getElementById('total');
        this.accuracyElement = document.getElementById('accuracy');
    }
    
    bindEvents() {
        this.difficultySelect.addEventListener('change', () => {
            this.difficulty = this.difficultySelect.value;
            this.generateNewSentence();
        });
        
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.skipBtn.addEventListener('click', () => this.skipSentence());
        this.nextBtn.addEventListener('click', () => this.generateNewSentence());
        this.resetBtn.addEventListener('click', () => this.resetGame());
    }
    
    generateNewSentence() {
        this.hintUsed = false;
        this.hintBtn.disabled = false;
        this.hintText.classList.remove('show');
        this.feedbackElement.textContent = '';
        this.feedbackElement.className = 'feedback';
        this.nextBtn.style.display = 'none';
        this.skipBtn.style.display = 'inline-block';
        
        // Get random sentence from current difficulty
        const sentences = this.sentences[this.difficulty];
        this.currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
        
        // Display sentence as clickable words
        this.displaySentence();
    }
    
    displaySentence() {
        this.sentenceDisplay.innerHTML = '';
        const words = this.currentSentence.text.split(' ');
        
        words.forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word';
            wordSpan.textContent = word;
            wordSpan.dataset.index = index;
            
            wordSpan.addEventListener('click', () => this.checkAnswer(word, wordSpan));
            
            this.sentenceDisplay.appendChild(wordSpan);
        });
    }
    
    checkAnswer(selectedWord, wordElement) {
        // Remove punctuation for comparison
        const cleanWord = selectedWord.replace(/[.,!?;:]$/g, '');
        const correctNoun = this.currentSentence.noun;
        
        // Disable all words after selection
        const allWords = this.sentenceDisplay.querySelectorAll('.word');
        allWords.forEach(w => w.classList.add('disabled'));
        
        this.total++;
        
        if (cleanWord === correctNoun) {
            // Correct answer
            wordElement.classList.add('correct');
            this.correct++;
            this.streak++;
            
            // Calculate points (less points if hint was used)
            const points = this.hintUsed ? 5 : 10;
            this.score += points;
            
            this.showFeedback(true, `Correct! "${correctNoun}" is a noun. ${this.hintUsed ? '+5 points' : '+10 points'}`);
            this.checkAchievements();
        } else {
            // Incorrect answer
            wordElement.classList.add('incorrect');
            this.streak = 0;
            
            // Highlight the correct answer
            allWords.forEach(w => {
                const cleanW = w.textContent.replace(/[.,!?;:]$/g, '');
                if (cleanW === correctNoun) {
                    setTimeout(() => w.classList.add('correct'), 500);
                }
            });
            
            this.showFeedback(false, `Incorrect. The noun is "${correctNoun}".`);
        }
        
        this.updateStats();
        this.skipBtn.style.display = 'none';
        this.nextBtn.style.display = 'inline-block';
    }
    
    showHint() {
        this.hintUsed = true;
        this.hintText.textContent = this.currentSentence.hint;
        this.hintText.classList.add('show');
        this.hintBtn.disabled = true;
    }
    
    skipSentence() {
        this.total++;
        this.streak = 0;
        
        // Highlight the correct answer
        const allWords = this.sentenceDisplay.querySelectorAll('.word');
        allWords.forEach(w => {
            w.classList.add('disabled');
            const cleanW = w.textContent.replace(/[.,!?;:]$/g, '');
            if (cleanW === this.currentSentence.noun) {
                w.classList.add('correct');
            }
        });
        
        this.showFeedback(false, `The noun was "${this.currentSentence.noun}".`);
        this.updateStats();
        this.skipBtn.style.display = 'none';
        this.nextBtn.style.display = 'inline-block';
    }
    
    showFeedback(isCorrect, message) {
        this.feedbackElement.textContent = message;
        this.feedbackElement.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    }
    
    updateStats() {
        this.scoreElement.textContent = this.score;
        this.streakElement.textContent = this.streak;
        this.correctElement.textContent = this.correct;
        this.totalElement.textContent = this.total;
        
        const accuracy = this.total > 0 ? Math.round((this.correct / this.total) * 100) : 100;
        this.accuracyElement.textContent = accuracy + '%';
    }
    
    checkAchievements() {
        // First Noun
        if (this.correct === 1 && !this.achievements.firstNoun) {
            this.achievements.firstNoun = true;
            this.unlockAchievement(0, '🌟 First Noun');
        }
        
        // 5 Streak
        if (this.streak >= 5 && !this.achievements.streak5) {
            this.achievements.streak5 = true;
            this.unlockAchievement(1, '🔥 5 Streak');
        }
        
        // Perfect 10
        if (this.correct >= 10 && this.total >= 10 && this.correct === this.total && !this.achievements.perfect10) {
            this.achievements.perfect10 = true;
            this.unlockAchievement(2, '💯 Perfect 10');
        }
        
        // Noun Master (25 correct)
        if (this.correct >= 25 && !this.achievements.nounMaster) {
            this.achievements.nounMaster = true;
            this.unlockAchievement(3, '🎯 Noun Master');
        }
    }
    
    unlockAchievement(index, text) {
        const achievements = document.querySelectorAll('.achievement');
        if (achievements[index]) {
            achievements[index].classList.remove('locked');
            achievements[index].classList.add('unlocked');
            achievements[index].textContent = text;
        }
    }
    
    resetGame() {
        if (confirm('Are you sure you want to reset all progress?')) {
            this.score = 0;
            this.streak = 0;
            this.correct = 0;
            this.total = 0;
            this.achievements = {
                firstNoun: false,
                streak5: false,
                perfect10: false,
                nounMaster: false
            };
            
            document.querySelectorAll('.achievement').forEach(a => {
                a.classList.remove('unlocked');
            });
            
            this.updateStats();
            this.generateNewSentence();
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NounHunterGame();
});
