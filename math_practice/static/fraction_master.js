// Fraction Master Game JavaScript

class FractionMaster {
    constructor() {
        this.currentLevel = 1;
        this.maxLevel = 8;
        this.score = 0;
        this.streak = 0;
        this.questionsCompleted = 0;
        this.questionsPerLevel = 10;
        this.currentProblem = null;
        this.levelStats = {
            correct: 0,
            incorrect: 0,
            hints: 0,
            skips: 0
        };

        this.levels = {
            1: { name: "Simplify Fractions", type: "simplify", description: "Simplify fractions to their lowest terms" },
            2: { name: "Add Fractions", type: "add_same", description: "Add fractions with the same denominator" },
            3: { name: "Subtract Fractions", type: "subtract_same", description: "Subtract fractions with the same denominator" },
            4: { name: "Add Different Denominators", type: "add_different", description: "Add fractions with different denominators" },
            5: { name: "Subtract Different Denominators", type: "subtract_different", description: "Subtract fractions with different denominators" },
            6: { name: "Multiply Fractions", type: "multiply", description: "Multiply fractions together" },
            7: { name: "Divide Fractions", type: "divide", description: "Divide fractions" },
            8: { name: "Mixed Operations", type: "mixed", description: "Mixed fraction operations" }
        };

        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }

    initializeElements() {
        this.elements = {
            currentLevel: document.getElementById('currentLevel'),
            score: document.getElementById('score'),
            streak: document.getElementById('streak'),
            levelDescription: document.getElementById('levelDescription'),
            progressBar: document.getElementById('progressBar'),
            progressText: document.getElementById('progressText'),
            questionText: document.getElementById('questionText'),
            fractionDisplay: document.getElementById('fractionDisplay'),
            numeratorInput: document.getElementById('numeratorInput'),
            denominatorInput: document.getElementById('denominatorInput'),
            submitAnswer: document.getElementById('submitAnswer'),
            fractionVisual: document.getElementById('fractionVisual'),
            newProblem: document.getElementById('newProblem'),
            showHint: document.getElementById('showHint'),
            skipProblem: document.getElementById('skipProblem'),
            hintDisplay: document.getElementById('hintDisplay'),
            feedback: document.getElementById('feedback'),
            levelCompleteModal: document.getElementById('levelCompleteModal'),
            levelStats: document.getElementById('levelStats'),
            nextLevel: document.getElementById('nextLevel'),
            restartLevel: document.getElementById('restartLevel'),
            gameCompleteModal: document.getElementById('gameCompleteModal'),
            finalStats: document.getElementById('finalStats'),
            playAgain: document.getElementById('playAgain'),
            backToHome: document.getElementById('backToHome')
        };
    }

    bindEvents() {
        this.elements.submitAnswer.addEventListener('click', () => this.submitAnswer());
        this.elements.newProblem.addEventListener('click', () => this.generateNewProblem());
        this.elements.showHint.addEventListener('click', () => this.showHint());
        this.elements.skipProblem.addEventListener('click', () => this.skipProblem());
        this.elements.nextLevel.addEventListener('click', () => this.nextLevel());
        this.elements.restartLevel.addEventListener('click', () => this.restartLevel());
        this.elements.playAgain.addEventListener('click', () => this.resetGame());
        this.elements.backToHome.addEventListener('click', () => window.location.href = '/');

        // Enter key support
        [this.elements.numeratorInput, this.elements.denominatorInput].forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.submitAnswer();
                }
            });
        });
    }

    updateDisplay() {
        this.elements.currentLevel.textContent = this.currentLevel;
        this.elements.score.textContent = this.score;
        this.elements.streak.textContent = this.streak;
        this.elements.levelDescription.textContent = this.levels[this.currentLevel].description;
        
        const progress = (this.questionsCompleted / this.questionsPerLevel) * 100;
        this.elements.progressBar.style.width = `${progress}%`;
        this.elements.progressText.textContent = `${this.questionsCompleted}/${this.questionsPerLevel}`;
    }

    generateNewProblem() {
        const levelType = this.levels[this.currentLevel].type;
        
        switch (levelType) {
            case 'simplify':
                this.currentProblem = this.generateSimplifyProblem();
                break;
            case 'add_same':
                this.currentProblem = this.generateAddSameDenomProblem();
                break;
            case 'subtract_same':
                this.currentProblem = this.generateSubtractSameDenomProblem();
                break;
            case 'add_different':
                this.currentProblem = this.generateAddDifferentDenomProblem();
                break;
            case 'subtract_different':
                this.currentProblem = this.generateSubtractDifferentDenomProblem();
                break;
            case 'multiply':
                this.currentProblem = this.generateMultiplyProblem();
                break;
            case 'divide':
                this.currentProblem = this.generateDivideProblem();
                break;
            case 'mixed':
                this.currentProblem = this.generateMixedProblem();
                break;
        }

        this.displayProblem();
        this.clearInputs();
        this.clearFeedback();
        this.hideHint();
    }

    generateSimplifyProblem() {
        // Generate a fraction that can be simplified
        const commonFactors = [2, 3, 4, 5, 6];
        const factor = commonFactors[Math.floor(Math.random() * commonFactors.length)];
        const baseNum = Math.floor(Math.random() * 8) + 2;
        const baseDen = Math.floor(Math.random() * 8) + 3;
        
        const numerator = baseNum * factor;
        const denominator = baseDen * factor;
        
        const gcd = this.findGCD(numerator, denominator);
        const simplifiedNum = numerator / gcd;
        const simplifiedDen = denominator / gcd;

        return {
            type: 'simplify',
            question: `Simplify this fraction:`,
            numerator: numerator,
            denominator: denominator,
            answerNum: simplifiedNum,
            answerDen: simplifiedDen,
            hint: `Find the greatest common factor of ${numerator} and ${denominator}. The GCD is ${gcd}.`
        };
    }

    generateAddSameDenomProblem() {
        const denominator = Math.floor(Math.random() * 8) + 3;
        const num1 = Math.floor(Math.random() * (denominator - 1)) + 1;
        const num2 = Math.floor(Math.random() * (denominator - num1)) + 1;
        
        const answerNum = num1 + num2;
        const gcd = this.findGCD(answerNum, denominator);
        const simplifiedNum = answerNum / gcd;
        const simplifiedDen = denominator / gcd;

        return {
            type: 'add_same',
            question: `Add these fractions:`,
            fraction1: { num: num1, den: denominator },
            fraction2: { num: num2, den: denominator },
            answerNum: simplifiedNum,
            answerDen: simplifiedDen,
            hint: `When denominators are the same, just add the numerators: ${num1} + ${num2} = ${answerNum}/${denominator}`
        };
    }

    generateSubtractSameDenomProblem() {
        const denominator = Math.floor(Math.random() * 8) + 3;
        const num1 = Math.floor(Math.random() * (denominator - 1)) + 2;
        const num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
        
        const answerNum = num1 - num2;
        const gcd = this.findGCD(answerNum, denominator);
        const simplifiedNum = answerNum / gcd;
        const simplifiedDen = denominator / gcd;

        return {
            type: 'subtract_same',
            question: `Subtract these fractions:`,
            fraction1: { num: num1, den: denominator },
            fraction2: { num: num2, den: denominator },
            answerNum: simplifiedNum,
            answerDen: simplifiedDen,
            hint: `When denominators are the same, just subtract the numerators: ${num1} - ${num2} = ${answerNum}/${denominator}`
        };
    }

    generateAddDifferentDenomProblem() {
        const den1 = Math.floor(Math.random() * 6) + 2;
        const den2 = Math.floor(Math.random() * 6) + 2;
        const num1 = Math.floor(Math.random() * (den1 - 1)) + 1;
        const num2 = Math.floor(Math.random() * (den2 - 1)) + 1;
        
        const lcm = this.findLCM(den1, den2);
        const newNum1 = num1 * (lcm / den1);
        const newNum2 = num2 * (lcm / den2);
        const answerNum = newNum1 + newNum2;
        
        const gcd = this.findGCD(answerNum, lcm);
        const simplifiedNum = answerNum / gcd;
        const simplifiedDen = lcm / gcd;

        return {
            type: 'add_different',
            question: `Add these fractions:`,
            fraction1: { num: num1, den: den1 },
            fraction2: { num: num2, den: den2 },
            answerNum: simplifiedNum,
            answerDen: simplifiedDen,
            hint: `Find common denominator: LCM of ${den1} and ${den2} is ${lcm}. Convert to ${newNum1}/${lcm} + ${newNum2}/${lcm}`
        };
    }

    generateSubtractDifferentDenomProblem() {
        const den1 = Math.floor(Math.random() * 6) + 2;
        const den2 = Math.floor(Math.random() * 6) + 2;
        const num1 = Math.floor(Math.random() * (den1 - 1)) + 2;
        const num2 = Math.floor(Math.random() * (den2 - 1)) + 1;
        
        const lcm = this.findLCM(den1, den2);
        const newNum1 = num1 * (lcm / den1);
        const newNum2 = num2 * (lcm / den2);
        
        // Ensure positive result
        if (newNum1 <= newNum2) {
            const temp = { num: num1, den: den1 };
            num1 = num2;
            den1 = den2;
            num2 = temp.num;
            den2 = temp.den;
        }
        
        const answerNum = newNum1 - newNum2;
        const gcd = this.findGCD(answerNum, lcm);
        const simplifiedNum = answerNum / gcd;
        const simplifiedDen = lcm / gcd;

        return {
            type: 'subtract_different',
            question: `Subtract these fractions:`,
            fraction1: { num: num1, den: den1 },
            fraction2: { num: num2, den: den2 },
            answerNum: simplifiedNum,
            answerDen: simplifiedDen,
            hint: `Find common denominator: LCM of ${den1} and ${den2} is ${lcm}`
        };
    }

    generateMultiplyProblem() {
        const num1 = Math.floor(Math.random() * 5) + 1;
        const den1 = Math.floor(Math.random() * 5) + 2;
        const num2 = Math.floor(Math.random() * 5) + 1;
        const den2 = Math.floor(Math.random() * 5) + 2;
        
        const answerNum = num1 * num2;
        const answerDen = den1 * den2;
        
        const gcd = this.findGCD(answerNum, answerDen);
        const simplifiedNum = answerNum / gcd;
        const simplifiedDen = answerDen / gcd;

        return {
            type: 'multiply',
            question: `Multiply these fractions:`,
            fraction1: { num: num1, den: den1 },
            fraction2: { num: num2, den: den2 },
            answerNum: simplifiedNum,
            answerDen: simplifiedDen,
            hint: `Multiply numerators and denominators: (${num1} × ${num2})/(${den1} × ${den2}) = ${answerNum}/${answerDen}`
        };
    }

    generateDivideProblem() {
        const num1 = Math.floor(Math.random() * 5) + 1;
        const den1 = Math.floor(Math.random() * 5) + 2;
        const num2 = Math.floor(Math.random() * 5) + 1;
        const den2 = Math.floor(Math.random() * 5) + 2;
        
        // Flip second fraction and multiply
        const answerNum = num1 * den2;
        const answerDen = den1 * num2;
        
        const gcd = this.findGCD(answerNum, answerDen);
        const simplifiedNum = answerNum / gcd;
        const simplifiedDen = answerDen / gcd;

        return {
            type: 'divide',
            question: `Divide these fractions:`,
            fraction1: { num: num1, den: den1 },
            fraction2: { num: num2, den: den2 },
            answerNum: simplifiedNum,
            answerDen: simplifiedDen,
            hint: `Flip the second fraction and multiply: ${num1}/${den1} × ${den2}/${num2} = ${answerNum}/${answerDen}`
        };
    }

    generateMixedProblem() {
        const operations = ['add_different', 'subtract_different', 'multiply', 'divide'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        switch (operation) {
            case 'add_different': return this.generateAddDifferentDenomProblem();
            case 'subtract_different': return this.generateSubtractDifferentDenomProblem();
            case 'multiply': return this.generateMultiplyProblem();
            case 'divide': return this.generateDivideProblem();
        }
    }

    displayProblem() {
        this.elements.questionText.textContent = this.currentProblem.question;
        
        let displayHTML = '';
        
        if (this.currentProblem.type === 'simplify') {
            displayHTML = this.createFractionHTML(this.currentProblem.numerator, this.currentProblem.denominator);
        } else {
            const operator = this.getOperatorSymbol(this.currentProblem.type);
            displayHTML = `
                ${this.createFractionHTML(this.currentProblem.fraction1.num, this.currentProblem.fraction1.den)}
                <span style="margin: 0 20px; font-size: 0.8em; vertical-align: middle;">${operator}</span>
                ${this.createFractionHTML(this.currentProblem.fraction2.num, this.currentProblem.fraction2.den)}
                <span style="margin: 0 20px; font-size: 0.8em; vertical-align: middle;">=</span>
                <span style="color: #ccc;">?</span>
            `;
        }
        
        this.elements.fractionDisplay.innerHTML = displayHTML;
        this.createVisualFraction();
    }

    createFractionHTML(numerator, denominator) {
        return `
            <div class="fraction" style="display: inline-block; text-align: center; margin: 0 10px; vertical-align: middle;">
                <div class="numerator" style="border-bottom: 3px solid #667eea; padding-bottom: 5px; margin-bottom: 5px;">${numerator}</div>
                <div class="denominator" style="padding-top: 5px;">${denominator}</div>
            </div>
        `;
    }

    getOperatorSymbol(type) {
        switch (type) {
            case 'add_same':
            case 'add_different':
                return '+';
            case 'subtract_same':
            case 'subtract_different':
                return '−';
            case 'multiply':
                return '×';
            case 'divide':
                return '÷';
            default:
                return '';
        }
    }

    createVisualFraction() {
        this.elements.fractionVisual.innerHTML = '';
        
        if (this.currentProblem.type === 'simplify') {
            this.createVisualForFraction(this.currentProblem.numerator, this.currentProblem.denominator);
        } else if (this.currentProblem.fraction1) {
            this.createVisualForFraction(this.currentProblem.fraction1.num, this.currentProblem.fraction1.den);
        }
    }

    createVisualForFraction(numerator, denominator) {
        if (denominator > 20) return; // Too many parts to visualize
        
        this.elements.fractionVisual.innerHTML = '';
        
        for (let i = 0; i < denominator; i++) {
            const part = document.createElement('div');
            part.className = `visual-part ${i < numerator ? 'filled' : 'unfilled'}`;
            this.elements.fractionVisual.appendChild(part);
        }
    }

    submitAnswer() {
        const userNum = parseInt(this.elements.numeratorInput.value);
        const userDen = parseInt(this.elements.denominatorInput.value);
        
        if (isNaN(userNum) || isNaN(userDen) || userDen === 0) {
            this.showFeedback('Please enter valid numbers (denominator cannot be 0)', 'incorrect');
            return;
        }
        
        const isCorrect = userNum === this.currentProblem.answerNum && userDen === this.currentProblem.answerDen;
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer(userNum, userDen);
        }
    }

    handleCorrectAnswer() {
        this.score += 10 + this.streak;
        this.streak++;
        this.questionsCompleted++;
        this.levelStats.correct++;
        
        this.showFeedback('Correct! Well done! 🎉', 'correct');
        this.elements.fractionDisplay.classList.add('bounce');
        
        setTimeout(() => {
            this.elements.fractionDisplay.classList.remove('bounce');
            if (this.questionsCompleted >= this.questionsPerLevel) {
                this.completeLevel();
            } else {
                this.generateNewProblem();
            }
        }, 1500);
        
        this.updateDisplay();
    }

    handleIncorrectAnswer(userNum, userDen) {
        this.streak = 0;
        this.levelStats.incorrect++;
        
        const correctAnswer = `${this.currentProblem.answerNum}/${this.currentProblem.answerDen}`;
        this.showFeedback(`Incorrect. The correct answer is ${correctAnswer}`, 'incorrect');
        
        this.elements.fractionDisplay.classList.add('shake');
        setTimeout(() => {
            this.elements.fractionDisplay.classList.remove('shake');
        }, 500);
        
        this.updateDisplay();
    }

    showHint() {
        this.elements.hintDisplay.innerHTML = `💡 ${this.currentProblem.hint}`;
        this.elements.hintDisplay.style.display = 'block';
        this.elements.hintDisplay.classList.add('fade-in');
        this.levelStats.hints++;
    }

    hideHint() {
        this.elements.hintDisplay.style.display = 'none';
        this.elements.hintDisplay.classList.remove('fade-in');
    }

    skipProblem() {
        this.questionsCompleted++;
        this.levelStats.skips++;
        this.streak = 0;
        
        const correctAnswer = `${this.currentProblem.answerNum}/${this.currentProblem.answerDen}`;
        this.showFeedback(`Skipped. The answer was ${correctAnswer}`, 'neutral');
        
        setTimeout(() => {
            if (this.questionsCompleted >= this.questionsPerLevel) {
                this.completeLevel();
            } else {
                this.generateNewProblem();
            }
        }, 2000);
        
        this.updateDisplay();
    }

    completeLevel() {
        const accuracy = Math.round((this.levelStats.correct / this.questionsPerLevel) * 100);
        
        this.elements.levelStats.innerHTML = `
            <div><strong>Level ${this.currentLevel} Complete!</strong></div>
            <div>Correct: ${this.levelStats.correct}/${this.questionsPerLevel}</div>
            <div>Accuracy: ${accuracy}%</div>
            <div>Score Earned: ${this.score}</div>
            <div>Hints Used: ${this.levelStats.hints}</div>
            <div>Problems Skipped: ${this.levelStats.skips}</div>
        `;
        
        if (this.currentLevel >= this.maxLevel) {
            this.completeGame();
        } else {
            this.elements.levelCompleteModal.style.display = 'flex';
        }
    }

    completeGame() {
        this.elements.finalStats.innerHTML = `
            <div><strong>Game Complete!</strong></div>
            <div>Final Score: ${this.score}</div>
            <div>Levels Completed: ${this.maxLevel}</div>
            <div>You've mastered fractions!</div>
        `;
        
        this.elements.gameCompleteModal.style.display = 'flex';
    }

    nextLevel() {
        this.currentLevel++;
        this.questionsCompleted = 0;
        this.resetLevelStats();
        this.elements.levelCompleteModal.style.display = 'none';
        this.updateDisplay();
        this.generateNewProblem();
    }

    restartLevel() {
        this.questionsCompleted = 0;
        this.resetLevelStats();
        this.elements.levelCompleteModal.style.display = 'none';
        this.updateDisplay();
        this.generateNewProblem();
    }

    resetGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.streak = 0;
        this.questionsCompleted = 0;
        this.resetLevelStats();
        this.elements.gameCompleteModal.style.display = 'none';
        this.updateDisplay();
        this.clearInputs();
        this.clearFeedback();
        this.elements.questionText.textContent = "Click 'New Problem' to start!";
        this.elements.fractionDisplay.innerHTML = '';
    }

    resetLevelStats() {
        this.levelStats = {
            correct: 0,
            incorrect: 0,
            hints: 0,
            skips: 0
        };
    }

    clearInputs() {
        this.elements.numeratorInput.value = '';
        this.elements.denominatorInput.value = '';
    }

    clearFeedback() {
        this.elements.feedback.innerHTML = '';
        this.elements.feedback.className = 'feedback';
    }

    showFeedback(message, type) {
        this.elements.feedback.innerHTML = message;
        this.elements.feedback.className = `feedback ${type}`;
    }

    // Utility functions
    findGCD(a, b) {
        while (b !== 0) {
            const temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    findLCM(a, b) {
        return Math.abs(a * b) / this.findGCD(a, b);
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FractionMaster();
});