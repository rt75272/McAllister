import React, { useState, useEffect } from 'react';
import { X, Trophy, Check, Flame, AlertCircle } from 'lucide-react';

export default function GameModal({ topic, onClose, onComplete }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [question, setQuestion] = useState({ query: '', answer: 0 });

  // Generate dynamic 6th-grade math questions on modal load based on topic type
  useEffect(() => {
    let query = '';
    let answer = 0;

    if (topic.type === 'shooter') {
      // Division or reciprocals
      const divisor = Math.floor(Math.random() * 8) + 3;
      const quotient = Math.floor(Math.random() * 9) + 4;
      const dividend = divisor * quotient;
      query = `Calculate the landing sector coordinate: what is ${dividend} ÷ ${divisor}?`;
      answer = quotient;
    } else if (topic.type === 'baking') {
      // Ratios
      const mult = Math.floor(Math.random() * 3) + 3; // 3 to 5
      query = `A cookie recipe requires 2 cups of sugar for every 5 cups of flour. If you scale the recipe to use ${5 * mult} cups of flour, how many cups of sugar do you need?`;
      answer = 2 * mult;
    } else if (topic.type === 'balance') {
      // Exponents or distributive prop
      const base = Math.floor(Math.random() * 3) + 3; // 3 or 4 or 5
      query = `Evaluate the volcanic geothermal energy core exponent: what is the value of ${base}³ (base ${base} to the power of 3)?`;
      answer = Math.pow(base, 3);
    } else {
      // Standard equation
      const x = Math.floor(Math.random() * 12) + 6;
      query = `Find the value of x to balance the construction girder: x + 14 = ${x + 14}`;
      answer = x;
    }

    setQuestion({ query, answer });
  }, [topic]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedInput = parseFloat(userAnswer);

    if (parsedInput === question.answer) {
      setIsCorrect(true);
      setFeedback(`Amazing job! You solved the quest and earned ${topic.coins} coins!`);
    } else {
      setFeedback('Calculation mismatch! Double-check your workspace and try again.');
      setUserAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest block">Active Quest Quest</span>
            <h3 className="font-extrabold text-sm text-slate-100">{topic.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quest Body */}
        <div className="p-6 flex-1 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            {/* Objective */}
            <div className="bg-indigo-950/40 border border-indigo-900/60 p-4 rounded-xl text-xs leading-relaxed text-indigo-200">
              <span className="font-bold flex items-center gap-1.5 text-indigo-300 mb-1">
                <Flame className="w-4 h-4 text-orange-400 animate-bounce" /> Objective Instructions
              </span>
              {topic.desc}
            </div>

            {/* Simulated Question Area */}
            <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl text-center space-y-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Question Challenge</span>
              <p className="font-semibold text-sm text-slate-100 leading-relaxed font-mono">
                {question.query}
              </p>
            </div>
          </div>

          {/* Form & Actions */}
          <div className="space-y-4">
            {feedback && (
              <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2 font-medium ${
                isCorrect 
                  ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300' 
                  : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
              }`}>
                {isCorrect ? <Trophy className="w-5 h-5 text-yellow-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                <p>{feedback}</p>
              </div>
            )}

            {!isCorrect ? (
              <form onSubmit={handleSubmit} className="flex gap-2.5">
                <input
                  type="number"
                  required
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter calculation..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-semibold font-mono focus:outline-none focus:border-indigo-500 text-center"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 rounded-xl text-xs transition shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Verify
                </button>
              </form>
            ) : (
              <button
                onClick={() => onComplete(topic.coins)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-1.5"
              >
                Collect Rewards &amp; Close 🪙
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
