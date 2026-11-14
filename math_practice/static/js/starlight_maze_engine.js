const StarlightMaze = (() => {
    const layout = [
        '###############',
        '#P....#......D#',
        '#.###.#.###.#.#',
        '#*#...#...#.#.#',
        '#.#.#####.#.#.#',
        '#.#.......#...#',
        '#.###.###.###.#',
        '#.....#.#....*#',
        '###.#.#.#.#.###',
        '#...#.....#...#',
        '#.#.#####.#.#.#',
        '#.#...#...#.#.#',
        '#.#.###.#.###.#',
        '#D......#....*#',
        '###############'
    ];
    const directions = {
        up: { x: 0, y: -1 }, left: { x: -1, y: 0 },
        down: { x: 0, y: 1 }, right: { x: 1, y: 0 }
    };
    const shieldDuration = 35;
    const key = (x, y) => `${x},${y}`;
    const open = (x, y) => y >= 0 && y < layout.length && x >= 0 && x < layout[y].length && layout[y][x] !== '#';

    function create() {
        const crystals = new Set();
        const shields = new Set();
        const drones = [];
        let spawn = null;
        layout.forEach((row, y) => [...row].forEach((cell, x) => {
            if (cell === '.' || cell === '*') crystals.add(key(x, y));
            if (cell === '*') shields.add(key(x, y));
            if (cell === 'P') spawn = { x, y };
            if (cell === 'D') drones.push({ x, y, spawnX: x, spawnY: y, respawn: 0 });
        }));
        return {
            mode: 'ready', spawn, player: { ...spawn }, drones, crystals, shields,
            score: 0, lives: 3, shield: 0, direction: null, queued: null, ticks: 0
        };
    }

    function start(state) {
        if (state.mode !== 'ready' && state.mode !== 'paused') return false;
        state.mode = 'playing';
        return true;
    }

    function pause(state) {
        if (state.mode !== 'playing') return false;
        state.mode = 'paused';
        return true;
    }

    function steer(state, direction) {
        if (!Object.hasOwn(directions, direction) || !['ready', 'playing'].includes(state.mode)) return false;
        if (state.mode === 'ready') start(state);
        state.queued = direction;
        return true;
    }

    function distancesFrom(player) {
        const distances = new Map([[key(player.x, player.y), 0]]);
        const queue = [player];
        for (let i = 0; i < queue.length; i++) {
            const point = queue[i];
            for (const dir of Object.values(directions)) {
                const x = point.x + dir.x;
                const y = point.y + dir.y;
                const id = key(x, y);
                if (open(x, y) && !distances.has(id)) {
                    distances.set(id, distances.get(key(point.x, point.y)) + 1);
                    queue.push({ x, y });
                }
            }
        }
        return distances;
    }

    function resetPositions(state) {
        state.player = { ...state.spawn };
        state.drones.forEach(drone => {
            drone.x = drone.spawnX;
            drone.y = drone.spawnY;
            drone.respawn = 0;
        });
        state.direction = null;
        state.queued = null;
        state.shield = 0;
    }

    function collision(state, drone) {
        if (drone.respawn || drone.x !== state.player.x || drone.y !== state.player.y) return null;
        if (state.shield > 0) {
            drone.respawn = 8;
            state.score += 50;
            return 'Drone tagged! +50 points.';
        }
        state.lives--;
        if (!state.lives) {
            state.mode = 'lost';
            return 'The drones caught you. Game over! Restart to try again.';
        }
        resetPositions(state);
        return `A drone caught you! ${state.lives} ${state.lives === 1 ? 'life' : 'lives'} left. Choose a direction to continue.`;
    }

    function step(state) {
        if (state.mode !== 'playing' || (!state.direction && !state.queued)) return null;
        const queued = directions[state.queued];
        if (queued && open(state.player.x + queued.x, state.player.y + queued.y)) {
            state.direction = state.queued;
            state.queued = null;
        }
        if (!state.direction) return null;
        state.ticks++;
        const direction = directions[state.direction];
        if (direction && open(state.player.x + direction.x, state.player.y + direction.y)) {
            state.player.x += direction.x;
            state.player.y += direction.y;
        }
        let message = null;
        const tile = key(state.player.x, state.player.y);
        if (state.crystals.delete(tile)) {
            state.score += 10;
            if (state.shields.delete(tile)) {
                state.shield = shieldDuration;
                message = 'Shield activated! You can tag drones briefly.';
            }
        }
        for (const drone of state.drones) {
            const outcome = collision(state, drone);
            if (outcome) {
                message = outcome;
                if (state.mode === 'lost' || !state.direction) return message;
            }
        }
        if (!state.crystals.size) {
            state.mode = 'won';
            return `All crystals collected! You won with ${state.score} points.`;
        }
        const distances = distancesFrom(state.player);
        for (let i = 0; i < state.drones.length; i++) {
            const drone = state.drones[i];
            if (drone.respawn > 0) {
                drone.respawn--;
                if (!drone.respawn) {
                    if (state.player.x === drone.spawnX && state.player.y === drone.spawnY) drone.respawn = 1;
                    else { drone.x = drone.spawnX; drone.y = drone.spawnY; }
                }
                continue;
            }
            if ((state.ticks + i) % 3 !== 0) continue;
            const options = Object.values(directions)
                .map(dir => ({ x: drone.x + dir.x, y: drone.y + dir.y }))
                .filter(point => open(point.x, point.y));
            options.sort((a, b) => state.shield > 0
                ? distances.get(key(b.x, b.y)) - distances.get(key(a.x, a.y))
                : distances.get(key(a.x, a.y)) - distances.get(key(b.x, b.y)));
            if (options.length) {
                drone.x = options[0].x;
                drone.y = options[0].y;
                const outcome = collision(state, drone);
                if (outcome) {
                    message = outcome;
                    if (state.mode === 'lost' || !state.direction) return message;
                }
            }
        }
        if (state.shield > 0) {
            state.shield--;
            if (!state.shield && !message) message = 'Shield expired. Watch out for drones!';
        }
        return message;
    }

    return { layout, directions, shieldDuration, open, create, start, pause, steer, step };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = StarlightMaze;
