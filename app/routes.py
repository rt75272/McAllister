from flask import jsonify
from flask import render_template, redirect, url_for, flash, request, session
from app import app, db
from app.models import User
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username'].lower()
        password = request.form['password']
        password2 = request.form['password2']
        if password != password2:
            flash('Passwords do not match.')
            return redirect(url_for('register'))
        if User.query.filter_by(username=username).first():
            flash('Username already exists')
            return redirect(url_for('register'))
        hashed_pw = generate_password_hash(password)
        user = User(username=username, password=hashed_pw)
        db.session.add(user)
        db.session.commit()
        flash('Account created! Please log in.')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username'].lower()
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user:
            if check_password_hash(user.password, password):
                login_user(user)
                flash('Login successful!', 'success')
                return redirect(url_for('dashboard'))
            else:
                flash('Password is incorrect for this username.', 'error')
        else:
            flash('Login failed. Check your username and password.', 'error')
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    # Show scores on dashboard
    current_score = session.get('score', 0)
    daily_score = current_user.daily_score if current_user.is_authenticated else 0
    total_score = current_user.total_score if current_user.is_authenticated else 0
    return render_template('dashboard.html', username=current_user.username, current_score=current_score, daily_score=daily_score, total_score=total_score)


# Math practice route
# Math practice route
import random

MATH_QUESTIONS = [
    {'q': '5 + 3 = ?', 'a': '8'},
    {'q': '12 - 4 = ?', 'a': '8'},
    {'q': '6 x 7 = ?', 'a': '42'},
    {'q': '15 / 3 = ?', 'a': '5'},
    {'q': '9 + 10 = ?', 'a': '19'},
    {'q': '7 x 8 = ?', 'a': '56'},
    {'q': '20 - 9 = ?', 'a': '11'},
    {'q': '3 x 5 = ?', 'a': '15'},
    {'q': '18 / 2 = ?', 'a': '9'},
    {'q': '4 + 4 = ?', 'a': '8'}
]


# API endpoint for AJAX math practice
@app.route('/api/practice', methods=['POST'])
@login_required
def api_practice():
    if 'score' not in session:
        session['score'] = 0
    score = session['score']
    data = request.get_json()
    question = data.get('question')
    answer = data.get('answer')
    correct = next((q['a'] for q in MATH_QUESTIONS if q['q'] == question), None)
    if correct and answer.strip() == correct:
        feedback = 'Correct!'
        feedback_type = 'correct'
        session['score'] = score + 1
        current_user.daily_score += 1
        current_user.total_score += 1
        db.session.commit()
    else:
        feedback = f'Incorrect. The correct answer is {correct}.'
        feedback_type = 'incorrect'
    score = session['score']
    q = random.choice(MATH_QUESTIONS)
    return jsonify({
        'question': q['q'],
        'feedback': feedback,
        'feedback_type': feedback_type,
        'score': score,
        'daily_score': current_user.daily_score,
        'total_score': current_user.total_score
    })

# Endpoint to reset current score
@app.route('/reset_current_score', methods=['POST'])
@login_required
def reset_current_score():
    session['score'] = 0
    return redirect(url_for('dashboard'))


@app.route('/practice', methods=['GET', 'POST'])
@login_required
def practice():
    if 'score' not in session:
        session['score'] = 0
    score = session['score']
    feedback = None
    feedback_type = None
    if request.method == 'POST':
        question = request.form.get('question')
        answer = request.form.get('answer')
        correct = next((q['a'] for q in MATH_QUESTIONS if q['q'] == question), None)
        if correct and answer.strip() == correct:
            feedback = 'Correct!'
            feedback_type = 'correct'
            session['score'] = score + 1
        else:
            feedback = f'Incorrect. The correct answer is {correct}.'
            feedback_type = 'incorrect'
        score = session['score']
        q = random.choice(MATH_QUESTIONS)
        return render_template('practice.html', username=current_user.username, question=q['q'], feedback=feedback, feedback_type=feedback_type, score=score)
    else:
        q = random.choice(MATH_QUESTIONS)
        return render_template('practice.html', username=current_user.username, question=q['q'], feedback=None, feedback_type=None, score=score)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.')
    return redirect(url_for('login'))
