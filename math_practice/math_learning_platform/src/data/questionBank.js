/**
 * 6th Grade Math Platform Question Bank Core
 * 
 * Houses curated questions mapped across 10 curriculum units.
 * Supports different types (multiple choice, numeric input), difficulties,
 * and categories (practice, extra credit, custom game formats).
 */
export const questions = [
  // ==========================================
  // PLANET 1: RATIOS & UNIT RATES (6.RP)
  // ==========================================
  {
    id: "u1_q1",
    unit: 1,
    topic: "Equivalent Ratios",
    category: "standard_practice",
    type: "multiple_choice",
    difficulty: "medium",
    questionText: "If the ratio of red stars to blue stars in Sector 4 is 3:4, how many blue stars are there when there are 12 red stars?",
    options: ["12", "16", "20", "24"],
    correctAnswer: "16",
    explanation: "Write the ratio as 3/4. To find the equivalent ratio with 12 in the numerator: (3 * 4) / (4 * 4) = 12/16. There are 16 blue stars."
  },
  {
    id: "u1_q2",
    unit: 1,
    topic: "Unit Rates",
    category: "ratio_cooking",
    type: "numeric_input",
    difficulty: "easy",
    questionText: "A rocket thruster burns 24 liters of liquid nitrogen over 3 seconds. How many liters does it burn per second (the unit rate)?",
    options: [],
    correctAnswer: "8",
    explanation: "To find the unit rate, divide the total liters by the total seconds: 24 liters / 3 seconds = 8 liters per second."
  },
  {
    id: "u1_q3",
    unit: 1,
    topic: "Percentages & Ratios",
    category: "extra_credit_hard",
    type: "multiple_choice",
    difficulty: "hard",
    questionText: "A cargo shuttle is carrying 120 crates of minerals. If 35% of the crates contain heavy titanium and the rest contain standard cobalt, what is the ratio of titanium crates to cobalt crates in simplest form?",
    options: ["7:13", "7:20", "13:7", "35:65"],
    correctAnswer: "7:13",
    explanation: "First, find the percentages. Titanium = 35%, Cobalt = 100% - 35% = 65%. The ratio of titanium to cobalt is 35:65. Simplifying by dividing both parts by their greatest common factor (5) yields 7:13."
  },

  // ==========================================
  // PLANET 2: DIVIDING FRACTIONS (6.NS.1)
  // ==========================================
  {
    id: "u2_q1",
    unit: 2,
    topic: "Fraction Division",
    category: "standard_practice",
    type: "multiple_choice",
    difficulty: "medium",
    questionText: "How many 1/4-liter fuel canisters can be filled from a storage jug that holds 3/2 liters of fuel?",
    options: ["3", "4", "6", "12"],
    correctAnswer: "6",
    explanation: "Divide the total fuel by the canister size: (3/2) ÷ (1/4). Multiply by the reciprocal: (3/2) * (4/1) = 12/2 = 6 canisters."
  },

  // ==========================================
  // PLANET 3: RATIONAL NUMBERS & ABSOLUTE VALUE (6.NS.5-8)
  // ==========================================
  {
    id: "u3_q1",
    unit: 3,
    topic: "Absolute Value",
    category: "extra_credit_easy",
    type: "numeric_input",
    difficulty: "easy",
    questionText: "The elevation of a deep-sea thermal drill is at -45 meters. What is the absolute value of its elevation (the absolute distance to sea level)?",
    options: [],
    correctAnswer: "45",
    explanation: "Absolute value represents the distance from zero on a number line, which is always positive. |-45| = 45."
  }
];

/**
 * Question Bank Reader and Filter Helpers
 */
export const QuestionBank = {
  /**
   * Get all questions inside a specific curriculum unit (1-10)
   */
  getQuestionsByUnit: (unitNumber) => {
    return questions.filter(q => q.unit === unitNumber);
  },

  /**
   * Get questions filtered by unit and specific category
   * Categories: "standard_practice", "extra_credit_easy", "extra_credit_medium", "extra_credit_hard", "ratio_cooking", "space_shooter"
   */
  getQuestionsByCategory: (unitNumber, category) => {
    return questions.filter(q => q.unit === unitNumber && q.category === category);
  },

  /**
   * Retrieve a specific question object by its globally unique ID
   */
  getQuestionById: (id) => {
    return questions.find(q => q.id === id) || null;
  },

  /**
   * Get questions within a unit filtered by difficulty ("easy", "medium", "hard")
   */
  getQuestionsByDifficulty: (unitNumber, difficulty) => {
    return questions.filter(q => q.unit === unitNumber && q.difficulty === difficulty);
  },

  /**
   * Draw a random question from a unit matching a criteria to keep games dynamic
   */
  getRandomQuestion: (unitNumber, criteria = {}) => {
    let list = questions.filter(q => q.unit === unitNumber);
    
    if (criteria.category) {
      list = list.filter(q => q.category === criteria.category);
    }
    if (criteria.difficulty) {
      list = list.filter(q => q.difficulty === criteria.difficulty);
    }
    if (criteria.type) {
      list = list.filter(q => q.type === criteria.type);
    }

    if (list.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  }
};
