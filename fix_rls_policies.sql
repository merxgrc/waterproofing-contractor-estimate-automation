s-- Fix Row Level Security (RLS) policies for estimates table
-- Run this in your Supabase SQL editor

-- Disable RLS temporarily to allow inserts (for development)
ALTER TABLE estimates DISABLE ROW LEVEL SECURITY;

-- OR create proper RLS policies (recommended for production)
-- Enable RLS
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all operations for authenticated users" ON estimates
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow all operations for anonymous users (for development only)
CREATE POLICY "Allow all operations for anonymous users" ON estimates
FOR ALL
TO anon
USING (true)
WITH CHECK (true);

-- Alternative: More restrictive policies
-- CREATE POLICY "Users can insert their own estimates" ON estimates
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (auth.uid() = user_id);

-- CREATE POLICY "Users can view their own estimates" ON estimates
-- FOR SELECT
-- TO authenticated
-- USING (auth.uid() = user_id);

-- CREATE POLICY "Users can update their own estimates" ON estimates
-- FOR UPDATE
-- TO authenticated
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);
