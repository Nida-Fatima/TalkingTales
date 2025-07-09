import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, RotateCcw, CheckCircle, AlertCircle, Loader, SkipForward, X } from 'lucide-react';
import { DialogueLine } from '../types';

interface SpeechPracticeProps {
  line: DialogueLine;
  onClose: () => void;
  isPracticingAll?: boolean;
  currentIndex?: number;
  totalSentences?: number;
  onSkip?: () => void;
  onEndPractice?: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function SpeechPractice({ 
  line, 
  onClose, 
  isPracticingAll = false, 
  currentIndex = 0, 
  totalSentences = 1,
  onSkip,
  onEndPractice
}: SpeechPracticeProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'partial' | null;
    message: string;
    details?: string[];
  }>({ type: null, message: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'de-DE'; // German language

    recognition.onstart = () => {
      setIsListening(true);
      setIsProcessing(false);
      setFeedback({ type: null, message: '' });
      
      // Set a timeout to stop listening after 10 seconds
      timeoutRef.current = setTimeout(() => {
        recognition.stop();
      }, 10000);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[0];
      if (result.isFinal) {
        const spokenText = result[0].transcript;
        setTranscript(spokenText);
        setIsProcessing(true);
        
        // Process the speech after a short delay to show the transcript
        setTimeout(() => {
          processSpeech(spokenText, line.text);
        }, 500);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      setIsProcessing(false);
      
      let errorMessage = 'Speech recognition error occurred.';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not accessible. Please check permissions.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
      }
      
      setFeedback({
        type: 'error',
        message: errorMessage
      });
    };

    recognitionRef.current = recognition;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [line.text]);

  // Simple similarity calculation
  const calculateSimilarity = (spoken: string, target: string): number => {
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[.,!?;:]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const spokenNorm = normalizeText(spoken);
    const targetNorm = normalizeText(target);

    if (spokenNorm === targetNorm) return 1;

    // Calculate word-level similarity
    const spokenWords = spokenNorm.split(' ');
    const targetWords = targetNorm.split(' ');
    
    let matches = 0;
    const maxLength = Math.max(spokenWords.length, targetWords.length);
    
    // Count matching words (order-independent)
    for (const spokenWord of spokenWords) {
      if (targetWords.includes(spokenWord)) {
        matches++;
      }
    }
    
    return matches / maxLength;
  };

  // Find missing and incorrect words
  const analyzeWords = (spoken: string, target: string) => {
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[.,!?;:]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const spokenWords = normalizeText(spoken).split(' ');
    const targetWords = normalizeText(target).split(' ');
    
    const missing = targetWords.filter(word => !spokenWords.includes(word));
    const extra = spokenWords.filter(word => !targetWords.includes(word));
    
    return { missing, extra };
  };

  const processSpeech = (spokenText: string, targetText: string) => {
    const similarity = calculateSimilarity(spokenText, targetText);
    const { missing, extra } = analyzeWords(spokenText, targetText);
    
    setIsProcessing(false);

    if (similarity >= 0.8) {
      setFeedback({
        type: 'success',
        message: 'Excellent! Perfect pronunciation! 🎉'
      });
    } else if (similarity >= 0.6) {
      const details = [];
      if (missing.length > 0) {
        details.push(`Missing words: ${missing.join(', ')}`);
      }
      if (extra.length > 0) {
        details.push(`Extra words: ${extra.join(', ')}`);
      }
      
      setFeedback({
        type: 'partial',
        message: 'Good effort! Almost there! 👍',
        details
      });
    } else {
      const details = [];
      if (missing.length > 0) {
        details.push(`Missing words: ${missing.join(', ')}`);
      }
      if (extra.length > 0) {
        details.push(`Extra words: ${extra.join(', ')}`);
      }
      
      setFeedback({
        type: 'error',
        message: 'Keep practicing! Try again. 💪',
        details
      });
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setFeedback({ type: null, message: '' });
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const playOriginal = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const resetPractice = () => {
    setTranscript('');
    setFeedback({ type: null, message: '' });
    setIsProcessing(false);
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleNext = () => {
    // Auto-advance after successful practice or manual next
    if (feedback.type === 'success' || feedback.type === 'partial') {
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      onClose();
    }
  };

  if (!isSupported) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <MicOff className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Speech Recognition Not Supported
            </h3>
            <p className="text-gray-600 mb-4">
              Your browser doesn't support speech recognition. Please try using Chrome, Edge, or Safari.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Mic className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">Speech Practice</h3>
            {isPracticingAll && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-sm font-medium">
                {currentIndex + 1}/{totalSentences}
              </span>
            )}
          </div>
          <button
            onClick={isPracticingAll ? onEndPractice : onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar for Multiple Sentences */}
        {isPracticingAll && totalSentences > 1 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Progress:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / totalSentences) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">
                {currentIndex + 1}/{totalSentences}
              </span>
            </div>
          </div>
        )}

        {/* Character Info */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
          <span className="text-2xl">{line.character.avatar}</span>
          <div>
            <div className="font-medium text-gray-800">{line.character.name}</div>
            <div className="text-sm text-gray-600">{line.character.role}</div>
          </div>
        </div>

        {/* Target Sentence */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Practice this sentence:
          </label>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-lg text-blue-900 font-medium">{line.text}</p>
          </div>
          <button
            onClick={playOriginal}
            className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
          >
            <Volume2 className="h-4 w-4" />
            Listen to pronunciation
          </button>
        </div>

        {/* Microphone Controls */}
        <div className="text-center mb-6">
          {!isListening && !isProcessing ? (
            <button
              onClick={startListening}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Mic className="h-6 w-6" />
              Start Speaking
            </button>
          ) : isListening ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 bg-red-500 text-white px-8 py-4 rounded-2xl font-semibold">
                <Mic className="h-6 w-6 animate-pulse" />
                Listening...
              </div>
              <button
                onClick={stopListening}
                className="block mx-auto text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200"
              >
                Stop Listening
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-3 bg-blue-500 text-white px-8 py-4 rounded-2xl font-semibold">
              <Loader className="h-6 w-6 animate-spin" />
              Processing...
            </div>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What you said:
            </label>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-800">{transcript}</p>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback.type && (
          <div className="mb-6">
            <div className={`p-4 rounded-xl border-2 ${
              feedback.type === 'success' 
                ? 'bg-green-50 border-green-200' 
                : feedback.type === 'partial'
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {feedback.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <span className={`font-medium ${
                  feedback.type === 'success' 
                    ? 'text-green-800' 
                    : feedback.type === 'partial'
                    ? 'text-yellow-800'
                    : 'text-red-800'
                }`}>
                  {feedback.message}
                </span>
              </div>
              {feedback.details && feedback.details.length > 0 && (
                <div className="space-y-1">
                  {feedback.details.map((detail, index) => (
                    <p key={index} className={`text-sm ${
                      feedback.type === 'success' 
                        ? 'text-green-700' 
                        : feedback.type === 'partial'
                        ? 'text-yellow-700'
                        : 'text-red-700'
                    }`}>
                      {detail}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={resetPractice}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          
          {isPracticingAll && onSkip && (
            <button
              onClick={onSkip}
              className="flex-1 flex items-center justify-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-3 rounded-xl font-medium hover:bg-yellow-200 transition-colors duration-200"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </button>
          )}
          
          <button
            onClick={handleNext}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            {isPracticingAll && currentIndex < totalSentences - 1 ? 'Next' : 'Done'}
          </button>
        </div>

        {/* Internet Notice */}
        <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-700 text-center">
            ⚠️ Speech recognition requires an internet connection
          </p>
        </div>
      </div>
    </div>
  );
}