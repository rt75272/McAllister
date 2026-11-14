(() => {
    const storageKey = 'planetPolusCrewV1';
    const colors = {
        Red: '#d94d55', Blue: '#4d79ce', Green: '#4b9e65', Pink: '#e58db6',
        Orange: '#ed9545', Yellow: '#e5c64c', Black: '#515968', Cyan: '#5bbdc5',
        Purple: '#9472c9', White: '#e8eef2', Teal: '#278c88'
    };
    const visorColors = { ice: '#a9dce7', rose: '#f1b9cc', gold: '#f2d58c', mint: '#a7e1c8' };
    const bodyScales = { classic: [1, 1], wide: [1.2, 1], slim: [0.8, 1], tall: [0.9, 1.12] };
    const hats = ['none', 'sprout', 'party', 'note', 'robot', 'cap', 'crown'];
    const appearanceOptions = {
        body: Object.keys(bodyScales), face: ['round', 'oval', 'square'], visor: Object.keys(visorColors),
        mouth: ['smile', 'grin', 'surprised', 'calm'], eyes: ['classic', 'happy', 'sleepy', 'star'],
        glasses: ['none', 'round', 'star'],
        shirt: ['suit', 'tee', 'stripe', 'jacket'],
        shirtColor: Object.keys(colors),
        bottoms: ['suit', 'shorts', 'pants'],
        bottomsColor: Object.keys(colors),
        shoes: ['none', 'boots', 'sneakers'],
        shoesColor: Object.keys(colors)
    };
    const appearanceDefaults = {
        body: 'classic', face: 'round', visor: 'ice', mouth: 'smile',
        eyes: 'classic', glasses: 'none', shirt: 'suit', shirtColor: 'Blue',
        bottoms: 'suit', bottomsColor: 'Blue', shoes: 'none', shoesColor: 'Black'
    };
    const appearanceInputs = {
        body: 'crew-body', face: 'crew-face', visor: 'crew-visor', mouth: 'crew-mouth',
        eyes: 'crew-eyes', glasses: 'crew-glasses', shirt: 'crew-shirt', shirtColor: 'crew-shirt-color',
        bottoms: 'crew-bottoms', bottomsColor: 'crew-bottoms-color', shoes: 'crew-shoes', shoesColor: 'crew-shoes-color'
    };
    const sections = ['Section 1', 'Section 2', 'Section 3'];
    const namePattern = /^(\p{L}+(?:['’-]\p{L}+)*)\s+(\p{L})\.?$/u;
    const $ = id => document.getElementById(id);
    const form = $('crew-form');
    const status = $('hq-status');
    const stage = $('meeting-stage');
    const meetingButton = $('call-meeting');
    let crew = [];
    let selectedId = null;
    let meetingTimer = null;
    let storageReady = false;

    document.querySelectorAll('.clothing-color').forEach(select => {
        Object.keys(colors).forEach(color => select.add(new Option(color, color)));
    });

    function validEntry(entry) {
        return entry && typeof entry.id === 'string' && typeof entry.name === 'string'
            && entry.name.length <= 34 && namePattern.test(entry.name)
            && sections.includes(entry.section) && Object.hasOwn(colors, entry.color)
            && hats.includes(entry.hat) && Number.isSafeInteger(entry.passes) && entry.passes >= 0
            && Object.entries(appearanceOptions).every(([key, options]) =>
                entry[key] === undefined || options.includes(entry[key]));
    }

    function readCrew() {
        try {
            const raw = localStorage.getItem(storageKey);
            const parsed = raw === null ? [] : JSON.parse(raw);
            if (!Array.isArray(parsed) || !parsed.every(validEntry)
                || new Set(parsed.map(entry => entry.id)).size !== parsed.length) {
                throw new Error('Invalid roster data.');
            }
            crew = parsed;
            storageReady = true;
            return true;
        } catch (error) {
            storageReady = false;
            status.textContent = 'Could not read the roster. Browser storage may be unavailable or the saved data may be invalid; no data was overwritten.';
            return false;
        }
    }

    function saveCrew(next) {
        try {
            localStorage.setItem(storageKey, JSON.stringify(next));
            crew = next;
            return true;
        } catch (error) {
            status.textContent = 'Could not save the roster. Check browser storage and try again.';
            return false;
        }
    }

    function makeAvatar(person) {
        const svg = $('explorer-template').content.firstElementChild.cloneNode(true);
        const appearance = { ...appearanceDefaults, ...person };
        svg.style.setProperty('--suit-color', colors[person.color]);
        svg.style.setProperty('--shirt-color', colors[appearance.shirtColor]);
        svg.style.setProperty('--bottoms-color', colors[appearance.bottomsColor]);
        svg.style.setProperty('--shoes-color', colors[appearance.shoesColor]);
        svg.style.setProperty('--visor-color', visorColors[appearance.visor]);
        const [width, height] = bodyScales[appearance.body];
        svg.querySelector('.body-shape').setAttribute('transform', `translate(100 120) scale(${width} ${height}) translate(-100 -120)`);
        svg.querySelectorAll('.accessory').forEach(accessory => {
            accessory.toggleAttribute('hidden', accessory.dataset.hat !== person.hat);
        });
        ['face', 'mouth', 'eyes', 'glasses', 'shirt', 'bottoms', 'shoes'].forEach(part => {
            svg.querySelectorAll(`[data-${part}]`).forEach(element => {
                element.toggleAttribute('hidden', element.dataset[part] !== appearance[part]);
            });
        });
        svg.setAttribute('aria-label', `${person.color} space explorer`);
        return svg;
    }

    function currentAppearance() {
        return Object.fromEntries(Object.entries(appearanceInputs).map(([key, id]) => [key, $(id).value]));
    }

    function renderPreview() {
        $('crew-preview').replaceChildren(makeAvatar({
            color: $('crew-color').value, hat: $('crew-hat').value, ...currentAppearance()
        }));
        $('preview-name').textContent = $('crew-name').value.trim()
            ? window.studentDisplayName($('crew-name').value) : 'Your space explorer';
    }

    function renderCharacterChoices(selected = $('crew-edit').value) {
        const select = $('crew-edit');
        select.replaceChildren(new Option('Create a new character', ''));
        crew.forEach(person => select.add(new Option(`${person.name} · ${person.section}`, person.id)));
        if (selected && !crew.some(person => person.id === selected)) {
            select.add(new Option('Character no longer available', selected));
        }
        select.value = selected;
        $('save-character').textContent = select.value ? 'Update Character' : 'Save Character';
    }

    function loadCharacter(person) {
        const appearance = { ...appearanceDefaults, ...person };
        $('crew-name').value = person.name;
        $('crew-section').value = person.section;
        $('crew-color').value = person.color;
        $('crew-hat').value = person.hat;
        Object.entries(appearanceInputs).forEach(([key, id]) => { $(id).value = appearance[key]; });
        renderPreview();
    }

    function renderRoster() {
        const body = $('crew-roster');
        body.replaceChildren();
        const entries = crew.filter(person => person.section === $('meeting-section').value);
        if (!entries.length) {
            const row = body.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 3;
            cell.textContent = 'No students in this section yet.';
        }
        entries.forEach(person => {
            const row = body.insertRow();
            [person.name, `${person.color} · ${person.hat === 'none' ? 'No accessory' : person.hat}`, String(person.passes)]
                .forEach(value => { row.insertCell().textContent = value; });
        });
    }

    function resetMeeting() {
        if (meetingTimer !== null) clearInterval(meetingTimer);
        meetingTimer = null;
        selectedId = null;
        stage.classList.remove('is-meeting', 'is-ejected');
        $('meeting-avatar').replaceChildren();
        $('meeting-name').textContent = '';
        $('meeting-message').textContent = 'Ready for a meeting.';
        $('meeting-actions').hidden = true;
        $('meeting-reward').replaceChildren();
        meetingButton.disabled = !storageReady;
        $('meeting-section').disabled = false;
    }

    function showPerson(person) {
        $('meeting-avatar').replaceChildren(makeAvatar(person));
        $('meeting-name').textContent = person.name;
    }

    function randomIndex(length) {
        const limit = Math.floor(0x100000000 / length) * length;
        const value = new Uint32Array(1);
        do { crypto.getRandomValues(value); } while (value[0] >= limit);
        return value[0] % length;
    }

    function setMode(teacher) {
        resetMeeting();
        $('student-view').hidden = teacher;
        $('teacher-view').hidden = !teacher;
        $('student-mode').setAttribute('aria-pressed', String(!teacher));
        $('teacher-mode').setAttribute('aria-pressed', String(teacher));
        if (readCrew()) {
            status.textContent = '';
            renderRoster();
            renderCharacterChoices();
        }
        meetingButton.disabled = !storageReady;
    }

    $('student-mode').addEventListener('click', () => setMode(false));
    $('teacher-mode').addEventListener('click', () => setMode(true));
    ['crew-name', 'crew-color', 'crew-hat', ...Object.values(appearanceInputs)]
        .forEach(id => $(id).addEventListener('input', renderPreview));
    $('crew-edit').addEventListener('change', () => {
        const id = $('crew-edit').value;
        if (!id) {
            form.reset();
            Object.entries(appearanceInputs).forEach(([key, input]) => { $(input).value = appearanceDefaults[key]; });
            renderPreview();
            $('save-character').textContent = 'Save Character';
            return;
        }
        if (!readCrew()) return;
        const person = crew.find(item => item.id === id);
        if (!person) {
            renderCharacterChoices('');
            status.textContent = 'That character is no longer in the roster.';
            return;
        }
        loadCharacter(person);
        $('save-character').textContent = 'Update Character';
        status.textContent = 'Character loaded. Change the look, then select Update Character.';
    });
    const actionMessages = {
        wave: 'Your explorer waves hello!', dance: 'Your explorer dances among the stars!',
        cheer: 'Your explorer cheers for the crew!', rest: 'Your explorer takes a peaceful space break.'
    };
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            const preview = $('crew-preview');
            preview.classList.remove('is-wave', 'is-dance', 'is-cheer', 'is-rest');
            void preview.offsetWidth;
            preview.classList.add(`is-${action}`);
            $('character-response').textContent = actionMessages[action];
        });
    });
    $('crew-preview').addEventListener('animationend', () => {
        $('crew-preview').classList.remove('is-wave', 'is-dance', 'is-cheer', 'is-rest');
    });
    form.addEventListener('submit', event => {
        event.preventDefault();
        const name = $('crew-name').value.trim().replace(/\s+/g, ' ');
        const match = namePattern.exec(name);
        if (!match || match[1].length > 30) {
            status.textContent = 'Enter one first name and one last initial, such as Alex M.';
            $('crew-name').focus();
            return;
        }
        if (!readCrew()) return;
        const normalizedName = `${match[1]} ${match[2].toLocaleUpperCase()}.`;
        const section = $('crew-section').value;
        const color = $('crew-color').value;
        const hat = $('crew-hat').value;
        const appearance = currentAppearance();
        if (!sections.includes(section) || !Object.hasOwn(colors, color) || !hats.includes(hat)
            || !Object.entries(appearanceOptions).every(([key, options]) => options.includes(appearance[key]))) {
            status.textContent = 'Choose valid character customization options.';
            return;
        }
        const editId = $('crew-edit').value;
        const existing = editId ? crew.find(item => item.id === editId) : null;
        if (editId && !existing) {
            renderCharacterChoices('');
            status.textContent = 'That character is no longer in the roster. No changes were saved.';
            return;
        }
        if (!existing && (!window.crypto || !window.crypto.getRandomValues)) {
            status.textContent = 'This browser cannot create a secure student ID.';
            return;
        }
        const id = existing ? existing.id : Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
        const person = { ...existing, id, name: normalizedName, section, color, hat, ...appearance, passes: existing ? existing.passes : 0 };
        if (!saveCrew(existing ? crew.map(item => item.id === id ? person : item) : [...crew, person])) return;
        status.textContent = existing ? 'Character updated on this browser!' : 'Character saved on this browser!';
        renderCharacterChoices(id);
        renderRoster();
    });

    $('meeting-section').addEventListener('change', () => {
        resetMeeting();
        if (readCrew()) renderRoster();
        meetingButton.disabled = !storageReady;
    });
    meetingButton.addEventListener('click', () => {
        if (!readCrew()) { meetingButton.disabled = true; return; }
        const pool = crew.filter(person => person.section === $('meeting-section').value);
        if (!pool.length) {
            status.textContent = 'No students in this section yet. Add a character first.';
            renderRoster();
            return;
        }
        if (!window.crypto || !window.crypto.getRandomValues) {
            status.textContent = 'This browser cannot randomly select a student.';
            return;
        }
        status.textContent = '';
        resetMeeting();
        meetingButton.disabled = true;
        $('meeting-section').disabled = true;
        $('meeting-message').textContent = 'Scanning the crew…';
        stage.classList.add('is-meeting');
        const winner = pool[randomIndex(pool.length)];
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let frame = 0;
        function finishMeeting() {
            clearInterval(meetingTimer);
            meetingTimer = null;
            stage.classList.remove('is-meeting');
            showPerson(winner);
            selectedId = winner.id;
            $('meeting-message').textContent = `Crew member selected: ${winner.name}.`;
            $('meeting-actions').hidden = false;
            $('meeting-section').disabled = false;
        }
        if (reducedMotion) {
            finishMeeting();
        } else {
            showPerson(pool[0]);
            meetingTimer = setInterval(() => {
                frame++;
                if (frame >= 16) finishMeeting();
                else showPerson(pool[frame % pool.length]);
            }, 120);
        }
    });

    $('confirm-crew').addEventListener('click', () => {
        if (!selectedId || !readCrew()) return;
        const person = crew.find(item => item.id === selectedId);
        if (!person) { resetMeeting(); status.textContent = 'That student is no longer in the roster.'; renderRoster(); return; }
        if (person.passes >= Number.MAX_SAFE_INTEGER) { status.textContent = 'Pass count is at its maximum.'; return; }
        if (!saveCrew(crew.map(item => item.id === selectedId ? { ...item, passes: item.passes + 1 } : item))) return;
        selectedId = null;
        $('meeting-actions').hidden = true;
        $('meeting-message').textContent = '🌟 Crewmate confirmed! Great work following expectations.';
        const ticket = document.createElement('span');
        ticket.className = 'reward-ticket';
        ticket.textContent = '🎟️ 1 Assignment Pass';
        $('meeting-reward').replaceChildren(ticket);
        meetingButton.disabled = false;
        renderRoster();
    });
    $('eject-crew').addEventListener('click', () => {
        if (!selectedId) return;
        selectedId = null;
        $('meeting-actions').hidden = true;
        $('meeting-message').textContent = 'Student was ejected. Back to the pool for the next meeting!';
        stage.classList.add('is-ejected');
        meetingButton.disabled = false;
    });
    $('clear-roster').addEventListener('click', () => {
        if (!window.confirm('Delete all students and passes stored in this browser? This cannot be undone.')) return;
        if (!readCrew() || !saveCrew([])) return;
        resetMeeting();
        renderRoster();
        renderCharacterChoices('');
        status.textContent = 'This browser’s roster was cleared.';
    });
    window.addEventListener('storage', event => {
        if (event.key !== storageKey && event.key !== null) return;
        resetMeeting();
        if (readCrew()) {
            renderRoster();
            renderCharacterChoices();
            status.textContent = 'Roster updated in another tab.';
        }
        meetingButton.disabled = !storageReady;
    });
    Object.entries(appearanceInputs).forEach(([key, id]) => { $(id).value = appearanceDefaults[key]; });
    renderPreview();
    if (readCrew()) {
        renderRoster();
        renderCharacterChoices();
    }
    meetingButton.disabled = !storageReady;
})();
