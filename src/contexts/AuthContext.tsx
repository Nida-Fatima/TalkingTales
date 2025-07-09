import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, getSupabaseStatus } from '../lib/supabase';
import { UserProfile } from '../types/database';

// Helper function to clear all Supabase auth tokens
const clearAllAuthTokens = () => {
  try {
    // Clear the generic supabase auth token
    localStorage.removeItem('supabase.auth.token');
    
    // Clear project-specific tokens (format: sb-<project-ref>-auth-token)
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        localStorage.removeItem(key);
      }
    });
    
    // Also clear any other supabase-related items
    keys.forEach(key => {
      if (key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('All Supabase auth tokens cleared from localStorage');
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
};

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check if Supabase is properly configured
        const supabaseConfigured = getSupabaseStatus();
        const envVarsPresent = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
        
        console.log('Auth initialization - Supabase configured:', supabaseConfigured, 'Env vars present:', envVarsPresent);
        
        if (!envVarsPresent || !supabaseConfigured) {
          console.log('Running in demo mode');
          if (mounted) {
            setIsDemoMode(true);
            setUser(null);
            setSession(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        setIsDemoMode(false);
        console.log('Production mode - initializing Supabase auth');

        // Get initial session with error handling
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            
            // Handle refresh token errors by clearing all tokens
            if (error.message.includes('refresh_token_not_found') || 
                error.message.includes('Invalid Refresh Token')) {
              console.warn('Invalid refresh token detected, clearing all auth tokens');
              clearAllAuthTokens();
              
              // Try to get session again after clearing tokens
              try {
                const { data: { session: cleanSession }, error: cleanError } = await supabase.auth.getSession();
                if (cleanError) {
                  console.error('Error after token cleanup:', cleanError);
                  if (cleanError.message.includes('email_provider_disabled')) {
                    console.warn('Email provider disabled, switching to demo mode');
                    if (mounted) {
                      setIsDemoMode(true);
                      setUser(null);
                      setSession(null);
                      setProfile(null);
                      setLoading(false);
                    }
                    return;
                  }
                } else {
                  console.log('Session retrieved successfully after token cleanup:', cleanSession);
                  if (mounted) {
                    setSession(cleanSession);
                    setUser(cleanSession?.user ?? null);
                    
                    if (cleanSession?.user) {
                      await fetchUserProfile(cleanSession.user.id);
                    } else {
                      setLoading(false);
                    }
                  }
                  return;
                }
              } catch (cleanupError) {
                console.error('Error during token cleanup retry:', cleanupError);
              }
            }
            
            // Handle other auth errors
            if (error.message.includes('email_provider_disabled')) {
              console.warn('Email provider disabled, switching to demo mode');
              if (mounted) {
                setIsDemoMode(true);
                setUser(null);
                setSession(null);
                setProfile(null);
                setLoading(false);
              }
              return;
            }
          }
          
          console.log('Initial session:', session);
          
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              await fetchUserProfile(session.user.id);
            } else {
              console.log('No session found, setting loading to false');
              setLoading(false);
            }
          }
        } catch (sessionError) {
          console.error('Session retrieval failed:', sessionError);
          if (mounted) {
            setIsDemoMode(true);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        if (mounted) {
          setIsDemoMode(true);
          setLoading(false);
        }
      }
    };

    // Initialize immediately
    initializeAuth();

    // Listen for auth changes only if not in demo mode
    let subscription: any = null;
    
    // Delay subscription setup to allow demo mode detection
    setTimeout(() => {
      if (!isDemoMode && getSupabaseStatus()) {
        try {
          const {
            data: { subscription: authSubscription },
          } = supabase.auth.onAuthStateChange(async (event, session) => {
            try {
              console.log('Auth state change:', event, session);
              
              if (!mounted) return;
              
              // Handle token refresh errors in auth state changes
              if (event === 'TOKEN_REFRESHED' && !session) {
                console.warn('Token refresh failed, clearing auth tokens');
                clearAllAuthTokens();
              }
              
              setSession(session);
              setUser(session?.user ?? null);
              
              if (session?.user) {
                await fetchUserProfile(session.user.id);
              } else {
                setProfile(null);
                console.log('Auth state change: no user, setting loading to false');
                setLoading(false);
              }
            } catch (error) {
              console.error('Error in auth state change:', error);
              if (mounted) {
                console.log('Auth state change error, setting loading to false');
                setLoading(false);
              }
            }
          });
          
          subscription = authSubscription;
        } catch (error) {
          console.error('Failed to set up auth subscription:', error);
        }
      }
    }, 100);

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      if (isDemoMode) {
        setProfile(null);
        setLoading(false);
        return;
      }

      console.log('Fetching user profile for ID:', userId);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        if (error.code === '42P01' || error.code === 'DEMO_MODE') {
          // Table doesn't exist yet, this is expected on first run
          console.warn('Database not configured - running in demo mode');
          setProfile(null);
        } else {
          console.error('Error fetching user profile:', error);
          
          // If user profile doesn't exist, try to create it
          if (error.code === 'PGRST116' || !data) {
            console.log('User profile not found, attempting to create one');
            await createMissingUserProfile(userId);
            return; // Return early, createMissingUserProfile will handle setting loading to false
          }
        }
      } else {
        console.log('User profile fetched successfully:', data);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      console.log('fetchUserProfile completed, setting loading to false');
      setLoading(false);
    }
  };

  const createMissingUserProfile = async (userId: string) => {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (authUser.user && authUser.user.id === userId) {
        console.log('Creating missing user profile for:', authUser.user.email);
        
        const { error } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: authUser.user.email!,
            username: authUser.user.email!.split('@')[0], // Use email prefix as username
            target_languages: ['de'],
          });

        if (error) {
          console.error('Error creating missing user profile:', error);
        } else {
          console.log('Missing user profile created successfully');
          // Fetch the profile again
          await fetchUserProfile(userId);
          return; // Return early since fetchUserProfile will handle loading state
        }
      }
    } catch (error) {
      console.error('Error in createMissingUserProfile:', error);
    } finally {
      console.log('createMissingUserProfile completed, setting loading to false');
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    if (isDemoMode) {
      return { error: { message: 'Demo mode - Supabase not configured' } as AuthError };
    }

    try {
      console.log('Starting sign up process for:', email, username);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Auth sign up error:', error);
        
        // Handle specific Supabase configuration errors
        if (error.message.includes('email_provider_disabled') || 
            error.message.includes('Email signups are disabled')) {
          return { 
            error: { 
              ...error, 
              message: 'Email signups are disabled in your Supabase project. Please enable email authentication in your Supabase dashboard under Authentication > Providers.' 
            } as AuthError 
          };
        }
        
        return { error };
      }

      console.log('Auth sign up successful:', data);

      if (data.user) {
        console.log('Creating user profile for user ID:', data.user.id);
        
        // Create user profile - wait for it to complete
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            username,
            target_languages: ['de'], // Default to German
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // If profile creation fails, we should still return the auth error as null
          // since the user was created successfully in auth
          return { error: null };
        } else {
          console.log('User profile created successfully');
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (isDemoMode) {
      return { error: { message: 'Demo mode - Supabase not configured' } as AuthError };
    }

    try {
      // Clear any existing corrupted tokens before attempting sign in
      clearAllAuthTokens();
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error && (error.message.includes('refresh_token_not_found') || 
                   error.message.includes('Invalid Refresh Token'))) {
        console.warn('Refresh token error during sign in, clearing all tokens');
        clearAllAuthTokens();
        return { error: { ...error, message: 'Session expired. Please try signing in again.' } as AuthError };
      }
      
      return { error };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    if (isDemoMode) {
      return;
    }
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      // Always clear all tokens after sign out, regardless of success/failure
      clearAllAuthTokens();
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || isDemoMode) {
      return { error: new Error('No user logged in or demo mode') };
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        return { error };
      }

      // Refresh profile
      await fetchUserProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isDemoMode,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}