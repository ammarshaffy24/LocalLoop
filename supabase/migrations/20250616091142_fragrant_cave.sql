/*
  # Fix missing last_confirmed_at column

  1. Schema Changes
    - Add `last_confirmed_at` column if it doesn't exist
    - Set default value to creation timestamp for existing tips
    - Ensure all tips have a valid last_confirmed_at value

  2. Data Migration
    - Update existing tips to have initial confirmation timestamp
    - Set last_confirmed_at to created_at for all existing records

  3. Safety
    - Uses IF NOT EXISTS to prevent errors if column already exists
    - Safe for running multiple times
*/

-- Add last_confirmed_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tips' AND column_name = 'last_confirmed_at'
  ) THEN
    ALTER TABLE tips ADD COLUMN last_confirmed_at timestamptz DEFAULT now();
    
    -- Update existing tips to have initial confirmation timestamp
    UPDATE tips 
    SET last_confirmed_at = created_at 
    WHERE last_confirmed_at IS NULL;
    
    -- Make the column NOT NULL after setting values
    ALTER TABLE tips ALTER COLUMN last_confirmed_at SET NOT NULL;
    
    RAISE NOTICE 'Added last_confirmed_at column to tips table';
  ELSE
    RAISE NOTICE 'Column last_confirmed_at already exists';
  END IF;
END $$;

-- Ensure all existing tips have a last_confirmed_at value
UPDATE tips 
SET last_confirmed_at = created_at 
WHERE last_confirmed_at IS NULL;