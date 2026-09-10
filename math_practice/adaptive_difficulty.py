"""
Lightweight IRT-style (Item Response Theory) adaptive difficulty engine for Math Practice.

Instead of a fixed "N correct answers in a row" streak counter, this module keeps an
online estimate of the student's latent "ability" using the same 1-parameter logistic
model that real computerized adaptive testing (CAT) systems use to pick the next item:

    P(correct | ability, difficulty) = 1 / (1 + exp(-(ability - difficulty)))

After every answer the ability estimate is nudged toward the outcome that was actually
observed (a small online gradient step), weighted by how surprising the response timing
was (fast-correct is stronger evidence of mastery than slow-correct, etc). The resulting
ability score is then mapped back onto the existing easy/medium/hard tiers, which lets a
student who is struggling drop back down a tier (not just advance), unlike a one-way
streak counter.
"""

import math

# Latent difficulty ("b" parameter) of each tier on the shared ability/logit scale.
TIER_DIFFICULTY = {'easy': -1.5, 'medium': 0.0, 'hard': 1.5}

# Ability ranges mapped to each tier. Ordered lowest to highest.
TIER_BANDS = {
    'easy': (-4.0, -0.5),
    'medium': (-0.5, 1.5),
    'hard': (1.5, 4.0),
}

# Roughly how long (seconds) a student is expected to take to answer at each tier.
# Used only to weight how strongly a single result should move the ability estimate.
EXPECTED_RESPONSE_SECONDS = {'easy': 8, 'medium': 15, 'hard': 25}

LEARNING_RATE = 0.6
MIN_ABILITY = TIER_BANDS['easy'][0]
MAX_ABILITY = TIER_BANDS['hard'][1]

# Where a fresh session starts: comfortably inside the easy band.
INITIAL_ABILITY = -2.0


def predicted_success(ability, tier):
    """Probability the student answers correctly at this tier, per the logistic model."""
    b = TIER_DIFFICULTY[tier]
    return 1.0 / (1.0 + math.exp(-(ability - b)))


def _response_weight(tier, was_correct, response_seconds):
    """Scale the ability update by how surprising the response timing was."""
    expected = EXPECTED_RESPONSE_SECONDS.get(tier, 15)
    if response_seconds is None or expected <= 0:
        return 1.0
    ratio = response_seconds / expected
    if was_correct:
        # Fast + correct is strong evidence of mastery; very slow correct is weaker evidence.
        if ratio < 0.6:
            return 1.3
        if ratio > 2.0:
            return 0.8
        return 1.0
    # Fast + incorrect looks more like a careless slip than a real knowledge gap.
    if ratio < 0.4:
        return 0.85
    return 1.0


def update_ability(ability, tier, was_correct, response_seconds=None):
    """Online gradient update of the ability estimate (1PL IRT-style)."""
    predicted = predicted_success(ability, tier)
    actual = 1.0 if was_correct else 0.0
    weight = _response_weight(tier, was_correct, response_seconds)
    new_ability = ability + LEARNING_RATE * weight * (actual - predicted)
    return max(MIN_ABILITY, min(MAX_ABILITY, new_ability))


def ability_to_tier(ability):
    """Translate a continuous ability score into a discrete easy/medium/hard tier."""
    for tier, (lo, hi) in TIER_BANDS.items():
        if lo <= ability < hi:
            return tier
    return 'hard' if ability >= TIER_BANDS['hard'][0] else 'easy'


def tier_progress(ability, tier):
    """0..1 fraction of the way through the given tier's ability band."""
    lo, hi = TIER_BANDS[tier]
    frac = (ability - lo) / (hi - lo)
    return max(0.0, min(1.0, frac))
