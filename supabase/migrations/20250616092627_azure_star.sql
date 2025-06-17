-- Complete database fix script for LocalLoop
-- Run this in your Supabase SQL Editor

-- First, let's check what exists
DO $$
BEGIN
    RAISE NOTICE 'Starting LocalLoop database setup...';
END $$;

-- Create the tips table if it doesn't exist
CREATE TABLE IF NOT EXISTS tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  confirmations integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_confirmed_at timestamptz DEFAULT now()
);

-- Add last_confirmed_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tips' AND column_name = 'last_confirmed_at'
  ) THEN
    ALTER TABLE tips ADD COLUMN last_confirmed_at timestamptz DEFAULT now();
    RAISE NOTICE 'Added last_confirmed_at column';
  ELSE
    RAISE NOTICE 'Column last_confirmed_at already exists';
  END IF;
END $$;

-- Update existing tips to have initial confirmation timestamp
UPDATE tips 
SET last_confirmed_at = COALESCE(last_confirmed_at, created_at, now())
WHERE last_confirmed_at IS NULL;

-- Enable RLS
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read tips" ON tips;
DROP POLICY IF EXISTS "Anyone can insert tips" ON tips;
DROP POLICY IF EXISTS "Anyone can update tip confirmations" ON tips;
DROP POLICY IF EXISTS "Anyone can delete tips" ON tips;
DROP POLICY IF EXISTS "Anyone can delete individual tips" ON tips;

-- Create fresh policies
CREATE POLICY "Anyone can read tips"
  ON tips FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert tips"
  ON tips FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update tip confirmations"
  ON tips FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete individual tips"
  ON tips FOR DELETE
  TO anon, authenticated
  USING (true);

-- Verify the setup
DO $$
DECLARE
    tip_count integer;
    column_exists boolean;
BEGIN
    -- Check if table exists and get count
    SELECT COUNT(*) INTO tip_count FROM tips;
    
    -- Check if last_confirmed_at column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tips' AND column_name = 'last_confirmed_at'
    ) INTO column_exists;
    
    RAISE NOTICE '✅ Setup complete!';
    RAISE NOTICE 'Tips table exists with % rows', tip_count;
    RAISE NOTICE 'last_confirmed_at column exists: %', column_exists;
    RAISE NOTICE 'All policies created successfully';
END $$;

-- Test insert to make sure everything works
INSERT INTO tips (lat, lng, category, description) 
VALUES (40.7128, -74.0060, 'Test', 'Database setup test - you can delete this')
ON CONFLICT DO NOTHING;

-- Final verification
SELECT 
    COUNT(*) as total_tips,
    COUNT(CASE WHEN last_confirmed_at IS NOT NULL THEN 1 END) as tips_with_confirmation
FROM tips;