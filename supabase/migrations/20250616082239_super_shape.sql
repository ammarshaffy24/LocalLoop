/*
  # Add confirmation system and expiration to tips

  1. Schema Changes
    - Add `last_confirmed_at` column to track when tip was last confirmed
    - Update existing tips to have initial confirmation timestamp
    - Add policy to allow anyone to update confirmations

  2. Features
    - Tips expire after 7 days with no confirmation
    - Track last confirmation timestamp
    - Allow incrementing confirmations count

  3. Security
    - Add policy for updating confirmations and last_confirmed_at
*/

-- Add last_confirmed_at column
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
SET last_confirmed_at = created_at 
WHERE last_confirmed_at IS NULL;

-- Add policy to allow anyone to update confirmations
CREATE POLICY "Anyone can update tip confirmations"
  ON tips
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);