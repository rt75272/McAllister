/**
 * Planet Hub Educational Control Component.
 *
 * Overlays an interactive 2D constellation trail mapping 12 curriculum learning stations,
 * assessment check-ins, brain breaks, and challenge proofs for the active planet.
 */

import React, { useState } from 'react';
import { Star, CheckCircle, ArrowLeft, Gamepad2, Coins, Rocket, Trophy, Compass, Sparkles, BookOpen } from 'lucide-react';

// Stations mapping templates along a starry constellation path (12 stations total).
const stationsTemplate = [
  { id: 1, name: "Star 360 Check-In", type: "assessment", desc: "Diagnostic gateway to align your local math coordinates." },
  { id: 2, name: "Memory Blast Brainbreak", type: "brainbreak", desc: "Keep your processor cool with a rapid patterns sequence mini-game." },
  { id: 3, name: "Asteroid Dodge Brainbreak", type: "brainbreak", desc: "Dodge orbiting debris and speed particles for motor calibration." },
  { id: 4, name: "Supernova Extra Credit", type: "challenge", desc: "A cognitive-grade deep solar flare mathematical proof." },
  { id: 5, name: "Ratio Cruiser Station", type: "practice", desc: "Equip your dashboard with correct fractional division parameters." },
  { id: 6, name: "Galaga Sector Rates", type: "practice", desc: "Blast equivalent numerical equations down with laser matrices." },
  { id: 7, name: "Kitchen Ratio Baker", type: "practice", desc: "Stir together metric proportions to bake galactic power bars." },
  { id: 8, name: "Decimal Matrix Fueler", type: "practice", desc: "Calculate exact floating decimal ounces of ship engine fuel." },
  { id: 9, name: "Integers Elevation Grid", type: "practice", desc: "Navigate opposite elevation valves under sub-zero waters." },
  { id: 10, name: "Absolute Pressure Valves", type: "practice", desc: "Unfold 3D nets and calculate absolute values of negative load lines." },
  { id: 11, name: "Equations Balance Scaffold", type: "practice", desc: "Equilibrate girder scales using one-step algebra weights." },
  { id: 12, name: "Mothership Coordinate Dock", type: "practice", desc: "Plot 4 quadrants of local vector ports on the absolute coordinate grid." }
];

// Stylized node offsets mapping a curved constellation path (sine curve/zigzag).
const pathCoordinates = [
  { x: 12, y: 55 },
  { x: 20, y: 35 },
  { x: 28, y: 22 },
  { x: 38, y: 30 },
  { x: 45, y: 50 },
  { x: 50, y: 70 },
  { x: 58, y: 80 },
  { x: 68, y: 72 },
  { x: 75, y: 52 },
  { x: 82, y: 32 },
  { x: 88, y: 20 },
  { x: 94, y: 38 }
];

export default function PlanetHub({ planet, studentSession, onLaunchStation, onReturnToSpace }) {
  const [completedStations, setCompletedStations] = useState(['1', '2']); // Seed initial completed checks.
  const [points, setPoints] = useState(studentSession?.total_points || 150);
  const [hoveredStation, setHoveredStation] = useState(null);

  // Station action helper.
  const handleStationClick = (station) => {
    // All stations are unlocked from day one.
    const isUnlocked = true;

    // Launch action.
    onLaunchStation({
      ...station,
      unit: planet.id,
      coinsAward: station.type === 'challenge' ? 25 : station.type === 'assessment' ? 15 : 10
    });
  };

  const getStationStyle = (station, isUnlocked, isCompleted) => {
    if (isCompleted) {
      return "bg-gradient-to-tr from-emerald-600 to-teal-400 text-white border-emerald-300 ring-4 ring-emerald-500/20";
    }
    if (isUnlocked) {
      switch (station.type) {
        case 'assessment': return "bg-gradient-to-tr from-indigo-600 to-blue-500 text-white border-blue-400 ring-4 ring-indigo-500/20 animate-pulse";
        case 'brainbreak': return "bg-gradient-to-tr from-pink-600 to-rose-400 text-white border-rose-400 ring-4 ring-rose-500/20";
        case 'challenge': return "bg-gradient-to-tr from-amber-500 to-yellow-400 text-white border-yellow-300 ring-4 ring-yellow-500/20";
        default: return "bg-gradient-to-tr from-cyan-600 to-indigo-500 text-white border-cyan-400 ring-4 ring-cyan-500/20";
      }
    }
    return "bg-slate-950 text-slate-600 border-slate-800 opacity-60 cursor-not-allowed";
  };

  const getStationIcon = (type, isCompleted) => {
    if (isCompleted) return <CheckCircle className="w-5 h-5 stroke-[3px]" />;
    switch (type) {
      case 'assessment': return <BookOpen className="w-5 h-5" />;
      case 'brainbreak': return <Gamepad2 className="w-5 h-5" />;
      case 'challenge': return <Trophy className="w-5 h-5" />;
      default: return <Compass className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-xl z-40 flex flex-col justify-between overflow-hidden p-6 text-slate-100 font-sans">
      
      {/* Constellation Starry Canvas Background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2IiBoZWlnaHQ9IjYiPgo8Y2lyY2xlIGN4PSIzIiBjeT0iMyIgcj0iMSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDgiLz4KPC9zdmc+')] pointer-events-none opacity-60"></div>
      
      {/* Top Navigation HUD bar */}
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-4 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onReturnToSpace}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-2xl text-xs font-bold transition shadow-lg cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Space
          </button>
          
          <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>
          
          <div>
            <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block">Exploring Local Constellation</span>
            <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
              🪐 Unit {planet.id}: {planet.name || planet.topic}
            </h2>
          </div>
        </div>

        {/* Real-time stats */}
        <div className="flex items-center gap-3 bg-slate-950 border border-slate-800/80 px-4 py-2.5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4.5 h-4.5 text-yellow-400" />
            <span className="text-xs text-slate-400">Total Points:</span>
            <span className="font-extrabold text-yellow-400 font-mono text-sm">{points}</span>
          </div>
          <span className="text-slate-800">|</span>
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4.5 h-4.5 text-indigo-400" />
            <span className="text-xs text-slate-400">Completed:</span>
            <span className="font-extrabold text-indigo-400 font-mono text-sm">{completedStations.length} / 12</span>
          </div>
        </div>
      </div>

      {/* Main 2D Constellation Map Viewport */}
      <div className="flex-1 relative my-6 bg-slate-950/40 border border-slate-900 rounded-3xl overflow-hidden shadow-inner flex flex-col justify-end">
        
        {/* Dynamic Glow Orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Clickable Map Stations Container */}
        <div className="absolute inset-0 p-8 sm:p-12">
          
          {/* Constellation Connector Vectors */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none hidden">
            <path
              d={`M ${pathCoordinates.map(p => `${p.x}%,${p.y}%`).join(' L ')}`}
              fill="none"
              stroke="none"
              strokeWidth="0"
            />
          </svg>

          {/* Interactive Nodes */}
          {stationsTemplate.map((station, index) => {
            const coord = pathCoordinates[index];
            const isCompleted = completedStations.includes(String(station.id));
            const isUnlocked = true; // Bypassed: All stations unlocked!

            return (
              <div
                key={station.id}
                style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 group"
              >
                {/* Visual Trigger Button */}
                <button
                  onClick={() => handleStationClick(station)}
                  onMouseEnter={() => setHoveredStation(station)}
                  onMouseLeave={() => setHoveredStation(null)}
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-300 transform cursor-pointer relative z-40 ${
                    getStationStyle(station, isUnlocked, isCompleted)
                  }`}
                >
                  {getStationIcon(station.type, isCompleted)}
                </button>

                {/* Star Overlay badge for Extra Credit */}
                {station.type === 'challenge' && isUnlocked && !isCompleted && (
                  <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-bounce pointer-events-none z-50" />
                )}

                {/* Tooltip for desktop hover */}
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-xl text-[10px] font-black text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50">
                  {`Station ${station.id}: ${station.name}`}
                </div>
              </div>
            );
          })}

        </div>

        {/* Dynamic HUD Details of Hovered Station */}
        <div className="relative m-6 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl backdrop-blur-md max-w-lg z-10 shadow-2xl self-start">
          {hoveredStation ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase bg-indigo-950 border border-indigo-800 text-indigo-400 px-2 py-0.5 rounded-md">
                  Station {hoveredStation.id} • {hoveredStation.type}
                </span>
                <h4 className="font-extrabold text-sm text-slate-100">{hoveredStation.name}</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pt-1">{hoveredStation.desc}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-slate-300 flex items-center gap-1.5">
                <Rocket className="w-4.5 h-4.5 text-indigo-400 animate-pulse" /> Constellation Exploration System
              </h4>
              <p className="text-xs text-slate-500">
                Hover over any station on the constellation map to examine landing coordinates, mission descriptions, and math goals.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Curriculum Summary Panel */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800/80 pt-4 z-10 text-xs">
        <div className="bg-slate-900/40 border border-slate-800/60 p-3.5 rounded-2xl flex items-start gap-2.5">
          <BookOpen className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <h5 className="font-bold text-slate-200 mb-0.5">Diagnostic gateway</h5>
            <p className="text-[11px] text-slate-500 leading-normal">
              Review and record current diagnostic scores under Star 360 checkpoints to initialize personalized parameters.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/60 p-3.5 rounded-2xl flex items-start gap-2.5">
          <Gamepad2 className="w-5 h-5 text-pink-400 shrink-0" />
          <div>
            <h5 className="font-bold text-slate-200 mb-0.5">Active Brain breaks</h5>
            <p className="text-[11px] text-slate-500 leading-normal">
              Keep your processing speed locked. Replay memory sequence breaks to maintain focus and unlock extra coordinates.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/60 p-3.5 rounded-2xl flex items-start gap-2.5">
          <Trophy className="w-5 h-5 text-yellow-400 shrink-0" />
          <div>
            <h5 className="font-bold text-slate-200 mb-0.5">Rigorous Challenges</h5>
            <p className="text-[11px] text-slate-500 leading-normal">
              Take on high-order mathematical extra credit models to win premium chest bonuses and class stars!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
