/**
 * Dino Brain Break - Infinite Space Runner Mini-Game.
 *
 * An arcade mental break station inspired by Chrome's offline runner.
 * Features an astronaut leaping over orbiting space rocks to claim bonus quest coins.
 */

import React, { useRef, useState, useEffect } from 'react';
import { supabase, isRealSupabase } from '../auth/supabaseClient.js';
import { Gamepad2, Coins, ArrowRight, RotateCcw, Award, Play, AlertTriangle } from 'lucide-react';

export default function DinoBrainBreak({ studentSession, onGameFinished }) {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  // States.
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [secondsSurvived, setSecondsSurvived] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [bonusClaimed, setBonusClaimed] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Physics and entity references.
  const runnerY = useRef(0);
  const runnerVelocity = useRef(0);
  const isJumping = useRef(false);
  const obstacles = useRef([]);
  const starfield = useRef([]);
  const gameSpeed = useRef(4.5);

  const gravity = 0.55;
  const jumpStrength = -10.5;
  const groundY = 220; // Y pixel baseline on a 300px high canvas.

  // Setup keyboard listeners for jumping (Spacebar or Up Arrow).
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ([' ', 'ArrowUp'].includes(e.key)) {
        e.preventDefault(); // Prevent standard page jumping.
        if (!isJumping.current && isPlaying && !isGameOver) {
          runnerVelocity.current = jumpStrength;
          isJumping.current = true;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isGameOver]);

  // Handle Survival timer
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const interval = setInterval(() => {
      setSecondsSurvived((prev) => {
        const nextSeconds = prev + 1;
        
        // Survive 45 seconds condition to award flat points
        if (nextSeconds >= 45 && !bonusClaimed) {
          triggerCompletionAward();
        }
        return nextSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, bonusClaimed]);

  // Handle Score milestones
  useEffect(() => {
    if (score >= 1000 && !bonusClaimed && isPlaying && !isGameOver) {
      triggerCompletionAward();
    }
  }, [score, bonusClaimed, isPlaying, isGameOver]);

  // Trigger Point addition in database upon reaching goals
  const triggerCompletionAward = async () => {
    setBonusClaimed(true);
    setFeedback('🌟 Goal Achieved! Surviving the cosmos earned you 3 points!');

    try {
      if (isRealSupabase && studentSession) {
        await supabase
          .from('students')
          .update({ total_points: (studentSession.total_points || 0) + 3 })
          .eq('id', studentSession.id);
      } else if (studentSession) {
        // Mock session upgrade
        const updatedSession = {
          ...studentSession,
          total_points: (studentSession.total_points || 0) + 3
        };
        localStorage.setItem('student_math_session', JSON.stringify(updatedSession));
      }

      // Action complete hook
      if (onGameFinished) {
        onGameFinished(3);
      }
    } catch (err) {
      console.warn('Could not record brainbreak bonus points:', err);
    }
  };

  // Main 2D Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Create initial stars background
    if (starfield.current.length === 0) {
      for (let i = 0; i < 25; i++) {
        starfield.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * groundY,
          size: Math.random() * 1.5 + 0.5
        });
      }
    }

    const updatePhysics = () => {
      if (!isPlaying || isGameOver) return;

      // 1. Clear Screen
      ctx.fillStyle = '#020617'; // Deep dark background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Stars scrolling effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      starfield.current.forEach((star) => {
        star.x -= gameSpeed.current * 0.15;
        if (star.x < 0) star.x = canvas.width;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // 3. Ground line representing planet surface
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY + 15);
      ctx.lineTo(canvas.width, groundY + 15);
      ctx.stroke();

      // Flat landscape features on ground
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, groundY + 17, canvas.width, canvas.height - groundY - 17);

      // 4. Runner Astronaut Physics
      runnerVelocity.current += gravity;
      runnerY.current += runnerVelocity.current;

      // Lock to floor check
      if (runnerY.current >= 0) {
        runnerY.current = 0;
        runnerVelocity.current = 0;
        isJumping.current = false;
      }

      const activeAstronautY = groundY + runnerY.current;

      // Draw Astronaut model (Low-poly box look)
      ctx.fillStyle = '#ffffff'; // Spacesuit body
      ctx.fillRect(40, activeAstronautY - 20, 16, 24);

      ctx.fillStyle = '#020617'; // Cyan visor
      ctx.fillRect(50, activeAstronautY - 16, 6, 6);

      ctx.fillStyle = '#3b82f6'; // Indigo oxygen tank
      ctx.fillRect(34, activeAstronautY - 16, 6, 14);

      // Leg running movement frames
      ctx.fillStyle = '#94a3b8';
      const phase = Math.floor(performance.now() / 120) % 2;
      if (isJumping.current) {
        ctx.fillRect(42, activeAstronautY + 4, 4, 5);
        ctx.fillRect(50, activeAstronautY + 4, 4, 5);
      } else {
        ctx.fillRect(42 + (phase * 4), activeAstronautY + 4, 4, 5);
        ctx.fillRect(50 - (phase * 4), activeAstronautY + 4, 4, 5);
      }

      // 5. Generate and slide obstacles (Space Rocks)
      if (obstacles.current.length === 0 || (obstacles.current[obstacles.current.length - 1].x < canvas.width - (Math.random() * 140 + 120))) {
        obstacles.current.push({
          x: canvas.width,
          width: Math.random() * 8 + 12,
          height: Math.random() * 12 + 15,
          color: '#e2e8f0'
        });
      }

      // Update obstacles position and draw
      obstacles.current.forEach((obs, idx) => {
        obs.x -= gameSpeed.current;

        // Draw space rock
        ctx.fillStyle = '#475569';
        ctx.fillRect(obs.x, groundY + 8 - obs.height + 16, obs.width, obs.height);

        // Crater highlights on rocks
        ctx.fillStyle = '#334155';
        ctx.fillRect(obs.x + 3, groundY + 12 - obs.height + 16, 4, 4);

        // AABB Collision Check
        const astronautLeft = 40;
        const astronautRight = 56;
        const astronautTop = activeAstronautY - 20;
        const astronautBottom = activeAstronautY + 4;

        const rockLeft = obs.x;
        const rockRight = obs.x + obs.width;
        const rockTop = groundY + 8 - obs.height + 16;
        const rockBottom = groundY + 8 + 16;

        if (
          astronautRight > rockLeft &&
          astronautLeft < rockRight &&
          astronautBottom > rockTop &&
          astronautTop < rockBottom
        ) {
          // Collision occurred! Game Over.
          setIsGameOver(true);
          setIsPlaying(false);
        }

        // Clean out of bound rocks
        if (obs.x + obs.width < 0) {
          obstacles.current.splice(idx, 1);
        }
      });

      // Progress score points and adjust speed slowly
      setScore((prev) => {
        const nextScore = prev + 1;
        if (nextScore % 250 === 0) {
          gameSpeed.current += 0.5; // Accelerate slowly
        }
        return nextScore;
      });

      requestRef.current = requestAnimationFrame(updatePhysics);
    };

    if (isPlaying && !isGameOver) {
      requestRef.current = requestAnimationFrame(updatePhysics);
    }

    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, isGameOver]);

  const handleStart = () => {
    runnerY.current = 0;
    runnerVelocity.current = 0;
    isJumping.current = false;
    obstacles.current = [];
    gameSpeed.current = 4.5;
    setScore(0);
    setSecondsSurvived(0);
    setIsGameOver(false);
    setIsPlaying(true);
    setFeedback('');
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-2xl text-slate-100 flex flex-col justify-between min-h-[440px]">
      
      {/* Title HUD */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <Gamepad2 className="w-5.5 h-5.5 text-pink-400" />
          <div>
            <h3 className="font-extrabold text-sm text-slate-100">Astronaut Orbit Leap</h3>
            <p className="text-[10px] text-slate-400">Mental break: leap space rock debris</p>
          </div>
        </div>

        {/* Real-time trackers */}
        <div className="flex gap-2 font-mono text-xs">
          <div className="bg-slate-950 border border-slate-850 px-2.5 py-1.5 rounded-xl text-cyan-400">
            Dst: {score}m
          </div>
          <div className="bg-slate-950 border border-slate-850 px-2.5 py-1.5 rounded-xl text-pink-400">
            {secondsSurvived}s
          </div>
        </div>
      </div>

      {/* Main active workspace viewport */}
      <div className="my-5 relative rounded-2xl border border-slate-850 bg-slate-950 overflow-hidden flex items-center justify-center h-[300px]">
        
        {!isPlaying && !isGameOver ? (
          /* Start Dashboard */
          <div className="p-6 text-center space-y-4 max-w-sm">
            <Play className="w-10 h-10 text-pink-500 mx-auto animate-pulse" />
            <div>
              <h4 className="font-extrabold text-xs text-slate-200">Orbit Calibration Mode</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                No math calculations required! Press the **Spacebar** or **Up Arrow** to make your running astronaut jump over incoming craters and space boulders.
              </p>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 text-[9px] text-slate-400">
              🎯 Goal: Survive for 45s or reach 1000m to unlock the flat 3 point coin chest.
            </div>
            <button
              onClick={handleStart}
              className="bg-pink-600 hover:bg-pink-500 text-white font-black py-3 px-6 rounded-xl text-xs transition cursor-pointer"
            >
              Calibrate Engines
            </button>
          </div>
        ) : isGameOver ? (
          /* Game over view */
          <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-rose-500 animate-bounce" />
            <div>
              <h4 className="font-extrabold text-xs text-rose-400">Spacesuit Impact Calamity!</h4>
              <p className="text-[10px] text-slate-500 mt-1">You were knocked off trajectory. Re-calibrate and try again.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left font-mono text-xs w-full max-w-xs">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-500 block">DISTANCE RAN</span>
                <span className="font-black text-slate-200">{score} meters</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-500 block">TIME SURVIVED</span>
                <span className="font-black text-slate-200">{secondsSurvived} seconds</span>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 px-6 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        ) : (
          /* Canvas viewport */
          <canvas
            ref={canvasRef}
            width={380}
            height={300}
            className="w-full h-full block"
          />
        )}

      </div>

      {/* Goal award alerts */}
      {feedback && (
        <div className="mb-4 bg-emerald-950/40 border border-emerald-800/80 p-3 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Standard compliance footer */}
      <div className="border-t border-slate-850/80 pt-3.5 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
        <span className="text-[9px] bg-slate-950 px-2 py-0.5 rounded border border-slate-850 uppercase tracking-widest text-slate-400">
          Brain break Zone
        </span>
        <span>FERPA Compliant Workspace</span>
      </div>

    </div>
  );
}
