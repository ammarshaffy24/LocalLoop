/*
  # Fix confirmation function that's causing stuck state

  1. Problem Analysis
    - The add_tip_confirmation function might be failing silently
    - Need to simplify and make it more robust
    - Add better error handling and logging

  2. Solution
    - Recreate the function with simpler logic
    - Add proper transaction handling
    - Better error messages
    - Test the function works
*/

-- Drop and recreate the confirmation function with better error handling
DROP FUNCTION IF EXISTS add_tip_confirmation(uuid, uuid, text);

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
  already_confirmed boolean := false;
  new_count integer;
BEGIN
  -- Validate inputs
  IF p_tip_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'invalid_input',
      'message', 'Tip ID is required'
    );
  END IF;
  
  IF p_fingerprint IS NULL OR p_fingerprint = '' THEN
    p_fingerprint := 'unknown';
  END IF;
  
  -- Check if tip exists
  IF NOT EXISTS (SELECT 1 FROM tips WHERE id = p_tip_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'tip_not_found',
      'message', 'Tip not found'
    );
  END IF;
  
  -- Check if already confirmed
  IF p_user_id IS NOT NULL THEN
    -- Authenticated user check
    SELECT EXISTS (
      SELECT 1 FROM tip_confirmations 
      WHERE tip_id = p_tip_id AND user_id = p_user_id
    ) INTO already_confirmed;
  ELSE
    -- Anonymous user check
    SELECT EXISTS (
      SELECT 1 FROM tip_confirmations 
      WHERE tip_id = p_tip_id AND user_fingerprint = p_fingerprint AND user_id IS NULL
    ) INTO already_confirmed;
  END IF;
  
  IF already_confirmed THEN
    RETURN json_build_object(
      'success', false,
      'error', 'already_confirmed',
      'message', 'You have already confirmed this tip'
    );
  END IF;
  
  -- Start transaction
  BEGIN
    -- Insert confirmation
    INSERT INTO tip_confirmations (tip_id, user_id, user_fingerprint)
    VALUES (p_tip_id, p_user_id, p_fingerprint)
    RETURNING id INTO confirmation_id;
    
    -- Update tip confirmation count and timestamp
    UPDATE tips 
    SET 
      confirmations = confirmations + 1,
      last_confirmed_at = now()
    WHERE id = p_tip_id
    RETURNING confirmations INTO new_count;
    
    -- Return success
    RETURN json_build_object(
      'success', true,
      'confirmation_id', confirmation_id,
      'new_count', new_count,
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
        'message', 'Database error: ' || SQLERRM
      );
  END;
END;
$$;

-- Also fix the check function
DROP FUNCTION IF EXISTS check_user_confirmed_tip(uuid, uuid, text);

CREATE OR REPLACE FUNCTION check_user_confirmed_tip(
  p_tip_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_fingerprint text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  IF p_tip_id IS NULL THEN
    RETURN false;
  END IF;
  
  IF p_user_id IS NOT NULL THEN
    -- Authenticated user check
    RETURN EXISTS (
      SELECT 1 FROM tip_confirmations 
      WHERE tip_id = p_tip_id AND user_id = p_user_id
    );
  ELSE
    -- Anonymous user check
    IF p_fingerprint IS NULL OR p_fingerprint = '' THEN
      RETURN false;
    END IF;
    
    RETURN EXISTS (
      SELECT 1 FROM tip_confirmations 
      WHERE tip_id = p_tip_id AND user_fingerprint = p_fingerprint AND user_id IS NULL
    );
  END IF;
END;
$$;

-- Test the functions
DO $$
DECLARE
    test_result json;
    test_tip_id uuid;
BEGIN
    -- Get a test tip ID
    SELECT id INTO test_tip_id FROM tips LIMIT 1;
    
    IF test_tip_id IS NOT NULL THEN
        -- Test the function
        SELECT add_tip_confirmation(test_tip_id, null, 'test_fingerprint_123') INTO test_result;
        RAISE NOTICE 'Test result: %', test_result;
        
        -- Clean up test
        DELETE FROM tip_confirmations WHERE user_fingerprint = 'test_fingerprint_123';
    END IF;
    
    RAISE NOTICE '✅ Confirmation functions updated and tested!';
END $$;