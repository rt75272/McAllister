document.addEventListener('DOMContentLoaded', () => {
    // Game State
    let maxHP = 100;
    let currentHP = 100;
    let currentQuestion = {};
    let bossLevel = 1;
    let playerDamage = 20;

    // Elements
    const bossHealthBar = document.getElementById('boss-health-bar');
    const bossHPText = document.getElementById('boss-hp');
    const bossMaxHPText = document.getElementById('boss-max-hp');
    const mathProblemText = document.getElementById('math-problem');
    const answerInput = document.getElementById('answer-input');
    const attackBtn = document.getElementById('attack-btn');
    const feedbackMsg = document.getElementById('feedback-msg');
    const battleLog = document.getElementById('battle-log');
    const bossSprite = document.getElementById('boss-sprite');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const restartBtn = document.getElementById('restart-btn');
    const storyText = document.getElementById('story-text');
    const playerLevelText = document.getElementById('player-level');

    // Boss Data
    const bosses = [
        { name: "Goblin Thief", icon: "👺", hp: 100 },
        { name: "Orc Warlord", icon: "👹", hp: 200 },
        { name: "Dark Wizard", icon: "🧙‍♂️", hp: 300 },
        { name: "Ancient Dragon", icon: "🐉", hp: 500 }
    ];

    function initGame() {
        bossLevel = 1;
        loadBoss();
        generateQuestion();
        updateUI();
        log("Welcome to the dungeon! Defeat the monsters with your math skills!");
    }

    function loadBoss() {
        const bossIndex = (bossLevel - 1) % bosses.length;
        const boss = bosses[bossIndex];
        
        // Scale HP with level loops
        const difficultyMultiplier = Math.floor((bossLevel - 1) / bosses.length) + 1;
        
        maxHP = boss.hp * difficultyMultiplier;
        currentHP = maxHP;
        
        document.getElementById('boss-name').textContent = boss.name + (difficultyMultiplier > 1 ? ` (Rank ${difficultyMultiplier})` : "");
        bossSprite.textContent = boss.icon;
        playerLevelText.textContent = bossLevel;
        updateHealthUI();
    }

    function generateQuestion() {
        const type = Math.floor(Math.random() * 3); // 0, 1, 2
        let qText = "";
        let answer = 0;
        
        // Difficulty scaling
        let maxNum = 100 + (bossLevel * 50);

        if (type === 0) {
            // Find Part: What is X% of Y?
            const percent = Math.floor(Math.random() * 20) * 5; // 0, 5, 10... 95
            const total = Math.floor(Math.random() * (maxNum/10)) * 10;
            if (total === 0) total = 10;
            
            qText = `What is ${percent}% of ${total}?`;
            answer = (percent / 100) * total;
        } else if (type === 1) {
            // Find Percent: X is what % of Y?
            const percent = Math.floor(Math.random() * 20 + 1) * 5; // Ensure non-zero
            const total = Math.floor(Math.random() * (maxNum/10)) * 10;
            if (total === 0) { total = 100; }
            const part = (percent / 100) * total;
            
            qText = `${part} is what % of ${total}?`;
            answer = percent;
        } else {
            // Word Problem
            const percent = Math.floor(Math.random() * 10 + 1) * 10; // 10, 20... 100
            const total = Math.floor(Math.random() * (maxNum/5)) * 5; 
             if (total === 0) total = 50;
            const isDiscount = Math.random() > 0.5;

            if (isDiscount) {
                const discount = (percent / 100) * total;
                qText = `A potion costs ${total} gold. Currently it is ${percent}% off. How much is the discount?`;
                answer = discount;
            } else {
                const tax = (percent / 100) * total;
                qText = `You find ${total} gems. The tax collector takes ${percent}%. How many gems do they take?`;
                answer = tax;
            }
        }
        
        // Round to 2 decimals to avoid floating point weirdness
        currentQuestion = {
            text: qText,
            answer: parseFloat(answer.toFixed(2))
        };
        
        mathProblemText.textContent = currentQuestion.text;
        answerInput.value = '';
        answerInput.focus();
    }

    function checkAnswer() {
        const userVal = parseFloat(answerInput.value);
        
        if (isNaN(userVal)) {
            feedbackMsg.textContent = "Enter a valid number!";
            return;
        }

        // Allow small margin of error for float stuff
        if (Math.abs(userVal - currentQuestion.answer) < 0.01) {
            // Correct
            handleHit();
        } else {
            // Incorrect
            handleMiss();
        }
    }

    function handleHit() {
        feedbackMsg.textContent = "";
        feedbackMsg.style.color = "green";
        
        // Crit Chance?
        let dmg = playerDamage + Math.floor(Math.random() * 10);
        const isCrit = Math.random() < 0.2;
        if (isCrit) {
            dmg *= 2;
            log(`CRITICAL HIT! You dealt ${dmg} damage!`, "player-hit");
        } else {
            log(`You strike for ${dmg} damage!`, "player-hit");
        }

        currentHP -= dmg;
        if (currentHP < 0) currentHP = 0;

        // Animate Boss
        bossSprite.classList.add('hit');
        setTimeout(() => bossSprite.classList.remove('hit'), 500);

        updateHealthUI();

        if (currentHP <= 0) {
            handleVictory();
        } else {
            generateQuestion();
        }
    }

    function handleMiss() {
        feedbackMsg.textContent = "Miss!";
        feedbackMsg.style.color = "red";
        
        // Don't reveal the answer immediately, let them try again?
        // Or generate new question?
        // User request didn't specify. I'll stick to revealing for learning, but maybe add a penalty.
        log(`You missed! Try again!`, "player-miss"); 

        bossSprite.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0)' }
        ], { duration: 200 });

        answerInput.value = '';
        answerInput.focus();
    }

    function updateHealthUI() {
        const percent = (currentHP / maxHP) * 100;
        bossHealthBar.style.width = `${percent}%`;
        bossHPText.textContent = currentHP;
        bossMaxHPText.textContent = maxHP;
        
        if (percent < 30) {
            bossHealthBar.style.background = "red";
        } else if (percent < 60) {
            bossHealthBar.style.background = "orange"; // Fallback if css gradient isn't working or logic needs override
        } else {
             // Keep CSS gradient or reset
             bossHealthBar.style.background = "linear-gradient(90deg, #ff4e50, #f9d423)";
        }
    }

    function handleVictory() {
        bossSprite.classList.add('defeated');
        log(`The ${document.getElementById('boss-name').textContent} is defeated!`, "boss-defeat");
        
        setTimeout(() => {
            modalTitle.textContent = "Victory!";
            modalMessage.textContent = `You have defeated the enemy and proceed deeper into the dungeon!`;
            restartBtn.textContent = "Next Level";
            modalOverlay.classList.add('active');
        }, 1000);
    }

    function nextLevel() {
        modalOverlay.classList.remove('active');
        bossSprite.classList.remove('defeated');
        bossLevel++;
        loadBoss();
        generateQuestion();
        log(`Level ${bossLevel}: A new challenger approaches!`);
    }

    function log(msg, type="") {
        const div = document.createElement('div');
        div.textContent = `> ${msg}`;
        div.className = `log-entry ${type}`;
        battleLog.prepend(div);
    }

    function updateUI() {
        // Initial UI Update
        updateHealthUI();
    }

    // Event Listeners
    attackBtn.addEventListener('click', checkAnswer);
    
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });

    restartBtn.addEventListener('click', () => {
        nextLevel();
    });

    // Start
    initGame();
});
