/*
  # Add delete policy for tips

  1. Security Changes
    - Add policy to allow anyone to delete tips
    - This enables the "Clear All" functionality to work properly

  2. Policy Details
    - Allow anonymous and authenticated users to delete tips
    - Required for the clear all functionality
*/

-- Add policy to allow anyone to delete tips
CREATE POLICY "Anyone can delete tips"
  ON tips
  FOR DELETE
  TO anon, authenticated
  USING (true);