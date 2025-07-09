/*
  # Fix users table INSERT policy

  1. Security Changes
    - Drop the existing INSERT policy that uses incorrect `uid()` function
    - Create new INSERT policy using correct `auth.uid()` function
    - This allows users to create their own profile after authentication

  The issue was that `uid()` is not a valid function in this context.
  We need to use `auth.uid()` to get the authenticated user's ID.
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Create the correct INSERT policy using auth.uid()
CREATE POLICY "Users can insert their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);