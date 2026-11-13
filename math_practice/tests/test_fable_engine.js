const test = require('node:test');
const assert = require('node:assert/strict');
const game = require('../static/js/fable_engine.js');

function hero() {
    const state = game.initial();
    assert.equal(game.configure(state, { alias: 'Nova', role: 'warden', color: 'teal', companion: 'fox' }).ok, true);
    return state;
}

test('puzzle rewards are earned once and locked areas stay locked', () => {
    const state = hero();
    assert.equal(game.travel(state, 1).ok, false);
    assert.equal(game.travel(state, 0).ok, true);
    game.investigate(state);
    assert.equal(game.answer(state, 1).ok, false);
    assert.equal(state.shards, 0);
    assert.equal(game.answer(state, 0).ok, true);
    assert.equal(state.shards, 3);
    assert.equal(game.investigate(state).ok, false);
    assert.equal(state.shards, 3);
    assert.deepEqual(game.restore(JSON.stringify(state)), state);
});

test('battle tactics, retreat and defeat preserve valid state', () => {
    const state = hero();
    game.travel(state, 0);
    game.startBattle(state);
    game.turn(state, 'skill');
    assert.equal(state.hp, 28);
    assert.equal(state.focus, 2);
    game.turn(state, 'guard');
    assert.equal(state.hp, 26);
    assert.equal(state.focus, 3);
    assert.equal(game.configure(state, { alias: 'Moss', role: 'scout', color: 'blue', companion: 'owl' }).ok, false);
    assert.equal(game.back(state).ok, true);
    assert.equal(state.scene, 'camp');
    game.rest(state);
    game.travel(state, 0);
    game.startBattle(state);
    while (state.scene === 'battle') game.turn(state, 'guard');
    assert.equal(state.scene, 'camp');
    assert.equal(state.hp, 1);
    assert.equal(state.shards, 0);
    assert.equal(game.valid(state), true);
    game.rest(state);
    assert.equal(state.hp, 30);
});

test('upgrades enable a complete quest and saved victory cannot award twice', () => {
    const state = hero();
    for (let index = 0; index < game.zones.length; index++) {
        game.rest(state);
        game.travel(state, index);
        game.startBattle(state);
        while (state.scene === 'battle') game.turn(state, 'strike', () => 0.5);
        assert.equal(state.scene, 'victory');
        const saved = game.restore(JSON.stringify(state));
        assert.equal(game.turn(saved, 'strike').ok, false);
        assert.equal(saved.shards, state.shards);
        game.back(state);
        if (index < 2) assert.equal(game.buy(state, 'weapon').ok, true);
    }
    assert.deepEqual(state.defeated, [0, 1, 2]);
    assert.equal(state.shards, 23);
    assert.equal(game.valid(state), true);
});

test('strikes use a visible die roll and weapon bonus', () => {
    const state = hero();
    game.travel(state, 0);
    game.startBattle(state);
    const first = game.turn(state, 'strike', () => 0);
    assert.match(first.message, /rolled 1 and strike for 3/);
    const second = game.turn(state, 'strike', () => 0.999);
    assert.match(second.message, /rolled 6 and strike for 8/);
    assert.equal(state.enemyHp, 7);
});

test('focus, potions and armor follow their stated limits', () => {
    const state = hero();
    game.configure(state, { alias: 'Ember', role: 'weaver', color: 'rose', companion: 'owl' });
    state.shards = 50;
    game.buy(state, 'armor');
    game.buy(state, 'armor');
    assert.equal(state.armor, 2);
    game.travel(state, 0);
    game.startBattle(state);
    game.turn(state, 'skill');
    assert.equal(state.focus, 1);
    assert.equal(state.hp, 22);
    assert.equal(game.turn(state, 'skill').ok, false);
    assert.equal(state.hp, 22);
    game.turn(state, 'guard');
    assert.equal(state.focus, 2);
    assert.equal(state.hp, 21);
    game.turn(state, 'potion');
    assert.equal(state.potions, 1);
    assert.equal(state.hp, 22);
    assert.equal(game.valid(state), true);
});

test('invalid saves and unaffordable purchases are rejected', () => {
    const state = hero();
    assert.equal(game.buy(state, 'armor').ok, false);
    assert.equal(state.shards, 0);
    assert.equal(game.configure(state, { alias: 'A full name', role: 'warden', color: 'teal', companion: 'fox' }).ok, false);
    state.role = 'not-a-role';
    assert.throws(() => game.restore(JSON.stringify(state)));
    assert.throws(() => game.restore('{broken'));
});
