import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// TODO: * Get environment variables - support both VITE_ and REACT_APP_ prefixes
const supabaseUrl = process.env.VITE_SUPABASE_URL || 
                    process.env.REACT_APP_SUPABASE_URL ||
                    'https://cbyvpuqisqmepubzrwuo.supabase.co';
                    
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 
                        process.env.REACT_APP_SUPABASE_ANON_KEY ||
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieXZwdXFpc3FtZXB1Ynpyd3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjEyNDgsImV4cCI6MjA3MTg5NzI0OH0.aRvZRU-iU52M9N85NJc7BrmpiBF776-GcKlYblIWzF4';

if (!supabaseUrl) throw new Error('Missing Supabase URL');
if (!supabaseAnonKey) throw new Error('Missing Supabase Anon Key');

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});