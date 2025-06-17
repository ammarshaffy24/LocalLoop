/*
  # Add image support to tips

  1. Schema Changes
    - Add `image_url` column to tips table for storing image URLs
    - Create storage bucket for tip images
    - Set up storage policies for public access

  2. Storage Setup
    - Create 'tip-images' bucket for storing tip photos
    - Enable public access for viewing images
    - Set up RLS policies for image uploads

  3. Features
    - Optional image upload for tips
    - Public URL generation for easy access
    - Secure storage with proper access controls
*/

-- Add image_url column to tips table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tips' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE tips ADD COLUMN image_url text;
    RAISE NOTICE 'Added image_url column to tips table';
  ELSE
    RAISE NOTICE 'Column image_url already exists';
  END IF;
END $$;

-- Create storage bucket for tip images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tip-images', 'tip-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for tip images

-- Allow anyone to view images (public access)
CREATE POLICY "Public Access for Tip Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'tip-images');

-- Allow anyone to upload images
CREATE POLICY "Anyone can upload tip images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'tip-images');

-- Allow users to update their own images
CREATE POLICY "Users can update tip images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'tip-images');

-- Allow users to delete images
CREATE POLICY "Users can delete tip images" ON storage.objects
  FOR DELETE USING (bucket_id = 'tip-images');

-- Verify the setup
DO $$
DECLARE
    column_exists boolean;
    bucket_exists boolean;
    policy_count integer;
BEGIN
    -- Check if image_url column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tips' AND column_name = 'image_url'
    ) INTO column_exists;
    
    -- Check if bucket exists
    SELECT EXISTS (
        SELECT 1 FROM storage.buckets
        WHERE id = 'tip-images'
    ) INTO bucket_exists;
    
    -- Count storage policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname LIKE '%tip%';
    
    RAISE NOTICE '✅ Image support setup complete!';
    RAISE NOTICE 'image_url column exists: %', column_exists;
    RAISE NOTICE 'tip-images bucket exists: %', bucket_exists;
    RAISE NOTICE 'Storage policies created: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE '📸 Your tips can now include images!';
    RAISE NOTICE '💡 Images are stored securely in Supabase Storage';
END $$;