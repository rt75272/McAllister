/**
 * Area Explorer – a multi-level shape-area game with difficulty settings.
 *
 * Difficulty:
 *   Easy   – small whole numbers, basic shapes (rect, square, triangle)
 *   Medium – larger whole numbers + simple decimals, all shapes
 *   Hard   – decimals & fractions, all shapes, tighter tolerance
 *
 * Levels per difficulty:
 *   Easy   (5 levels): Rectangles → Squares → Triangles → Parallelograms → Mixed
 *   Medium (7 levels): + Trapezoids, Circles, Mixed
 *   Hard   (8 levels): + Composite shapes
 *
 * Each level has 8 questions.
 */
class AreaExplorer {
    constructor() {
        this.difficulty = null;      // set when user picks
        this.currentLevel = 1;
        this.score = 0;
        this.streak = 0;
        this.questionsCompleted = 0;
        this.questionsPerLevel = 8;
        this.totalLevels = 8;
        this.currentAnswer = 0;
        this.currentHint = '';
        this.levelStats = { correct: 0, incorrect: 0, hints: 0, skips: 0 };

        this.levelSets = {
            easy: [
                { pool: ['rectangle', 'square', 'triangle'],
                  name: 'Level 1: Basic Shapes',        desc: 'Rectangles, squares, and triangles – all mixed together!' },
                { pool: ['rectangle', 'square', 'triangle', 'parallelogram'],
                  name: 'Level 2: + Parallelograms',    desc: 'Now parallelograms join the mix. Area = base × height.' },
                { pool: ['rectangle', 'square', 'triangle', 'parallelogram', 'trapezoid'],
                  name: 'Level 3: + Trapezoids',        desc: 'Trapezoids added! Area = ½ × (b₁ + b₂) × height.' },
                { pool: ['rectangle', 'square', 'triangle', 'parallelogram', 'trapezoid', 'circle'],
                  name: 'Level 4: + Circles',           desc: 'Circles arrive! Area = π × r². Round to 1 decimal.' },
                { pool: ['rectangle', 'square', 'triangle', 'parallelogram', 'trapezoid', 'circle'],
                  name: 'Level 5: All Shapes Review',   desc: 'A random mix of every shape. Show what you know!' }
            ],
            medium: [
                { pool: ['rectangle', 'square', 'triangle'],
                  name: 'Level 1: Basic Shapes',        desc: 'Rectangles, squares, and triangles with bigger numbers!' },
                { pool: ['rectangle', 'square', 'triangle', 'parallelogram'],
                  name: 'Level 2: + Parallelograms',    desc: 'Parallelograms join. Watch for decimal dimensions!' },
                { pool: ['rectangle', 'square', 'triangle', 'parallelogram', 'trapezoid'],
                  name: 'Level 3: + Trapezoids',        desc: 'Trapezoids with decimal values. Area = ½ × (b₁ + b₂) × h.' },
                { pool: ['rectangle', 'square', 'triangle', 'parallelogram', 'trapezoid', 'circle'],
                  name: 'Level 4: + Circles',           desc: 'Circles with decimal radii! Round to 1 decimal.' },
                { pool: ['rectangle', 'square', 'triangle', 'parallelogram', 'trapezoid', 'circle', 'rhombus'],
                  name: 'Level 5: + Rhombuses',         desc: 'Rhombuses appear! Area = ½ × d₁ × d₂.' },
                { pool: ['rectangle', 'square', 'triangle', 'parallelogram', 'trapezoid', 'circle', 'rhombus', 'composite'],
                  name: 'Level 6: + Composite Shapes',  desc: 'L-shapes and T-shapes made from rectangles.' },
                { pool: ['rectangle', 'square', 'triangle', 'parallelogram', 'trapezoid', 'circle', 'rhombus', 'composite'],
                  name: 'Level 7: Ultimate Mix',        desc: 'All shapes with decimals – prove your mastery!' }
            ],
            hard: [
                { pool: ['rectangle', 'square', 'triangle', 'parallelogram'],
                  name: 'Level 1: Basics with Fractions',  desc: 'Familiar shapes, but dimension values include fractions!' },
                { pool: ['rectangle', 'square', 'triangle', 'parallelogram', 'trapezoid', 'circle'],
                  name: 'Level 2: More Shapes',            desc: 'Trapezoids and circles with fractional/decimal values.' },
                { pool: ['rectangle', 'square', 'triangle', 'parallelogram', 'trapezoid', 'circle', 'rhombus'],
                  name: 'Level 3: + Rhombuses',            desc: 'Rhombuses with tricky dimensions. Area = ½ × d₁ × d₂.' },
                { pool: ['rectangle', 'square', 'triangle', 'parallelogram', 'trapezoid', 'circle', 'rhombus', 'composite'],
                  name: 'Level 4: + Composites',           desc: 'L-shapes and T-shapes with larger numbers.' },
                { pool: ['rectangle', 'triangle', 'trapezoid', 'circle', 'rhombus', 'composite'],
                  name: 'Level 5: Challenge Round 1',      desc: 'Decimals and fractions everywhere. Stay focused!' },
                { pool: ['parallelogram', 'trapezoid', 'circle', 'rhombus', 'composite'],
                  name: 'Level 6: Challenge Round 2',      desc: 'Harder shapes only – no simple rectangles here!' },
                { pool: ['trapezoid', 'circle', 'rhombus', 'composite'],
                  name: 'Level 7: Expert Shapes',          desc: 'Only the toughest shapes remain.' },
                { pool: ['rectangle', 'square', 'triangle', 'parallelogram', 'trapezoid', 'circle', 'rhombus', 'composite'],
                  name: 'Level 8: Ultimate Challenge',     desc: 'Every shape, fractions, decimals – the final test!' }
            ]
        };

        this.canvas = document.getElementById('shape-canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    /* ══════════ Difficulty / Start ══════════ */
    startGame(diff) {
        this.difficulty = diff;
        this.currentLevel = 1;
        this.score = 0;
        this.streak = 0;
        this.questionsCompleted = 0;
        this.levelStats = { correct: 0, incorrect: 0, hints: 0, skips: 0 };
        this.totalLevels = this.levelSets[diff].length;

        document.getElementById('difficulty-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        document.getElementById('diff-display').textContent = diff.charAt(0).toUpperCase() + diff.slice(1);

        // Bind enter key now that input is visible
        document.getElementById('answer-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });

        this.updateDisplay();
        this.generateProblem();
    }

    showDifficultyScreen() {
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('difficulty-screen').style.display = 'block';
    }

    /* ══════════ Number generators based on difficulty ══════════ */
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /** Return a nice decimal: e.g. 4.5, 7.25 */
    randDecimal(min, max, places) {
        const factor = Math.pow(10, places);
        return Math.round((Math.random() * (max - min) + min) * factor) / factor;
    }

    /** Return a value from a small set of common fractions as a decimal + display string. */
    randFraction() {
        const fracs = [
            { n: 1, d: 2, v: 0.5,     s: '½' },
            { n: 1, d: 4, v: 0.25,    s: '¼' },
            { n: 3, d: 4, v: 0.75,    s: '¾' },
            { n: 1, d: 3, v: 1/3,     s: '⅓' },
            { n: 2, d: 3, v: 2/3,     s: '⅔' },
            { n: 3, d: 2, v: 1.5,     s: '1½' },
            { n: 5, d: 2, v: 2.5,     s: '2½' },
            { n: 7, d: 2, v: 3.5,     s: '3½' },
            { n: 5, d: 4, v: 1.25,    s: '1¼' },
            { n: 7, d: 4, v: 1.75,    s: '1¾' },
        ];
        return fracs[this.randInt(0, fracs.length - 1)];
    }

    /** Generate a dimension value appropriate for the current difficulty.
     *  Returns { value: number, label: string }  */
    dimEasy(min, max) {
        const v = this.randInt(min, max);
        return { value: v, label: `${v}` };
    }

    dimMedium(min, max) {
        if (this.currentFormat === 'decimal') {
            // decimal
            const v = this.randDecimal(min, max, 1);
            return { value: v, label: `${v}` };
        }
        const v = this.randInt(min, max);
        return { value: v, label: `${v}` };
    }

    dimHard(min, max) {
        if (this.currentFormat === 'fraction') {
            // fraction mixed with whole
            const whole = this.randInt(min, Math.max(min, max - 2));
            const frac = this.randFraction();
            const v = whole + frac.v;
            return { value: v, label: `${whole}${frac.s}` };
        } else if (this.currentFormat === 'decimal') {
            // decimal
            const v = this.randDecimal(min, max, 2);
            return { value: v, label: `${v}` };
        }
        const v = this.randInt(min, max);
        return { value: v, label: `${v}` };
    }

    dim(min, max) {
        switch (this.difficulty) {
            case 'easy':   return this.dimEasy(min, max);
            case 'medium': return this.dimMedium(min, max);
            case 'hard':   return this.dimHard(min, max);
            default:       return this.dimEasy(min, max);
        }
    }

    /** Round the answer to a sensible precision based on difficulty. */
    roundAnswer(val) {
        if (this.difficulty === 'easy') return Math.round(val * 10) / 10;
        return Math.round(val * 100) / 100;
    }

    /** Format a number for display (strip trailing zeros). */
    fmt(n) {
        return parseFloat(n.toFixed(4)).toString();
    }

    /** Tolerance for answer checking. */
    get tolerance() {
        if (this.difficulty === 'hard') return 0.05;
        if (this.difficulty === 'medium') return 0.15;
        return 0.5;                 // easy – generous
    }

    /* ══════════ Problem dispatch ══════════ */
    generateProblem() {
        if (this.difficulty === 'hard') {
            const r = Math.random();
            if (r < 0.35) this.currentFormat = 'fraction';
            else if (r < 0.65) this.currentFormat = 'decimal';
            else this.currentFormat = 'whole';
        } else if (this.difficulty === 'medium') {
            if (Math.random() < 0.4) this.currentFormat = 'decimal';
            else this.currentFormat = 'whole';
        } else {
            this.currentFormat = 'whole';
        }

        const levels = this.levelSets[this.difficulty];
        const level = levels[this.currentLevel - 1];
        const pool = level.pool;
        const type = pool[this.randInt(0, pool.length - 1)];

        switch (type) {
            case 'rectangle':      this.genRectangle(); break;
            case 'square':         this.genSquare(); break;
            case 'triangle':       this.genTriangle(); break;
            case 'parallelogram':  this.genParallelogram(); break;
            case 'trapezoid':      this.genTrapezoid(); break;
            case 'circle':         this.genCircle(); break;
            case 'composite':      this.genComposite(); break;
            case 'rhombus':        this.genRhombus(); break;
        }

        document.getElementById('answer-input').value = '';
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';
        document.getElementById('answer-input').focus();
    }

    /* ══════════ Shape generators ══════════ */

    genRectangle() {
        const w = this.dim(3, 14);
        const h = this.dim(2, 10);
        this.currentAnswer = this.roundAnswer(w.value * h.value);
        this.currentHint = `Area = length × width = ${w.label} × ${h.label} = ${this.fmt(this.currentAnswer)}`;
        document.getElementById('question-text').textContent = 'What is the area of this rectangle?';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawRectangle(w, h);
    }

    genSquare() {
        const s = this.dim(2, 12);
        this.currentAnswer = this.roundAnswer(s.value * s.value);
        this.currentHint = `Area = side × side = ${s.label} × ${s.label} = ${this.fmt(this.currentAnswer)}`;
        document.getElementById('question-text').textContent = 'What is the area of this square?';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawSquare(s);
    }

    genTriangle() {
        const base = this.dim(3, 14);
        const height = this.dim(2, 10);
        this.currentAnswer = this.roundAnswer((base.value * height.value) / 2);
        this.currentHint = `Area = ½ × base × height = ½ × ${base.label} × ${height.label} = ${this.fmt(this.currentAnswer)}`;
        document.getElementById('question-text').textContent = 'What is the area of this triangle?';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawTriangle(base, height);
    }

    genParallelogram() {
        const base = this.dim(4, 14);
        const height = this.dim(2, 10);
        this.currentAnswer = this.roundAnswer(base.value * height.value);
        this.currentHint = `Area = base × height = ${base.label} × ${height.label} = ${this.fmt(this.currentAnswer)}`;
        document.getElementById('question-text').textContent = 'What is the area of this parallelogram?';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawParallelogram(base, height);
    }

    genTrapezoid() {
        const b1 = this.dim(4, 12);
        const b2 = this.dim(3, 10);
        const h  = this.dim(3, 8);
        this.currentAnswer = this.roundAnswer(((b1.value + b2.value) * h.value) / 2);
        this.currentHint = `Area = ½ × (b₁ + b₂) × h = ½ × (${b1.label} + ${b2.label}) × ${h.label} = ${this.fmt(this.currentAnswer)}`;
        document.getElementById('question-text').textContent = 'What is the area of this trapezoid?';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawTrapezoid(b1, b2, h);
    }

    genCircle() {
        const r = this.dim(2, 10);
        const area = Math.PI * r.value * r.value;
        this.currentAnswer = Math.round(area * 10) / 10;   // always 1 decimal for circles
        this.currentHint = `Area = π × r² = π × ${r.label}² ≈ ${this.currentAnswer}`;
        document.getElementById('question-text').textContent = 'What is the area of this circle? (Round to 1 decimal place)';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawCircle(r);
    }

    genComposite() {
        if (Math.random() < 0.5) {
            this.genLShape();
        } else {
            this.genTShape();
        }
    }

    genLShape() {
        // Composites use whole numbers even on hard to keep it sane
        const w1 = this.randInt(3, 7);
        const h1 = this.randInt(5, 10);
        const w2 = this.randInt(3, 7);
        const h2 = this.randInt(2, 4);
        this.currentAnswer = (w1 * h1) + (w2 * h2);
        this.currentHint = `Split into two rectangles: (${w1} × ${h1}) + (${w2} × ${h2}) = ${this.currentAnswer}`;
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
        this.currentHint = `Split into two rectangles: top (${topW} × ${topH}) + stem (${stemW} × ${stemH}) = ${this.currentAnswer}`;
        document.getElementById('question-text').textContent = 'What is the total area of this T-shape?';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawTShape(topW, topH, stemW, stemH);
    }

    genRhombus() {
        const d1 = this.dim(4, 14);
        const d2 = this.dim(3, 12);
        this.currentAnswer = this.roundAnswer((d1.value * d2.value) / 2);
        this.currentHint = `Area = ½ × d₁ × d₂ = ½ × ${d1.label} × ${d2.label} = ${this.fmt(this.currentAnswer)}`;
        document.getElementById('question-text').textContent = 'What is the area of this rhombus?';
        document.getElementById('unit-label').textContent = 'square units';
        this.drawRhombus(d1, d2);
    }

    /* ──────────── Drawing Methods ──────────── */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getScale(maxDim) {
        const available = Math.min(this.canvas.width, this.canvas.height) - 100;
        return Math.min(available / maxDim, 30);
    }

    drawLabel(text, x, y, color = '#2563eb') {
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillStyle = color;
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

        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / len * offset, ny = dx / len * offset;

        ctx.beginPath();
        ctx.moveTo(x1 + nx, y1 + ny);
        ctx.lineTo(x2 + nx, y2 + ny);
        ctx.stroke();
        ctx.setLineDash([]);

        const tickLen = 6;
        ctx.beginPath();
        ctx.moveTo(x1 + nx - ny / len * tickLen, y1 + ny + nx / len * tickLen);
        ctx.lineTo(x1 + nx + ny / len * tickLen, y1 + ny - nx / len * tickLen);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2 + nx - ny / len * tickLen, y2 + ny + nx / len * tickLen);
        ctx.lineTo(x2 + nx + ny / len * tickLen, y2 + ny - nx / len * tickLen);
        ctx.stroke();

        const mx = (x1 + x2) / 2 + nx + nx * 0.5;
        const my = (y1 + y2) / 2 + ny + ny * 0.5;
        ctx.font = 'bold 15px Arial';
        ctx.fillStyle = '#2563eb';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, mx, my);
        ctx.restore();
    }

    /* Drawing helpers accept {value, label} dim objects or plain numbers */
    _v(d) { return typeof d === 'object' ? d.value : d; }
    _l(d) { return typeof d === 'object' ? d.label : `${d}`; }

    drawRectangle(w, h) {
        this.clearCanvas();
        const wv = this._v(w), hv = this._v(h);
        const scale = this.getScale(Math.max(wv, hv));
        const pw = wv * scale, ph = hv * scale;
        const x = (this.canvas.width - pw) / 2;
        const y = (this.canvas.height - ph) / 2;

        this.ctx.fillStyle = '#a7f3d0';
        this.ctx.strokeStyle = '#059669';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.rect(x, y, pw, ph);
        this.ctx.fill();
        this.ctx.stroke();

        this.drawDimensionLine(x, y + ph, x + pw, y + ph, this._l(w), 20);
        this.drawDimensionLine(x + pw, y + ph, x + pw, y, this._l(h), 20);
    }

    drawSquare(s) {
        this.clearCanvas();
        const sv = this._v(s);
        const scale = this.getScale(sv);
        const ps = sv * scale;
        const x = (this.canvas.width - ps) / 2;
        const y = (this.canvas.height - ps) / 2;

        this.ctx.fillStyle = '#bfdbfe';
        this.ctx.strokeStyle = '#2563eb';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.rect(x, y, ps, ps);
        this.ctx.fill();
        this.ctx.stroke();

        const m = 12;
        this.ctx.strokeStyle = '#2563eb';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + ps - m, y + ps);
        this.ctx.lineTo(x + ps - m, y + ps - m);
        this.ctx.lineTo(x + ps, y + ps - m);
        this.ctx.stroke();

        this.drawDimensionLine(x, y + ps, x + ps, y + ps, this._l(s), 20);
        this.drawDimensionLine(x + ps, y + ps, x + ps, y, this._l(s), 20);
    }

    drawTriangle(base, height) {
        this.clearCanvas();
        const bv = this._v(base), hv = this._v(height);
        const scale = this.getScale(Math.max(bv, hv));
        const pb = bv * scale, ph = hv * scale;
        const startX = (this.canvas.width - pb) / 2;
        const startY = (this.canvas.height + ph) / 2;

        this.ctx.fillStyle = '#fde68a';
        this.ctx.strokeStyle = '#d97706';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(startX + pb, startY);
        this.ctx.lineTo(startX + pb / 2, startY - ph);
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

        this.drawDimensionLine(startX, startY, startX + pb, startY, this._l(base), 22);
        this.drawLabel(`h = ${this._l(height)}`, startX + pb / 2 - 40, startY - ph / 2);
    }

    drawParallelogram(base, height) {
        this.clearCanvas();
        const bv = this._v(base), hv = this._v(height);
        const scale = this.getScale(Math.max(bv + 3, hv));
        const pb = bv * scale, ph = hv * scale;
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

        this.drawDimensionLine(startX, startY, startX + pb, startY, this._l(base), 22);
        this.drawLabel(`h = ${this._l(height)}`, startX + skew - 42, startY - ph / 2);
    }

    drawTrapezoid(b1, b2, h) {
        this.clearCanvas();
        const b1v = this._v(b1), b2v = this._v(b2), hv = this._v(h);
        const scale = this.getScale(Math.max(b1v, b2v, hv));
        const pb1 = b1v * scale, pb2 = b2v * scale, ph = hv * scale;
        const cx = this.canvas.width / 2;
        const bottomY = (this.canvas.height + ph) / 2;
        const topY = bottomY - ph;

        this.ctx.fillStyle = '#fbcfe8';
        this.ctx.strokeStyle = '#db2777';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - pb1 / 2, bottomY);
        this.ctx.lineTo(cx + pb1 / 2, bottomY);
        this.ctx.lineTo(cx + pb2 / 2, topY);
        this.ctx.lineTo(cx - pb2 / 2, topY);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

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

        this.drawDimensionLine(cx - pb1 / 2, bottomY, cx + pb1 / 2, bottomY, `b₁ = ${this._l(b1)}`, 22);
        this.drawDimensionLine(cx - pb2 / 2, topY, cx + pb2 / 2, topY, `b₂ = ${this._l(b2)}`, -20);
        this.drawLabel(`h = ${this._l(h)}`, hx - 35, (bottomY + topY) / 2);
    }

    drawCircle(r) {
        this.clearCanvas();
        const rv = this._v(r);
        const scale = this.getScale(rv * 2);
        const pr = rv * scale;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        this.ctx.fillStyle = '#fed7aa';
        this.ctx.strokeStyle = '#ea580c';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, pr, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.strokeStyle = '#c2410c';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy);
        this.ctx.lineTo(cx + pr, cy);
        this.ctx.stroke();

        this.ctx.fillStyle = '#c2410c';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        this.ctx.fill();

        this.drawLabel(`r = ${this._l(r)}`, cx + pr / 2, cy - 16);
    }

    drawRhombus(d1, d2) {
        this.clearCanvas();
        const d1v = this._v(d1), d2v = this._v(d2);
        const scale = this.getScale(Math.max(d1v, d2v));
        const pw = d1v * scale;   // horizontal diagonal
        const ph = d2v * scale;   // vertical diagonal
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        this.ctx.fillStyle = '#e0f2fe';
        this.ctx.strokeStyle = '#0284c7';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - ph / 2);        // top
        this.ctx.lineTo(cx + pw / 2, cy);        // right
        this.ctx.lineTo(cx, cy + ph / 2);        // bottom
        this.ctx.lineTo(cx - pw / 2, cy);        // left
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Dashed diagonals
        this.ctx.save();
        this.ctx.strokeStyle = '#0369a1';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([5, 3]);
        this.ctx.beginPath();
        this.ctx.moveTo(cx - pw / 2, cy);
        this.ctx.lineTo(cx + pw / 2, cy);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - ph / 2);
        this.ctx.lineTo(cx, cy + ph / 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.restore();

        this.drawLabel(`d₁ = ${this._l(d1)}`, cx, cy + ph / 2 + 20);
        this.drawLabel(`d₂ = ${this._l(d2)}`, cx + pw / 2 + 28, cy);
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

        if (Math.abs(userAnswer - this.currentAnswer) <= this.tolerance) {
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
        this.showFeedback(`❌ Not quite. The answer is ${this.fmt(this.currentAnswer)}. Try the next one!`, 'incorrect');
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
        this.showFeedback(`⏭ Skipped. The answer was ${this.fmt(this.currentAnswer)}.`, 'hint');
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
        this.showDifficultyScreen();
    }

    /* ──────────── UI Updates ──────────── */
    updateDisplay() {
        document.getElementById('level-display').textContent = this.currentLevel;
        document.getElementById('score-display').textContent = this.score;
        document.getElementById('streak-display').textContent = `${this.streak} 🔥`;

        const levels = this.levelSets[this.difficulty];
        const level = levels[this.currentLevel - 1];
        document.getElementById('level-name').textContent = level.name;
        document.getElementById('level-desc').textContent = level.desc;

        const pct = (this.questionsCompleted / this.questionsPerLevel) * 100;
        document.getElementById('progress-bar').style.width = `${pct}%`;
        document.getElementById('progress-text').textContent =
            `${this.questionsCompleted} / ${this.questionsPerLevel}`;
    }
}
