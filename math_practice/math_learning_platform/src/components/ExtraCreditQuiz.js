/**
 * Extra Credit Quiz Station Component.
 *
 * Tiered difficulty math challenges connected to curriculum planet learning objectives,
 * featuring instant feedback, point rewards, and Supabase score synchronization.
 */

import React, { useState } from 'react';
import { QuestionBank } from '../data/questionBank.js';
import { supabase, isRealSupabase } from '../auth/supabaseClient.js';
import { Trophy, HelpCircle, Check, ArrowRight, ShieldAlert, Coins, Loader2 } from 'lucide-react';

export default function ExtraCreditQuiz({ studentSession, unitId, onActionComplete }) {
  const [difficulty, setDifficulty] = useState(null); // null, 'easy', 'medium', 'hard'.
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [numericAnswer, setNumericAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  // Initialize quiz question for chosen difficulty.
  const handleSelectDifficulty = (tier) => {
    setDifficulty(tier);
    setAnswered(false);
    setSelectedOption('');
    setNumericAnswer('');
    
    // Draw appropriate matching question from bank.
    const question = QuestionBank.getRandomQuestion(unitId, { difficulty: tier }) || 
      // Safe fallback if bank doesn't have exact difficulty.
      QuestionBank.getRandomQuestion(1, { difficulty: tier });

    setCurrentQuestion(question);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!currentQuestion) return;

    let studentAnswer = '';
    let correct = false;

    if (currentQuestion.type === 'multiple_choice') {
      studentAnswer = selectedOption;
      correct = studentAnswer === currentQuestion.correctAnswer;
    } else {
      studentAnswer = numericAnswer.trim();
      correct = parseFloat(studentAnswer) === parseFloat(currentQuestion.correctAnswer);
    }

    setLoading(true);
    setIsCorrect(correct);
    setAnswered(true);

    if (correct) {
      // Determine points base based on difficulty tier
      const points = difficulty === 'hard' ? 10 : difficulty === 'medium' ? 5 : 2;
      setPointsEarned(points);

      try {
        if (isRealSupabase && studentSession) {
          // Increment point stats in profiles/student database
          const { error } = await supabase
            .from('students')
            .update({ total_points: (studentSession.total_points || 0) + points })
            .eq('id', studentSession.id);
          
          if (error) throw error;
        } else if (studentSession) {
          // Mock mode persistence update
          const updatedSession = {
            ...studentSession,
            total_points: (studentSession.total_points || 0) + points
          };
          localStorage.setItem('student_math_session', JSON.stringify(updatedSession));
        }

        // Parent callback hooks
        if (onActionComplete) {
          onActionComplete(points);
        }
      } catch (err) {
        console.error('Failed to update student points record:', err);
      }
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-xl text-slate-100 flex flex-col justify-between min-h-[380px]">
      
      {/* Upper header */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 bg-indigo-950 border border-indigo-850 text-indigo-400 rounded-xl flex items-center justify-center">
          <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-slate-100">Supernova Extra Credit Zone</h3>
          <p className="text-[10px] text-slate-400">Tackle rigorous mathematical models</p>
        </div>
      </div>

      {/* Mode A: Select Difficulty */}
      {!difficulty && (
        <div className="py-4 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed text-center">
            Select your difficulty level below. Rigorous problems award greater stellar points to secure your scoreboard ranking!
          </p>
          
          <div className="space-y-2.5">
            {[
              { tier: 'easy', reward: '+2 Pts', desc: 'Standard single-concept operations', color: 'border-emerald-800 hover:border-emerald-500 bg-emerald-950/10' },
              { tier: 'medium', reward: '+5 Pts', desc: 'Dual-step word analysis and ratios', color: 'border-indigo-800 hover:border-indigo-500 bg-indigo-950/10' },
              { tier: 'hard', reward: '+10 Pts', desc: 'Multi-step percentages & compound proofs', color: 'border-amber-800 hover:border-amber-500 bg-amber-950/10' }
            ].map((opt) => (
              <button
                key={opt.tier}
                onClick={() => handleSelectDifficulty(opt.tier)}
                className={`w-full border p-4 rounded-2xl flex items-center justify-between text-left transition transform hover:scale-101 cursor-pointer ${opt.color}`}
              >
                <div>
                  <h4 className="text-xs font-black capitalize text-slate-200">{opt.tier} Challenge</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</p>
                </div>
                <span className="font-mono text-xs font-black text-yellow-400 bg-slate-950 px-3 py-1 rounded-lg">
                  {opt.reward} 🪙
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode B: Display Active Challenge */}
      {difficulty && currentQuestion && (
        <div className="flex-1 py-4 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            
            {/* Active Task prompt */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-center text-xs font-semibold font-mono text-slate-200 leading-relaxed shadow-inner">
              {currentQuestion.questionText}
            </div>

            {/* Answer Forms */}
            {!answered ? (
              <form onSubmit={handleSubmitAnswer} className="space-y-3">
                {currentQuestion.type === 'multiple_choice' ? (
                  <div className="space-y-1.5">
                    {currentQuestion.options.map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition ${
                          selectedOption === opt
                            ? 'bg-indigo-950/30 border-indigo-500 text-indigo-300 font-bold'
                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="quizOption"
                          value={opt}
                          checked={selectedOption === opt}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="sr-only"
                        />
                        <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] shrink-0">
                          {selectedOption === opt ? '●' : ''}
                        </span>
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Enter numeric response..."
                    value={numericAnswer}
                    onChange={(e) => setNumericAnswer(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-center font-bold text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                  />
                )}

                <button
                  type="submit"
                  disabled={loading || (currentQuestion.type === 'multiple_choice' ? !selectedOption : !numericAnswer)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify Code <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            ) : (
              /* Feedbacks and Explanation */
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                  isCorrect 
                    ? 'bg-emerald-950/20 border-emerald-800/80 text-emerald-300' 
                    : 'bg-rose-950/20 border-rose-800/80 text-rose-300'
                }`}>
                  <span className="font-extrabold block mb-1">
                    {isCorrect ? '🌟 Success!' : '💡 Conceptual Explanation'}
                  </span>
                  <p>{isCorrect ? `Correct answer, nice work! +${pointsEarned} points recorded.` : currentQuestion.explanation}</p>
                </div>

                <button
                  onClick={() => setDifficulty(null)}
                  className="w-full bg-slate-850 hover:bg-slate-800 border border-slate-850 hover:border-slate-700 text-slate-300 font-bold py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Return &amp; Try Another Difficulty
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
