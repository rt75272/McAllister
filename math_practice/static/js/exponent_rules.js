// Calculator Class
class Calculator {
    constructor() {
        this.display = document.getElementById('calc-display');
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.displayExpression = '0';
        this.fullExpression = '';
        
        this.init();
        this.updateDisplay();
    }
    
    init() {
        const buttons = document.querySelectorAll('.calc-btn');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.dataset.value;
                this.handleInput(value);
            });
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.target.id === 'answer-input') return; // Don't interfere with answer input
            
            if (e.key >= '0' && e.key <= '9') this.handleInput(e.key);
            else if (e.key === '.') this.handleInput('.');
            else if (e.key === '+') this.handleInput('+');
            else if (e.key === '-') this.handleInput('-');
            else if (e.key === '*') this.handleInput('*');
            else if (e.key === '/') this.handleInput('/');
            else if (e.key === '^') this.handleInput('^');
            else if (e.key === 'Enter') this.handleInput('=');
            else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') this.handleInput('C');
        });
        
        // Transfer button
        document.getElementById('transfer-btn').addEventListener('click', () => {
            document.getElementById('answer-input').value = this.currentValue;
            document.getElementById('answer-input').focus();
        });
    }
    
    handleInput(value) {
        if (value >= '0' && value <= '9') {
            this.inputDigit(value);
        } else if (value === '.') {
            this.inputDecimal();
        } else if (value === 'C') {
            this.clear();
        } else if (['+', '-', '*', '/', '^'].includes(value)) {
            this.setOperation(value);
        } else if (value === '=') {
            this.calculate();
        }
    }
    
    inputDigit(digit) {
        if (this.waitingForOperand) {
            this.currentValue = digit;
            this.waitingForOperand = false;
            this.fullExpression += digit;
        } else {
            this.currentValue = this.currentValue === '0' ? digit : this.currentValue + digit;
            if (this.fullExpression === '' || this.fullExpression === '0') {
                this.fullExpression = digit;
            } else {
                this.fullExpression += digit;
            }
        }
        this.updateDisplayExpression();
    }
    
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
            this.fullExpression += '0.';
        } else if (this.currentValue.indexOf('.') === -1) {
            this.currentValue += '.';
            this.fullExpression += '.';
        }
        this.updateDisplayExpression();
    }
    
    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operation = null;
        this.waitingForOperand = false;
        this.displayExpression = '0';
        this.fullExpression = '';
        this.updateDisplay();
    }
    
    setOperation(op) {
        const opSymbol = op === '*' ? ' × ' : op === '/' ? ' ÷ ' : ` ${op} `;
        
        if (this.currentValue === '0' && this.fullExpression === '') return;
        
        // Don't auto-calculate, just add the operator
        this.previousValue = this.currentValue;
        this.operation = op;
        this.waitingForOperand = true;
        
        if (this.fullExpression === '' || this.fullExpression === '0') {
            this.fullExpression = this.currentValue + opSymbol;
        } else if (!this.fullExpression.endsWith(' ')) {
            this.fullExpression += opSymbol;
        }
        
        this.updateDisplayExpression();
    }
    
    calculate() {
        if (!this.fullExpression || this.waitingForOperand) return;
        
        try {
            // Replace visual symbols with JavaScript operators
            let expression = this.fullExpression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/\^/g, '**');
            
            // Evaluate the expression
            let result = eval(expression);
            
            this.currentValue = result.toString();
            this.previousValue = '';
            this.operation = null;
            this.waitingForOperand = false;
            
            // Show full expression with result
            this.displayExpression = `${this.fullExpression} = ${this.currentValue}`;
            this.updateDisplay();
            
            // Reset for next calculation
            this.fullExpression = this.currentValue;
        } catch (error) {
            this.currentValue = 'Error';
            this.displayExpression = 'Error';
            this.updateDisplay();
            this.clear();
        }
    }
    
    updateDisplayExpression() {
        this.displayExpression = this.fullExpression || this.currentValue;
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.display.textContent = this.displayExpression;
    }
}

// Exponent Evaluation Game Logic

class ExponentRulesGame {
    constructor() {
        this.score = 0;
        this.streak = 0;
        this.totalAttempts = 0;
        this.correctAnswers = 0;
        this.problemsSolved = 0;
        this.difficulty = 'easy';
        
        this.currentProblem = null;
        this.achievements = [];
        
        this.init();
    }
    
    init() {
        this.cacheDomElements();
        this.attachEventListeners();
        this.newProblem();
        this.updateDisplay();
    }
    
    cacheDomElements() {
        this.problemDisplay = document.getElementById('problem-display');
        this.problemHint = document.getElementById('problem-hint');
        this.answerInput = document.getElementById('answer-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.showWorkBtn = document.getElementById('show-work-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.feedback = document.getElementById('feedback');
        this.difficultySelect = document.getElementById('difficulty');
        
        // Stats elements
        this.scoreDisplay = document.getElementById('score');
        this.streakDisplay = document.getElementById('streak');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.problemsSolvedDisplay = document.getElementById('problems-solved');
        this.achievementsList = document.getElementById('achievements-list');
        
        // Modal
        this.workModal = document.getElementById('work-modal');
        this.workContent = document.getElementById('work-content');
        this.closeModal = document.querySelector('.close');
    }
    
    attachEventListeners() {
        this.submitBtn.addEventListener('click', () => this.checkAnswer());
        this.skipBtn.addEventListener('click', () => this.skipProblem());
        this.showWorkBtn.addEventListener('click', () => this.showWork());
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.newProblem();
        });
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
        this.closeModal.addEventListener('click', () => {
            this.workModal.style.display = 'none';
        });
        window.addEventListener('click', (e) => {
            if (e.target === this.workModal) {
                this.workModal.style.display = 'none';
            }
        });
    }
    
    generateProblem() {
        let base, exponent, answer;
        
        if (this.difficulty === 'easy') {
            base = Math.floor(Math.random() * 8) + 2; // 2-9
            exponent = Math.floor(Math.random() * 3) + 2; // 2-4
        } else if (this.difficulty === 'medium') {
            base = Math.floor(Math.random() * 10) + 2; // 2-11
            exponent = Math.floor(Math.random() * 4) + 2; // 2-5
        } else { // hard
            base = Math.floor(Math.random() * 13) + 2; // 2-14
            exponent = Math.floor(Math.random() * 5) + 2; // 2-6
        }
        
        answer = Math.pow(base, exponent);
        
        return {
            base: base,
            exponent: exponent,
            display: `${base}^${exponent} = ?`,
            hint: `What is ${base} raised to the power of ${exponent}?`,
            answer: answer,
            work: [
                `Given: ${base}^${exponent}`,
                `This means: ${base} × `.repeat(exponent).slice(0, -3),
                `Calculation: ${this.generateCalculationSteps(base, exponent)}`,
                `Answer: ${answer}`
            ]
        };
    }
    
    generateCalculationSteps(base, exponent) {
        let result = base;
        let steps = `${base}`;
        
        for (let i = 1; i < exponent; i++) {
            result *= base;
            steps += ` × ${base} = ${result}`;
        }
        
        return steps;
    }
    
    newProblem() {
        this.currentProblem = this.generateProblem();
        this.problemDisplay.textContent = this.currentProblem.display;
        this.problemHint.textContent = this.currentProblem.hint;
        this.answerInput.value = '';
        this.feedback.textContent = '';
        this.feedback.className = 'feedback neutral';
        this.answerInput.focus();
    }
    
    checkAnswer() {
        const userAnswer = this.answerInput.value.trim();
        
        if (userAnswer === '') {
            this.showFeedback('Please enter an answer!', 'neutral');
            return;
        }
        
        this.totalAttempts++;
        
        const userNum = parseFloat(userAnswer);
        const isCorrect = !isNaN(userNum) && userNum === this.currentProblem.answer;
        
        if (isCorrect) {
            this.correctAnswers++;
            this.problemsSolved++;
            this.score += this.getPoints();
            this.streak++;
            
            this.showFeedback('Correct! 🎉', 'correct');
            this.checkAchievements();
            
            setTimeout(() => this.newProblem(), 1500);
        } else {
            this.streak = 0;
            this.showFeedback(`Incorrect. The answer is ${this.currentProblem.answer}`, 'incorrect');
            
            setTimeout(() => this.newProblem(), 2500);
        }
        
        this.updateDisplay();
    }
    
    skipProblem() {
        this.showFeedback(`Skipped. The answer was ${this.currentProblem.answer}`, 'incorrect');
        this.streak = 0;
        this.totalAttempts++;
        
        setTimeout(() => this.newProblem(), 2000);
        this.updateDisplay();
    }
    
    showWork() {
        this.workContent.innerHTML = '';
        
        this.currentProblem.work.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'step';
            stepDiv.textContent = `${index + 1}. ${step}`;
            this.workContent.appendChild(stepDiv);
        });
        
        this.workModal.style.display = 'block';
    }
    
    getPoints() {
        let points = 10;
        
        if (this.difficulty === 'medium') points = 20;
        if (this.difficulty === 'hard') points = 30;
        
        if (this.streak >= 5) points *= 1.5;
        if (this.streak >= 10) points *= 2;
        
        return Math.round(points);
    }
    
    showFeedback(message, type) {
        this.feedback.textContent = message;
        this.feedback.className = `feedback ${type}`;
    }
    
    updateDisplay() {
        this.scoreDisplay.textContent = this.score;
        this.streakDisplay.textContent = this.streak;
        
        const accuracy = this.totalAttempts > 0 ? 
            Math.round((this.correctAnswers / this.totalAttempts) * 100) : 0;
        this.accuracyDisplay.textContent = `${accuracy}%`;
        
        this.problemsSolvedDisplay.textContent = this.problemsSolved;
    }
    
    checkAchievements() {
        const newAchievements = [];
        
        // Score milestones
        if (this.score >= 100 && !this.achievements.includes('century')) {
            newAchievements.push({ id: 'century', text: '🎯 Century! 100 points!' });
            this.achievements.push('century');
        }
        if (this.score >= 500 && !this.achievements.includes('expert')) {
            newAchievements.push({ id: 'expert', text: '⭐ Expert! 500 points!' });
            this.achievements.push('expert');
        }
        if (this.score >= 1000 && !this.achievements.includes('master')) {
            newAchievements.push({ id: 'master', text: '👑 Master! 1000 points!' });
            this.achievements.push('master');
        }
        
        // Streak milestones
        if (this.streak === 5 && !this.achievements.includes('streak5')) {
            newAchievements.push({ id: 'streak5', text: '🔥 5 in a row!' });
            this.achievements.push('streak5');
        }
        if (this.streak === 10 && !this.achievements.includes('streak10')) {
            newAchievements.push({ id: 'streak10', text: '🔥🔥 10 streak!' });
            this.achievements.push('streak10');
        }
        if (this.streak === 20 && !this.achievements.includes('streak20')) {
            newAchievements.push({ id: 'streak20', text: '🔥🔥🔥 Unstoppable!' });
            this.achievements.push('streak20');
        }
        
        // Problems solved milestones
        if (this.problemsSolved >= 10 && !this.achievements.includes('beginner')) {
            newAchievements.push({ id: 'beginner', text: '📚 10 Problems Solved!' });
            this.achievements.push('beginner');
        }
        if (this.problemsSolved >= 25 && !this.achievements.includes('intermediate')) {
            newAchievements.push({ id: 'intermediate', text: '📖 25 Problems Solved!' });
            this.achievements.push('intermediate');
        }
        if (this.problemsSolved >= 50 && !this.achievements.includes('advanced')) {
            newAchievements.push({ id: 'advanced', text: '📕 50 Problems Solved!' });
            this.achievements.push('advanced');
        }
        
        // Accuracy milestones
        const accuracy = this.totalAttempts >= 10 ? 
            (this.correctAnswers / this.totalAttempts) * 100 : 0;
        
        if (accuracy >= 90 && this.totalAttempts >= 10 && !this.achievements.includes('accurate')) {
            newAchievements.push({ id: 'accurate', text: '🎯 90% Accuracy!' });
            this.achievements.push('accurate');
        }
        if (accuracy >= 95 && this.totalAttempts >= 20 && !this.achievements.includes('sharpshooter')) {
            newAchievements.push({ id: 'sharpshooter', text: '🎖️ 95% Sharpshooter!' });
            this.achievements.push('sharpshooter');
        }
        
        // Display new achievements
        newAchievements.forEach(achievement => {
            const achievementDiv = document.createElement('div');
            achievementDiv.className = 'achievement';
            achievementDiv.textContent = achievement.text;
            this.achievementsList.appendChild(achievementDiv);
        });
    }
}

// Initialize game and calculator when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
    new ExponentRulesGame();
});
