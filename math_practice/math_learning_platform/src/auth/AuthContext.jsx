/**
 * Authentication Context and Session Provider.
 *
 * Manages user login, registration, role profiles (student vs. teacher),
 * and automatic fallback to mock authentication when running offline.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isRealSupabase } from './supabaseClient.js';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isRealSupabase) {
      // Mock environment setup.
      const cachedUser = localStorage.getItem('mock_user');
      const cachedProfile = localStorage.getItem('mock_profile');
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
        setProfile(cachedProfile ? JSON.parse(cachedProfile) : { role: 'student', full_name: 'Guest Student', grade: 6 });
      }
      setLoading(false);
      return;
    }

    // Real Supabase Auth listeners.
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.warn('Error fetching real user profile, creating standard default:', err.message);
      setProfile({ role: 'student', full_name: 'Math Ranger', grade: 6 });
    }
  };

  const signIn = async (email, password) => {
    if (!isRealSupabase) {
      // Simulate login
      const mockUser = { id: 'mock-123', email };
      let mockProfile = { role: 'student', full_name: 'Guest Ranger', grade: 6 };
      
      if (email.toLowerCase().includes('teacher')) {
        mockProfile = { role: 'teacher', full_name: 'Mrs. McAllister', grade: 6 };
      }
      
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      localStorage.setItem('mock_profile', JSON.stringify(mockProfile));
      return { data: { user: mockUser }, error: null };
    }

    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email, password, role = 'student') => {
    if (!isRealSupabase) {
      // Simulate signup
      const mockUser = { id: 'mock-123', email };
      const mockProfile = { role, full_name: role === 'teacher' ? 'Mrs. McAllister' : 'New Math Ranger', grade: 6 };
      setUser(mockUser);
      setProfile(mockProfile);
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      localStorage.setItem('mock_profile', JSON.stringify(mockProfile));
      return { data: { user: mockUser }, error: null };
    }

    const result = await supabase.auth.signUp({ email, password });
    if (result.error) return result;

    // Create a row in profiles table automatically
    if (result.data.user) {
      await supabase.from('profiles').insert([
        {
          id: result.data.user.id,
          role: role,
          full_name: email.split('@')[0],
          grade: 6,
          coins: 15,
          completed_lessons: []
        }
      ]);
    }
    return result;
  };

  const signOut = async () => {
    if (!isRealSupabase) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('mock_user');
      localStorage.removeItem('mock_profile');
      return { error: null };
    }

    return await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
