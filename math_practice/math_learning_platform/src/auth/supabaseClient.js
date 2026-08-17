/**
 * Supabase Client Configuration.
 *
 * Configures and exports the Supabase client instance using environment credentials
 * or safe mock defaults for offline development.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mockproject.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vY2twcm9qZWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjAyNzg0MDAsImV4cCI6MjAzNTg1NDQwMH0.mock-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to determine if we are running with a real configured Supabase instance.
export const isRealSupabase = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
