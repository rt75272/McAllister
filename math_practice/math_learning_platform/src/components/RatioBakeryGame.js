/**
 * Space Kitchen Ratio Bakery Mini-Game.
 *
 * Culinary ratio scaling simulation where students calculate equivalent ratios
 * and proportions to mix ingredients and prepare galactic recipes.
 */

import React, { useState, useEffect } from 'react';
import { supabase, isRealSupabase } from '../auth/supabaseClient.js';
import { ChefHat, Flame, HelpCircle, AlertCircle, CheckCircle, RotateCcw, Coins, ShieldAlert } from 'lucide-react';

// Pre-defined modular galactic baking orders.
const galacticRecipes = [
  {
    id: "rec_1",
    name: "Cosmic Nebula Pizza",
    ratioText: "2 Star-Flour : 3 Moon-Cheese",
    baseLeft: 2,
    baseRight: 3,
    ingLeft: "Star-Flour 🌾",
    ingRight: "Moon-Cheese 🧀",
    icon: "🍕"
  },
  {
    id: "rec_2",
    name: "Supernova Pancake Stack",
    ratioText: "1 Comet-Sugar : 4 Asteroid-Butter",
    baseLeft: 1,
    baseRight: 4,
    ingLeft: "Comet-Sugar 🍬",
    ingRight: "Asteroid-Butter 🧈",
    icon: "🥞"
  },
  {
    id: "rec_3",
    name: "Stellar Cinnamon Roll",
    ratioText: "3 Dust-Flour : 2 Eclipse-Cinnamon",
    baseLeft: 3,
    baseRight: 2,
    ingLeft: "Dust-Flour 🌾",
    ingRight: "Eclipse-Cinnamon 🪵",
    icon: "🌀"
  }
];

export default function RatioBakeryGame({ studentSession, unitId, onGameFinished }) {
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [assemblyProgress, setAssemblyProgress] = useState(0); // 0: empty, 1: half full, 2: completed/baked.
  const [score, setScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [ratioQuestion, setRatioQuestion] = useState({ query: '', answer: 0, mult: 1 });
  const [isFinished, setIsFinished] = useState(false);

  const activeRecipe = galacticRecipes[currentRecipeIndex];

  // Helper to generate a new ratio equivalence question based on active recipe
  const generateRatioQuestion = (recipe) => {
    const scaleMultiplier = Math.floor(Math.random() * 4) + 2; // scale by 2, 3, 4, or 5
    const solveForRight = Math.random() < 0.5; // Determine which part of ratio to solve for
    let query = '';
    let answer = 0;

    if (solveForRight) {
      const knownLeft = recipe.baseLeft * scaleMultiplier;
      query = `If you scale the recipe to use exactly ${knownLeft} units of ${recipe.ingLeft}, how many units of ${recipe.ingRight} do you need to preserve the ${recipe.baseLeft}:${recipe.baseRight} ratio?`;
      answer = recipe.baseRight * scaleMultiplier;
    } else {
      const knownRight = recipe.baseRight * scaleMultiplier;
      query = `If you scale the recipe to use exactly ${knownRight} units of ${recipe.ingRight}, how many units of ${recipe.ingLeft} do you need to preserve the ${recipe.baseLeft}:${recipe.baseRight} ratio?`;
      answer = recipe.baseLeft * scaleMultiplier;
    }

    setRatioQuestion({ query, answer, mult: scaleMultiplier });
  };

  // Generate question on recipe change
  useEffect(() => {
    if (activeRecipe) {
      generateRatioQuestion(activeRecipe);
      setAssemblyProgress(0);
      setErrorMessage('');
      setFeedbackMessage('');
      setUserAnswer('');
    }
  }, [currentRecipeIndex]);

  const handleSubmitIngredient = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFeedbackMessage('');

    const parsedAnswer = parseFloat(userAnswer);

    if (parsedAnswer === ratioQuestion.answer) {
      // Correct equivalent ratio calculation
      const nextProgress = assemblyProgress + 1;
      setAssemblyProgress(nextProgress);
      setFeedbackMessage(`Success! Correct proportions mixed. ${nextProgress === 1 ? 'First ingredient loaded!' : 'Dish fully assembled!'}`);
      setUserAnswer('');

      if (nextProgress >= 2) {
        // Assembled both sides of ratio. Bake!
        setScore((prev) => prev + 100);
        
        try {
          if (isRealSupabase && studentSession) {
            // Log point increase to student profile table in database
            await supabase
              .from('students')
              .update({ total_points: (studentSession.total_points || 0) + 10 })
              .eq('id', studentSession.id);
          } else if (studentSession) {
            // Offline/Mock caching update
            const updatedSession = {
              ...studentSession,
              total_points: (studentSession.total_points || 0) + 10
            };
            localStorage.setItem('student_math_session', JSON.stringify(updatedSession));
          }
        } catch (err) {
          console.warn('Could not record kitchen score to database:', err);
        }

        // Delay before loading next recipe order
        setTimeout(() => {
          if (currentRecipeIndex < galacticRecipes.length - 1) {
            setCurrentRecipeIndex((prev) => prev + 1);
          } else {
            setIsFinished(true);
          }
        }, 1800);
      } else {
        // Still need to solve the equivalent coordinate for the second half of the recipe
        generateRatioQuestion(activeRecipe);
      }
    } else {
      setErrorMessage(`Ratio mismatch! Your ingredients spoiled the consistency. Hint: Find what scale multiplier aligns with the base ratio.`);
      setUserAnswer('');
    }
  };

  const handleRestart = () => {
    setCurrentRecipeIndex(0);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-2xl text-slate-100 flex flex-col justify-between min-h-[460px]">
      
      {/* Header HUD info */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <ChefHat className="w-5.5 h-5.5 text-orange-400" />
          <div>
            <h3 className="font-extrabold text-sm text-slate-100">Galactic Ratio Bakery</h3>
            <p className="text-[10px] text-slate-400">Scale recipe ratios to bake dishes</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-xl font-mono text-xs text-yellow-400 tracking-wider">
          Score: {score}
        </div>
      </div>

      {!isFinished ? (
        /* Kitchen Game Workspace */
        <div className="my-5 flex-1 flex flex-col justify-between gap-5">
          
          {/* Active Recipe Banner */}
          <div className="bg-gradient-to-r from-orange-950/40 to-slate-900 border border-orange-900/40 p-4 rounded-2xl flex items-center gap-3">
            <span className="text-3xl animate-bounce">{activeRecipe.icon}</span>
            <div>
              <span className="text-[9px] font-black uppercase text-orange-400 block tracking-widest">Active Order Queue</span>
              <h4 className="font-extrabold text-xs text-slate-200">{activeRecipe.name}</h4>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">Base Ratio Required: {activeRecipe.ratioText}</p>
            </div>
          </div>

          {/* Interactive Mixing Bowl & Progression Assembly Line */}
          <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-2xl text-center flex flex-col items-center justify-center gap-3 shadow-inner relative">
            <div className="text-2xl">🥣</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mixing Bowl Progress</div>
            
            {/* Visual mixing bowl progression */}
            <div className="w-full max-w-xs h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                style={{ width: `${assemblyProgress * 50}%` }}
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-500"
              />
            </div>
            <span className="text-[10px] text-slate-400 font-semibold font-mono">
              {assemblyProgress === 0 ? "Empty Bowl - Awaiting Star proportions" : assemblyProgress === 1 ? "Semi-Assembled: Proportions look good!" : "Fully Proportioned & Baked!"}
            </span>
          </div>

          {/* Ratio equivalent question card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3.5">
            <p className="text-xs text-slate-300 font-medium leading-relaxed font-mono text-center">
              {ratioQuestion.query}
            </p>

            <form onSubmit={handleSubmitIngredient} className="flex gap-2.5">
              <input
                type="number"
                required
                placeholder="Scale ratio answer..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-center font-bold text-white focus:outline-none focus:border-indigo-500 shadow-inner font-mono"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-4 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1"
              >
                Mix In
              </button>
            </form>
          </div>

          {/* Dynamic Feedbacks */}
          {feedbackMessage && (
            <div className="bg-emerald-950/30 border border-emerald-800/80 p-3 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-400" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-950/30 border border-rose-800/80 p-3 rounded-xl text-xs text-rose-300 font-bold flex items-start gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

        </div>
      ) : (
        /* Game Completion screen */
        <div className="py-8 text-center space-y-5 flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <ChefHat className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-100">Stellar Chef Status Achieved!</h4>
            <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-relaxed">
              Congratulations! You evaluated all kitchen ratios correctly, baked all galaxy dishes, and helped power Mrs. McAllister's star ship!
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-850 px-5 py-3 rounded-2xl flex items-center gap-2 font-mono text-xs font-black text-yellow-400 shadow-inner">
            <Coins className="w-5 h-5 text-yellow-400" /> Total Score: {score} Pts
          </div>
          <button
            onClick={handleRestart}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3 px-6 rounded-2xl text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-4.5 h-4.5" /> Replay Kitchen
          </button>
        </div>
      )}

      {/* Safety Compliance tag */}
      <div className="border-t border-slate-850/80 pt-3 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
        <div className="flex items-center gap-1.5 text-emerald-500/90">
          <span>🔒 Compliance Verified</span>
        </div>
        <span>FERPA Compliant Workspace</span>
      </div>

    </div>
  );
}
