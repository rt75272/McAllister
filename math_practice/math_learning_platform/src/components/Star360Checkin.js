/**
 * FERPA-Compliant Star 360 Diagnostic Check-In Component.
 *
 * Allows students to confirm and record completion of Renaissance Star 360
 * diagnostic benchmark assessments (BOY, MOY, EOY) and claim quest reward coins.
 */

import React, { useState, useEffect } from 'react';
import { supabase, isRealSupabase } from '../auth/supabaseClient.js';
import { Calendar, CheckSquare, Sparkles, Coins, ClipboardCheck, Loader2 } from 'lucide-react';

export default function Star360Checkin({ studentSession, unitId, onActionComplete }) {
  const [period, setPeriod] = useState('BOY'); // BOY, MOY, EOY.
  const [completedToday, setCompletedToday] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [claimedPeriods, setClaimedPeriods] = useState([]);

  // Fetch already claimed diagnostic periods from DB.
  useEffect(() => {
    const fetchClaims = async () => {
      if (!studentSession) return;
      
      if (isRealSupabase) {
        try {
          const { data, error } = await supabase
            .from('star360_claims')
            .select('test_period')
            .eq('student_id', studentSession.id);

          if (!error && data) {
            setClaimedPeriods(data.map(c => c.test_period));
          }
        } catch (err) {
          console.warn('Error fetching Star 360 claims:', err);
        }
      } else {
        // Mock Mode: Fetch from localStorage.
        const cacheKey = `mock_star360_claims_${studentSession.id}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setClaimedPeriods(JSON.parse(cached));
        }
      }
    };

    fetchClaims();
  }, [studentSession]);

  const handleClaimPoints = async (e) => {
    e.preventDefault();
    if (!completedToday) {
      setErrorMessage('Please confirm that you have completed your assessment today.');
      return;
    }

    if (claimedPeriods.includes(period)) {
      setErrorMessage(`You have already claimed your 5 points for the ${period} (Middle of Year / diagnostic) session.`);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const updatedClaimedPeriods = [...claimedPeriods, period];

      if (isRealSupabase) {
        // 1. Record the claim
        const { error: claimError } = await supabase
          .from('star360_claims')
          .insert([{
            student_id: studentSession.id,
            test_period: period,
            claimed_at: new Date().toISOString()
          }]);

        if (claimError) throw claimError;

        // 2. Increment points on student profile
        const { error: updateError } = await supabase.rpc('increment_points', {
          student_row_id: studentSession.id,
          points_to_add: 5
        });

        if (updateError) {
          // Fallback if rpc is not configured
          const { error: profileError } = await supabase
            .from('students')
            .update({ total_points: (studentSession.total_points || 0) + 5 })
            .eq('id', studentSession.id);
          
          if (profileError) throw profileError;
        }
      } else {
        // Mock Mode persistence
        const cacheKey = `mock_star360_claims_${studentSession.id}`;
        localStorage.setItem(cacheKey, JSON.stringify(updatedClaimedPeriods));
        
        // Update local session
        const updatedSession = {
          ...studentSession,
          total_points: (studentSession.total_points || 0) + 5
        };
        localStorage.setItem('student_math_session', JSON.stringify(updatedSession));
      }

      setClaimedPeriods(updatedClaimedPeriods);
      setSuccessMessage(`Success! 5 points added to your account for completing ${period} Star 360 assessment!`);
      
      // Notify parent to update scoreboards
      if (onActionComplete) {
        onActionComplete(5);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-6 text-slate-100">
      
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="w-10 h-10 bg-indigo-950 border border-indigo-800 text-indigo-400 rounded-xl flex items-center justify-center">
          <ClipboardCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-slate-100">Star 360 Check-In Gateway</h3>
          <p className="text-[10px] text-slate-400">Claim your educational check-in score bonus</p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-950/40 border border-emerald-800/80 p-3.5 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-950/40 border border-rose-800/80 p-3.5 rounded-xl text-xs text-rose-300 font-bold">
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handleClaimPoints} className="space-y-5">
        
        {/* Test Period Selection */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
            Select Test Period
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {['BOY', 'MOY', 'EOY'].map((tPeriod) => {
              const isClaimed = claimedPeriods.includes(tPeriod);
              return (
                <label
                  key={tPeriod}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border cursor-pointer transition ${
                    isClaimed
                      ? 'bg-slate-950 border-slate-900 opacity-50 cursor-not-allowed'
                      : period === tPeriod
                      ? 'bg-indigo-950/30 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="testPeriod"
                    value={tPeriod}
                    disabled={isClaimed}
                    checked={period === tPeriod}
                    onChange={() => {
                      setPeriod(tPeriod);
                      setErrorMessage('');
                    }}
                    className="sr-only"
                  />
                  <span className="font-extrabold text-xs tracking-wider">{tPeriod}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">
                    {tPeriod === 'BOY' ? 'Beginning' : tPeriod === 'MOY' ? 'Middle' : 'End'}
                  </span>
                  {isClaimed && (
                    <span className="text-[8px] font-bold text-emerald-500 mt-1 uppercase">Claimed</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Verification Checkbox */}
        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={completedToday}
              onChange={(e) => {
                setCompletedToday(e.target.checked);
                setErrorMessage('');
              }}
              className="w-5 h-5 text-indigo-600 rounded border-slate-800 bg-slate-900 focus:ring-indigo-500 cursor-pointer mt-0.5"
            />
            <div className="text-xs text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-300 block mb-0.5">Integrity Affirmation</span>
              I completed my district Star 360 mathematical diagnostic today with my school advisor.
            </div>
          </label>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || claimedPeriods.includes(period)}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl text-xs transition shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Claim 5 Points <Coins className="w-4 h-4 text-yellow-400" />
            </>
          )}
        </button>

      </form>

    </div>
  );
}
