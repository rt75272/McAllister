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
                { text: "On sunny afternoons, the playful dog runs around the big park and barks happily at passing squirrels near the tall trees.", verb: ["runs", "barks"], hint: "Click a verb that shows what the dog does." },
                { text: "Every morning before school, she quickly jumps over the small fence in the backyard and races her brother to the bus stop.", verb: ["jumps", "races"], hint: "Choose a verb that tells what she does before school." },
                { text: "High in the bright blue sky, a flock of birds fly in smooth circles and call loudly to one another.", verb: ["fly", "call"], hint: "Pick a verb that shows what the birds do." },
                { text: "After playing with yarn all evening, the tired gray cat curls up on the soft bed and sleeps soundly near the open window.", verb: ["curls", "sleeps"], hint: "Click a verb that tells what the cat does." },
                { text: "Every weekday morning, I eat a healthy breakfast at the kitchen table and pack my backpack before leaving for school.", verb: ["eat", "pack"], hint: "Choose a verb that tells what I do in the morning." },
                { text: "On weekends at the park, they play energetic soccer games and laugh loudly with their friends until the sun begins to set.", verb: ["play", "laugh"], hint: "Click a verb that shows what they do at the park." },
                { text: "Tonight in our warm kitchen, Mom carefully cooks a big pot of soup and stirs it slowly while we set the table.", verb: ["cooks", "stirs"], hint: "Pick a verb that tells what Mom does with the soup." },
                { text: "Sometimes in the middle of the night, the tiny baby cries loudly and reaches out until someone gently picks him up.", verb: ["cries", "reaches"], hint: "Choose a verb that shows what the baby does." },
                { text: "During the hot summer, we swim together in the cool pool and splash water as we race from one side to the other.", verb: ["swim", "splash"], hint: "Click a verb that tells what we do in the pool." },
                { text: "In the quiet library, he slowly reads a thick mystery book and takes careful notes in his small notebook.", verb: ["reads", "takes"], hint: "Choose a verb that shows what he does in the library." },
                { text: "On bright clear days, the golden sun shines warmly through the classroom windows and brightens every student's desk.", verb: ["shines", "brightens"], hint: "Pick a verb that tells what the sun does." },
                { text: "Deep beneath the surface of the lake, colorful fish swim lazily between smooth rocks and glide around waving plants.", verb: ["swim", "glide"], hint: "Click a verb that shows what the fish do." },
                { text: "Every afternoon after school, she sings cheerful songs in her room and practices the hardest parts for the big talent show.", verb: ["sings", "practices"], hint: "Choose a verb that tells what she does after school." },
                { text: "All evening long, the old phone rings loudly on the desk and startles everyone each time it makes a sharp sound.", verb: ["rings", "startles"], hint: "Click a verb that shows what the phone does." },
                { text: "Each day before class, I walk carefully to school along the sidewalk and greet neighbors as I watch the cars pass by.", verb: ["walk", "greet"], hint: "Pick a verb that shows what I do before class." },
                { text: "At birthday parties, they dance joyfully to their favorite songs and spin around the room while laughing.", verb: ["dance", "spin"], hint: "Choose a verb that tells what they do at birthday parties." },
                { text: "When dark clouds fill the sky, heavy rain falls quickly onto the streets and soaks cars, trees, and people.", verb: ["falls", "soaks"], hint: "Click a verb that shows what the rain does." },
                { text: "On the big easel in the art room, he carefully draws beautiful pictures of mountains and colors the rivers and forests.", verb: ["draws", "colors"], hint: "Choose a verb that tells what he does with the pictures." },
                { text: "In the quiet hallway, the old clock ticks steadily and marks each passing second with a gentle sound.", verb: ["ticks", "marks"], hint: "Pick a verb that shows what the clock does." },
                { text: "Whenever we hear a silly joke, we laugh loudly together and smile so much that our sides begin to hurt.", verb: ["laugh", "smile"], hint: "Click a verb that tells what we do when we hear a joke." }
            ],
            medium: [
                { text: "During yesterday's championship, the determined athletes competed fiercely against rival teams and pushed themselves to run faster and jump higher than ever before.", verb: ["competed", "pushed"], hint: "Click a verb that shows what the athletes did in the championship." },
                { text: "On their long journey through the rainforest, careful scientists discovered new species of insects and plants and recorded detailed notes in their journals.", verb: ["discovered", "recorded"], hint: "Choose a verb that tells what the scientists did on their journey." },
                { text: "At the crowded concert hall last night, the talented orchestra performed a difficult piece beautifully and amazed the audience with their rich sound.", verb: ["performed", "amazed"], hint: "Click a verb that shows what the orchestra did at the concert." },
                { text: "Throughout the weekend festival, generous volunteers contributed their time and energy and helped set up booths and guide visitors around the park.", verb: ["contributed", "helped"], hint: "Choose a verb that tells what the volunteers did at the festival." },
                { text: "Late into the evening, the patient detective investigated the confusing mystery and examined clues to solve the strange case.", verb: ["investigated", "examined"], hint: "Click a verb that shows what the detective did with the mystery." },
                { text: "For the school fair, organized students planned activities and decorated the gym while they carefully coordinated the event schedule.", verb: ["planned", "decorated"], hint: "Choose a verb that tells what the students did for the school fair." },
                { text: "After years of hard work, the proud author published her first novel and shared the exciting story with readers around the world.", verb: ["published", "shared"], hint: "Click a verb that shows what the author did with her story." },
                { text: "Working together at the construction site, skilled engineers designed a sturdy bridge and checked that it would safely carry cars and pedestrians across the river.", verb: ["designed", "checked"], hint: "Choose a verb that tells what the engineers did with the bridge." },
                { text: "At the town meeting, the committee discussed important matters at length and listened carefully to different opinions before making a decision.", verb: ["discussed", "listened"], hint: "Click a verb that shows what the committee did at the town meeting." },
                { text: "On their vacation, curious tourists explored the ancient ruins slowly and read every sign while taking photos of each crumbling wall.", verb: ["explored", "read"], hint: "Choose a verb that tells what the tourists did in the ruins." },
                { text: "With calm hands and great focus, the surgeon operated carefully and checked every step to keep the patient as safe as possible.", verb: ["operated", "checked"], hint: "Click a verb that shows what the surgeon did during the operation." },
                { text: "Early yesterday morning, hardworking farmers harvested ripe crops from the fields and loaded heavy baskets onto their trucks.", verb: ["harvested", "loaded"], hint: "Choose a verb that tells what the farmers did with the crops." },
                { text: "During class, the professor explained complex concepts clearly and used real-life examples and pictures to help students understand.", verb: ["explained", "used"], hint: "Click a verb that shows what the professor did during class." },
                { text: "In a modern city, creative architects designed unique buildings and added curved walls, glass bridges, and rooftop gardens.", verb: ["designed", "added"], hint: "Choose a verb that tells what the architects did with the buildings." },
                { text: "Before writing her article, the journalist interviewed several witnesses carefully and asked follow-up questions to understand the full story.", verb: ["interviewed", "asked"], hint: "Click a verb that shows what the journalist did before writing." },
                { text: "Before the big performance, the nervous musicians rehearsed their parts repeatedly and fixed small mistakes until everything sounded perfect.", verb: ["rehearsed", "fixed"], hint: "Choose a verb that tells what the musicians did before the performance." },
                { text: "In the science lab, careful researchers analyzed data from their experiments and looked for patterns and surprising results.", verb: ["analyzed", "looked"], hint: "Click a verb that shows what the researchers did with the data." },
                { text: "At the busy repair shop, the experienced mechanic repaired several broken engines and tested each car after replacing old parts.", verb: ["repaired", "tested"], hint: "Choose a verb that tells what the mechanic did at the shop." },
                { text: "For the holiday banquet, talented chefs prepared delicious meals in the kitchen and baked desserts after seasoning sauces.", verb: ["prepared", "baked"], hint: "Click a verb that shows what the chefs did for the banquet." },
                { text: "All week long, the director coordinated activities for the camp and assigned counselors to groups while planning each day's schedule.", verb: ["coordinated", "assigned"], hint: "Choose a verb that tells what the director did for the camp." }
            ],
            hard: [
                { text: "Before voting on the new law, the committee deliberated extensively and weighed the possible benefits and consequences for many different groups of people.", verb: ["deliberated", "weighed"], hint: "Click a verb that shows what the committee did before voting." },
                { text: "Late at night in the quiet library, philosophers contemplated existence profoundly and asked deep questions about the meaning and purpose of life.", verb: ["contemplated", "asked"], hint: "Choose a verb that tells what the philosophers did in the library." },
                { text: "To protect the company's future, the board diversified investments strategically and spread funds across several industries and regions.", verb: ["diversified", "spread"], hint: "Click a verb that shows what the board did with investments." },
                { text: "For several months, skilled diplomats negotiated complex treaties carefully and revised each detail until all countries agreed to sign.", verb: ["negotiated", "revised"], hint: "Choose a verb that tells what the diplomats did with the treaties." },
                { text: "In their research labs, scientists hypothesized about unusual phenomena theoretically and designed experiments to test ideas that challenged old beliefs.", verb: ["hypothesized", "designed"], hint: "Click a verb that shows what the scientists did in their labs." },
                { text: "Wanting to support important projects, the generous foundation subsidized research generously and provided grants to teams around the world.", verb: ["subsidized", "provided"], hint: "Choose a verb that tells what the foundation did for research." },
                { text: "Using powerful computers, economists predicted market trends accurately and warned businesses about changes that could affect sales.", verb: ["predicted", "warned"], hint: "Click a verb that shows what the economists did with market trends." },
                { text: "After months of debate, the legislature ratified amendments officially and updated the old document with new rights and protections.", verb: ["ratified", "updated"], hint: "Choose a verb that tells what the legislature did with the amendments." },
                { text: "During large public marches, committed activists advocated for change passionately and organized peaceful demonstrations in many cities.", verb: ["advocated", "organized"], hint: "Click a verb that shows what the activists did for change." },
                { text: "To improve fairness, the institution implemented new policies systematically and trained staff while reviewing procedures across all departments.", verb: ["implemented", "trained"], hint: "Choose a verb that tells what the institution did with new policies." }
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
        this.foundVerbs = [];
        this.displaySentence();
        document.getElementById('hintText').style.display = 'none';
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('skipBtn').style.display = 'inline-block';
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
        const cleanWord = selectedWord.replace(/[.,!?;:]/g, '').toLowerCase();

        // Support one or multiple correct verbs per sentence
        let correctVerbs = this.currentSentence.verb;
        if (!Array.isArray(correctVerbs)) {
            correctVerbs = [correctVerbs];
        }
        correctVerbs = correctVerbs.map(v => v.toLowerCase());

        // Disallow clicking the same word twice
        if (wordElement.classList.contains('correct') || wordElement.classList.contains('incorrect')) {
            return;
        }

        if (correctVerbs.includes(cleanWord)) {
            wordElement.classList.add('correct');
            this.foundVerbs.push(cleanWord);

            // Check if all verbs have been found
            const uniqueFound = [...new Set(this.foundVerbs)];
            const allFound = correctVerbs.every(v => uniqueFound.includes(v));

            if (allFound) {
                this.total++;
                this.correct++;
                this.streak++;
                this.score += this.usedHint ? 5 : 10;

                document.getElementById('feedback').textContent = "✓ Great job! You found all the verbs!";
                document.getElementById('feedback').className = 'feedback correct';

                // Disable remaining words after success
                document.querySelectorAll('.word').forEach(w => {
                    w.style.pointerEvents = 'none';
                });

                this.checkAchievements();
                this.updateStats();
                this.saveGameState();

                document.getElementById('nextBtn').style.display = 'inline-block';
                document.getElementById('skipBtn').style.display = 'none';
            } else {
                // Partial success: found a verb but not all yet
                document.getElementById('feedback').textContent = "Nice! Keep going and find the other verb(s).";
                document.getElementById('feedback').className = 'feedback correct';
            }
        } else {
            this.total++;
            this.streak = 0;

            wordElement.classList.add('incorrect');
            const verbText = this.currentSentence.verb;
            const verbDisplay = Array.isArray(verbText) ? verbText.join('", "') : verbText;
            document.getElementById('feedback').textContent = `✗ Not quite. The verb(s) are "${verbDisplay}"`;
            document.getElementById('feedback').className = 'feedback incorrect';

            // Highlight all correct verbs
            document.querySelectorAll('.word').forEach(w => {
                const cleanW = w.textContent.replace(/[.,!?;:]/g, '').toLowerCase();
                if (correctVerbs.includes(cleanW)) {
                    setTimeout(() => w.classList.add('correct'), 500);
                }
                w.style.pointerEvents = 'none';
            });

            this.updateStats();
            this.saveGameState();

            document.getElementById('nextBtn').style.display = 'inline-block';
            document.getElementById('skipBtn').style.display = 'none';
        }
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
