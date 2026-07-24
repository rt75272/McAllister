/* The Quest Map - Main Educational Game Engine (Astro Bot Space Style!) */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // AUDIO SYNTHESIZER
    // -------------------------------------------------------------
    function playSound(type) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            if (type === 'success') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // C6
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(now + 0.3);
            } else if (type === 'coin') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(987.77, now); // B5
                osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(now + 0.25);
            } else if (type === 'unlock') {
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();
                osc1.type = 'triangle';
                osc2.type = 'triangle';
                osc1.frequency.setValueAtTime(261.63, now); // C4
                osc1.frequency.linearRampToValueAtTime(523.25, now + 0.4);
                osc2.frequency.setValueAtTime(329.63, now); // E4
                osc2.frequency.linearRampToValueAtTime(659.25, now + 0.4);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);
                osc1.start();
                osc2.start();
                osc1.stop(now + 0.5);
                osc2.stop(now + 0.5);
            } else if (type === 'laser') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(now + 0.15);
            } else if (type === 'explosion') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(20, now + 0.25);
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(now + 0.25);
            } else if (type === 'fail') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(220, now); // A3
                osc.frequency.linearRampToValueAtTime(110, now + 0.4);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(now + 0.4);
            }
        } catch (e) {
            console.warn("Web Audio not allowed yet: ", e);
        }
    }

    // -------------------------------------------------------------
    // DATA CONFIGURATION
    // -------------------------------------------------------------
    const units = [
        // Semester 1 (Galaxy 1 Planets - Cosmic Space Style!)
        {
            id: 1, semester: 1, name: "Sky Garden Planet (Number Properties)", icon: "🌸", cityName: "Sky Garden",
            desc: "Warp to Sky Garden, a beautiful floating blossom sanctuary! Repair your ship by mastering division algorithm portals, prime factor flowers, GCF/LCM vines, and distributive locks.",
            topics: [
                { id: "1_1", name: "Blossom Sector (Division) [10🪙]", type: "shooter", coinsAward: 10, icon: "🤖", desc: "Unlock secret sector division codes to initialize landing coordinates!" },
                { id: "1_2", name: "Ivy Climb (GCF & LCM) [12🪙]", type: "baking", coinsAward: 12, icon: "🌿", desc: "Scale seedling blossom formulas using prime factors, GCF, and LCM multiples." },
                { id: "1_3", name: "Greenhouse (Distributive Prop) [15🪙]", type: "balance", coinsAward: 15, icon: "🌺", desc: "Equally distribute pollen packages on balancing vines using the distributive property." }
            ]
        },
        {
            id: 2, semester: 1, name: "Gorilla Nebula (Fractions & Decimals)", icon: "🦍", cityName: "Gorilla Nebula",
            desc: "Swing into the giant metallic ape zone of Gorilla Nebula! Calculate decimal thruster speeds and divide banana split fractions.",
            topics: [
                { id: "2_1", name: "Mighty Ape (Divide Fractions) [10🪙]", type: "shooter", coinsAward: 10, icon: "🍌", desc: "Multiply fractions by their reciprocals to stun the giant robotic guardian ape!" },
                { id: "2_2", name: "Banana Bakery (Decimal Math) [12🪙]", type: "baking", coinsAward: 12, icon: "🥞", desc: "Measure exact decimal ounces of banana cream to bake galactic energy bars." },
                { id: "2_3", name: "Ape Flight Space (Decimal Stars) [15🪙]", type: "shooter", coinsAward: 15, icon: "🌌", desc: "Solve quick decimal equations to blast orbiting asteroid space debris." }
            ]
        },
        {
            id: 3, semester: 1, name: "Bathhouse Battle (Rational Numbers)", icon: "♨️", cityName: "Bathhouse Battle",
            desc: "Splash into Bathhouse Battle! Navigate negative water temperatures, calculate absolute steam distances, and plot quadrant pipes.",
            topics: [
                { id: "3_1", name: "Sub-Zero Plunge (Negative Opposites) [10🪙]", type: "sea", coinsAward: 10, icon: "🧼", desc: "Submerge a robotic probe down to negative water elevations under the bathhouse." },
                { id: "3_2", name: "Steam Distance (Absolute Value) [12🪙]", type: "sea", coinsAward: 12, icon: "💨", desc: "Calculate the absolute distance of steam pipes from standard water level." },
                { id: "3_3", name: "Boiler Coordinate Grid [15🪙]", type: "sea", coinsAward: 15, icon: "⚙️", desc: "Plot the 4 quadrants of the steam pressure valves on the boiler grid." }
            ]
        },
        {
            id: 4, semester: 1, name: "Tenting Trouble (Expressions)", icon: "⛺", cityName: "Tenting Trouble",
            desc: "Pitch a tent in Tenting Trouble forest! Write algebraic formulas, evaluate camping exponents, and solve PEMDAS campfire equations.",
            topics: [
                { id: "4_1", name: "Volcanic Camp (Powers & Exponents) [10🪙]", type: "balance", coinsAward: 10, icon: "🔥", desc: "Balance volcanic geothermal cooking vents using base and power exponents." },
                { id: "4_2", name: "Campfire Stew (Evaluate PEMDAS) [12🪙]", type: "balance", coinsAward: 12, icon: "🍲", desc: "Follow strict order of operations (PEMDAS) to brew campfire stew formulas." },
                { id: "4_3", name: "Sisters Peak (Equivalent Expr) [15🪙]", type: "balance", coinsAward: 15, icon: "🏕️", desc: "Combine identical camping logs to simplify expression weight scales." }
            ]
        },
        {
            id: 5, semester: 1, name: "Construction Canyon (Equations)", icon: "🏗️", cityName: "Construction Canyon",
            desc: "Warp to Construction Canyon! Help construction bots balance girders, resolve safety limits, and solve one-step structural equations.",
            topics: [
                { id: "5_1", name: "Girder Balancer (One-Step Equations) [10🪙]", type: "balance", coinsAward: 10, icon: "🏗️", desc: "Solve for variables on Construction Canyon's scaffolding scale balancing stage." },
                { id: "5_2", name: "Canyon Safety Bridge [12🪙]", type: "balance", coinsAward: 12, icon: "🌉", desc: "Build bridges safely matching structural load weights to inequality constraints (x > 5)." },
                { id: "5_3", name: "Miner Excavator (Variables) [15🪙]", type: "balance", coinsAward: 15, icon: "⚡", desc: "Compute dependent variable equations of ore loads inside Jacksonville asteroid mines." }
            ]
        },
        // Semester 2 (Galaxy 2 Space sectors)
        {
            id: 6, semester: 2, name: "Slo-Mo Valley (Ratios & Rates)", icon: "⏳", cityName: "Slo-Mo Valley",
            desc: "Slow down time in Slo-Mo Valley! Coordinate precise time ratios, projectile speeds, and unit scale rates.",
            topics: [
                { id: "6_1", name: "Slow-Mo Port (Understanding Ratios) [10🪙]", type: "baking", coinsAward: 10, icon: "⏳", desc: "Verify ratio portions of slow-time fluid and ship engine fuels." },
                { id: "6_2", name: "Boardwalk Taffy (Equivalent Rates) [12🪙]", type: "baking", coinsAward: 12, icon: "🍬", desc: "Scale space candy dessert recipes inside Seaside's recreation dome." },
                { id: "6_3", name: "Speed Sector Cooking [15🪙]", type: "baking", coinsAward: 15, icon: "🍳", desc: "Calculate ratio speeds of rapid firing solar pans relative to slow time." }
            ]
        },
        {
            id: 7, semester: 2, name: "Dumbo Beat (Area of Polygons)", icon: "🐘", cityName: "Dumbo Beat",
            desc: "Bounce along to the rhythm of Dumbo Beat! Compute areas of bouncy drum triangles, hexagons, and composite stages.",
            topics: [
                { id: "7_1", name: "Drum Base Area (Triangle Area) [10🪙]", type: "baking", coinsAward: 10, icon: "🥁", desc: "Calculate area of triangular sound panels: Area = 0.5 * base * height." },
                { id: "7_2", name: "Albany Beats (Decomposing Shapes) [12🪙]", type: "baking", coinsAward: 12, icon: "🎺", desc: "Decompose composite rhythmic speaker zones to find shape areas." },
                { id: "7_3", name: "Bio-Rhythm Arena (Composite Areas) [15🪙]", type: "baking", coinsAward: 15, icon: "🎵", desc: "Solve composite crop area layouts in local bio-rhythm hydroponic domes." }
            ]
        },
        {
            id: 8, semester: 2, name: "Djinn's Revenge (Surface Area & Volume)", icon: "🧞", cityName: "Djinn's Revenge",
            desc: "Confront the magical desert genie in Djinn's Revenge! Package 3D treasure containers and calculate surface areas.",
            topics: [
                { id: "8_1", name: "Genie Lamp Dock (Prism Volume) [10🪙]", type: "shooter", coinsAward: 10, icon: "🏺", desc: "Calculate genie lamp crate shipping volumes: V = l * w * h." },
                { id: "8_2", name: "Desert Net (3D Surface Area) [12🪙]", type: "shooter", coinsAward: 12, icon: "🏜️", desc: "Unfold 3D nets to compute exact treasure box surface areas." },
                { id: "8_3", name: "Oasis Outpost (Triangular Prisms) [15🪙]", type: "shooter", coinsAward: 15, icon: "🌴", desc: "Solve triangular prism water storage volumes on oasis shipping docks." }
            ]
        },
        {
            id: 9, semester: 2, name: "Safari Park (Statistics & Graphs)", icon: "🦁", cityName: "Safari Park",
            desc: "Go wild in Safari Park! Tally raw wildlife sensors, graph dot plots, and calculate mean animal counts.",
            topics: [
                { id: "9_1", name: "Lion Pride (Mean & Averages) [10🪙]", type: "balance", coinsAward: 10, icon: "🦁", desc: "Compute mean averages of wildlife census data in the safari domes." },
                { id: "9_2", name: "River Crossing (Median & Range) [12🪙]", type: "balance", coinsAward: 12, icon: "🐊", desc: "Track alligator river ranges and find median water level datasets." },
                { id: "9_3", name: "Safari Orchard (Dot Plots) [15🪙]", type: "balance", coinsAward: 15, icon: "🍌", desc: "Graph banana trees on visual safari orchard dot plots." }
            ]
        },
        {
            id: 10, semester: 2, name: "The Mothership (Coordinate Planes)", icon: "🛸", cityName: "The Mothership",
            desc: "Warp back to the Mothership! Coordinate all 4 quadrant launchpads on the grid to complete your journey.",
            topics: [
                { id: "10_1", name: "Mothership Grid (Four Quadrants) [10🪙]", type: "sea", coinsAward: 10, icon: "🛸", desc: "Plot navigational launch vectors using signs of x and y coordinates." },
                { id: "10_2", name: "Warp Locks (Grid Distance) [12🪙]", type: "sea", coinsAward: 12, icon: "🔒", desc: "Calculate exact coordinate distances between Mothership docking locks." },
                { id: "10_3", name: "Castle Triumph Gate (Victory) [15🪙]", type: "sea", coinsAward: 15, icon: "👑", desc: "Launch coordinate beacons to open the main Lock Gates of Triumph!" }
            ]
        }
    ];

    // Node Positions on Main Galaxy Space Map
    const unitPositions = {
        1: { x: 15, y: 35 },  // Planet Vulcanus
        2: { x: 32, y: 22 },  // Sector Decimallia
        3: { x: 48, y: 55 },  // Nebula Zero
        4: { x: 68, y: 32 },  // X-Orion Orbit
        5: { x: 85, y: 62 },  // Equator Station
        6: { x: 18, y: 75 },  // Planet Proportion
        7: { x: 38, y: 82 },  // Polygonia Flat
        8: { x: 55, y: 78 },  // Sector Volumia
        9: { x: 72, y: 82 },  // Nebula Statistica
        10: { x: 88, y: 15 }  // The Alpha Horizon
    };

    // Topic Positions in Zoomed Map (Programmatically scattered small towns)
    const topicPositions = [
        { x: 25, y: 60 }, // Small town A
        { x: 50, y: 35 }, // Small town B
        { x: 75, y: 65 }  // Small town C
    ];

    // -------------------------------------------------------------
    // STATE MANAGEMENT (PERSISTENT VIA LOCALSTORAGE)
    // -------------------------------------------------------------
    let state = {
        coins: 15,
        semester: 1,
        completedTopics: [],
        unlockedUnits: [1], // Unit 1 is unlocked initially
        pacingLock: true,
        pacingMaxUnit: 3, // Teacher progress locks after Unit 3 by default
        correctCount: 0, // Track overall solved questions for leaderboard
        mode3d: true // Default to true so they see the awesome 3D immediately!
    };

    function loadState() {
        const saved = localStorage.getItem('6th_grade_quest_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                state = { ...state, ...parsed };
                if (state.mode3d === undefined) {
                    state.mode3d = true;
                }
            } catch (e) {
                console.error("Error loading state: ", e);
            }
        }
    }

    function saveState() {
        localStorage.setItem('6th_grade_quest_state', JSON.stringify(state));
        updateStatsBar();
    }

    // -------------------------------------------------------------
    // DOM ELEMENTS
    // -------------------------------------------------------------
    const coinsDisplay = document.getElementById('coins-display');
    const sem1Btn = document.getElementById('sem1-btn');
    const sem2Btn = document.getElementById('sem2-btn');
    const pacingLockCheckbox = document.getElementById('pacing-lock');
    const pacingMaxUnitSelector = document.getElementById('pacing-max-unit');
    const teacherPacingHeader = document.getElementById('teacher-pacing-header');
    const mode3dToggle = document.getElementById('mode-3d-toggle');
    
    const mainMapContainer = document.getElementById('main-map');
    const zoomedMapContainer = document.getElementById('zoomed-map');
    const zoomedUnitTitle = document.getElementById('zoomed-unit-title');
    const backToMainBtn = document.getElementById('back-to-main-btn');
    
    const nodeGrid = document.getElementById('node-grid');
    const zoomedNodeGrid = document.getElementById('zoomed-node-grid');
    
    // Modal & Game Elements
    const gameModalOverlay = document.getElementById('game-modal-overlay');
    const modalGameTitle = document.getElementById('modal-game-title');
    const modalGameDesc = document.getElementById('modal-game-desc');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalContentArea = document.getElementById('modal-game-content-area');

    let currentActiveUnitId = null;
    let currentActiveTopic = null;

    // -------------------------------------------------------------
    // STATS & CONTROL BAR FUNCTIONS
    // -------------------------------------------------------------
    function updateStatsBar() {
        coinsDisplay.textContent = state.coins;
        sem1Btn.className = state.semester === 1 ? 'quest-btn quest-btn-primary' : 'quest-btn quest-btn-secondary';
        sem2Btn.className = state.semester === 2 ? 'quest-btn quest-btn-primary' : 'quest-btn quest-btn-secondary';
        pacingLockCheckbox.checked = state.pacingLock;
        pacingMaxUnitSelector.value = state.pacingMaxUnit;
        if (mode3dToggle) {
            mode3dToggle.checked = !!state.mode3d;
        }

        if (state.pacingLock) {
            teacherPacingHeader.classList.remove('hidden');
        } else {
            teacherPacingHeader.classList.add('hidden');
        }

        // Apply 3D Mode classes to the map containers
        const containers = document.querySelectorAll('.map-canvas-container');
        containers.forEach(container => {
            if (state.mode3d) {
                container.classList.add('mode-3d');
            } else {
                container.classList.remove('mode-3d');
                container.style.transform = ''; // reset interactive mouse tilt on disable
            }
        });
    }

    sem1Btn.addEventListener('click', () => {
        state.semester = 1;
        saveState();
        renderMainMap();
    });

    sem2Btn.addEventListener('click', () => {
        state.semester = 2;
        saveState();
        renderMainMap();
    });

    if (mode3dToggle) {
        mode3dToggle.addEventListener('change', () => {
            state.mode3d = mode3dToggle.checked;
            saveState();
            updateStatsBar();
            renderMainMap();
            if (currentActiveUnitId !== null) {
                renderZoomedMap(currentActiveUnitId);
            }
        });
    }

    pacingLockCheckbox.addEventListener('change', () => {
        state.pacingLock = pacingLockCheckbox.checked;
        saveState();
        renderMainMap();
        if (currentActiveUnitId !== null) {
            renderZoomedMap(currentActiveUnitId);
        }
    });

    pacingMaxUnitSelector.addEventListener('change', () => {
        state.pacingMaxUnit = parseInt(pacingMaxUnitSelector.value);
        saveState();
        renderMainMap();
        if (currentActiveUnitId !== null) {
            renderZoomedMap(currentActiveUnitId);
        }
    });

    backToMainBtn.addEventListener('click', () => {
        currentActiveUnitId = null;
        zoomedMapContainer.classList.add('hidden');
        mainMapContainer.classList.remove('hidden');
        renderMainMap();
    });

    modalCloseBtn.addEventListener('click', () => {
        // Stop any running animations
        stopSpaceShooterLoop();
        gameModalOverlay.classList.add('hidden');
    });

    // -------------------------------------------------------------
    // MAP RENDERING CORE
    // -------------------------------------------------------------
    function isUnitUnlocked(unitId) {
        // All units are unlocked from day one so students can work ahead!
        return true;
    }

    function isUnitCompleted(unitId) {
        const u = units.find(x => x.id === unitId);
        if (!u) return false;
        return u.topics.every(t => state.completedTopics.includes(t.id));
    }

    function renderMainMap() {
        nodeGrid.innerHTML = '';
        const semesterUnits = units.filter(x => x.semester === state.semester);
        
        // Dynamically build parallel positions array for the canvas drawing connections
        const currentPositions = semesterUnits.map(u => unitPositions[u.id]);

        semesterUnits.forEach((unit, idx) => {
            const pos = unitPositions[unit.id];
            const div = document.createElement('div');
            div.className = 'unit-node';
            
            // Add locking classes
            const unlocked = isUnitUnlocked(unit.id);
            const completed = isUnitCompleted(unit.id);
            
            if (completed) {
                div.classList.add('completed');
            } else if (unlocked) {
                div.classList.add('unlocked');
                if (state.pacingLock && unit.id === state.pacingMaxUnit) {
                    div.classList.add('active-unit');
                }
            } else {
                div.classList.add('locked');
            }
            
            div.style.left = `${pos.x}%`;
            div.style.top = `${pos.y}%`;
            
            // Assemble Inner Circle
            div.innerHTML = `
                <div class="unit-number">UNIT ${unit.id}</div>
                <div class="unit-circle">${unit.icon}</div>
                <div class="unit-name">${unit.cityName || unit.name}</div>
            `;
            
            // Click to zoom in
            div.addEventListener('click', () => {
                if (!unlocked) {
                    // Try to unlock with coins!
                    if (state.coins >= 15) {
                        const confirmUnlock = confirm(`Would you like to spend 15 coins to unlock Unit ${unit.id}: ${unit.name}?`);
                        if (confirmUnlock) {
                            state.coins -= 15;
                            state.unlockedUnits.push(unit.id);
                            playSound('unlock');
                            saveState();
                            renderMainMap();
                        }
                    } else {
                        alert(`This Unit is currently locked. Earn ${15 - state.coins} more coins or check with your teacher to unlock!`);
                        playSound('fail');
                    }
                    return;
                }
                
                playSound('coin');
                renderZoomedMap(unit.id);
            });
            
            nodeGrid.appendChild(div);
        });

        // Draw connections on Main Map
        drawMapBackgroundCanvas('main-canvas', semesterUnits, currentPositions, isUnitUnlocked, isUnitCompleted);
    }

    function renderZoomedMap(unitId) {
        currentActiveUnitId = unitId;
        zoomedNodeGrid.innerHTML = '';
        
        const unit = units.find(x => x.id === unitId);
        zoomedUnitTitle.textContent = `Unit ${unit.id}: ${unit.name} Quest`;
        
        mainMapContainer.classList.add('hidden');
        zoomedMapContainer.classList.remove('hidden');
        
        unit.topics.forEach((topic, idx) => {
            const pos = topicPositions[idx];
            const div = document.createElement('div');
            div.className = 'topic-node';
            
            // Topic is completed or locked - All topics/things are unlocked!
            const isCompleted = state.completedTopics.includes(topic.id);
            const isUnlocked = true;
            
            if (isCompleted) {
                div.classList.add('completed');
            } else {
                div.classList.add('unlocked');
            }
            
            div.style.left = `${pos.x}%`;
            div.style.top = `${pos.y}%`;
            
            div.innerHTML = `
                <div class="unit-number">TOPIC 1.${idx + 1}</div>
                <div class="topic-circle">${topic.icon || '🎯'}</div>
                <div class="topic-title">${topic.name}</div>
            `;
            
            div.addEventListener('click', () => {
                playSound('coin');
                launchGameModal(topic);
            });
            
            zoomedNodeGrid.appendChild(div);
        });

        // Draw connections on Zoomed Map
        drawMapBackgroundCanvas('zoomed-canvas', unit.topics, topicPositions, (tId, idx) => {
            return true;
        }, (tId) => state.completedTopics.includes(tId));
    }

    function drawMapBackgroundCanvas(canvasId, items, positions, unlockedCheck, completedCheck) {
        const canv = document.getElementById(canvasId);
        const cCtx = canv.getContext('2d');
        const parent = canv.parentElement;
        canv.width = parent.clientWidth;
        canv.height = parent.clientHeight;
        
        cCtx.clearRect(0, 0, canv.width, canv.height);

        const w = canv.width;
        const h = canv.height;

        if (canvasId === 'main-canvas') {
            // -------------------------------------------------------------
            // DRAW SPECTACULAR GALAXY NEBULA (ASTRO BOT STYLE!)
            // -------------------------------------------------------------
            // Deep space sky
            cCtx.fillStyle = '#020617'; 
            cCtx.fillRect(0, 0, w, h);

            // Draw glowing colorful nebula gas clouds
            const neb1 = cCtx.createRadialGradient(w * 0.25, h * 0.35, 20, w * 0.25, h * 0.35, w * 0.45);
            neb1.addColorStop(0, 'rgba(79, 70, 229, 0.28)'); // Indigo nebula glow
            neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
            cCtx.fillStyle = neb1;
            cCtx.fillRect(0, 0, w, h);

            const neb2 = cCtx.createRadialGradient(w * 0.72, h * 0.65, 40, w * 0.72, h * 0.65, w * 0.38);
            neb2.addColorStop(0, 'rgba(6, 182, 212, 0.22)'); // Cyan gas cloud
            neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
            cCtx.fillStyle = neb2;
            cCtx.fillRect(0, 0, w, h);

            const neb3 = cCtx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.5);
            neb3.addColorStop(0, 'rgba(236, 72, 153, 0.12)'); // Soft Pink space dust
            neb3.addColorStop(1, 'rgba(0, 0, 0, 0)');
            cCtx.fillStyle = neb3;
            cCtx.fillRect(0, 0, w, h);

            // Draw hundreds of shining tiny background stars
            cCtx.fillStyle = '#ffffff';
            for (let i = 0; i < 80; i++) {
                const sx = (Math.sin(i * 123.45) * 0.5 + 0.5) * w;
                const sy = (Math.cos(i * 543.21) * 0.5 + 0.5) * h;
                const size = (i % 3 === 0) ? 1.5 : 0.8;
                const alpha = 0.35 + 0.65 * Math.sin((state.coins * 0.1) + i); // soft twinkle
                cCtx.save();
                cCtx.globalAlpha = Math.abs(alpha);
                cCtx.fillRect(sx, sy, size, size);
                cCtx.restore();
            }

            // Draw orbiting cosmic rings under the unit nodes
            cCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            cCtx.lineWidth = 1;
            cCtx.beginPath();
            cCtx.arc(w/2, h/2, w * 0.35, 0, 2 * Math.PI);
            cCtx.stroke();

            cCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
            cCtx.beginPath();
            cCtx.arc(w/2, h/2, w * 0.2, 0, 2 * Math.PI);
            cCtx.stroke();

            // Draw a cute Astro Bot steering wheel mothership dashboard outline on corners
            cCtx.strokeStyle = 'rgba(99, 102, 241, 0.18)';
            cCtx.lineWidth = 3;
            cCtx.strokeRect(10, 10, w - 20, h - 20);

            // 8. Astro Map Legend Box (Top Left Corner)
            cCtx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            cCtx.strokeStyle = '#6366f1';
            cCtx.lineWidth = 2;
            cCtx.fillRect(15, 15, w * 0.22, h * 0.28);
            cCtx.strokeRect(15, 15, w * 0.22, h * 0.28);

            cCtx.fillStyle = '#22d3ee';
            cCtx.font = 'bold 12px "MedievalSharp", cursive';
            cCtx.textAlign = 'left';
            cCtx.fillText('GALAXY ASTRO', 22, 32);

            cCtx.font = '8px monospace';
            cCtx.fillStyle = '#818cf8';
            cCtx.fillText('6th Grade Cosmic Quest', 22, 44);
            cCtx.fillStyle = '#94a3b8';
            cCtx.fillText('• 10 Solar Systems', 22, 58);
            cCtx.fillText('• Rescue Lost Bots', 22, 72);
            cCtx.fillText('• Play Math Mini-Games', 22, 86);
            cCtx.fillText('• Complete to Earn Coins', 22, 100);

            // 9. Map Scale Bar (Bottom Right Corner)
            const sx = w * 0.72;
            const sy = h * 0.9;
            cCtx.strokeStyle = '#6366f1';
            cCtx.lineWidth = 2.5;
            cCtx.beginPath();
            cCtx.moveTo(sx, sy);
            cCtx.lineTo(sx + 80, sy);
            cCtx.moveTo(sx, sy - 4);
            cCtx.lineTo(sx, sy + 4);
            cCtx.moveTo(sx + 40, sy - 4);
            cCtx.lineTo(sx + 40, sy + 4);
            cCtx.moveTo(sx + 80, sy - 4);
            cCtx.lineTo(sx + 80, sy + 4);
            cCtx.stroke();

            cCtx.fillStyle = '#22d3ee';
            cCtx.font = '7px monospace';
            cCtx.textAlign = 'center';
            cCtx.fillText('0 ly', sx, sy - 8);
            cCtx.fillText('500 ly', sx + 40, sy - 8);
            cCtx.fillText('1000 ly', sx + 80, sy - 8);
        } else {
            // Zoomed sub-map background (looks like a galaxy detailed planet blueprint)
            cCtx.fillStyle = '#030712'; // Black Hole Void
            cCtx.fillRect(0, 0, w, h);

            // Tech blueprint grid lines
            cCtx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
            cCtx.lineWidth = 1;
            for (let x = 0; x < w; x += 30) {
                cCtx.beginPath();
                cCtx.moveTo(x, 0);
                cCtx.lineTo(x, h);
                cCtx.stroke();
            }
            for (let y = 0; y < h; y += 30) {
                cCtx.beginPath();
                cCtx.moveTo(0, y);
                cCtx.lineTo(w, y);
                cCtx.stroke();
            }

            // Draw a high-tech scanning scanline overlay
            cCtx.fillStyle = 'rgba(6, 182, 212, 0.03)';
            cCtx.fillRect(0, 0, w, h);
        }
        
        // Draw curvy roads/connections
        cCtx.setLineDash([5, 5]);
        for (let i = 0; i < items.length - 1; i++) {
            const start = positions[i];
            const end = positions[i + 1];
            
            const x1 = start.x / 100 * canv.width;
            const y1 = start.y / 100 * canv.height;
            const x2 = end.x / 100 * canv.width;
            const y2 = end.y / 100 * canv.height;
            
            // Curve mid point
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2 + 30; // dip downward for curves
            
            // Styles
            const activeId = items[i + 1].id || items[i + 1];
            const nextUnlocked = unlockedCheck(activeId, i + 1);
            const startCompleted = completedCheck(items[i].id || items[i]);
            
            if (startCompleted && nextUnlocked) {
                cCtx.strokeStyle = '#10b981'; // Green road
                cCtx.lineWidth = 4;
            } else if (nextUnlocked) {
                cCtx.strokeStyle = '#fbbf24'; // Yellow active road
                cCtx.lineWidth = 3;
            } else {
                cCtx.strokeStyle = '#475569'; // Grey locked road
                cCtx.lineWidth = 2;
            }
            
            cCtx.beginPath();
            cCtx.moveTo(x1, y1);
            cCtx.quadraticCurveTo(mx, my, x2, y2);
            cCtx.stroke();
        }
        cCtx.setLineDash([]);
    }

    // -------------------------------------------------------------
    // MODAL GAME LAUNCHER
    // -------------------------------------------------------------
    function launchGameModal(topic) {
        currentActiveTopic = topic;
        modalGameTitle.textContent = topic.name;
        modalGameDesc.textContent = topic.desc;
        modalContentArea.innerHTML = '';
        gameModalOverlay.classList.remove('hidden');

        // Mount different game engines depending on topic game type
        if (topic.type === 'baking') {
            mountBakingGame();
        } else if (topic.type === 'shooter') {
            mountSpaceShooterGame();
        } else if (topic.type === 'sea') {
            mountDeepSeaMinerGame();
        } else if (topic.type === 'balance') {
            mountBalanceScaleGame();
        } else {
            // Fallback: interactive lesson card
            mountSimpleArithmeticQuiz();
        }
    }

    function completeTopic() {
        // Increment completed questions counter for leaderboard
        state.correctCount = (state.correctCount || 0) + 1;

        if (!state.completedTopics.includes(currentActiveTopic.id)) {
            state.completedTopics.push(currentActiveTopic.id);
            // Dynamic coin award from topic configuration (default to 10 if not set)
            const coinsAward = currentActiveTopic.coinsAward || 10;
            state.coins += coinsAward;
            playSound('success');
        } else {
            // Replaying an already completed topic earns small 2 coin bonus and increments correctCount
            state.coins += 2;
            playSound('success');
        }
        
        saveState();
        renderLeaderboard();
        
        setTimeout(() => {
            gameModalOverlay.classList.add('hidden');
            if (currentActiveUnitId !== null) {
                renderZoomedMap(currentActiveUnitId);
            }
        }, 1200);
    }

    // -------------------------------------------------------------
    // GAME MODULE 1: RATIO BAKING GAME (WITH INGREDIENT SEQUENCE GAMEPLAY PRELUDE!)
    // -------------------------------------------------------------
    function mountBakingGame() {
        const recipeList = [
            { name: "Giant Chocolate Chip Cookies", ratioText: "2 cups sugar : 5 cups flour", baseVal: 2, scaleVal: 5, targetMultiplier: 3, unit: "cups sugar", label: "sugar to 15 cups flour", order: ["Sugar 🍬", "Flour 🌾", "Chips 🍫"] },
            { name: "Blueberry Scones", ratioText: "1 cup sugar : 4 cups cream", baseVal: 1, scaleVal: 4, targetMultiplier: 5, unit: "cups sugar", label: "sugar to 20 cups cream", order: ["Sugar 🍬", "Cream 🥛", "Blueberries 🫐"] },
            { name: "Grand Grandma Bread", ratioText: "3 cups flour : 1 cup water", baseVal: 3, scaleVal: 1, targetMultiplier: 4, unit: "cups flour", label: "flour to 4 cups water", order: ["Flour 🌾", "Yeast 🦠", "Water 💧"] }
        ];

        const rIdx = Math.floor(Math.random() * recipeList.length);
        const recipe = recipeList[rIdx];
        const correctAnswer = recipe.baseVal * recipe.targetMultiplier;

        // Sequence stage setup
        let currentSequenceIndex = 0;

        modalContentArea.innerHTML = `
            <div class="baking-kitchen rounded-lg flex flex-col justify-between p-4 h-full w-full max-w-md mx-auto">
                <div class="text-slate-800 text-center bg-white/90 p-2.5 rounded-lg border border-orange-200">
                    <h4 class="font-bold text-orange-950 text-sm">Recipe: ${recipe.name}</h4>
                    <p class="text-xs font-semibold text-orange-800 font-mono mt-0.5">Base Ratio: ${recipe.ratioText}</p>
                </div>

                <!-- Stage 1: Click Ingredients in Order -->
                <div id="baking-stage-sequence" class="my-auto py-4 text-center text-slate-800 space-y-4">
                    <p class="text-xs font-bold uppercase tracking-wider text-orange-900">Step 1: Prepare the Kitchen!</p>
                    <p class="text-sm font-semibold">Click the raw ingredients in the correct order to mix them in the bowl:</p>
                    <p class="text-xs font-black text-indigo-900 bg-white/60 py-1.5 px-3 rounded inline-block font-mono">
                        Target Order: ${recipe.order.join(" → ")}
                    </p>

                    <div class="flex justify-center gap-3 mt-4">
                        ${recipe.order.map((ing, i) => `
                            <button type="button" class="ingredient-btn bg-white hover:bg-orange-100 border-2 border-orange-300 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs transition duration-200" data-ing="${ing}">
                                ${ing}
                            </button>
                        `).join("")}
                    </div>
                    <p id="sequence-feedback" class="text-xs font-bold text-orange-900 h-4"></p>
                </div>

                <!-- Stage 2: Solve Ratio Math (Hidden initially) -->
                <div id="baking-stage-math" class="my-auto py-4 text-center text-slate-800 space-y-4 hidden">
                    <p class="text-xs font-bold uppercase tracking-wider text-emerald-800">Step 2: Balance the Proportions!</p>
                    <p class="text-base font-extrabold text-orange-900">
                        How many ${recipe.unit} do you need to add for ${recipe.scaleVal * recipe.targetMultiplier} cups?
                    </p>
                    
                    <div class="number-spinner">
                        <button type="button" id="bake-dec" class="quest-btn quest-btn-secondary">-</button>
                        <input type="number" id="bake-input" value="0" class="w-20 bg-white border-2 border-orange-300 text-slate-800 text-center font-bold rounded py-1 text-lg">
                        <button type="button" id="bake-inc" class="quest-btn quest-btn-secondary">+</button>
                    </div>
                </div>

                <div class="flex flex-col items-center gap-2">
                    <div id="cooking-bowl" class="ingredient-bowl transition-all duration-300"></div>
                    <button type="button" id="bake-submit-btn" class="quest-btn quest-btn-primary w-full max-w-xs mt-2 hidden">Bake &amp; Verify!</button>
                    <p id="bake-feedback" class="text-center font-bold text-xs mt-1 text-orange-900"></p>
                </div>
            </div>
        `;

        const seqStage = document.getElementById('baking-stage-sequence');
        const mathStage = document.getElementById('baking-stage-math');
        const bowl = document.getElementById('cooking-bowl');
        const seqFeedback = document.getElementById('sequence-feedback');
        const bakeSubmitBtn = document.getElementById('bake-submit-btn');

        const ingBtns = modalContentArea.querySelectorAll('.ingredient-btn');
        ingBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const clickedName = btn.getAttribute('data-ing');
                const targetName = recipe.order[currentSequenceIndex];

                if (clickedName === targetName) {
                    btn.classList.add('bg-emerald-100', 'border-emerald-500', 'text-emerald-950');
                    btn.disabled = true;
                    currentSequenceIndex++;
                    playSound('coin');
                    
                    // Stir bowl
                    bowl.style.transform = 'scale(1.1) rotate(15deg)';
                    setTimeout(() => { bowl.style.transform = 'none'; }, 250);

                    if (currentSequenceIndex === recipe.order.length) {
                        seqFeedback.textContent = "All ingredients added to the mixer! Baking oven preheated.";
                        seqFeedback.className = "text-xs font-bold text-emerald-800";
                        setTimeout(() => {
                            seqStage.classList.add('hidden');
                            mathStage.classList.remove('hidden');
                            bakeSubmitBtn.classList.remove('hidden');
                        }, 800);
                    }
                } else {
                    seqFeedback.textContent = "Oops! That's not the next ingredient in the instructions sequence. Try again!";
                    seqFeedback.className = "text-xs font-bold text-rose-700 animate-pulse";
                    playSound('fail');
                    // Reset clicks
                    currentSequenceIndex = 0;
                    ingBtns.forEach(b => {
                        b.classList.remove('bg-emerald-100', 'border-emerald-500', 'text-emerald-950');
                        b.disabled = false;
                    });
                }
            });
        });

        const bakeInput = document.getElementById('bake-input');
        const bakeFeedback = document.getElementById('bake-feedback');
        
        document.getElementById('bake-dec').addEventListener('click', () => {
            const val = Math.max(0, parseInt(bakeInput.value) - 1);
            bakeInput.value = val;
        });

        document.getElementById('bake-inc').addEventListener('click', () => {
            const val = parseInt(bakeInput.value) + 1;
            bakeInput.value = val;
        });

        document.getElementById('bake-submit-btn').addEventListener('click', () => {
            const ans = parseInt(bakeInput.value);
            if (ans === correctAnswer) {
                bakeFeedback.textContent = "Perfect ratio proportions! Deliciously baked! 🎂 +10 coins!";
                bakeFeedback.className = "text-center font-bold text-xs mt-1 text-emerald-800";
                playSound('coin');
                completeTopic();
            } else {
                bakeFeedback.textContent = "Oops, wrong recipe proportions! The dough collapses. Try again!";
                bakeFeedback.className = "text-center font-bold text-xs mt-1 text-rose-800";
                playSound('fail');
            }
        });
    }

    // -------------------------------------------------------------
    // GAME MODULE 2: GALAGA-STYLE SPACE SHOOTER
    // -------------------------------------------------------------
    let shooterAnimId = null;
    function mountSpaceShooterGame() {
        modalContentArea.innerHTML = `
            <div class="game-screen">
                <canvas id="shooter-canvas" class="shooter-canvas"></canvas>
                
                <!-- Live Quiz overlay inside the Canvas game -->
                <div id="shooter-quiz" class="absolute inset-0 bg-slate-950/95 flex flex-col justify-between p-6 hidden border-2 border-indigo-500 rounded-lg">
                    <div class="text-center">
                        <span class="bg-indigo-900 border border-indigo-700 px-3 py-1 rounded text-xs font-bold text-indigo-200">SPACE COMBAT MATH WAVE</span>
                    </div>
                    <div class="my-auto text-center space-y-4">
                        <p class="text-lg font-bold text-slate-100">Solve this division fraction to charge your shields!</p>
                        <p id="shooter-q-text" class="text-2xl font-black text-rose-400 font-mono"></p>
                        <input type="text" id="shooter-input" placeholder="Your answer..." class="bg-slate-900 border-2 border-indigo-500 text-white font-bold rounded py-1 px-4 text-center text-lg max-w-xs focus:outline-none focus:border-cyan-500">
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <button type="button" id="shooter-submit" class="quest-btn quest-btn-primary w-full max-w-xs">Fire Reciprocal Lasers!</button>
                        <p id="shooter-feedback" class="text-xs font-bold text-center"></p>
                    </div>
                </div>

                <!-- HUD overlays -->
                <div class="absolute top-2 left-3 text-[10px] font-mono font-bold text-indigo-300 flex flex-col gap-0.5">
                    <span>LIVES: <span id="shooter-lives">3</span></span>
                    <span>WAVE SCORE: <span id="shooter-score">0/3</span></span>
                    <span class="text-amber-400 font-black">UPGRADE LEVEL: <span id="shooter-upgrade">1 (Basic Laser)</span></span>
                </div>
                <div class="absolute bottom-2 inset-x-0 text-center text-[10px] text-slate-500 font-mono pointer-events-none">
                    Use Mouse/Touch to drag Ship left/right! Clicking fires lasers!
                </div>
            </div>
        `;

        const sCanv = document.getElementById('shooter-canvas');
        const sCtx = sCanv.getContext('2d');
        const shooterQuiz = document.getElementById('shooter-quiz');
        const sQText = document.getElementById('shooter-q-text');
        const sInput = document.getElementById('shooter-input');
        const sSubmit = document.getElementById('shooter-submit');
        const sFeedback = document.getElementById('shooter-feedback');

        const livesVal = document.getElementById('shooter-lives');
        const scoreVal = document.getElementById('shooter-score');

        const parent = sCanv.parentElement;
        sCanv.width = parent.clientWidth;
        sCanv.height = parent.clientHeight;

        // Space Game Variables
        let shipX = sCanv.width / 2;
        let score = 0;
        let lives = 3;
        let laserState = [];
        let rockState = [];
        let stars = [];
        let isPausedForQuiz = false;
        let activeRock = null;
        let laserUpgradeLevel = 1; // Double lasers upgrade level!

        // Seed stars
        for (let i = 0; i < 40; i++) {
            stars.push({ x: Math.random() * sCanv.width, y: Math.random() * sCanv.height, size: Math.random() * 2, speed: Math.random() * 1.5 + 0.5 });
        }

        // Spawn rocks
        function spawnRock() {
            if (isPausedForQuiz) return;
            rockState.push({
                x: 30 + Math.random() * (sCanv.width - 60),
                y: -30,
                size: 20 + Math.random() * 10,
                speed: 1.5 + Math.random() * 1,
                symbol: ['1/2 ÷ 1/4', '3/4 ÷ 1/3', '2.5 × 4', '1.2 × 0.4', '18 ÷ 3'][Math.floor(Math.random() * 5)]
            });
        }

        let spawnTimer = setInterval(spawnRock, 2200);

        // Click to shoot
        sCanv.addEventListener('click', () => {
            if (isPausedForQuiz) return;
            if (laserUpgradeLevel === 1) {
                laserState.push({ x: shipX, y: sCanv.height - 40, speed: 7 });
            } else if (laserUpgradeLevel === 2) {
                // Double lasers!
                laserState.push({ x: shipX - 8, y: sCanv.height - 40, speed: 8 });
                laserState.push({ x: shipX + 8, y: sCanv.height - 40, speed: 8 });
            } else {
                // Triple plasma lasers!
                laserState.push({ x: shipX - 12, y: sCanv.height - 40, speed: 9 });
                laserState.push({ x: shipX, y: sCanv.height - 46, speed: 9.5 });
                laserState.push({ x: shipX + 12, y: sCanv.height - 40, speed: 9 });
            }
            playSound('laser');
        });

        // Mouse move tracking
        sCanv.addEventListener('mousemove', (e) => {
            const rect = sCanv.getBoundingClientRect();
            shipX = e.clientX - rect.left;
            if (shipX < 20) shipX = 20;
            if (shipX > sCanv.width - 20) shipX = sCanv.width - 20;
        });

        // Loop
        function drawSpaceShooter() {
            sCtx.fillStyle = '#020617';
            sCtx.fillRect(0, 0, sCanv.width, sCanv.height);

            // Draw Stars
            sCtx.fillStyle = '#ffffff';
            stars.forEach(star => {
                sCtx.fillRect(star.x, star.y, star.size, star.size);
                if (!isPausedForQuiz) {
                    star.y += star.speed;
                    if (star.y > sCanv.height) star.y = 0;
                }
            });

            // Draw lasers
            sCtx.fillStyle = '#22d3ee';
            for (let i = laserState.length - 1; i >= 0; i--) {
                const l = laserState[i];
                sCtx.fillRect(l.x - 2, l.y, 4, 10);
                if (!isPausedForQuiz) {
                    l.y -= l.speed;
                    if (l.y < 0) laserState.splice(i, 1);
                }
            }

            // Draw rocks
            for (let i = rockState.length - 1; i >= 0; i--) {
                const r = rockState[i];
                sCtx.save();
                sCtx.translate(r.x, r.y);
                
                // Draw Rock Polygon
                sCtx.fillStyle = '#475569';
                sCtx.strokeStyle = '#64748b';
                sCtx.lineWidth = 2;
                sCtx.beginPath();
                sCtx.arc(0, 0, r.size, 0, 2 * Math.PI);
                sCtx.fill();
                sCtx.stroke();

                // Draw Text
                sCtx.fillStyle = '#fff';
                sCtx.font = '9px monospace';
                sCtx.textAlign = 'center';
                sCtx.fillText(r.symbol, 0, 3);
                sCtx.restore();

                if (!isPausedForQuiz) {
                    r.y += r.speed;
                    if (r.y > sCanv.height + 30) {
                        rockState.splice(i, 1);
                        lives--;
                        livesVal.textContent = lives;
                        playSound('fail');
                        if (lives <= 0) {
                            alert("Spaceship critical hit! Systems resetting...");
                            lives = 3;
                            score = 0;
                            livesVal.textContent = lives;
                            scoreVal.textContent = `${score}/3`;
                        }
                    }
                }

                // Laser Collisions
                for (let j = laserState.length - 1; j >= 0; j--) {
                    const l = laserState[j];
                    const dist = Math.hypot(l.x - r.x, l.y - r.y);
                    if (dist < r.size) {
                        // HIT! Pause game for custom quick math quiz
                        laserState.splice(j, 1);
                        activeRock = r;
                        rockState.splice(i, 1);
                        isPausedForQuiz = true;
                        triggerSpaceQuiz(r.symbol);
                        break;
                    }
                }
            }

            // Draw Starship
            sCtx.fillStyle = '#6366f1';
            sCtx.beginPath();
            sCtx.moveTo(shipX, sCanv.height - 40);
            sCtx.lineTo(shipX - 15, sCanv.height - 15);
            sCtx.lineTo(shipX + 15, sCanv.height - 15);
            cCtx = null; // Unused variable removal
            sCtx.closePath();
            sCtx.fill();

            // Cockpit glass
            sCtx.fillStyle = '#22d3ee';
            sCtx.beginPath();
            sCtx.arc(shipX, sCanv.height - 25, 4, 0, 2 * Math.PI);
            sCtx.fill();

            shooterAnimId = requestAnimationFrame(drawSpaceShooter);
        }

        function solveSymbolicMath(expr) {
            let expression = expr.replace(/÷/g, '/').replace(/×/g, '*').replace(/x/g, '*');
            
            // Handle fractions division "1/2 / 1/4" -> (1/2) / (1/4)
            if (expression.includes('/') && (expression.match(/\//g) || []).length > 1) {
                const parts = expression.split('/');
                if (parts.length === 4) {
                    const a = parseFloat(parts[0]);
                    const b = parseFloat(parts[1]);
                    const c = parseFloat(parts[2]);
                    const d = parseFloat(parts[3]);
                    return (a / b) / (c / d);
                }
            }
            
            try {
                const cleanExpr = expression.replace(/[^0-9+\-*/().\s]/g, '');
                return Function('"use strict"; return (' + cleanExpr + ')')();
            } catch (e) {
                console.error("Math resolution error: ", e);
                return null;
            }
        }

        function triggerSpaceQuiz(symbol) {
            const correctVal = solveSymbolicMath(symbol);

            sQText.textContent = `${symbol} = ?`;
            sInput.value = '';
            sFeedback.textContent = '';
            shooterQuiz.classList.remove('hidden');
            sInput.focus();

            // Submission logic
            sSubmit.onclick = () => {
                const rawAns = sInput.value.trim();
                const uAns = parseFloat(rawAns);
                
                if (!isNaN(uAns) && correctVal !== null && Math.abs(uAns - correctVal) < 1e-9) {
                    playSound('explosion');
                    score++;
                    scoreVal.textContent = `${score}/3`;
                    
                    // Award active laser weapon upgrades!
                    laserUpgradeLevel++;
                    const upgradeLabel = document.getElementById('shooter-upgrade');
                    if (upgradeLabel) {
                        if (laserUpgradeLevel === 2) {
                            upgradeLabel.textContent = "2 (Double Lasers Active! 🔥)";
                            upgradeLabel.className = "text-cyan-400 font-black";
                        } else if (laserUpgradeLevel >= 3) {
                            upgradeLabel.textContent = "3 (💥 TRIPLE PLASMA OVERDRIVE 💥)";
                            upgradeLabel.className = "text-rose-400 font-extrabold animate-pulse";
                        }
                    }
                    
                    isPausedForQuiz = false;
                    shooterQuiz.classList.add('hidden');
                    
                    if (score >= 3) {
                        alert("Shields charged! Solar sector cleared! +10 coins!");
                        clearInterval(spawnTimer);
                        completeTopic();
                    }
                } else {
                    sFeedback.textContent = "Warning: Calculation failed. Lasers charging down! Try again.";
                    sFeedback.className = "text-xs font-bold text-center text-rose-500 animate-pulse";
                    playSound('fail');
                }
            };
        }

        drawSpaceShooter();
    }

    function stopSpaceShooterLoop() {
        if (shooterAnimId) {
            cancelAnimationFrame(shooterAnimId);
            shooterAnimId = null;
        }
    }

    // -------------------------------------------------------------
    // GAME MODULE 3: DEEP SEA COORDINATE/ABSOLUTE VALUE MINER
    // -------------------------------------------------------------
    function mountDeepSeaMinerGame() {
        const depths = [-10, -25, -45, -60];
        const randomTarget = depths[Math.floor(Math.random() * depths.length)];
        const absValCorrect = Math.abs(randomTarget);

        modalContentArea.innerHTML = `
            <div class="sea-floor rounded-lg">
                <!-- Grid Scale marking depths -->
                <div class="absolute right-4 top-0 bottom-0 w-8 border-l border-white/20 flex flex-col justify-between py-4 text-[9px] font-mono text-cyan-200">
                    <span>0m</span>
                    <span>-10m</span>
                    <span>-25m</span>
                    <span>-45m</span>
                    <span>-60m</span>
                </div>

                <!-- Submarine -->
                <div id="submarine" class="sub-submarine" style="left: 15%; top: 10%;">
                    <div class="sub-propeller"></div>
                    🛶
                </div>

                <!-- Crystal Target -->
                <div class="absolute" style="right: 35%; top: ${Math.abs(randomTarget) * 1.3 + 12}%;">
                    <span class="text-3xl animate-pulse">💎</span>
                </div>

                <div class="absolute bottom-4 left-4 right-16 bg-slate-900/90 p-4 border border-cyan-500 rounded-xl space-y-3">
                    <p class="text-xs text-cyan-400 font-bold uppercase tracking-wider">Submarine Mission Command</p>
                    <p class="text-[11px] text-white">
                        Collect the rare crystal at depth <strong class="text-cyan-300 font-mono">${randomTarget}m</strong>! 
                        Enter the **absolute value** of this depth to calibrate buoyancy rockets:
                    </p>
                    <div class="flex gap-2">
                        <input type="number" id="sub-input" placeholder="Buoyancy value..." class="w-full bg-slate-950 border border-cyan-400 text-cyan-300 rounded p-1.5 font-mono text-xs focus:outline-none">
                        <button type="button" id="sub-submit" class="quest-btn quest-btn-primary py-1 text-xs">Dive!</button>
                    </div>
                    <p id="sub-feedback" class="text-[10px] font-bold text-center"></p>
                </div>
            </div>
        `;

        const sub = document.getElementById('submarine');
        const subInput = document.getElementById('sub-input');
        const subSubmit = document.getElementById('sub-submit');
        const subFeedback = document.getElementById('sub-feedback');

        subSubmit.addEventListener('click', () => {
            const val = parseInt(subInput.value);
            if (val === absValCorrect) {
                subFeedback.textContent = "Absolute depth calculated correctly! Calibrating buoyancy tanks...";
                subFeedback.className = "text-[10px] font-bold text-center text-emerald-400";
                playSound('coin');

                // Animate submarine descent down to the crystal!
                sub.style.top = `${val * 1.3 + 12}%`;
                sub.style.left = '52%';

                setTimeout(() => {
                    alert("Buoyancy matched! Crystal safely harvested. Returning to carrier deck. +10 coins!");
                    completeTopic();
                }, 1800);
            } else {
                subFeedback.textContent = "Error: Invalid depth distance calculation! Try again.";
                subFeedback.className = "text-[10px] font-bold text-center text-rose-400 animate-bounce";
                playSound('fail');
            }
        });
    }

    // -------------------------------------------------------------
    // GAME MODULE 4: ALGEBRAIC EQUATION BALANCE SCALE
    // -------------------------------------------------------------
    function mountBalanceScaleGame() {
        const equations = [
            { text: "x + 6 = 15", targetX: 9 },
            { text: "x - 4 = 11", targetX: 15 },
            { text: "3x = 18", targetX: 6 },
            { text: "x / 2 = 7", targetX: 14 }
        ];

        const eq = equations[Math.floor(Math.random() * equations.length)];

        modalContentArea.innerHTML = `
            <div class="balance-container rounded-lg">
                <div class="text-center bg-slate-800 text-white p-2.5 rounded border border-slate-700">
                    <h4 class="font-bold text-slate-100 text-sm">Algebra Balance Laboratory</h4>
                    <p class="text-xs font-semibold text-emerald-400 font-mono mt-0.5">Scale Balance: ${eq.text}</p>
                </div>

                <!-- Balance Scale Graphic -->
                <div class="my-auto py-12 relative flex justify-center">
                    <div class="balance-stand">
                        <div class="balance-base"></div>
                        <div id="scale-beam" class="balance-beam">
                            <!-- Left Plate -->
                            <div class="balance-string balance-string-l1"></div>
                            <div class="balance-string balance-string-l2"></div>
                            <div class="balance-pan balance-pan-left flex items-center justify-center font-bold text-xs text-indigo-950 font-mono">
                                x
                            </div>

                            <!-- Right Plate -->
                            <div class="balance-string balance-string-l1" style="left:auto; right: 4px;"></div>
                            <div class="balance-string balance-string-l2" style="left:auto; right: auto; left: 4px;"></div>
                            <div class="balance-pan balance-pan-right flex items-center justify-center font-bold text-xs text-orange-950 font-mono">
                                ⚖️
                            </div>
                        </div>
                    </div>
                </div>

                <div class="text-center text-slate-800 space-y-2">
                    <p class="text-xs font-bold">Solve for variable <span class="font-mono text-indigo-700 text-sm">x</span> to level the scales perfectly:</p>
                    <div class="number-spinner">
                        <button type="button" id="scale-dec" class="quest-btn quest-btn-secondary">-</button>
                        <input type="number" id="scale-input" value="0" class="w-20 bg-white border-2 border-indigo-300 text-slate-800 text-center font-bold rounded py-1 text-lg">
                        <button type="button" id="scale-inc" class="quest-btn quest-btn-secondary">+</button>
                    </div>
                    <button type="button" id="scale-submit" class="quest-btn quest-btn-primary w-full max-w-xs">Verify Equivalence!</button>
                    <p id="scale-feedback" class="text-[11px] font-bold"></p>
                </div>
            </div>
        `;

        const scaleBeam = document.getElementById('scale-beam');
        const scaleInput = document.getElementById('scale-input');
        const scaleSubmit = document.getElementById('scale-submit');
        const scaleFeedback = document.getElementById('scale-feedback');

        document.getElementById('scale-dec').addEventListener('click', () => {
            const val = Math.max(0, parseInt(scaleInput.value) - 1);
            scaleInput.value = val;
            updateScaleAngle(val);
        });

        document.getElementById('scale-inc').addEventListener('click', () => {
            const val = parseInt(scaleInput.value) + 1;
            scaleInput.value = val;
            updateScaleAngle(val);
        });

        function updateScaleAngle(currentVal) {
            const diff = currentVal - eq.targetX;
            // Map the difference to an angle between -20 and 20 degrees
            const deg = Math.min(20, Math.max(-20, diff * 3));
            scaleBeam.style.transform = `rotate(${deg}deg)`;
        }

        // Initialize tilt
        updateScaleAngle(0);

        scaleSubmit.addEventListener('click', () => {
            const ans = parseInt(scaleInput.value);
            if (ans === eq.targetX) {
                scaleFeedback.textContent = "Equation solved! Left and right sides are equivalent. +10 coins!";
                scaleFeedback.className = "text-[11px] font-bold text-center text-emerald-700";
                playSound('coin');
                scaleBeam.style.transform = 'rotate(0deg)'; // Perfect balance!
                completeTopic();
            } else {
                scaleFeedback.textContent = "Equation out of balance! Recalculate your coefficients.";
                scaleFeedback.className = "text-[11px] font-bold text-center text-rose-700 animate-bounce";
                playSound('fail');
            }
        });
    }

    // -------------------------------------------------------------
    // GAME MODULE 5: COMPREHENSIVE FALLBACK QUIZ
    // -------------------------------------------------------------
    function mountSimpleArithmeticQuiz() {
        // Fallback or secondary lessons
        const num1 = Math.floor(Math.random() * 12) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const correct = num1 * num2;

        modalContentArea.innerHTML = `
            <div class="p-6 text-center space-y-4">
                <p class="text-sm font-semibold">Quick checkpoint review:</p>
                <p class="text-2xl font-bold font-mono text-indigo-400">${num1} × ${num2} = ?</p>
                <input type="number" id="simple-input" placeholder="Verify..." class="bg-slate-900 border border-slate-700 rounded p-2 text-center font-bold text-white text-lg">
                <button type="button" id="simple-submit" class="quest-btn quest-btn-primary w-full max-w-xs mx-auto">Verify</button>
                <p id="simple-feedback" class="text-xs font-bold"></p>
            </div>
        `;

        const sInput = document.getElementById('simple-input');
        const sFeedback = document.getElementById('simple-feedback');

        document.getElementById('simple-submit').addEventListener('click', () => {
            const ans = parseInt(sInput.value);
            if (ans === correct) {
                sFeedback.textContent = "Correct! Progress recorded. +10 coins!";
                sFeedback.className = "text-xs font-bold text-emerald-400";
                playSound('coin');
                completeTopic();
            } else {
                sFeedback.textContent = "Calculation error, try again!";
                sFeedback.className = "text-xs font-bold text-rose-400";
                playSound('fail');
            }
        });
    }

    function setupInteractiveTilt() {
        const containers = document.querySelectorAll('.map-canvas-container');
        
        containers.forEach(container => {
            container.addEventListener('mousemove', (e) => {
                if (!state.mode3d) return;
                
                const rect = container.getBoundingClientRect();
                const w = rect.width;
                const h = rect.height;
                
                // Mouse position relative to center of container
                const x = e.clientX - rect.left - w / 2;
                const y = e.clientY - rect.top - h / 2;
                
                // Max tilt angle offsets
                const maxTiltX = 5; // degrees
                const maxTiltY = 5; // degrees
                
                const tiltX = -(y / (h / 2)) * maxTiltX;
                const tiltY = (x / (w / 2)) * maxTiltY;
                
                // Apply dynamic 3D tilt with perspective
                container.style.transition = 'none'; // Disable transition for real-time tracking
                container.style.transform = `perspective(1400px) rotateX(${24 + tiltX}deg) rotateY(${-3 + tiltY}deg) rotateZ(1deg) translateY(-8px) scale(0.96)`;
            });
            
            container.addEventListener('mouseleave', () => {
                if (!state.mode3d) return;
                
                // Return to base 3D state smoothly
                container.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
                container.style.transform = `perspective(1400px) rotateX(24deg) rotateY(-3deg) rotateZ(1deg) translateY(-8px) scale(0.96)`;
            });
            
            container.addEventListener('mouseenter', () => {
                if (!state.mode3d) return;
                container.style.transition = 'none';
            });
        });
    }

    // Initialize map assets on page load
    loadState();
    updateStatsBar();
    renderMainMap();
    setupInteractiveTilt();
    window.addEventListener('resize', renderMainMap);
});
