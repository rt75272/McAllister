(() => {
    const storageKey = 'goldenAlgebraLastMission';
    const stages = ['briefing', 'outer-door', 'mainframe', 'master-vault', 'extraction'];
    const rules = {
        'node-a': { pattern: /^2\((x\+5|5\+x)\)$/, hint: '“Sum” means add x and 5; multiply the whole group by 2.' },
        'node-b': { pattern: /^3x-4$/, hint: 'Multiply the number by 3 first, then subtract 4.' },
        'node-c': { pattern: /^(7x|x\*?7)\/3$/, hint: 'Multiply 7 and x together, then use / to divide by 3.' },
        'firewall-1': { pattern: /^(2x\+10|10\+2x)$/, hint: 'Multiply 2 by both x and 5.' },
        'firewall-2': { pattern: /^5x-4$/, hint: 'Combine 3x and 2x; keep the -4.' },
        'firewall-3': { pattern: /^(4x\+2|2\+4x)$/, hint: 'Divide both 12x and 6 by 3.' },
        'override': { pattern: /^(2x\+10|10\+2x)-5x-4-(4x\+2|2\+4x)$/, hint: 'Use the three simplified codes in order, separated by dashes. Keep the minus sign in the second code.' }
    };
    let agent = '';
    const mission = document.querySelector('.mission');
    const presenceEndpoint = mission.dataset.presenceEndpoint;
    const csrfToken = mission.dataset.csrfToken;
    const playerStatus = document.getElementById('live-player-status');
    const playerList = document.getElementById('live-player-list');
    const presenceFeedback = document.getElementById('presence-feedback');
    let presenceRequestPending = false;
    let presenceRefreshQueued = false;
    let lastPlayerList = '';
    let currentStage = 'briefing';
    let totalAttempts = 0;
    let correctAnswers = 0;
    let missionCompleted = false;

    function setPlayerStatus(message) {
        const status = playerStatus || presenceFeedback;
        if (status.textContent !== message) status.textContent = message;
    }

    async function updateLivePlayers() {
        if (!agent && !playerList) return;
        if (presenceRequestPending) {
            presenceRefreshQueued = true;
            return;
        }
        presenceRequestPending = true;
        const options = agent
            ? {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'X-Requested-With': 'XMLHttpRequest' },
                body: new URLSearchParams({
                    csrf_token: csrfToken,
                    display_name: agent,
                    current_stage: currentStage,
                    total_attempts: String(totalAttempts),
                    correct_answers: String(correctAnswers),
                    mission_completed: String(missionCompleted),
                }),
            }
            : { credentials: 'same-origin', cache: 'no-store' };
        try {
            const response = await fetch(presenceEndpoint, options);
            if (!response.ok) throw new Error(`Presence request failed with status ${response.status}.`);
            const result = await response.json();
            if (!playerList) {
                if (result.ok !== true) throw new Error('Presence response did not confirm the update.');
                setPlayerStatus('');
                return;
            }
            if (!Array.isArray(result.players) || result.players.some((player) => typeof player.name !== 'string')) {
                throw new Error('Presence response contained an invalid player list.');
            }
            const names = result.players.map((player) => player.name);
            const listVersion = JSON.stringify(names);
            if (listVersion !== lastPlayerList) {
                playerList.replaceChildren(...names.map((name) => {
                    const item = document.createElement('li');
                    item.textContent = name;
                    return item;
                }));
                lastPlayerList = listVersion;
            }
            setPlayerStatus(names.length
                ? `${names.length} agent${names.length === 1 ? '' : 's'} currently playing.`
                : 'No agents are currently playing.');
        } catch (error) {
            console.error('Unable to update the Golden Algebra live player list:', error);
            setPlayerStatus(playerList
                ? 'The live player list is temporarily unavailable.'
                : 'Your game progress could not be shared with the teacher. Retrying shortly.');
        } finally {
            presenceRequestPending = false;
            if (presenceRefreshQueued) {
                presenceRefreshQueued = false;
                updateLivePlayers();
            }
        }
    }

    function showStage(index) {
        currentStage = stages[index];
        stages.forEach((id, i) => {
            document.getElementById(id).hidden = i !== index;
            const progress = document.querySelector(`[data-progress="${i}"]`);
            progress.classList.toggle('done', i < index);
            if (i === index) progress.setAttribute('aria-current', 'step');
            else progress.removeAttribute('aria-current');
        });
        document.getElementById('vault-code-reference').hidden = stages[index] !== 'master-vault';
        document.querySelector(`#${stages[index]} h2`).focus();
    }

    function showLastMission() {
        const message = document.getElementById('last-mission');
        try {
            const record = JSON.parse(localStorage.getItem(storageKey));
            if (record && typeof record.agent === 'string' && typeof record.completedAt === 'string') {
                message.textContent = `Latest mission on this browser: ${record.agent} · ${new Date(record.completedAt).toLocaleString()}`;
            } else {
                message.textContent = '';
            }
        } catch (error) {
            console.error('Unable to read the local mission record:', error);
            message.textContent = 'The saved mission record could not be read on this browser.';
        }
    }

    document.getElementById('agent-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const first = document.getElementById('first-name').value.trim();
        const initial = document.getElementById('last-initial').value.trim();
        if (!/^\p{L}+(?:['’-]\p{L}+)*$/u.test(first) || !/^\p{L}$/u.test(initial)) {
            document.getElementById('name-feedback').textContent = 'Enter one first name and one letter for your last initial.';
            return;
        }
        document.getElementById('name-feedback').textContent = '';
        agent = `${first} ${initial.toUpperCase()}.`;
        totalAttempts = 0;
        correctAnswers = 0;
        missionCompleted = false;
        document.getElementById('agent-display').textContent = `Agent ${agent}`;
        showStage(1);
        updateLivePlayers();
    });

    document.querySelectorAll('.code-form').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const nodes = [...form.querySelectorAll('.node')];
            const index = nodes.findIndex((node) => !node.hidden);
            const input = nodes[index].querySelector('input');
            const feedback = document.getElementById(`${input.id}-feedback`);
            totalAttempts += 1;
            const correct = rules[input.id].pattern.test(input.value);
            feedback.classList.toggle('success', correct);
            feedback.textContent = correct ? 'Code accepted.' : `Access denied. ${rules[input.id].hint} Use lowercase x and no spaces.`;
            input.setAttribute('aria-invalid', String(!correct));
            input.setAttribute('aria-describedby', feedback.id);
            if (!correct) {
                input.focus();
            } else if (index + 1 < nodes.length) {
                correctAnswers += 1;
                nodes[index].hidden = true;
                nodes[index + 1].hidden = false;
                form.querySelector('.checkpoint-progress').textContent = `Code accepted. Checkpoint ${index + 2} of ${nodes.length}`;
                nodes[index + 1].querySelector('input').focus();
            } else {
                correctAnswers += 1;
                const nextStage = Number(form.dataset.stage) + 1;
                missionCompleted = stages[nextStage] === 'extraction';
                showStage(nextStage);
            }
            updateLivePlayers();
        });
    });

    document.getElementById('submit-mission').addEventListener('click', () => {
        const feedback = document.getElementById('completion-feedback');
        try {
            localStorage.setItem(storageKey, JSON.stringify({ agent, completedAt: new Date().toISOString() }));
            feedback.classList.add('success');
            feedback.textContent = 'Mission logged on this browser! It is not sent to your teacher.';
            document.getElementById('submit-mission').disabled = true;
            document.getElementById('play-again').hidden = false;
        } catch (error) {
            console.error('Unable to save the mission record:', error);
            feedback.classList.remove('success');
            feedback.textContent = 'Mission could not be saved in this browser. Check browser storage settings and try again.';
        }
    });

    document.getElementById('play-again').addEventListener('click', () => {
        document.querySelectorAll('.mission form').forEach((form) => form.reset());
        document.querySelectorAll('.code-form').forEach((form) => {
            const nodes = form.querySelectorAll('.node');
            nodes.forEach((node, index) => { node.hidden = index !== 0; });
            const progress = form.querySelector('.checkpoint-progress');
            if (progress) progress.textContent = `Checkpoint 1 of ${nodes.length}`;
        });
        document.querySelectorAll('.code-form input').forEach((input) => {
            input.removeAttribute('aria-invalid');
            input.removeAttribute('aria-describedby');
        });
        document.querySelectorAll('.feedback').forEach((feedback) => {
            feedback.textContent = '';
            feedback.classList.remove('success');
        });
        document.getElementById('submit-mission').disabled = false;
        document.getElementById('play-again').hidden = true;
        agent = '';
        totalAttempts = 0;
        correctAnswers = 0;
        missionCompleted = false;
        showLastMission();
        showStage(0);
    });

    showLastMission();
    updateLivePlayers();
    window.setInterval(updateLivePlayers, 20000);
})();
