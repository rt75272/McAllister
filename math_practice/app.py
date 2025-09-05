from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from collections import deque
import random

app = Flask(__name__)
app.secret_key = 'replace_with_a_secure_random_secret_key'


def generate_question(difficulty='easy'):
    operations = ['+', '-', '*', '/']
    op = random.choice(operations)
    if difficulty == 'easy':
        num1 = random.randint(1, 10)
        num2 = random.randint(1, 10)
    elif difficulty == 'medium':
        num1 = random.randint(1, 100)
        num2 = random.randint(1, 100)
    elif difficulty == 'hard':
        num1 = random.randint(1, 9999)
        num2 = random.randint(1, 9999)
    else:
        num1 = random.randint(1, 10)
        num2 = random.randint(1, 10)
    if op == '/':
        if difficulty == 'easy':
            num2 = random.choice([i for i in range(1, 10) if i != 0])
        else:
            num2 = random.choice([i for i in range(-100, 101) if i != 0])
        question = f"{num1} ÷ {num2}"
        answer = round(num1 / num2, 4)
    elif op == '+':
        question = f"{num1} + {num2}"
        answer = round(num1 + num2, 4)
    elif op == '-':
        question = f"{num1} - {num2}"
        answer = round(num1 - num2, 4)
    elif op == '*':
        question = f"{num1} × {num2}"
        answer = round(num1 * num2, 4)
    return question, answer


@app.route('/', methods=['GET', 'POST'])
def index():
    if 'score' not in session:
        session['score'] = 0
    if 'perf_records' not in session:
        session['perf_records'] = []
    score = session['score']
    result = None
    # Adaptive difficulty logic
    perf_records = deque(session.get('perf_records', []), maxlen=5)
    correct_count = sum(1 for p in perf_records if p)
    if len(perf_records) == 5:
        if correct_count >= 4:
            difficulty = 'hard'
        elif correct_count <= 1:
            difficulty = 'easy'
        else:
            difficulty = 'medium'
    else:
        difficulty = 'easy'
    session['difficulty'] = difficulty
    if request.method == 'POST':
        user_answer = request.form.get('answer')
        correct_answer = float(request.form.get('correct_answer'))
        is_correct = float(user_answer) == correct_answer
        if is_correct:
            result = f"Correct! The correct answer was {correct_answer}"
            session['score'] += 1
            score = session['score']
        else:
            result = f"Incorrect. The correct answer was {correct_answer}"
        perf_records.append(is_correct)
        session['perf_records'] = list(perf_records)
        # Recalculate difficulty after this turn
        correct_count = sum(1 for p in perf_records if p)
        if len(perf_records) == 5:
            if correct_count >= 4:
                difficulty = 'hard'
            elif correct_count <= 1:
                difficulty = 'easy'
            else:
                difficulty = 'medium'
        else:
            difficulty = 'easy'
        session['difficulty'] = difficulty
        question, answer = generate_question(difficulty)
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'result': result,
                'question': question,
                'answer': answer,
                'score': score,
                'difficulty': difficulty
            })
        else:
            return render_template('index.html', question=question, answer=answer, result=result, score=score, difficulty=difficulty)
    else:
        question, answer = generate_question(difficulty)
        return render_template('index.html', question=question, answer=answer, result=result, score=score, difficulty=difficulty)

@app.route('/skip', methods=['POST'])
def skip():
    score = session.get('score', 0)
    difficulty = session.get('difficulty', 'easy')
    question, answer = generate_question(difficulty)
    return jsonify({
        'question': question,
        'answer': answer,
        'score': score,
        'difficulty': difficulty
    })

if __name__ == '__main__':
    app.run(debug=True)
