# Mrs. McAllister's Learning Center

A comprehensive web-based learning and practice platform featuring interactive math, English Language Arts (ELA), 3D space flight exploration, curriculum station hubs, and student telemetry. Built with Flask, React, Three.js, and PostgreSQL with progressive difficulty and accessibility features.

## 🌟 Features

### 🔢 Core Math Games
- **Math Practice** - Progressive arithmetic practice advancing from easy to hard with instant feedback.
- **Math Blast** - Fast-paced arcade math challenge with descending falling equations.
- **Math Race** - 60-second timed problem-solving sprint with streak multipliers.
- **Math Memory** - Concentration card matching for arithmetic expressions and solutions.
- **Decimal Master** - Decimal arithmetic operations and place value drills.
- **Fraction Master** - 8 progressive levels covering simplifying, common denominators, multiplication, and division.
- **Plot Points** - Four-quadrant Cartesian graphing and distance measurement tool.
- **Exponent Power** - Numerical exponent evaluation with step-by-step worked solutions.
- **Exponent Rules** - Product of powers, quotient of powers, negative, and fractional exponents.
- **Exponent World** - Real-world applied word problems covering biology, technology, geometry, and finance.
- **Area Explorer** - Multi-level polygon and composite geometric area solver with canvas diagrams.
- **Coordinate Navigator** - Quadrant grid navigation and directional distance challenges.
- **Ratio River** - Proportional reasoning and equivalent ratio bridge-building.
- **Vault Solver** - Equation and pattern decoding to unlock the secret vault.
- **Percentage Quest** - Turn-based boss battle RPG powered by percentage, discount, and tax calculations.
- **Expression Comparison** - Variable expression inequality balancing and evaluation.
- **Math Adventure** - Graphical fantasy RPG journey across an interactive world map.
- **Obstacle Course** - 3D obstacle runner revealing secret math messages.

### 📚 English Language Arts (ELA) Games
- **Context Clues** - Reading comprehension inference challenges for Tier 2 and Tier 3 vocabulary.
- **Sentence Fixer** - Capitalization, punctuation, and grammar editing mechanics.
- **Verb Detective** - Identification of action verbs, linking verbs, and verb phrases in narrative sentences.
- **Word Match** - Synonym and antonym pairing across tiered difficulties.

### 🪐 3D Space Flight & Quest Map
- **Cosmic Flight Quest Map** - 3D space flight navigation across 10 curriculum planetary systems.
- **Curriculum Planet Hubs** - Constellation pathway stations covering all 6th-grade math standards.
- **Solar System Explorer** - Scale planetary map with authentic NASA imagery and astronomy facts.
- **Orientation Station** - Module 0 onboarding checking Canvas navigation, calendar, and inbox skills.
- **Pet Land** - Pet adoption and equipment center earned via quest achievements.
- **Grand Finale** - 3-day end-of-year math celebration slideshow with interactive mini-games.

### 🕹️ Arcade Hub
- **Dino Arcade** - Astronaut space runner jumping over planetary debris.
- **Snake Arcade** - Classic retro snake arcade game with arithmetic checkpoints.
- **Pong Arcade** - Paddle reflex arcade challenge.
- **Tetris** - Block stacking puzzle challenge.
- **Pinball Arcade** - Physics pinball score chaser.

### 🤖 Student Support & Accessibility
- **Gemini AI Helper Chatbot** - Safe student coaching chatbot powered by Google Gemini 2.5 Flash with local FAQ fast-path.
- **Dyslexia-Friendly Typography** - Lexend font family, high-contrast panels, and left-aligned text blocks.
- **Floating Scientific Calculator** - Draggable, responsive calculator accessible on all activity pages.
- **FERPA Compliance** - Student privacy protection without collecting Personally Identifiable Information (PII).
- **Teacher Analytics & Pacing Dashboard** - Real-time mastery analytics, Star 360 check-in logs, and pacing locks.

## 🚀 Live Demo

The application is deployed and available at: [mcallister2.onrender.com](https://mcallister2.onrender.com)

## 🛠️ Technology Stack

- **Backend**: Flask (Python 3.11+ web framework), Gunicorn WSGI server.
- **Telemetry Backend**: Node.js, Express, PostgreSQL (`quest_logs_backend/`).
- **Frontend SPA Platform**: React 18, Vite, Three.js / React Three Fiber, Tailwind CSS, Lucide React, Recharts (`math_learning_platform/`).
- **Database**: PostgreSQL (student creation reviews, quest telemetry, Star 360 diagnostic check-ins).
- **AI Integration**: Google Gemini 2.5 Flash API with strict safety system prompts.
- **Package Management**: [uv](https://docs.astral.sh/uv/) for Python dependencies, npm for JavaScript packages.

## 📁 Project Structure

```
math_practice/
├── app.py                              # Main Flask application and API routes.
├── pyproject.toml                      # Python package configuration and dependencies.
├── uv.lock                             # Locked Python dependency graph.
├── update_chatbot.py                   # Chatbot FAQ update utility.
├── update_suggestions.py               # Autocomplete suggestions update script.
├── math_learning_platform/             # React SPA frontend application.
│   ├── package.json                    # React dependencies and scripts.
│   └── src/
│       ├── main.jsx                    # React mount entry point.
│       ├── App.jsx                     # Top-level view router and auth gate.
│       ├── auth/                       # Supabase authentication context.
│       ├── components/                 # UI components (PlanetHub, Modals, Games).
│       ├── data/                       # Curriculum units and question banks.
│       ├── gameEngine/                 # 3D Three.js canvas engines.
│       └── teacher/                    # Teacher analytics dashboards.
├── quest_logs_backend/                 # Express.js telemetry microservice.
│   ├── server.js                       # Telemetry ingestion server.
│   ├── db.sql                          # PostgreSQL database schema.
│   └── package.json                    # Node.js dependencies.
├── templates/                          # Jinja2 HTML templates for all games & hubs.
│   ├── base.html                       # Global HTML wrapper with widgets.
│   ├── home.html                       # Main learning center landing page.
│   ├── math_games.html                 # Math games directory.
│   ├── ela_games.html                  # ELA games directory.
│   ├── quest_map.html                  # 3D space flight quest navigation.
│   ├── planet_hub.html                 # 10-station constellation trail.
│   ├── solar_system.html               # Solar system fact explorer.
│   ├── solar_flight.html               # 3D solar system flight simulation.
│   ├── star360_checkin.html            # Diagnostic test check-in log.
│   └── ...                             # Dedicated game view templates.
└── static/                             # Static assets.
    ├── audio/                          # Sound tracks and audio effects.
    ├── css/                            # Modular stylesheet files.
    ├── img/                            # Refactored images and diagrams.
    │   ├── planet_backgrounds/         # Illustrated planet backdrop art.
    │   └── screenshots/                # UI screenshots and captures.
    ├── js/                             # Game logic scripts and interactive modules.
    ├── models/                         # 3D WebGL asset models.
    └── pdfs/                           # Printable learning worksheets.
```

## 🎯 How the Progressive System Works

### Difficulty Levels
1. **Easy**: Single-digit integers and foundational mechanics.
2. **Medium**: Multi-digit integers, fractions, and simple decimals.
3. **Hard**: Mixed numbers, multi-step algebra, and complex word problems.

### Progression Requirements
- **Easy → Medium**: Answer 4 consecutive questions correctly.
- **Medium → Hard**: Answer 7 consecutive questions correctly.
- **Victory**: Answer 5 hard questions correctly.

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- [uv](https://docs.astral.sh/uv/) package manager
- Node.js 18+ (for React platform and telemetry microservice)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd math_practice
   ```

2. **Sync Python dependencies**:
   ```bash
   uv sync
   ```

3. **Configure Environment Variables**:
   ```bash
   export GEMINI_API_KEY="your-gemini-api-key"
   export DATABASE_URL="postgresql://user:pass@localhost:5432/math_practice"
   ```

4. **Run the Flask application**:
   ```bash
   uv run python app.py
   ```

5. **Open your browser** and navigate to `http://localhost:5000`.

### Running the React Platform (Optional)
```bash
cd math_learning_platform
npm install
npm run dev
```

### For Production Deployment
The application is configured for deployment with Gunicorn:
```bash
gunicorn app:app
```

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