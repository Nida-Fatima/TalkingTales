import React, { useState } from 'react';
import { ChevronDown, Plus, Sparkles, Settings } from 'lucide-react';
import { Situation } from '../types';
import { predefinedSituations } from '../data/situations';
import { checkOpenRouterConfig } from '../lib/openrouter';

interface SituationSelectorProps {
  selectedSituation: Situation | null;
  onSituationChange: (situation: Situation) => void;
  onOptionsChange?: (options: { difficulty: string; length: string; useAI: boolean }) => void;
}

export function SituationSelector({ selectedSituation, onSituationChange, onOptionsChange }: SituationSelectorProps) {
  const [customSituation, setCustomSituation] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [useAI, setUseAI] = useState(true);
  
  const isOpenRouterConfigured = checkOpenRouterConfig();

  const handlePredefinedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const situation = predefinedSituations.find(s => s.id === e.target.value);
    if (situation) {
      onSituationChange(situation);
      setIsCustomMode(false);
      updateOptions();
    }
  };

  const handleCustomSubmit = () => {
    if (customSituation.trim()) {
      const customSit: Situation = {
        id: `custom-${Date.now()}`,
        title: customSituation.trim(),
        description: 'Custom situation'
      };
      onSituationChange(customSit);
      updateOptions();
    }
  };
  
  const updateOptions = () => {
    onOptionsChange?.({
      difficulty,
      length,
      useAI: useAI && isOpenRouterConfigured
    });
  };
  
  React.useEffect(() => {
    updateOptions();
  }, [difficulty, length, useAI]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Choose a situation to practice
      </label>
      
      {/* AI Configuration Notice */}
      {!isOpenRouterConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-800">AI Story Generation Disabled</span>
          </div>
          <p className="text-sm text-amber-700">
            Add your OpenRouter API key to enable custom AI-generated stories. Using predefined templates for now.
          </p>
        </div>
      )}
      
      {!isCustomMode ? (
        <div className="space-y-3">
          <div className="relative">
            <select
              value={selectedSituation?.id || ''}
              onChange={handlePredefinedChange}
              className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-400"
            >
              <option value="">Select a situation...</option>
              {predefinedSituations.map((situation) => (
                <option key={situation.id} value={situation.id}>
                  {situation.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
          
          <button
            onClick={() => setIsCustomMode(true)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 group"
          >
            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            <Sparkles className="h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform duration-200" />
            Create custom situation {isOpenRouterConfigured && '(AI-powered)'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={customSituation}
              onChange={(e) => setCustomSituation(e.target.value)}
              placeholder="Describe your situation (e.g., 'Buying medicine at a pharmacy')"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCustomSubmit}
              disabled={!customSituation.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {isOpenRouterConfigured && <Sparkles className="h-4 w-4" />}
              Create Story
            </button>
            <button
              onClick={() => setIsCustomMode(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Advanced Options */}
      {(selectedSituation || isCustomMode) && (
        <div className="space-y-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors duration-200"
          >
            <Settings className="h-4 w-4" />
            Advanced Options
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>
          
          {showAdvanced && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-4 border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="beginner">🟢 Beginner</option>
                    <option value="intermediate">🟡 Intermediate</option>
                    <option value="advanced">🔴 Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Length
                  </label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="short">📝 Short (8-10 exchanges)</option>
                    <option value="medium">📄 Medium (12-15 exchanges)</option>
                    <option value="long">📚 Long (18-20 exchanges)</option>
                  </select>
                </div>
              </div>
              
              {isOpenRouterConfigured && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="useAI"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="useAI" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Use AI for custom stories (recommended)
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {selectedSituation && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            {selectedSituation.id.startsWith('custom-') && isOpenRouterConfigured && (
              <Sparkles className="h-5 w-5 text-purple-600" />
            )}
            <h3 className="font-semibold text-blue-900">{selectedSituation.title}</h3>
          </div>
          <p className="text-blue-700 text-sm">{selectedSituation.description}</p>
          {selectedSituation.id.startsWith('custom-') && isOpenRouterConfigured && (
            <p className="text-purple-600 text-xs mt-1 font-medium">
              ✨ This will be generated using AI for a unique experience
            </p>
          )}
        </div>
      )}
    </div>
  );
}