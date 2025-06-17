-- Complete database setup for LocalLoop
-- This script will set up everything needed for the tips functionality

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
  END IF;
END $$;

-- Update existing tips to have initial confirmation timestamp
UPDATE tips 
SET last_confirmed_at = COALESCE(last_confirmed_at, created_at, now())
WHERE last_confirmed_at IS NULL;

-- Enable Row Level Security
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (ignore errors if they don't exist)
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

-- Insert a test tip to verify everything works
INSERT INTO tips (lat, lng, category, description, last_confirmed_at) 
VALUES (40.7128, -74.0060, 'Test', 'Database setup verification - feel free to delete this tip', now())
ON CONFLICT DO NOTHING;

-- Show final status
SELECT 
    'Setup Complete!' as status,
    COUNT(*) as total_tips,
    COUNT(CASE WHEN last_confirmed_at IS NOT NULL THEN 1 END) as tips_with_confirmation_timestamp
FROM tips;