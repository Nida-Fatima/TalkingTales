import React from 'react';
import { Word } from '../types';
import { useCloudVocabulary } from '../contexts/CloudVocabularyContext';

interface WordTooltipProps {
  word: Word;
  children: React.ReactNode;
  storyId?: string;
  vocabularyMode?: boolean;
  onWordClick?: (word: { text: string; translation: string; emoji: string }) => void;
}

export function WordTooltip({ 
  word, 
  children, 
  storyId, 
  vocabularyMode = false, 
  onWordClick 
}: WordTooltipProps) {
  const { addEncounteredWord } = useCloudVocabulary();

  const handleWordClick = async () => {
    if (!vocabularyMode) return;
    
    // Add word to cloud vocabulary for tracking
    await addEncounteredWord({
      text: word.text.replace(/[.,!?;:]/g, ''), // Remove punctuation
      translation: word.translation,
      emoji: word.emoji
    }, storyId);

    // Call the parent's word click handler
    if (onWordClick) {
      onWordClick({
        text: word.text,
        translation: word.translation,
        emoji: word.emoji
      });
    }
  };

  return (
    <span
      className={vocabularyMode ? "cursor-pointer hover:bg-purple-100 hover:text-purple-800 px-1 py-0.5 rounded transition-all duration-200 select-none" : ""}
      onClick={handleWordClick}
    >
      {children}
    </span>
  );
}