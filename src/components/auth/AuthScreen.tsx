import React, { useState } from 'react';
import { Eye, EyeOff, Languages, Mail, User, Lock, AlertCircle, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp, isDemoMode } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateUsername = (username: string) => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!isLogin && !validateUsername(username)) {
      setError('Username must be at least 3 characters and contain only letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    console.log('Form submission started:', { isLogin, email, username });

    try {
      if (isLogin) {
        console.log('Attempting sign in...');
        const { error } = await signIn(email, password);
        if (error) {
          console.error('Sign in error:', error);
          // Handle specific email confirmation error
          if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
            setError('Your email address has not been confirmed. Please check your inbox for a verification link and click it to verify your account before signing in.');
          } else if (error.message.includes('Session expired')) {
            setError('Your session has expired. Please try signing in again.');
          } else {
            setError(error.message);
          }
        } else {
          console.log('Sign in successful');
        }
      } else {
        console.log('Attempting sign up...');
        const { error } = await signUp(email, password, username);
        if (error) {
          console.error('Sign up error:', error);
          setError(error.message);
        } else {
          console.log('Sign up successful');
          setError(null);
          // Show success message for sign up
          setError('Account created successfully! Please check your email to verify your account.');
        }
      }
    } catch (error) {
      console.error('Unexpected error in handleSubmit:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      console.log('Form submission completed');
    }
  };

  const handleDemoMode = () => {
    // In demo mode, just reload to continue
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-600">⚠️</span>
              <span className="font-medium text-amber-800">Demo Mode</span>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              Supabase is not properly configured. The app is running in demo mode with limited functionality.
            </p>
            <div className="text-xs text-amber-600 space-y-1">
              <p><strong>To enable full features:</strong></p>
              <p>1. Set up a Supabase project</p>
              <p>2. Enable email authentication in Supabase dashboard</p>
              <p>3. Configure environment variables</p>
            </div>
          </div>
        )}

        {/* Supabase Configuration Error Notice */}
        {!isDemoMode && error && error.includes('Email signups are disabled') && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Supabase Configuration Required</span>
            </div>
            <p className="text-sm text-red-700 mb-3">
              Email authentication is not enabled in your Supabase project.
            </p>
            <div className="text-xs text-red-600 space-y-1">
              <p><strong>To fix this:</strong></p>
              <p>1. Go to your Supabase dashboard</p>
              <p>2. Navigate to Authentication → Providers</p>
              <p>3. Enable the "Email" provider</p>
              <p>4. Configure email templates if needed</p>
            </div>
          </div>
        )}

        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
              <Languages className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Learn German</h1>
              <p className="text-sm text-gray-600">Learn German Interactively</p>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {isDemoMode ? 'Demo Mode' : isLogin ? 'Welcome back!' : 'Join the community'}
          </h2>
          <p className="text-gray-600">
            {isDemoMode 
              ? 'Experience the app with limited functionality'
              : isLogin 
              ? 'Sign in to continue your German learning journey' 
              : 'Create an account to start learning German'
            }
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {isDemoMode ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Continue exploring the app in demo mode, or configure Supabase for full functionality.
              </p>
              <button
                onClick={handleDemoMode}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Continue in Demo Mode
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Username Field (Sign Up Only) */}
              {!isLogin && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    At least 3 characters, letters, numbers, and underscores only
                  </p>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {!isLogin && (
                  <p className="text-xs text-gray-500 mt-1">
                    At least 6 characters
                  </p>
                )}
              </div>

              {/* Error Message */}
              {error && !error.includes('Email signups are disabled') && (
                <div className={`p-4 rounded-xl border-2 ${
                  error.includes('successfully') 
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>
          )}

          {/* Toggle Auth Mode */}
          {!isDemoMode && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setEmail('');
                    setPassword('');
                    setUsername('');
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            {isDemoMode ? 'Preview features:' : 'Join thousands learning German with:'}
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-lg">🗣️</span>
              <span>Speech Practice</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <span>Interactive Stories</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <span>Smart Quizzes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}