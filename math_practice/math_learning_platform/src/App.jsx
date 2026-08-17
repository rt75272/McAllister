/**
 * Math Learning Platform Main App Component.
 *
 * Provides view routing between student quest view, 3D interactive map,
 * and teacher pacing dashboard with Supabase user authentication.
 */

import React, { useState } from 'react';
import { useAuth } from './auth/AuthContext.jsx';
import QuestMap3D from './gameEngine/QuestMap3D.jsx';
import MapUI from './components/MapUI.jsx';
import PacingDashboard from './teacher/PacingDashboard.jsx';
import { Shield, GraduationCap, Map, Users, LogOut, Loader2 } from 'lucide-react';

function App() {
  const { user, profile, loading, signIn, signUp, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('student'); // 'student' | 'teacher'.
  const [selectedUnit, setSelectedUnit] = useState(null); // Zoomed-in unit selection.
  const [selectedTopic, setSelectedTopic] = useState(null); // Active minigame selection.
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

  if (loading) {
    return (
      <div className="min-height-screen flex flex-col items-center justify-center gap-4 text-slate-200">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="font-semibold text-lg tracking-wide">Initializing Learning Center...</p>
      </div>
    );
  }

  // Authentication screen.
  if (!user) {
    const handleSubmit = async (e) => {
      e.preventDefault();
      setAuthError('');
      try {
        if (isSignUp) {
          const { error } = await signUp(authEmail, authPassword, 'student');
          if (error) throw error;
          alert('Registration successful! Please check your email or log in.');
        } else {
          const { error } = await signIn(authEmail, authPassword);
          if (error) throw error;
        }
      } catch (err) {
        setAuthError(err.message || 'Authentication failed.');
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg mb-3">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-400 to-indigo-400">
              Mrs. McAllister's
            </h1>
            <p className="text-sm font-semibold text-slate-400 mt-1">Grade 6 Math Quest Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="student@school.edu"
                className="w-full bg-slate-950/60 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/60 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {authError && (
              <p className="text-xs font-bold text-rose-400 text-center">{authError}</p>
            )}

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-sm transition duration-150 shadow-md">
              {isSignUp ? 'Create Student Account' : 'Enter Learning Quest'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Screen
  const isTeacher = profile?.role === 'teacher' || authEmail.includes('teacher');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Platform Navigation Header */}
      <header className="bg-slate-900/80 border-b border-slate-800/80 backdrop-blur px-6 py-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🗺️</span>
          <div>
            <h1 className="text-lg font-bold text-slate-100 leading-tight">3D Educational Math Quest</h1>
            <p className="text-[10px] text-slate-400 font-medium">Logged in as {profile?.full_name || user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isTeacher && (
            <div className="flex bg-slate-950 rounded-lg border border-slate-800 p-0.5">
              <button
                onClick={() => setCurrentView('student')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  currentView === 'student' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5" /> Map View
              </button>
              <button
                onClick={() => setCurrentView('teacher')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  currentView === 'teacher' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" /> Teacher Panel
              </button>
            </div>
          )}

          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Areas */}
      <main className="flex-1 relative flex flex-col min-h-0">
        {currentView === 'student' ? (
          <div className="absolute inset-0 flex flex-col lg:flex-row">
            {/* The 3D Canvas viewport */}
            <div className="flex-1 h-2/3 lg:h-full relative overflow-hidden bg-[#020617]">
              <QuestMap3D
                selectedUnit={selectedUnit}
                setSelectedUnit={setSelectedUnit}
                setSelectedTopic={setSelectedTopic}
              />
            </div>

            {/* Float Overlay or Right-Hand Control Center */}
            <div className="lg:w-[420px] bg-slate-950/90 border-t lg:border-t-0 lg:border-l border-slate-800/80 p-6 flex flex-col justify-between overflow-y-auto z-10 backdrop-blur-md">
              <MapUI
                selectedUnit={selectedUnit}
                setSelectedUnit={setSelectedUnit}
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
            <PacingDashboard />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
