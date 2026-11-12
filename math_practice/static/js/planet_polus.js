(() => {
    const storageKey = 'planetPolusCrewV1';
    const colors = {
        Red: '#d94d55', Blue: '#4d79ce', Green: '#4b9e65', Pink: '#e58db6',
        Orange: '#ed9545', Yellow: '#e5c64c', Black: '#515968', Cyan: '#5bbdc5'
    };
    const hats = ['none', 'sprout', 'party', 'note', 'robot'];
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

    function validEntry(entry) {
        return entry && typeof entry.id === 'string' && typeof entry.name === 'string'
            && entry.name.length <= 34 && namePattern.test(entry.name)
            && sections.includes(entry.section) && Object.hasOwn(colors, entry.color)
            && hats.includes(entry.hat) && Number.isSafeInteger(entry.passes) && entry.passes >= 0;
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
        svg.style.setProperty('--suit-color', colors[person.color]);
        svg.querySelectorAll('.accessory').forEach(accessory => {
            accessory.toggleAttribute('hidden', accessory.dataset.hat !== person.hat);
        });
        svg.setAttribute('aria-label', `${person.color} space explorer`);
        return svg;
    }

    function renderPreview() {
        $('crew-preview').replaceChildren(makeAvatar({ color: $('crew-color').value, hat: $('crew-hat').value }));
        $('preview-name').textContent = $('crew-name').value.trim() || 'Your space explorer';
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
        }
        meetingButton.disabled = !storageReady;
    }

    $('student-mode').addEventListener('click', () => setMode(false));
    $('teacher-mode').addEventListener('click', () => setMode(true));
    ['crew-name', 'crew-color', 'crew-hat'].forEach(id => $(id).addEventListener('input', renderPreview));
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
        if (!sections.includes(section) || !Object.hasOwn(colors, color) || !hats.includes(hat)) {
            status.textContent = 'Choose a valid section, color, and accessory.';
            return;
        }
        if (!window.crypto || !window.crypto.getRandomValues) {
            status.textContent = 'This browser cannot create a secure student ID.';
            return;
        }
        const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
        const person = { id, name: normalizedName, section, color, hat, passes: 0 };
        if (!saveCrew([...crew, person])) return;
        status.textContent = 'Character saved on this browser!';
        $('crew-name').value = '';
        renderPreview();
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
        status.textContent = 'This browser’s roster was cleared.';
    });
    window.addEventListener('storage', event => {
        if (event.key !== storageKey && event.key !== null) return;
        resetMeeting();
        if (readCrew()) {
            renderRoster();
            status.textContent = 'Roster updated in another tab.';
        }
        meetingButton.disabled = !storageReady;
    });
    renderPreview();
    if (readCrew()) renderRoster();
    meetingButton.disabled = !storageReady;
})();
