export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          target_languages: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          target_languages?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          target_languages?: string[];
          updated_at?: string;
        };
      };
      saved_stories: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          situation: string;
          language: string;
          dialogue: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          situation: string;
          language: string;
          dialogue: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          situation?: string;
          language?: string;
          dialogue?: any;
          updated_at?: string;
        };
      };
      learned_words: {
        Row: {
          id: string;
          user_id: string;
          word: string;
          translation: string;
          emoji: string;
          language: string;
          story_id: string;
          times_correct: number;
          times_incorrect: number;
          learned_at: string;
          last_reviewed: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          word: string;
          translation: string;
          emoji: string;
          language: string;
          story_id: string;
          times_correct?: number;
          times_incorrect?: number;
          learned_at?: string;
          last_reviewed?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          word?: string;
          translation?: string;
          emoji?: string;
          language?: string;
          story_id?: string;
          times_correct?: number;
          times_incorrect?: number;
          learned_at?: string;
          last_reviewed?: string | null;
        };
      };
      quiz_history: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          score: number;
          total: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          score: number;
          total: number;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string;
          score?: number;
          total?: number;
          completed_at?: string;
        };
      };
      vocabulary_encounters: {
        Row: {
          id: string;
          user_id: string;
          word: string;
          translation: string;
          emoji: string;
          language: string;
          story_id: string | null;
          times_encountered: number;
          first_seen_at: string;
          last_seen_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          word: string;
          translation: string;
          emoji: string;
          language: string;
          story_id?: string | null;
          times_encountered?: number;
          first_seen_at?: string;
          last_seen_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          word?: string;
          translation?: string;
          emoji?: string;
          language?: string;
          story_id?: string | null;
          times_encountered?: number;
          first_seen_at?: string;
          last_seen_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  target_languages: string[];
  created_at: string;
  updated_at: string;
}

export interface SavedStory {
  id: string;
  user_id: string;
  title: string;
  situation: string;
  language: string;
  dialogue: any;
  created_at: string;
  updated_at: string;
}

export interface LearnedWord {
  id: string;
  user_id: string;
  word: string;
  translation: string;
  emoji: string;
  language: string;
  story_id: string;
  times_correct: number;
  times_incorrect: number;
  learned_at: string;
  last_reviewed: string | null;
}

export interface QuizResult {
  id: string;
  user_id: string;
  story_id: string;
  score: number;
  total: number;
  completed_at: string;
}

export interface VocabularyEncounter {
  id: string;
  user_id: string;
  word: string;
  translation: string;
  emoji: string;
  language: string;
  story_id: string | null;
  times_encountered: number;
  first_seen_at: string;
  last_seen_at: string;
}