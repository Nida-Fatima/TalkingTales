import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthScreen } from './AuthScreen';
import { LoadingSpinner } from '../LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('AuthGuard - user:', user, 'loading:', loading, 'isDemoMode:', isDemoMode);

  // Show loading spinner while initializing
  if (loading) {
    console.log('Still loading, showing spinner');
    return <LoadingSpinner />;
  }

  // In demo mode, always show the main app (skip authentication entirely)
  if (isDemoMode) {
    console.log('Demo mode - showing main app without authentication');
    return <>{children}</>;
  }

  // If not in demo mode and no user, show auth screen
  if (!user) {
    console.log('Production mode - no user found, showing AuthScreen');
    return <AuthScreen />;
  }

  console.log('Production mode - user found, showing main app');
  return <>{children}</>;
}