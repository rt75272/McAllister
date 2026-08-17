/**
 * Exponent World Real-World Word Problems Game.
 *
 * Real-world applied word problems featuring exponential growth, computer science
 * powers of two, geometric dimensions, science formulas, and trivia challenges.
 */

class ExponentWorldGame {
    /**
     * Initialize world problem categories, event handlers, and stats.
     */
    constructor() {
        this.currentProblem = {};
        this.score = 0;
        this.streak = 0;
        this.totalSolved = 0;
        this.totalAttempted = 0;
        this.selectedCategory = 'all';
        this.categoryCounts = {
            growth: 0,
            technology: 0,
            construction: 0,
            science: 0,
            fun: 0
        };
        this.achievements = [];
        
        this.initializeElements();
        this.bindEvents();
        this.loadProblems();
        this.generateNewProblem();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.categorySelect = document.getElementById('category');
        this.problemCategoryBadge = document.getElementById('problem-category-badge');
        this.problemDescription = document.getElementById('problem-description');
        this.questionText = document.getElementById('question-text');
        this.answerInput = document.getElementById('answer-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.explainBtn = document.getElementById('explain-btn');
        this.feedback = document.getElementById('feedback');
        this.scoreElement = document.getElementById('score');
        this.streakElement = document.getElementById('streak');
        this.accuracyElement = document.getElementById('accuracy');
        this.totalSolvedElement = document.getElementById('total-solved');
        this.achievementList = document.getElementById('achievement-list');
        this.explanationModal = document.getElementById('explanation-modal');
        this.hintModal = document.getElementById('hint-modal');
        this.explanationContent = document.getElementById('explanation-content');
        this.hintContent = document.getElementById('hint-content');
        
        // Category count elements.
        this.growthCount = document.getElementById('growth-count');
        this.technologyCount = document.getElementById('technology-count');
        this.constructionCount = document.getElementById('construction-count');
        this.scienceCount = document.getElementById('science-count');
        this.funCount = document.getElementById('fun-count');
    }
    
    bindEvents() {
        this.categorySelect.addEventListener('change', (e) => {
            this.selectedCategory = e.target.value;
            this.generateNewProblem();
        });
        
        this.submitBtn.addEventListener('click', () => this.submitAnswer());
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.skipBtn.addEventListener('click', () => this.skipProblem());
        this.explainBtn.addEventListener('click', () => this.showExplanation());
        
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
        
        // Modal close functionality
        if (document.querySelector('.close')) {
            document.querySelector('.close').addEventListener('click', () => {
                if(this.explanationModal) this.explanationModal.style.display = 'none';
            });
        }
        
        if (document.querySelector('.close-hint')) {
            document.querySelector('.close-hint').addEventListener('click', () => {
                if(this.hintModal) this.hintModal.style.display = 'none';
            });
        }
        
        window.addEventListener('click', (e) => {
            if (this.explanationModal && e.target === this.explanationModal) {
                this.explanationModal.style.display = 'none';
            }
            if (this.hintModal && e.target === this.hintModal) {
                this.hintModal.style.display = 'none';
            }
        });
    }
    
    loadProblems() {
        this.problemBank = {
            growth: [
                {
                    description: "You have 3 germs. Every hour, each germ turns into 3 germs. After 4 hours, how many germs do you have?",
                    question: "How many germs after 4 hours?",
                    calculation: "3^4",
                    answer: 81,
                    hint: "Start with 3 germs. Each hour, times it by 3. Do this 4 times: 3 × 3 × 3 × 3 = 3⁴",
                    explanation: "Start: 3 germs<br>After 1 hour: 3 × 3 = 9 germs<br>After 2 hours: 3 × 3 × 3 = 27 germs<br>After 3 hours: 3 × 3 × 3 × 3 = 81 germs<br>After 4 hours: We have 81 germs!<br><br>We multiply 3 by itself 4 times: 3⁴ = 81"
                },
                {
                    description: "You have 2 rabbits. Every month, your rabbits double. After 6 months, how many rabbits do you have?",
                    question: "How many rabbits after 6 months?",
                    calculation: "2^7",
                    answer: 128,
                    hint: "Start with 2 rabbits. Double them 6 times. That's 2 × 2 × 2 × 2 × 2 × 2 × 2 = 2⁷",
                    explanation: "Start: 2 rabbits<br>Month 1: 4 rabbits<br>Month 2: 8 rabbits<br>Month 3: 16 rabbits<br>Month 4: 32 rabbits<br>Month 5: 64 rabbits<br>Month 6: 128 rabbits<br><br>We doubled 2 seven times: 2⁷ = 128"
                },
                {
                    description: "You save $4. Every year, your money grows to 5 times bigger. After 3 years, how much money do you have?",
                    question: "How much money after 3 years?",
                    calculation: "4 × 5^3",
                    answer: 500,
                    hint: "Start with $4. Times it by 5 three times: 4 × 5 × 5 × 5",
                    explanation: "Start: $4<br>Year 1: $4 × 5 = $20<br>Year 2: $20 × 5 = $100<br>Year 3: $100 × 5 = $500<br><br>We multiply: 4 × 5³ = 4 × 125 = $500"
                }
            ],
            technology: [
                {
                    description: "A video game has 8 levels. Each level has 8 worlds. Each world has 8 stages. How many stages are there in the whole game?",
                    question: "How many stages in total?",
                    calculation: "8^3",
                    answer: 512,
                    hint: "8 levels times 8 worlds times 8 stages: 8 × 8 × 8 = 8³",
                    explanation: "8 levels in the game<br>Each level has 8 worlds = 8 × 8 = 64 worlds<br>Each world has 8 stages = 64 × 8 = 512 stages<br><br>We multiply: 8³ = 8 × 8 × 8 = 512"
                },
                {
                    description: "You are making a secret code. Each spot in your code can be either yes or no. You have 6 spots. How many different codes can you make?",
                    question: "How many different codes?",
                    calculation: "2^6",
                    answer: 64,
                    hint: "Each spot has 2 choices. With 6 spots: 2 × 2 × 2 × 2 × 2 × 2 = 2⁶",
                    explanation: "Each spot can be yes or no (2 choices)<br>Spot 1: 2 choices<br>Spot 2: 2 choices<br>Do this for all 6 spots<br><br>Total codes: 2⁶ = 64"
                },
                {
                    description: "A robot can do 4 jobs at a time. Each round, it does 4 times more jobs than before. How many jobs can it do in round 5?",
                    question: "How many jobs in round 5?",
                    calculation: "4^5",
                    answer: 1024,
                    hint: "Round 1 has 4 jobs. Each round times by 4. Round 5 is 4⁵",
                    explanation: "Round 1: 4 jobs<br>Round 2: 4 × 4 = 16 jobs<br>Round 3: 16 × 4 = 64 jobs<br>Round 4: 64 × 4 = 256 jobs<br>Round 5: 256 × 4 = 1024 jobs<br><br>We multiply: 4⁵ = 1024"
                }
            ],
            construction: [
                {
                    description: "You have a square garden. Each side is 7 meters long. What is the area of your garden?",
                    question: "What is the area?",
                    calculation: "7^2",
                    answer: 49,
                    hint: "A square's area = side × side. So 7 × 7 = 7²",
                    explanation: "Your garden is a square<br>Each side = 7 meters<br>Area = 7 × 7 = 49<br><br>We write this as 7² = 49 square meters"
                },
                {
                    description: "You have a cube-shaped box. Each side is 6 feet long. How much space is inside the box?",
                    question: "How much space inside?",
                    calculation: "6^3",
                    answer: 216,
                    hint: "A cube's space = side × side × side. So 6 × 6 × 6 = 6³",
                    explanation: "Your box is a cube<br>Each side = 6 feet<br>Space inside = 6 × 6 × 6 = 216<br><br>We write this as 6³ = 216 cubic feet"
                },
                {
                    description: "A building has 9 floors. Each floor has 9 rooms. Each room has 9 desks. How many desks are in the building?",
                    question: "How many desks total?",
                    calculation: "9^3",
                    answer: 729,
                    hint: "9 floors × 9 rooms × 9 desks = 9 × 9 × 9 = 9³",
                    explanation: "9 floors in the building<br>Each floor: 9 rooms = 9 × 9 = 81 rooms<br>Each room: 9 desks = 81 × 9 = 729 desks<br><br>We multiply: 9³ = 9 × 9 × 9 = 729"
                }
            ],
            science: [
                {
                    description: "A super fast rocket goes 10 times 10 times 10 meters every second (that's 10³ meters). It flies for 100 seconds (that's 10² seconds). How far does it go? Write your answer as just the number.",
                    question: "How far does the rocket go?",
                    calculation: "10^3 × 10^2 = 10^5",
                    answer: 100000,
                    hint: "When you times powers of 10, you add the exponents: 10³ × 10² = 10⁵",
                    explanation: "Speed = 10³ meters per second<br>Time = 10² seconds<br>Distance = Speed × Time<br>Distance = 10³ × 10²<br>Add the exponents: 10³ × 10² = 10⁵ = 100,000 meters"
                },
                {
                    description: "You use a special tool to make things look 100 times bigger (that's 10²). Then you add a lens that makes it 10 times bigger. How many times bigger is everything now?",
                    question: "How many times bigger total?",
                    calculation: "10^2 × 10^1 = 10^3",
                    answer: 1000,
                    hint: "First tool makes it 10² bigger. Lens makes it 10¹ bigger. Times them: 10² × 10¹ = 10³",
                    explanation: "First tool: 10² = 100 times bigger<br>Lens: 10¹ = 10 times bigger<br>Total = 10² × 10¹ = 10³ = 1000 times bigger"
                },
                {
                    description: "You have a really big number: 10,000 (that's 10⁴). You want to split it into 100 equal parts (that's 10²). How big is each part?",
                    question: "How big is each part?",
                    calculation: "10^4 ÷ 10^2 = 10^2",
                    answer: 100,
                    hint: "When you divide powers of 10, subtract the exponents: 10⁴ ÷ 10² = 10²",
                    explanation: "Big number = 10⁴ = 10,000<br>Split into = 10² = 100 parts<br>Each part = 10⁴ ÷ 10² = 10² = 100"
                }
            ],
            fun: [
                {
                    description: "You fold a paper in half 5 times. When you open it back up, how many sections do you see?",
                    question: "How many sections after 5 folds?",
                    calculation: "2^5",
                    answer: 32,
                    hint: "Each fold makes twice as many sections. Do this 5 times: 2⁵",
                    explanation: "Start: 1 section<br>Fold 1: 2 sections<br>Fold 2: 4 sections<br>Fold 3: 8 sections<br>Fold 4: 16 sections<br>Fold 5: 32 sections<br><br>We multiply: 2⁵ = 32"
                },
                {
                    description: "64 kids start a game. Every round, half the kids go home. After 3 rounds, how many kids are still playing?",
                    question: "How many kids are left?",
                    calculation: "2^6 ÷ 2^3 = 2^3",
                    answer: 8,
                    hint: "Start with 64 kids (that's 2⁶). Take away half 3 times (that's 2³). Answer is 2³",
                    explanation: "Start: 64 kids (2⁶)<br>Round 1: 64 ÷ 2 = 32 kids<br>Round 2: 32 ÷ 2 = 16 kids<br>Round 3: 16 ÷ 2 = 8 kids<br><br>We divide: 2⁶ ÷ 2³ = 2³ = 8"
                },
                {
                    description: "You send a funny picture to 3 friends. They each send it to 3 more friends. This happens 4 times. How many people get the picture in round 4?",
                    question: "How many people in round 4?",
                    calculation: "3^4",
                    answer: 81,
                    hint: "Round 1 has 3 people. Each round times by 3. Round 4 is 3⁴",
                    explanation: "Round 1: 3 people<br>Round 2: 3 × 3 = 9 people<br>Round 3: 9 × 3 = 27 people<br>Round 4: 27 × 3 = 81 people<br><br>We multiply: 3⁴ = 81"
                }
            ]
        };
    }
    
    generateNewProblem() {
        let availableProblems = [];
        
        if (this.selectedCategory === 'all') {
            // Combine all categories
            for (let category in this.problemBank) {
                availableProblems = availableProblems.concat(
                    this.problemBank[category].map(p => ({...p, category: category}))
                );
            }
        } else {
            availableProblems = this.problemBank[this.selectedCategory].map(p => ({
                ...p, 
                category: this.selectedCategory
            }));
        }
        
        if (availableProblems.length === 0) {
            console.error('No problems available');
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * availableProblems.length);
        this.currentProblem = availableProblems[randomIndex];
        
        this.displayProblem();
        this.answerInput.value = '';
        this.answerInput.focus();
        this.clearFeedback();
    }
    
    displayProblem() {
        // Update category badge
        const categoryIcons = {
            growth: '🌱 Growth',
            technology: '💾 Technology',
            construction: '🏗️ Construction',
            science: '🔬 Science',
            fun: '🎲 Fun Facts'
        };
        
        this.problemCategoryBadge.textContent = categoryIcons[this.currentProblem.category];
        this.problemDescription.textContent = this.currentProblem.description;
        this.questionText.textContent = this.currentProblem.question;
    }
    
    submitAnswer() {
        const userAnswer = parseFloat(this.answerInput.value);
        
        if (isNaN(userAnswer)) {
            this.showFeedback('Please enter a valid number!', 'neutral');
            return;
        }
        
        this.totalAttempted++;
        
        if (userAnswer === this.currentProblem.answer) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }
        
        this.updateDisplay();
        
        // Generate new problem after a delay
        setTimeout(() => {
            this.generateNewProblem();
        }, 3000);
    }
    
    handleCorrectAnswer() {
        this.score += this.getPointsForCategory();
        this.streak++;
        this.totalSolved++;
        this.categoryCounts[this.currentProblem.category]++;
        
        const messages = [
            'Excellent! 🌟',
            'Perfect! 🎯', 
            'Outstanding! ⚡',
            'Brilliant! 💫',
            'Amazing! 🚀'
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.showFeedback(`${message} ${this.currentProblem.calculation} = ${this.currentProblem.answer}`, 'correct');
        
        this.checkForAchievements();
    }
    
    handleIncorrectAnswer() {
        this.streak = 0;
        this.showFeedback(`Incorrect. The answer was ${this.currentProblem.answer}. ${this.currentProblem.calculation} = ${this.currentProblem.answer}`, 'incorrect');
    }
    
    skipProblem() {
        this.showFeedback(`Skipped. The answer was ${this.currentProblem.answer}. ${this.currentProblem.calculation} = ${this.currentProblem.answer}`, 'neutral');
        this.streak = 0;
        
        setTimeout(() => {
            this.generateNewProblem();
        }, 3000);
    }
    
    showHint() {
        this.hintContent.innerHTML = this.currentProblem.hint;
        this.hintModal.style.display = 'block';
    }
    
    showExplanation() {
        this.explanationContent.innerHTML = `
            <div class="step">
                <h4>Problem Setup:</h4>
                <p>${this.currentProblem.description}</p>
            </div>
            <div class="step">
                <h4>Solution Steps:</h4>
                <p>${this.currentProblem.explanation}</p>
            </div>
            <div class="step">
                <h4>Final Answer:</h4>
                <p><strong>${this.currentProblem.calculation} = ${this.currentProblem.answer}</strong></p>
            </div>
        `;
        this.explanationModal.style.display = 'block';
    }
    
    getPointsForCategory() {
        const points = {
            growth: 20,
            technology: 25,
            construction: 15,
            science: 30,
            fun: 20
        };
        return points[this.currentProblem.category] || 20;
    }
    
    checkForAchievements() {
        // First problem solved
        if (this.totalSolved === 1) {
            this.addAchievement('🎯 First Problem Solved!');
        }
        
        // Streak achievements
        if (this.streak === 3 && !this.achievements.includes('🔥 3-Problem Streak!')) {
            this.addAchievement('🔥 3-Problem Streak!');
        }
        if (this.streak === 5 && !this.achievements.includes('⚡ 5-Problem Streak!')) {
            this.addAchievement('⚡ 5-Problem Streak!');
        }
        
        // Category mastery
        for (let category in this.categoryCounts) {
            if (this.categoryCounts[category] === 3) {
                const categoryNames = {
                    growth: 'Growth',
                    technology: 'Technology', 
                    construction: 'Construction',
                    science: 'Science',
                    fun: 'Fun Facts'
                };
                this.addAchievement(`🏆 ${categoryNames[category]} Expert!`);
            }
        }
        
        // Score milestones
        if (this.score >= 100 && !this.achievements.includes('💯 100 Points!')) {
            this.addAchievement('💯 100 Points!');
        }
        if (this.score >= 300 && !this.achievements.includes('🌟 300 Points!')) {
            this.addAchievement('🌟 300 Points!');
        }
        
        // Perfect accuracy
        if (this.totalSolved >= 5 && this.getAccuracy() === 100 && !this.achievements.includes('🎯 Perfect Accuracy!')) {
            this.addAchievement('🎯 Perfect Accuracy!');
        }
    }
    
    addAchievement(text) {
        if (this.achievements.includes(text)) return;
        
        this.achievements.push(text);
        const achievementElement = document.createElement('div');
        achievementElement.className = 'achievement';
        achievementElement.textContent = text;
        this.achievementList.appendChild(achievementElement);
        
        // Remove achievement after 6 seconds
        setTimeout(() => {
            if (achievementElement.parentNode) {
                achievementElement.parentNode.removeChild(achievementElement);
            }
        }, 6000);
    }
    
    getAccuracy() {
        if (this.totalAttempted === 0) return 100;
        return Math.round((this.totalSolved / this.totalAttempted) * 100);
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.streakElement.textContent = this.streak;
        this.accuracyElement.textContent = `${this.getAccuracy()}%`;
        this.totalSolvedElement.textContent = this.totalSolved;
        
        // Update category counts
        this.growthCount.textContent = this.categoryCounts.growth;
        this.technologyCount.textContent = this.categoryCounts.technology;
        this.constructionCount.textContent = this.categoryCounts.construction;
        this.scienceCount.textContent = this.categoryCounts.science;
        this.funCount.textContent = this.categoryCounts.fun;
        
        this.feedback.textContent = '';
        this.feedback.className = 'feedback';
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ExponentWorldGame();
});