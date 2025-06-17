/*
  # Add user authentication and ownership to tips

  1. Schema Changes
    - Add `user_id` column to tips table to track ownership
    - Add `user_email` column for display purposes
    - Update existing tips to be owned by anonymous users

  2. Security Updates
    - Update RLS policies to allow users to edit their own tips
    - Keep anonymous access for reading and creating tips
    - Add policies for user-owned tip management

  3. Features
    - Users can see and manage their own tips
    - Anonymous users can still create tips but can't edit them
    - Magic link authentication
*/

-- Add user_id and user_email columns to tips table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tips' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE tips ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tips' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE tips ADD COLUMN user_email text;
  END IF;
END $$;

-- Drop existing policies to recreate them with user ownership
DROP POLICY IF EXISTS "Anyone can read tips" ON tips;
DROP POLICY IF EXISTS "Anyone can insert tips" ON tips;
DROP POLICY IF EXISTS "Anyone can update tip confirmations" ON tips;
DROP POLICY IF EXISTS "Anyone can delete individual tips" ON tips;

-- Create new policies with user ownership
CREATE POLICY "Anyone can read tips"
  ON tips FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert tips"
  ON tips FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to update confirmations, but only owners can update other fields
CREATE POLICY "Anyone can update tip confirmations"
  ON tips FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (
    -- Allow confirmation updates for everyone
    (OLD.description = NEW.description AND OLD.category = NEW.category AND OLD.lat = NEW.lat AND OLD.lng = NEW.lng)
    OR
    -- Allow full updates only for owners
    (auth.uid() = user_id)
  );

-- Allow owners to delete their tips, and anyone to delete anonymous tips
CREATE POLICY "Users can delete own tips or anonymous tips"
  ON tips FOR DELETE
  TO anon, authenticated
  USING (
    user_id IS NULL OR auth.uid() = user_id
  );

-- Create a function to get user tips
CREATE OR REPLACE FUNCTION get_user_tips(user_uuid uuid)
RETURNS TABLE (
  id uuid,
  lat double precision,
  lng double precision,
  category text,
  description text,
  confirmations integer,
  created_at timestamptz,
  last_confirmed_at timestamptz,
  user_id uuid,
  user_email text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    t.id,
    t.lat,
    t.lng,
    t.category,
    t.description,
    t.confirmations,
    t.created_at,
    t.last_confirmed_at,
    t.user_id,
    t.user_email
  FROM tips t
  WHERE t.user_id = user_uuid
  ORDER BY t.created_at DESC;
$$;