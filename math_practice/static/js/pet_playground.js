(() => {
    const companion = document.getElementById('playground-pet');
    const status = document.getElementById('playground-status');
    const gameArea = document.getElementById('playground-game');
    const huntButton = document.getElementById('start-hunt');
    const patternButton = document.getElementById('start-pattern');
    const symbols = [
        { name: 'Ball', icon: '🎾' },
        { name: 'Star', icon: '⭐' },
        { name: 'Leaf', icon: '🍃' },
        { name: 'Heart', icon: '💜' }
    ];
    let pet = null;
    let game = null;

    function element(tag, text, className) {
        const node = document.createElement(tag);
        if (text !== undefined) node.textContent = text;
        if (className) node.className = className;
        return node;
    }

    function button(text, callback) {
        const node = element('button', text);
        node.type = 'button';
        node.addEventListener('click', callback);
        return node;
    }

    function announce(message) {
        status.textContent = message;
    }

    function randomSymbol() {
        return Math.floor(Math.random() * symbols.length);
    }

    function startHunt() {
        const positions = Array.from({ length: 9 }, (_, index) => index);
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        game = { type: 'hunt', toys: new Set(positions.slice(0, 3)), opened: new Set(), found: 0 };
        announce(`${pet.name} is ready to find three hidden toys!`);
        render();
        focusGame();
    }

    function startPattern() {
        game = { type: 'pattern', sequence: [randomSymbol(), randomSymbol()], round: 1, position: 0, phase: 'show' };
        announce(`${pet.name} is ready to follow the paw pattern!`);
        render();
        focusGame();
    }

    function focusGame() {
        gameArea.querySelector('h3')?.focus({ preventScroll: true });
    }

    function render() {
        huntButton.setAttribute('aria-pressed', String(game?.type === 'hunt'));
        patternButton.setAttribute('aria-pressed', String(game?.type === 'pattern'));
        gameArea.replaceChildren();
        if (!game) return;
        const card = element('div', undefined, 'playground-game-card');
        const heading = element('h3', game.type === 'hunt' ? '🔎 Toy Hunt' : '🐾 Follow the Paw');
        heading.tabIndex = -1;
        card.append(heading);
        if (game.type === 'hunt') renderHunt(card);
        else renderPattern(card);
        gameArea.append(card);
    }

    function renderHunt(card) {
        card.append(element('p', `Find three toys hidden in the meadow. Toys found: ${game.found}/3 · Patches opened: ${game.opened.size}/9.`));
        if (game.found === 3) {
            card.append(element('p', `🎉 ${pet.name} found all three toys in ${game.opened.size} picks!`), button('Play Toy Hunt again', startHunt));
            return;
        }
        const grid = element('div', undefined, 'hunt-grid');
        grid.setAttribute('aria-label', 'Meadow patches');
        for (let index = 0; index < 9; index++) {
            const opened = game.opened.has(index);
            const found = opened && game.toys.has(index);
            const patch = button(opened ? (found ? '🎾' : '🌼') : '🌿', () => {
                game.opened.add(index);
                if (game.toys.has(index)) game.found++;
                announce(foundMessage(index));
                render();
                if (game.found === 3) focusGame();
                else gameArea.querySelector('.hunt-grid button:not(:disabled)')?.focus({ preventScroll: true });
            });
            patch.disabled = opened;
            patch.setAttribute('aria-label', `Patch ${index + 1}: ${opened ? (found ? 'toy found' : 'empty') : 'unopened'}`);
            grid.append(patch);
        }
        card.append(grid);
    }

    function foundMessage(index) {
        if (game.found === 3) return `All three toys found! ${pet.name} is ready to celebrate.`;
        return game.toys.has(index) ? `Toy found! ${game.found} of 3 toys collected.` : 'A flower, but no toy here. Try another patch.';
    }

    function renderPattern(card) {
        card.append(element('p', `Round ${game.round} of 3 · Pattern length: ${game.sequence.length}`));
        if (game.phase === 'complete') {
            card.append(element('p', `🎉 Brilliant teamwork! You and ${pet.name} completed all three rounds.`), button('Play Follow the Paw again', startPattern));
        } else if (game.phase === 'show') {
            card.append(element('p', 'Remember the pattern from left to right. When you are ready, hide it and repeat it.'));
            const sequence = element('ol', undefined, 'pattern-sequence');
            game.sequence.forEach((value, index) => sequence.append(element('li', `${index + 1}. ${symbols[value].icon} ${symbols[value].name}`)));
            card.append(sequence, button('Hide pattern and play', () => {
                game.phase = 'input';
                game.position = 0;
                announce('Pattern hidden. Repeat it in order.');
                render();
                gameArea.querySelector('.pattern-buttons button')?.focus({ preventScroll: true });
            }));
        } else {
            card.append(element('p', `Repeat the pattern in order. ${game.position} of ${game.sequence.length} correct.`));
            const choices = element('div', undefined, 'pattern-buttons');
            symbols.forEach((symbol, index) => {
                choices.append(button(`${symbol.icon} ${symbol.name}`, () => {
                    if (index !== game.sequence[game.position]) {
                        game.phase = 'show';
                        game.position = 0;
                        announce('Not quite! Look at the same pattern and try this round again.');
                        render();
                        focusGame();
                        return;
                    }
                    game.position++;
                    if (game.position === game.sequence.length) {
                        if (game.round === 3) {
                            game.phase = 'complete';
                            announce('All three rounds complete! Great teamwork.');
                        } else {
                            game.round++;
                            game.sequence.push(randomSymbol());
                            game.phase = 'show';
                            announce(`Round complete! A new step has been added for round ${game.round}.`);
                        }
                        render();
                        focusGame();
                    } else {
                        announce(`Correct! ${game.position} of ${game.sequence.length} steps.`);
                        render();
                        gameArea.querySelectorAll('.pattern-buttons button')[index]?.focus({ preventScroll: true });
                    }
                }));
            });
            card.append(choices);
        }
    }

    window.addEventListener('pet-planet:selection', (event) => {
        pet = event.detail;
        game = null;
        huntButton.disabled = !pet;
        patternButton.disabled = !pet;
        companion.textContent = pet ? `${pet.emoji} Playing with ${pet.name}. Choose a game!` : 'Choose a meadow pet to unlock the playground.';
        announce(pet ? `${pet.name} joined you in the playground.` : 'Choose another pet to play.');
        render();
    });
    huntButton.addEventListener('click', startHunt);
    patternButton.addEventListener('click', startPattern);
})();
