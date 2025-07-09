import React from 'react';
import { Languages } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 mx-auto w-fit">
            <Languages className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl animate-ping opacity-20"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Learn German with Stories</h2>
        <p className="text-gray-600">Loading your learning experience...</p>
        <div className="mt-4 flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}