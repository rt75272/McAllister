(() => {
    const engine = StarlightMaze;
    const canvas = document.getElementById('maze-board');
    const ctx = canvas.getContext('2d');
    const status = document.getElementById('maze-status');
    const startButton = document.getElementById('maze-start');
    const score = document.getElementById('maze-score');
    const lives = document.getElementById('maze-lives');
    const remaining = document.getElementById('maze-remaining');
    const shield = document.getElementById('maze-shield');
    if (!ctx) {
        console.error('Unable to render Starlight Maze.');
        status.textContent = 'The maze could not be displayed in this browser.';
        startButton.disabled = true;
        document.getElementById('maze-restart').disabled = true;
        document.querySelectorAll('.maze-dpad button').forEach(button => { button.disabled = true; });
        return;
    }

    let state = engine.create();
    let touchStart = null;
    const tile = canvas.width / engine.layout[0].length;
    const tickMs = 180;

    function diamond(x, y, radius, fill) {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.moveTo(x, y - radius);
        ctx.lineTo(x + radius, y);
        ctx.lineTo(x, y + radius);
        ctx.lineTo(x - radius, y);
        ctx.closePath();
        ctx.fill();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#080f21';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        engine.layout.forEach((row, y) => [...row].forEach((cell, x) => {
            const left = x * tile;
            const top = y * tile;
            if (cell === '#') {
                ctx.fillStyle = '#24436a';
                ctx.fillRect(left + 2, top + 2, tile - 4, tile - 4);
                ctx.strokeStyle = '#7ac4e5';
                ctx.lineWidth = 2;
                ctx.strokeRect(left + 3, top + 3, tile - 6, tile - 6);
            } else {
                const id = `${x},${y}`;
                if (state.crystals.has(id)) {
                    if (state.shields.has(id)) {
                        ctx.strokeStyle = '#80f9ff';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(left + tile / 2, top + tile / 2, 12, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    diamond(left + tile / 2, top + tile / 2, state.shields.has(id) ? 8 : 5, state.shields.has(id) ? '#80f9ff' : '#ffe793');
                }
            }
        }));
        state.drones.forEach((drone, index) => {
            if (drone.respawn) return;
            const x = drone.x * tile + tile / 2;
            const y = drone.y * tile + tile / 2;
            ctx.fillStyle = state.shield ? '#6fdde8' : (index ? '#f683a0' : '#cfabff');
            ctx.fillRect(x - 12, y - 10, 24, 20);
            ctx.fillStyle = '#15233a';
            ctx.fillRect(x - 7, y - 3, 5, 5);
            ctx.fillRect(x + 2, y - 3, 5, 5);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - 5, y - 10);
            ctx.lineTo(x - 9, y - 15);
            ctx.moveTo(x + 5, y - 10);
            ctx.lineTo(x + 9, y - 15);
            ctx.stroke();
        });
        const x = state.player.x * tile + tile / 2;
        const y = state.player.y * tile + tile / 2;
        const angles = { up: -Math.PI / 2, right: 0, down: Math.PI / 2, left: Math.PI };
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angles[state.direction] ?? 0);
        if (state.shield) {
            ctx.strokeStyle = '#80f9ff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = '#ffd36e';
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(-11, -11);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-11, 11);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function render() {
        score.textContent = state.score;
        lives.textContent = state.lives;
        remaining.textContent = state.crystals.size;
        shield.textContent = state.shield ? `${Math.ceil(state.shield * tickMs / 1000)}s` : 'Off';
        startButton.textContent = state.mode === 'playing' ? 'Pause' : state.mode === 'paused' ? 'Resume' : state.mode === 'ready' ? 'Start game' : 'Play again';
        draw();
    }

    function steer(direction) {
        const wasWaiting = state.mode === 'ready' || (state.mode === 'playing' && !state.direction);
        if (engine.steer(state, direction)) {
            if (wasWaiting) status.textContent = 'Collect the crystals and avoid the drones!';
            render();
        }
    }

    startButton.addEventListener('click', () => {
        if (state.mode === 'playing') {
            engine.pause(state);
            status.textContent = 'Paused. Press Resume when you are ready.';
        } else {
            if (state.mode === 'won' || state.mode === 'lost') state = engine.create();
            engine.start(state);
            status.textContent = state.direction ? 'Game resumed.' : 'Choose a direction to start moving.';
        }
        render();
    });

    document.getElementById('maze-restart').addEventListener('click', () => {
        state = engine.create();
        status.textContent = 'New game ready. Press Start or choose a direction.';
        render();
    });

    document.querySelectorAll('.maze-dpad button').forEach(button => {
        button.addEventListener('click', () => steer(button.dataset.direction));
    });

    const keyDirections = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right'
    };
    window.addEventListener('keydown', event => {
        if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"], #chatbot-container')) return;
        const direction = keyDirections[event.code];
        if (direction && !event.altKey && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            steer(direction);
        }
    });

    canvas.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse') return;
        touchStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
        canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointerup', event => {
        if (!touchStart || touchStart.id !== event.pointerId) return;
        const dx = event.clientX - touchStart.x;
        const dy = event.clientY - touchStart.y;
        touchStart = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
        steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    });
    canvas.addEventListener('pointercancel', () => { touchStart = null; });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden && engine.pause(state)) {
            status.textContent = 'Game paused while away. Press Resume to continue.';
            render();
        }
    });
    window.setInterval(() => {
        const message = engine.step(state);
        if (message) status.textContent = message;
        if (state.mode === 'playing' || message) render();
    }, tickMs);

    render();
})();
