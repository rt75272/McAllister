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
    
    function updatePreviousQuestion(prevQuestion) {
        const prevQuestionDiv = document.getElementById('previous-question');
        if (prevQuestion) {
            document.getElementById('prev-question-text').textContent = prevQuestion.question;
            document.getElementById('prev-user-answer').textContent = prevQuestion.user_answer;
            document.getElementById('prev-correct-answer').textContent = prevQuestion.correct_answer;
            
            // Style the user answer based on correctness
            const userAnswerSpan = document.getElementById('prev-user-answer');
            userAnswerSpan.className = prevQuestion.was_correct ? 'user-answer correct' : 'user-answer incorrect';
            
            prevQuestionDiv.style.display = 'block';
        } else {
            prevQuestionDiv.style.display = 'none';
        }
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
            form.querySelector('input[name="current_question"]').value = data.question;
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
            // Update previous question display
            if (data.previous_question) {
                updatePreviousQuestion(data.previous_question);
            }
            
            // Update progression map
            updateProgressionMap(data);
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
            
            // Update progression map
            updateProgressionMap(data);
        });
    });
    
    // Function to update progression map
    function updateProgressionMap(data) {
        // Get progress data from the response
        const streaks = data.streaks || { easy: 0, medium: 0, hard: 0 };
        const hardVictories = data.hard_victories || 0;
        const currentDifficulty = data.difficulty || 'easy';
        
        // Progress constants (get from window or use defaults)
        const EASY_NUM = window.easyNum || 4;
        const MEDIUM_NUM = window.mediumNum || 7;
        const HARD_NUM = window.hardNum || 5;
        
        // Update easy stage
        updateStageProgress('easy', streaks.easy, EASY_NUM, currentDifficulty);
        
        // Update medium stage
        updateStageProgress('medium', streaks.medium, MEDIUM_NUM, currentDifficulty);
        
        // Update hard stage
        updateStageProgress('hard', hardVictories, HARD_NUM, currentDifficulty);
        
        // Update victory stage
        updateVictoryStage(hardVictories >= HARD_NUM);
    }
    
    function updateStageProgress(stage, current, total, currentDifficulty) {
        const progressFill = document.getElementById(`${stage}-progress`);
        const progressText = document.getElementById(`${stage}-text`);
        const stageElement = document.querySelector(`[data-stage="${stage}"]`);
        
        if (!progressFill || !progressText || !stageElement) return;
        
        // Calculate progress percentage
        const percentage = Math.min((current / total) * 100, 100);
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${current}/${total}`;
        
        // Update stage appearance
        stageElement.classList.remove('current', 'completed', 'active');
        
        if (percentage >= 100 && stage !== currentDifficulty) {
            // Stage is completed and we've moved past it
            stageElement.classList.add('completed');
        } else if (stage === currentDifficulty) {
            // This is the current active stage
            stageElement.classList.add('current', 'active');
            if (percentage >= 100) {
                // Stage is completed but we haven't moved past it yet (shouldn't happen)
                stageElement.classList.add('completed');
            }
        }
    }
    
    function updateVictoryStage(isVictory) {
        const victoryStage = document.querySelector('[data-stage="victory"]');
        if (!victoryStage) return;
        
        victoryStage.classList.remove('current', 'completed');
        
        if (isVictory) {
            victoryStage.classList.add('completed');
        }
    }
    
    // Initialize progression map on page load
    function initializeProgressionMap() {
        // Get initial data from the page
        const currentDifficulty = document.getElementById('current-difficulty')?.textContent?.toLowerCase() || 'easy';
        
        // Mock initial data - in a real scenario, this would come from the server
        const initialData = {
            difficulty: currentDifficulty,
            streaks: window.initialStreaks || { easy: 0, medium: 0, hard: 0 },
            hard_victories: window.initialHardVictories || 0
        };
        
        updateProgressionMap(initialData);
    }
    
    // Initialize on page load
    initializeProgressionMap();
});