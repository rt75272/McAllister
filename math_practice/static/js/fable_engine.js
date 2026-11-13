const FableEngine = (() => {
    const roles = {
        warden: { name: 'Warden', hp: 30, strike: 5, skill: 'Shield Bash', cost: 1, skillDamage: 4, shield: true },
        weaver: { name: 'Rune Weaver', hp: 24, strike: 4, skill: 'Star Spark', cost: 2, skillDamage: 10, shield: false },
        scout: { name: 'Trail Scout', hp: 27, strike: 5, skill: 'Swift Strike', cost: 1, skillDamage: 7, shield: false }
    };
    const colors = { teal: '#3b958a', purple: '#8a62b4', rose: '#c95b78', gold: '#c8902c', blue: '#4d79b5' };
    const companions = { fox: '🦊 Fox', owl: '🦉 Owl', frog: '🐸 Frog', beetle: '🪲 Beetle' };
    const aliases = ['Nova', 'Ember', 'Moss', 'Comet'];
    const zones = [
        {
            name: 'Fernlight Grove', icon: '🌲', enemy: 'Thorn Tangle', enemyIcon: '🌿',
            hp: 18, damage: 4, reward: 8,
            story: 'The woodland lanterns are tangled in restless vines. Find a clue and calm the grove guardian.',
            riddle: 'I have hands but cannot clap. What am I?',
            choices: ['A clock', 'A stone', 'A cloud'], answer: 0,
            hint: 'Think of something that tells time.'
        },
        {
            name: 'Clockwork Hollow', icon: '⚙️', enemy: 'Rattling Golem', enemyIcon: '🤖',
            hp: 25, damage: 6, reward: 12,
            story: 'Quiet gears guard the path to the tower. Wake the clockwork gate and face its guardian.',
            riddle: 'What number comes next: 3, 6, 9, ...?',
            choices: ['10', '12', '15'], answer: 1,
            hint: 'The numbers increase by three each time.'
        },
        {
            name: 'Starfall Spire', icon: '🌟', enemy: 'Shade of Dusk', enemyIcon: '🌑',
            hp: 34, damage: 8, reward: 20,
            story: 'At the top of the spire, a shadow surrounds the Star Lantern. Restore its light!',
            riddle: 'What can fill a room but takes up no space?',
            choices: ['A boulder', 'A blanket', 'Light'], answer: 2,
            hint: 'It shines from a lantern.'
        }
    ];
    const maxFocus = 3;

    function initial() {
        return {
            version: 1, started: false, alias: 'Nova', role: 'warden', color: 'teal', companion: 'fox',
            hp: roles.warden.hp, focus: maxFocus, shards: 0, potions: 2, weapon: 0, armor: 0,
            defeated: [], discoveries: [], scene: 'camp', zone: null, enemyHp: null
        };
    }

    function valid(state) {
        const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
        const own = (map, value) => Object.hasOwn(map, value);
        const validList = (list) => Array.isArray(list) && list.every(value => integer(value, 0, zones.length - 1)) && new Set(list).size === list.length;
        if (!state || state.version !== 1 || typeof state.started !== 'boolean' || !aliases.includes(state.alias)
            || !own(roles, state.role) || !own(colors, state.color) || !own(companions, state.companion)
            || !integer(state.hp, 1, roles[state.role].hp) || !integer(state.focus, 0, maxFocus)
            || !integer(state.shards, 0, Number.MAX_SAFE_INTEGER) || !integer(state.potions, 0, 3)
            || !integer(state.weapon, 0, 3) || !integer(state.armor, 0, 3)
            || !validList(state.defeated) || !validList(state.discoveries)
            || !['camp', 'zone', 'puzzle', 'battle', 'victory'].includes(state.scene)) return false;
        if (state.defeated.some((zone, i) => zone !== i)) return false;
        if (!state.started && (state.scene !== 'camp' || state.defeated.length || state.discoveries.length)) return false;
        if (state.scene === 'camp') return state.zone === null && state.enemyHp === null;
        if (!state.started || !integer(state.zone, 0, zones.length - 1) || state.zone > state.defeated.length) return false;
        if (state.scene === 'battle') return integer(state.enemyHp, 1, zones[state.zone].hp);
        return state.enemyHp === null;
    }

    function restore(serialized) {
        const state = JSON.parse(serialized);
        if (!valid(state)) throw new Error('Invalid adventure save.');
        return state;
    }

    const result = (ok, message) => ({ ok, message });

    function configure(state, hero) {
        if (state.scene !== 'camp') return result(false, 'Return to camp before changing your hero.');
        if (!aliases.includes(hero.alias) || !Object.hasOwn(roles, hero.role)
            || !Object.hasOwn(colors, hero.color) || !Object.hasOwn(companions, hero.companion)) {
            return result(false, 'Choose valid hero options.');
        }
        state.alias = hero.alias;
        state.role = hero.role;
        state.color = hero.color;
        state.companion = hero.companion;
        state.started = true;
        state.hp = roles[state.role].hp;
        state.focus = maxFocus;
        return result(true, `${state.alias} is ready for adventure!`);
    }

    function travel(state, index) {
        if (!state.started || state.scene !== 'camp' || !Number.isInteger(index) || index < 0 || index >= zones.length || index > state.defeated.length) {
            return result(false, 'That destination is not available yet.');
        }
        state.zone = index;
        state.scene = 'zone';
        return result(true, `You arrived at ${zones[index].name}.`);
    }

    function investigate(state) {
        if (state.scene !== 'zone') return result(false, 'Explore a destination first.');
        if (state.discoveries.includes(state.zone)) return result(false, 'You already found this place’s hidden cache.');
        state.scene = 'puzzle';
        return result(true, 'Solve the clue to discover a cache of 3 shards.');
    }

    function answer(state, choice) {
        if (state.scene !== 'puzzle' || !Number.isInteger(choice) || choice < 0 || choice >= zones[state.zone].choices.length) {
            return result(false, 'Choose an answer to the clue.');
        }
        if (choice !== zones[state.zone].answer) return result(false, `Not quite. ${zones[state.zone].hint}`);
        state.shards += 3;
        state.discoveries.push(state.zone);
        state.scene = 'zone';
        return result(true, 'Clue solved! You found 3 shards.');
    }

    function startBattle(state) {
        if (state.scene !== 'zone') return result(false, 'Explore a destination first.');
        state.enemyHp = zones[state.zone].hp;
        state.scene = 'battle';
        return result(true, `${zones[state.zone].enemy} appears! Choose your move.`);
    }

    function back(state) {
        if (state.scene === 'puzzle') {
            state.scene = 'zone';
            return result(true, 'You can return to the clue later.');
        }
        if (['zone', 'battle', 'victory'].includes(state.scene)) {
            const retreated = state.scene === 'battle';
            state.scene = 'camp';
            state.zone = null;
            state.enemyHp = null;
            return result(true, retreated ? 'You retreated safely. Rest at camp when you are ready.' : 'Welcome back to camp.');
        }
        return result(false, 'You are already at camp.');
    }

    function turn(state, move, random = Math.random) {
        if (state.scene !== 'battle') return result(false, 'There is no battle right now.');
        const role = roles[state.role];
        const enemy = zones[state.zone];
        let damage = 0;
        let guard = false;
        let message = '';
        if (move === 'strike') {
            const roll = Math.floor(random() * 6) + 1;
            damage = role.strike - 3 + roll + state.weapon * 2;
            message = `You rolled ${roll} and strike for ${damage}.`;
        } else if (move === 'skill') {
            if (state.focus < role.cost) return result(false, 'Not enough focus. Guard to restore one focus.');
            state.focus -= role.cost;
            damage = role.skillDamage + state.weapon * 2;
            guard = role.shield;
            message = `${role.skill} deals ${damage}${guard ? ' and raises your shield' : ''}.`;
        } else if (move === 'guard') {
            guard = true;
            state.focus = Math.min(maxFocus, state.focus + 1);
            message = 'You guard and restore one focus.';
        } else if (move === 'potion') {
            if (!state.potions) return result(false, 'No potions left. Buy one at camp.');
            if (state.hp === role.hp) return result(false, 'Your health is already full.');
            state.potions--;
            const healed = Math.min(10, role.hp - state.hp);
            state.hp += healed;
            message = `You recover ${healed} health.`;
        } else {
            return result(false, 'Choose a valid battle move.');
        }
        state.enemyHp = Math.max(0, state.enemyHp - damage);
        if (!state.enemyHp) {
            state.shards += enemy.reward;
            if (!state.defeated.includes(state.zone)) state.defeated.push(state.zone);
            state.enemyHp = null;
            state.scene = 'victory';
            const ending = state.defeated.length === zones.length ? ' The Star Lantern shines again!' : ' A new path is open!';
            return result(true, `${message} You overcame ${enemy.enemy} and earned ${enemy.reward} shards.${ending}`);
        }
        const incoming = Math.max(1, enemy.damage - state.armor);
        const taken = guard ? Math.max(1, Math.ceil(incoming / 2)) : incoming;
        state.hp -= taken;
        if (state.hp <= 0) {
            state.hp = 1;
            state.scene = 'camp';
            state.zone = null;
            state.enemyHp = null;
            return result(true, `${message} The guardian dealt ${taken}. You returned safely to camp; rest and try again.`);
        }
        return result(true, `${message} ${enemy.enemy} deals ${taken} damage.`);
    }

    function rest(state) {
        if (!state.started || state.scene !== 'camp') return result(false, 'Rest is available at camp.');
        state.hp = roles[state.role].hp;
        state.focus = maxFocus;
        return result(true, 'You and your companion rest. Health and focus are full.');
    }

    function buy(state, item) {
        if (!state.started || state.scene !== 'camp') return result(false, 'The camp shop is not available right now.');
        let cost;
        if (item === 'potion') {
            if (state.potions >= 3) return result(false, 'You can carry at most 3 potions.');
            cost = 4;
        } else if (item === 'weapon' || item === 'armor') {
            if (state[item] >= 3) return result(false, 'That upgrade is already at its maximum.');
            cost = 6 + state[item] * 5;
        } else {
            return result(false, 'Choose a valid shop item.');
        }
        if (state.shards < cost) return result(false, `You need ${cost} shards for that.`);
        state.shards -= cost;
        if (item === 'potion') state.potions++;
        else state[item]++;
        return result(true, item === 'potion' ? 'A potion joined your pack!' : `Your ${item} is now level ${state[item]}.`);
    }

    return { roles, colors, companions, aliases, zones, maxFocus, initial, valid, restore, configure, travel, investigate, answer, startBattle, back, turn, rest, buy };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = FableEngine;
