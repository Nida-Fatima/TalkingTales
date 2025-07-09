/*
  # Create initial database schema for language learning app

  1. New Tables
    - `users` - User profiles with target languages and preferences
    - `saved_stories` - User's saved conversation stories
    - `learned_words` - Words that users have successfully learned
    - `quiz_history` - Record of quiz attempts and scores
    - `vocabulary_encounters` - Track word encounters and frequency

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only access their own records

  3. Features
    - UUID primary keys for all tables
    - Proper foreign key relationships
    - Timestamps for tracking creation and updates
    - Default values for counters and arrays
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the 'users' table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  target_languages TEXT[] DEFAULT ARRAY['de']::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Set up Row Level Security (RLS) for 'users' table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create the 'saved_stories' table
CREATE TABLE IF NOT EXISTS public.saved_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  situation TEXT NOT NULL,
  language TEXT NOT NULL,
  dialogue JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Set up RLS for 'saved_stories' table
ALTER TABLE public.saved_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved stories" ON public.saved_stories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved stories" ON public.saved_stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved stories" ON public.saved_stories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved stories" ON public.saved_stories
  FOR DELETE USING (auth.uid() = user_id);

-- Create the 'learned_words' table
CREATE TABLE IF NOT EXISTS public.learned_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  emoji TEXT NOT NULL,
  language TEXT NOT NULL,
  story_id TEXT NOT NULL,
  times_correct INTEGER DEFAULT 0 NOT NULL,
  times_incorrect INTEGER DEFAULT 0 NOT NULL,
  learned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_reviewed TIMESTAMP WITH TIME ZONE
);

-- Set up RLS for 'learned_words' table
ALTER TABLE public.learned_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learned words" ON public.learned_words
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learned words" ON public.learned_words
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learned words" ON public.learned_words
  FOR UPDATE USING (auth.uid() = user_id);

-- Create the 'quiz_history' table
CREATE TABLE IF NOT EXISTS public.quiz_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Set up RLS for 'quiz_history' table
ALTER TABLE public.quiz_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz history" ON public.quiz_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz history" ON public.quiz_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create the 'vocabulary_encounters' table
CREATE TABLE IF NOT EXISTS public.vocabulary_encounters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  emoji TEXT NOT NULL,
  language TEXT NOT NULL,
  story_id TEXT,
  times_encountered INTEGER DEFAULT 0 NOT NULL,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Set up RLS for 'vocabulary_encounters' table
ALTER TABLE public.vocabulary_encounters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vocabulary encounters" ON public.vocabulary_encounters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabulary encounters" ON public.vocabulary_encounters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary encounters" ON public.vocabulary_encounters
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_stories_user_id ON public.saved_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_learned_words_user_id ON public.learned_words(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_history_user_id ON public.quiz_history(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_encounters_user_id ON public.vocabulary_encounters(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_encounters_word ON public.vocabulary_encounters(word, language);