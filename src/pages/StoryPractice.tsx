import React, { useState } from 'react';
import { Languages, Sparkles, Loader } from 'lucide-react';
import { Language, Situation, Story } from '../types';
import { defaultLanguage } from '../data/languages';
import { SituationSelector } from '../components/SituationSelector';
import { StoryDisplay } from '../components/StoryDisplay';
import { PracticeButtons } from '../components/PracticeButtons';
import { generateStory } from '../utils/storyGenerator';
import { useCloudStories } from '../contexts/CloudStoriesContext';

export function StoryPractice() {
  const [selectedLanguage] = useState<Language>(defaultLanguage);
  const [selectedSituation, setSelectedSituation] = useState<Situation | null>(null);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [highlightedSentenceId, setHighlightedSentenceId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [vocabularyMode, setVocabularyMode] = useState(false);
  const [storyOptions, setStoryOptions] = useState({
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    length: 'medium' as 'short' | 'medium' | 'long',
    useAI: true
  });
  
  const { savedStories, addStory, removeStory } = useCloudStories();

  const handleGenerateStory = async () => {
    if (selectedSituation) {
      setIsGenerating(true);
      try {
        const story = await generateStory(selectedLanguage, selectedSituation, storyOptions);
        setCurrentStory(story);
        setHighlightedSentenceId(null);
      } catch (error) {
        console.error('Failed to generate story:', error);
        // You could add a toast notification here
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleSaveToggle = async () => {
    if (!currentStory) return;

    try {
      if (currentStory.isSaved) {
        console.log('Removing story from saved stories');
        await removeStory(currentStory.id);
        setCurrentStory({ ...currentStory, isSaved: false });
      } else {
        console.log('Adding story to saved stories');
        const savedStory = { ...currentStory, isSaved: true };
        await addStory(savedStory);
        setCurrentStory(savedStory);
      }
    } catch (error) {
      console.error('Failed to toggle story save status:', error);
      // Reset the story state on error
      if (currentStory.isSaved) {
        setCurrentStory({ ...currentStory, isSaved: true });
      } else {
        setCurrentStory({ ...currentStory, isSaved: false });
      }
    }
  };

  const handleSentenceHighlight = (sentenceId: string | null) => {
    setHighlightedSentenceId(sentenceId);
  };

  const handleVocabularyModeToggle = () => {
    setVocabularyMode(!vocabularyMode);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
            <Languages className="h-8 w-8 text-white" />
          </div>
          Interactive Stories
        </h1>
        <p className="text-gray-600">
          Generate interactive dialogues and practice with real-life situations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-800">Create Your Story</h2>
            </div>
            
            <div className="space-y-6">
              <SituationSelector
                selectedSituation={selectedSituation}
                onSituationChange={setSelectedSituation}
                onOptionsChange={setStoryOptions}
              />
              
              {selectedSituation && (
                <button
                  onClick={handleGenerateStory}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      Generating Story...
                    </div>
                  ) : (
                    <>✨ Generate German Story</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Story Display */}
        <div className="lg:col-span-2 space-y-6">
          {currentStory ? (
            <>
              <StoryDisplay 
                story={currentStory} 
                highlightedSentenceId={highlightedSentenceId}
                vocabularyMode={vocabularyMode}
              />
              <PracticeButtons
                story={currentStory}
                onSaveToggle={handleSaveToggle}
                onSentenceHighlight={handleSentenceHighlight}
                vocabularyMode={vocabularyMode}
                onVocabularyModeToggle={handleVocabularyModeToggle}
              />
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                  <Languages className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Bereit zum Deutschlernen?</h3>
                <p className="text-gray-600 max-w-md">
                  Choose a situation to generate an interactive German dialogue story. 
                  Click on any word to see English translations and practice with our tools!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}