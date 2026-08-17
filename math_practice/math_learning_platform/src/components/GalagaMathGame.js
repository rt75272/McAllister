/**
 * Galaga Math Space Shooter Game Component.
 *
 * 2D HTML5 Canvas space defender game where shooting descending asteroids triggers
 * curriculum math equation challenges, with accessibility timer controls.
 */

import React, { useRef, useState, useEffect } from 'react';
import { QuestionBank } from '../data/questionBank.js';
import { supabase, isRealSupabase } from '../auth/supabaseClient.js';
import { Gamepad2, Volume2, ShieldAlert, Zap, Timer, HelpCircle, Loader2 } from 'lucide-react';

export default function GalagaMathGame({ studentSession, unitId, onGameFinished }) {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  
  // Game state controllers.
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30); // 30-second interval trigger.
  const [showMathPrompt, setShowMathPrompt] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [numericAnswer, setNumericAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  // Accessibility toggle - Disable automated game speed timer.
  const [disableTimer, setDisableTimer] = useState(false);

  // Interactive entity trackers.
  const shipX = useRef(150);
  const lasers = useRef([]);
  const debris = useRef([]);
  const keysPressed = useRef({});

  // Keyboard controls listener for arcade ship movement.
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key] = true;
      // Prevent browser scrolling on space/arrows.
      if ([' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Timer interval hook: pause game and trigger math popup every 30 seconds
  useEffect(() => {
    if (!isPlaying || showMathPrompt || disableTimer) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Pause game loop and trigger math popup
          setIsPlaying(false);
          setShowMathPrompt(true);
          const drawQuestion = QuestionBank.getRandomQuestion(unitId) || QuestionBank.getRandomQuestion(1);
          setActiveQuestion(drawQuestion);
          setFeedback('');
          setSelectedOption('');
          setNumericAnswer('');
          return 30; // Reset timer interval
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, showMathPrompt, disableTimer, unitId]);

  // Main 2D Canvas render loop (Galaga movement physics & collision)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const updateGame = () => {
      if (!isPlaying || showMathPrompt) return;

      // Clear Screen
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield simulation
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 15; i++) {
        ctx.fillRect((Math.sin(i * 45) * 0.5 + 0.5) * canvas.width, (performance.now() * 0.05 + i * 25) % canvas.height, 2, 2);
      }

      // Ship controls WASD / Left & Right arrows
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
        shipX.current = Math.max(shipX.current - 4, 15);
      }
      if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
        shipX.current = Math.min(shipX.current + 4, canvas.width - 15);
      }

      // Shoot trigger (Spacebar) - throttled to prevent spam
      if (keysPressed.current[' '] && performance.now() - (lasers.current.lastShot || 0) > 280) {
        lasers.current.push({ x: shipX.current, y: canvas.height - 35 });
        lasers.current.lastShot = performance.now();
      }

      // Spawn falling Space debris/aliens randomly
      if (Math.random() < 0.02 && debris.current.length < 5) {
        debris.current.push({
          x: Math.random() * (canvas.width - 20) + 10,
          y: -10,
          speed: Math.random() * 1.5 + 0.8,
          size: Math.random() * 10 + 10
        });
      }

      // Draw and animate lasers
      ctx.fillStyle = '#06b6d4'; // Cyan lasers
      lasers.current.forEach((laser, idx) => {
        laser.y -= 5;
        ctx.fillRect(laser.x - 1.5, laser.y, 3, 10);
        // Clean out of bound lasers
        if (laser.y < 0) lasers.current.splice(idx, 1);
      });

      // Draw and animate debris objects
      debris.current.forEach((deb, debIdx) => {
        deb.y += deb.speed;
        
        // Render meteor look
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(deb.x, deb.y, deb.size / 2, 0, 2 * Math.PI);
        ctx.fill();

        // Collision Check: Laser matrix meets falling Debris
        lasers.current.forEach((laser, lasIdx) => {
          const dist = Math.hypot(laser.x - deb.x, laser.y - deb.y);
          if (dist < deb.size / 2 + 5) {
            // Explode & clear
            debris.current.splice(debIdx, 1);
            lasers.current.splice(lasIdx, 1);
            setScore((prev) => prev + 10);
          }
        });

        // Clean falling out of bounds objects
        if (deb.y > canvas.height) {
          debris.current.splice(debIdx, 1);
        }
      });

      // Draw Defender Ship
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(shipX.current, canvas.height - 35);
      ctx.lineTo(shipX.current - 12, canvas.height - 15);
      ctx.lineTo(shipX.current + 12, canvas.height - 15);
      ctx.closePath();
      ctx.fill();

      // Wing flares
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(shipX.current - 15, canvas.height - 18, 4, 8);
      ctx.fillRect(shipX.current + 11, canvas.height - 18, 4, 8);

      // Loop frame call
      requestRef.current = requestAnimationFrame(updateGame);
    };

    if (isPlaying && !showMathPrompt) {
      requestRef.current = requestAnimationFrame(updateGame);
    }

    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, showMathPrompt]);

  const handleStartGame = () => {
    setScore(0);
    setTimeRemaining(30);
    lasers.current = [];
    debris.current = [];
    setIsPlaying(true);
    setShowMathPrompt(false);
  };

  const handleMathVerify = async (e) => {
    e.preventDefault();
    if (!activeQuestion) return;

    let studentAnswer = '';
    let correct = false;

    if (activeQuestion.type === 'multiple_choice') {
      studentAnswer = selectedOption;
      correct = studentAnswer === activeQuestion.correctAnswer;
    } else {
      studentAnswer = numericAnswer.trim();
      correct = parseFloat(studentAnswer) === parseFloat(activeQuestion.correctAnswer);
    }

    setLoading(true);

    if (correct) {
      setScore((prev) => prev + 50); // Add big arcade score bonus
      setFeedback('Correct! Laser arrays boosted! +50 pts.');
      
      try {
        if (isRealSupabase && studentSession) {
          // Add 5 points directly to Supabase table
          await supabase
            .from('students')
            .update({ total_points: (studentSession.total_points || 0) + 5 })
            .eq('id', studentSession.id);
        } else if (studentSession) {
          // Mock Storage persistence
          const updatedSession = {
            ...studentSession,
            total_points: (studentSession.total_points || 0) + 5
          };
          localStorage.setItem('student_math_session', JSON.stringify(updatedSession));
        }
      } catch (err) {
        console.warn('Could not record score to platform db:', err);
      }

      // Resume game loops shortly
      setTimeout(() => {
        setShowMathPrompt(false);
        setIsPlaying(true);
      }, 1500);
    } else {
      setFeedback(`Incorrect! Try again. Hint: ${activeQuestion.explanation}`);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-lg bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-2xl text-slate-100 flex flex-col justify-between min-h-[500px]">
      
      {/* HUD Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-4 gap-3">
        <div className="flex items-center gap-2.5">
          <Gamepad2 className="w-5.5 h-5.5 text-indigo-400" />
          <div>
            <h3 className="font-extrabold text-sm text-slate-100">Galaga Math Sector</h3>
            <p className="text-[10px] text-slate-400">Blast debris &amp; solve equations</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-850">
          <span className="text-[10px] text-slate-400">Arcade Score:</span>
          <span className="font-black text-xs text-cyan-400 font-mono tracking-wider">{score}</span>
        </div>
      </div>

      {/* Main Canvas view vs Launch Button */}
      <div className="my-5 relative rounded-2xl border border-slate-850 bg-slate-950 overflow-hidden flex items-center justify-center min-h-[300px]">
        
        {!isPlaying && !showMathPrompt ? (
          /* Start Game screen */
          <div className="p-6 text-center space-y-4 max-w-sm">
            <Zap className="w-10 h-10 text-yellow-400 mx-auto animate-bounce" />
            <h4 className="font-extrabold text-xs text-slate-200">Prepare for Launch!</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Use your Left &amp; Right arrow keys (or A &amp; D) to move, and click your spacebar to fire lasers at falling asteroids!
            </p>
            <button
              onClick={handleStartGame}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 px-6 rounded-2xl text-xs transition shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              Start Engines &amp; Fly
            </button>
          </div>
        ) : showMathPrompt ? (
          /* Math check point prompt interruption (FERPA-Compliant) */
          <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 justify-center text-[10px] font-black text-yellow-400 bg-yellow-950/30 border border-yellow-900/50 py-1.5 px-3 rounded-xl">
                <Timer className="w-4 h-4 animate-spin" />
                <span>INTERCEPTED BY MATHEMATICAL CODE KEY!</span>
              </div>

              {activeQuestion && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300 font-bold leading-relaxed text-center font-mono bg-slate-900 p-4 rounded-xl border border-slate-800">
                    {activeQuestion.questionText}
                  </p>

                  <form onSubmit={handleMathVerify} className="space-y-3">
                    {activeQuestion.type === 'multiple_choice' ? (
                      <div className="space-y-2">
                        {activeQuestion.options.map((opt) => (
                          <label
                            key={opt}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-[11px] cursor-pointer transition ${
                              selectedOption === opt
                                ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300 font-bold'
                                : 'bg-slate-900/60 border-slate-800'
                            }`}
                          >
                            <input
                              type="radio"
                              name="galagaQuiz"
                              value={opt}
                              checked={selectedOption === opt}
                              onChange={(e) => setSelectedOption(e.target.value)}
                              className="sr-only"
                            />
                            <span className="w-4.5 h-4.5 rounded-full border border-slate-700 flex items-center justify-center shrink-0">
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
                        placeholder="Type numeric answer..."
                        value={numericAnswer}
                        onChange={(e) => setNumericAnswer(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-center font-bold text-white focus:outline-none focus:border-indigo-500 shadow-inner"
                      />
                    )}

                    {feedback && (
                      <div className="p-3 bg-indigo-950/30 border border-indigo-900/50 rounded-xl text-[10px] text-indigo-300 leading-normal flex items-start gap-1.5">
                        <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p>{feedback}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || (activeQuestion.type === 'multiple_choice' ? !selectedOption : !numericAnswer)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-3.5 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Answering Key'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Actual Game Canvas rendering */
          <canvas
            ref={canvasRef}
            width={380}
            height={300}
            className="w-full h-full block"
          />
        )}

      </div>

      {/* Footer controls & accessibility speed override */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-4 gap-4">
        
        {/* Timer status badge */}
        {!disableTimer && isPlaying && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
            <Timer className="w-4 h-4 animate-pulse" />
            <span>Math challenge in {timeRemaining}s</span>
          </div>
        )}
        {disableTimer && isPlaying && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-900/50">
            Zen Practice Mode (Timer Off)
          </span>
        )}
        {!isPlaying && <span className="text-[10px] text-slate-500">Press Start to lock target</span>}

        {/* Accessibility Toggle */}
        <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-850">
          <input
            type="checkbox"
            id="galaga-disable-timer"
            checked={disableTimer}
            onChange={(e) => {
              setDisableTimer(e.target.checked);
              // If checked while running, reset active clock limits
              if (e.target.checked) setTimeRemaining(30);
            }}
            className="w-4 h-4 text-indigo-600 rounded border-slate-800 bg-slate-900 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="galaga-disable-timer" className="text-[10px] font-bold text-slate-400 cursor-pointer select-none">
            Disable Game Speed Timer (Extra Processing Time)
          </label>
        </div>

      </div>

    </div>
  );
}
