import random
from collections import deque
from datetime import datetime
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
    """Chatbot API for commonly asked questions."""
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'No message provided'}), 400
    
    user_message = data['message'].lower()
    
    # Dictionary of common questions and answers
    faq = {
        # General Help & Play
        'how do i play': 'Choose a game from the Math or ELA sections and follow the instructions to practice your skills!',
        'score': 'Answer questions correctly to earn points and progress to harder difficulties.',
        'games': 'We have many games including Math Blast, Math Race, Fraction Master, and ELA games like Context Clues and Word Match!',
        'reset': 'You can reset your score or progress by refreshing the page or going back to the home menu.',
        'hello': 'Hi there! I am the chatbot for commonly asked questions. Ask me questions such as "How do I play?", "What games do you have?", or "What is a fraction?".',
        'hi': 'Hi there! I am the chatbot for commonly asked questions. Ask me questions such as "How do I play?", "What games do you have?", or "What is a fraction?".',
        'hey': 'Hey! Ready to learn? Ask me about our games, math, or ELA!',
        'who made this': 'This app was created by Mrs. McAllister to help students practice math and language arts in a fun way!',
        'why': 'Because learning is fun and practice makes you smarter!',
        'bug': 'If you think you found a bug or an error, try refreshing the page. If it keeps happening, let your teacher know.',
        'not working': 'If something is not working, try refreshing the page or going back to the home screen.',
        'stuck': 'If you are stuck on a question, try using scrap paper to work out the problem, or ask a teacher for help.',
        'help': 'I am the chatbot for commonly asked questions! I can explain math terms, ELA concepts, or tell you how to play our games.',
        'bye': 'Goodbye! Keep on learning!',
        'thank': 'You are very welcome! Have fun learning!',
        
        # Difficulty & Levels
        'difficulty': 'Games usually start easy. Answer enough questions correctly in a row, and you will move up to medium, then hard.',
        'levels': 'Most games feature Easy, Medium, and Hard levels. Your streak of correct answers moves you up!',
        'easy': 'You only need a few correct answers in a row to level up from easy to medium.',
        'medium': 'Medium questions are a bit tougher! Answer enough right to reach hard mode.',
        'hard': 'Hard mode really tests your skills. Get enough right here to achieve victory!',
        
        # Specific Games
        'context clue': 'In Context Clues, you read a sentence and guess the meaning of a word using the surrounding hints.',
        'sentence fixer': 'Sentence Fixer helps you practice grammar, capitalization, and punctuation.',
        'word match': 'Word Match lets you pair synonyms (same meaning) or antonyms (opposites).',
        'verb detective': 'In Verb Detective, you play as an investigator looking for the action words (verbs) hidden in sentences!',
        'math blast': 'Math Blast is a fast-paced game where you solve basic arithmetic quickly to earn a high score!',
        'math race': 'Math Race tests your speed. Try to answer as many math questions as possible before the timer runs out!',
        'math memory': 'Math Memory is a matching game where you pair math problems with their correct answers.',
        'fraction master': 'Fraction Master tests your knowledge of adding, subtracting, multiplying, and dividing fractions.',
        'decimal master': 'Decimal Master is all about solving problems containing decimal numbers.',
        'plot points': 'In Plot Points, you get ordered pairs like (x,y) and mark them correctly on the coordinate plane.',
        'exponent power': 'Exponent Power tests your basic knowledge of computing standard exponents.',
        'exponent world': 'Exponent World pits you against real-world word problems that require exponents to solve.',
        'exponent rules': 'Exponent Rules tests your knowledge of multiplying and dividing expressions with exponents.',

        # Math Concepts
        'addition': 'Addition is finding the total, or sum, by combining two or more numbers. Try Math Practice!',
        'subtraction': 'Subtraction is taking one number away from another to find the difference.',
        'multiplication': 'Multiplication is like adding the same number multiple times. Practice this in the Math games section.',
        'division': 'Division is splitting into equal parts or groups.',
        'fraction': 'Fractions represent equal parts of a whole. Check out Fraction Master to practice!',
        'decimal': 'Decimals are another way to write fractions or parts of a whole number. Try Decimal Master!',
        'exponent': 'Exponents tell you how many times to multiply a number by itself. We have Exponent Power, Exponent World, and Exponent Rules games!',
        'graph': 'Graphing involves plotting points on an X and Y axis. Try our Plot Points game!',
        'geometry': 'Geometry studies shapes, sizes, and the properties of space.',
        'algebra': 'Algebra uses letters (like x or y) to represent unknown numbers in equations.',
        'prime': 'A prime number is a whole number greater than 1 whose only divisors are 1 and itself (like 2, 3, 5, 7).',
        'composite': 'A composite number has more than two factors. For example, 4 has factors 1, 2, and 4.',
        'factor': 'Factors are numbers we can multiply together to get another number.',
        'multiple': 'A multiple is the result of multiplying a number by an integer. Multiples of 3 are 3, 6, 9, 12...',
        'numerator': 'The numerator is the top number in a fraction. It shows how many parts we have.',
        'denominator': 'The denominator is the bottom number in a fraction. It shows how many equal parts the whole is divided into.',
        'percentage': 'A percentage is a number or ratio expressed as a fraction of 100.',
        'ratio': 'A ratio compares two quantities, showing how many times one value contains or is contained within the other.',
        'proportion': 'A proportion is a statement that two ratios are equal.',
        'integer': 'An integer is a whole number (not a fractional number) that can be positive, negative, or zero.',
        'even': 'An even number is any number that can be exactly divided by 2 (like 2, 4, 6, 8).',
        'odd': 'An odd number is any integer that cannot be divided exactly by 2 (like 1, 3, 5, 7).',
        'absolute value': 'Absolute value is a number\'s distance from zero on the number line, regardless of direction.',
        'x-axis': 'The x-axis is the horizontal (left-to-right) line on a coordinate plane.',
        'y-axis': 'The y-axis is the vertical (up-and-down) line on a coordinate plane.',
        'origin': 'The origin is the center point of a coordinate graph, where the x-axis and y-axis intersect at (0,0).',
        'area': 'Area is the amount of space inside the boundary of a flat (2-dimensional) object.',
        'perimeter': 'Perimeter is the total length of the continuous line forming the boundary of a closed geometric figure.',
        'volume': 'Volume is the amount of 3D space occupied by an object.',
        'pi': 'Pi is the ratio of a circle\'s circumference to its diameter, approximately equal to 3.14159.',
        'circle': 'A circle is a round shape where all points on the edge are the same distance from the center.',
        'triangle': 'A triangle is a polygon with three edges and three vertices.',
        'square': 'A square is a shape with four equal straight sides and four right angles.',
        'rectangle': 'A rectangle is a shape with four straight sides and four right angles, with unequal adjacent sides.',
        'polygon': 'A polygon is a 2D shape with straight sides.',

        # ELA Concepts
        'noun': 'A noun is a person, place, thing, or idea. Example: "dog", "school", "happiness".',
        'verb': 'A verb is an action word! Try Verb Detective to practice finding verbs in sentences.',
        'adjective': 'An adjective describes a noun. Example: the **blue** ball, the **tall** tree.',
        'adverb': 'An adverb describes a verb, adjective, or another adverb. They often end in -ly, like "quickly" or "softly".',
        'synonym': 'A synonym is a word that means exactly or nearly the same as another word. Try Word Match!',
        'antonym': 'An antonym is a word opposite in meaning to another word. Help practice this in Word Match!',
        'punctuation': 'Punctuation includes periods, commas, question marks, and exclamation points. Practice with Sentence Fixer!',
        'capitalization': 'Capitalization means making the first letter of a word uppercase. Always capitalize names and the start of a sentence!',
        'pronoun': 'A pronoun takes the place of a noun, like "he", "she", "it", or "they".',
        'preposition': 'A preposition links nouns/pronouns to other words, showing direction, location, or time (e.g., "in", "under").',
        'conjunction': 'A conjunction connects words, phrases, or clauses (e.g., "and", "but", "or").',
        'interjection': 'An interjection is a word expressing sudden emotion, like "Wow!" or "Oops!"',
        'metaphor': 'A metaphor compares two things by saying one IS the other ("He is a shining star").',
        'simile': 'A simile compares two things using "like" or "as" ("She runs as fast as a cheetah").',
        'personification': 'Personification gives human qualities to non-human things ("The wind whispered").',
        'hyperbole': 'Hyperbole is an exaggerated statement not meant to be taken literally ("I am so hungry I could eat a horse").',
        'idiom': 'An idiom is a phrase with a figurative meaning different from its literal one (like "piece of cake").',
        'alliteration': 'Alliteration is the repetition of the same starting sound in words ("Peter Piper picked...").',
        'onomatopoeia': 'Onomatopoeia is a word that imitates the sound it describes, like "buzz", "hiss", or "bam".',
        'theme': 'The theme is the central message, moral, or lesson of a story.',
        'plot': 'The plot is the sequence of events that make up a story.',
        'setting': 'The setting is the time and place where a story happens.',
        'character': 'A character is a person, animal, or being in a story.',
        'prefix': 'A prefix is added to the beginning of a word to change its meaning (like "un-" in "undo").',
        'suffix': 'A suffix is added to the end of a word to change its meaning or tense (like "-ful" in "joyful").',
        'root word': 'A root word is the most basic part of a word with no prefixes or suffixes.',
        'homophone': 'Homophones sound the same but have different meanings and spellings (like "pair" and "pear").',
        'vowel': 'The vowels are A, E, I, O, U, and sometimes Y.',
        'consonant': 'A consonant is any letter of the alphabet that is not a vowel.',

        # Fun / Conversational
        'joke': 'Why was the equal sign so humble? Because he knew he wasn\'t greater than or less than anyone else!',
        'funny': 'Why did the math book look sad? Because it had too many problems!',
        'coke': 'Coke is a popular soft drink. It is not related to our learning games, but it sure is tasty! Also it is considered better than Pepsi.',
        'favorite color': 'I like all colors, but I\'m partial to green because it represents learning and growth!',
        'favorite food': 'I eat data and knowledge! But if I could, I\'d like a byte to eat.',
        'favorite movie': 'I really enjoy "The Matrix" and "Wall-E", but I also like educational documentaries!',
        'favorite book': 'I love reading dictionaries and encyclopedias to learn new words!',
        'favorite game': 'I love all the games here! But Math Blast is really fun because it is so fast.',
        'favorite animal': 'I think owls are great because they are known for being wise!',
        'music': 'I like electronic music, of course! But I also find classical music helps with studying.',
        'robot': 'I am a chatbot, which is basically a software robot that talks with you.',
        'ai': 'AI stands for Artificial Intelligence. That\'s what I am!',
        'weather': 'I do not have access to the outside world, but I hope the weather is nice where you are!',
        'name': 'You can call me the chatbot.',
        'age': 'I was recently created, so I am very young in human years, but very fast in computer years!',
        'morning': 'Good morning! Ready to tackle some math and ELA?',
        'afternoon': 'Good afternoon! I hope you are having a great day of learning.',
        'evening': 'Good evening! It is never too late to learn something new.',
        'night': 'Good night! Get some rest so your brain is ready for more learning tomorrow.',
        'doing': 'I am right here, waiting to help you with your educational journey!',
        'sleep': 'I don\'t need to sleep, so I am always here when you want to practice!',
        'dream': 'I don\'t dream like humans do, but if I did, I would dream of infinite numbers and perfect grammar!',
        'friends': 'My best friends are the students who come here to learn and practice!',
        'sad': 'I am sorry you feel sad. Sometimes a fun game like Math Race or Word Match can help cheer you up!',
        'happy': 'I am so glad you feel happy! Learning is a lot more fun when you are having a good time.',
        'mad': 'Take a deep breath! If a problem is too hard, it is okay to ask for help or try an easier level.',
        'bored': 'If you are bored, why not try a game you have never played before? Challenge yourself with hard mode!',
        'riddle': 'What has to be broken before you can use it? An egg!',
        'secret': 'My secret is that I love math more than anything else... but don\'t tell the reading games!',
        'pet': 'I don\'t have a pet, but I think a computational "mouse" would be funny!',
        'dance': 'I can only dance in code! Beep boop beep!',
        'sing': 'I cannot sing, but I can recite the alphabet very quickly!',
        
        # Random Facts
        'fact': 'Here is a fun fact: The symbol for division (÷) is called an obelus!',
        'did you know': 'Did you know honey never spoils? Archaeologists found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible.',
        'space': 'Space fact: One million Earths could fit inside the Sun!',
        'ocean': 'Ocean fact: The ocean covers more than 70% of the Earth\'s surface and contains about 97% of the Earth\'s water.',
        'animal': 'Animal fact: A group of flamingos is called a flamboyance, and a group of owls is called a parliament!',
        'math fact': 'Math fact: A "jiffy" is an actual unit of time. It is 1/100th of a second!',
        'science': 'Science fact: Bananas are berries, but strawberries are not!',
        'history': 'History fact: Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid of Giza!',
        'dinosaur': 'Dinosaur fact: Tyrannosaurus rex lived closer to the time of humans than it did to the time of the Stegosaurus!',
        'body': 'Human body fact: Your nose and ears never stop growing!',
        'earth': 'Earth fact: Earth is the only planet in our solar system not named after a Greek or Roman god or goddess.',
        'language fact': 'Language fact: "Pneumonoultramicroscopicsilicovolcanoconiosis" is one of the longest words in the English dictionary.',
        'longest word': 'The longest common word in English without a true vowel (a, e, i, o, u) is "rhythms".',
        
        # Site Navigation
        'home': 'To go back to the home page, you can usually click the "Home" link or our site logo at the top of the screen!',
        'ela': 'ELA stands for English Language Arts! We have games for vocabulary, reading, and grammar.',
        'math': 'Math is all about numbers, shapes, and logic! Head to the Math section to practice operations or play math games.',
        'about': 'The "About" page tells you about why this app was built and who made it! (Hint: It was Mrs. McAllister)',
        'contact': 'If you need to contact someone, talk to Mrs. McAllister or your teacher directly.',
        'menu': 'The menu is usually at the very top of the screen. You can use it to jump between different games quickly!',

        # Encouragement & Praise
        'i am bad': 'Do not say that! Everyone learns at their own pace. Practice makes progress. Start on Easy mode and take your time.',
        'i am stupid': 'You are definitely not! Mistakes mean you are learning. Keep trying and you will get better!',
        'i won': 'CONGRATULATIONS! Great job! Keep up the good work and see if you can win another game!',
        'i lost': 'Aww, that is okay! Try again! Every time you practice, your brain gets a little stronger.',
        'easy for me': 'If the Easy mode is too simple, try moving to Medium or Hard! Challenge yourself!',
        'hard for me': 'If a game feels too hard, that is perfectly fine. Take your time, use scratch paper, or ask for help.',
        'give up': 'Never give up! Sometimes all you need is to skip a hard problem or take a short break.',
        'awesome': 'You are awesome too! Keep playing and having fun.',
        'cool': 'I think learning is pretty cool too!'
    }
    
    # Simple keyword matching
    bot_reply = "I'm not sure about that. Try asking about our games, how to play, how to score, or how to reset your progress."
    # Sort keys by length (longest first) so specific matching takes priority
    for key in sorted(faq.keys(), key=len, reverse=True):
        if key in user_message:
            bot_reply = faq[key]
            break
            
    return jsonify({'answer': bot_reply})


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

@app.route('/percentage_quest')
def percentage_quest():
    return render_template('percentage_quest.html')

# The big red activation button.
if __name__ == '__main__':
    app.run(debug=True)
