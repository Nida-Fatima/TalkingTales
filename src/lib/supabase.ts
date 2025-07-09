import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any;
let isSupabaseConfigured = false;

// Test if Supabase is properly configured
const testSupabaseConnection = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }
  
  try {
    const testClient = createClient(supabaseUrl, supabaseAnonKey);
    // Try a simple operation to test if Supabase is working
    const { error } = await testClient.auth.getSession();
    
    // If we get specific auth errors, Supabase is not properly configured
    if (error && (
      error.message.includes('Invalid API key') ||
      error.message.includes('Project not found') ||
      error.message.includes('refresh_token_not_found')
    )) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Supabase connection test failed:', error);
    return false;
  }
};

// Create mock client for demo mode
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: (callback: any) => {
      // Call callback immediately with no session
      setTimeout(() => callback('SIGNED_OUT', null), 100);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: () => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: { message: 'Demo mode - Supabase not configured' } 
    }),
    signUp: () => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: { message: 'Demo mode - Supabase not configured' } 
    }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: () => Promise.resolve({ data: null, error: { code: 'DEMO_MODE' } }),
        single: () => Promise.resolve({ data: null, error: { code: 'DEMO_MODE' } })
      }),
      order: () => Promise.resolve({ data: [], error: null }),
      limit: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => Promise.resolve({ error: { message: 'Demo mode - Supabase not configured' } }),
    update: () => ({
      eq: () => Promise.resolve({ error: { message: 'Demo mode - Supabase not configured' } })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: { message: 'Demo mode - Supabase not configured' } })
    }),
    upsert: () => Promise.resolve({ error: { message: 'Demo mode - Supabase not configured' } })
  })
});

// Initialize Supabase client
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Running in demo mode.');
  supabase = createMockClient();
  isSupabaseConfigured = false;
} else {
  try {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'supabase.auth.token',
        flowType: 'pkce'
      }
    });
    
    // Test the connection
    testSupabaseConnection().then(isConfigured => {
      isSupabaseConfigured = isConfigured;
      if (!isConfigured) {
        console.warn('Supabase is not properly configured. Switching to demo mode.');
        // Clear any existing auth tokens that might be causing issues
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token');
      }
    });
    
    isSupabaseConfigured = true; // Assume true initially, will be updated by test
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabase = createMockClient();
    isSupabaseConfigured = false;
  }
}

// Export a function to check if Supabase is configured
export const getSupabaseStatus = () => isSupabaseConfigured;

export { supabase };