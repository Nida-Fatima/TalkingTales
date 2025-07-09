/*
  # Fix RLS policies for users table

  1. Security Updates
    - Drop existing problematic INSERT policy
    - Create new INSERT policy with correct auth.uid() reference
    - Update other policies to use consistent auth.uid() function
    - Ensure proper permissions for authenticated users

  2. Changes Made
    - Fixed INSERT policy to use auth.uid() instead of uid()
    - Updated SELECT and UPDATE policies for consistency
    - Maintained security by ensuring users can only access their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Create new policies with correct auth.uid() references
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