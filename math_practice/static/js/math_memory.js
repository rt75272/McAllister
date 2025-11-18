// Game state
let gameState = {
    isPlaying: false,
    difficulty: 'easy',
    gameMode: 'addition',
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    startTime: null,
    timer: null,
    canFlip: true
};

// DOM elements
const elements = {
    gameBoard: document.getElementById('game-board'),
    matches: document.getElementById('matches'),
    moves: document.getElementById('moves'),
    timer: document.getElementById('timer'),
    startScreen: document.getElementById('start-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    startBtn: document.getElementById('start-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    difficultySelect: document.getElementById('difficulty'),
    gameModeSelect: document.getElementById('game-mode'),
    finalStats: document.getElementById('final-stats')
};

// Generate math problems based on difficulty and mode
function generateMathProblems(difficulty, mode) {
    const problems = [];
    let maxNum;
    
    switch(difficulty) {
        case 'easy': maxNum = 12; break;
        case 'medium': maxNum = 25; break;
        case 'hard': maxNum = 50; break;
    }
    
    // Generate 8 unique problems
    for (let i = 0; i < 8; i++) {
        let num1, num2, operation, answer, problemText;
        
        do {
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * maxNum) + 1;
            
            switch(mode) {
                case 'addition':
                    operation = '+';
                    answer = num1 + num2;
                    break;
                case 'subtraction':
                    // Ensure positive results
                    if (num2 > num1) [num1, num2] = [num2, num1];
                    operation = '−';
                    answer = num1 - num2;
                    break;
                case 'multiplication':
                    // Keep numbers smaller for multiplication
                    num1 = Math.floor(Math.random() * Math.min(maxNum / 2, 12)) + 1;
                    num2 = Math.floor(Math.random() * Math.min(maxNum / 2, 12)) + 1;
                    operation = '×';
                    answer = num1 * num2;
                    break;
                case 'mixed':
                    const operations = ['+', '−', '×'];
                    operation = operations[Math.floor(Math.random() * operations.length)];
                    
                    if (operation === '+') {
                        answer = num1 + num2;
                    } else if (operation === '−') {
                        if (num2 > num1) [num1, num2] = [num2, num1];
                        answer = num1 - num2;
                    } else { // multiplication
                        num1 = Math.floor(Math.random() * Math.min(maxNum / 2, 12)) + 1;
                        num2 = Math.floor(Math.random() * Math.min(maxNum / 2, 12)) + 1;
                        answer = num1 * num2;
                    }
                    break;
            }
            
            problemText = `${num1} ${operation} ${num2}`;
            
        } while (problems.some(p => p.problem === problemText || p.answer === answer));
        
        problems.push({
            problem: problemText,
            answer: answer,
            id: i
        });
    }
    
    return problems;
}

// Create card pairs
function createCards(problems) {
    const cards = [];
    
    // Create problem cards and answer cards
    problems.forEach((prob, index) => {
        // Problem card
        cards.push({
            id: `problem-${index}`,
            content: prob.problem,
            type: 'problem',
            pairId: index,
            isFlipped: false,
            isMatched: false
        });
        
        // Answer card
        cards.push({
            id: `answer-${index}`,
            content: prob.answer.toString(),
            type: 'answer',
            pairId: index,
            isFlipped: false,
            isMatched: false
        });
    });
    
    // Shuffle cards
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    
    return cards;
}

// Render the game board
function renderBoard() {
    elements.gameBoard.innerHTML = '';
    
    gameState.cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'memory-card';
        cardElement.dataset.cardId = card.id;
        
        if (card.isFlipped) cardElement.classList.add('flipped');
        if (card.isMatched) cardElement.classList.add('matched');
        
        cardElement.innerHTML = `
            <div class="card-back">🧠</div>
            <div class="card-front">${card.content}</div>
        `;
        
        cardElement.addEventListener('click', () => flipCard(card.id));
        elements.gameBoard.appendChild(cardElement);
    });
}

// Flip a card
function flipCard(cardId) {
    if (!gameState.canFlip || !gameState.isPlaying) return;
    
    const card = gameState.cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    
    // Flip the card
    card.isFlipped = true;
    gameState.flippedCards.push(card);
    
    renderBoard();
    
    // Check for matches when 2 cards are flipped
    if (gameState.flippedCards.length === 2) {
        gameState.canFlip = false;
        gameState.moves++;
        updateDisplay();
        
        setTimeout(() => {
            checkMatch();
        }, 1000);
    }
}

// Check if flipped cards match
function checkMatch() {
    const [card1, card2] = gameState.flippedCards;
    const isMatch = card1.pairId === card2.pairId;
    
    if (isMatch) {
        // Match found
        card1.isMatched = true;
        card2.isMatched = true;
        gameState.matchedPairs++;
        
        // Add matched class
        const card1Element = document.querySelector(`[data-card-id="${card1.id}"]`);
        const card2Element = document.querySelector(`[data-card-id="${card2.id}"]`);
        card1Element.classList.add('matched');
        card2Element.classList.add('matched');
        
        // Check for game completion
        if (gameState.matchedPairs === 8) {
            setTimeout(() => endGame(), 500);
        }
    } else {
        // No match - flip cards back
        const card1Element = document.querySelector(`[data-card-id="${card1.id}"]`);
        const card2Element = document.querySelector(`[data-card-id="${card2.id}"]`);
        
        card1Element.classList.add('wrong');
        card2Element.classList.add('wrong');
        
        setTimeout(() => {
            card1.isFlipped = false;
            card2.isFlipped = false;
            card1Element.classList.remove('wrong');
            card2Element.classList.remove('wrong');
            renderBoard();
        }, 1000);
    }
    
    gameState.flippedCards = [];
    gameState.canFlip = true;
    updateDisplay();
}

// Update display elements
function updateDisplay() {
    elements.matches.textContent = `${gameState.matchedPairs} / 8`;
    elements.moves.textContent = gameState.moves;
    
    if (gameState.startTime) {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        elements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Start game
function startGame() {
    gameState = {
        isPlaying: true,
        difficulty: elements.difficultySelect.value,
        gameMode: elements.gameModeSelect.value,
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        startTime: Date.now(),
        timer: null,
        canFlip: true
    };
    
    // Generate problems and create cards
    const problems = generateMathProblems(gameState.difficulty, gameState.gameMode);
    gameState.cards = createCards(problems);
    
    elements.startScreen.classList.add('hidden');
    elements.gameOverScreen.classList.add('hidden');
    
    // Start timer
    gameState.timer = setInterval(updateDisplay, 1000);
    
    renderBoard();
    updateDisplay();
}

// End game
function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.timer);
    
    const totalTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Calculate performance rating
    let rating = 'Good job!';
    if (gameState.moves <= 16) rating = 'Excellent memory!';
    else if (gameState.moves <= 24) rating = 'Great work!';
    else if (gameState.moves <= 32) rating = 'Nice effort!';
    
    // Show final stats
    elements.finalStats.innerHTML = `
        <h4>🏆 Memory Master!</h4>
        <p><strong>Completion Time:</strong> ${timeString}</p>
        <p><strong>Total Moves:</strong> ${gameState.moves}</p>
        <p><strong>Efficiency:</strong> ${Math.round((16 / gameState.moves) * 100)}%</p>
        <p><strong>Difficulty:</strong> ${gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1)}</p>
        <p><strong>Operations:</strong> ${gameState.gameMode === 'mixed' ? 'Mixed' : gameState.gameMode.charAt(0).toUpperCase() + gameState.gameMode.slice(1)}</p>
        <p><strong>Rating:</strong> ${rating}</p>
    `;
    
    elements.gameOverScreen.classList.remove('hidden');
}

// Event listeners
elements.startBtn.addEventListener('click', startGame);
elements.playAgainBtn.addEventListener('click', () => {
    elements.gameOverScreen.classList.add('hidden');
    elements.startScreen.classList.remove('hidden');
});

// Initialize display
updateDisplay();