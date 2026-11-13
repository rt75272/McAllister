(() => {
    const storageKey = 'fableQuestSaveV1';
    const engine = FableEngine;
    const scene = document.getElementById('quest-scene');
    const stats = document.getElementById('hero-stats');
    const feedback = document.getElementById('quest-feedback');
    const saveStatus = document.getElementById('fable-save-status');
    const form = document.getElementById('hero-form');
    const alias = document.getElementById('hero-alias');
    const role = document.getElementById('hero-role');
    const color = document.getElementById('hero-color');
    const companion = document.getElementById('hero-companion');
    const controls = [alias, role, color, companion];
    let state = engine.initial();

    try {
        const saved = localStorage.getItem(storageKey);
        if (saved !== null) {
            try {
                state = engine.restore(saved);
                saveStatus.textContent = 'Adventure loaded from this browser.';
            } catch (error) {
                console.error('Unable to read the adventure save:', error);
                saveStatus.textContent = 'The saved adventure could not be read. Beginning a new adventure will replace it.';
            }
        }
    } catch (error) {
        console.error('Unable to access adventure storage:', error);
        saveStatus.textContent = 'Browser storage is unavailable. Progress may not be saved.';
    }

    function persist() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(state));
            saveStatus.textContent = 'Progress saved in this browser.';
        } catch (error) {
            console.error('Unable to save the adventure:', error);
            saveStatus.textContent = 'Progress could not be saved. You can play now, but changes may be lost when you leave.';
        }
    }

    function element(tag, text, className) {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (className) node.className = className;
        return node;
    }

    function button(text, key, callback, options = {}) {
        const node = element('button', text, options.secondary ? 'fable-secondary' : '');
        node.type = 'button';
        node.dataset.action = key;
        node.disabled = Boolean(options.disabled);
        node.addEventListener('click', () => perform(callback, key));
        return node;
    }

    function perform(action, focusKey) {
        const result = action();
        feedback.textContent = result.message;
        if (result.ok) persist();
        render();
        const next = Array.from(scene.querySelectorAll('button')).find(node => node.dataset.action === focusKey && !node.disabled);
        (next || scene.querySelector('h3'))?.focus();
    }

    function syncForm() {
        alias.value = state.alias;
        role.value = state.role;
        color.value = state.color;
        companion.value = state.companion;
        updatePreview();
    }

    function updatePreview() {
        document.querySelector('.hero-svg').style.setProperty('--hero-color', engine.colors[color.value]);
        document.getElementById('hero-preview-text').textContent = `${alias.value} · ${engine.roles[role.value].name} · ${engine.companions[companion.value]}`;
    }

    function sceneCard(title) {
        const card = element('div', undefined, 'scene-card');
        const heading = element('h3', title);
        heading.tabIndex = -1;
        card.append(heading);
        return card;
    }

    function render() {
        const inCamp = state.scene === 'camp';
        controls.forEach(control => { control.disabled = !inCamp; });
        document.getElementById('save-hero').disabled = !inCamp;
        document.getElementById('save-hero').textContent = state.started ? 'Save hero changes' : 'Begin adventure';
        document.getElementById('hero-edit-note').textContent = inCamp ? 'You can change your hero at camp. Saving restores health and focus.' : 'Return to camp to change your hero.';
        stats.replaceChildren();
        if (state.started) {
            const heroRole = engine.roles[state.role];
            [
                `❤️ Health ${state.hp}/${heroRole.hp}`,
                `✨ Focus ${state.focus}/${engine.maxFocus}`,
                `🔮 ${state.shards} shards`,
                `🧪 ${state.potions} potions`,
                `⚔️ Weapon ${state.weapon}`,
                `🛡️ Armor ${state.armor}`
            ].forEach(text => stats.append(element('span', text)));
        }
        scene.replaceChildren();
        if (!state.started) {
            scene.append(element('p', 'Choose your hero and begin the adventure.'));
        } else if (state.scene === 'camp') {
            renderCamp();
        } else if (state.scene === 'zone') {
            renderZone();
        } else if (state.scene === 'puzzle') {
            renderPuzzle();
        } else if (state.scene === 'battle') {
            renderBattle();
        } else if (state.scene === 'victory') {
            renderVictory();
        }
    }

    function renderCamp() {
        const card = sceneCard('🏕️ Starlight Camp');
        card.append(element('p', `Welcome, ${state.alias}! Rest here, improve your equipment, and choose where to travel.`));
        const locations = element('div', undefined, 'zone-list');
        engine.zones.forEach((zone, index) => {
            const unlocked = index <= state.defeated.length;
            const location = element('div', undefined, 'zone-card');
            location.append(element('h4', `${zone.icon} ${zone.name}`));
            location.append(element('p', !unlocked ? 'Locked: complete the previous area.' : state.defeated.includes(index) ? 'Completed · replay for shards' : 'Ready to explore'));
            location.append(button(unlocked ? 'Explore' : 'Locked', `travel-${index}`, () => engine.travel(state, index), { disabled: !unlocked }));
            locations.append(location);
        });
        card.append(locations);
        card.append(button('Rest · free', 'rest', () => engine.rest(state), { secondary: true }));
        card.append(element('h4', 'Camp shop'));
        card.append(element('p', 'Weapon upgrades add 2 damage. Armor upgrades block 1 damage. Each can reach level 3.'));
        const shop = element('div', undefined, 'scene-actions');
        shop.append(
            button('Potion · 4 shards', 'buy-potion', () => engine.buy(state, 'potion'), { disabled: state.potions >= 3 }),
            button(state.weapon === 3 ? 'Weapon · max level' : `Upgrade weapon · ${6 + state.weapon * 5} shards`, 'buy-weapon', () => engine.buy(state, 'weapon'), { disabled: state.weapon === 3 }),
            button(state.armor === 3 ? 'Armor · max level' : `Upgrade armor · ${6 + state.armor * 5} shards`, 'buy-armor', () => engine.buy(state, 'armor'), { disabled: state.armor === 3 })
        );
        card.append(shop);
        card.append(button('Start a new adventure', 'reset', reset, { secondary: true }));
        scene.append(card);
    }

    function renderZone() {
        const zone = engine.zones[state.zone];
        const card = sceneCard(`${zone.icon} ${zone.name}`);
        card.append(element('p', zone.story));
        card.append(element('p', `Guardian: ${zone.enemy} · Reward: ${zone.reward} shards`));
        const found = state.discoveries.includes(state.zone);
        card.append(
            button(found ? 'Hidden cache found' : 'Investigate the clue · 3 shards', 'investigate', () => engine.investigate(state), { disabled: found, secondary: true }),
            button('Challenge the guardian', 'battle', () => engine.startBattle(state)),
            button('Return to camp', 'back', () => engine.back(state), { secondary: true })
        );
        scene.append(card);
    }

    function renderPuzzle() {
        const zone = engine.zones[state.zone];
        const card = sceneCard('🔍 A hidden clue');
        card.append(element('p', zone.riddle));
        const choices = element('div', undefined, 'scene-actions');
        zone.choices.forEach((choice, index) => choices.append(button(choice, `answer-${index}`, () => engine.answer(state, index))));
        card.append(choices, button('Back to exploring', 'back', () => engine.back(state), { secondary: true }));
        scene.append(card);
    }

    function renderBattle() {
        const zone = engine.zones[state.zone];
        const heroRole = engine.roles[state.role];
        const card = sceneCard('⚔️ Guardian encounter');
        card.append(element('p', `${zone.enemyIcon} ${zone.enemy} · Health ${state.enemyHp}/${zone.hp} · Attack ${zone.damage}`, 'battle-foe'));
        card.append(element('p', `Strike: roll 1–6 + ${heroRole.strike - 3 + state.weapon * 2} damage. ${heroRole.skill}: ${heroRole.skillDamage + state.weapon * 2} damage, costs ${heroRole.cost} focus${heroRole.shield ? ', and reduces the next hit' : ''}.`));
        const actions = element('div', undefined, 'scene-actions');
        actions.append(
            button('🎲 Strike · roll 1–6', 'strike', () => engine.turn(state, 'strike')),
            button(`${heroRole.skill} · ${heroRole.cost} focus`, 'skill', () => engine.turn(state, 'skill'), { disabled: state.focus < heroRole.cost }),
            button('Guard · restore 1 focus', 'guard', () => engine.turn(state, 'guard'), { secondary: true }),
            button('Use potion · heal up to 10', 'potion', () => engine.turn(state, 'potion'), { disabled: !state.potions || state.hp === heroRole.hp, secondary: true }),
            button('Retreat to camp', 'back', () => engine.back(state), { secondary: true })
        );
        card.append(actions);
        scene.append(card);
    }

    function renderVictory() {
        const zone = engine.zones[state.zone];
        const card = sceneCard(`🎉 ${zone.name} cleared!`);
        card.append(element('p', state.defeated.length === engine.zones.length
            ? 'The Star Lantern shines again! The whole planet celebrates your journey. Replay an area whenever you like.'
            : 'A new path is open. Return to camp to rest or prepare for your next destination.'));
        card.append(button('Return to camp', 'back', () => engine.back(state)));
        scene.append(card);
    }

    function reset() {
        if (!window.confirm('Start over? This removes the adventure saved in this browser.')) {
            return { ok: false, message: 'Your adventure is unchanged.' };
        }
        state = engine.initial();
        syncForm();
        return { ok: true, message: 'Choose a hero to start a new adventure.' };
    }

    controls.forEach(control => control.addEventListener('change', updatePreview));
    form.addEventListener('submit', event => {
        event.preventDefault();
        const result = engine.configure(state, { alias: alias.value, role: role.value, color: color.value, companion: companion.value });
        feedback.textContent = result.message;
        if (result.ok) persist();
        render();
        scene.querySelector('h3')?.focus();
    });

    syncForm();
    render();
})();
