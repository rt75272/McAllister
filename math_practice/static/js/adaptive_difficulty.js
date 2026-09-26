/**
 * Shared client-side adaptive difficulty engine.
 *
 * Implements the same 1-parameter logistic (Item Response Theory) "ability" model
 * used server-side in adaptive_difficulty.py, so every math game on the site adjusts
 * its difficulty the same intelligent way: instead of a fixed streak counter, each
 * game keeps a running estimate of the student's ability and nudges it toward the
 * observed outcome (correct/incorrect, weighted by response time) after every answer.
 *
 * Per-game ability scores are persisted in localStorage so progress carries between
 * visits, and a shared "assessment" score (see skill_assessment.html) seeds the very
 * first ability estimate for any game the student hasn't played yet.
 *
 * Usage in a game's own script:
 *   const tier = AdaptiveDifficulty.getTier('math_blast');       // 'easy'|'medium'|'hard'
 *   // ...generate a problem at that tier, record Date.now() as the start time...
 *   const result = AdaptiveDifficulty.recordAnswer('math_blast', tier, wasCorrect, responseSeconds);
 *   // result.tier is the (possibly new) difficulty to use for the next problem.
 */
(function (global) {
    'use strict';

    // Latent difficulty ("b" parameter) of each tier, on the shared ability/logit scale.
    const TIER_DIFFICULTY = { easy: -1.5, medium: 0.0, hard: 1.5 };

    // Ability ranges mapped to each tier (lowest to highest).
    const TIER_BANDS = {
        easy: [-4.0, -0.5],
        medium: [-0.5, 1.5],
        hard: [1.5, 4.0]
    };

    // Roughly how long (seconds) a student is expected to take to answer at each tier;
    // used only to weight how strongly a single result should move the ability estimate.
    const EXPECTED_RESPONSE_SECONDS = { easy: 8, medium: 15, hard: 25 };

    const LEARNING_RATE = 0.6;
    const MIN_ABILITY = TIER_BANDS.easy[0];
    const MAX_ABILITY = TIER_BANDS.hard[1];
    const INITIAL_ABILITY = -2.0; // comfortably inside the easy band.
    const STORAGE_KEY = 'math_adaptive_ability_v1';

    function predictedSuccess(ability, tier) {
        const b = TIER_DIFFICULTY[tier] ?? 0;
        return 1 / (1 + Math.exp(-(ability - b)));
    }

    function responseWeight(tier, wasCorrect, responseSeconds) {
        const expected = EXPECTED_RESPONSE_SECONDS[tier] || 15;
        if (responseSeconds == null || !isFinite(responseSeconds) || expected <= 0) return 1.0;
        const ratio = responseSeconds / expected;
        if (wasCorrect) {
            // Fast + correct is strong evidence of mastery; very slow correct is weaker evidence.
            if (ratio < 0.6) return 1.3;
            if (ratio > 2.0) return 0.8;
            return 1.0;
        }
        // Fast + incorrect looks more like a careless slip than a real knowledge gap.
        if (ratio < 0.4) return 0.85;
        return 1.0;
    }

    function updateAbility(ability, tier, wasCorrect, responseSeconds) {
        const predicted = predictedSuccess(ability, tier);
        const actual = wasCorrect ? 1.0 : 0.0;
        const weight = responseWeight(tier, wasCorrect, responseSeconds);
        const next = ability + LEARNING_RATE * weight * (actual - predicted);
        return Math.max(MIN_ABILITY, Math.min(MAX_ABILITY, next));
    }

    function abilityToTier(ability) {
        for (const tier of Object.keys(TIER_BANDS)) {
            const [lo, hi] = TIER_BANDS[tier];
            if (ability >= lo && ability < hi) return tier;
        }
        return ability >= TIER_BANDS.hard[0] ? 'hard' : 'easy';
    }

    function tierProgress(ability, tier) {
        const [lo, hi] = TIER_BANDS[tier];
        return Math.max(0, Math.min(1, (ability - lo) / (hi - lo)));
    }

    function loadAll() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function saveAll(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            // Ignore quota errors / private browsing restrictions.
        }
    }

    /** Per-game ability, seeded from the shared assessment result the first time a game loads. */
    function getAbility(gameKey) {
        const data = loadAll();
        if (typeof data[gameKey] === 'number') return data[gameKey];
        if (typeof data.assessment === 'number') return data.assessment;
        return INITIAL_ABILITY;
    }

    function getTier(gameKey) {
        return abilityToTier(getAbility(gameKey));
    }

    function setAbility(gameKey, ability) {
        const data = loadAll();
        data[gameKey] = ability;
        saveAll(data);
    }

    /** Called once by the initial skill assessment to seed every game's starting difficulty. */
    function recordAssessmentResult(ability) {
        const data = loadAll();
        data.assessment = ability;
        saveAll(data);
    }

    function hasAssessmentResult() {
        return typeof loadAll().assessment === 'number';
    }

    /** Update a game's ability after an answer; returns the (possibly changed) tier to use next. */
    function recordAnswer(gameKey, tier, wasCorrect, responseSeconds) {
        const ability = getAbility(gameKey);
        const next = updateAbility(ability, tier, wasCorrect, responseSeconds);
        setAbility(gameKey, next);
        const nextTier = abilityToTier(next);
        return { ability: next, tier: nextTier, progress: tierProgress(next, nextTier) };
    }

    global.AdaptiveDifficulty = {
        TIER_BANDS,
        INITIAL_ABILITY,
        predictedSuccess,
        updateAbility,
        abilityToTier,
        tierProgress,
        getAbility,
        getTier,
        setAbility,
        recordAnswer,
        recordAssessmentResult,
        hasAssessmentResult
    };
})(window);
