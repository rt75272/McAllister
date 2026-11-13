(() => {
    const catalog = {
        'pixel-pup': { name: 'Pixel Pup', emoji: '🐶', cost: 3 },
        'mochi-mooncat': { name: 'Mochi Mooncat', emoji: '🐱', cost: 6 },
        'orbit-otter': { name: 'Orbit Otter', emoji: '🦦', cost: 12 },
        'nebula-axolotl': { name: 'Nebula Axolotl', emoji: '🦎', cost: 22 }
    };
    const colors = { mint: '#d1fae5', sky: '#bae6fd', lavender: '#e9d5ff', peach: '#fed7aa', gold: '#fef08a' };
    const meadow = document.getElementById('meadow');
    const details = document.getElementById('pet-details');
    const feedback = document.getElementById('planet-feedback');
    let pets = [];
    let selectedId = null;
    let busy = false;
    let loaded = false;
    let requestNumber = 0;
    let lastState = '';
    let playgroundPetId = null;

    function element(tag, text, className) {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (className) node.className = className;
        return node;
    }

    function button(text, callback) {
        const node = element('button', text);
        node.type = 'button';
        node.disabled = busy;
        node.addEventListener('click', callback);
        return node;
    }

    async function request(url, options) {
        const response = await fetch(url, { ...options, redirect: 'error' });
        if (!response.headers.get('content-type')?.includes('application/json')) {
            throw new Error('Your session may have expired. Please refresh and sign in again.');
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
        return data;
    }

    async function refresh() {
        const number = ++requestNumber;
        const state = await request('/api/pet-planet');
        if (number !== requestNumber) return;
        const serialized = JSON.stringify(state);
        if (loaded && serialized === lastState) return;
        lastState = serialized;
        loaded = true;
        pets = state.pets.filter(pet => catalog[pet.kind]);
        document.getElementById('planet-coins').textContent = state.coins;
        render();
    }

    function render() {
        meadow.replaceChildren();
        if (!pets.length) meadow.append(element('p', 'The meadow is waiting for its first pet. Adopt one below!'));
        pets.forEach(pet => {
            const info = catalog[pet.kind];
            const card = button('', () => { selectedId = pet.id; render(); });
            card.className = 'pet-card';
            card.style.setProperty('--pet-color', colors[pet.color] || colors.mint);
            card.setAttribute('aria-pressed', String(pet.id === selectedId));
            card.append(element('span', info.emoji, 'pet-emoji'), element('strong', info.name), element('span', pet.mine ? '★ Your pet' : 'Meadow friend'));
            meadow.append(card);
        });
        const pet = pets.find(item => item.id === selectedId);
        if ((pet?.id ?? null) !== playgroundPetId) {
            playgroundPetId = pet?.id ?? null;
            window.dispatchEvent(new CustomEvent('pet-planet:selection', {
                detail: pet ? { id: pet.id, name: catalog[pet.kind].name, emoji: catalog[pet.kind].emoji } : null
            }));
        }
        details.replaceChildren();
        if (!pet) {
            const icon = element('div', '🐾', 'empty-pet-icon');
            icon.setAttribute('aria-hidden', 'true');
            details.append(icon, element('p', 'Choose a pet in the meadow to begin.'));
        } else {
            const info = catalog[pet.kind];
            details.append(element('div', info.emoji, 'pet-detail-emoji'), element('h3', `${info.name}${pet.mine ? ' ★' : ''}`));
            details.append(element('p', `👋 ${pet.pats} pats · 🎾 ${pet.plays} playtimes · 🍪 ${pet.treats} treats · 🧸 ${pet.toys} toys`));
            const activities = element('div', undefined, 'activity-buttons');
            activities.append(button('👋 Give a pat', () => act(pet.id, 'pat')), button('🎾 Play', () => act(pet.id, 'play')));
            if (pet.mine) {
                activities.append(button('🍪 Treat · 2 coins', () => act(pet.id, 'treat')), button('🧸 Toy · 4 coins', () => act(pet.id, 'toy')));
            }
            details.append(activities);
            const playgroundLink = element('a', '🎲 Play playground games');
            playgroundLink.href = '#pet-playground';
            playgroundLink.className = 'playground-link';
            details.append(playgroundLink);
            if (pet.mine) {
                details.append(element('h3', 'Choose a meadow color'));
                const palette = element('div', undefined, 'colors');
                Object.keys(colors).forEach(color => {
                    const choice = button(color, () => act(pet.id, 'color', color));
                    choice.style.setProperty('--swatch-color', colors[color]);
                    choice.setAttribute('aria-pressed', String(pet.color === color));
                    palette.append(choice);
                });
                details.append(palette);
            }
        }
        const adoption = document.getElementById('adoption');
        adoption.replaceChildren();
        Object.entries(catalog).forEach(([id, info]) => {
            const owned = pets.some(pet => pet.mine && pet.kind === id);
            const card = element('div', undefined, 'adoption-card');
            card.append(element('div', info.emoji, 'pet-emoji'), element('h3', info.name));
            const adopt = button(owned ? 'Already adopted' : `Adopt · ${info.cost} coins`, () => buy(id));
            adopt.disabled = busy || owned;
            card.append(adopt);
            adoption.append(card);
        });
    }

    async function submit(url, values, success) {
        if (busy) return;
        busy = true;
        requestNumber++;
        render();
        try {
            await request(url, {
                method: 'POST',
                body: new URLSearchParams({ ...values, csrf_token: window.accountCoinContext.csrfToken })
            });
            await refresh();
            feedback.textContent = success;
        } catch (error) {
            feedback.textContent = error.message || 'Could not reach Pet Planet. Please try again.';
        } finally {
            busy = false;
            render();
        }
    }

    function act(id, action, color = '') {
        const messages = { pat: 'A friendly pat!', play: 'Playtime was a hit!', treat: 'A tasty treat!', toy: 'A new toy to enjoy!', color: 'Your pet has a new meadow color!' };
        submit(`/api/pet-planet/pets/${id}`, { action, color }, messages[action]);
    }
    function buy(id) {
        submit('/api/account/character/action', { item_type: 'pet', item_key: id, action: 'buy' }, `${catalog[id].name} joined the meadow!`);
    }
    async function load() {
        try {
            await refresh();
        } catch (error) {
            feedback.textContent = error.message || 'Could not load the meadow. Please try again.';
            if (!loaded) meadow.replaceChildren(element('p', 'The meadow could not be loaded. Try Refresh.'));
        }
    }
    document.getElementById('refresh-meadow').addEventListener('click', load);
    load();
    window.setInterval(() => {
        if (!busy && !document.hidden && !document.activeElement.closest('.planet-layout, #adoption')) load();
    }, 10000);
})();
