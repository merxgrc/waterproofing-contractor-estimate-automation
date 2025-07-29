-- Database migration to add manual_entries and total columns
-- Run this in your Supabase SQL editor

-- Add manual_entries column to store custom cost items
ALTER TABLE estimates
ADD COLUMN IF NOT EXISTS manual_entries JSONB DEFAULT '[]'::jsonb;

-- Add total column to store the grand total (AI + manual entries)
ALTER TABLE estimates
ADD COLUMN IF NOT EXISTS total NUMERIC DEFAULT 0;

-- Create index on total for faster sorting/filtering
CREATE INDEX IF NOT EXISTS idx_estimates_total ON estimates(total);

-- Update existing estimates to have empty manual_entries array and zero total if null
UPDATE estimates 
SET 
  manual_entries = COALESCE(manual_entries, '[]'::jsonb),
  total = COALESCE(total, 0)
WHERE manual_entries IS NULL OR total IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN estimates.manual_entries IS 'JSON array of manual cost entries with structure: [{description, qty, unit, cost}]';
COMMENT ON COLUMN estimates.total IS 'Grand total including AI analysis and manual entries';
