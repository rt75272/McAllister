/**
 * Quest Map Curriculum Units and Island Specifications.
 *
 * Defines the 3D map metadata, coordinates, topics, and minigame configurations
 * across all grade 6 curriculum units.
 */

export const units = [
  {
    id: 1,
    name: "Sky Garden Planet",
    topic: "Number Properties",
    color: "#6366f1",
    position: [-4, 0, -2], // 3D coordinates on map.
    icon: "🌸",
    desc: "Master GCF, LCM, division algorithms, and distributive property locks.",
    minigames: [
      { id: "1_1", name: "Blossom Sector (Division)", type: "shooter", coins: 10, desc: "Solve division code keys to align thruster thrusters." },
      { id: "1_2", name: "Ivy Climb (GCF & LCM)", type: "baking", coins: 12, desc: "Solve common multiples and prime factor trees." },
      { id: "1_3", name: "Greenhouse Distributive Prop", type: "balance", coins: 15, desc: "Distribute pollen values across balanced scales." }
    ]
  },
  {
    id: 2,
    name: "Gorilla Nebula",
    topic: "Fractions & Decimals",
    color: "#ec4899",
    position: [-1, 0, -4],
    icon: "🦍",
    desc: "Calculate decimal fuel thursters and divide giant fractional banana splits.",
    minigames: [
      { id: "2_1", name: "Mighty Ape Divide Fractions", type: "shooter", coins: 10, desc: "Multiply by reciprocals to stabilize flight coordinates." },
      { id: "2_2", name: "Banana Bakery Decimals", type: "baking", coins: 12, desc: "Align precise decimal measurement values." }
    ]
  },
  {
    id: 3,
    name: "Bathhouse Battle",
    topic: "Rational Numbers",
    color: "#06b6d4",
    position: [3, 0, -3],
    icon: "♨️",
    desc: "Plunge into negative water coordinate heights and locate hidden heat pipes.",
    minigames: [
      { id: "3_1", name: "Sub-Zero Negative Opposites", type: "shooter", coins: 10, desc: "Navigate opposite numbers on visual thermostatic elevation meters." }
    ]
  },
  {
    id: 4,
    name: "Tenting Trouble",
    topic: "Expressions",
    color: "#f59e0b",
    position: [4, 0, 1],
    icon: "⛺",
    desc: " Pitch expressions and exponents in volcanic cooking camps.",
    minigames: [
      { id: "4_1", name: "Campfire Exponents", type: "balance", coins: 10, desc: "Resolve exponential base powers to fire heat sparks." }
    ]
  },
  {
    id: 5,
    name: "Construction Canyon",
    topic: "Equations",
    color: "#10b981",
    position: [0, 0, 3],
    icon: "🏗️",
    desc: "Solve one-step equation loads to balance bridge girders.",
    minigames: [
      { id: "5_1", name: "Girder Balance Equations", type: "balance", coins: 10, desc: "Keep beam structures upright by calculating variable offsets." }
    ]
  }
];
