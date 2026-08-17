/**
 * Map HUD & Sidebar User Interface Component.
 *
 * Displays student coin balance, unit mission descriptions, quest lists,
 * completion status, and triggers interactive game modals.
 */

import React, { useState } from 'react';
import { Coins, ChevronLeft, Play, Lock, CheckCircle, Info } from 'lucide-react';
import GameModal from './GameModal.jsx';

export default function MapUI({ selectedUnit, setSelectedUnit, selectedTopic, setSelectedTopic }) {
  const [coins, setCoins] = useState(15);
  const [completedTopics, setCompletedTopics] = useState(['1_1']); // Seed one completed lesson.

  const handleLaunchGame = (topic) => {
    setSelectedTopic(topic);
  };

  const handleGameComplete = (earnedCoins, id) => {
    setCoins(prev => prev + earnedCoins);
    if (!completedTopics.includes(id)) {
      setCompletedTopics(prev => [...prev, id]);
    }
    setSelectedTopic(null);
  };

  return (
    <div className="flex flex-col h-full justify-between gap-6">
      {/* Top Header / Coin counter. */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="font-bold text-slate-100">Student Coins</span>
          </div>
          <span className="text-xl font-black text-yellow-400 font-mono">{coins}🪙</span>
        </div>

        {/* Dynamic details. */}
        {!selectedUnit ? (
          <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl text-center space-y-3">
            <div className="text-3xl">🌌</div>
            <h3 className="font-bold text-slate-200">Curriculum Nebula</h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Welcome to Mrs. McAllister's Galactic Learning Center! Click on any floating island to view local learning objectives, challenges, and mini-games.
            </p>
            <div className="flex items-center gap-1.5 justify-center text-[10px] text-indigo-400 font-semibold bg-indigo-950/40 py-1.5 px-3 rounded-lg border border-indigo-900/40">
              <Info className="w-3.5 h-3.5" /> Orbit controls are active inside the view.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header / Zoom out. */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedUnit(null)}
                className="flex items-center justify-center p-1.5 hover:bg-slate-900 rounded-lg border border-transparent hover:border-slate-800 transition"
              >
                <ChevronLeft className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Unit {selectedUnit.id} Target</span>
                <h2 className="text-base font-extrabold text-slate-100">{selectedUnit.name}</h2>
              </div>
            </div>

            {/* Description card */}
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-300 block mb-1">Focus Concept: {selectedUnit.topic}</span>
              {selectedUnit.desc}
            </div>

            {/* Topics & Games list */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Unit Quests</h4>
              
              {selectedUnit.minigames.map((topic, idx) => {
                const isCompleted = completedTopics.includes(topic.id);
                // All topics/things inside units are unlocked from day one!
                const isUnlocked = true;

                return (
                  <div
                    key={topic.id}
                    className={`border rounded-xl p-3.5 transition flex items-center justify-between ${
                      isCompleted
                        ? 'bg-emerald-950/20 border-emerald-800/60'
                        : isUnlocked
                        ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500'
                        : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{selectedUnit.icon}</span>
                        <h5 className="font-bold text-xs text-slate-200">{topic.name}</h5>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{topic.desc}</p>
                      <span className="inline-block text-[10px] font-semibold text-yellow-400/90 font-mono">
                        Rewards: {topic.coins} 🪙
                      </span>
                    </div>

                    <div>
                      {isCompleted ? (
                        <div className="bg-emerald-900/30 border border-emerald-700 text-emerald-400 p-1.5 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleLaunchGame(topic)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg flex items-center justify-center transition shadow-md"
                        >
                          <Play className="w-4 h-4 fill-white" />
                        </button>
                      ) : (
                        <div className="bg-slate-950 text-slate-600 p-2 rounded-lg flex items-center justify-center">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Embedded Mini-Game modal wrapper */}
      {selectedTopic && (
        <GameModal
          topic={selectedTopic}
          onClose={() => setSelectedTopic(null)}
          onComplete={(earned) => handleGameComplete(earned, selectedTopic.id)}
        />
      )}

      {/* Small platform trademark */}
      <footer className="text-[9px] text-slate-500 text-center font-medium mt-4">
        &copy; 2026 Mrs. McAllister's Learning Center. Math Quest Engine v2.0.
      </footer>
    </div>
  );
}
