import random
from collections import deque
from flask import Flask, render_template, request, jsonify, session
# ########################################################################################################
# Math Practice Web App.
#
# A simple web application using Flask that generates random math questions. Users can answer questions, 
# receive immediate feedback, and track their score.
#
# Usage:
#      mcallister2.onrender.com
# ########################################################################################################
# Flask app setup.
app = Flask(__name__)
app.secret_key = 'secure_random_secret_key'

# Difficulty progression settings. 
easy_num = 4      # Number of consecutive easy questions to answer correctly to reach medium.
medium_num = 7    # Number of consecutive medium questions to answer correctly to reach hard.
hard_num = 5      # Number of hard questions to answer correctly to achieve victory.

num_rounded = 4   # Number of decimal places to round to.

def generate_question(difficulty='easy'):
    """Generate a math question based on difficulty level."""
    operations = ['+', '-', '*', '/']
    op = random.choice(operations)
    if difficulty == 'easy':
        num1 = random.randint(5, 10)
        num2 = random.randint(1, 5)
    elif difficulty == 'medium':
        num1 = random.randint(1, 100)
        num2 = random.randint(1, 50)
    elif difficulty == 'hard':
        num1 = random.randint(1, 9999)
        num2 = random.randint(1, 999)
    else:
        num1 = random.randint(5, 10)
        num2 = random.randint(1, 5)
    if op == '/':
        question = f"{num1} ÷ {num2}"
        answer = round(num1 / num2, num_rounded)
    elif op == '+':
        question = f"{num1} + {num2}"
        answer = round(num1 + num2, num_rounded)
    elif op == '-':
        question = f"{num1} - {num2}"
        answer = round(num1 - num2, num_rounded)
    elif op == '*':
        question = f"{num1} × {num2}"
        answer = round(num1 * num2, num_rounded)
    return question, answer

@app.route('/', methods=['GET', 'POST'])
def index():
    """Main page for math practice."""
    # Always reset session state on GET (refresh).
    if request.method == 'GET':
        session['perf_records'] = []
        session['hard_victories'] = 0
        session['difficulty'] = 'easy'
    result = None
    # Track correct streaks per difficulty.
    if 'streaks' not in session:
        session['streaks'] = {'easy': 0, 'medium': 0, 'hard': 0}
    streaks = session['streaks']
    # Difficulty thresholds.
    easy_to_medium = easy_num
    medium_to_hard = medium_num
    hard_to_victory = hard_num
    # Determine difficulty.
    difficulty = session.get('difficulty', 'easy')
    # Calculate countdowns.
    if difficulty == 'easy':
        questions_left = max(0, easy_to_medium - streaks['easy'])
        next_level = 'medium'
        if streaks['easy'] >= easy_to_medium:
            difficulty = 'medium'
            streaks['easy'] = 0
    elif difficulty == 'medium':
        questions_left = max(0, medium_to_hard - streaks['medium'])
        next_level = 'hard'
        if streaks['medium'] >= medium_to_hard:
            difficulty = 'hard'
            streaks['medium'] = 0
    elif difficulty == 'hard':
        questions_left = max(0, hard_to_victory - session['hard_victories'])
        next_level = 'victory'
    else:
        questions_left = easy_to_medium
        next_level = 'medium'
    session['difficulty'] = difficulty
    session['streaks'] = streaks
    # Calculate countdowns (already handled above with streaks).
    if request.method == 'POST':
        user_answer = request.form.get('answer')
        correct_answer = request.form.get('correct_answer')
        try:
            user_answer_float = float(user_answer)
            correct_answer_float = float(correct_answer)
            is_correct = user_answer_float == correct_answer_float
            if is_correct:
                result = f"Correct! The correct answer was {correct_answer_float}"
                # Track hard victories
                if session.get('difficulty') == 'hard':
                    session['hard_victories'] += 1
            else:
                result = f"Incorrect. The correct answer was {correct_answer_float}"
        except (ValueError, TypeError):
            result = "Please enter a valid number."
            is_correct = False
        # Update streaks.
        if is_correct:
            streaks[difficulty] += 1
        else:
            streaks[difficulty] = 0
        # Difficulty progression.
        if difficulty == 'easy' and streaks['easy'] >= easy_to_medium:
            difficulty = 'medium'
            streaks['easy'] = 0
        elif difficulty == 'medium' and streaks['medium'] >= medium_to_hard:
            difficulty = 'hard'
            streaks['medium'] = 0
        session['difficulty'] = difficulty
        session['streaks'] = streaks
        if difficulty == 'easy':
            questions_left = max(0, easy_to_medium - streaks['easy'])
            next_level = 'medium'
        elif difficulty == 'medium':
            questions_left = max(0, medium_to_hard - streaks['medium'])
            next_level = 'hard'
        elif difficulty == 'hard':
            questions_left = max(0, hard_to_victory - session['hard_victories'])
            next_level = 'victory'
        else:
            questions_left = easy_to_medium
            next_level = 'medium'
        # Victory condition: 5 hard questions answered correctly.
        victory = False
        if session.get('hard_victories', 0) >= hard_to_victory:
            victory = True
            result = "Victory! You answered 5 hard questions correctly!"
            session['hard_victories'] = 0  # Reset for replay
            session['difficulty'] = 'easy'
            session['streaks'] = {'easy': 0, 'medium': 0, 'hard': 0}
            questions_left = easy_to_medium
            next_level = 'medium'
        question, answer = generate_question(session['difficulty'])
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'result': result,
                'question': question,
                'answer': answer,
                'difficulty': session['difficulty'],
                'victory': victory,
                'questions_left': questions_left,
                'next_level': next_level})
        else:
            return render_template('index.html', 
                                   question=question, 
                                   answer=answer, 
                                   result=result, 
                                   difficulty=session['difficulty'],
                                   victory=victory,
                                   questions_left=questions_left,
                                   next_level=next_level)
    else:
        question, answer = generate_question(difficulty)
        return render_template('index.html', 
                               question=question, 
                               answer=answer, 
                               result=result, 
                               difficulty=difficulty,
                               questions_left=questions_left,
                               next_level=next_level)

@app.route('/skip', methods=['POST'])
def skip():
    """Skip the current question."""
    difficulty = session.get('difficulty', 'easy')
    # Use same countdown logic as above.
    # Use streaks for countdowns.
    if 'streaks' not in session:
        session['streaks'] = {'easy': 0, 'medium': 0, 'hard': 0}
    streaks = session['streaks']
    easy_to_medium = easy_num
    medium_to_hard = medium_num
    hard_to_victory = hard_num
    if difficulty == 'easy':
        questions_left = max(0, easy_to_medium - streaks['easy'])
        next_level = 'medium'
    elif difficulty == 'medium':
        questions_left = max(0, medium_to_hard - streaks['medium'])
        next_level = 'hard'
    elif difficulty == 'hard':
        questions_left = max(0, hard_to_victory - session.get('hard_victories', 0))
        next_level = 'victory'
    else:
        questions_left = easy_to_medium
        next_level = 'medium'
    question, answer = generate_question(difficulty)
    return jsonify({
        'question': question,
        'answer': answer,
        'difficulty': difficulty,
        'questions_left': questions_left,
        'next_level': next_level})

# The big red activation button.
if __name__ == '__main__':
    app.run(debug=True)
