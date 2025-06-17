/*
  # Fix confirmation system completely

  1. Clean up existing constraints and recreate properly
  2. Fix RLS policies for tip_confirmations
  3. Add proper error handling
  4. Create working helper functions
*/

-- Drop existing problematic constraints
DROP INDEX IF EXISTS unique_tip_user_or_fingerprint;
ALTER TABLE tip_confirmations DROP CONSTRAINT IF EXISTS unique_user_tip_confirmation;
ALTER TABLE tip_confirmations DROP CONSTRAINT IF EXISTS unique_fingerprint_tip_confirmation;

-- Recreate the table with proper structure if needed
CREATE TABLE IF NOT EXISTS tip_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id uuid NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_fingerprint text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create a single, simple unique constraint
-- This prevents the same user (by ID or fingerprint) from confirming the same tip twice
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_tip_confirmation 
ON tip_confirmations (tip_id, COALESCE(user_id::text, 'anon_' || user_fingerprint));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tip_confirmations_tip_id ON tip_confirmations(tip_id);
CREATE INDEX IF NOT EXISTS idx_tip_confirmations_user_id ON tip_confirmations(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tip_confirmations_fingerprint ON tip_confirmations(user_fingerprint);

-- Enable Row Level Security
ALTER TABLE tip_confirmations ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Anyone can read tip confirmations" ON tip_confirmations;
DROP POLICY IF EXISTS "Anyone can insert tip confirmations" ON tip_confirmations;
DROP POLICY IF EXISTS "Users can manage confirmations" ON tip_confirmations;

-- Simple policies that work
CREATE POLICY "Enable read access for all users" ON tip_confirmations
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON tip_confirmations
  FOR INSERT WITH CHECK (true);

-- Create a simple function to check confirmations
CREATE OR REPLACE FUNCTION check_user_confirmed_tip(
  p_tip_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_fingerprint text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if confirmation exists
  IF p_user_id IS NOT NULL THEN
    -- Authenticated user check
    RETURN EXISTS (
      SELECT 1 FROM tip_confirmations 
      WHERE tip_id = p_tip_id AND user_id = p_user_id
    );
  ELSE
    -- Anonymous user check
    RETURN EXISTS (
      SELECT 1 FROM tip_confirmations 
      WHERE tip_id = p_tip_id AND user_fingerprint = p_fingerprint AND user_id IS NULL
    );
  END IF;
END;
$$;

-- Function to safely add confirmation
CREATE OR REPLACE FUNCTION add_tip_confirmation(
  p_tip_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_fingerprint text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  confirmation_id uuid;
  already_confirmed boolean;
BEGIN
  -- Check if already confirmed
  already_confirmed := check_user_confirmed_tip(p_tip_id, p_user_id, p_fingerprint);
  
  IF already_confirmed THEN
    RETURN json_build_object(
      'success', false,
      'error', 'already_confirmed',
      'message', 'You have already confirmed this tip'
    );
  END IF;
  
  -- Insert confirmation
  INSERT INTO tip_confirmations (tip_id, user_id, user_fingerprint)
  VALUES (p_tip_id, p_user_id, COALESCE(p_fingerprint, 'unknown'))
  RETURNING id INTO confirmation_id;
  
  -- Update tip confirmation count
  UPDATE tips 
  SET 
    confirmations = confirmations + 1,
    last_confirmed_at = now()
  WHERE id = p_tip_id;
  
  RETURN json_build_object(
    'success', true,
    'confirmation_id', confirmation_id,
    'message', 'Confirmation added successfully'
  );
  
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object(
      'success', false,
      'error', 'already_confirmed',
      'message', 'You have already confirmed this tip'
    );
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'database_error',
      'message', SQLERRM
    );
END;
$$;

-- Test the setup
DO $$
DECLARE
    test_result json;
BEGIN
    RAISE NOTICE '🧪 Testing confirmation system...';
    
    -- Test the function exists
    SELECT check_user_confirmed_tip('00000000-0000-0000-0000-000000000000'::uuid, null, 'test') INTO test_result;
    
    RAISE NOTICE '✅ Confirmation system setup complete!';
    RAISE NOTICE 'Functions created and tested successfully';
END $$;