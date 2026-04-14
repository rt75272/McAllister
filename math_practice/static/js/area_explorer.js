/**
 * Area Explorer – a multi-level shape-area game.
 *
 * Levels:
 *   1  Rectangles
 *   2  Squares
 *   3  Triangles
 *   4  Parallelograms
 *   5  Trapezoids
 *   6  Circles
 *   7  Composite shapes (L-shapes, T-shapes)
 *   8  Mixed review
 *
 * Each level has 8 questions. Answers are rounded to 1 decimal place for
 * circles; whole numbers for everything else.
 */
class AreaExplorer {
    constructor() {
        this.currentLevel = 1;
        this.score = 0;
        this.streak = 0;
        this.questionsCompleted = 0;
        this.questionsPerLevel = 8;
        this.totalLevels = 8;
        this.currentAnswer = 0;
        this.currentHint = '';
        this.levelStats = { correct: 0, incorrect: 0, hints: 0, skips: 0 };

        this.levels = {
            1: { type: 'rectangle',      name: 'Level 1: Rectangles',       desc: 'Find the area of rectangles. Area = length × width.' },
            2: { type: 'square',          name: 'Level 2: Squares',          desc: 'Find the area of squares. Area = side × side.' },
            3: { type: 'triangle',        name: 'Level 3: Triangles',        desc: 'Find the area of triangles. Area = ½ × base × height.' },
            4: { type: 'parallelogram',   name: 'Level 4: Parallelograms',   desc: 'Find the area of parallelograms. Area = base × height.' },
            5: { type: 'trapezoid',       name: 'Level 5: Trapezoids',       desc: 'Find the area of trapezoids. Area = ½ × (base₁ + base₂) × height.' },
            6: { type: 'circle',          name: 'Level 6: Circles',          desc: 'Find the area of circles. Area = π × r². Round to 1 decimal.' },
            7: { type: 'composite',       name: 'Level 7: Composite Shapes', desc: 'Find the area of L-shapes and T-shapes made from rectangles.' },
            8: { type: 'mixed',           name: 'Level 8: Mixed Review',     desc: 'A mix of all shapes you have learned!' }
        };

        this.canvas = document.getElementById('shape-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Allow Enter key to submit
        document.getElementById('answer-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });

        this.updateDisplay();
        this.generateProblem();
    }

    /* ── Random helpers ── */
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /* ── Problem generators ── */
    generateProblem() {
        const level = this.levels[this.currentLevel];
        let type = level.type;

        if (type === 'mixed') {
            const types = ['rectangle', 'square', 'triangle', 'parallelogram', 'trapezoid', 'circle', 'composite'];
            type = types[this.randInt(0, types.length - 1)];
        }

        switch (type) {
            case 'rectangle':      this.genRectangle(); break;
            case 'square':         this.genSquare(); break;
            case 'triangle':       this.genTriangle(); break;
            case 'parallelogram':  this.genParallelogram(); break;
            case 'trapezoid':      this.genTrapezoid(); break;
            case 'circle':         this.genCircle(); break;
            case 'composite':      this.genComposite(); break;
        }

        document.getElementById('answer-input').value = '';
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';
        document.getElementById('answer-input').focus();
    }

    /* ── Rectangle ── */
    genRectangle() {
        const w = this.randInt(3, 14);
        const h = this.randInt(2, 10);
        this.currentAnswer = w * h;
        this.currentHint = `Area = length × width = ${w} × ${h}`;
        document.getElementById('question-text').textContent = 'What is the area of this rectangle?';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawRectangle(w, h);
    }

    /* ── Square ── */
    genSquare() {
        const s = this.randInt(2, 12);
        this.currentAnswer = s * s;
        this.currentHint = `Area = side × side = ${s} × ${s}`;
        document.getElementById('question-text').textContent = 'What is the area of this square?';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawSquare(s);
    }

    /* ── Triangle ── */
    genTriangle() {
        const base = this.randInt(3, 14);
        const height = this.randInt(2, 10);
        this.currentAnswer = (base * height) / 2;
        this.currentHint = `Area = ½ × base × height = ½ × ${base} × ${height}`;
        document.getElementById('question-text').textContent = 'What is the area of this triangle?';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawTriangle(base, height);
    }

    /* ── Parallelogram ── */
    genParallelogram() {
        const base = this.randInt(4, 14);
        const height = this.randInt(2, 10);
        this.currentAnswer = base * height;
        this.currentHint = `Area = base × height = ${base} × ${height}`;
        document.getElementById('question-text').textContent = 'What is the area of this parallelogram?';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawParallelogram(base, height);
    }

    /* ── Trapezoid ── */
    genTrapezoid() {
        const b1 = this.randInt(4, 12);
        const b2 = this.randInt(3, 10);
        const h  = this.randInt(3, 8);
        this.currentAnswer = ((b1 + b2) * h) / 2;
        this.currentHint = `Area = ½ × (b₁ + b₂) × h = ½ × (${b1} + ${b2}) × ${h}`;
        document.getElementById('question-text').textContent = 'What is the area of this trapezoid?';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawTrapezoid(b1, b2, h);
    }

    /* ── Circle ── */
    genCircle() {
        const r = this.randInt(2, 10);
        this.currentAnswer = Math.round(Math.PI * r * r * 10) / 10;
        this.currentHint = `Area = π × r² = π × ${r}² ≈ ${this.currentAnswer}`;
        document.getElementById('question-text').textContent = 'What is the area of this circle? (Round to 1 decimal place, use π ≈ 3.14159)';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawCircle(r);
    }

    /* ── Composite (L-shape or T-shape) ── */
    genComposite() {
        if (Math.random() < 0.5) {
            this.genLShape();
        } else {
            this.genTShape();
        }
    }

    genLShape() {
        const w1 = this.randInt(3, 7);
        const h1 = this.randInt(5, 10);
        const w2 = this.randInt(3, 7);
        const h2 = this.randInt(2, 4);
        this.currentAnswer = (w1 * h1) + (w2 * h2);
        this.currentHint = `Split into two rectangles: (${w1} × ${h1}) + (${w2} × ${h2})`;
        document.getElementById('question-text').textContent = 'What is the total area of this L-shape?';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawLShape(w1, h1, w2, h2);
    }

    genTShape() {
        const topW = this.randInt(6, 12);
        const topH = this.randInt(2, 4);
        const stemW = this.randInt(2, Math.min(5, topW - 1));
        const stemH = this.randInt(3, 7);
        this.currentAnswer = (topW * topH) + (stemW * stemH);
        this.currentHint = `Split into two rectangles: top (${topW} × ${topH}) + stem (${stemW} × ${stemH})`;
        document.getElementById('question-text').textContent = 'What is the total area of this T-shape?';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawTShape(topW, topH, stemW, stemH);
    }

    /* ──────────── Drawing Methods ──────────── */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getScale(maxDim) {
        // Fit the shape nicely inside the canvas with padding
        const available = Math.min(this.canvas.width, this.canvas.height) - 100;
        return Math.min(available / maxDim, 30);
    }

    drawLabel(text, x, y) {
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillStyle = '#333';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x, y);
    }

    drawDimensionLine(x1, y1, x2, y2, label, offset) {
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);

        // Offset direction
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / len * offset, ny = dx / len * offset;

        ctx.beginPath();
        ctx.moveTo(x1 + nx, y1 + ny);
        ctx.lineTo(x2 + nx, y2 + ny);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow ticks
        const tickLen = 6;
        ctx.beginPath();
        ctx.moveTo(x1 + nx - ny / len * tickLen, y1 + ny + nx / len * tickLen);
        ctx.lineTo(x1 + nx + ny / len * tickLen, y1 + ny - nx / len * tickLen);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2 + nx - ny / len * tickLen, y2 + ny + nx / len * tickLen);
        ctx.lineTo(x2 + nx + ny / len * tickLen, y2 + ny - nx / len * tickLen);
        ctx.stroke();

        // Label
        const mx = (x1 + x2) / 2 + nx + nx * 0.5;
        const my = (y1 + y2) / 2 + ny + ny * 0.5;
        ctx.font = 'bold 15px Arial';
        ctx.fillStyle = '#2563eb';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, mx, my);
        ctx.restore();
    }

    drawRectangle(w, h) {
        this.clearCanvas();
        const scale = this.getScale(Math.max(w, h));
        const pw = w * scale, ph = h * scale;
        const x = (this.canvas.width - pw) / 2;
        const y = (this.canvas.height - ph) / 2;

        this.ctx.fillStyle = '#a7f3d0';
        this.ctx.strokeStyle = '#059669';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.rect(x, y, pw, ph);
        this.ctx.fill();
        this.ctx.stroke();

        // Labels
        this.drawDimensionLine(x, y + ph, x + pw, y + ph, `${w}`, 20);
        this.drawDimensionLine(x + pw, y + ph, x + pw, y, `${h}`, 20);
    }

    drawSquare(s) {
        this.clearCanvas();
        const scale = this.getScale(s);
        const ps = s * scale;
        const x = (this.canvas.width - ps) / 2;
        const y = (this.canvas.height - ps) / 2;

        this.ctx.fillStyle = '#bfdbfe';
        this.ctx.strokeStyle = '#2563eb';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.rect(x, y, ps, ps);
        this.ctx.fill();
        this.ctx.stroke();

        // Right-angle marker
        const m = 12;
        this.ctx.strokeStyle = '#2563eb';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + ps - m, y + ps);
        this.ctx.lineTo(x + ps - m, y + ps - m);
        this.ctx.lineTo(x + ps, y + ps - m);
        this.ctx.stroke();

        this.drawDimensionLine(x, y + ps, x + ps, y + ps, `${s}`, 20);
        this.drawDimensionLine(x + ps, y + ps, x + ps, y, `${s}`, 20);
    }

    drawTriangle(base, height) {
        this.clearCanvas();
        const scale = this.getScale(Math.max(base, height));
        const pb = base * scale, ph = height * scale;
        const startX = (this.canvas.width - pb) / 2;
        const startY = (this.canvas.height + ph) / 2;

        this.ctx.fillStyle = '#fde68a';
        this.ctx.strokeStyle = '#d97706';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);                     // bottom-left
        this.ctx.lineTo(startX + pb, startY);                // bottom-right
        this.ctx.lineTo(startX + pb / 2, startY - ph);      // top
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Dashed height line
        this.ctx.save();
        this.ctx.strokeStyle = '#92400e';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([5, 3]);
        this.ctx.beginPath();
        this.ctx.moveTo(startX + pb / 2, startY);
        this.ctx.lineTo(startX + pb / 2, startY - ph);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.restore();

        // Labels
        this.drawDimensionLine(startX, startY, startX + pb, startY, `${base}`, 22);
        this.drawLabel(`h = ${height}`, startX + pb / 2 - 40, startY - ph / 2);
    }

    drawParallelogram(base, height) {
        this.clearCanvas();
        const scale = this.getScale(Math.max(base + 3, height));
        const pb = base * scale, ph = height * scale;
        const skew = 2.5 * scale;
        const startX = (this.canvas.width - pb - skew) / 2;
        const startY = (this.canvas.height + ph) / 2;

        this.ctx.fillStyle = '#c4b5fd';
        this.ctx.strokeStyle = '#7c3aed';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(startX + pb, startY);
        this.ctx.lineTo(startX + pb + skew, startY - ph);
        this.ctx.lineTo(startX + skew, startY - ph);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Height line (dashed)
        this.ctx.save();
        this.ctx.strokeStyle = '#5b21b6';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([5, 3]);
        this.ctx.beginPath();
        this.ctx.moveTo(startX + skew, startY);
        this.ctx.lineTo(startX + skew, startY - ph);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.restore();

        this.drawDimensionLine(startX, startY, startX + pb, startY, `${base}`, 22);
        this.drawLabel(`h = ${height}`, startX + skew - 42, startY - ph / 2);
    }

    drawTrapezoid(b1, b2, h) {
        this.clearCanvas();
        const scale = this.getScale(Math.max(b1, b2, h));
        const pb1 = b1 * scale, pb2 = b2 * scale, ph = h * scale;
        const cx = this.canvas.width / 2;
        const bottomY = (this.canvas.height + ph) / 2;
        const topY = bottomY - ph;

        this.ctx.fillStyle = '#fbcfe8';
        this.ctx.strokeStyle = '#db2777';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - pb1 / 2, bottomY);       // bottom-left
        this.ctx.lineTo(cx + pb1 / 2, bottomY);       // bottom-right
        this.ctx.lineTo(cx + pb2 / 2, topY);          // top-right
        this.ctx.lineTo(cx - pb2 / 2, topY);          // top-left
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Height
        const hx = cx - pb1 / 2 - 5;
        this.ctx.save();
        this.ctx.strokeStyle = '#9d174d';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([5, 3]);
        this.ctx.beginPath();
        this.ctx.moveTo(hx, bottomY);
        this.ctx.lineTo(hx, topY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.restore();

        this.drawDimensionLine(cx - pb1 / 2, bottomY, cx + pb1 / 2, bottomY, `b₁ = ${b1}`, 22);
        this.drawDimensionLine(cx - pb2 / 2, topY, cx + pb2 / 2, topY, `b₂ = ${b2}`, -20);
        this.drawLabel(`h = ${h}`, hx - 35, (bottomY + topY) / 2);
    }

    drawCircle(r) {
        this.clearCanvas();
        const scale = this.getScale(r * 2);
        const pr = r * scale;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        this.ctx.fillStyle = '#fed7aa';
        this.ctx.strokeStyle = '#ea580c';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, pr, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Radius line
        this.ctx.strokeStyle = '#c2410c';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(cx + pr, cy);
        this.ctx.stroke();

        // Dot at center
        this.ctx.fillStyle = '#c2410c';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        this.ctx.fill();

        this.drawLabel(`r = ${r}`, cx + pr / 2, cy - 16);
    }

    drawLShape(w1, h1, w2, h2) {
        this.clearCanvas();
        const scale = this.getScale(Math.max(w1 + w2, h1));
        const pw1 = w1 * scale, ph1 = h1 * scale;
        const pw2 = w2 * scale, ph2 = h2 * scale;
        const startX = (this.canvas.width - (pw1 + pw2)) / 2;
        const startY = (this.canvas.height - ph1) / 2;

        this.ctx.fillStyle = '#bbf7d0';
        this.ctx.strokeStyle = '#16a34a';
        this.ctx.lineWidth = 3;

        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(startX + pw1, startY);
        this.ctx.lineTo(startX + pw1, startY + ph1 - ph2);
        this.ctx.lineTo(startX + pw1 + pw2, startY + ph1 - ph2);
        this.ctx.lineTo(startX + pw1 + pw2, startY + ph1);
        this.ctx.lineTo(startX, startY + ph1);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Dashed split line
        this.ctx.save();
        this.ctx.strokeStyle = '#15803d';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([5, 3]);
        this.ctx.beginPath();
        this.ctx.moveTo(startX + pw1, startY + ph1 - ph2);
        this.ctx.lineTo(startX + pw1, startY + ph1);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.restore();

        // Dimension labels
        this.drawLabel(`${w1}`, startX + pw1 / 2, startY - 14);
        this.drawLabel(`${h1}`, startX - 18, startY + ph1 / 2);
        this.drawLabel(`${w2}`, startX + pw1 + pw2 / 2, startY + ph1 + 18);
        this.drawLabel(`${h2}`, startX + pw1 + pw2 + 18, startY + ph1 - ph2 / 2);
    }

    drawTShape(topW, topH, stemW, stemH) {
        this.clearCanvas();
        const scale = this.getScale(Math.max(topW, topH + stemH));
        const ptw = topW * scale, pth = topH * scale;
        const psw = stemW * scale, psh = stemH * scale;
        const cx = this.canvas.width / 2;
        const startY = (this.canvas.height - pth - psh) / 2;

        this.ctx.fillStyle = '#ddd6fe';
        this.ctx.strokeStyle = '#7c3aed';
        this.ctx.lineWidth = 3;

        this.ctx.beginPath();
        this.ctx.moveTo(cx - ptw / 2, startY);
        this.ctx.lineTo(cx + ptw / 2, startY);
        this.ctx.lineTo(cx + ptw / 2, startY + pth);
        this.ctx.lineTo(cx + psw / 2, startY + pth);
        this.ctx.lineTo(cx + psw / 2, startY + pth + psh);
        this.ctx.lineTo(cx - psw / 2, startY + pth + psh);
        this.ctx.lineTo(cx - psw / 2, startY + pth);
        this.ctx.lineTo(cx - ptw / 2, startY + pth);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Dashed split line
        this.ctx.save();
        this.ctx.strokeStyle = '#6d28d9';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([5, 3]);
        this.ctx.beginPath();
        this.ctx.moveTo(cx - psw / 2, startY + pth);
        this.ctx.lineTo(cx + psw / 2, startY + pth);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.restore();

        // Labels
        this.drawLabel(`${topW}`, cx, startY - 14);
        this.drawLabel(`${topH}`, cx - ptw / 2 - 20, startY + pth / 2);
        this.drawLabel(`${stemW}`, cx, startY + pth + psh + 18);
        this.drawLabel(`${stemH}`, cx + psw / 2 + 22, startY + pth + psh / 2);
    }

    /* ──────────── Answer Handling ──────────── */
    submitAnswer() {
        const input = document.getElementById('answer-input');
        const raw = input.value.trim();
        if (raw === '') return;

        const userAnswer = parseFloat(raw);
        if (isNaN(userAnswer)) {
            this.showFeedback('Please enter a number.', 'incorrect');
            return;
        }

        // Accept answer within 0.2 tolerance (for rounding on circles)
        if (Math.abs(userAnswer - this.currentAnswer) <= 0.2) {
            this.handleCorrect();
        } else {
            this.handleIncorrect();
        }
    }

    handleCorrect() {
        this.score += 10 + this.streak * 2;
        this.streak++;
        this.questionsCompleted++;
        this.levelStats.correct++;
        this.showFeedback('✅ Correct! Great job!', 'correct');
        this.animateElement('shape-canvas', 'bounce');
        this.updateDisplay();

        if (this.questionsCompleted >= this.questionsPerLevel) {
            setTimeout(() => this.completeLevel(), 800);
        } else {
            setTimeout(() => this.generateProblem(), 1200);
        }
    }

    handleIncorrect() {
        this.streak = 0;
        this.levelStats.incorrect++;
        this.showFeedback(`❌ Not quite. The answer is ${this.currentAnswer}. Try the next one!`, 'incorrect');
        this.animateElement('answer-input', 'shake');
        this.updateDisplay();
        setTimeout(() => this.generateProblem(), 2200);
    }

    showHint() {
        this.levelStats.hints++;
        this.showFeedback(`💡 Hint: ${this.currentHint}`, 'hint');
    }

    skipProblem() {
        this.levelStats.skips++;
        this.showFeedback(`⏭ Skipped. The answer was ${this.currentAnswer}.`, 'hint');
        this.questionsCompleted++;
        this.updateDisplay();

        if (this.questionsCompleted >= this.questionsPerLevel) {
            setTimeout(() => this.completeLevel(), 800);
        } else {
            setTimeout(() => this.generateProblem(), 1200);
        }
    }

    showFeedback(text, type) {
        const el = document.getElementById('feedback');
        el.textContent = text;
        el.className = `feedback ${type}`;
    }

    animateElement(id, cls) {
        const el = document.getElementById(id);
        el.classList.remove(cls);
        void el.offsetWidth; // trigger reflow
        el.classList.add(cls);
    }

    /* ──────────── Level / Game Flow ──────────── */
    completeLevel() {
        const { correct, incorrect, hints, skips } = this.levelStats;
        const statsText = `Correct: ${correct} | Incorrect: ${incorrect} | Hints: ${hints} | Skips: ${skips}`;

        if (this.currentLevel >= this.totalLevels) {
            document.getElementById('game-complete-stats').textContent =
                `Final Score: ${this.score}\n${statsText}`;
            document.getElementById('game-complete-modal').classList.add('show');
        } else {
            document.getElementById('level-complete-stats').textContent = statsText;
            document.getElementById('level-complete-modal').classList.add('show');
        }
    }

    nextLevel() {
        document.getElementById('level-complete-modal').classList.remove('show');
        this.currentLevel++;
        this.questionsCompleted = 0;
        this.levelStats = { correct: 0, incorrect: 0, hints: 0, skips: 0 };
        this.updateDisplay();
        this.generateProblem();
    }

    resetGame() {
        document.getElementById('game-complete-modal').classList.remove('show');
        this.currentLevel = 1;
        this.score = 0;
        this.streak = 0;
        this.questionsCompleted = 0;
        this.levelStats = { correct: 0, incorrect: 0, hints: 0, skips: 0 };
        this.updateDisplay();
        this.generateProblem();
    }

    /* ──────────── UI Updates ──────────── */
    updateDisplay() {
        document.getElementById('level-display').textContent = this.currentLevel;
        document.getElementById('score-display').textContent = this.score;
        document.getElementById('streak-display').textContent = `${this.streak} 🔥`;

        const level = this.levels[this.currentLevel];
        document.getElementById('level-name').textContent = level.name;
        document.getElementById('level-desc').textContent = level.desc;

        const pct = (this.questionsCompleted / this.questionsPerLevel) * 100;
        document.getElementById('progress-bar').style.width = `${pct}%`;
        document.getElementById('progress-text').textContent =
            `${this.questionsCompleted} / ${this.questionsPerLevel}`;
    }
}
