// Simple plot-points game
// Grid: centered origin, integer coordinates. Each square = 1 unit.

// Plot Points (two-point distance only)
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('plotCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Two-point elements
    const inputAx = document.getElementById('inputAx');
    const inputAy = document.getElementById('inputAy');
    const inputBx = document.getElementById('inputBx');
    const inputBy = document.getElementById('inputBy');
    const plotABtn = document.getElementById('plotABtn');
    const plotBBtn = document.getElementById('plotBBtn');
    const placeModeA = document.getElementById('placeModeA');
    const placeModeB = document.getElementById('placeModeB');
    const computeDist = document.getElementById('computeDist');
    const genTargets2 = document.getElementById('genTargets2');
    const distanceDisplay = document.getElementById('distanceDisplay');

    let canvasSize = Math.min(canvas.width, canvas.height);
    let origin = { x: canvasSize / 2, y: canvasSize / 2 };
    const maxRange = 15; // Maximum coordinate range (up to 15)
    let cellSize = Math.min(30, Math.floor(Math.min(canvas.width, canvas.height) / (maxRange * 2 + 2))); // Dynamic cell size
    let placingMode = null; // 'A' or 'B' or null
    let pointA = null;
    let pointB = null;

    function resizeCalc() {
        canvasSize = Math.min(canvas.width, canvas.height);
        origin = { x: canvas.width / 2, y: canvas.height / 2 };
        cellSize = Math.min(30, Math.floor(Math.min(canvas.width, canvas.height) / (maxRange * 2 + 2)));
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const maxCellsX = Math.min(Math.floor(canvas.width / cellSize / 2), maxRange);
        const maxCellsY = Math.min(Math.floor(canvas.height / cellSize / 2), maxRange);
        const cells = Math.min(maxCellsX, maxCellsY);

        // grid lines
        ctx.strokeStyle = '#e6eefc';
        ctx.lineWidth = 1;
        for (let i = -cells; i <= cells; i++) {
            ctx.beginPath();
            ctx.moveTo(origin.x + i * cellSize, 0);
            ctx.lineTo(origin.x + i * cellSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, origin.y + i * cellSize);
            ctx.lineTo(canvas.width, origin.y + i * cellSize);
            ctx.stroke();
        }

        // axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(origin.x, 0); ctx.lineTo(origin.x, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, origin.y); ctx.lineTo(canvas.width, origin.y); ctx.stroke();

        // labels
        ctx.fillStyle = '#333'; ctx.font = '12px Arial';
        for (let i = -cells; i <= cells; i++) {
            if (i === 0) continue;
            ctx.fillText(i, origin.x + i * cellSize - 6, origin.y + 12);
            ctx.fillText(-i, origin.x + 6, origin.y + i * cellSize + 4);
        }

        // draw points
        if (pointA) drawPoint(pointA.x, pointA.y, '#1f6feb');
        if (pointB) drawPoint(pointB.x, pointB.y, '#9C27B0');
        if (pointA && pointB) {
            ctx.beginPath(); ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
            ctx.moveTo(origin.x + pointA.x * cellSize, origin.y - pointA.y * cellSize);
            ctx.lineTo(origin.x + pointB.x * cellSize, origin.y - pointB.y * cellSize);
            ctx.stroke();
        }
    }

    function drawPoint(x, y, color = '#d12b2b') {
        const px = origin.x + x * cellSize;
        const py = origin.y - y * cellSize;
        ctx.beginPath(); ctx.arc(px, py, Math.max(6, cellSize / 6), 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    }

    function canvasToCoord(mouseX, mouseY) {
        const rect = canvas.getBoundingClientRect();
        const mx = mouseX - rect.left; const my = mouseY - rect.top;
        return { x: Math.round((mx - origin.x) / cellSize), y: Math.round((origin.y - my) / cellSize) };
    }

    canvas.addEventListener('click', (e) => {
        const c = canvasToCoord(e.clientX, e.clientY);
        if (placingMode === 'A') {
            pointA = { x: c.x, y: c.y };
            if (inputAx) inputAx.value = c.x; if (inputAy) inputAy.value = c.y;
            placingMode = null;
        } else if (placingMode === 'B') {
            pointB = { x: c.x, y: c.y };
            if (inputBx) inputBx.value = c.x; if (inputBy) inputBy.value = c.y;
            placingMode = null;
        }
        drawGrid();
    });

    if (plotABtn) plotABtn.addEventListener('click', () => {
        const x = parseInt(inputAx.value, 10); const y = parseInt(inputAy.value, 10);
        if (Number.isInteger(x) && Number.isInteger(y)) { pointA = { x, y }; drawGrid(); }
    });
    if (plotBBtn) plotBBtn.addEventListener('click', () => {
        const x = parseInt(inputBx.value, 10); const y = parseInt(inputBy.value, 10);
        if (Number.isInteger(x) && Number.isInteger(y)) { pointB = { x, y }; drawGrid(); }
    });

    if (placeModeA) placeModeA.addEventListener('click', () => { placingMode = 'A'; if (distanceDisplay) distanceDisplay.textContent = 'Click to place A'; });
    if (placeModeB) placeModeB.addEventListener('click', () => { placingMode = 'B'; if (distanceDisplay) distanceDisplay.textContent = 'Click to place B'; });

    if (computeDist) computeDist.addEventListener('click', () => {
        if (!pointA || !pointB) { if (distanceDisplay) distanceDisplay.textContent = 'Place both points first.'; return; }
        const dx = pointA.x - pointB.x; const dy = pointA.y - pointB.y; const d = Math.sqrt(dx * dx + dy * dy);
        if (distanceDisplay) distanceDisplay.textContent = `Distance = ${d.toFixed(3)} units`;
    });

    if (genTargets2) genTargets2.addEventListener('click', () => {
        const maxCellsX = Math.min(Math.floor(canvas.width / cellSize / 2), maxRange);
        const maxCellsY = Math.min(Math.floor(canvas.height / cellSize / 2), maxRange);
        const range = Math.min(maxCellsX, maxCellsY) - 1;
        const ax = Math.floor(Math.random() * (range * 2 + 1)) - range;
        const ay = Math.floor(Math.random() * (range * 2 + 1)) - range;
        const bx = Math.floor(Math.random() * (range * 2 + 1)) - range;
        const by = Math.floor(Math.random() * (range * 2 + 1)) - range;
        pointA = { x: ax, y: ay }; pointB = { x: bx, y: by };
        if (inputAx) inputAx.value = ax; if (inputAy) inputAy.value = ay; if (inputBx) inputBx.value = bx; if (inputBy) inputBy.value = by;
        if (distanceDisplay) distanceDisplay.textContent = '';
        drawGrid();
    });

    // initialize
    resizeCalc(); drawGrid();
    window.addEventListener('resize', () => { resizeCalc(); drawGrid(); });
});
