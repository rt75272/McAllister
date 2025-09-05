from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

def generate_question():
    operations = ['+', '-', '*', '/']
    num1 = random.randint(1, 20)
    num2 = random.randint(1, 20)
    op = random.choice(operations)

    if op == '/':
        num2 = random.randint(1, 20)
        question = f"{num1} / {num2}"
        answer = round(num1 / num2, 2)
    elif op == '+':
        question = f"{num1} + {num2}"
        answer = num1 + num2
    elif op == '-':
        question = f"{num1} - {num2}"
        answer = num1 - num2
    elif op == '*':
        question = f"{num1} * {num2}"
        answer = num1 * num2

    return question, answer

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        user_answer = request.form.get('answer')
        correct_answer = float(request.form.get('correct_answer'))

        if float(user_answer) == correct_answer:
            result = f"Correct! The correct answer was {correct_answer}"
        else:
            result = f"Inncorrect! The correct answer was {correct_answer}"

        question, answer = generate_question()

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'result': result,
                'question': question,
                'answer': answer
            })
        else:
            return render_template('index.html', question=question, answer=answer, result=result)
    else:
        question, answer = generate_question()
        return render_template('index.html', question=question, answer=answer, result=None)

if __name__ == '__main__':
    app.run(debug=True)
