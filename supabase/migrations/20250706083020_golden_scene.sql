/*
  # Reset all user data

  1. Delete Operations
    - Delete all records from vocabulary_encounters table
    - Delete all records from quiz_history table  
    - Delete all records from learned_words table
    - Delete all records from saved_stories table
    - Delete all records from users table
    - Delete all records from auth.users table

  2. Order of Operations
    - Delete in reverse dependency order to avoid foreign key constraint violations
    - Auth users are deleted last since other tables reference them

  3. Notes
    - This will permanently delete ALL user data
    - Use with caution - this action cannot be undone
*/

-- Delete all vocabulary encounters
DELETE FROM public.vocabulary_encounters;

-- Delete all quiz history
DELETE FROM public.quiz_history;

-- Delete all learned words
DELETE FROM public.learned_words;

-- Delete all saved stories
DELETE FROM public.saved_stories;

-- Delete all user profiles
DELETE FROM public.users;

-- Delete all auth users (this will cascade delete any remaining references)
DELETE FROM auth.users;

-- Reset any sequences if they exist
-- This ensures that auto-incrementing fields start from 1 again
-- (Though we're using UUIDs, this is good practice)

-- Verify deletion
SELECT 'Auth users remaining: ' || COUNT(*) FROM auth.users;
SELECT 'Public users remaining: ' || COUNT(*) FROM public.users;
SELECT 'Saved stories remaining: ' || COUNT(*) FROM public.saved_stories;
SELECT 'Learned words remaining: ' || COUNT(*) FROM public.learned_words;
SELECT 'Quiz history remaining: ' || COUNT(*) FROM public.quiz_history;
SELECT 'Vocabulary encounters remaining: ' || COUNT(*) FROM public.vocabulary_encounters;