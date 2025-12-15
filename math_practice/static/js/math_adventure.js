document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('map-canvas');
    const ctx = canvas.getContext('2d');
    const player = document.getElementById('player');
    const locationName = document.getElementById('location-name');
    const locationDescription = document.getElementById('location-description');
    const locationProgress = document.getElementById('location-progress');

    const problemModal = document.getElementById('problem-modal');
    const problemText = document.getElementById('problem-text');
    const answerInput = document.getElementById('answer-input');
    const submitAnswerBtn = document.getElementById('submit-answer-btn');
    const feedback = document.getElementById('feedback');

    const victoryModal = document.getElementById('victory-modal');
    const playAgainBtn = document.getElementById('play-again-btn');

    const startModal = document.getElementById('start-modal');
    const startBtn = document.getElementById('start-game-btn');
    const difficultySelectorStart = document.getElementById('difficulty-start');
    const characterSelectorStart = document.getElementById('character-start');
    const gameContainer = document.getElementById('game-container');
    const startChallengeBtn = document.getElementById('start-challenge-btn');
    const pathModal = document.getElementById('path-modal');
    const pathOptions = document.getElementById('path-options');

    const gameData = {
        locations: [
            { name: "Starting Village", description: "A quiet village where your journey begins.", x: 10, y: 50, icon: '🏡' },
            { name: "Whispering Woods", description: "A forest shrouded in mist and secrets.", x: 25, y: 30, icon: '🌲' },
            { name: "Goblin Bridge", description: "A rickety bridge guarded by a grumpy goblin.", x: 40, y: 70, icon: '🌉' },
            { name: "Crystal Caves", description: "Caves that glitter with precious gems.", x: 55, y: 40, icon: '💎' },
            { name: "Dragon's Peak", description: "A fiery mountain, home to a fearsome dragon.", x: 70, y: 80, icon: '🐲' },
            { name: "Enchanted Lake", description: "A serene lake with magical properties.", x: 85, y: 20, icon: '🏞️' },
            { name: "Castle of Triumph", description: "Your final destination! The ultimate prize awaits.", x: 95, y: 50, icon: '🏰' }
        ],
        edges: [],
        currentLocationIndex: 0,
        currentProblem: null,
        difficulty: 'easy', // Default difficulty
        character: 'knight'
    };

    let isAnswerLocked = false;

    function applyCharacter() {
        const choice = gameData.character;

        if (choice === 'knight') {
            player.classList.remove('player-emoji');
            player.textContent = '';
            return;
        }

        const emojiCharacters = {
            wizard: '🧙‍♂️',
            ninja: '🥷',
            astronaut: '🧑‍🚀'
        };

        player.classList.add('player-emoji');
        player.textContent = emojiCharacters[choice] || '🙂';
    }

    function generatePaths() {
        const n = gameData.locations.length;
        if (n !== 7) {
            // Fallback: simple linear path
            return Array.from({ length: n }, (_, i) => (i < n - 1 ? [i + 1] : []));
        }

        // A few safe templates that always move forward and always reach the end.
        const templates = [
            // 0 -> (1 or 2) -> 3 -> (4 or 5) -> 6
            [[1, 2], [3], [3], [4, 5], [6], [6], []],
            // 0 -> (1 or 2); 1 -> (3 or 4); 2 -> 4; (3 or 4) -> 5 -> 6
            [[1, 2], [3, 4], [4], [5], [5], [6], []],
            // 0 -> (1 or 2); 1 -> 3; 2 -> 4; (3 or 4) -> 5 -> 6
            [[1, 2], [3], [4], [5], [5], [6], []]
        ];

        const chosen = templates[Math.floor(Math.random() * templates.length)];
        // Clone to avoid accidental mutation of template arrays
        return chosen.map((arr) => arr.slice());
    }

    function initGame() {
        gameData.currentLocationIndex = 0;
        gameData.edges = generatePaths();
        gameContainer.classList.remove('hidden');
        startModal.classList.add('hidden');
        pathModal.classList.add('hidden');
        problemModal.classList.add('hidden');
        victoryModal.classList.add('hidden');
        applyCharacter();
        startChallengeBtn.textContent = "Start Challenge";
        startChallengeBtn.disabled = false;
        resizeCanvas();
        drawMap();
        updatePlayerPosition(false); // Don't trigger challenge on init
        updateGameInfo();
    }

    function resizeCanvas() {
        const container = document.getElementById('map-container');
        if (!container) return;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawMap();
        updatePlayerPosition(false); // Don't trigger challenge on resize
    }

    function drawMap() {
        const { locations, edges } = gameData;
        const container = document.getElementById('map-container');
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;

        ctx.clearRect(0, 0, width, height);

        // Draw paths (branching)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        for (let from = 0; from < locations.length; from++) {
            const nexts = edges[from] || [];
            for (const to of nexts) {
                const start = locations[from];
                const end = locations[to];
                ctx.moveTo(start.x / 100 * width, start.y / 100 * height);
                ctx.lineTo(end.x / 100 * width, end.y / 100 * height);
            }
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw locations
        locations.forEach((loc, index) => {
            const x = loc.x / 100 * width;
            const y = loc.y / 100 * height;

            // Node circle
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, 2 * Math.PI);
            ctx.fillStyle = index === gameData.currentLocationIndex ? '#00aaff' : '#555';
            ctx.fill();
            ctx.strokeStyle = '#f0f0f0';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Location icon
            ctx.font = '24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(loc.icon, x, y);
        });
    }

    function updatePlayerPosition(_triggerChallenge = true) {
        const currentLocation = gameData.locations[gameData.currentLocationIndex];
        const container = document.getElementById('map-container');
        if (!container) return;

        player.style.left = `${currentLocation.x}%`;
        player.style.top = `${currentLocation.y}%`;

        drawMap(); // Redraw map to update highlighted location
        startChallengeBtn.disabled = false;

        if (gameData.currentLocationIndex >= gameData.locations.length - 1) {
            // Reached the end
            startChallengeBtn.disabled = true;
            startChallengeBtn.textContent = "Journey Complete!";
            setTimeout(showVictory, 1000);
        }
    }

    function startChallenge() {
        if (gameData.currentLocationIndex < gameData.locations.length - 1) {
            isAnswerLocked = false;
            submitAnswerBtn.disabled = false;
            answerInput.disabled = false;
            generateProblem();
            problemModal.classList.remove('hidden');
            answerInput.focus();
            startChallengeBtn.disabled = true;
        }
    }

    function generateProblem() {
        const difficulty = gameData.difficulty;
        let num1, num2, operator, problem, answer;

        switch (difficulty) {
            case 'hard':
                num1 = Math.floor(Math.random() * 100) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                const operatorsHard = ['+', '-', '*', '/'];
                operator = operatorsHard[Math.floor(Math.random() * operatorsHard.length)];
                if (operator === '/') {
                    // Ensure division results in an integer
                    num1 = num1 * num2;
                }
                break;
            case 'medium':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 25) + 1;
                const operatorsMedium = ['+', '-', '*'];
                operator = operatorsMedium[Math.floor(Math.random() * operatorsMedium.length)];
                break;
            case 'easy':
            default:
                num1 = Math.floor(Math.random() * 20) + 1;
                num2 = Math.floor(Math.random() * 10) + 1;
                operator = '+';
                break;
        }

        problem = `${num1} ${operator} ${num2}`;
        answer = Math.round(eval(problem)); // Use eval carefully, but safe here.

        gameData.currentProblem = { problem, answer };
        problemText.textContent = problem;
        feedback.textContent = '';
        answerInput.value = '';
    }

    function moveToLocation(nextIndex) {
        gameData.currentLocationIndex = nextIndex;
        updateGameInfo();
        updatePlayerPosition();
    }

    function getNextOptions() {
        return (gameData.edges[gameData.currentLocationIndex] || []).slice();
    }

    function showPathChoice(options) {
        pathOptions.innerHTML = '';
        pathModal.classList.remove('hidden');

        let choiceLocked = false;

        options.forEach((idx) => {
            const loc = gameData.locations[idx];
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'path-option-btn';
            btn.textContent = `${loc.icon} ${loc.name}`;

            btn.addEventListener('click', () => {
                if (choiceLocked) return;
                choiceLocked = true;

                Array.from(pathOptions.querySelectorAll('button')).forEach((b) => {
                    b.disabled = true;
                });

                pathModal.classList.add('hidden');
                moveToLocation(idx);
            });

            pathOptions.appendChild(btn);
        });
    }

    function checkAnswer() {
        if (isAnswerLocked) return;

        const raw = answerInput.value.trim();
        if (raw === '') return;

        const userAnswer = Number(raw);
        if (!Number.isFinite(userAnswer)) return;

        if (userAnswer === gameData.currentProblem.answer) {
            isAnswerLocked = true;
            submitAnswerBtn.disabled = true;
            answerInput.disabled = true;

            feedback.textContent = "Correct! Moving to the next location...";
            feedback.style.color = '#28a745';
            setTimeout(() => {
                problemModal.classList.add('hidden');
                const options = getNextOptions();
                if (options.length === 1) {
                    moveToLocation(options[0]);
                } else if (options.length > 1) {
                    showPathChoice(options);
                } else {
                    // No outgoing paths means we're effectively done.
                    showVictory();
                }
            }, 1500);
        } else {
            feedback.textContent = "Not quite, try again!";
            feedback.style.color = '#dc3545';
            answerInput.value = '';
        }
    }

    function updateGameInfo() {
        const currentLocation = gameData.locations[gameData.currentLocationIndex];
        locationName.textContent = currentLocation.name;
        locationDescription.textContent = currentLocation.description;
        locationProgress.textContent = `${gameData.currentLocationIndex + 1}/${gameData.locations.length}`;
    }

    function showVictory() {
        victoryModal.classList.remove('hidden');
    }

    function resetGame() {
        gameData.currentLocationIndex = 0;
        victoryModal.classList.add('hidden');
        pathModal.classList.add('hidden');
        problemModal.classList.add('hidden');
        startModal.classList.remove('hidden');
        gameContainer.classList.add('hidden');
        startChallengeBtn.textContent = "Start Challenge";
        // No need to call updateGameInfo or updatePlayerPosition here
        // as the game is effectively reset and waiting for the user to start again.
    }

    // Event Listeners
    window.addEventListener('resize', resizeCanvas);

    submitAnswerBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });

    playAgainBtn.addEventListener('click', resetGame);

    startBtn.addEventListener('click', () => {
        gameData.difficulty = difficultySelectorStart.value;
        gameData.character = characterSelectorStart ? characterSelectorStart.value : 'knight';
        initGame();
    });

    startChallengeBtn.addEventListener('click', startChallenge);

    // Initial setup is now triggered by the start button, so no calls here.
});
