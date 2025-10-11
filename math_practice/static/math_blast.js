const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let problems = [];
let score = 0;
let lives = 3;
let level = 1;
let userSpeedMultiplier = 1.0; // User-controlled speed multiplier

// Calculate difficulty level based on score
function getDifficultyLevel() {
    return Math.floor(score / 50) + 1; // Level increases every 50 points
}

// Get speed multiplier based on level and user setting
function getSpeedMultiplier() {
    const baseSpeed = 0.3; // Very slow starting speed
    const speedIncrease = 0.15; // Speed increase per level
    const maxSpeed = 2.0; // Maximum speed cap
    const calculatedSpeed = baseSpeed + (level - 1) * speedIncrease;
    const levelSpeed = Math.min(calculatedSpeed, maxSpeed);
    // Apply user speed multiplier
    return levelSpeed * userSpeedMultiplier;
}

// Generate a random math problem
function randomProblem() {
    // Update level based on current score
    level = getDifficultyLevel();
    // Adjust number range based on level for increased difficulty
    const maxNumber = Math.min(5 + level * 2, 15); // Start with 1-7, max at 1-15
    let a = Math.floor(Math.random() * maxNumber) + 1;
    let b = Math.floor(Math.random() * maxNumber) + 1;
    let op = ["+", "-", "*"][Math.floor(Math.random() * 3)];
    // Ensure subtraction doesn't result in negative numbers for early levels
    if (op === "-" && level < 3 && a < b) {
        [a, b] = [b, a]; // Swap to ensure positive result
    }
    let ans = eval(a + op + b);
    // Calculate speed based on difficulty level
    const baseSpeed = getSpeedMultiplier();
    const speedVariation = 0.3; // Small random variation
    const finalSpeed = baseSpeed + (Math.random() * speedVariation);
    return {
        x: Math.random() * 760, 
        y: 0, 
        text: `${a}${op}${b}`, 
        ans: ans, 
        speed: finalSpeed
    };
}

// Spawn a problem every 2 seconds
setInterval(() => { problems.push(randomProblem()); }, 2000);

// Update game screen
function update() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // Draw ground with gradient
    const gradient = ctx.createLinearGradient(0, 580, 0, 600);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.4)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0,580,800,20);
    // Draw problems with enhanced styling
    problems.forEach((p,i)=>{
        p.y += p.speed;
        // Add shadow effect
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        // Use gradient for text
        const textGradient = ctx.createLinearGradient(p.x, p.y-20, p.x, p.y+20);
        textGradient.addColorStop(0, "#FFD700");
        textGradient.addColorStop(1, "#FFA500");
        ctx.fillStyle = textGradient;
        ctx.font = "bold 24px 'Segoe UI', Arial, sans-serif";
        ctx.fillText(p.text, p.x, p.y);
        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        // If problem hits the ground
        if(p.y>570){
            problems.splice(i,1);
            lives--;
            document.getElementById("lives").innerText="Lives: "+lives;
            if(lives<=0){
                alert("Game Over! Final Score: "+score);
                problems=[];
                lives=3;
                score=0;
                level=1;
                document.getElementById("score").innerText="Score: "+score;
                document.getElementById("lives").innerText="Lives: "+lives;
                document.getElementById("level").innerText="Level: "+level;
            }
        }
    });
}

// Shooting mechanic: type answer + Enter
document.getElementById("answerInput").addEventListener("keydown", e=>{
    if(e.key==="Enter"){
        let val = parseInt(e.target.value);
        for(let i=0;i<problems.length;i++){
            if(problems[i].ans===val){
                problems.splice(i,1);
                score+=10;
                document.getElementById("score").innerText="Score: "+score;
                // Update level display if level changed
                const newLevel = getDifficultyLevel();
            if (newLevel !== level) {
                level = newLevel;
                document.getElementById("level").innerText="Level: "+level;
            }
            break;
            }
        }
    e.target.value="";
  }
});

// Auto-focus the input when page loads
window.addEventListener('load', () => {
    document.getElementById("answerInput").focus();
    initializeSpeedControls();
});

// Initialize speed control functionality
function initializeSpeedControls() {
    const speedSlider = document.getElementById('speedSlider');
    const speedDisplay = document.getElementById('speedDisplay');
    const resetSpeedBtn = document.getElementById('resetSpeed');
    
    // Update speed when slider changes
    speedSlider.addEventListener('input', function() {
        userSpeedMultiplier = parseFloat(this.value);
        speedDisplay.textContent = userSpeedMultiplier.toFixed(1) + 'x';
        
        // Update existing problems with new speed
        problems.forEach(problem => {
            problem.speed = getSpeedMultiplier();
        });
    });
    
    // Reset speed to default
    resetSpeedBtn.addEventListener('click', function() {
        userSpeedMultiplier = 1.0;
        speedSlider.value = '1.0';
        speedDisplay.textContent = '1.0x';
        
        // Update existing problems with new speed
        problems.forEach(problem => {
            problem.speed = getSpeedMultiplier();
        });
    });
    
    // Initialize display
    speedDisplay.textContent = userSpeedMultiplier.toFixed(1) + 'x';
}

// Add keyboard shortcuts for speed control
document.addEventListener('keydown', function(e) {
    // Only trigger if the answer input is not focused
    if (document.activeElement !== document.getElementById('answerInput')) {
        const speedSlider = document.getElementById('speedSlider');
        const currentSpeed = parseFloat(speedSlider.value);
        
        switch(e.key) {
            case 'ArrowUp':
            case '+':
                // Increase speed
                e.preventDefault();
                if (currentSpeed < 3.0) {
                    const newSpeed = Math.min(currentSpeed + 0.1, 3.0);
                    speedSlider.value = newSpeed.toFixed(1);
                    speedSlider.dispatchEvent(new Event('input'));
                }
                break;
                
            case 'ArrowDown':
            case '-':
                // Decrease speed
                e.preventDefault();
                if (currentSpeed > 0.5) {
                    const newSpeed = Math.max(currentSpeed - 0.1, 0.5);
                    speedSlider.value = newSpeed.toFixed(1);
                    speedSlider.dispatchEvent(new Event('input'));
                }
                break;
                
            case 'r':
            case 'R':
                // Reset speed
                e.preventDefault();
                document.getElementById('resetSpeed').click();
                break;
        }
    }
});

// Game loop
setInterval(update, 30);