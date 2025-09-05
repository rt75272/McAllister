    # ...existing code...
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
import random

app = Flask(__name__)
app.secret_key = 'replace_with_a_secure_random_secret_key'

users = {}

def generate_question(difficulty='easy'):
    operations = ['+', '-', '*', '/']
    op = random.choice(operations)
    if difficulty == 'easy':
        num1 = random.randint(1, 10)
        num2 = random.randint(1, 10)
    elif difficulty == 'medium':
        num1 = random.randint(-20, 50)
        num2 = random.randint(-20, 50)
    elif difficulty == 'hard':
        num1 = random.randint(-100, 100)
        num2 = random.randint(-100, 100)
    else:
        num1 = random.randint(1, 10)
        num2 = random.randint(1, 10)

    if op == '/':
        # Avoid division by zero
        num2 = random.choice([i for i in range(1, 10) if i != 0]) if difficulty == 'easy' else random.choice([i for i in range(-100, 101) if i != 0])
        question = f"{num1} ÷ {num2}"
        answer = round(num1 / num2, 2)
    elif op == '+':
        question = f"{num1} + {num2}"
        answer = num1 + num2
    elif op == '-':
        question = f"{num1} - {num2}"
        answer = num1 - num2
    elif op == '*':
        question = f"{num1} × {num2}"
        answer = num1 * num2
    return question, answer
@app.route('/skip', methods=['POST'])
def skip():
    username = session.get('username')
    if not username:
        return jsonify({'error': 'Not logged in'}), 401
    if 'score' not in session:
        session['score'] = 0
    difficulty = request.form.get('difficulty', 'easy')
    question, answer = generate_question(difficulty)
    score = session['score']
    return jsonify({
        'question': question,
        'answer': answer,
        'score': score,
        'difficulty': difficulty
    })

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if not username or not password:
            flash('Username and password required.')
            return render_template('signup.html')
        if username in users:
            flash('Username already exists.')
            return render_template('signup.html')
        users[username] = generate_password_hash(password)
        session['score'] = 0
        flash('Account created! Please log in.')
        return redirect(url_for('login'))
    return render_template('signup.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user_hash = users.get(username)
        if user_hash and check_password_hash(user_hash, password):
            session['username'] = username
            if 'score' not in session:
                session['score'] = 0
            flash('Logged in successfully!')
            return redirect(url_for('index'))
        else:
            flash('Invalid username or password.')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('score', None)
    flash('Logged out.')
    return redirect(url_for('login'))

@app.route('/', methods=['GET', 'POST'])
def index():
    username = session.get('username')
    if not username:
        return redirect(url_for('login'))
    if 'score' not in session:
        session['score'] = 0
    score = session['score']
    result = None
    difficulty = request.form.get('difficulty', session.get('difficulty', 'easy'))
    session['difficulty'] = difficulty
    if request.method == 'POST':
        user_answer = request.form.get('answer')
        correct_answer = float(request.form.get('correct_answer'))

        if float(user_answer) == correct_answer:
            result = f"Correct! The correct answer was {correct_answer}"
            session['score'] = score + 1
        else:
            result = f"Incorrect. The correct answer was {correct_answer}"

        question, answer = generate_question(difficulty)
        score = session['score']

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
        score = session['score']
        return render_template('index.html', question=question, answer=answer, result=result, score=score, difficulty=difficulty)

if __name__ == '__main__':
    app.run(debug=True)
