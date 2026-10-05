"""
Math Practice Web Application.

A Flask web application that powers Mrs. McAllister's Learning Center.
Features comprehensive 6th-grade math and ELA interactive games,
a 3D space flight quest map, curriculum planet stations, Gemini-powered
support chatbot, and student progress/check-in logging.
"""

import json
import base64
import hashlib
import hmac
import os
import random
import re
import secrets
import time
from contextlib import closing
from collections import deque
from datetime import datetime, timedelta
from functools import wraps
from urllib import error, request as urllib_request

from flask import Flask, abort, render_template, request, jsonify, session, redirect, url_for
import psycopg2

import adaptive_difficulty as adaptive

# Flask application setup.
app = Flask(__name__)
configured_secret_key = os.environ.get('SECRET_KEY')
if os.environ.get('RENDER', '').lower() == 'true' and not configured_secret_key:
    raise RuntimeError('SECRET_KEY must be configured for the Render deployment.')
app.secret_key = configured_secret_key or secrets.token_hex(32)
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_SECURE=os.environ.get('RENDER', '').lower() == 'true',
    PERMANENT_SESSION_LIFETIME=timedelta(days=14),
)

GEMINI_MODEL = 'gemini-2.5-flash'
GEMINI_API_URL = (
    'https://generativelanguage.googleapis.com/v1beta/models/'
    f'{GEMINI_MODEL}:generateContent?key={{api_key}}'
)
CHATBOT_HISTORY_LIMIT = 6

CHATBOT_FAQ = {
    'hi': "Hi! I'm your Math Bot! I'm here to help with games on this website, Canvas navigation, and simple learning questions. I can give hints and directions, but you should still do the thinking. Keep personal information private. What do you need help with today?",
    'hello': "Hi! I'm your Math Bot! I'm here to help with games on this website, Canvas navigation, and simple learning questions. I can give hints and directions, but you should still do the thinking. Keep personal information private. What do you need help with today?",
    'hey': "Hi! I'm your Math Bot! I'm here to help with games on this website, Canvas navigation, and simple learning questions. I can give hints and directions, but you should still do the thinking. Keep personal information private. What do you need help with today?",
    'missing class': 'Click Courses > All Courses and click the Star next to your class to see it on your Dashboard.',
    'find class': 'Click Courses > All Courses and click the Star next to your class to see it on your Dashboard.',
    'where is my work': 'Always look in the Modules tab for your weekly assignments.',
    'finding work': 'Always look in the Modules tab for your weekly assignments.',
    'module': 'Always look in the Modules tab for your weekly assignments.',
    'engageli': "Go to your Canvas Calendar. Click the event for today's date to find your Engageli link. If the calendar is empty, make sure your classes are checked on the right side of the screen!",
    'live class': "Go to your Canvas Calendar. Click the event for today's date to find your Engageli link. If the calendar is empty, make sure your classes are checked on the right side of the screen!",
    'meeting': "Go to your Canvas Calendar. Click the event for today's date to find your Engageli link. If the calendar is empty, make sure your classes are checked on the right side of the screen!",
    'link': "Go to your Canvas Calendar. Click the event for today's date to find your Engageli link. If the calendar is empty, make sure your classes are checked on the right side of the screen!",
    'join': "Go to your Canvas Calendar. Click the event for today's date to find your Engageli link. If the calendar is empty, make sure your classes are checked on the right side of the screen!",
    'online class': "Go to your Canvas Calendar. Click the event for today's date to find your Engageli link. If the calendar is empty, make sure your classes are checked on the right side of the screen!",
    'empty calendar': 'Check the boxes next to your class names on the right side of the Calendar screen to make them appear.',
    'not load': "1. Refresh the page. 2. Use Google Chrome. 3. Try an Incognito Window. 4. Message your teacher in the Canvas Inbox if you still can't get in.",
    'broken': "1. Refresh the page. 2. Use Google Chrome. 3. Try an Incognito Window. 4. Message your teacher in the Canvas Inbox if you still can't get in.",
    "can't get into class": "1. Refresh the page. 2. Use Google Chrome. 3. Try an Incognito Window. 4. Message your teacher in the Canvas Inbox if you still can't get in.",
    'loading forever': "1. Refresh the page. 2. Use Google Chrome. 3. Try an Incognito Window. 4. Message your teacher in the Canvas Inbox if you still can't get in.",
    'technical difficulties': 'Call Stride Tech Support at 866-512-2273 or visit help.k12.com. They are open 7 days a week!',
    'late': "You have 2 weeks after the due date to turn in any assignment for full credit. After 2 weeks, the assignment will lock and you won't be able to turn it in!",
    'due date': "You have 2 weeks after the due date to turn in any assignment for full credit. After 2 weeks, the assignment will lock and you won't be able to turn it in!",
    '2 weeks': "You have 2 weeks after the due date to turn in any assignment for full credit. After 2 weeks, the assignment will lock and you won't be able to turn it in!",
    'turn in': "Click the big Submit Assignment button at the top right. Select your file and click Submit again. Look for the confetti!",
    'submit': "Click the big Submit Assignment button at the top right. Select your file and click Submit again. Look for the confetti!",
    'upload': "Click the big Submit Assignment button at the top right. Select your file and click Submit again. Look for the confetti!",
    'hand in': "Click the big Submit Assignment button at the top right. Select your file and click Submit again. Look for the confetti!",
    'grades': "Click View Grades on your Dashboard, or the Grades tab inside a course. You can even type in 'What-If' scores to see how a grade might change!",
    'how am i doing': "Click View Grades on your Dashboard, or the Grades tab inside a course. You can even type in 'What-If' scores to see how a grade might change!",
    'score': "Click View Grades on your Dashboard, or the Grades tab inside a course. You can even type in 'What-If' scores to see how a grade might change!",
    'report card': "Click View Grades on your Dashboard, or the Grades tab inside a course. You can even type in 'What-If' scores to see how a grade might change!",
    'am i failing': "Click View Grades on your Dashboard, or the Grades tab inside a course. You can even type in 'What-If' scores to see how a grade might change!",
    'star360': "Go to Resources > ClassLink > Renaissance (the big 'R' app). You will take this reading and math test at the beginning, middle, and end of the year.",
    'renaissance': "Go to Resources > ClassLink > Renaissance (the big 'R' app). You will take this reading and math test at the beginning, middle, and end of the year.",
    'testing': "Go to Resources > ClassLink > Renaissance (the big 'R' app). You will take this reading and math test at the beginning, middle, and end of the year.",
    'reading test': "Go to Resources > ClassLink > Renaissance (the big 'R' app). You will take this reading and math test at the beginning, middle, and end of the year.",
    'math test': "Go to Resources > ClassLink > Renaissance (the big 'R' app). You will take this reading and math test at the beginning, middle, and end of the year.",
    'id': 'Click Account > Profile for your ID number. Click Account > Settings to see your school email address on the right side.',
    'student number': 'Click Account > Profile for your ID number. Click Account > Settings to see your school email address on the right side.',
    'email': 'Click Account > Profile for your ID number. Click Account > Settings to see your school email address on the right side.',
    'username': 'Click Account > Profile for your ID number. Click Account > Settings to see your school email address on the right side.',
    'newsletter': 'You can find our March Newsletter at this link: https://www.smore.com/ Check it for important dates and school updates!',
    'contact': 'You can email Jmcallister@onlineoregon.org or use the Inbox icon on the left side of Canvas to send a message.',
    'talk to my teacher': "It sounds like you need a human expert. Since I'm just an AI, I might not have the exact answer you need. Here is how to reach Mrs. McAllister: Email Jmcallister@onlineoregon.org or click the Canvas Inbox.",
    "i'm confused": "It sounds like you need a human expert. Since I'm just an AI, I might not have the exact answer you need. Here is how to reach Mrs. McAllister: Email Jmcallister@onlineoregon.org or click the Canvas Inbox.",
    'tech support': 'Call Stride Tech Support at 866-512-2273 or visit help.k12.com. They are open 7 days a week!',
    'help desk': 'Call Stride Tech Support at 866-512-2273 or visit help.k12.com. They are open 7 days a week!',
    'phone number': 'Call Stride Tech Support at 866-512-2273 or visit help.k12.com. They are open 7 days a week!',
    'break': 'Looking for a break? Here are the upcoming days with No School: Spring Break: March 23-27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5.',
    'holiday': 'Looking for a break? Here are the upcoming days with No School: Spring Break: March 23-27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5.',
    'no school': 'Looking for a break? Here are the upcoming days with No School: Spring Break: March 23-27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5.',
    'spring break': 'Looking for a break? Here are the upcoming days with No School: Spring Break: March 23-27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5.',
    'easter': 'Looking for a break? Here are the upcoming days with No School: Spring Break: March 23-27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5.',
    'when is school over': 'Looking for a break? Here are the upcoming days with No School: Spring Break: March 23-27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5.',
    'last day': 'Looking for a break? Here are the upcoming days with No School: Spring Break: March 23-27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5.',
    'days off': 'Looking for a break? Here are the upcoming days with No School: Spring Break: March 23-27, Teacher Work Day: April 3, Memorial Day: May 25, Last Day of School: June 5.',
    'canvas down': "Sometimes Canvas has a hiccup. Wait 5 minutes and try again. Make sure your Wi-Fi is still connected. Use this time to read your school book or practice math facts offline!",
    'pacing': "Try to finish at least one lesson in each subject every day. Look at the To-Do list on your Dashboard. It's better to do one lesson correctly than three lessons too fast.",
    'done for the day': 'Did you submit all your assignments and see the confetti? Did you check Canvas Inbox? Is your laptop plugged in? Great job. See you at the next Engageli session!',
    'address': 'Privacy check: keep your personal info safe. Never share private details with an AI or on a public site.',
    'phone': 'Privacy check: keep your personal info safe. Never share private details with an AI or on a public site.',
    'street': 'Privacy check: keep your personal info safe. Never share private details with an AI or on a public site.',
    'password': 'Privacy check: keep your personal info safe. Never share private details with an AI or on a public site.',
    'calculate': "I can help with steps and hints, but you should double-check the final answer and show your work.",
    'plus': "I can help with steps and hints, but you should double-check the final answer and show your work.",
    'equals': "I can help with steps and hints, but you should double-check the final answer and show your work.",
    'math help': "I can help with steps and hints, but you should double-check the final answer and show your work.",
    'math adventure': "Math Adventure is a graphical map quest game where you choose a character (Knight, Wizard, Ninja, or Astronaut) and difficulty level, then solve math challenges to move across the map from the Starting Village to the Castle of Triumph!",
    'adventure map': "Math Adventure is a graphical map quest game where you choose a character (Knight, Wizard, Ninja, or Astronaut) and difficulty level, then solve math challenges to move across the map from the Starting Village to the Castle of Triumph!",
    'grand finale': "The Grand Finale is our 3-day end-of-year math celebration! It features interactive slides, quick-fire challenges, Blooket Gold Quest, Gimkit Lava Rising, Coordinate BINGO, and teacher trivia. Use the navigation buttons to jump to Day 1, 2, or 3!",
    'finale': "The Grand Finale is our 3-day end-of-year math celebration! It features interactive slides, quick-fire challenges, Blooket Gold Quest, Gimkit Lava Rising, Coordinate BINGO, and teacher trivia. Use the navigation buttons to jump to Day 1, 2, or 3!",
    'help': "I can help with website games, Canvas questions, assignment steps, grades, class links, school tools, and simple math or ELA hints."
}

CHATBOT_SYSTEM_PROMPT = """
You are the student helper chatbot for Mrs. McAllister's learning website.

Audience and tone:
- Write for students in simple, encouraging language.
- Keep answers short: usually 2 to 5 sentences.
- You can talk about anything the student wants to talk about, including telling jokes, sharing fun facts, and having general conversations.

Behavior rules:
- Give hints, steps, and explanations instead of only final answers when a student asks for academic help.
- If the student asks about Canvas, grades, assignments, class links, or school routines, use the known site information provided.
- If you are uncertain about a school policy or a site-specific fact, say so briefly and suggest asking Mrs. McAllister or tech support.
- Never ask for or encourage sharing personal, private, or account information.
- If a student shares private information, remind them to keep it private.
- Do not help with harmful, unsafe, or adult topics. Redirect back to learning or safe fun topics.

Known teacher/site facts:
{faq_context}
""".strip()


def get_faq_context():
    """Return FAQ content as grounding text for Gemini."""
    return '\n'.join(f'- {key}: {value}' for key, value in CHATBOT_FAQ.items())


def get_faq_response(user_message):
    """Return a deterministic FAQ response for obvious site questions."""
    normalized_message = user_message.lower()
    for key in sorted(CHATBOT_FAQ.keys(), key=len, reverse=True):
        pattern = rf'(?<!\w){re.escape(key)}(?!\w)'
        if re.search(pattern, normalized_message):
            return CHATBOT_FAQ[key]
    return None


def get_chatbot_history():
    """Fetch recent chatbot history from the session."""
    history = session.get('chatbot_history', [])
    if not isinstance(history, list):
        return []
    return history[-CHATBOT_HISTORY_LIMIT:]


def save_chatbot_history(history):
    """Persist a capped chatbot history in the session."""
    session['chatbot_history'] = history[-CHATBOT_HISTORY_LIMIT:]


def generate_gemini_reply(user_message, page_path, history, faq_reply=None):
    """Call Gemini to generate a student-safe chatbot reply."""
    api_key = os.environ.get('GEMINI_API_KEY', 'AIzaSyCBrwvmjM0k_UGco8UFq7RS0_fVOr-3ofQ')
    if not api_key:
        raise RuntimeError('GEMINI_API_KEY is not configured.')

    contents = []
    for item in history[-CHATBOT_HISTORY_LIMIT:]:
        role = item.get('role')
        text = item.get('text', '').strip()
        if role not in {'user', 'model'} or not text:
            continue
        contents.append({'role': role, 'parts': [{'text': text}]})

    user_prompt = (
        f'Current page: {page_path or "/"}\n'
        f'Student message: {user_message}\n'
    )
    if faq_reply:
        user_prompt += (
            f'Known scripted answer for this topic: {faq_reply}\n'
            'If that scripted answer directly fits the question, use it or lightly rephrase it. '
            'If the student needs more than that, answer naturally using the same facts.\n'
        )
    user_prompt += (
        '\nAnswer as the website helper. If the student needs site-specific help, use the known facts. '
        'If they are asking for math or ELA help, give short coaching and do not overwhelm them. '
        'If they ask for a joke or general conversation, feel free to respond!'
    )
    contents.append({'role': 'user', 'parts': [{'text': user_prompt}]})

    payload = {
        'system_instruction': {
            'parts': [{
                'text': CHATBOT_SYSTEM_PROMPT.format(faq_context=get_faq_context())
            }]
        },
        'contents': contents,
        'generationConfig': {
            'temperature': 0.4,
            'maxOutputTokens': 220,
            'topP': 0.9,
            'topK': 20
        }
    }

    http_request = urllib_request.Request(
        GEMINI_API_URL.format(api_key=api_key),
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )

    try:
        with urllib_request.urlopen(http_request, timeout=15) as response:
            result = json.loads(response.read().decode('utf-8'))
    except error.HTTPError as exc:
        error_body = exc.read().decode('utf-8', errors='ignore')
        raise RuntimeError(f'Gemini request failed: {exc.code} {error_body}') from exc
    except error.URLError as exc:
        raise RuntimeError(f'Gemini request failed: {exc.reason}') from exc

    candidates = result.get('candidates', [])
    if not candidates:
        raise RuntimeError('Gemini returned no candidates.')

    parts = candidates[0].get('content', {}).get('parts', [])
    answer = ' '.join(part.get('text', '').strip() for part in parts if part.get('text')).strip()
    if not answer:
        raise RuntimeError('Gemini returned an empty answer.')
    return answer

@app.context_processor
def inject_current_year():
    """Inject current year into all templates as `current_year`."""
    return {'current_year': datetime.now().year}


@app.context_processor
def inject_account_navigation():
    """Provide account links and the session-bound form token to templates."""
    return {
        'current_account_name': session.get('account_name'),
        'csrf_token': issue_csrf_token(),
    }

# Difficulty progression settings. 
easy_num = 4      # Number of consecutive easy questions to answer correctly to reach medium.
medium_num = 7    # Number of consecutive medium questions to answer correctly to reach hard.
hard_num = 5      # Number of hard questions to answer correctly to achieve victory.
num_rounded = 2   # Number of decimal places to round to.

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
        num1 = random.randint(1, 1000)
        num2 = random.randint(1, 500)
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

@app.route('/', methods=['GET'])
def home():
    """Redirect the landing page to the quest map."""
    return redirect(url_for('quest_map'))

@app.route('/math-games', methods=['GET'])
def math_games():
    """Math games selection page."""
    return render_template('math_games.html')

@app.route('/skill-assessment', methods=['GET'])
def skill_assessment():
    """Short adaptive placement quiz that seeds every math game's starting difficulty.

    The quiz itself runs client-side (see adaptive_difficulty.js), using the same
    IRT-style ability model the games use to adapt afterward; the resulting ability
    score is stored in localStorage so each game can read it as its starting point.
    """
    return render_template('skill_assessment.html')

@app.route('/ela-games', methods=['GET'])
def ela_games():
    """ELA games selection page."""
    return render_template('ela_games.html')


@app.route('/ela-planet', methods=['GET'])
def ela_planet():
    """ELA Planet destination with direct links to ELA games."""
    return render_template('ela_planet.html')

@app.route('/baking-club', methods=['GET'])
def baking_club():
    """Baking Club page."""
    return render_template('baking_club.html')


@app.route('/baking-club-planet', methods=['GET'])
def baking_club_planet():
    """Baking Club Planet destination."""
    return render_template('baking_club.html')

@app.route('/grand-finale', methods=['GET'])
def grand_finale():
    """6th Grade Math Grand Finale celebration slideshow."""
    return render_template('grand_finale.html')


@app.route('/grand-finale-planet', methods=['GET'])
def grand_finale_planet():
    """Grand Finale Planet destination."""
    return render_template('grand_finale.html')


@app.route('/game-planet', methods=['GET'])
def game_planet():
    """Arcade-themed Game Planet destination."""
    return render_template('game_planet.html')

@app.route('/earth-science-planet', methods=['GET'])
def earth_science_planet():
    """Science Planet with Earth science stations and life-science games."""
    return render_template('earth_science_planet.html')

@app.route('/natural-selection-planet', methods=['GET'])
def natural_selection_planet():
    """Interactive beetle natural-selection game on the Science Planet."""
    return render_template('natural_selection_planet.html')

@app.route('/moth-camouflage', methods=['GET'])
def moth_camouflage():
    """Natural-selection game about peppered moth camouflage."""
    return render_template('moth_camouflage.html')

@app.route('/chess-planet', methods=['GET'])
def chess_planet():
    """Single-player chess game against a computer opponent."""
    return render_template('chess_planet.html')

@app.route('/context-clues', methods=['GET'])
def context_clues():
    """Context Clues game page (infer word meanings)."""
    return render_template('context_clues.html')

@app.route('/sentence-fixer', methods=['GET'])
def sentence_fixer():
    """Sentence Fixer game page (capitalization and punctuation)."""
    return render_template('sentence_fixer.html')

@app.route('/word-match', methods=['GET'])
def word_match():
    """Word Match game page (synonyms/antonyms)."""
    return render_template('word_match.html')

@app.route('/math-blast', methods=['GET'])
def math_blast():
    """Math Blast game page."""
    return render_template('math_blast.html')

@app.route('/math-race', methods=['GET'])
def math_race():
    """Math Race game page."""
    return render_template('math_race.html')

@app.route('/math-memory', methods=['GET'])
def math_memory():
    """Math Memory game page."""
    return render_template('math_memory.html')


@app.route('/snake-arcade', methods=['GET'])
def snake_arcade():
    """Standalone Snake arcade game page."""
    return render_template('snake_arcade.html')


@app.route('/tetris', methods=['GET'])
def tetris_game():
    """Tetris game page."""
    return render_template('tetris.html')


@app.route('/pong-arcade', methods=['GET'])
def pong_arcade():
    """Standalone Pong arcade game page."""
    return render_template('pong_arcade.html')


@app.route('/dino-arcade', methods=['GET'])
def dino_arcade():
    """Standalone Dino runner arcade game page."""
    return render_template('dino_arcade.html')


@app.route('/pinball-arcade', methods=['GET'])
def pinball_arcade():
    """Standalone Pinball arcade game page."""
    return render_template('pinball_arcade.html')

@app.route('/decimal-master', methods=['GET'])
def decimal_master():
    """Decimal Master game page."""
    return render_template('decimal_master.html')

@app.route('/fraction-master', methods=['GET'])
def fraction_master():
    """Fraction Master game page."""
    return render_template('fraction_master.html')

@app.route('/plot-points', methods=['GET'])
def plot_points():
    """Plot Points (graphing) game page."""
    return render_template('plot_points.html')

@app.route('/exponent-power', methods=['GET'])
def exponent_power():
    """Exponent Power game page."""
    return render_template('exponent_power.html')

@app.route('/exponent-world', methods=['GET'])
def exponent_world():
    """Exponent World word problems game page."""
    return render_template('exponent_world.html')

@app.route('/exponent-rules', methods=['GET'])
def exponent_rules():
    """Exponent Rules game page for operations with exponents."""
    return render_template('exponent_rules.html')

@app.route('/about', methods=['GET'])
def about():
    """About page."""
    return render_template('about.html')

@app.route('/ask-chatbot', methods=['POST'])
def ask_chatbot():
    """Chatbot API backed by Gemini with a local FAQ fast path."""
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'No message provided'}), 400

    user_message = str(data['message']).strip()
    if not user_message:
        return jsonify({'error': 'Message cannot be empty'}), 400

    page_path = str(data.get('pagePath', '/')).strip() or '/'
    faq_reply = get_faq_response(user_message)

    history = get_chatbot_history()
    try:
        bot_reply = generate_gemini_reply(user_message, page_path, history, faq_reply=faq_reply)
        history.extend([
            {'role': 'user', 'text': user_message},
            {'role': 'model', 'text': bot_reply}
        ])
        save_chatbot_history(history)
        return jsonify({'answer': bot_reply, 'source': 'gemini'})
    except Exception as e:
        app.logger.error(f"Chatbot failed: {e}")
        if faq_reply:
            history.extend([
                {'role': 'user', 'text': user_message},
                {'role': 'model', 'text': faq_reply}
            ])
            save_chatbot_history(history)
            return jsonify({'answer': faq_reply, 'source': 'faq-fallback'})
        fallback_reply = (
            "I can help with website games, Canvas questions, and simple math or ELA hints. "
            "Try asking about a game on this page, how to turn in work, where to find grades, or ask for a step-by-step hint."
        )
        return jsonify({'answer': fallback_reply, 'source': 'fallback'})


@app.route('/d20', methods=['GET'])
def d20():
    """A simple page showing a 20-sided (D20) dice."""
    return render_template('d20.html')

def _progress_snapshot(ability, difficulty, hard_victories):
    """Translate the ability score into the streak-style progress numbers the UI expects
    (so the existing progress bars/templates work unchanged), while the underlying
    difficulty selection is driven by the adaptive ability estimate."""
    order = ('easy', 'medium', 'hard')
    idx_current = order.index(difficulty)
    totals = {'easy': easy_num, 'medium': medium_num}
    streaks = {'easy': 0, 'medium': 0, 'hard': hard_victories}
    for i, tier in enumerate(('easy', 'medium')):
        if i < idx_current:
            streaks[tier] = totals[tier]
        elif i == idx_current:
            streaks[tier] = round(adaptive.tier_progress(ability, tier) * totals[tier])

    if difficulty == 'easy':
        questions_left = max(0, easy_num - streaks['easy'])
        next_level = 'medium'
    elif difficulty == 'medium':
        questions_left = max(0, medium_num - streaks['medium'])
        next_level = 'hard'
    else:
        questions_left = max(0, hard_num - hard_victories)
        next_level = 'victory'
    return streaks, questions_left, next_level


@app.route('/math-practice', methods=['GET', 'POST'])
def math_practice():
    """Main page for math practice. Difficulty is chosen by an online IRT-style adaptive
    engine (see adaptive_difficulty.py) that estimates the student's ability from
    correctness and response time, rather than a fixed correct-answers-in-a-row streak.
    Signed-in learners also have their attempts saved to their account."""
    progress_warning = None
    # Always reset session state on GET (refresh).
    if request.method == 'GET':
        session['hard_victories'] = 0
        # A skill-assessment result (?seed_ability=...) seeds the starting ability instead
        # of the default, so students don't have to re-earn their way up from easy.
        seed_ability = request.args.get('seed_ability', type=float)
        if seed_ability is not None:
            session['ability'] = max(adaptive.MIN_ABILITY, min(adaptive.MAX_ABILITY, seed_ability))
        elif session.get('account_id'):
            try:
                saved_ability = get_latest_account_ability(session['account_id'])
                session['ability'] = (
                    saved_ability if saved_ability is not None else adaptive.INITIAL_ABILITY
                )
            except Exception:
                app.logger.exception('Failed restoring learner Math Practice ability.')
                session['ability'] = adaptive.INITIAL_ABILITY
                progress_warning = 'Your saved Math Practice level could not be loaded right now.'
        else:
            session['ability'] = adaptive.INITIAL_ABILITY

    result = None
    ability = session.get('ability', adaptive.INITIAL_ABILITY)
    difficulty = adaptive.ability_to_tier(ability)
    session['difficulty'] = difficulty
    hard_victories = session.get('hard_victories', 0)
    streaks, questions_left, next_level = _progress_snapshot(ability, difficulty, hard_victories)

    if request.method == 'POST':
        if not valid_csrf_token(request.form.get('csrf_token', '')):
            abort(400, description='This form expired. Please refresh and try again.')
        answered_difficulty = difficulty
        user_answer = request.form.get('answer')
        correct_answer = session.get('current_answer')
        if correct_answer is None:
            abort(400, description='This question expired. Please load a new question.')
        try:
            user_answer_float = float(user_answer)
            correct_answer_float = float(correct_answer)
            is_correct = user_answer_float == correct_answer_float
            if is_correct:
                result = f"Correct! The correct answer was {correct_answer_float}"
                if difficulty == 'hard':
                    hard_victories += 1
            else:
                result = f"Incorrect. The correct answer was {correct_answer_float}"
        except (ValueError, TypeError):
            result = "Please enter a valid number."
            is_correct = False
            correct_answer_float = None

        # Update the ability estimate from this result (weighted by how long it took).
        response_seconds = time.time() - session.get('question_start_time', time.time())
        ability = adaptive.update_ability(ability, difficulty, is_correct, response_seconds)
        ability_peak = ability
        session['ability'] = ability
        new_difficulty = adaptive.ability_to_tier(ability)
        # Falling back out of hard means mastery wasn't sustained; don't carry over partial credit.
        if difficulty == 'hard' and new_difficulty != 'hard':
            hard_victories = 0
        difficulty = new_difficulty
        session['difficulty'] = difficulty
        session['hard_victories'] = hard_victories

        # Store previous question information before updating difficulty.
        current_question = session.get('current_question', '')
        session['previous_question'] = {
            'question': current_question,
            'user_answer': user_answer,
            'correct_answer': correct_answer_float,
            'was_correct': is_correct
        }

        # Victory condition: 5 hard questions answered correctly.
        victory = False
        if hard_victories >= hard_num:
            victory = True
            result = "Victory! You answered 5 hard questions correctly!"
            hard_victories = 0  # Reset for replay.
            ability = adaptive.INITIAL_ABILITY
            difficulty = 'easy'
            session['hard_victories'] = hard_victories
            session['ability'] = ability
            session['difficulty'] = difficulty

        if session.get('account_id'):
            try:
                save_account_math_attempt(
                    session['account_id'],
                    answered_difficulty,
                    is_correct,
                    ability,
                    ability_peak,
                )
            except Exception:
                app.logger.exception('Failed saving learner Math Practice progress.')
                progress_warning = 'Your answer was processed, but this attempt could not be saved to your account.'

        streaks, questions_left, next_level = _progress_snapshot(ability, difficulty, hard_victories)
        question, answer = generate_question(difficulty)
        session['current_question'] = question
        session['current_answer'] = answer
        session['question_start_time'] = time.time()
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            response_data = {
                'result': result,
                'question': question,
                'answer': answer,
                'difficulty': difficulty,
                'victory': victory,
                'questions_left': questions_left,
                'next_level': next_level,
                'streaks': streaks,
                'hard_victories': hard_victories,
                'ability': round(ability, 2)
            }
            if progress_warning:
                response_data['progress_warning'] = progress_warning
            # Add previous question info if available.
            if 'previous_question' in session:
                response_data['previous_question'] = session['previous_question']
            return jsonify(response_data)
        else:
            return render_template('math_practice.html', 
                                   question=question, 
                                   answer=answer, 
                                   result=result, 
                                   difficulty=difficulty,
                                   victory=victory,
                                   questions_left=questions_left,
                                   next_level=next_level,
                                   easy_num=easy_num,
                                   medium_num=medium_num,
                                   hard_num=hard_num,
                                   streaks=streaks,
                                   hard_victories=hard_victories,
                                   progress_warning=progress_warning)
    else:
        question, answer = generate_question(difficulty)
        session['current_question'] = question
        session['current_answer'] = answer
        session['question_start_time'] = time.time()
        return render_template('math_practice.html', 
                               question=question, 
                               answer=answer, 
                               result=result, 
                               difficulty=difficulty,
                               questions_left=questions_left,
                               next_level=next_level,
                               easy_num=easy_num,
                               medium_num=medium_num,
                               hard_num=hard_num,
                               streaks=streaks,
                               hard_victories=hard_victories,
                               progress_warning=progress_warning)

@app.route('/skip', methods=['POST'])
def skip():
    """Skip the current question. Skipping does not move the ability estimate, since no
    answer (correct or not) was actually observed."""
    if not valid_csrf_token(request.form.get('csrf_token', '')):
        abort(400, description='This form expired. Please refresh and try again.')
    ability = session.get('ability', adaptive.INITIAL_ABILITY)
    difficulty = adaptive.ability_to_tier(ability)
    session['difficulty'] = difficulty
    hard_victories = session.get('hard_victories', 0)
    streaks, questions_left, next_level = _progress_snapshot(ability, difficulty, hard_victories)
    question, answer = generate_question(difficulty)
    session['current_question'] = question
    session['current_answer'] = answer
    session['question_start_time'] = time.time()
    return jsonify({
        'question': question,
        'answer': answer,
        'difficulty': difficulty,
        'questions_left': questions_left,
        'next_level': next_level,
        'streaks': streaks,
        'hard_victories': hard_victories,
        'ability': round(ability, 2)})

@app.route('/verb-detective')
def verb_detective():
    """Verb Detective ELA game page."""
    return render_template('verb_detective.html')

@app.route('/expression-comparison', methods=['GET'])
def expression_comparison():
    """Expression Comparison game page."""
    return render_template('expression_comparison.html')

@app.route('/decimal-life')
def decimal_life():
    """Turn-based life journey game with decimal money math."""
    return render_template('decimal_life.html')

@app.route('/math_adventure')
def math_adventure():
    """Math Adventure RPG quest game page."""
    return render_template('math_adventure.html')

# All ten 6th-grade curriculum destinations are available from the Quest Map.
ACTIVE_CURRICULUM_UNITS = set(range(1, 11))

@app.route('/orientation')
def orientation_planet():
    """Orientation Planet (Module 0) - Canvas/platform navigation check before Unit 1."""
    return render_template('orientation_planet.html')

@app.route('/quest-map')
def quest_map():
    """The Quest Map - comprehensive 6th grade math curriculum adventure."""
    return render_template('quest_map.html')

@app.route('/quest-map/planet/<int:planet_id>')
def planet_hub(planet_id):
    """A dedicated page for the active planet's curriculum stations."""
    if planet_id not in ACTIVE_CURRICULUM_UNITS:
        return redirect(url_for('quest_map'))
    return render_template('planet_hub.html', planet_id=planet_id)

@app.route('/pet-land')
def pet_land():
    """Dedicated pet adoption and pet equipment world."""
    return render_template('pet_land.html')

@app.route('/solar-system')
def solar_system():
    """Freely explorable solar-system enrichment map."""
    return render_template('solar_flight.html')

@app.route('/solar-system-study')
def solar_system_study():
    """Solar-system study page with planet facts and visuals."""
    return render_template('solar_system.html')

@app.route('/percentage_quest')
def percentage_quest():
    """Percentage Quest boss-battle game page."""
    return render_template('percentage_quest.html')

@app.route('/area-explorer', methods=['GET'])
def area_explorer():
    """Area Explorer game page."""
    return render_template('area_explorer.html')

@app.route('/coordinate-navigator')
def coordinate_navigator():
    """Coordinate Plane Navigator game page."""
    return render_template('coordinate_navigator.html')

@app.route('/ratio-river')
def ratio_river():
    """Ratio River Crossing game page."""
    return render_template('ratio_river.html')

@app.route('/vault-solver')
def vault_solver():
    """Vault Password Solver game page."""
    return render_template('vault_solver.html')

@app.route('/obstacle-course')
def obstacle_course():
    """3D Math Obstacle Course game page with a secret message reveal."""
    return render_template('obstacle_course.html')


def get_db_connection():
    """Open a PostgreSQL connection using the DATABASE_URL environment variable."""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise RuntimeError('DATABASE_URL is not configured.')
    return psycopg2.connect(database_url)


def ensure_account_tables():
    """Create account and per-account math progress tables when needed."""
    with closing(get_db_connection()) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS learning_accounts (
                    id SERIAL PRIMARY KEY,
                    email TEXT NOT NULL UNIQUE,
                    display_name TEXT NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS account_math_attempts (
                    id BIGSERIAL PRIMARY KEY,
                    account_id INTEGER NOT NULL REFERENCES learning_accounts(id) ON DELETE CASCADE,
                    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
                    was_correct BOOLEAN NOT NULL,
                    ability_after DOUBLE PRECISION NOT NULL,
                    ability_peak DOUBLE PRECISION NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            cur.execute(
                """
                CREATE INDEX IF NOT EXISTS account_math_attempts_account_created_idx
                ON account_math_attempts (account_id, created_at DESC)
                """
            )
            conn.commit()


def hash_account_password(password):
    """Hash a password with a unique salt using PBKDF2-HMAC-SHA256."""
    iterations = 600_000
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations)
    return '$'.join((
        'pbkdf2_sha256',
        str(iterations),
        base64.urlsafe_b64encode(salt).decode('ascii'),
        base64.urlsafe_b64encode(digest).decode('ascii'),
    ))


def verify_account_password(password, stored_hash):
    """Compare a password with its encoded PBKDF2 hash in constant time."""
    try:
        algorithm, iterations_text, salt_text, digest_text = stored_hash.split('$')
        iterations = int(iterations_text)
        if algorithm != 'pbkdf2_sha256' or not 1 <= iterations <= 2_000_000:
            return False
        salt = base64.urlsafe_b64decode(salt_text.encode('ascii'))
        expected = base64.urlsafe_b64decode(digest_text.encode('ascii'))
    except (AttributeError, ValueError):
        return False
    actual = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations)
    return hmac.compare_digest(actual, expected)


def issue_csrf_token():
    """Return the random CSRF token bound to the current signed session."""
    token = session.get('csrf_token')
    if not token:
        token = secrets.token_urlsafe(32)
        session['csrf_token'] = token
    return token


def valid_csrf_token(candidate):
    """Check a submitted CSRF token against the current session token."""
    token = session.get('csrf_token')
    return bool(token and candidate and hmac.compare_digest(token, candidate))


def login_required(view_function):
    """Redirect anonymous visitors to sign in before showing private account data."""
    @wraps(view_function)
    def wrapped_view(*args, **kwargs):
        if not session.get('account_id'):
            return redirect(url_for('account_login'))
        return view_function(*args, **kwargs)
    return wrapped_view


def save_account_math_attempt(account_id, difficulty, was_correct, ability_after, ability_peak):
    """Persist one signed-in Math Practice answer without storing the answer text."""
    with closing(get_db_connection()) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO account_math_attempts
                    (account_id, difficulty, was_correct, ability_after, ability_peak)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (account_id, difficulty, was_correct, ability_after, ability_peak),
            )
            conn.commit()


def get_latest_account_ability(account_id):
    """Load the most recent persisted ability score for a signed-in learner."""
    with closing(get_db_connection()) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT ability_after
                FROM account_math_attempts
                WHERE account_id = %s
                ORDER BY created_at DESC, id DESC
                LIMIT 1
                """,
                (account_id,),
            )
            row = cur.fetchone()
    return row[0] if row else None


@app.route('/account/register', methods=['GET', 'POST'])
def account_register():
    """Create a learner account and sign the learner in."""
    if session.get('account_id'):
        return redirect(url_for('account_dashboard'))

    error_message = None
    display_name = ''
    email = ''
    if request.method == 'POST':
        display_name = request.form.get('display_name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        password_confirm = request.form.get('password_confirm', '')
        if not valid_csrf_token(request.form.get('csrf_token', '')):
            error_message = 'This form expired. Please try signing up again.'
        elif not display_name or len(display_name) > 80:
            error_message = 'Enter a name that is 1 to 80 characters long.'
        elif len(email) > 254 or not re.fullmatch(r'[^@\s]+@[^@\s]+\.[^@\s]+', email):
            error_message = 'Enter a valid email address.'
        elif len(password) < 10:
            error_message = 'Choose a password with at least 10 characters.'
        elif len(password) > 1024:
            error_message = 'Password is too long.'
        elif password != password_confirm:
            error_message = 'The passwords do not match.'
        else:
            try:
                ensure_account_tables()
                with closing(get_db_connection()) as conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            """
                            INSERT INTO learning_accounts (email, display_name, password_hash)
                            VALUES (%s, %s, %s)
                            ON CONFLICT (email) DO NOTHING
                            RETURNING id, display_name
                            """,
                            (email, display_name, hash_account_password(password)),
                        )
                        account = cur.fetchone()
                        conn.commit()
                if account is None:
                    error_message = 'An account with that email already exists. Please log in.'
                else:
                    session.clear()
                    session.permanent = True
                    session['account_id'] = account[0]
                    session['account_name'] = account[1]
                    return redirect(url_for('account_dashboard'))
            except Exception:
                app.logger.exception('Failed creating learner account.')
                error_message = 'We could not create your account right now. Please try again.'

    response_status = 200
    if error_message == 'This form expired. Please try signing up again.':
        response_status = 400
    elif error_message == 'We could not create your account right now. Please try again.':
        response_status = 503
    return render_template(
        'account_auth.html',
        mode='register',
        error_message=error_message,
        display_name=display_name,
        email=email,
    ), response_status


@app.route('/account/login', methods=['GET', 'POST'])
def account_login():
    """Authenticate a learner account and begin a fresh signed session."""
    if session.get('account_id'):
        return redirect(url_for('account_dashboard'))

    error_message = None
    email = ''
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        if not valid_csrf_token(request.form.get('csrf_token', '')):
            error_message = 'This form expired. Please try logging in again.'
        elif len(email) > 254 or not email or len(password) > 1024:
            error_message = 'Email or password is incorrect.'
        else:
            try:
                ensure_account_tables()
                with closing(get_db_connection()) as conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            """
                            SELECT id, display_name, password_hash
                            FROM learning_accounts
                            WHERE email = %s
                            """,
                            (email,),
                        )
                        account = cur.fetchone()
                        if account and verify_account_password(password, account[2]):
                            cur.execute(
                                """
                                UPDATE learning_accounts
                                SET last_login_at = NOW()
                                WHERE id = %s
                                """,
                                (account[0],),
                            )
                            conn.commit()
                        else:
                            account = None
                if account is None:
                    error_message = 'Email or password is incorrect.'
                else:
                    session.clear()
                    session.permanent = True
                    session['account_id'] = account[0]
                    session['account_name'] = account[1]
                    return redirect(url_for('account_dashboard'))
            except Exception:
                app.logger.exception('Failed authenticating learner account.')
                error_message = 'We could not log you in right now. Please try again.'

    response_status = 200
    if error_message == 'Email or password is incorrect.':
        response_status = 401
    elif error_message == 'This form expired. Please try logging in again.':
        response_status = 400
    elif error_message == 'We could not log you in right now. Please try again.':
        response_status = 503
    return render_template(
        'account_auth.html',
        mode='login',
        error_message=error_message,
        display_name='',
        email=email,
    ), response_status


@app.route('/account/logout', methods=['POST'])
def account_logout():
    """End the learner's session."""
    if not valid_csrf_token(request.form.get('csrf_token', '')):
        abort(400, description='This form expired. Please refresh and try again.')
    session.clear()
    return redirect(url_for('quest_map'))


@app.route('/account')
@login_required
def account_dashboard():
    """Show the signed-in learner's account details and saved Math Practice history."""
    account_id = session.get('account_id')
    try:
        ensure_account_tables()
        with closing(get_db_connection()) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, email, display_name, created_at, last_login_at
                    FROM learning_accounts
                    WHERE id = %s
                    """,
                    (account_id,),
                )
                account = cur.fetchone()
                if account is None:
                    session.clear()
                    return redirect(url_for('account_login'))
                cur.execute(
                    """
                    SELECT COUNT(*),
                           COUNT(*) FILTER (WHERE was_correct),
                           COALESCE(MAX(ability_peak), %s),
                           (SELECT ability_after
                            FROM account_math_attempts
                            WHERE account_id = %s
                            ORDER BY created_at DESC, id DESC
                            LIMIT 1),
                           MAX(created_at)
                    FROM account_math_attempts
                    WHERE account_id = %s
                    """,
                    (adaptive.INITIAL_ABILITY, account_id, account_id),
                )
                stats = cur.fetchone()
                cur.execute(
                    """
                    SELECT difficulty, was_correct, created_at
                    FROM account_math_attempts
                    WHERE account_id = %s
                    ORDER BY created_at DESC, id DESC
                    LIMIT 10
                    """,
                    (account_id,),
                )
                recent_attempts = cur.fetchall()
    except Exception:
        app.logger.exception('Failed loading learner account dashboard.')
        return render_template(
            'account_dashboard.html',
            account=None,
            progress=None,
            recent_attempts=[],
            error_message='We could not load your account data right now. Please try again.',
        ), 503

    attempt_count, correct_count, peak_ability, current_ability, last_activity = stats
    current_ability = current_ability if current_ability is not None else adaptive.INITIAL_ABILITY
    progress = {
        'attempt_count': attempt_count,
        'correct_count': correct_count,
        'accuracy': round(correct_count * 100 / attempt_count) if attempt_count else 0,
        'peak_tier': adaptive.ability_to_tier(peak_ability),
        'current_tier': adaptive.ability_to_tier(current_ability),
        'last_activity': last_activity,
    }
    return render_template(
        'account_dashboard.html',
        account={
            'id': account[0],
            'email': account[1],
            'display_name': account[2],
            'created_at': account[3],
            'last_login_at': account[4],
        },
        progress=progress,
        recent_attempts=recent_attempts,
        error_message=None,
    )


def ensure_student_creations_table():
    """Create student creations table if it does not exist."""
    with closing(get_db_connection()) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS student_creations (
                    id SERIAL PRIMARY KEY,
                    unit_id TEXT NOT NULL,
                    planet_id INTEGER NOT NULL,
                    activity_id TEXT NOT NULL,
                    question TEXT NOT NULL,
                    answer TEXT NOT NULL,
                    hint TEXT NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            conn.commit()


@app.route('/api/student-creations', methods=['POST'])
def save_student_creation():
    """Save student-authored question/answer/hint for teacher review."""
    payload = request.get_json(silent=True) or {}

    question_text = str(payload.get('question', '')).strip()
    answer_text = str(payload.get('answer', '')).strip()
    hint_text = str(payload.get('hint', '')).strip()
    unit_id = str(payload.get('unit_id', '')).strip()
    activity_id = str(payload.get('activity_id', '')).strip()
    planet_id_raw = payload.get('planet_id', 0)

    if not question_text or not answer_text or not hint_text:
        return jsonify({'error': 'Question, answer, and hint are required.'}), 400
    if not unit_id or not activity_id:
        return jsonify({'error': 'Unit and activity metadata are required.'}), 400

    try:
        planet_id = int(planet_id_raw)
    except (TypeError, ValueError):
        return jsonify({'error': 'planet_id must be a valid integer.'}), 400

    if planet_id not in ACTIVE_CURRICULUM_UNITS:
        return jsonify({'error': 'planet_id is not part of the active curriculum.'}), 400

    if len(question_text) > 1200 or len(answer_text) > 600 or len(hint_text) > 1200:
        return jsonify({'error': 'Submission is too long.'}), 400

    try:
        ensure_student_creations_table()
        with closing(get_db_connection()) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO student_creations (unit_id, planet_id, activity_id, question, answer, hint)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id, created_at
                    """,
                    (unit_id, planet_id, activity_id, question_text, answer_text, hint_text),
                )
                row = cur.fetchone()
                conn.commit()
    except Exception as exc:
        app.logger.error(f'Failed saving student creation: {exc}')
        return jsonify({'error': 'Could not save student creation right now.'}), 500

    return jsonify(
        {
            'ok': True,
            'id': row[0],
            'created_at': row[1].isoformat() if row and row[1] else None,
        }
    )


@app.route('/api/teacher/student-creations', methods=['GET'])
def list_student_creations_for_teacher():
    """Read student-created items for teacher dashboard use."""
    teacher_token = os.environ.get('TEACHER_DASHBOARD_TOKEN', '').strip()
    incoming_token = request.headers.get('X-Teacher-Token', '').strip()
    if teacher_token and incoming_token != teacher_token:
        return jsonify({'error': 'Unauthorized'}), 403

    limit_raw = request.args.get('limit', '100')
    try:
        limit = int(limit_raw)
    except (TypeError, ValueError):
        limit = 100
    limit = max(1, min(limit, 500))

    try:
        ensure_student_creations_table()
        with closing(get_db_connection()) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, unit_id, planet_id, activity_id, question, answer, hint, created_at
                    FROM student_creations
                    ORDER BY created_at DESC
                    LIMIT %s
                    """,
                    (limit,),
                )
                rows = cur.fetchall()
    except Exception as exc:
        app.logger.error(f'Failed loading student creations: {exc}')
        return jsonify({'error': 'Could not load student creations right now.'}), 500

    records = [
        {
            'id': row[0],
            'unit_id': row[1],
            'planet_id': row[2],
            'activity_id': row[3],
            'question': row[4],
            'answer': row[5],
            'hint': row[6],
            'created_at': row[7].isoformat() if row[7] else None,
        }
        for row in rows
    ]
    return jsonify({'items': records})


def ensure_star360_checkins_table():
    """Create star360_submissions table if it does not exist."""
    with closing(get_db_connection()) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS star360_submissions (
                    id SERIAL PRIMARY KEY,
                    student_name TEXT NOT NULL,
                    boy_status TEXT NOT NULL,
                    moy_status TEXT NOT NULL,
                    eoy_status TEXT NOT NULL,
                    earned_points INTEGER NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
                """
            )
            conn.commit()


@app.route('/star360-checkin')
def star360_checkin():
    """Diagnostic check-in log page for Star360 tests."""
    return render_template('star360_checkin.html')


@app.route('/api/star360-checkin', methods=['POST'])
def save_star360_checkin():
    """Save student-reported BOY, MOY, EOY check-ins to DB."""
    payload = request.get_json(silent=True) or {}
    
    student_name = str(payload.get('student_name', '')).strip()
    boy_status = str(payload.get('boy_status', '')).strip()
    moy_status = str(payload.get('moy_status', '')).strip()
    eoy_status = str(payload.get('eoy_status', '')).strip()
    earned_points_raw = payload.get('earned_points', 0)

    if not student_name:
        return jsonify({'error': 'Student name is required.'}), 400

    try:
        earned_points = int(earned_points_raw)
    except (TypeError, ValueError):
        return jsonify({'error': 'earned_points must be a valid integer.'}), 400

    try:
        ensure_star360_checkins_table()
        with closing(get_db_connection()) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO star360_submissions (student_name, boy_status, moy_status, eoy_status, earned_points)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id, created_at
                    """,
                    (student_name, boy_status, moy_status, eoy_status, earned_points)
                )
                row = cur.fetchone()
                conn.commit()
    except Exception as exc:
        app.logger.error(f'Failed saving Star360 submission: {exc}')
        return jsonify({'error': 'Could not save checkin right now.'}), 500

    return jsonify({
        'ok': True,
        'id': row[0],
        'created_at': row[1].isoformat() if row and row[1] else None
    })


@app.route('/api/teacher/star360-checkins', methods=['GET'])
def list_star360_checkins_for_teacher():
    """Read star360 submissions for teacher monitoring."""
    teacher_token = os.environ.get('TEACHER_DASHBOARD_TOKEN', '').strip()
    incoming_token = request.headers.get('X-Teacher-Token', '').strip()
    if teacher_token and incoming_token != teacher_token:
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        ensure_star360_checkins_table()
        with closing(get_db_connection()) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, student_name, boy_status, moy_status, eoy_status, earned_points, created_at
                    FROM star360_submissions
                    ORDER BY created_at DESC
                    """
                )
                rows = cur.fetchall()
    except Exception as exc:
        app.logger.error(f'Failed loading star360 submissions: {exc}')
        return jsonify({'error': 'Could not load star360 checkins right now.'}), 500

    records = [
        {
            'id': row[0],
            'student_name': row[1],
            'boy_status': row[2],
            'moy_status': row[3],
            'eoy_status': row[4],
            'earned_points': row[5],
            'created_at': row[6].isoformat() if row[6] else None
        }
        for row in rows
    ]
    return jsonify({'items': records})


# The big red activation button.
if __name__ == '__main__':
    app.run(debug=True)
