import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Languages, Home, BookOpen, Star, Brain, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Navigation() {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/practice', icon: BookOpen, label: 'Practice' },
    { path: '/stories', icon: Star, label: 'Saved Stories' },
    { path: '/vocabulary', icon: Brain, label: 'Vocabulary' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Languages className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Learn German</h1>
              <p className="text-xs text-gray-600">Learn German Interactively</p>
            </div>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:block">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {/* Language Indicator */}
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl">
              <span className="text-xl">🇩🇪</span>
              <span className="font-semibold text-blue-800 text-sm">German</span>
            </div>

            {/* User Profile */}
            {user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-800 text-sm">
                    {profile?.username || user.email?.split('@')[0]}
                  </span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:block text-sm">Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}