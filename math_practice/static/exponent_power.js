// Exponent Power Game JavaScript

class Calculator {
    constructor() {
        this.display = document.getElementById('calc-display');
        this.currentInput = '';
        this.operator = null;
        this.previousInput = '';
        this.waitingForNewNumber = false;
    }
    
    inputNumber(num) {
        if (this.waitingForNewNumber) {
            this.currentInput = num;
            this.waitingForNewNumber = false;
        } else {
            this.currentInput = this.currentInput === '' ? num : this.currentInput + num;
        }
        this.updateDisplay();
    }
    
    inputOperator(op) {
        if (this.currentInput === '') return;
        
        if (this.previousInput !== '' && this.operator !== null && !this.waitingForNewNumber) {
            this.calculate();
        }
        
        this.operator = op;
        this.previousInput = this.currentInput;
        this.waitingForNewNumber = true;
    }
    
    calculate() {
        if (this.operator === null || this.waitingForNewNumber) return;
        
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        let result;
        switch (this.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.currentInput = 'Error';
                    this.updateDisplay();
                    this.clear();
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }
        
        this.currentInput = result.toString();
        this.operator = null;
        this.previousInput = '';
        this.waitingForNewNumber = true;
        this.updateDisplay();
    }
    
    power() {
        if (this.currentInput === '') return;
        
        const base = parseFloat(this.currentInput);
        if (isNaN(base)) return;
        
        // For the exponent game, we'll prompt for the exponent
        const exponent = prompt('Enter the exponent:');
        if (exponent === null || exponent === '') return;
        
        const exp = parseFloat(exponent);
        if (isNaN(exp)) {
            alert('Please enter a valid number for the exponent.');
            return;
        }
        
        const result = Math.pow(base, exp);
        this.currentInput = result.toString();
        this.updateDisplay();
        this.waitingForNewNumber = true;
    }
    
    clear() {
        this.currentInput = '';
        this.operator = null;
        this.previousInput = '';
        this.waitingForNewNumber = false;
        this.updateDisplay();
    }
    
    clearEntry() {
        this.currentInput = '';
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.display.value = this.currentInput || '0';
    }
    
    // Add keyboard support
    handleKeyboard(event) {
        const key = event.key;
        
        if (key >= '0' && key <= '9' || key === '.') {
            this.inputNumber(key);
        } else if (['+', '-', '*', '/'].includes(key)) {
            this.inputOperator(key === '*' ? '*' : key);
        } else if (key === 'Enter' || key === '=') {
            this.calculate();
        } else if (key === 'Escape' || key.toLowerCase() === 'c') {
            this.clear();
        } else if (key === 'Backspace') {
            this.clearEntry();
        }
    }
    
    transferToAnswer() {
        const answerInput = document.getElementById('answer-input');
        if (answerInput && this.currentInput && this.currentInput !== 'Error') {
            // Round to avoid floating point precision issues
            const value = parseFloat(this.currentInput);
            answerInput.value = Number.isInteger(value) ? value.toString() : parseFloat(value.toFixed(6)).toString();
            answerInput.focus();
        }
    }
}

class ExponentPowerGame {
    constructor() {
        this.difficulty = 'easy';
        this.currentProblem = {};
        this.score = 0;
        this.streak = 0;
        this.totalSolved = 0;
        this.totalAttempted = 0;
        this.level = 1;
        this.problemsInLevel = 0;
        this.achievements = [];
        
        this.initializeElements();
        this.bindEvents();
        this.generateNewProblem();
        this.updateDisplay();
    }
    
    initializeElements() {
        this.difficultySelect = document.getElementById('difficulty');
        this.baseElement = document.getElementById('base');
        this.exponentElement = document.getElementById('exponent');
        this.hintElement = document.getElementById('hint-text');
        this.answerInput = document.getElementById('answer-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.feedback = document.getElementById('feedback');
        this.scoreElement = document.getElementById('score');
        this.streakElement = document.getElementById('streak');
        this.accuracyElement = document.getElementById('accuracy');
        this.totalSolvedElement = document.getElementById('total-solved');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        this.achievementList = document.getElementById('achievement-list');
        this.calculatorModal = document.getElementById('calculator-modal');
        this.calculationSteps = document.getElementById('calculation-steps');
    }
    
    bindEvents() {
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.generateNewProblem();
        });
        
        this.submitBtn.addEventListener('click', () => this.submitAnswer());
        this.hintBtn.addEventListener('click', () => this.showCalculationSteps());
        this.skipBtn.addEventListener('click', () => this.skipProblem());
        
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });
        
        // Modal close functionality
        document.querySelector('.close').addEventListener('click', () => {
            this.calculatorModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === this.calculatorModal) {
                this.calculatorModal.style.display = 'none';
            }
        });
    }
    
    generateNewProblem() {
        let base, exponent;
        
        switch (this.difficulty) {
            case 'easy':
                base = this.getRandomInt(2, 5);
                exponent = this.getRandomInt(2, 4);
                break;
            case 'medium':
                base = this.getRandomInt(2, 10);
                exponent = this.getRandomInt(2, 5);
                break;
            case 'hard':
                base = this.getRandomInt(2, 15);
                exponent = this.getRandomInt(2, 6);
                break;
        }
        
        // Special cases for learning
        if (Math.random() < 0.2) { // 20% chance for special cases
            if (Math.random() < 0.5) {
                exponent = 0; // x^0 = 1
            } else {
                exponent = 1; // x^1 = x
            }
        }
        
        const answer = Math.pow(base, exponent);
        
        this.currentProblem = {
            base: base,
            exponent: exponent,
            answer: answer
        };
        
        this.displayProblem();
        this.answerInput.value = '';
        this.answerInput.focus();
        this.clearFeedback();
    }
    
    displayProblem() {
        this.baseElement.textContent = this.currentProblem.base;
        this.exponentElement.textContent = this.currentProblem.exponent;
        
        // Generate hint text
        if (this.currentProblem.exponent === 0) {
            this.hintElement.textContent = "Any number to the power 0 equals 1";
        } else if (this.currentProblem.exponent === 1) {
            this.hintElement.textContent = "Any number to the power 1 equals itself";
        } else if (this.currentProblem.exponent === 2) {
            this.hintElement.textContent = `${this.currentProblem.base} × ${this.currentProblem.base}`;
        } else {
            const multiplication = Array(this.currentProblem.exponent).fill(this.currentProblem.base).join(' × ');
            this.hintElement.textContent = multiplication;
        }
    }
    
    submitAnswer() {
        const userAnswer = parseInt(this.answerInput.value);
        
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
        }, 2000);
    }
    
    handleCorrectAnswer() {
        this.score += this.getPointsForDifficulty();
        this.streak++;
        this.totalSolved++;
        this.problemsInLevel++;
        
        const messages = [
            'Excellent! 🌟',
            'Perfect! 🎯',
            'Outstanding! ⚡',
            'Brilliant! 💫',
            'Fantastic! 🚀'
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.showFeedback(`${message} ${this.currentProblem.base}^${this.currentProblem.exponent} = ${this.currentProblem.answer}`, 'correct');
        
        this.checkForAchievements();
        this.checkLevelUp();
    }
    
    handleIncorrectAnswer() {
        this.streak = 0;
        
        const explanation = this.getExplanation();
        this.showFeedback(`Incorrect. ${explanation}`, 'incorrect');
    }
    
    getExplanation() {
        const { base, exponent, answer } = this.currentProblem;
        
        if (exponent === 0) {
            return `Any number to the power 0 equals 1. So ${base}^0 = 1`;
        } else if (exponent === 1) {
            return `Any number to the power 1 equals itself. So ${base}^1 = ${base}`;
        } else if (exponent === 2) {
            return `${base}^2 = ${base} × ${base} = ${answer}`;
        } else {
            const steps = Array(exponent).fill(base).join(' × ');
            return `${base}^${exponent} = ${steps} = ${answer}`;
        }
    }
    
    skipProblem() {
        const explanation = this.getExplanation();
        this.showFeedback(`Skipped. ${explanation}`, 'neutral');
        this.streak = 0;
        
        setTimeout(() => {
            this.generateNewProblem();
        }, 3000);
    }
    
    showCalculationSteps() {
        const { base, exponent, answer } = this.currentProblem;
        let steps = '';
        
        if (exponent === 0) {
            steps = `
                <h4>Rule: Any number to the power 0 equals 1</h4>
                <p><strong>${base}^0 = 1</strong></p>
                <p>This is a fundamental rule of exponents!</p>
            `;
        } else if (exponent === 1) {
            steps = `
                <h4>Rule: Any number to the power 1 equals itself</h4>
                <p><strong>${base}^1 = ${base}</strong></p>
                <p>This is another fundamental rule of exponents!</p>
            `;
        } else if (exponent <= 4) {
            const multiplication = Array(exponent).fill(base);
            let calculation = multiplication[0];
            let stepByStep = [`Start with: ${base}`];
            
            for (let i = 1; i < multiplication.length; i++) {
                calculation = calculation * base;
                stepByStep.push(`${base} × ${calculation / base} = ${calculation}`);
            }
            
            steps = `
                <h4>Step-by-step calculation:</h4>
                <p><strong>${base}^${exponent} = ${multiplication.join(' × ')}</strong></p>
                ${stepByStep.map(step => `<p>${step}</p>`).join('')}
                <p><strong>Final answer: ${answer}</strong></p>
            `;
        } else {
            steps = `
                <h4>For larger exponents:</h4>
                <p><strong>${base}^${exponent} = ${base} multiplied by itself ${exponent} times</strong></p>
                <p>This equals: <strong>${answer}</strong></p>
                <p><em>Tip: For large numbers, you might want to use a calculator or break it down into smaller steps!</em></p>
            `;
        }
        
        this.calculationSteps.innerHTML = steps;
        this.calculatorModal.style.display = 'block';
    }
    
    getPointsForDifficulty() {
        switch (this.difficulty) {
            case 'easy': return 10;
            case 'medium': return 25;
            case 'hard': return 50;
            default: return 10;
        }
    }
    
    checkLevelUp() {
        const problemsNeeded = 5;
        if (this.problemsInLevel >= problemsNeeded) {
            this.level++;
            this.problemsInLevel = 0;
            this.addAchievement(`🎉 Level ${this.level} reached!`);
        }
    }
    
    checkForAchievements() {
        // First correct answer
        if (this.totalSolved === 1) {
            this.addAchievement('🎯 First Power Solved!');
        }
        
        // Streak achievements
        if (this.streak === 5 && !this.achievements.includes('🔥 5-Problem Streak!')) {
            this.addAchievement('🔥 5-Problem Streak!');
        }
        if (this.streak === 10 && !this.achievements.includes('⚡ 10-Problem Streak!')) {
            this.addAchievement('⚡ 10-Problem Streak!');
        }
        
        // Score milestones
        if (this.score >= 100 && !this.achievements.includes('💯 100 Points!')) {
            this.addAchievement('💯 100 Points!');
        }
        if (this.score >= 500 && !this.achievements.includes('🌟 500 Points!')) {
            this.addAchievement('🌟 500 Points!');
        }
        
        // Difficulty achievements
        if (this.difficulty === 'medium' && this.totalSolved >= 10 && !this.achievements.includes('📈 Medium Master!')) {
            this.addAchievement('📈 Medium Master!');
        }
        if (this.difficulty === 'hard' && this.totalSolved >= 5 && !this.achievements.includes('🚀 Hard Hero!')) {
            this.addAchievement('🚀 Hard Hero!');
        }
        
        // Perfect accuracy
        if (this.totalSolved >= 10 && this.getAccuracy() === 100 && !this.achievements.includes('🎯 Perfect Accuracy!')) {
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
        
        // Remove achievement after 5 seconds to keep list manageable
        setTimeout(() => {
            if (achievementElement.parentNode) {
                achievementElement.parentNode.removeChild(achievementElement);
            }
        }, 5000);
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
        
        // Update progress bar
        const problemsNeeded = 5;
        const progress = (this.problemsInLevel / problemsNeeded) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `Solve ${problemsNeeded - this.problemsInLevel} more problems to reach Level ${this.level + 1}!`;
    }
    
    showFeedback(message, type) {
        this.feedback.textContent = message;
        this.feedback.className = `feedback ${type}`;
    }
    
    clearFeedback() {
        this.feedback.textContent = '';
        this.feedback.className = 'feedback';
    }
    
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ExponentPowerGame();
    window.calculator = new Calculator(); // Make calculator globally accessible for onclick handlers
    
    // Add keyboard support for calculator
    document.addEventListener('keydown', (event) => {
        // Only handle calculator keys if the answer input is not focused
        if (document.activeElement.id !== 'answer-input') {
            window.calculator.handleKeyboard(event);
        }
    });
});