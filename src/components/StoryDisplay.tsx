import React, { useEffect, useRef, useState } from 'react';
import { Languages, Loader, AlertCircle, Brain, Volume2, X } from 'lucide-react';
import { Story, DialogueLine } from '../types';
import { WordTooltip } from './WordTooltip';
import { SpeechPractice } from './SpeechPractice';
import { VocabularyQuizModal } from './VocabularyQuizModal';
import { translateText, fallbackTranslation, isTranslationConfigured, batchTranslateText } from '../lib/translation';

interface StoryDisplayProps {
  story: Story;
  highlightedSentenceId?: string;
  vocabularyMode?: boolean;
}

interface ClickedWord {
  text: string;
  originalText: string; // Keep original with punctuation for display
  translation?: string;
  emoji: string;
  clickCount: number;
}

export function StoryDisplay({ story, highlightedSentenceId, vocabularyMode = false }: StoryDisplayProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentenceRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [practiceLineId, setPracticeLineId] = useState<string | null>(null);
  const [translatedSentences, setTranslatedSentences] = useState<{ [key: string]: string }>({});
  const [loadingTranslations, setLoadingTranslations] = useState<{ [key: string]: boolean }>({});
  const [clickedWords, setClickedWords] = useState<ClickedWord[]>([]);
  const [loadingVocabulary, setLoadingVocabulary] = useState(false);
  const [showVocabularyQuiz, setShowVocabularyQuiz] = useState(false);

  // Clear clicked words when vocabulary mode is turned off
  useEffect(() => {
    if (!vocabularyMode) {
      setClickedWords([]);
    }
  }, [vocabularyMode]);

  const handleWordClick = async (word: { text: string; translation: string; emoji: string }) => {
    if (!vocabularyMode) return;

    const cleanText = word.text.replace(/[.,!?;:]/g, '');
    
    // Skip very short words and common articles
    if (cleanText.length <= 2 || 
        ['der', 'die', 'das', 'und', 'ist', 'sind', 'haben', 'sie', 'ich', 'wir', 'ein', 'eine', 'einen'].includes(cleanText.toLowerCase())) {
      return;
    }

    setClickedWords(prev => {
      const existingIndex = prev.findIndex(w => w.text.toLowerCase() === cleanText.toLowerCase());
      
      if (existingIndex >= 0) {
        // Word already exists, increment click count
        const updated = [...prev];
        updated[existingIndex].clickCount++;
        return updated;
      } else {
        // New word, add to list
        const newWord: ClickedWord = {
          text: cleanText,
          originalText: word.text,
          translation: word.translation,
          emoji: word.emoji,
          clickCount: 1
        };
        return [...prev, newWord];
      }
    });
  };

  const removeWordFromList = (wordText: string) => {
    setClickedWords(prev => prev.filter(w => w.text !== wordText));
  };

  const startVocabularyQuiz = () => {
    if (clickedWords.length === 0) return;
    setShowVocabularyQuiz(true);
  };

  const generateAITranslations = async () => {
    if (!isTranslationConfigured() || clickedWords.length === 0) return;

    setLoadingVocabulary(true);
    
    try {
      const textsToTranslate = clickedWords.map(word => word.text);
      const translationResults = await batchTranslateText(textsToTranslate, 'de', 'en');
      
      setClickedWords(prev => prev.map((word, index) => ({
        ...word,
        translation: translationResults[index].success 
          ? translationResults[index].translatedText! 
          : word.translation
      })));
    } catch (error) {
      console.error('Error generating AI translations:', error);
    } finally {
      setLoadingVocabulary(false);
    }
  };

  const playWordPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'de-DE';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Visibility checking function
  function ensureSentenceVisible(container: HTMLDivElement, sentenceElement: HTMLDivElement) {
    const containerHeight = container.clientHeight;
    const containerScrollTop = container.scrollTop;
    const containerBottom = containerScrollTop + containerHeight;

    const sentenceTop = sentenceElement.offsetTop;
    const sentenceHeight = sentenceElement.offsetHeight;
    const sentenceBottom = sentenceTop + sentenceHeight;

    // Check if sentence is fully visible
    const isFullyVisible = sentenceTop >= containerScrollTop && sentenceBottom <= containerBottom;

    if (!isFullyVisible) {
      if (sentenceTop < containerScrollTop) {
        // Sentence is above visible area — scroll up
        container.scrollTop = sentenceTop;
      } else if (sentenceBottom > containerBottom) {
        // Sentence is below visible area — scroll down
        container.scrollTop = sentenceBottom - containerHeight;
      }
    }
  }

  // Smart scroll - only scroll when sentence is not fully visible
  useEffect(() => {
    if (highlightedSentenceId && sentenceRefs.current[highlightedSentenceId] && scrollContainerRef.current) {
      const sentenceElement = sentenceRefs.current[highlightedSentenceId];
      const container = scrollContainerRef.current;
      
      if (sentenceElement && container) {
        // Use smooth scrolling by temporarily storing the target position
        const containerHeight = container.clientHeight;
        const containerScrollTop = container.scrollTop;
        const containerBottom = containerScrollTop + containerHeight;

        const sentenceTop = sentenceElement.offsetTop;
        const sentenceHeight = sentenceElement.offsetHeight;
        const sentenceBottom = sentenceTop + sentenceHeight;

        // Check if sentence is fully visible
        const isFullyVisible = sentenceTop >= containerScrollTop && sentenceBottom <= containerBottom;

        if (!isFullyVisible) {
          let targetScrollTop;
          
          if (sentenceTop < containerScrollTop) {
            // Sentence is above visible area — scroll up
            targetScrollTop = sentenceTop;
          } else if (sentenceBottom > containerBottom) {
            // Sentence is below visible area — scroll down
            targetScrollTop = sentenceBottom - containerHeight;
          }

          if (targetScrollTop !== undefined) {
            container.scrollTo({
              top: targetScrollTop,
              behavior: 'smooth'
            });
          }
        }
      }
    }
  }, [highlightedSentenceId]);

  // Set ref for each sentence
  const setSentenceRef = (lineId: string) => (el: HTMLDivElement | null) => {
    sentenceRefs.current[lineId] = el;
  };

  const handleSpeechPractice = (lineId: string) => {
    setPracticeLineId(lineId);
  };

  const handleTranslateSentence = async (line: DialogueLine) => {
    // If translation already exists, toggle it off
    if (translatedSentences[line.id]) {
      setTranslatedSentences(prev => {
        const newState = { ...prev };
        delete newState[line.id];
        return newState;
      });
      return;
    }

    // Set loading state
    setLoadingTranslations(prev => ({ ...prev, [line.id]: true }));

    // If the line already has a translation property, use it
    if (line.translation && line.translation !== line.text) {
      setTranslatedSentences(prev => ({
        ...prev,
        [line.id]: line.translation
      }));
      setLoadingTranslations(prev => ({ ...prev, [line.id]: false }));
      return;
    }

    try {
      // Try to get proper translation using OpenRouter AI
      const result = await translateText(line.text, 'de', 'en');
      
      let finalTranslation: string;
      
      if (result.success && result.translatedText) {
        finalTranslation = result.translatedText;
      } else {
        // Fallback to word-by-word translation
        console.warn('AI translation failed, using fallback:', result.error);
        finalTranslation = fallbackTranslation(line.words);
      }
      
      setTranslatedSentences(prev => ({
        ...prev,
        [line.id]: finalTranslation
      }));
    } catch (error) {
      console.error('Translation error:', error);
      // Use fallback translation
      const fallbackText = fallbackTranslation(line.words);
      setTranslatedSentences(prev => ({
        ...prev,
        [line.id]: fallbackText
      }));
    } finally {
      setLoadingTranslations(prev => ({ ...prev, [line.id]: false }));
    }
  };

  const closeSpeechPractice = () => {
    setPracticeLineId(null);
  };

  const practiceDialogueLine = story.dialogue.find(line => line.id === practiceLineId);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">{story.title}</h2>
          <p className="text-blue-100 text-sm">
            {story.language.flag} {story.language.name} • {story.situation.title}
          </p>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="p-6 max-h-96 overflow-y-auto custom-scrollbar"
        >
          <div className="space-y-4">
            {story.dialogue.map((line: DialogueLine, index: number) => (
              <div
                key={line.id}
                ref={setSentenceRef(line.id)}
                className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div className="flex flex-col gap-2 max-w-xs lg:max-w-md">
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 ${
                      highlightedSentenceId === line.id
                        ? 'ring-4 ring-green-400 ring-opacity-60 shadow-xl transform scale-105 bg-green-50 border-2 border-green-300'
                        : ''
                    } ${
                      index % 2 === 0
                        ? highlightedSentenceId === line.id
                          ? 'bg-green-50 text-gray-800 rounded-bl-sm border-green-300'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        : highlightedSentenceId === line.id
                          ? 'bg-green-600 text-white rounded-br-sm border-green-300'
                          : 'bg-blue-600 text-white rounded-br-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{line.character.avatar}</span>
                      <span className={`text-xs font-medium ${
                        highlightedSentenceId === line.id
                          ? index % 2 === 0 
                            ? 'text-green-700'
                            : 'text-green-100'
                          : 'opacity-75'
                      }`}>
                        {line.character.name} ({line.character.role})
                      </span>
                      {highlightedSentenceId === line.id && (
                        <div className="flex items-center gap-1 ml-auto">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className={`text-xs font-bold ${
                            index % 2 === 0 ? 'text-green-700' : 'text-green-100'
                          }`}>
                            🔊 Playing
                          </span>
                        </div>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      highlightedSentenceId === line.id
                        ? index % 2 === 0
                          ? 'text-green-800 font-medium'
                          : 'text-white font-medium'
                        : ''
                    }`}>
                      {line.words.map((word, wordIndex) => (
                        <React.Fragment key={wordIndex}>
                          <WordTooltip 
                            word={word} 
                            storyId={story.id} 
                            vocabularyMode={vocabularyMode}
                            onWordClick={handleWordClick}
                          >
                            {word.text}
                          </WordTooltip>
                          {wordIndex < line.words.length - 1 && ' '}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                  
                  {/* Translation Display */}
                  {translatedSentences[line.id] && (
                    <div className={`self-${index % 2 === 0 ? 'start' : 'end'} mt-2 px-4 py-2 rounded-xl text-sm italic ${
                      index % 2 === 0
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-green-100 text-green-800 border border-green-300'
                    }`}>
                      💬 {translatedSentences[line.id]}
                    </div>
                  )}
                  
                  {/* Translate Button */}
                  <button
                    onClick={() => handleTranslateSentence(line)}
                    disabled={loadingTranslations[line.id]}
                    className={`self-${index % 2 === 0 ? 'start' : 'end'} flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5 ${
                      index % 2 === 0
                        ? translatedSentences[line.id] 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : loadingTranslations[line.id]
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : translatedSentences[line.id]
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : loadingTranslations[line.id]
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {loadingTranslations[line.id] ? (
                      <>
                        <Loader className="h-3 w-3 animate-spin" />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Languages className="h-3 w-3" />
                        {translatedSentences[line.id] 
                          ? '🔒 Hide Translation' 
                          : isTranslationConfigured() 
                            ? '🤖 AI Translate' 
                            : '🌍 Translate'
                        }
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Clicked Words Vocabulary List */}
      {vocabularyMode && clickedWords.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Brain className="h-6 w-6" />
                  Your Vocabulary List
                </h3>
                <p className="text-purple-100 text-sm">
                  {clickedWords.length} word{clickedWords.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              {isTranslationConfigured() && (
                <button
                  onClick={generateAITranslations}
                  disabled={loadingVocabulary}
                  className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-4 py-2 rounded-xl font-medium hover:bg-opacity-30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingVocabulary ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      🤖 AI Translate All
                    </>
                  )}
                </button>
              )}
              <button
                onClick={startVocabularyQuiz}
                disabled={clickedWords.length === 0}
                className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-4 py-2 rounded-xl font-medium hover:bg-opacity-30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🧠 Start Quiz ({clickedWords.length})
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clickedWords.map((word, index) => (
                <div
                  key={`${word.text}-${index}`}
                  className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200 hover:bg-purple-100 transition-colors duration-200 group"
                >
                  <span className="text-2xl">{word.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{word.text}</div>
                    <div className="text-sm text-gray-600 truncate">
                      {word.translation || 'Click AI Translate for better translation'}
                    </div>
                    {word.clickCount > 1 && (
                      <div className="text-xs text-purple-600 font-medium">
                        Clicked {word.clickCount}x
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => playWordPronunciation(word.text)}
                      className="p-2 text-purple-600 hover:bg-purple-200 rounded-lg transition-colors duration-200"
                      title="Play pronunciation"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeWordFromList(word.text)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
                      title="Remove from list"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Translation Configuration Notice */}
      {vocabularyMode && clickedWords.length > 0 && !isTranslationConfigured() && (
        <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-800">AI Translation Disabled</span>
          </div>
          <p className="text-sm text-amber-700">
            Add your OpenRouter API key to enable AI-powered vocabulary translations. Using basic word translations for now.
          </p>
        </div>
      )}

      {/* Vocabulary Quiz Modal */}
      {showVocabularyQuiz && (
        <VocabularyQuizModal
          words={clickedWords.map(word => ({
            text: word.text,
            translation: word.translation || word.text,
            emoji: word.emoji
          }))}
          storyId={story.id}
          onClose={() => setShowVocabularyQuiz(false)}
        />
      )}

      {/* Speech Practice Modal */}
      {practiceLineId && practiceDialogueLine && (
        <SpeechPractice
          line={practiceDialogueLine}
          onClose={closeSpeechPractice}
        />
      )}
    </>
  );
}