class ContextCluesGame {
    constructor() {
        this.score = 0;
        this.streak = 0;
        this.correct = 0;
        this.total = 0;
        this.usedHint = false;
        this.difficulty = 'easy';
        this.currentItem = null;
        this.achievements = {
            firstInference: false,
            streakFive: false,
            perfectTen: false,
            clueMaster: false
        };

        this.items = {
            easy: [
                {
                    sentence: 'The <strong>gigantic</strong> elephant towered over the tiny mouse.',
                    options: ['very small', 'very tall', 'very large', 'very quiet'],
                    answer: 'very large',
                    hint: 'Think about how an elephant compares to a tiny mouse.'
                },
                {
                    sentence: 'After running the race, Mia was completely <strong>exhausted</strong> and could barely catch her breath.',
                    options: ['very excited', 'very tired', 'very angry', 'very hungry'],
                    answer: 'very tired',
                    hint: 'Look at what happened after the race.'
                },
                {
                    sentence: 'The pond was so <strong>transparent</strong> that we could see the fish swimming at the bottom.',
                    options: ['very deep', 'very clear', 'very dirty', 'very noisy'],
                    answer: 'very clear',
                    hint: 'If you can see the fish at the bottom, what must the water be like?'
                },
                {
                    sentence: 'Liam was <strong>timid</strong> when meeting new people and usually stood quietly in the corner.',
                    options: ['shy', 'curious', 'brave', 'talkative'],
                    answer: 'shy',
                    hint: 'Notice how he acts when he meets new people.'
                },
                {
                    sentence: 'The <strong>fragile</strong> glass ornament would break easily if it fell off the shelf.',
                    options: ['very strong', 'easy to break', 'very heavy', 'hard to see'],
                    answer: 'easy to break',
                    hint: 'Think about what would happen if it fell.'
                },
                {
                    sentence: 'A cool breeze made the hot day feel more <strong>bearable</strong> for the runners.',
                    options: ['hard to stand', 'easier to handle', 'much hotter', 'more confusing'],
                    answer: 'easier to handle',
                    hint: 'Did the breeze make the day better or worse?' 
                }
            ],
            medium: [
                {
                    sentence: 'The teacher gave a <strong>brief</strong> explanation, so the students still had many questions.',
                    options: ['very long', 'very short', 'very clear', 'very boring'],
                    answer: 'very short',
                    hint: 'Why would the students still have many questions?'
                },
                {
                    sentence: 'Although the directions were <strong>vague</strong>, we tried our best to follow them, even though they were not very clear.',
                    options: ['confusing', 'perfect', 'detailed', 'simple'],
                    answer: 'confusing',
                    hint: 'The sentence tells you they were not very clear.'
                },
                {
                    sentence: 'Marcus felt <strong>relieved</strong> after he finished his big project and turned it in on time.',
                    options: ['still worried', 'less worried', 'more nervous', 'more confused'],
                    answer: 'less worried',
                    hint: 'How do you feel after finishing something stressful?'
                },
                {
                    sentence: 'The storm was so <strong>intense</strong> that trees fell, power went out, and rain pounded loudly on the windows.',
                    options: ['very weak', 'very gentle', 'very strong', 'very short'],
                    answer: 'very strong',
                    hint: 'Look at what happened during the storm.'
                },
                {
                    sentence: 'Because the map was <strong>precise</strong>, we could find every tiny street without getting lost.',
                    options: ['hard to read', 'not very clear', 'very exact', 'very old'],
                    answer: 'very exact',
                    hint: 'Did the map help them or confuse them?' 
                },
                {
                    sentence: 'The crowd grew <strong>restless</strong> as they waited longer and began pacing, sighing, and checking their watches.',
                    options: ['calm', 'patient', 'uneasy', 'sleepy'],
                    answer: 'uneasy',
                    hint: 'Notice how they act while they wait.'
                }
            ],
            hard: [
                {
                    sentence: 'The scientist wanted to <strong>replicate</strong> the experiment to see if she would get the same results again.',
                    options: ['repeat', 'stop', 'ignore', 'change'],
                    answer: 'repeat',
                    hint: 'She wants to see if she would get the same results again.'
                },
                {
                    sentence: 'Although the book began in a rather <strong>monotonous</strong> way, with similar events repeating, it eventually became exciting.',
                    options: ['boring', 'funny', 'frightening', 'short'],
                    answer: 'boring',
                    hint: 'The phrase "similar events repeating" gives you a clue.'
                },
                {
                    sentence: 'Because of his <strong>meticulous</strong> notes, Jacob could study every tiny detail before the test.',
                    options: ['careful', 'messy', 'rushed', 'hurried'],
                    answer: 'careful',
                    hint: 'Notice that he could study every tiny detail.'
                },
                {
                    sentence: 'The speaker tried to <strong>persuade</strong> the audience by giving strong reasons and emotional stories.',
                    options: ['entertain', 'teach', 'convince', 'confuse'],
                    answer: 'convince',
                    hint: 'What is he trying to do to the audience by giving reasons?'
                },
                {
                    sentence: 'The principal took <strong>disciplinary</strong> action after several students repeatedly broke the school rules.',
                    options: ['fun', 'rewarding', 'punishing', 'creative'],
                    answer: 'punishing',
                    hint: 'Think about what happens when rules are broken many times.'
                },
                {
                    sentence: 'Because the evidence was only <strong>circumstantial</strong>, the jury could not be completely sure of what happened.',
                    options: ['very direct', 'not fully certain', 'easy to understand', 'simple to explain'],
                    answer: 'not fully certain',
                    hint: 'Could the jury be completely sure from this kind of evidence?'
                }
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

        document.getElementById('sentence').innerHTML = this.currentItem.sentence;

        const choicesDiv = document.getElementById('choices');
        choicesDiv.innerHTML = '';
        this.currentItem.options.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'choice';
            div.textContent = opt;
            div.addEventListener('click', () => this.checkAnswer(opt, div));
            choicesDiv.appendChild(div);
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
            document.getElementById('feedback').textContent = '✓ Correct! You used the clues well.';
            document.getElementById('feedback').className = 'feedback correct';
            this.checkAchievements();
            this.updateStats();

            // Automatically move to the next item after a short pause
            setTimeout(() => {
                this.generateNewItem();
            }, 800);
        } else {
            this.streak = 0;
            element.classList.add('incorrect');
            document.getElementById('feedback').textContent = `✗ Not quite. The best meaning was "${correct}".`;
            document.getElementById('feedback').className = 'feedback incorrect';

            document.querySelectorAll('.choice').forEach(c => {
                if (c.textContent === correct) {
                    c.classList.add('correct');
                }
            });
            this.updateStats();
            document.getElementById('nextBtn').style.display = 'inline-block';
            document.getElementById('skipBtn').style.display = 'none';
        }
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
        document.getElementById('feedback').textContent = `⏭️ Skipped. The best meaning was "${this.currentItem.answer}".`;
        document.getElementById('feedback').className = 'feedback';
        this.updateStats();
        this.generateNewItem();
    }

    nextItem() {
        this.generateNewItem();
    }

    resetGame() {
        if (confirm('Reset Context Clues progress?')) {
            this.score = 0;
            this.streak = 0;
            this.correct = 0;
            this.total = 0;
            this.achievements = {
                firstInference: false,
                streakFive: false,
                perfectTen: false,
                clueMaster: false
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
        if (!this.achievements.firstInference && this.correct >= 1) {
            this.achievements.firstInference = true;
            this.unlockAchievement('firstInference');
        }
        if (!this.achievements.streakFive && this.correct >= 5) {
            this.achievements.streakFive = true;
            this.unlockAchievement('streakFive');
        }
        if (!this.achievements.perfectTen && this.correct >= 10) {
            this.achievements.perfectTen = true;
            this.unlockAchievement('perfectTen');
        }
        if (!this.achievements.clueMaster && this.correct >= 25) {
            this.achievements.clueMaster = true;
            this.unlockAchievement('clueMaster');
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
    new ContextCluesGame();
});
