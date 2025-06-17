/*
  # Fix tip confirmations constraints

  1. Problem Analysis
    - The current unique constraints are too restrictive
    - They prevent proper anonymous user confirmations
    - Need to allow one confirmation per user OR per fingerprint per tip

  2. Solution
    - Drop conflicting constraints
    - Create proper constraint that allows either user_id OR fingerprint uniqueness
    - Fix the logic to work with both authenticated and anonymous users

  3. Security
    - Maintain RLS policies
    - Ensure data integrity while allowing proper functionality
*/

-- Drop the problematic unique constraints
ALTER TABLE tip_confirmations DROP CONSTRAINT IF EXISTS unique_user_tip_confirmation;
ALTER TABLE tip_confirmations DROP CONSTRAINT IF EXISTS unique_fingerprint_tip_confirmation;

-- Create a better constraint that handles both cases properly
-- This allows one confirmation per tip per user (either by user_id or fingerprint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_tip_user_or_fingerprint' 
    AND table_name = 'tip_confirmations'
  ) THEN
    -- For authenticated users: unique by tip_id + user_id (when user_id is not null)
    -- For anonymous users: unique by tip_id + user_fingerprint (when user_id is null)
    CREATE UNIQUE INDEX unique_tip_user_or_fingerprint 
    ON tip_confirmations (tip_id, COALESCE(user_id::text, user_fingerprint));
  END IF;
END $$;

-- Update the helper function to work correctly
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
      (p_user_id IS NULL AND user_fingerprint = p_fingerprint AND user_id IS NULL)
    )
  );
$$;

-- Test the setup with some debug info
DO $$
DECLARE
    confirmation_count integer;
    constraint_count integer;
BEGIN
    -- Check confirmation count
    SELECT COUNT(*) INTO confirmation_count FROM tip_confirmations;
    
    -- Check constraints
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints
    WHERE table_name = 'tip_confirmations';
    
    RAISE NOTICE '🔧 Confirmation system fixed!';
    RAISE NOTICE 'Current confirmations: %', confirmation_count;
    RAISE NOTICE 'Table constraints: %', constraint_count;
    RAISE NOTICE 'Ready for testing!';
END $$;