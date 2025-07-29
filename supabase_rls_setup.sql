-- Supabase RLS Setup for Estimates Table
-- Run this in your Supabase SQL editor

-- 1. Add user_id column if missing
ALTER TABLE estimates 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2. Enable Row Level Security
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (cleanup)
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON estimates;
DROP POLICY IF EXISTS "Allow all operations for anonymous users" ON estimates;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON estimates;
DROP POLICY IF EXISTS "Allow select for authenticated users" ON estimates;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON estimates;
DROP POLICY IF EXISTS "Allow delete for authenticated users" ON estimates;

-- 4. Create new RLS policies for authenticated users
-- Allow authenticated users to insert estimates linked to their user_id
CREATE POLICY "Allow insert for authenticated users"
ON estimates
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to select only their own estimates
CREATE POLICY "Allow select for authenticated users"
ON estimates
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to update only their own estimates
CREATE POLICY "Allow update for authenticated users"
ON estimates
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete only their own estimates
CREATE POLICY "Allow delete for authenticated users"
ON estimates
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_estimates_user_id ON estimates(user_id);

-- 6. Update existing estimates to have a user_id (optional, for migration)
-- UPDATE estimates SET user_id = auth.uid() WHERE user_id IS NULL;

-- Verify the setup
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'estimates';
