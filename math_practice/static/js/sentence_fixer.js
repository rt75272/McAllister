class SentenceFixerGame {
    constructor() {
        this.score = 0;
        this.streak = 0;
        this.correct = 0;
        this.total = 0;
        this.usedHint = false;
        this.difficulty = 'easy';
        this.currentItem = null;
        this.achievements = {
            firstFix: false,
            streakFive: false,
            perfectTen: false,
            sentenceStar: false
        };

        this.items = {
            easy: [
                {
                    broken: 'i went to the park today',
                    correct: 'I went to the park today.',
                    options: [
                        'i went to the park today.',
                        'I went to the park today',
                        'I went to the park today.',
                        'i Went to the park today.'
                    ],
                    hint: 'Start with a capital letter and end with a period.'
                },
                {
                    broken: 'we ate pizza for dinner',
                    correct: 'We ate pizza for dinner.',
                    options: [
                        'we ate pizza for dinner.',
                        'We ate pizza for dinner',
                        'We ate pizza for dinner.',
                        'We Ate pizza for dinner.'
                    ],
                    hint: 'The first word should be capitalized.'
                },
                {
                    broken: 'did you bring your homework',
                    correct: 'Did you bring your homework?',
                    options: [
                        'did you bring your homework?',
                        'Did you bring your homework.',
                        'Did you bring your homework?',
                        'Did you bring your Homework?'
                    ],
                    hint: 'This is a question, so end with a question mark.'
                },
                {
                    broken: 'my dog likes to play fetch',
                    correct: 'My dog likes to play fetch.',
                    options: [
                        'My dog likes to play fetch.',
                        'my dog likes to play fetch.',
                        'My Dog likes to play fetch.',
                        'My dog likes to play fetch'
                    ],
                    hint: 'Only the first word should be capitalized.'
                },
                {
                    broken: 'it is raining outside',
                    correct: 'It is raining outside.',
                    options: [
                        'It is raining outside.',
                        'it is raining outside',
                        'It is raining outside?',
                        'It is Raining outside.'
                    ],
                    hint: 'This is a statement, not a question.'
                },
                {
                    broken: 'on tuesday we will visit the science museum',
                    correct: 'On Tuesday we will visit the science museum.',
                    options: [
                        'On Tuesday we will visit the science museum.',
                        'On tuesday we will visit the science museum.',
                        'On Tuesday we will visit the Science museum.',
                        'on Tuesday we will visit the science museum.'
                    ],
                    hint: 'Capitalize the day of the week.'
                },
                {
                    broken: 'my sister and i baked cookies',
                    correct: 'My sister and I baked cookies.',
                    options: [
                        'My sister and I baked cookies.',
                        'My Sister and I baked cookies.',
                        'My sister and i baked cookies.',
                        'my sister and I baked cookies.'
                    ],
                    hint: 'Remember to capitalize the word "I" even in the middle of a sentence.'
                },
                {
                    broken: 'can we go to recess now',
                    correct: 'Can we go to recess now?',
                    options: [
                        'Can we go to recess now?',
                        'Can we go to recess now.',
                        'can we go to recess now?',
                        'Can we go to Recess now?'
                    ],
                    hint: 'This is a question, so it needs a question mark.'
                }
            ],
            medium: [
                {
                    broken: 'on saturday we went to the zoo with grandma',
                    correct: 'On Saturday we went to the zoo with Grandma.',
                    options: [
                        'On saturday we went to the zoo with grandma.',
                        'On Saturday we went to the zoo with Grandma.',
                        'On saturday we went to the Zoo with grandma.',
                        'On Saturday we went to the zoo with grandma.'
                    ],
                    hint: 'Capitalize days of the week and names.'
                },
                {
                    broken: 'yesterday we watched a movie and ate popcorn',
                    correct: 'Yesterday we watched a movie and ate popcorn.',
                    options: [
                        'Yesterday we watched a movie and ate popcorn.',
                        'Yesterday we watched a movie and ate popcorn?',
                        'yesterday we watched a movie and ate popcorn.',
                        'Yesterday we watched a Movie and ate popcorn.'
                    ],
                    hint: 'Only the first word should be capitalized here.'
                },
                {
                    broken: 'where is the library at school',
                    correct: 'Where is the library at school?',
                    options: [
                        'Where is the library at school?',
                        'Where is the library at school.',
                        'where is the library at school?',
                        'Where is the Library at school?'
                    ],
                    hint: 'Questions end with a question mark.'
                },
                {
                    broken: 'my friend alex plays soccer after school',
                    correct: 'My friend Alex plays soccer after school.',
                    options: [
                        'My friend Alex plays soccer after school.',
                        'My friend alex plays soccer after school.',
                        'my friend Alex plays soccer after school.',
                        'My Friend Alex plays soccer after school.'
                    ],
                    hint: 'Names should begin with a capital letter.'
                },
                {
                    broken: 'on monday we will take a spelling test',
                    correct: 'On Monday we will take a spelling test.',
                    options: [
                        'On Monday we will take a spelling test.',
                        'On monday we will take a spelling test.',
                        'On Monday we will take a Spelling test.',
                        'on Monday we will take a spelling test.'
                    ],
                    hint: 'Capitalize the day of the week.'
                },
                {
                    broken: 'during summer break we went camping by the lake with uncle tom',
                    correct: 'During summer break we went camping by the lake with Uncle Tom.',
                    options: [
                        'During summer break we went camping by the lake with Uncle Tom.',
                        'during summer break we went camping by the lake with Uncle Tom.',
                        'During summer break we went camping by the lake with uncle tom.',
                        'During Summer break we went camping by the lake with Uncle Tom.'
                    ],
                    hint: 'Capitalize family names when they are used like a name.'
                },
                {
                    broken: 'after school my brother and i went to soccer practice',
                    correct: 'After school, my brother and I went to soccer practice.',
                    options: [
                        'After school my brother and I went to soccer practice.',
                        'After school, my brother and I went to soccer practice.',
                        'After school my Brother and I went to soccer practice.',
                        'after school, my brother and I went to soccer practice.'
                    ],
                    hint: 'Use a comma after a short introductory phrase.'
                },
                {
                    broken: 'when does the new playground open at our school',
                    correct: 'When does the new playground open at our school?',
                    options: [
                        'When does the new playground open at our school?',
                        'When does the new playground open at our school.',
                        'when does the new playground open at our school?',
                        'When does the New playground open at our school?'
                    ],
                    hint: 'This is a question. It needs a question mark.'
                }
            ],
            hard: [
                {
                    broken: 'when i get home i will finish my project and read a book',
                    correct: 'When I get home, I will finish my project and read a book.',
                    options: [
                        'When I get home I will finish my project and read a book.',
                        'When I get home, I will finish my project and read a book',
                        'When I get home, I will finish my project and read a book.',
                        'When i get home, I will finish my project and read a book.'
                    ],
                    hint: 'Use a comma after an introductory phrase and end with a period.'
                },
                {
                    broken: 'wow that fireworks show was amazing',
                    correct: 'Wow, that fireworks show was amazing!',
                    options: [
                        'Wow, that fireworks show was amazing!',
                        'Wow that fireworks show was amazing.',
                        'wow, that fireworks show was amazing!',
                        'Wow that fireworks show was amazing!'
                    ],
                    hint: 'This is an exclamation. Use a comma after "Wow".'
                },
                {
                    broken: 'if you finish your homework you can play video games later',
                    correct: 'If you finish your homework, you can play video games later.',
                    options: [
                        'If you finish your homework you can play video games later.',
                        'If you finish your homework, you can play video games later.',
                        'if you finish your homework, you can play video games later.',
                        'If you finish your homework you can play video games later?'
                    ],
                    hint: 'Use a comma after a long "if" clause.'
                },
                {
                    broken: 'last summer we traveled to new york and visited the statue of liberty',
                    correct: 'Last summer we traveled to New York and visited the Statue of Liberty.',
                    options: [
                        'Last summer we traveled to New York and visited the Statue of Liberty.',
                        'Last summer we traveled to New york and visited the Statue of liberty.',
                        'Last Summer we traveled to New York and visited the Statue of Liberty.',
                        'Last summer we traveled to New York and visited the statue of liberty.'
                    ],
                    hint: 'Capitalize city names and each main word in a monument name.'
                },
                {
                    broken: 'please remember to bring pencils paper and a calculator to class',
                    correct: 'Please remember to bring pencils, paper, and a calculator to class.',
                    options: [
                        'Please remember to bring pencils, paper, and a calculator to class.',
                        'Please remember to bring pencils paper, and a calculator to class.',
                        'Please remember to bring pencils, paper and a calculator to class.',
                        'please remember to bring pencils, paper, and a calculator to class.'
                    ],
                    hint: 'Use commas in a list and start with a capital letter.'
                },
                {
                    broken: 'because the weather was stormy the class trip was moved to next week',
                    correct: 'Because the weather was stormy, the class trip was moved to next week.',
                    options: [
                        'Because the weather was stormy the class trip was moved to next week.',
                        'Because the weather was stormy, the class trip was moved to next week.',
                        'because the weather was stormy, the class trip was moved to next week.',
                        'Because the weather was stormy, the class trip was moved to next week?'
                    ],
                    hint: 'Use a comma after an introductory "because" clause.'
                },
                {
                    broken: 'even though we were tired we stayed up to watch the meteor shower',
                    correct: 'Even though we were tired, we stayed up to watch the meteor shower.',
                    options: [
                        'Even though we were tired we stayed up to watch the meteor shower.',
                        'Even though we were tired, we stayed up to watch the meteor shower.',
                        'even though we were tired, we stayed up to watch the meteor shower.',
                        'Even though we were tired, we stayed up to watch the meteor shower?'
                    ],
                    hint: 'Long introductory clauses should be followed by a comma.'
                },
                {
                    broken: 'on friday night my family ordered chinese food played a board game and watched a movie',
                    correct: 'On Friday night my family ordered Chinese food, played a board game, and watched a movie.',
                    options: [
                        'On Friday night my family ordered Chinese food, played a board game and watched a movie.',
                        'On Friday night my family ordered Chinese food, played a board game, and watched a movie.',
                        'On friday night my family ordered Chinese food, played a board game, and watched a movie.',
                        'On Friday night my family ordered chinese food, played a board game, and watched a movie.'
                    ],
                    hint: 'Use commas in a series and capitalize days of the week and food names when they are part of a title.'
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

        document.getElementById('brokenSentence').textContent = this.currentItem.broken;

        const optionsDiv = document.getElementById('options');
        optionsDiv.innerHTML = '';
        this.currentItem.options.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'option';
            div.textContent = opt;
            div.addEventListener('click', () => this.checkAnswer(opt, div));
            optionsDiv.appendChild(div);
        });

        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';
        document.getElementById('hintText').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('skipBtn').style.display = 'inline-block';
    }

    checkAnswer(choice, element) {
        const correctSentence = this.currentItem.correct;
        this.total++;

        document.querySelectorAll('.option').forEach(o => o.style.pointerEvents = 'none');

        if (choice === correctSentence) {
            this.correct++;
            this.streak++;
            this.score += this.usedHint ? 5 : 10;
            element.classList.add('correct');
            document.getElementById('feedback').textContent = '✓ Correct! That sentence is written correctly.';
            document.getElementById('feedback').className = 'feedback correct';
            this.checkAchievements();
        } else {
            this.streak = 0;
            element.classList.add('incorrect');
            document.getElementById('feedback').textContent = `✗ Not quite. The best sentence was "${correctSentence}"`;
            document.getElementById('feedback').className = 'feedback incorrect';

            document.querySelectorAll('.option').forEach(o => {
                if (o.textContent === correctSentence) {
                    o.classList.add('correct');
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
        document.getElementById('feedback').textContent = `⏭️ Skipped. The best sentence was "${this.currentItem.correct}"`;
        document.getElementById('feedback').className = 'feedback';
        this.updateStats();
        this.generateNewItem();
    }

    nextItem() {
        this.generateNewItem();
    }

    resetGame() {
        if (confirm('Reset Sentence Fixer progress?')) {
            this.score = 0;
            this.streak = 0;
            this.correct = 0;
            this.total = 0;
            this.achievements = {
                firstFix: false,
                streakFive: false,
                perfectTen: false,
                sentenceStar: false
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
        if (!this.achievements.firstFix && this.correct >= 1) {
            this.achievements.firstFix = true;
            this.unlockAchievement('firstFix');
        }
        if (!this.achievements.streakFive && this.streak >= 5) {
            this.achievements.streakFive = true;
            this.unlockAchievement('streakFive');
        }
        if (!this.achievements.perfectTen && this.correct >= 10 && this.total >= 10 && this.correct === this.total) {
            this.achievements.perfectTen = true;
            this.unlockAchievement('perfectTen');
        }
        if (!this.achievements.sentenceStar && this.correct >= 25) {
            this.achievements.sentenceStar = true;
            this.unlockAchievement('sentenceStar');
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
    new SentenceFixerGame();
});
