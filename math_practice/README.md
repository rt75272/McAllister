# Mrs. McAllister's Math Center

A comprehensive web-based math practice platform featuring multiple interactive games and activities to help students improve their mathematical skills. Built with Flask and featuring a progressive difficulty system.

## 🌟 Features

### Core Math Games
- **Math Practice** - Progressive difficulty system with basic arithmetic operations
- **Math Blast** - Fast-paced math challenges
- **Math Race** - Competitive math problem solving
- **Math Memory** - Memory-based math activities
- **Decimal Master** - Focused decimal arithmetic practice
- **Fraction Master** - Fraction operations and conversions
- **Plot Points** - Interactive graphing and coordinate activities
- **Exponent Power** - Master exponents with interactive power calculations
- **Exponent World** - Real-world word problems using exponent calculations

### Key Features
- **Progressive Difficulty System** - Automatically advances from easy → medium → hard based on performance
- **Performance Tracking** - Session-based score tracking and statistics
- **Immediate Feedback** - Real-time answer validation with detailed responses
- **Gemini Student Helper** - Student-safe chatbot powered by Google Gemini 2.5 Flash with website-aware help
- **Responsive Design** - Mobile-friendly interface that works on all devices
- **Clean UI** - Modern, intuitive design optimized for student use

## 🚀 Live Demo

The application is deployed and available at: [mcallister2.onrender.com](https://mcallister2.onrender.com)

## 🛠️ Technology Stack

- **Backend**: Flask (Python web framework)
- **Frontend**: HTML5, CSS3, JavaScript
- **Session Management**: Flask sessions for user state tracking
- **Deployment**: Gunicorn WSGI server (Render-ready)

## 📁 Project Structure

```
math_practice/
├── app.py                  # Main Flask application
├── pyproject.toml        # Python project configuration
├── uv.lock               # Locked dependencies
├── templates/             # HTML templates
│   ├── base.html          # Base template with common layout
│   ├── index.html         # Homepage with game selection
│   ├── math_practice.html # Progressive math practice
│   ├── math_blast.html    # Math Blast game
│   ├── math_race.html     # Math Race game
│   ├── math_memory.html   # Math Memory game
│   ├── decimal_master.html # Decimal practice
│   ├── fraction_master.html # Fraction practice
│   ├── plot_points.html   # Graphing activities
│   ├── exponent_power.html # Exponent practice
│   ├── exponent_world.html # Exponent word problems
│   └── about.html         # About page
├── static/               # Static assets (CSS/JS)
│   ├── style.css         # Global styles
│   ├── main.js           # Common JavaScript
│   ├── calculator.css/.js # Calculator functionality
│   ├── math_blast.css/.js # Math Blast game logic
│   ├── math_race.css/.js  # Math Race game logic
│   ├── math_memory.css/.js # Math Memory game logic
│   ├── fraction_master.css/.js # Fraction game logic
│   ├── plot_points.css/.js # Graphing functionality
│   ├── exponent_power.css/.js # Exponent game logic
│   └── exponent_world.css/.js # Exponent word problems
└── .venv/                # Python virtual environment (managed by uv)
```

## 🎯 How the Progressive System Works

### Difficulty Levels
1. **Easy**: Numbers 5-10, operations with 1-5
2. **Medium**: Numbers 1-100, operations with 1-50  
3. **Hard**: Numbers 1-1000, operations with 1-500

### Progression Requirements
- **Easy → Medium**: Answer 4 consecutive questions correctly
- **Medium → Hard**: Answer 7 consecutive questions correctly
- **Victory**: Answer 5 hard questions correctly

### Operations Supported
- Addition (+)
- Subtraction (−)
- Multiplication (×)
- Division (÷) - with results rounded to 2 decimal places

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- [uv](https://docs.astral.sh/uv/) package manager

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd math_practice
   ```

2. **Sync the environment and install dependencies**:
   ```bash
   uv sync
   ```

3. **Set your Gemini API key**:
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   ```

4. **Run the application**:
   ```bash
   uv run python app.py
   ```

5. **Open your browser** and navigate to `http://localhost:5000`

### For Production Deployment

The app is configured for deployment with Gunicorn:

```bash
uv run gunicorn app:app
```

## 🎮 Game Descriptions

### Math Practice (Progressive System)
The flagship feature with an adaptive difficulty system that challenges students appropriately based on their performance. Features session tracking and detailed progress feedback.

### Math Blast
Fast-paced arithmetic challenges designed to improve mental math speed and accuracy.

### Math Race
Competitive math problem-solving with time-based challenges.

### Math Memory
Memory-based mathematical activities that combine math skills with memory training.

### Decimal Master
Specialized practice for decimal operations, conversions, and place value understanding.

### Fraction Master
Comprehensive fraction practice including operations, simplification, and mixed numbers.

### Plot Points
Interactive graphing activities teaching coordinate systems, plotting points, and basic graphing concepts.

### Exponent Power
Comprehensive exponent practice with three difficulty levels. Learn fundamental exponent rules including x⁰ = 1, x¹ = x, and practice calculating powers from simple squares to more complex exponential expressions. Features step-by-step calculation guidance and achievement system.

### Exponent World  
Real-world word problem scenarios that require exponent calculations to solve. Covers applications in population growth, technology, construction, science, and fun scenarios. Each problem includes hints, step-by-step explanations, and categorized learning to show how exponents are used in everyday life.

## 🔧 Configuration

### Gemini Chatbot

The chatbot uses the `gemini-2.5-flash` model through a Flask backend route. The API key must be provided as the `GEMINI_API_KEY` environment variable so it stays on the server and never gets exposed to the browser.

### Customizing Difficulty Settings

In `app.py`, you can modify these variables:

```python
easy_num = 4      # Questions needed to advance from easy to medium
medium_num = 7    # Questions needed to advance from medium to hard  
hard_num = 5      # Questions needed for victory in hard mode
num_rounded = 2   # Decimal places for division results
```

### Session Management

The application uses Flask sessions to track:
- Current difficulty level
- Correct answer streaks per difficulty
- Hard mode victories
- Performance records

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👩‍🏫 About

Created for educational purposes to provide an engaging platform for students to practice and improve their mathematical skills. The progressive difficulty system ensures that learners are appropriately challenged while building confidence through success.

## 🐛 Bug Reports & Feature Requests

Please open an issue on GitHub if you encounter any bugs or have suggestions for new features.

---

**Happy Learning! 📚✨**