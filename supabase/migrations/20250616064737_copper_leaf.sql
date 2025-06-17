/*
  # Create tips table for LocalLoop

  1. New Tables
    - `tips`
      - `id` (uuid, primary key)
      - `lat` (double precision, latitude coordinate)
      - `lng` (double precision, longitude coordinate)
      - `category` (text, tip category)
      - `description` (text, tip description)
      - `confirmations` (integer, number of confirmations, default 0)
      - `created_at` (timestamptz, creation timestamp)

  2. Security
    - Enable RLS on `tips` table
    - Add policy for anyone to read tips
    - Add policy for anyone to insert tips (no auth required initially)
*/

CREATE TABLE IF NOT EXISTS tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  confirmations integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read tips
CREATE POLICY "Anyone can read tips"
  ON tips
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to insert tips (no auth required initially)
CREATE POLICY "Anyone can insert tips"
  ON tips
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);