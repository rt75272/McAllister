// Game state
let gameState = {
    isPlaying: false,
    timeLeft: 60,
    score: 0,
    streak: 0,
    maxStreak: 0,
    currentQuestion: null,
    currentAnswer: null,
    difficulty: 'easy',
    totalQuestions: 0,
    correctAnswers: 0,
    timer: null
};

// DOM elements
const elements = {
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    streak: document.getElementById('streak'),
    question: document.getElementById('question'),
    answerInput: document.getElementById('answer-input'),
    submitBtn: document.getElementById('submit-btn'),
    feedback: document.getElementById('feedback'),
    startScreen: document.getElementById('start-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    startBtn: document.getElementById('start-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    difficultySelect: document.getElementById('difficulty'),
    finalStats: document.getElementById('final-stats'),
    progressBar: document.getElementById('progress-bar')
};

// Generate random math problem based on difficulty
function generateProblem(difficulty) {
    let num1, num2, operation, answer;
    const operations = ['+', '-', '×', '÷'];
    
    switch(difficulty) {
        case 'easy':
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            break;
        case 'medium':
            num1 = Math.floor(Math.random() * 50) + 1;
            num2 = Math.floor(Math.random() * 25) + 1;
            break;
        case 'hard':
            num1 = Math.floor(Math.random() * 100) + 1;
            num2 = Math.floor(Math.random() * 50) + 1;
            break;
    }
    
    operation = operations[Math.floor(Math.random() * operations.length)];
    
    // Ensure subtraction doesn't go negative and division is clean
    if (operation === '-' && num2 > num1) {
        [num1, num2] = [num2, num1];
    }
    
    if (operation === '÷') {
        // Make sure division results in a whole number
        answer = Math.floor(Math.random() * 20) + 1;
        num1 = answer * num2;
    }
    
    switch(operation) {
        case '+':
            answer = num1 + num2;
            break;
        case '-':
            answer = num1 - num2;
            break;
        case '×':
            answer = num1 * num2;
            break;
        case '÷':
            // answer already calculated above
            break;
    }
    
    return {
        question: `${num1} ${operation} ${num2}`,
        answer: answer
    };
}

// Display new question
function showNewQuestion() {
    const problem = generateProblem(gameState.difficulty);
    gameState.currentQuestion = problem.question;
    gameState.currentAnswer = problem.answer;
    gameState.totalQuestions++;
    
    elements.question.textContent = problem.question;
    elements.answerInput.value = '';
    elements.answerInput.focus();
    elements.feedback.textContent = '';
    elements.feedback.className = 'feedback';
}

// Check answer
function checkAnswer() {
    const userAnswer = parseFloat(elements.answerInput.value);
    const correct = userAnswer === gameState.currentAnswer;
    
    if (correct) {
        gameState.score += 10 + (gameState.streak * 2); // Bonus points for streak
        gameState.streak++;
        gameState.correctAnswers++;
        gameState.maxStreak = Math.max(gameState.maxStreak, gameState.streak);
        
        elements.feedback.textContent = '✓ Correct!';
        elements.feedback.className = 'feedback correct';
        
        // Bonus time for streak
        if (gameState.streak >= 5) {
            gameState.timeLeft += 2;
            elements.feedback.textContent = '✓ Correct! +2 bonus seconds!';
        }
    } else {
        gameState.streak = 0;
        elements.feedback.textContent = `✗ Wrong! Answer was ${gameState.currentAnswer}`;
        elements.feedback.className = 'feedback incorrect';
    }
    
    updateDisplay();
    
    // Show next question after a brief delay
    setTimeout(() => {
        if (gameState.isPlaying) {
            showNewQuestion();
        }
    }, 1000);
}

// Update display elements
function updateDisplay() {
    elements.timer.textContent = gameState.timeLeft;
    elements.score.textContent = gameState.score;
    elements.streak.textContent = gameState.streak;
    
    // Update progress bar
    const progress = ((60 - gameState.timeLeft) / 60) * 100;
    elements.progressBar.style.width = `${progress}%`;
}

// Start game
function startGame() {
    gameState = {
        isPlaying: true,
        timeLeft: 60,
        score: 0,
        streak: 0,
        maxStreak: 0,
        currentQuestion: null,
        currentAnswer: null,
        difficulty: elements.difficultySelect.value,
        totalQuestions: 0,
        correctAnswers: 0,
        timer: null
    };
    
    elements.startScreen.classList.add('hidden');
    elements.gameOverScreen.classList.add('hidden');
    elements.answerInput.disabled = false;
    elements.submitBtn.disabled = false;
    
    // Start timer
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateDisplay();
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    
    updateDisplay();
    showNewQuestion();
}

// End game
function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timer);
    
    elements.answerInput.disabled = true;
    elements.submitBtn.disabled = true;
    
    // Calculate accuracy
    const accuracy = gameState.totalQuestions > 0 ? 
        Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100) : 0;
    
    // Show final stats
    elements.finalStats.innerHTML = `
        <h4>🏆 Your Results</h4>
        <p><strong>Final Score:</strong> ${gameState.score} points</p>
        <p><strong>Questions Answered:</strong> ${gameState.totalQuestions}</p>
        <p><strong>Correct Answers:</strong> ${gameState.correctAnswers}</p>
        <p><strong>Accuracy:</strong> ${accuracy}%</p>
        <p><strong>Best Streak:</strong> ${gameState.maxStreak}</p>
        <p><strong>Difficulty:</strong> ${gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1)}</p>
    `;
    
    elements.gameOverScreen.classList.remove('hidden');
}

// Event listeners
elements.startBtn.addEventListener('click', startGame);
elements.playAgainBtn.addEventListener('click', () => {
    elements.gameOverScreen.classList.add('hidden');
    elements.startScreen.classList.remove('hidden');
});

elements.submitBtn.addEventListener('click', () => {
    if (gameState.isPlaying && elements.answerInput.value.trim() !== '') {
        checkAnswer();
    }
});

elements.answerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && gameState.isPlaying && elements.answerInput.value.trim() !== '') {
        checkAnswer();
    }
});

// Auto-focus input when page loads
window.addEventListener('load', () => {
    elements.answerInput.focus();
});

// Prevent form submission
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});