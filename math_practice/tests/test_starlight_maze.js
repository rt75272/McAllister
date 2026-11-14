const test = require('node:test');
const assert = require('node:assert/strict');
const maze = require('../static/js/starlight_maze_engine.js');

function path(start, target) {
    const queue = [{ x: start.x, y: start.y, moves: [] }];
    const seen = new Set([`${start.x},${start.y}`]);
    for (let i = 0; i < queue.length; i++) {
        const current = queue[i];
        if (current.x === target.x && current.y === target.y) return current.moves;
        for (const [name, dir] of Object.entries(maze.directions)) {
            const x = current.x + dir.x;
            const y = current.y + dir.y;
            const key = `${x},${y}`;
            if (maze.open(x, y) && !seen.has(key)) {
                seen.add(key);
                queue.push({ x, y, moves: [...current.moves, name] });
            }
        }
    }
    return null;
}

function silenceDrones(state) {
    state.drones.forEach(drone => { drone.respawn = 100000; });
}

test('all crystals are reachable and collecting them wins', () => {
    const state = maze.create();
    silenceDrones(state);
    maze.start(state);
    while (state.crystals.size) {
        const [x, y] = [...state.crystals][0].split(',').map(Number);
        const moves = path(state.player, { x, y });
        assert.ok(moves, `Unreachable crystal at ${x},${y}`);
        for (const move of moves) {
            maze.steer(state, move);
            maze.step(state);
        }
    }
    assert.equal(state.mode, 'won');
    assert.ok(state.score > 0);
    assert.equal(maze.step(state), null);
});

test('turns can be queued and pause stops movement', () => {
    const state = maze.create();
    silenceDrones(state);
    maze.steer(state, 'right');
    maze.step(state);
    assert.deepEqual(state.player, { x: 2, y: 1 });
    maze.steer(state, 'down');
    for (let i = 0; i < 3; i++) maze.step(state);
    assert.deepEqual(state.player, { x: 5, y: 1 });
    maze.step(state);
    assert.deepEqual(state.player, { x: 5, y: 2 });
    maze.pause(state);
    maze.step(state);
    assert.deepEqual(state.player, { x: 5, y: 2 });
    assert.equal(maze.steer(state, 'left'), false);
    assert.equal(maze.start(state), true);
});

test('a blocked first direction does not start the drones', () => {
    const state = maze.create();
    const positions = state.drones.map(drone => [drone.x, drone.y]);
    maze.steer(state, 'up');
    for (let i = 0; i < 10; i++) maze.step(state);
    assert.deepEqual(state.player, state.spawn);
    assert.deepEqual(state.drones.map(drone => [drone.x, drone.y]), positions);
    assert.equal(state.ticks, 0);
    maze.steer(state, 'right');
    maze.step(state);
    assert.deepEqual(state.player, { x: 2, y: 1 });
});

test('drone collisions cost lives and reset movement until game over', () => {
    const state = maze.create();
    maze.start(state);
    for (let life = 2; life >= 0; life--) {
        state.drones[0].x = 2;
        state.drones[0].y = 1;
        maze.steer(state, 'right');
        maze.step(state);
        assert.equal(state.lives, life);
        if (life > 0) {
            assert.deepEqual(state.player, state.spawn);
            assert.equal(state.direction, null);
        }
    }
    assert.equal(state.mode, 'lost');
    assert.equal(maze.steer(state, 'right'), false);
});

test('shield crystals and tagged drones give a temporary bonus', () => {
    const state = maze.create();
    silenceDrones(state);
    maze.steer(state, 'down');
    maze.step(state);
    maze.step(state);
    assert.ok(state.shield > 0);
    assert.equal(state.shields.has('1,3'), false);
    state.drones[0].respawn = 0;
    state.drones[0].x = 1;
    state.drones[0].y = 4;
    const score = state.score;
    maze.step(state);
    assert.equal(state.score, score + 60);
    assert.ok(state.drones[0].respawn > 0);
    assert.equal(state.lives, 3);
});
