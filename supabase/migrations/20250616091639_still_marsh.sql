/*
  # Add delete policy for individual tip deletion

  1. Security Changes
    - Add policy to allow anyone to delete individual tips
    - This enables users to delete their own tips or community moderation

  2. Features
    - Individual tip deletion from map popups
    - Confirmation dialog before deletion
    - Toast notification on successful deletion
*/

-- Add policy to allow anyone to delete tips
CREATE POLICY "Anyone can delete individual tips"
  ON tips
  FOR DELETE
  TO anon, authenticated
  USING (true);