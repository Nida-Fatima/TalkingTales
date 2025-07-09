import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Word } from '../types';
import { LearnedWord, VocabularyEncounter } from '../types/database';

interface CloudLearnedWord extends Word {
  learnedAt: string;
  storyId: string;
  timesCorrect: number;
  timesIncorrect: number;
  lastReviewed?: string;
}

interface CloudVocabularyWord extends Word {
  firstSeenAt: string;
  timesEncountered: number;
  storyId?: string;
}

interface CloudVocabularyContextType {
  learnedWords: CloudLearnedWord[];
  vocabulary: CloudVocabularyWord[];
  loading: boolean;
  markWordAsLearned: (word: Word, storyId: string) => Promise<void>;
  markWordAsIncorrect: (wordText: string) => Promise<void>;
  addEncounteredWord: (word: Word, storyId?: string) => Promise<void>;
  getTotalWordsLearned: () => number;
  getRecentWords: (days: number) => CloudLearnedWord[];
  getMilestoneProgress: () => { current: number; nextMilestone: number };
  getRandomWordsForReview: (count: number) => CloudLearnedWord[];
  syncWithLocal: (localLearned: any[], localVocab: any[]) => Promise<void>;
}

const CloudVocabularyContext = createContext<CloudVocabularyContextType | undefined>(undefined);

const MILESTONES = [10, 25, 50, 100, 200, 500, 1000];

export function CloudVocabularyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [learnedWords, setLearnedWords] = useState<CloudLearnedWord[]>([]);
  const [vocabulary, setVocabulary] = useState<CloudVocabularyWord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadVocabularyFromCloud();
    } else {
      setLearnedWords([]);
      setVocabulary([]);
    }
  }, [user]);

  const loadVocabularyFromCloud = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load learned words
      const { data: learnedData, error: learnedError } = await supabase
        .from('learned_words')
        .select('*')
        .eq('user_id', user.id)
        .order('learned_at', { ascending: false });

      if (learnedError) {
        if (learnedError.code === '42P01') {
          console.warn('Learned words table not found - using empty array');
          setLearnedWords([]);
        } else {
          console.error('Error loading learned words:', learnedError);
        }
      } else {
        const learned: CloudLearnedWord[] = learnedData.map(transformCloudLearnedWord);
        setLearnedWords(learned);
      }

      // Load vocabulary encounters
      const { data: vocabData, error: vocabError } = await supabase
        .from('vocabulary_encounters')
        .select('*')
        .eq('user_id', user.id)
        .order('first_seen_at', { ascending: false });

      if (vocabError) {
        if (vocabError.code === '42P01') {
          console.warn('Vocabulary encounters table not found - using empty array');
          setVocabulary([]);
        } else {
          console.error('Error loading vocabulary:', vocabError);
        }
      } else {
        const vocab: CloudVocabularyWord[] = vocabData.map(transformCloudVocabularyWord);
        setVocabulary(vocab);
      }
    } catch (error) {
      console.error('Error loading vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  const transformCloudLearnedWord = (cloudWord: LearnedWord): CloudLearnedWord => {
    return {
      text: cloudWord.word,
      translation: cloudWord.translation,
      emoji: cloudWord.emoji,
      learnedAt: cloudWord.learned_at,
      storyId: cloudWord.story_id,
      timesCorrect: cloudWord.times_correct,
      timesIncorrect: cloudWord.times_incorrect,
      lastReviewed: cloudWord.last_reviewed || undefined,
    };
  };

  const transformCloudVocabularyWord = (cloudWord: VocabularyEncounter): CloudVocabularyWord => {
    return {
      text: cloudWord.word,
      translation: cloudWord.translation,
      emoji: cloudWord.emoji,
      firstSeenAt: cloudWord.first_seen_at,
      timesEncountered: cloudWord.times_encountered,
      storyId: cloudWord.story_id || undefined,
    };
  };

  const markWordAsLearned = async (word: Word, storyId: string) => {
    if (!user) return;

    try {
      const existingWord = learnedWords.find(w => w.text.toLowerCase() === word.text.toLowerCase());

      if (existingWord) {
        // Update existing word
        const { error } = await supabase
          .from('learned_words')
          .update({
            times_correct: existingWord.timesCorrect + 1,
            last_reviewed: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('word', word.text);

        if (error) {
          console.error('Error updating learned word:', error);
          return;
        }

        setLearnedWords(prev =>
          prev.map(w =>
            w.text.toLowerCase() === word.text.toLowerCase()
              ? { ...w, timesCorrect: w.timesCorrect + 1, lastReviewed: new Date().toISOString() }
              : w
          )
        );
      } else {
        // Add new word
        const { error } = await supabase
          .from('learned_words')
          .insert({
            user_id: user.id,
            word: word.text,
            translation: word.translation,
            emoji: word.emoji,
            language: 'de',
            story_id: storyId,
            times_correct: 1,
            times_incorrect: 0,
          });

        if (error) {
          console.error('Error adding learned word:', error);
          return;
        }

        const newWord: CloudLearnedWord = {
          ...word,
          learnedAt: new Date().toISOString(),
          storyId,
          timesCorrect: 1,
          timesIncorrect: 0,
        };

        setLearnedWords(prev => [newWord, ...prev]);
      }
    } catch (error) {
      console.error('Error marking word as learned:', error);
    }
  };

  const markWordAsIncorrect = async (wordText: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('learned_words')
        .update({
          times_incorrect: supabase.sql`times_incorrect + 1`,
          last_reviewed: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('word', wordText);

      if (error) {
        console.error('Error marking word as incorrect:', error);
        return;
      }

      setLearnedWords(prev =>
        prev.map(word =>
          word.text.toLowerCase() === wordText.toLowerCase()
            ? { ...word, timesIncorrect: word.timesIncorrect + 1, lastReviewed: new Date().toISOString() }
            : word
        )
      );
    } catch (error) {
      console.error('Error marking word as incorrect:', error);
    }
  };

  const addEncounteredWord = async (word: Word, storyId?: string) => {
    if (!user) return;

    // Clean the word text
    const cleanText = word.text.replace(/[.,!?;:]/g, '');
    
    // Skip very short words and common articles
    if (cleanText.length <= 2 || 
        ['der', 'die', 'das', 'und', 'ist', 'sind', 'haben', 'sie', 'ich', 'wir', 'ein', 'eine', 'einen'].includes(cleanText.toLowerCase())) {
      return;
    }

    try {
      const existingWord = vocabulary.find(w => w.text.toLowerCase() === cleanText.toLowerCase());

      if (existingWord) {
        // Update existing word
        const { error } = await supabase
          .from('vocabulary_encounters')
          .update({
            times_encountered: existingWord.timesEncountered + 1,
            last_seen_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .eq('word', cleanText);

        if (error) {
          console.error('Error updating vocabulary word:', error);
          return;
        }

        setVocabulary(prev =>
          prev.map(w =>
            w.text.toLowerCase() === cleanText.toLowerCase()
              ? { ...w, timesEncountered: w.timesEncountered + 1 }
              : w
          )
        );
      } else {
        // Add new word
        const { error } = await supabase
          .from('vocabulary_encounters')
          .insert({
            user_id: user.id,
            word: cleanText,
            translation: word.translation,
            emoji: word.emoji,
            language: 'de',
            story_id: storyId || null,
            times_encountered: 1,
          });

        if (error) {
          console.error('Error adding vocabulary word:', error);
          return;
        }

        const newWord: CloudVocabularyWord = {
          text: cleanText,
          translation: word.translation,
          emoji: word.emoji,
          firstSeenAt: new Date().toISOString(),
          timesEncountered: 1,
          storyId,
        };

        setVocabulary(prev => [newWord, ...prev]);
      }
    } catch (error) {
      console.error('Error adding encountered word:', error);
    }
  };

  const getTotalWordsLearned = () => learnedWords.length;

  const getRecentWords = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return learnedWords.filter(word => 
      new Date(word.learnedAt) > cutoffDate
    );
  };

  const getMilestoneProgress = () => {
    const current = learnedWords.length;
    const nextMilestone = MILESTONES.find(m => m > current) || MILESTONES[MILESTONES.length - 1];
    
    return { current, nextMilestone };
  };

  const getRandomWordsForReview = (count: number) => {
    const shuffled = [...learnedWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const syncWithLocal = async (localLearned: any[], localVocab: any[]) => {
    if (!user) return;

    try {
      // Sync learned words
      for (const word of localLearned) {
        const exists = learnedWords.find(w => w.text === word.text);
        if (!exists) {
          await markWordAsLearned(word, word.storyId || 'local');
        }
      }

      // Sync vocabulary encounters
      for (const word of localVocab) {
        const exists = vocabulary.find(w => w.text === word.text);
        if (!exists) {
          await addEncounteredWord(word, word.storyId);
        }
      }
    } catch (error) {
      console.error('Error syncing vocabulary:', error);
    }
  };

  return (
    <CloudVocabularyContext.Provider value={{
      learnedWords,
      vocabulary,
      loading,
      markWordAsLearned,
      markWordAsIncorrect,
      addEncounteredWord,
      getTotalWordsLearned,
      getRecentWords,
      getMilestoneProgress,
      getRandomWordsForReview,
      syncWithLocal,
    }}>
      {children}
    </CloudVocabularyContext.Provider>
  );
}

export function useCloudVocabulary() {
  const context = useContext(CloudVocabularyContext);
  if (context === undefined) {
    throw new Error('useCloudVocabulary must be used within a CloudVocabularyProvider');
  }
  return context;
}