/*
  # Add tip confirmations tracking system

  1. New Tables
    - `tip_confirmations`
      - `id` (uuid, primary key)
      - `tip_id` (uuid, foreign key to tips table)
      - `user_id` (uuid, foreign key to auth.users, nullable for anonymous users)
      - `user_fingerprint` (text, browser fingerprint for anonymous users)
      - `created_at` (timestamptz, confirmation timestamp)

  2. Security
    - Enable RLS on `tip_confirmations` table
    - Add policy for anyone to read confirmations
    - Add policy for anyone to insert confirmations
    - Add unique constraint to prevent duplicate confirmations

  3. Indexes
    - Add index on tip_id for fast lookups
    - Add index on user_id for authenticated user queries
    - Add index on user_fingerprint for anonymous user queries
*/

-- Create tip_confirmations table if it doesn't exist
CREATE TABLE IF NOT EXISTS tip_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id uuid NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_fingerprint text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint to prevent duplicate confirmations
-- For authenticated users: one confirmation per user per tip
-- For anonymous users: one confirmation per fingerprint per tip
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_user_tip_confirmation' 
    AND table_name = 'tip_confirmations'
  ) THEN
    ALTER TABLE tip_confirmations 
    ADD CONSTRAINT unique_user_tip_confirmation 
    UNIQUE (tip_id, user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_fingerprint_tip_confirmation' 
    AND table_name = 'tip_confirmations'
  ) THEN
    ALTER TABLE tip_confirmations 
    ADD CONSTRAINT unique_fingerprint_tip_confirmation 
    UNIQUE (tip_id, user_fingerprint);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tip_confirmations_tip_id ON tip_confirmations(tip_id);
CREATE INDEX IF NOT EXISTS idx_tip_confirmations_user_id ON tip_confirmations(user_id);
CREATE INDEX IF NOT EXISTS idx_tip_confirmations_fingerprint ON tip_confirmations(user_fingerprint);

-- Enable Row Level Security
ALTER TABLE tip_confirmations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read tip confirmations" ON tip_confirmations;
DROP POLICY IF EXISTS "Anyone can insert tip confirmations" ON tip_confirmations;

-- Create policies
CREATE POLICY "Anyone can read tip confirmations"
  ON tip_confirmations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert tip confirmations"
  ON tip_confirmations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create a function to check if a user has confirmed a tip
CREATE OR REPLACE FUNCTION has_user_confirmed_tip(
  p_tip_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_fingerprint text DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tip_confirmations
    WHERE tip_id = p_tip_id
    AND (
      (p_user_id IS NOT NULL AND user_id = p_user_id)
      OR
      (p_user_id IS NULL AND user_fingerprint = p_fingerprint)
    )
  );
$$;

-- Create a function to get confirmation count for a tip
CREATE OR REPLACE FUNCTION get_tip_confirmation_count(p_tip_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::integer FROM tip_confirmations WHERE tip_id = p_tip_id;
$$;

-- Verify the setup
DO $$
DECLARE
    table_exists boolean;
    policy_count integer;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'tip_confirmations'
    ) INTO table_exists;
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'tip_confirmations';
    
    RAISE NOTICE '✅ Tip confirmations setup complete!';
    RAISE NOTICE 'Table exists: %', table_exists;
    RAISE NOTICE 'Policies created: %', policy_count;
END $$;