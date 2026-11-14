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

### 🔬 Science Planet
- **Earth Science Stations** - Ten interactive checkpoints covering rocks, erosion, earthquakes, condensation, and the water cycle.
- **Beetle Natural Selection** - Collect moving beetles in a timed hunt with natural selection running every five seconds; shell colors collected less often, or camouflaged against the habitat when collection rates tie, become more common in the next generation.
- **Moth Camouflage** - Collect moving moths in a timed hunt with natural selection running every five seconds; colors collected less often, or camouflaged against the habitat when collection rates are tied, become more common in the next generation.

### 👤 Learner Accounts
- **Sign up, log in, and log out** - Create an account with a unique name and password (no email required); passwords are salted and hashed, and account sessions use secure, HTTP-only cookies.
- **Account coin wallet** - New accounts receive 25 coins, and the first sign-in each UTC day earns 10 more. Quest Map topic completions and the first saved score for each tracked game per UTC day also award coins.
- **Persistent character customization** - Spend account coins in Pet Land on characters, suit colors and skins, hats, tools, shoes, gear, and pets. Purchases and equipped choices follow the learner account across devices.
- **My Account dashboard** - View profile details, recent sign-ins, and saved Math Practice answer counts, accuracy, difficulty, and recent results.
- **Persistent progress** - Signed-in Math Practice ability and answer history are saved in PostgreSQL via `DATABASE_URL`.
- **Private learner profiles** - Select a favorite subject, learning goal, accent color, favorite planet, and favorite pet from preset options. Profiles are private unless the learner opts in to share them with signed-in users. The bio is no longer editable or displayed; existing bio data remains in the database.
- **Student name displays** - Account, leaderboard, community, teacher, check-in, and supported local-game name displays show the first name followed by initials for later name components. Existing account login identifiers and database records are not changed, so learners can continue to sign in as before. Free-text fields cannot reliably detect every name; do not enter full names in answers or other free text.
- **Game leaderboards and community profiles** - Signed-in learners can see the best saved scores by game. Scores are tied to accounts; Math Practice ranks saved correct answers and other games report their visible score counters. Profiles remain private unless the learner opts in; only the display name and selected profile fields are shown to other signed-in learners.
- **Teacher student progress** - A server-configured teacher account can view all other account names, saved Math Practice answer totals and accuracy, and saved best scores for tracked games, even for private profiles. The site does not record every game play or every answer outside Math Practice; browser-only activity is not included.

### 🪐 3D Space Flight & Quest Map
- **Cosmic Flight Quest Map** - 3D space flight navigation across textured curriculum and special planets, with an asteroid belt between curriculum planets 5 and 6 and a black-hole portal to the Solar System Flight Explorer. The belt is scenery and does not damage the ship.
- **Touch flight controls** - On small screens or touch devices, hold Fly, Back, Left, Right, Rise, or Down to pilot the ship; combine controls to steer while moving. Release to coast, use Reset to return to the start, and tap the landing button when near a planet.
- **Customizable Ship** - A "🚀 Customize Ship" tab at the top of the Quest Map and Flight Explorer lets students pick a style (Jet, Rocket, Saucer), body/wing/exhaust colors, and size. Choices are saved in the browser (`localStorage`) and shared by both pages.
- **Curriculum Planet Hubs** - Constellation pathway stations covering all 6th-grade math standards.
- **Solar System Explorer** - Scale planetary map with authentic NASA imagery and astronomy facts.
- **Orientation Sun** - Module 0 onboarding (Canvas navigation, calendar, and inbox skills). The Sun at the center of the Quest Map is the Orientation planet; fly close and press Enter to land. Curriculum planets are numbered starting at 1.
- **Pet Land** - Character wardrobe, color/skin upgrades, hats, tools, shoes, pet adoption, and equipment. Signed-in learners spend and save items with their account coin wallet.
- **Pet Planet** - A shared meadow showing all account-owned pets, including those whose owners are offline. Owners are anonymous. Signed-in learners can pat and play with any pet, adopt pets with their existing wallet, and buy treats or toys and choose a meadow color for their own pets. The free Toy Hunt and Follow the Paw playground games work with any selected pet; their progress is page-session only and does not change coins or shared pet stats. The meadow refreshes every 10 seconds; existing pet hats, trails, and auras remain available in Character Port.
- **Planet Polus** - An original space-crew avatar creator and classroom reward picker. Customize body and face shapes, visor color, expressions, eyes, glasses, hats, clothing and colors, play with your explorer, and edit saved characters without losing passes. Roster entries and assignment passes are stored only in this browser on this device, not in learner accounts or a shared database. Use the same device/browser for student entry and the teacher picker; clearing browser data removes the roster. Teacher mode is a convenience toggle, not authentication, so anyone using the browser can change its records. Enter only a first name and last initial.
- **Golden Algebra Planet** - A story-driven escape room with three algebra security stages, one checkpoint at a time, and hints. Submitting a completed mission saves the latest agent's first name, last initial, and completion time only in the current browser; it is not sent to a teacher or learner account. Clearing browser data removes the record.
- **Fable Quest Planet** - An original fantasy adventure with customizable heroes, puzzles, turn-based encounters, and equipment upgrades. Its progress and in-game shards are saved only in the current browser, are shared by users of that browser, and are separate from account coins. Clearing browser data removes the save.
- **Grand Finale** - 3-day end-of-year math celebration slideshow with interactive mini-games.

### 🕹️ Arcade Hub
- **Starlight Maze** - Collect crystals in an original maze while avoiding drones. Use arrows/WASD, on-screen buttons, or swipe; shield crystals temporarily let you tag drones. Scores are for the current game only and do not award account coins.
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
│   ├── orientation_planet.html         # Orientation Sun (Module 0) onboarding.
│   ├── star360_checkin.html            # Diagnostic test check-in log.
│   └── ...                             # Dedicated game view templates.
└── static/                             # Static assets.
    ├── audio/                          # Sound tracks and audio effects.
    ├── css/                            # Modular stylesheet files.
    ├── img/                            # Refactored images and diagrams.
    │   ├── planet_backgrounds/         # Illustrated planet backdrop art.
    │   └── screenshots/                # UI screenshots and captures.
    ├── js/                             # Game logic scripts and interactive modules.
    │   └── ship_customizer.js          # Shared ship builder + customization panel.
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
   export SECRET_KEY="replace-with-a-strong-random-secret"
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

For Render, configure `DATABASE_URL` to the PostgreSQL database connection string and set a strong, persistent `SECRET_KEY` environment variable. Account tables are created automatically when account features are used. Store the database in managed PostgreSQL rather than relying on an application disk for database persistence.

To enable the private teacher dashboard, first create and verify Mrs. McAllister's account through the normal account flow. Using trusted database administration access, find that verified account's numeric `learning_accounts.id` (for example, inspect `SELECT id, login_name FROM learning_accounts ORDER BY id;`), then set `TEACHER_ACCOUNT_ID` to that exact ID in the server's environment and restart the app. Confirm ownership independently; never authorize by a self-selected display name alone. Only that signed-in account can open `/teacher/students`; access is denied when the setting is absent or invalid. Protect the teacher account password, `SECRET_KEY`, database, and deployment settings. Changing the configured ID transfers access; no one can configure it from the website.

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

The chatbot uses the `gemini-2.5-flash` model through a Flask backend route. The API key must be provided as the `GEMINI_API_KEY` environment variable so it stays on the server and never gets exposed to the browser. The chat window scrolls through long responses and can be dragged; if the AI service is unavailable, clearly labeled offline help is provided for recognized questions.

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