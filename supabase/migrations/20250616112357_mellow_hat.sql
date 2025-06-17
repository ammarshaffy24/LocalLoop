-- COMPLETE DATABASE SETUP FOR LOCALLOOP
-- Run this script in your Supabase SQL Editor
-- This will create everything from scratch

-- 1. DROP EVERYTHING TO START FRESH (if needed)
DROP TABLE IF EXISTS tip_confirmations CASCADE;
DROP TABLE IF EXISTS tips CASCADE;
DROP FUNCTION IF EXISTS add_tip_confirmation(uuid, uuid, text);
DROP FUNCTION IF EXISTS check_user_confirmed_tip(uuid, uuid, text);
DROP FUNCTION IF EXISTS has_user_confirmed_tip(uuid, uuid, text);
DROP FUNCTION IF EXISTS get_tip_confirmation_count(uuid);
DROP FUNCTION IF EXISTS get_user_tips(uuid);

-- 2. CREATE TIPS TABLE
CREATE TABLE tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  confirmations integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_confirmed_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text
);

-- 3. CREATE TIP_CONFIRMATIONS TABLE
CREATE TABLE tip_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id uuid NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_fingerprint text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_tips_created_at ON tips(created_at);
CREATE INDEX idx_tips_user_id ON tips(user_id);
CREATE INDEX idx_tips_lat_lng ON tips(lat, lng);
CREATE INDEX idx_tip_confirmations_tip_id ON tip_confirmations(tip_id);
CREATE INDEX idx_tip_confirmations_user_id ON tip_confirmations(user_id);
CREATE INDEX idx_tip_confirmations_fingerprint ON tip_confirmations(user_fingerprint);

-- 5. CREATE UNIQUE CONSTRAINT FOR CONFIRMATIONS
CREATE UNIQUE INDEX idx_unique_tip_confirmation 
ON tip_confirmations (tip_id, COALESCE(user_id::text, 'anon_' || user_fingerprint));

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_confirmations ENABLE ROW LEVEL SECURITY;

-- 7. CREATE SIMPLE, PERMISSIVE POLICIES FOR TIPS
CREATE POLICY "Enable all operations for tips" ON tips
  FOR ALL USING (true) WITH CHECK (true);

-- 8. CREATE SIMPLE, PERMISSIVE POLICIES FOR TIP_CONFIRMATIONS
CREATE POLICY "Enable all operations for tip_confirmations" ON tip_confirmations
  FOR ALL USING (true) WITH CHECK (true);

-- 9. CREATE HELPER FUNCTIONS

-- Function to check if user confirmed a tip
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

-- Function to add confirmation
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
  already_confirmed := check_user_confirmed_tip(p_tip_id, p_user_id, p_fingerprint);
  
  IF already_confirmed THEN
    RETURN json_build_object(
      'success', false,
      'error', 'already_confirmed',
      'message', 'You have already confirmed this tip'
    );
  END IF;
  
  -- Insert confirmation
  BEGIN
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

-- 10. INSERT TEST DATA
INSERT INTO tips (lat, lng, category, description, confirmations, last_confirmed_at) VALUES
(40.7128, -74.0060, 'Food & Drink', 'Amazing pizza place with $2 slices during happy hour (3-6pm weekdays)', 5, now() - interval '2 days'),
(40.7589, -73.9851, 'Free Stuff', 'Free WiFi and charging stations in this park pavilion', 3, now() - interval '1 day'),
(40.7505, -73.9934, 'Hidden Gems', 'Secret rooftop garden accessible through the office building lobby', 8, now() - interval '3 hours'),
(40.7614, -73.9776, 'Nature', 'Best spot to watch sunrise in Central Park, usually empty before 7am', 12, now() - interval '5 hours'),
(40.7282, -73.9942, 'Shortcuts', 'Underground passage connects these two buildings, saves 5 min walk in winter', 7, now() - interval '1 hour');

-- 11. VERIFY SETUP
DO $$
DECLARE
    tips_count integer;
    confirmations_count integer;
    policies_count integer;
    functions_count integer;
BEGIN
    -- Count data
    SELECT COUNT(*) INTO tips_count FROM tips;
    SELECT COUNT(*) INTO confirmations_count FROM tip_confirmations;
    
    -- Count policies
    SELECT COUNT(*) INTO policies_count FROM pg_policies 
    WHERE tablename IN ('tips', 'tip_confirmations');
    
    -- Count functions
    SELECT COUNT(*) INTO functions_count FROM pg_proc 
    WHERE proname IN ('check_user_confirmed_tip', 'add_tip_confirmation');
    
    RAISE NOTICE '🎉 DATABASE SETUP COMPLETE!';
    RAISE NOTICE '📊 Tips created: %', tips_count;
    RAISE NOTICE '✅ Confirmations table ready: % rows', confirmations_count;
    RAISE NOTICE '🔒 RLS policies created: %', policies_count;
    RAISE NOTICE '⚙️ Functions created: %', functions_count;
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your LocalLoop database is ready to use!';
    RAISE NOTICE '💡 Test by creating a tip in your app';
END $$;

-- 12. FINAL TEST
SELECT 
    'Database Ready!' as status,
    COUNT(*) as sample_tips_created,
    MAX(confirmations) as highest_confirmations,
    MIN(created_at) as oldest_tip
FROM tips;