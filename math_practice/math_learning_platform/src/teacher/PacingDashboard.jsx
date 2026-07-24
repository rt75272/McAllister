import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Users, GraduationCap, ShieldAlert, TrendingUp, CheckCircle, Clock } from 'lucide-react';

const mockClassData = [
  { name: 'Unit 1', completed: 28, inProgress: 2, locked: 0 },
  { name: 'Unit 2', completed: 24, inProgress: 5, locked: 1 },
  { name: 'Unit 3', completed: 18, inProgress: 10, locked: 2 },
  { name: 'Unit 4', completed: 2, inProgress: 8, locked: 20 },
  { name: 'Unit 5', completed: 0, inProgress: 0, locked: 30 }
];

const gradeSpread = [
  { name: 'A (90-100%)', value: 12, color: '#10b981' },
  { name: 'B (80-89%)', value: 10, color: '#3b82f6' },
  { name: 'C (70-79%)', value: 5, color: '#f59e0b' },
  { name: 'D (60-69%)', value: 2, color: '#ef4444' },
  { name: 'F (< 60%)', value: 1, color: '#64748b' }
];

const mockTimeline = [
  { date: 'Mon', averageScore: 78 },
  { date: 'Tue', averageScore: 82 },
  { date: 'Wed', averageScore: 80 },
  { date: 'Thu', averageScore: 85 },
  { date: 'Fri', averageScore: 89 }
];

export default function PacingDashboard() {
  const [pacingMaxUnit, setPacingMaxUnit] = useState(3);
  const [pacingLock, setPacingLock] = useState(true);

  return (
    <div className="space-y-6">
      {/* Upper metrics row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            Teacher Administrative Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Overview analytics, student logs, and curriculum synchronization locks for Grade 6 Math, Period 4.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          <span className="text-xs font-bold text-slate-300">Mrs. McAllister's Sandbox Mode</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric Cards */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Students</span>
            <span className="text-lg font-extrabold text-slate-100 font-mono">30 / 32</span>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Class Completion Rate</span>
            <span className="text-lg font-extrabold text-slate-100 font-mono">84%</span>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Time Engaged Avg</span>
            <span className="text-lg font-extrabold text-slate-100 font-mono">42m / day</span>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 bg-pink-500/10 text-pink-400 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Average Quiz Grade</span>
            <span className="text-lg font-extrabold text-slate-100 font-mono">87.5%</span>
          </div>
        </div>
      </div>

      {/* Main split grid: Controls & Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Controls */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active pacing control board */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col gap-4 shadow-xl">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              ⚙️ Classroom Pacing Locks
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enforce synchronous table group work. When pacing lock is active, students are prevented from starting units beyond your class progress focus, even if they have unlocked them with coins.
            </p>

            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800/80">
              <label htmlFor="teacher-pacing-lock" className="text-xs font-bold text-slate-300 cursor-pointer">
                Enforce Pacing Lock
              </label>
              <input
                type="checkbox"
                id="teacher-pacing-lock"
                checked={pacingLock}
                onChange={(e) => setPacingLock(e.target.checked)}
                className="w-4 h-4 text-indigo-500 rounded border-slate-700 bg-slate-900 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="teacher-max-unit" className="text-xs font-bold text-slate-300">
                Class Progress Focus:
              </label>
              <select
                id="teacher-max-unit"
                value={pacingMaxUnit}
                onChange={(e) => setPacingMaxUnit(parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="1">Unit 1: Number Properties</option>
                <option value="2">Unit 2: Fractions &amp; Decimals</option>
                <option value="3">Unit 3: Rational Numbers</option>
                <option value="4">Unit 4: Expressions</option>
                <option value="5">Unit 5: Equations</option>
              </select>
            </div>

            {pacingLock && (
              <div className="bg-indigo-950/40 border border-indigo-900/60 p-3.5 rounded-xl text-[10px] text-indigo-300 leading-relaxed flex gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0" />
                <p>
                  <span className="font-bold block">Pacing Lock is Active</span>
                  All platform accounts matching role 'student' are restricted to units 1 through {pacingMaxUnit}. Remaining units appear locked on the 3D map.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Charts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main completion Bar Chart */}
          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl shadow-xl">
            <h3 className="font-bold text-xs text-slate-300 uppercase tracking-widest mb-4">Class Curriculum Progress Spectrum</h3>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockClassData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                  <Bar dataKey="completed" name="Fully Completed" stackId="a" fill="#10b981" />
                  <Bar dataKey="inProgress" name="Currently Working" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="locked" name="Locked/Enforced" stackId="a" fill="#334155" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart Grade spreads */}
            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <h3 className="font-bold text-xs text-slate-300 uppercase tracking-widest mb-4">Grade Distribution Summary</h3>
              <div className="h-[200px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeSpread}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {gradeSpread.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Legend */}
                <div className="space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-[10px] text-slate-300 shrink-0">
                  {gradeSpread.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}: {item.value} students</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Over Time Line/Area Chart */}
            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl shadow-xl">
              <h3 className="font-bold text-xs text-slate-300 uppercase tracking-widest mb-4">Class Accuracy Average Timeline</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockTimeline}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[70, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Area type="monotone" dataKey="averageScore" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" name="Class Average" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
