(function () {
    const context = window.learningAccountContext;
    if (!context || !context.gameKey || !document.body) return;

    const supportedGameKeys = new Set([
        'math-blast', 'math-race', 'math-memory', 'word-match',
        'sentence-fixer', 'context-clues', 'verb-detective',
        'fraction-master', 'decimal-master', 'exponent-power',
        'exponent-world', 'exponent-rules', 'expression-comparison',
        'area-explorer', 'coordinate-navigator', 'ratio-river',
        'vault-solver', 'obstacle-course', 'snake-arcade', 'tetris',
        'pong-arcade', 'pinball-arcade', 'dino-arcade',
        'natural-selection-planet', 'moth-camouflage',
        'earth-science-planet', 'orientation', 'percentage-quest',
        'planet-hub',
        'plot-points', 'd20', 'baking-club', 'grand-finale',
        'pet-land', 'solar-system', 'decimal-life', 'math-adventure',
        'ela-planet', 'baking-club-planet', 'grand-finale-planet',
        'game-planet', 'chess-planet', 'solar-system-study',
    ]);
    if (!supportedGameKeys.has(context.gameKey)) return;

    const selectors = [
        '#score', '#score-display', '#stat-score', '#hud-score',
        '#left-score', '#collectedCount', '#beetlesCollected',
        '#results-score', '#progress-label', '#snake-score',
        '#shooter-score', '#ad-score', '#ttt-score', '#player-level',
    ];
    const observed = new Set();
    let bestScore = 0;
    let lastSentScore = 0;
    let timer = null;

    window.submitLeaderboardScore = function (score, gameKey) {
        const selectedGame = gameKey || context.gameKey;
        if (
            !supportedGameKeys.has(selectedGame)
            || !Number.isSafeInteger(score)
            || score <= 0
            || score > 1_000_000
        ) {
            return Promise.resolve(false);
        }
        const body = new URLSearchParams({
            csrf_token: context.csrfToken,
            game_key: selectedGame,
            score: String(score),
        });
        return fetch('/api/leaderboards/scores', {
            method: 'POST',
            body,
            credentials: 'same-origin',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
            keepalive: true,
        }).then((response) => response.ok);
    };

    function readScore(element) {
        const match = element.textContent.match(/-?\d+/);
        if (!match) return 0;
        const value = Number(match[0]);
        return Number.isSafeInteger(value) && value > 0 && value <= 1_000_000 ? value : 0;
    }

    function sendScore() {
        timer = null;
        if (bestScore <= lastSentScore) return;
        lastSentScore = bestScore;
        window.submitLeaderboardScore(bestScore).then((saved) => {
            if (saved) return;
            lastSentScore = Math.min(lastSentScore, bestScore - 1);
        }).catch(() => {
            lastSentScore = Math.min(lastSentScore, bestScore - 1);
        });
    }

    function observeScores() {
        selectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((element) => {
                if (observed.has(element)) return;
                observed.add(element);
                const observer = new MutationObserver(() => {
                    const value = readScore(element);
                    if (value <= bestScore) return;
                    bestScore = value;
                    if (timer) clearTimeout(timer);
                    timer = setTimeout(sendScore, 1500);
                });
                observer.observe(element, { childList: true, characterData: true, subtree: true });
            });
        });
    }

    observeScores();
    const discoveryObserver = new MutationObserver(observeScores);
    discoveryObserver.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && bestScore > lastSentScore) sendScore();
    });
    window.addEventListener('pagehide', () => {
        if (bestScore > lastSentScore) sendScore();
        discoveryObserver.disconnect();
    });
})();
