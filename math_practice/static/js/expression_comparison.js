class ExpressionComparisonGame {
    constructor() {
        this.score = 0;
        this.streak = 0;
        this.correct = 0;
        this.total = 0;
        this.difficulty = 'easy';
        this.currentProblem = null;
        this.achievements = {
            firstCompare: false,
            streakFive: false,
            perfectTen: false,
            mathMaster: false
        };

        this.setupEventListeners();
        this.generateNewProblem();
        this.updateStats();
    }

    setupEventListeners() {
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.generateNewProblem();
        });

        document.getElementById('leftBtn').addEventListener('click', () => this.checkAnswer('left'));
        document.getElementById('equalBtn').addEventListener('click', () => this.checkAnswer('equal'));
        document.getElementById('rightBtn').addEventListener('click', () => this.checkAnswer('right'));
        document.getElementById('skipBtn').addEventListener('click', () => this.skipProblem());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextProblem());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
    }

    generateExpression(difficulty, varName, varValue) {
        let expr, value;
        
        if (difficulty === 'easy') {
            const type = Math.floor(Math.random() * 3);
            
            if (type === 0) {
                // Simple: coefficient * variable + constant (e.g., 3x + 2)
                const coeff = Math.floor(Math.random() * 5) + 1;
                const constant = Math.floor(Math.random() * 10) + 1;
                expr = `${coeff}${varName} + ${constant}`;
                value = coeff * varValue + constant;
            } else if (type === 1) {
                // Simple: coefficient * variable - constant (e.g., 4x - 3)
                const coeff = Math.floor(Math.random() * 5) + 2;
                const constant = Math.floor(Math.random() * 8) + 1;
                expr = `${coeff}${varName} - ${constant}`;
                value = coeff * varValue - constant;
            } else {
                // Simple: constant + coefficient * variable (e.g., 5 + 2x)
                const constant = Math.floor(Math.random() * 10) + 1;
                const coeff = Math.floor(Math.random() * 5) + 1;
                expr = `${constant} + ${coeff}${varName}`;
                value = constant + coeff * varValue;
            }
        } else if (difficulty === 'medium') {
            const type = Math.floor(Math.random() * 4);
            
            if (type === 0) {
                // Two-term: ax + b + c (e.g., 2x + 5 + 3)
                const coeff = Math.floor(Math.random() * 6) + 1;
                const const1 = Math.floor(Math.random() * 10) + 1;
                const const2 = Math.floor(Math.random() * 8) + 1;
                expr = `${coeff}${varName} + ${const1} + ${const2}`;
                value = coeff * varValue + const1 + const2;
            } else if (type === 1) {
                // Mixed operations: ax + b - c (e.g., 4x + 7 - 2)
                const coeff = Math.floor(Math.random() * 6) + 1;
                const const1 = Math.floor(Math.random() * 10) + 1;
                const const2 = Math.floor(Math.random() * 8) + 1;
                expr = `${coeff}${varName} + ${const1} - ${const2}`;
                value = coeff * varValue + const1 - const2;
            } else if (type === 2) {
                // Parentheses: (x + a) * b (e.g., (x + 3) × 2)
                const const1 = Math.floor(Math.random() * 8) + 1;
                const multiplier = Math.floor(Math.random() * 4) + 2;
                expr = `(${varName} + ${const1}) × ${multiplier}`;
                value = (varValue + const1) * multiplier;
            } else {
                // Multiple coefficient: ax - b + c (e.g., 5x - 4 + 6)
                const coeff = Math.floor(Math.random() * 6) + 2;
                const const1 = Math.floor(Math.random() * 10) + 1;
                const const2 = Math.floor(Math.random() * 8) + 1;
                expr = `${coeff}${varName} - ${const1} + ${const2}`;
                value = coeff * varValue - const1 + const2;
            }
        } else { // hard
            const type = Math.floor(Math.random() * 5);
            
            if (type === 0) {
                // Complex: (ax + b) × c - d (e.g., (2x + 3) × 4 - 5)
                const coeff = Math.floor(Math.random() * 5) + 1;
                const const1 = Math.floor(Math.random() * 8) + 1;
                const multiplier = Math.floor(Math.random() * 4) + 2;
                const const2 = Math.floor(Math.random() * 10) + 1;
                expr = `(${coeff}${varName} + ${const1}) × ${multiplier} - ${const2}`;
                value = (coeff * varValue + const1) * multiplier - const2;
            } else if (type === 1) {
                // Division: (ax + b) ÷ c (e.g., (6x + 9) ÷ 3)
                const divisor = Math.floor(Math.random() * 3) + 2;
                const coeff = Math.floor(Math.random() * 4) + 1;
                const const1 = divisor * Math.floor(Math.random() * 5); // Ensure divisible
                expr = `(${coeff}${varName} + ${const1}) ÷ ${divisor}`;
                value = (coeff * varValue + const1) / divisor;
            } else if (type === 2) {
                // Nested: a(x + b) + c (e.g., 3(x + 4) + 7)
                const coeff = Math.floor(Math.random() * 5) + 2;
                const const1 = Math.floor(Math.random() * 6) + 1;
                const const2 = Math.floor(Math.random() * 10) + 1;
                expr = `${coeff}(${varName} + ${const1}) + ${const2}`;
                value = coeff * (varValue + const1) + const2;
            } else if (type === 3) {
                // Complex nested: (ax - b) × c + d (e.g., (4x - 2) × 3 + 5)
                const coeff = Math.floor(Math.random() * 5) + 2;
                const const1 = Math.floor(Math.random() * 8) + 1;
                const multiplier = Math.floor(Math.random() * 4) + 2;
                const const2 = Math.floor(Math.random() * 10) + 1;
                expr = `(${coeff}${varName} - ${const1}) × ${multiplier} + ${const2}`;
                value = (coeff * varValue - const1) * multiplier + const2;
            } else {
                // Advanced: ax × b - c + d (e.g., 2x × 3 - 4 + 7)
                const coeff = Math.floor(Math.random() * 5) + 1;
                const multiplier = Math.floor(Math.random() * 4) + 2;
                const const1 = Math.floor(Math.random() * 10) + 1;
                const const2 = Math.floor(Math.random() * 8) + 1;
                expr = `${coeff}${varName} × ${multiplier} - ${const1} + ${const2}`;
                value = coeff * varValue * multiplier - const1 + const2;
            }
        }
        
        return { expr, value };
    }

    generateNewProblem() {
        const variables = ['x', 'y', 'z', 'n', 'm'];
        const varName = variables[Math.floor(Math.random() * variables.length)];
        const varValue = Math.floor(Math.random() * 10) + 1;

        const left = this.generateExpression(this.difficulty, varName, varValue);
        const right = this.generateExpression(this.difficulty, varName, varValue);
        
        // Occasionally make them equal
        if (Math.random() < 0.15) {
            right.value = left.value;
        }
        
        this.currentProblem = {
            left: left,
            right: right,
            varName: varName,
            varValue: varValue
        };
        
        // Determine correct answer
        if (left.value > right.value) {
            this.currentProblem.answer = 'left';
        } else if (right.value > left.value) {
            this.currentProblem.answer = 'right';
        } else {
            this.currentProblem.answer = 'equal';
        }
        
        document.getElementById('expression1').textContent = left.expr;
        document.getElementById('expression2').textContent = right.expr;
        document.getElementById('variable-display').textContent = `Where ${this.currentProblem.varName} = ${this.currentProblem.varValue}`;
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';
        document.getElementById('explanation').textContent = '';
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('skipBtn').style.display = 'inline-block';
        
        // Re-enable buttons
        document.querySelectorAll('.compare-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect');
        });
    }

    checkAnswer(userChoice) {
        const correct = this.currentProblem.answer;
        this.total++;
        
        // Disable all buttons
        document.querySelectorAll('.compare-btn').forEach(btn => btn.disabled = true);
        
        const leftBtn = document.getElementById('leftBtn');
        const equalBtn = document.getElementById('equalBtn');
        const rightBtn = document.getElementById('rightBtn');
        
        if (userChoice === correct) {
            this.correct++;
            this.streak++;
            this.score += 10;
            
            // Highlight correct button
            if (userChoice === 'left') leftBtn.classList.add('correct');
            else if (userChoice === 'equal') equalBtn.classList.add('correct');
            else rightBtn.classList.add('correct');
            
            document.getElementById('feedback').textContent = '✓ Correct!';
            document.getElementById('feedback').className = 'feedback correct';
            this.checkAchievements();
            this.updateStats();
            
            // Auto-advance after short delay
            setTimeout(() => {
                this.generateNewProblem();
            }, 800);
        } else {
            this.streak = 0;
            
            // Highlight wrong button
            if (userChoice === 'left') leftBtn.classList.add('incorrect');
            else if (userChoice === 'equal') equalBtn.classList.add('incorrect');
            else rightBtn.classList.add('incorrect');
            
            // Highlight correct button
            if (correct === 'left') leftBtn.classList.add('correct');
            else if (correct === 'equal') equalBtn.classList.add('correct');
            else rightBtn.classList.add('correct');
            
            document.getElementById('feedback').textContent = '✗ Not quite.';
            document.getElementById('feedback').className = 'feedback incorrect';
            
            const { varName, varValue, left, right } = this.currentProblem;
            
            document.getElementById('explanation').textContent = 
                `Where ${varName} = ${varValue}: ${left.expr} = ${left.value}, ${right.expr} = ${right.value}`;
            
            this.updateStats();
            document.getElementById('nextBtn').style.display = 'inline-block';
            document.getElementById('skipBtn').style.display = 'none';
        }
    }

    skipProblem() {
        this.streak = 0;
        this.total++;
        document.getElementById('feedback').textContent = '⏭️ Skipped.';
        document.getElementById('feedback').className = 'feedback';
        
        const { varName, varValue, left, right } = this.currentProblem;
        
        document.getElementById('explanation').textContent = 
            `Where ${varName} = ${varValue}: ${left.expr} = ${left.value}, ${right.expr} = ${right.value}`;
        
        this.updateStats();
        this.generateNewProblem();
    }

    nextProblem() {
        this.generateNewProblem();
    }

    resetGame() {
        if (confirm('Reset Number Comparison progress?')) {
            this.score = 0;
            this.streak = 0;
            this.correct = 0;
            this.total = 0;
            this.achievements = {
                firstCompare: false,
                streakFive: false,
                perfectTen: false,
                mathMaster: false
            };

            document.querySelectorAll('.achievement').forEach(a => a.classList.remove('unlocked'));
            this.updateStats();
            this.generateNewProblem();
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
        if (!this.achievements.firstCompare && this.correct >= 1) {
            this.achievements.firstCompare = true;
            this.unlockAchievement('firstCompare');
        }
        if (!this.achievements.streakFive && this.correct >= 5) {
            this.achievements.streakFive = true;
            this.unlockAchievement('streakFive');
        }
        if (!this.achievements.perfectTen && this.correct >= 10) {
            this.achievements.perfectTen = true;
            this.unlockAchievement('perfectTen');
        }
        if (!this.achievements.mathMaster && this.correct >= 25) {
            this.achievements.mathMaster = true;
            this.unlockAchievement('mathMaster');
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
    console.log('Expression Comparison game initializing...');
    const game = new ExpressionComparisonGame();
    console.log('Expression Comparison game initialized successfully');
});
