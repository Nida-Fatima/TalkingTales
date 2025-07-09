import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, Brain, Star, StarOff, BookOpen, VolumeX, Pause, Play, FileText } from 'lucide-react';
import { Story } from '../types';
import { SpeechPractice } from './SpeechPractice';
import { QuizModal } from './QuizModal';

interface PracticeButtonsProps {
  story: Story;
  onSaveToggle: () => void;
  onSentenceHighlight?: (sentenceId: string | null) => void;
  vocabularyMode: boolean;
  onVocabularyModeToggle: () => void;
}

export function PracticeButtons({ story, onSaveToggle, onSentenceHighlight, vocabularyMode, onVocabularyModeToggle }: PracticeButtonsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [practiceLineId, setPracticeLineId] = useState<string | null>(null);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [isPracticingAll, setIsPracticingAll] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Use refs to track the current state during async operations
  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(0);

  // Check for speech synthesis support and get available voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const updateVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    updateVoices();
    speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Sync refs with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Find the best German voice
  const getGermanVoice = (): SpeechSynthesisVoice | null => {
    const germanVoices = availableVoices.filter(voice => 
      voice.lang.startsWith('de') || voice.lang.includes('German')
    );
    
    if (germanVoices.length > 0) {
      return germanVoices.find(voice => voice.name.toLowerCase().includes('female')) || 
             germanVoices.find(voice => voice.name.toLowerCase().includes('anna')) ||
             germanVoices.find(voice => voice.name.toLowerCase().includes('petra')) ||
             germanVoices[0];
    }
    
    return null;
  };

  const speakSentence = (text: string, index: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Check if we should stop before speaking
      if (!isPlayingRef.current) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const germanVoice = getGermanVoice();
      
      if (germanVoice) {
        utterance.voice = germanVoice;
      }
      
      utterance.lang = 'de-DE';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        if (isPlayingRef.current) {
          setCurrentIndex(index);
          onSentenceHighlight?.(story.dialogue[index].id);
        }
      };

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        // Handle interruption as expected behavior, not an error
        if (event.error === 'interrupted') {
          console.warn('Speech synthesis interrupted (expected behavior)');
          resolve(); // Resolve instead of reject for interruptions
        } else {
          console.error('Speech synthesis error:', event);
          reject(event);
        }
      };

      speechSynthesis.speak(utterance);
    });
  };

  const playDialogue = async () => {
    if (!isSupported) return;

    // Cancel any existing speech
    speechSynthesis.cancel();
    
    setIsPlaying(true);
    setIsPaused(false);
    isPlayingRef.current = true;

    try {
      const startIndex = currentIndexRef.current;
      
      for (let i = startIndex; i < story.dialogue.length; i++) {
        // Check if we should stop
        if (!isPlayingRef.current) {
          break;
        }

        await speakSentence(story.dialogue[i].text, i);
        
        // Add longer pause between sentences (800ms) if not the last sentence
        if (i < story.dialogue.length - 1 && isPlayingRef.current) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }
    } catch (error) {
      console.error('Error playing dialogue:', error);
    } finally {
      // Reset everything when done
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentIndex(0);
      isPlayingRef.current = false;
      currentIndexRef.current = 0;
      onSentenceHighlight?.(null);
    }
  };

  const stopDialogue = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentIndex(0);
    isPlayingRef.current = false;
    currentIndexRef.current = 0;
    onSentenceHighlight?.(null);
  };

  const pauseDialogue = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeDialogue = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const handleListen = () => {
    if (!isPlaying) {
      playDialogue();
    } else if (isPaused) {
      resumeDialogue();
    } else {
      pauseDialogue();
    }
  };

  const handleSpeak = () => {
    // Start speech practice with the first sentence
    if (story.dialogue.length > 0) {
      setCurrentPracticeIndex(0);
      setPracticeLineId(story.dialogue[0].id);
      setIsPracticingAll(true);
    }
  };

  const handleSpeechPracticeClose = () => {
    if (isPracticingAll && currentPracticeIndex < story.dialogue.length - 1) {
      // Move to next sentence
      const nextIndex = currentPracticeIndex + 1;
      setCurrentPracticeIndex(nextIndex);
      setPracticeLineId(story.dialogue[nextIndex].id);
    } else {
      // End practice session
      setPracticeLineId(null);
      setIsPracticingAll(false);
      setCurrentPracticeIndex(0);
    }
  };

  const handleSkipSentence = () => {
    if (isPracticingAll && currentPracticeIndex < story.dialogue.length - 1) {
      const nextIndex = currentPracticeIndex + 1;
      setCurrentPracticeIndex(nextIndex);
      setPracticeLineId(story.dialogue[nextIndex].id);
    } else {
      // End practice session
      setPracticeLineId(null);
      setIsPracticingAll(false);
      setCurrentPracticeIndex(0);
    }
  };

  const handleEndPractice = () => {
    setPracticeLineId(null);
    setIsPracticingAll(false);
    setCurrentPracticeIndex(0);
  };

  const handleQuiz = () => {
    setShowQuiz(true);
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  const practiceDialogueLine = story.dialogue.find(line => line.id === practiceLineId);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Practice Tools
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            onClick={handleListen}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              isPlaying
                ? isPaused
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-green-500 bg-green-50 text-green-700'
                : isSupported
                  ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!isSupported}
          >
            {!isSupported ? (
              <VolumeX className="h-6 w-6" />
            ) : isPlaying ? (
              isPaused ? (
                <Play className="h-6 w-6" />
              ) : (
                <Pause className="h-6 w-6 animate-pulse" />
              )
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
            <span className="text-sm font-medium">
              {!isSupported 
                ? 'Not Available'
                : isPlaying 
                  ? isPaused 
                    ? 'Resume'
                    : 'Pause'
                  : '🔊 Listen'
              }
            </span>
            {isPlaying && (
              <span className="text-xs text-gray-600">
                {currentIndex + 1}/{story.dialogue.length}
              </span>
            )}
          </button>

          {isPlaying && (
            <button
              onClick={stopDialogue}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-700 transition-all duration-200"
            >
              <Volume2 className="h-6 w-6" />
              <span className="text-sm font-medium">Stop</span>
            </button>
          )}

          <button
            onClick={handleSpeak}
            disabled={isPracticingAll}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              isPracticingAll
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
            }`}
          >
            <Mic className={`h-6 w-6 ${isPracticingAll ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">
              {isPracticingAll ? 'Practicing...' : '🎤 Speak'}
            </span>
            {isPracticingAll && (
              <span className="text-xs text-gray-600">
                {currentPracticeIndex + 1}/{story.dialogue.length}
              </span>
            )}
          </button>

          <button
            onClick={handleQuiz}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 transition-all duration-200"
          >
            <FileText className="h-6 w-6" />
            <span className="text-sm font-medium">📝 Quiz</span>
          </button>

          <button
            onClick={onVocabularyModeToggle}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              vocabularyMode
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
            }`}
          >
            <Brain className="h-6 w-6" />
            <span className="text-sm font-medium">🧠 Vocab</span>
          </button>

          <button
            onClick={onSaveToggle}
            disabled={!story || !story.id}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              story.isSaved
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
            } ${
              !story || !story.id ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {story.isSaved ? (
              <Star className="h-6 w-6 fill-current" />
            ) : (
              <StarOff className="h-6 w-6" />
            )}
            <span className="text-sm font-medium">
              {story.isSaved ? '⭐ Saved' : '⭐ Save'}
            </span>
          </button>
        </div>
        
        {vocabularyMode && (
          <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Vocabulary Mode Active
            </h4>
            <p className="text-sm text-purple-700">
              Click on any word in the dialogue to add it to your vocabulary list. When you're done selecting words, use the "AI Translate All" button for better translations.
            </p>
          </div>
        )}

        {isPracticingAll && (
          <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Speech Practice Mode Active</h4>
            <p className="text-sm text-green-700 mb-3">
              Practice speaking each sentence in the dialogue. You're currently on sentence {currentPracticeIndex + 1} of {story.dialogue.length}.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleSkipSentence}
                className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg hover:bg-yellow-200 transition-colors duration-200"
              >
                Skip This Sentence
              </button>
              <button
                onClick={handleEndPractice}
                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors duration-200"
              >
                End Practice
              </button>
            </div>
          </div>
        )}

        {!isSupported && (
          <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <h4 className="font-medium text-amber-800 mb-2">Audio Not Supported</h4>
            <p className="text-sm text-amber-700">
              Speech synthesis not supported in your browser. Try using Chrome, Firefox, or Safari.
            </p>
          </div>
        )}

        {isSupported && availableVoices.length > 0 && !getGermanVoice() && (
          <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <h4 className="font-medium text-amber-800 mb-2">German Voice Not Available</h4>
            <p className="text-sm text-amber-700">
              Using default voice. For the best experience, try using Chrome or install German language support.
            </p>
          </div>
        )}

        {isPlaying && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Progress:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / story.dialogue.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">
                {currentIndex + 1}/{story.dialogue.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Speech Practice Modal */}
      {practiceLineId && practiceDialogueLine && (
        <SpeechPractice
          line={practiceDialogueLine}
          onClose={handleSpeechPracticeClose}
          isPracticingAll={isPracticingAll}
          currentIndex={currentPracticeIndex}
          totalSentences={story.dialogue.length}
          onSkip={handleSkipSentence}
          onEndPractice={handleEndPractice}
        />
      )}

      {/* Quiz Modal */}
      {showQuiz && (
        <QuizModal
          story={story}
          onClose={handleCloseQuiz}
        />
      )}
    </>
  );
}