class WordMatchGame {
    constructor() {
        this.score = 0;
        this.streak = 0;
        this.correct = 0;
        this.total = 0;
        this.usedHint = false;
        this.difficulty = 'easy';
        this.currentItem = null;
        this.achievements = {
            firstMatch: false,
            streakFive: false,
            perfectTen: false,
            wordMaster: false
        };

        this.items = {
            easy: [
                { word: 'happy', type: 'synonym', choices: ['sad', 'joyful', 'late', 'tiny'], answer: 'joyful', hint: 'Think of another word that means glad.' },
                { word: 'big', type: 'synonym', choices: ['huge', 'small', 'thin', 'empty'], answer: 'huge', hint: 'Another word for large.' },
                { word: 'cold', type: 'antonym', choices: ['freezing', 'chilly', 'hot', 'icy'], answer: 'hot', hint: 'Choose the opposite of cold.' },
                { word: 'slow', type: 'antonym', choices: ['quick', 'tired', 'late', 'sad'], answer: 'quick', hint: 'The opposite of slow.' },
                { word: 'begin', type: 'synonym', choices: ['finish', 'start', 'end', 'stop'], answer: 'start', hint: 'What word also means to start?' },
                { word: 'angry', type: 'synonym', choices: ['upset', 'calm', 'sleepy', 'weak'], answer: 'upset', hint: 'Another word for mad.' },
                { word: 'end', type: 'antonym', choices: ['finish', 'close', 'stop', 'start'], answer: 'start', hint: 'Choose the opposite of end.' },
                { word: 'noisy', type: 'antonym', choices: ['loud', 'quiet', 'busy', 'wild'], answer: 'quiet', hint: 'The opposite of noisy.' }
            ],
            medium: [
                { word: 'brave', type: 'synonym', choices: ['fearful', 'courageous', 'shy', 'quiet'], answer: 'courageous', hint: 'A word that also means not scared.' },
                { word: 'ancient', type: 'synonym', choices: ['modern', 'new', 'old', 'recent'], answer: 'old', hint: 'Another word for very old.' },
                { word: 'polite', type: 'antonym', choices: ['kind', 'rude', 'gentle', 'friendly'], answer: 'rude', hint: 'What is the opposite of polite?' },
                { word: 'increase', type: 'antonym', choices: ['grow', 'add', 'raise', 'decrease'], answer: 'decrease', hint: 'The opposite of increase.' },
                { word: 'joyful', type: 'antonym', choices: ['glad', 'cheerful', 'miserable', 'hopeful'], answer: 'miserable', hint: 'Which means the opposite of joyful?' },
                { word: 'cautious', type: 'antonym', choices: ['careful', 'bold', 'safe', 'gentle'], answer: 'bold', hint: 'What is the opposite of cautious or careful?' },
                { word: 'assist', type: 'synonym', choices: ['help', 'ignore', 'refuse', 'delay'], answer: 'help', hint: 'Another word for help.' },
                { word: 'rare', type: 'antonym', choices: ['unusual', 'scarce', 'common', 'special'], answer: 'common', hint: 'Choose the opposite of rare.' }
            ],
            hard: [
                { word: 'victory', type: 'antonym', choices: ['success', 'triumph', 'defeat', 'win'], answer: 'defeat', hint: 'What is the opposite of victory?' },
                { word: 'expand', type: 'antonym', choices: ['enlarge', 'stretch', 'shrink', 'widen'], answer: 'shrink', hint: 'Choose the opposite of expand.' },
                { word: 'scarce', type: 'synonym', choices: ['plentiful', 'rare', 'common', 'extra'], answer: 'rare', hint: 'Another word for hard to find.' },
                { word: 'predict', type: 'synonym', choices: ['guess', 'forget', 'explain', 'ignore'], answer: 'guess', hint: 'What word also means to tell before it happens?' },
                { word: 'generous', type: 'antonym', choices: ['selfish', 'kind', 'helpful', 'caring'], answer: 'selfish', hint: 'Which means the opposite of generous?' },
                { word: 'reluctant', type: 'synonym', choices: ['eager', 'unwilling', 'excited', 'proud'], answer: 'unwilling', hint: 'Another word for not wanting to do something.' },
                { word: 'obvious', type: 'antonym', choices: ['clear', 'plain', 'hidden', 'simple'], answer: 'hidden', hint: 'Choose the word that means the opposite of obvious.' },
                { word: 'brief', type: 'antonym', choices: ['short', 'quick', 'long', 'tiny'], answer: 'long', hint: 'What is the opposite of brief or short?' }
            ]
        };

        this.setupEventListeners();
        this.generateNewItem();
        this.updateStats();
    }

    setupEventListeners() {
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.generateNewItem();
        });

        document.getElementById('skipBtn').addEventListener('click', () => this.skipItem());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextItem());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
    }

    generateNewItem() {
        const pool = this.items[this.difficulty];
        this.currentItem = pool[Math.floor(Math.random() * pool.length)];
        this.usedHint = false;

        document.getElementById('matchType').textContent = this.currentItem.type === 'synonym' ? 'Match the synonym' : 'Match the antonym';
        document.getElementById('targetWord').textContent = this.currentItem.word;

        const choicesDiv = document.getElementById('choices');
        choicesDiv.innerHTML = '';
        this.currentItem.choices.forEach(choice => {
            const btn = document.createElement('div');
            btn.className = 'choice';
            btn.textContent = choice;
            btn.addEventListener('click', () => this.checkAnswer(choice, btn));
            choicesDiv.appendChild(btn);
        });

        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';
        document.getElementById('hintText').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('skipBtn').style.display = 'inline-block';
    }

    checkAnswer(choice, element) {
        const correct = this.currentItem.answer;
        this.total++;

        document.querySelectorAll('.choice').forEach(c => c.style.pointerEvents = 'none');

        if (choice === correct) {
            this.correct++;
            this.streak++;
            this.score += this.usedHint ? 5 : 10;
            element.classList.add('correct');
            document.getElementById('feedback').textContent = '✓ Correct match!';
            document.getElementById('feedback').className = 'feedback correct';
            this.checkAchievements();
        } else {
            this.streak = 0;
            element.classList.add('incorrect');
            document.getElementById('feedback').textContent = `✗ Not quite. The best match was "${correct}".`;
            document.getElementById('feedback').className = 'feedback incorrect';

            document.querySelectorAll('.choice').forEach(c => {
                if (c.textContent === correct) {
                    c.classList.add('correct');
                }
            });
        }

        this.updateStats();
        document.getElementById('nextBtn').style.display = 'inline-block';
        document.getElementById('skipBtn').style.display = 'none';
    }

    showHint() {
        this.usedHint = true;
        const hintText = document.getElementById('hintText');
        hintText.textContent = this.currentItem.hint;
        hintText.style.display = 'block';
    }

    skipItem() {
        this.streak = 0;
        this.total++;
        document.getElementById('feedback').textContent = `⏭️ Skipped. The best match was "${this.currentItem.answer}".`;
        document.getElementById('feedback').className = 'feedback';
        this.updateStats();
        this.generateNewItem();
    }

    nextItem() {
        this.generateNewItem();
    }

    resetGame() {
        if (confirm('Reset Word Match progress?')) {
            this.score = 0;
            this.streak = 0;
            this.correct = 0;
            this.total = 0;
            this.achievements = {
                firstMatch: false,
                streakFive: false,
                perfectTen: false,
                wordMaster: false
            };

            document.querySelectorAll('.achievement').forEach(a => a.classList.remove('unlocked'));
            this.updateStats();
            this.generateNewItem();
        }
    }

    updateStats() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('streak').textContent = this.streak;
        document.getElementById('correct').textContent = this.correct;
        document.getElementById('total').textContent = this.total;
        const accuracy = this.total > 0 ? Math.round((this.correct / this.total) * 100) : 0;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
    }

    checkAchievements() {
        if (!this.achievements.firstMatch && this.correct >= 1) {
            this.achievements.firstMatch = true;
            this.unlockAchievement('firstMatch');
        }
        if (!this.achievements.streakFive && this.correct >= 5) {
            this.achievements.streakFive = true;
            this.unlockAchievement('streakFive');
        }
        if (!this.achievements.perfectTen && this.correct >= 10) {
            this.achievements.perfectTen = true;
            this.unlockAchievement('perfectTen');
        }
        if (!this.achievements.wordMaster && this.correct >= 25) {
            this.achievements.wordMaster = true;
            this.unlockAchievement('wordMaster');
        }
    }

    unlockAchievement(key) {
        const el = document.querySelector(`.achievement[data-achievement="${key}"]`);
        if (el) {
            el.classList.add('unlocked');
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new WordMatchGame();
});
