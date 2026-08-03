import json
import os
import random
import re
from contextlib import closing
from collections import deque
from datetime import datetime
from urllib import error, request as urllib_request

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import psycopg2
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
    """Main home page with Math and ELA sections."""
    return render_template('home.html')

@app.route('/math-games', methods=['GET'])
def math_games():
    """Math games selection page."""
    return render_template('math_games.html')

@app.route('/ela-games', methods=['GET'])
def ela_games():
    """ELA games selection page."""
    return render_template('ela_games.html')

@app.route('/baking-club', methods=['GET'])
def baking_club():
    """Baking Club page."""
    return render_template('baking_club.html')

@app.route('/grand-finale', methods=['GET'])
def grand_finale():
    """6th Grade Math Grand Finale celebration slideshow."""
    return render_template('grand_finale.html')

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

@app.route('/math-practice', methods=['GET', 'POST'])
def math_practice():
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
    elif difficulty == 'medium':
        questions_left = max(0, medium_to_hard - streaks['medium'])
        next_level = 'hard'
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
            
        # Store previous question information BEFORE updating difficulty
        current_question = request.form.get('current_question', '')
        session['previous_question'] = {
            'question': current_question,
            'user_answer': user_answer,
            'correct_answer': correct_answer_float,
            'was_correct': is_correct
        }
        
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
            response_data = {
                'result': result,
                'question': question,
                'answer': answer,
                'difficulty': session['difficulty'],
                'victory': victory,
                'questions_left': questions_left,
                'next_level': next_level,
                'streaks': streaks,
                'hard_victories': session.get('hard_victories', 0)
            }
            # Add previous question info if available
            if 'previous_question' in session:
                response_data['previous_question'] = session['previous_question']
            return jsonify(response_data)
        else:
            return render_template('math_practice.html', 
                                   question=question, 
                                   answer=answer, 
                                   result=result, 
                                   difficulty=session['difficulty'],
                                   victory=victory,
                                   questions_left=questions_left,
                                   next_level=next_level,
                                   easy_num=easy_num,
                                   medium_num=medium_num,
                                   hard_num=hard_num,
                                   streaks=streaks,
                                   hard_victories=session.get('hard_victories', 0))
    else:
        question, answer = generate_question(difficulty)
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
                               hard_victories=session.get('hard_victories', 0))

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
        'next_level': next_level,
        'streaks': streaks,
        'hard_victories': session.get('hard_victories', 0)})

@app.route('/verb-detective')
def verb_detective():
    return render_template('verb_detective.html')

@app.route('/expression-comparison', methods=['GET'])
def expression_comparison():
    """Expression Comparison game page."""
    return render_template('expression_comparison.html')

@app.route('/math_adventure')
def math_adventure():
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

@app.route('/percentage_quest')
def percentage_quest():
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
