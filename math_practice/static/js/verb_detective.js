class VerbDetectiveGame {
    constructor() {
        this.score = 0;
        this.streak = 0;
        this.correct = 0;
        this.total = 0;
        this.currentSentence = null;
        this.usedHint = false;
        this.difficulty = 'easy';
        this.achievements = {
            firstVerb: false,
            streakFive: false,
            perfectTen: false,
            verbMaster: false
        };

        this.sentences = {
            easy: [
                { text: "In the park runs the happy dog.", verb: "runs", hint: "What action happens in the park?" },
                { text: "Over the fence jumps she quickly.", verb: "jumps", hint: "What action does she do?" },
                { text: "High in the sky fly birds gracefully.", verb: "fly", hint: "What do the birds do?" },
                { text: "On the soft bed sleeps the cat.", verb: "sleeps", hint: "What does the cat do on the bed?" },
                { text: "Every morning eat I breakfast happily.", verb: "eat", hint: "What do I do every morning?" },
                { text: "Together play they soccer often.", verb: "play", hint: "What do they do together?" },
                { text: "Tonight cooks Mom dinner carefully.", verb: "cooks", hint: "What does Mom do tonight?" },
                { text: "Loudly cries the baby sometimes.", verb: "cries", hint: "What does the baby do loudly?" },
                { text: "In the pool swim we daily.", verb: "swim", hint: "What do we do in the pool?" },
                { text: "A thick book reads he slowly.", verb: "reads", hint: "What does he do with the book?" },
                { text: "Brightly shines the sun today.", verb: "shines", hint: "What does the sun do?" },
                { text: "Underwater swim fish constantly.", verb: "swim", hint: "What do fish do underwater?" },
                { text: "Beautifully sings she every day.", verb: "sings", hint: "What does she do beautifully?" },
                { text: "Constantly rings the phone loudly.", verb: "rings", hint: "What does the phone do?" },
                { text: "To school walk I daily.", verb: "walk", hint: "How do I get to school?" },
                { text: "At parties dance they joyfully.", verb: "dance", hint: "What do they do at parties?" },
                { text: "From dark clouds falls rain heavily.", verb: "falls", hint: "What does rain do?" },
                { text: "Beautiful pictures draws he skillfully.", verb: "draws", hint: "What does he do with pictures?" },
                { text: "Loudly ticks the clock constantly.", verb: "ticks", hint: "What sound does the clock make?" },
                { text: "At jokes laugh we heartily.", verb: "laugh", hint: "What do we do at jokes?" },
                { text: "Strongly blows the wind tonight.", verb: "blows", hint: "What does the wind do?" },
                { text: "In her diary writes she secretly.", verb: "writes", hint: "What does she do in her diary?" },
                { text: "Very tall grow trees slowly.", verb: "grow", hint: "What do trees do?" },
                { text: "Happily smiles the baby always.", verb: "smiles", hint: "What does the baby do?" },
                { text: "About tomorrow think I carefully.", verb: "think", hint: "What do I do about tomorrow?" },
                { text: "At night twinkle stars brightly.", verb: "twinkle", hint: "What do stars do at night?" },
                { text: "Hard kicks he the ball.", verb: "kicks", hint: "What does he do to the ball?" },
                { text: "Slowly talks the teacher always.", verb: "talks", hint: "What does the teacher do?" },
                { text: "Downstream flows water naturally.", verb: "flows", hint: "What does water do?" },
                { text: "To music listens she often.", verb: "listens", hint: "What does she do with music?" },
                { text: "Fresh flowers smell I happily.", verb: "smell", hint: "What do I do with flowers?" },
                { text: "Wide opens the door suddenly.", verb: "opens", hint: "What happens to the door?" },
                { text: "The frisbee throws he far.", verb: "throws", hint: "What does he do with the frisbee?" },
                { text: "Quickly learn children everything.", verb: "learn", hint: "What do children do quickly?" },
                { text: "Suddenly stops the car there.", verb: "stops", hint: "What does the car do?" },
                { text: "The wall paints she carefully.", verb: "paints", hint: "What does she do to the wall?" },
                { text: "The soup taste I cautiously.", verb: "taste", hint: "What do I do with the soup?" },
                { text: "Gently lands the butterfly here.", verb: "lands", hint: "What does the butterfly do?" },
                { text: "Behind trees hides he quietly.", verb: "hides", hint: "What does he do?" },
                { text: "Sandcastles build we happily.", verb: "build", hint: "What do we do with sand?" },
                { text: "Early arrives the train today.", verb: "arrives", hint: "What does the train do?" },
                { text: "The paper cuts she neatly.", verb: "cuts", hint: "What does she do to paper?" },
                { text: "The ladder climb I carefully.", verb: "climb", hint: "What do I do with the ladder?" },
                { text: "In spring bloom flowers beautifully.", verb: "bloom", hint: "What do flowers do in spring?" },
                { text: "Quickly hops the rabbit away.", verb: "hops", hint: "How does the rabbit move?" },
                { text: "Her keys finds she finally.", verb: "finds", hint: "What does she do with her keys?" },
                { text: "My friend help I always.", verb: "help", hint: "What do I do for my friend?" },
                { text: "Slowly burns the candle down.", verb: "burns", hint: "What does the candle do?" },
                { text: "The ball catches he perfectly.", verb: "catches", hint: "What does he do with the ball?" },
                { text: "In sunlight melts snow quickly.", verb: "melts", hint: "What happens to snow?" },
                { text: "Around the yard run children loudly.", verb: "run", hint: "What do children do?" },
                { text: "Under the bridge hide ducks safely.", verb: "hide", hint: "What do ducks do?" },
                { text: "Above the trees soar eagles majestically.", verb: "soar", hint: "What do eagles do?" },
                { text: "Through the tunnel drive cars quickly.", verb: "drive", hint: "What do cars do?" },
                { text: "Inside the house stay pets comfortably.", verb: "stay", hint: "What do pets do?" },
                { text: "Across the street live neighbors kindly.", verb: "live", hint: "What do neighbors do?" },
                { text: "During winter sleep bears peacefully.", verb: "sleep", hint: "What do bears do in winter?" },
                { text: "Behind the mountain sets the sun.", verb: "sets", hint: "What does the sun do?" },
                { text: "Near the lake camp families happily.", verb: "camp", hint: "What do families do?" },
                { text: "Within the forest roam deer quietly.", verb: "roam", hint: "What do deer do?" },
                { text: "Beside the river grow plants naturally.", verb: "grow", hint: "What do plants do?" },
                { text: "Throughout the day work people busily.", verb: "work", hint: "What do people do all day?" },
                { text: "Against the window presses the cat.", verb: "presses", hint: "What does the cat do?" },
                { text: "Below the surface swim dolphins gracefully.", verb: "swim", hint: "What do dolphins do?" },
                { text: "Among the flowers buzz bees busily.", verb: "buzz", hint: "What do bees do?" },
                { text: "Beyond the horizon sail ships slowly.", verb: "sail", hint: "What do ships do?" },
                { text: "Beneath the table sit children playfully.", verb: "sit", hint: "What do children do?" },
                { text: "Onto the stage walk actors confidently.", verb: "walk", hint: "What do actors do?" },
                { text: "Into the water jump swimmers eagerly.", verb: "jump", hint: "What do swimmers do?" },
                { text: "From the tree fall leaves gently.", verb: "fall", hint: "What do leaves do?" },
                { text: "Around the fire gather people warmly.", verb: "gather", hint: "What do people do?" },
                { text: "Outside the window sing birds cheerfully.", verb: "sing", hint: "What do birds do?" },
                { text: "Inside the cave echo sounds eerily.", verb: "echo", hint: "What do sounds do?" },
                { text: "Toward the light fly moths instinctively.", verb: "fly", hint: "What do moths do?" },
                { text: "Along the path walk hikers steadily.", verb: "walk", hint: "What do hikers do?" },
                { text: "Within the crowd push people urgently.", verb: "push", hint: "What do people do?" },
                { text: "Beneath the stars wish children hopefully.", verb: "wish", hint: "What do children do?" },
                { text: "After school study students diligently.", verb: "study", hint: "What do students do after school?" },
                { text: "Before dinner wash we thoroughly.", verb: "wash", hint: "What do we do before dinner?" }
            ],
            medium: [
                { text: "Fiercely competed the athletes yesterday.", verb: "competed", hint: "What did the athletes do fiercely?" },
                { text: "New species discovered scientists regularly.", verb: "discovered", hint: "What action did scientists perform?" },
                { text: "Brilliantly performed the orchestra tonight.", verb: "performed", hint: "What did the orchestra do?" },
                { text: "Their time contributed volunteers generously.", verb: "contributed", hint: "What did volunteers do with their time?" },
                { text: "The mystery investigated the detective carefully.", verb: "investigated", hint: "What did the detective do?" },
                { text: "The event organized students successfully.", verb: "organized", hint: "What did students do with the event?" },
                { text: "Her novel published the author recently.", verb: "published", hint: "What did the author do?" },
                { text: "The bridge designed engineers skillfully.", verb: "designed", hint: "What did engineers do?" },
                { text: "Important matters discussed the committee thoroughly.", verb: "discussed", hint: "What did the committee do?" },
                { text: "The ancient ruins explored tourists excitedly.", verb: "explored", hint: "What did tourists do?" },
                { text: "With precision operated the surgeon carefully.", verb: "operated", hint: "What medical action occurred?" },
                { text: "Crops harvested farmers efficiently yesterday.", verb: "harvested", hint: "What did farmers do?" },
                { text: "Concepts explained the professor clearly today.", verb: "explained", hint: "What did the professor do?" },
                { text: "Modern buildings designed architects creatively.", verb: "designed", hint: "What did architects do?" },
                { text: "Witnesses interviewed the journalist thoroughly.", verb: "interviewed", hint: "What did the journalist do?" },
                { text: "Diligently rehearsed musicians before concerts.", verb: "rehearsed", hint: "What did musicians do?" },
                { text: "Data analyzed researchers meticulously.", verb: "analyzed", hint: "What did researchers do?" },
                { text: "Engines repaired the mechanic expertly.", verb: "repaired", hint: "What did the mechanic do?" },
                { text: "Delicious meals prepared chefs skillfully.", verb: "prepared", hint: "What did chefs do?" },
                { text: "Activities coordinated the director efficiently.", verb: "coordinated", hint: "What did the director do?" },
                { text: "Their paintings exhibited artists proudly.", verb: "exhibited", hint: "What did artists do?" },
                { text: "Equipment installed technicians properly.", verb: "installed", hint: "What did technicians do?" },
                { text: "Clients defended the lawyer passionately.", verb: "defended", hint: "What did the lawyer do?" },
                { text: "Software applications developed programmers successfully.", verb: "developed", hint: "What did programmers do?" },
                { text: "New policies announced the principal formally.", verb: "announced", hint: "What did the principal do?" },
                { text: "Events documented historians accurately.", verb: "documented", hint: "What did historians do?" },
                { text: "Through storms navigated the captain bravely.", verb: "navigated", hint: "What did the captain do?" },
                { text: "Books catalogued librarians systematically.", verb: "catalogued", hint: "What did librarians do?" },
                { text: "Citizens addressed the mayor respectfully.", verb: "addressed", hint: "What did the mayor do?" },
                { text: "Students guided counselors patiently.", verb: "guided", hint: "What did counselors do?" },
                { text: "Languages interpreted the translator fluently.", verb: "interpreted", hint: "What did the translator do?" },
                { text: "Beautiful moments captured photographers perfectly.", verb: "captured", hint: "What did photographers do?" },
                { text: "Athletes trained the coach intensively.", verb: "trained", hint: "What did the coach do?" },
                { text: "Flowers cultivated gardeners lovingly.", verb: "cultivated", hint: "What did gardeners do?" },
                { text: "Expenses calculated the accountant precisely.", verb: "calculated", hint: "What did the accountant do?" },
                { text: "Spaces transformed decorators beautifully.", verb: "transformed", hint: "What did decorators do?" },
                { text: "Through turbulence maneuvered the pilot carefully.", verb: "maneuvered", hint: "What did the pilot do?" },
                { text: "Patients counseled therapists compassionately.", verb: "counseled", hint: "What did therapists do?" },
                { text: "Manuscripts revised the editor thoroughly.", verb: "revised", hint: "What did the editor do?" },
                { text: "Products examined inspectors carefully.", verb: "examined", hint: "What did inspectors do?" },
                { text: "Techniques demonstrated the presenter effectively.", verb: "demonstrated", hint: "What did the presenter do?" },
                { text: "Buildings constructed contractors safely.", verb: "constructed", hint: "What did contractors do?" },
                { text: "Ecosystems studied the biologist extensively.", verb: "studied", hint: "What did the biologist do?" },
                { text: "Companies advised consultants strategically.", verb: "advised", hint: "What did consultants do?" },
                { text: "Medications dispensed the pharmacist accurately.", verb: "dispensed", hint: "What did the pharmacist do?" },
                { text: "Artifacts preserved curators carefully.", verb: "preserved", hint: "What did curators do?" },
                { text: "Weather patterns predicted the meteorologist correctly.", verb: "predicted", hint: "What did the meteorologist do?" },
                { text: "Lessons taught instructors enthusiastically.", verb: "taught", hint: "What did instructors do?" },
                { text: "Musicians directed the conductor masterfully.", verb: "directed", hint: "What did the conductor do?" },
                { text: "To emergencies responded paramedics quickly.", verb: "responded", hint: "What did paramedics do?" },
                { text: "Complex problems solved engineers brilliantly.", verb: "solved", hint: "What did engineers do?" },
                { text: "Historical sites maintained workers diligently.", verb: "maintained", hint: "What did workers do?" },
                { text: "Musical instruments tuned technicians precisely.", verb: "tuned", hint: "What did technicians do?" },
                { text: "Safety procedures reviewed officers regularly.", verb: "reviewed", hint: "What did officers do?" },
                { text: "Research findings presented scientists formally.", verb: "presented", hint: "What did scientists do?" },
                { text: "Community projects initiated volunteers actively.", verb: "initiated", hint: "What did volunteers do?" },
                { text: "Business strategies formulated consultants wisely.", verb: "formulated", hint: "What did consultants do?" },
                { text: "Cultural traditions celebrated families joyfully.", verb: "celebrated", hint: "What did families do?" },
                { text: "Educational programs developed teachers creatively.", verb: "developed", hint: "What did teachers do?" },
                { text: "Environmental issues addressed activists passionately.", verb: "addressed", hint: "What did activists do?" },
                { text: "Quality standards monitored inspectors strictly.", verb: "monitored", hint: "What did inspectors do?" },
                { text: "Patient records updated nurses accurately.", verb: "updated", hint: "What did nurses do?" },
                { text: "Marketing campaigns designed professionals strategically.", verb: "designed", hint: "What did professionals do?" },
                { text: "Athletic skills refined coaches patiently.", verb: "refined", hint: "What did coaches do?" },
                { text: "Legal documents reviewed attorneys thoroughly.", verb: "reviewed", hint: "What did attorneys do?" },
                { text: "Scientific experiments conducted researchers carefully.", verb: "conducted", hint: "What did researchers do?" },
                { text: "Artistic techniques demonstrated instructors clearly.", verb: "demonstrated", hint: "What did instructors do?" },
                { text: "Security measures implemented officials strictly.", verb: "implemented", hint: "What did officials do?" },
                { text: "Customer feedback analyzed managers systematically.", verb: "analyzed", hint: "What did managers do?" },
                { text: "Financial reports prepared accountants meticulously.", verb: "prepared", hint: "What did accountants do?" },
                { text: "Technical support provided specialists efficiently.", verb: "provided", hint: "What did specialists do?" },
                { text: "Building codes enforced inspectors rigorously.", verb: "enforced", hint: "What did inspectors do?" },
                { text: "Medical treatments administered doctors professionally.", verb: "administered", hint: "What did doctors do?" },
                { text: "Transportation systems managed coordinators effectively.", verb: "managed", hint: "What did coordinators do?" }
            ],
            hard: [
                { text: "Extensively deliberated the committee before deciding.", verb: "deliberated", hint: "What careful thinking action occurred?" },
                { text: "Existence contemplated philosophers profoundly.", verb: "contemplated", hint: "What deep thinking did philosophers do?" },
                { text: "Investments diversified the corporation strategically.", verb: "diversified", hint: "What financial action was taken?" },
                { text: "Treaties negotiated diplomats carefully.", verb: "negotiated", hint: "What did diplomats do with treaties?" },
                { text: "About phenomena hypothesized scientists theoretically.", verb: "hypothesized", hint: "What scientific thinking occurred?" },
                { text: "Research subsidized the foundation generously.", verb: "subsidized", hint: "What financial support was provided?" },
                { text: "Market trends predicted economists accurately.", verb: "predicted", hint: "What did economists forecast?" },
                { text: "Amendments ratified the legislature officially.", verb: "ratified", hint: "What formal approval action occurred?" },
                { text: "For change advocated activists passionately.", verb: "advocated", hint: "What action did activists take?" },
                { text: "Policies implemented the institution systematically.", verb: "implemented", hint: "What was done with policies?" },
                { text: "Theories debated scholars intellectually.", verb: "debated", hint: "What academic discussion occurred?" },
                { text: "Allegations investigated the commission thoroughly.", verb: "investigated", hint: "What inquiry action was taken?" },
                { text: "Industries revolutionized innovators dramatically.", verb: "revolutionized", hint: "What transformative action occurred?" },
                { text: "Disputes adjudicated the tribunal impartially.", verb: "adjudicated", hint: "What legal judgment occurred?" },
                { text: "Ruins excavated archaeologists methodically.", verb: "excavated", hint: "What archaeological work was done?" },
                { text: "Expenditures authorized the board unanimously.", verb: "authorized", hint: "What approval was given?" },
                { text: "Sustainability advocated environmentalists persistently.", verb: "advocated", hint: "What ongoing action was taken?" },
                { text: "Meetings convened the council regularly.", verb: "convened", hint: "What organizing action occurred?" },
                { text: "Plans formulated strategists meticulously.", verb: "formulated", hint: "What planning action was done?" },
                { text: "Legislation deliberated the senate thoroughly.", verb: "deliberated", hint: "What careful consideration occurred?" },
                { text: "Operations coordinated administrators efficiently.", verb: "coordinated", hint: "What management action was taken?" },
                { text: "Internationally collaborated the consortium successfully.", verb: "collaborated", hint: "What cooperative action occurred?" },
                { text: "Performances analyzed critics objectively.", verb: "analyzed", hint: "What evaluative action was done?" },
                { text: "Industries regulated the ministry strictly.", verb: "regulated", hint: "What controlling action occurred?" },
                { text: "Behaviors assessed psychologists scientifically.", verb: "assessed", hint: "What evaluation was conducted?" },
                { text: "Activities monitored the agency constantly.", verb: "monitored", hint: "What surveillance action occurred?" },
                { text: "Conventions challenged intellectuals boldly.", verb: "challenged", hint: "What confrontational action was taken?" },
                { text: "Operations orchestrated the syndicate covertly.", verb: "orchestrated", hint: "What organizing action occurred secretly?" },
                { text: "Systems transformed reformers radically.", verb: "transformed", hint: "What change action was implemented?" },
                { text: "Decisions ratified the assembly formally.", verb: "ratified", hint: "What approval action occurred?" },
                { text: "Data extrapolated statisticians carefully.", verb: "extrapolated", hint: "What analytical projection was made?" },
                { text: "Efforts coordinated the federation globally.", verb: "coordinated", hint: "What worldwide organizing occurred?" },
                { text: "Hypotheses postulated theorists systematically.", verb: "postulated", hint: "What theoretical proposition was made?" },
                { text: "Compromises negotiated the coalition diplomatically.", verb: "negotiated", hint: "What agreement-seeking action occurred?" },
                { text: "Records scrutinized auditors meticulously.", verb: "scrutinized", hint: "What detailed examination occurred?" },
                { text: "Cooperation facilitated the alliance internationally.", verb: "facilitated", hint: "What enabling action was taken?" },
                { text: "Innovations conceptualized visionaries creatively.", verb: "conceptualized", hint: "What imaginative thinking occurred?" },
                { text: "Proposals evaluated the panel objectively.", verb: "evaluated", hint: "What assessment action was done?" },
                { text: "Standards enforced regulators rigorously.", verb: "enforced", hint: "What strict application occurred?" },
                { text: "Information disseminated the network rapidly.", verb: "disseminated", hint: "What distribution action occurred?" },
                { text: "Knowledge cultivated pioneers persistently.", verb: "cultivated", hint: "What development action was sustained?" },
                { text: "Resources mobilized the collective effectively.", verb: "mobilized", hint: "What organizing of assets occurred?" },
                { text: "Conditions diagnosed specialists accurately.", verb: "diagnosed", hint: "What medical identification occurred?" },
                { text: "Experts convened the symposium internationally.", verb: "convened", hint: "What gathering action occurred?" },
                { text: "Causes championed advocates relentlessly.", verb: "championed", hint: "What vigorous support action occurred?" },
                { text: "Talent cultivated the institute systematically.", verb: "cultivated", hint: "What development process occurred?" },
                { text: "Phenomena documented observers objectively.", verb: "documented", hint: "What recording action was taken?" },
                { text: "Operations consolidated the organization strategically.", verb: "consolidated", hint: "What combining action occurred?" },
                { text: "Information synthesized scholars comprehensively.", verb: "synthesized", hint: "What integrative analysis occurred?" },
                { text: "Compliance mandated the authority strictly.", verb: "mandated", hint: "What requirement was imposed?" },
                { text: "Intricate patterns discerned analysts skillfully.", verb: "discerned", hint: "What perception action occurred?" },
                { text: "Complex theories elucidated professors thoroughly.", verb: "elucidated", hint: "What clarification action was done?" },
                { text: "Strategic alliances forged leaders diplomatically.", verb: "forged", hint: "What relationship-building occurred?" },
                { text: "Critical evidence substantiated researchers conclusively.", verb: "substantiated", hint: "What proof action was provided?" },
                { text: "Fundamental principles articulated scholars precisely.", verb: "articulated", hint: "What expression action occurred?" },
                { text: "Institutional changes precipitated reformers deliberately.", verb: "precipitated", hint: "What causing action occurred?" },
                { text: "Historical contexts elucidated historians comprehensively.", verb: "elucidated", hint: "What explanatory action was done?" },
                { text: "Philosophical concepts expounded thinkers elaborately.", verb: "expounded", hint: "What detailed explanation occurred?" },
                { text: "Scientific breakthroughs catalyzed researchers remarkably.", verb: "catalyzed", hint: "What acceleration action occurred?" },
                { text: "Economic policies rationalized experts logically.", verb: "rationalized", hint: "What justification action was provided?" },
                { text: "Cultural narratives perpetuated societies traditionally.", verb: "perpetuated", hint: "What continuation action occurred?" },
                { text: "Technological advances proliferated industries rapidly.", verb: "proliferated", hint: "What spreading action occurred?" },
                { text: "Democratic values promulgated leaders actively.", verb: "promulgated", hint: "What promotion action was taken?" },
                { text: "Ethical standards promulgated committees officially.", verb: "promulgated", hint: "What formal declaration occurred?" },
                { text: "Innovative solutions synthesized teams collaboratively.", verb: "synthesized", hint: "What creative combining occurred?" },
                { text: "Strategic objectives articulated directors clearly.", verb: "articulated", hint: "What clear statement was made?" },
                { text: "Complex relationships delineated researchers systematically.", verb: "delineated", hint: "What detailed description occurred?" },
                { text: "Theoretical frameworks constructed academics rigorously.", verb: "constructed", hint: "What intellectual building occurred?" },
                { text: "Historical precedents invoked lawyers strategically.", verb: "invoked", hint: "What citation action was taken?" },
                { text: "Philosophical arguments refuted critics logically.", verb: "refuted", hint: "What disproof action occurred?" },
                { text: "Environmental consequences mitigated planners proactively.", verb: "mitigated", hint: "What reduction action was implemented?" },
                { text: "Organizational efficiency optimized managers systematically.", verb: "optimized", hint: "What improvement action occurred?" },
                { text: "Diplomatic relations fostered ambassadors skillfully.", verb: "fostered", hint: "What nurturing action was taken?" },
                { text: "Scientific hypotheses validated experiments conclusively.", verb: "validated", hint: "What confirmation action occurred?" },
                { text: "Cultural heritage preserved institutions deliberately.", verb: "preserved", hint: "What protection action was maintained?" }
            ]
        };

        this.initializeGame();
    }

    initializeGame() {
        this.loadGameState();
        this.setupEventListeners();
        this.generateNewSentence();
        this.updateStats();
        this.updateAchievements();
    }

    setupEventListeners() {
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.generateNewSentence();
        });

        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('skipBtn').addEventListener('click', () => this.skipSentence());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSentence());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
    }

    generateNewSentence() {
        const sentences = this.sentences[this.difficulty];
        this.currentSentence = sentences[Math.floor(Math.random() * sentences.length)];
        this.usedHint = false;
        this.displaySentence();
        document.getElementById('hintText').style.display = 'none';
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';
    }

    displaySentence() {
        const sentenceDiv = document.getElementById('sentence');
        sentenceDiv.innerHTML = '';
        
        const words = this.currentSentence.text.split(' ');
        words.forEach(word => {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = word;
            span.addEventListener('click', () => this.checkAnswer(word, span));
            sentenceDiv.appendChild(span);
        });
    }

    checkAnswer(selectedWord, wordElement) {
        // Remove punctuation for comparison
        const cleanWord = selectedWord.replace(/[.,!?;:]/, '').toLowerCase();
        const correctVerb = this.currentSentence.verb.toLowerCase();

        this.total++;
        
        // Disable all words
        document.querySelectorAll('.word').forEach(w => {
            w.style.pointerEvents = 'none';
        });

        if (cleanWord === correctVerb) {
            this.correct++;
            this.streak++;
            this.score += this.usedHint ? 5 : 10;
            
            wordElement.classList.add('correct');
            document.getElementById('feedback').textContent = '✓ Correct! That\'s the verb!';
            document.getElementById('feedback').className = 'feedback correct';
            
            this.checkAchievements();
        } else {
            this.streak = 0;
            
            wordElement.classList.add('incorrect');
            document.getElementById('feedback').textContent = `✗ Not quite. The verb is "${this.currentSentence.verb}"`;
            document.getElementById('feedback').className = 'feedback incorrect';
            
            // Highlight the correct answer
            document.querySelectorAll('.word').forEach(w => {
                const cleanW = w.textContent.replace(/[.,!?;:]/, '').toLowerCase();
                if (cleanW === correctVerb) {
                    setTimeout(() => w.classList.add('correct'), 500);
                }
            });
        }

        this.updateStats();
        this.saveGameState();
        
        // Show next button
        document.getElementById('nextBtn').style.display = 'inline-block';
        document.getElementById('skipBtn').style.display = 'none';
    }

    showHint() {
        this.usedHint = true;
        const hintText = document.getElementById('hintText');
        hintText.textContent = `💡 ${this.currentSentence.hint}`;
        hintText.style.display = 'block';
    }

    skipSentence() {
        this.total++;
        this.streak = 0;
        this.updateStats();
        this.saveGameState();
        this.generateNewSentence();
    }

    nextSentence() {
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('skipBtn').style.display = 'inline-block';
        this.generateNewSentence();
    }

    checkAchievements() {
        if (this.correct >= 1 && !this.achievements.firstVerb) {
            this.achievements.firstVerb = true;
            this.unlockAchievement('firstVerb', 'First Find!');
        }
        
        if (this.streak >= 5 && !this.achievements.streakFive) {
            this.achievements.streakFive = true;
            this.unlockAchievement('streakFive', '5 in a Row!');
        }
        
        if (this.streak >= 10 && !this.achievements.perfectTen) {
            this.achievements.perfectTen = true;
            this.unlockAchievement('perfectTen', 'Perfect 10!');
        }
        
        if (this.correct >= 25 && !this.achievements.verbMaster) {
            this.achievements.verbMaster = true;
            this.unlockAchievement('verbMaster', 'Verb Master!');
        }
    }

    unlockAchievement(achievement, message) {
        const achievementEl = document.querySelector(`[data-achievement="${achievement}"]`);
        achievementEl.classList.add('unlocked');
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.textContent = `🎉 Achievement Unlocked: ${message}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #f39c12, #e67e22);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.5s ease;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    updateStats() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
        document.getElementById('correct').textContent = this.correct;
        document.getElementById('total').textContent = this.total;
        
        const accuracy = this.total > 0 ? Math.round((this.correct / this.total) * 100) : 0;
        document.getElementById('accuracy').textContent = accuracy + '%';
    }

    updateAchievements() {
        Object.keys(this.achievements).forEach(key => {
            if (this.achievements[key]) {
                document.querySelector(`[data-achievement="${key}"]`).classList.add('unlocked');
            }
        });
    }

    resetGame() {
        if (confirm('Are you sure you want to reset all progress?')) {
            this.score = 0;
            this.streak = 0;
            this.correct = 0;
            this.total = 0;
            this.achievements = {
                firstVerb: false,
                streakFive: false,
                perfectTen: false,
                verbMaster: false
            };
            
            document.querySelectorAll('.achievement').forEach(a => {
                a.classList.remove('unlocked');
            });
            
            this.updateStats();
            this.saveGameState();
            this.generateNewSentence();
        }
    }

    saveGameState() {
        const state = {
            score: this.score,
            streak: this.streak,
            correct: this.correct,
            total: this.total,
            achievements: this.achievements
        };
        localStorage.setItem('verbDetectiveGame', JSON.stringify(state));
    }

    loadGameState() {
        const saved = localStorage.getItem('verbDetectiveGame');
        if (saved) {
            const state = JSON.parse(saved);
            this.score = state.score || 0;
            this.streak = state.streak || 0;
            this.correct = state.correct || 0;
            this.total = state.total || 0;
            this.achievements = state.achievements || this.achievements;
        }
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new VerbDetectiveGame();
});
