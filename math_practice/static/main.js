// /////////////////////////////////////////////////////////////////////////////////////////////////////////
// JavaScript for handling form submission and updating the UI.
//
// Uses Fetch API to send requests to the Flask backend.
// Updates the question, score, and feedback dynamically.
// Assumes the presence of elements with IDs: 'math-form', 'skip-btn', 'score', and 'difficulty'.
// Also assumes the presence of a span with ID 'current-difficulty' to show the selected difficulty.
// The server should respond with JSON containing the new question, answer, score, and result feedback.
// /////////////////////////////////////////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('math-form');
    const skipBtn = document.getElementById('skip-btn');
    function updateQuestionsLeft(count, nextLevel) {
        let elem = document.getElementById('questions-left');
        const text = `${count} question${count !== 1 ? 's' : ''} left until ${nextLevel.charAt(0).toUpperCase() + nextLevel.slice(1)}`;
        if (!elem) {
            // If missing, create and insert after h1
            const h1 = document.querySelector('h1');
            elem = document.createElement('h3');
            elem.id = 'questions-left';
            h1.parentNode.insertBefore(elem, h1.nextSibling);
        }
        elem.textContent = text;
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        fetch('/math-practice', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'}})
        .then(response => response.json())
        .then(data => {
            document.querySelector('h2')?.remove();
            if (data.result) {
                const resultElem = document.createElement('h2');
                resultElem.textContent = data.result;
                if (data.victory) {
                    resultElem.classList.add('victory');
                } else if (data.result.startsWith('Correct')) {
                    resultElem.classList.add('correct');
                } else {
                    resultElem.classList.add('incorrect');
                }
                form.parentNode.insertBefore(resultElem, form);
            }
            form.querySelector('strong').textContent = data.question;
            form.querySelector('input[name="correct_answer"]').value = data.answer;
            form.querySelector('input[name="answer"]').value = '';
            if (typeof data.questions_left !== 'undefined' && typeof data.next_level !== 'undefined') {
                updateQuestionsLeft(data.questions_left, data.next_level);
            }
            if (data.difficulty) {
                const diffElem = document.getElementById('current-difficulty');
                if (diffElem) {
                    diffElem.textContent = data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1);
                    diffElem.className = 'difficulty-' + data.difficulty;
                }
            }
        });
    });

    skipBtn.addEventListener('click', function() {
        const formData = new FormData();
        fetch('/skip', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'}})
        .then(response => response.json())
        .then(data => {
            document.querySelector('h2')?.remove();
            form.querySelector('strong').textContent = data.question;
            form.querySelector('input[name="correct_answer"]').value = data.answer;
            form.querySelector('input[name="answer"]').value = '';
            if (typeof data.questions_left !== 'undefined' && typeof data.next_level !== 'undefined') {
                updateQuestionsLeft(data.questions_left, data.next_level);
            }
            if (data.difficulty) {
                const diffElem = document.getElementById('current-difficulty');
                if (diffElem) {
                    diffElem.textContent = data.difficulty.charAt(0).toUpperCase() + data.difficulty.slice(1);
                    diffElem.className = 'difficulty-' + data.difficulty;
                }
            }
        });
    });
});