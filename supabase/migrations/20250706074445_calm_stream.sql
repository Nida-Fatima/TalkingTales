/*
  # Fix user table policies and check for issues

  1. Security Updates
    - Ensure RLS policies are working correctly
    - Add debugging for policy issues
    - Check if auth.uid() is working properly

  2. Troubleshooting
    - Add policy for handling edge cases
    - Ensure users can create profiles after authentication
*/

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users';

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Create policies with explicit role checking
CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Check if there are any existing users without profiles
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  u.id as profile_id,
  u.username,
  u.created_at as profile_created
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;