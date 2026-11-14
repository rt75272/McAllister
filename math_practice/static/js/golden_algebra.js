(() => {
    const storageKey = 'goldenAlgebraLastMission';
    const stages = ['briefing', 'outer-door', 'mainframe', 'master-vault', 'extraction'];
    const rules = {
        'node-a': { pattern: /^2\((x\+5|5\+x)\)$/, hint: '“Sum” means add x and 5; multiply the whole group by 2.' },
        'node-b': { pattern: /^3x-4$/, hint: 'Multiply the number by 3 first, then subtract 4.' },
        'node-c': { pattern: /^(7x|x\*?7)\/3$/, hint: 'Multiply 7 and x together, then use / to divide by 3.' },
        'firewall-1': { pattern: /^(2x\+10|10\+2x)$/, hint: 'Multiply 2 by both x and 5.' },
        'firewall-2': { pattern: /^3x-4$/, hint: '3x and -4 are not like terms, so the expression is already simplified.' },
        'firewall-3': { pattern: /^7x\/3$/, hint: '7 cannot be divided evenly by 3, so the expression is already simplified.' },
        'override': { pattern: /^(2x\+10|10\+2x)-3x-4-7x\/3$/, hint: 'Use the three simplified codes in order, separated by dashes. Keep the minus sign in the second code.' }
    };
    let agent = '';

    function showStage(index) {
        stages.forEach((id, i) => {
            document.getElementById(id).hidden = i !== index;
            const progress = document.querySelector(`[data-progress="${i}"]`);
            progress.classList.toggle('done', i < index);
            if (i === index) progress.setAttribute('aria-current', 'step');
            else progress.removeAttribute('aria-current');
        });
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
        document.getElementById('agent-display').textContent = `Agent ${agent}`;
        showStage(1);
    });

    document.querySelectorAll('.code-form').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const nodes = [...form.querySelectorAll('.node')];
            const index = nodes.findIndex((node) => !node.hidden);
            const input = nodes[index].querySelector('input');
            const feedback = document.getElementById(`${input.id}-feedback`);
            const correct = rules[input.id].pattern.test(input.value);
            feedback.classList.toggle('success', correct);
            feedback.textContent = correct ? 'Code accepted.' : `Access denied. ${rules[input.id].hint} Use lowercase x and no spaces.`;
            input.setAttribute('aria-invalid', String(!correct));
            input.setAttribute('aria-describedby', feedback.id);
            if (!correct) {
                input.focus();
            } else if (index + 1 < nodes.length) {
                nodes[index].hidden = true;
                nodes[index + 1].hidden = false;
                form.querySelector('.checkpoint-progress').textContent = `Code accepted. Checkpoint ${index + 2} of ${nodes.length}`;
                nodes[index + 1].querySelector('input').focus();
            } else {
                showStage(Number(form.dataset.stage) + 1);
            }
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
        showLastMission();
        showStage(0);
    });

    showLastMission();
})();
