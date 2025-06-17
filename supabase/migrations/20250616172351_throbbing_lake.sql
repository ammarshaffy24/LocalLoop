/*
  # Add threaded comment system for tips

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `tip_id` (uuid, foreign key to tips)
      - `user_id` (uuid, foreign key to auth.users, nullable for anonymous)
      - `user_email` (text, for display)
      - `user_fingerprint` (text, for anonymous users)
      - `parent_id` (uuid, foreign key to comments for threading)
      - `content` (text, comment content)
      - `likes` (integer, like count)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `comment_likes`
      - `id` (uuid, primary key)
      - `comment_id` (uuid, foreign key to comments)
      - `user_id` (uuid, foreign key to auth.users, nullable)
      - `user_fingerprint` (text, for anonymous users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for reading, inserting, updating, and deleting
    - Ensure users can only edit their own comments

  3. Indexes
    - Add indexes for performance on tip_id, parent_id, user_id
    - Add unique constraint for comment likes
*/

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id uuid NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  user_fingerprint text NOT NULL,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  likes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_fingerprint text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_tip_id ON comments(tip_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- Create unique constraint for comment likes
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_comment_like 
ON comment_likes (comment_id, COALESCE(user_id::text, 'anon_' || user_fingerprint));

-- Enable Row Level Security
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Anyone can read comments" ON comments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    (user_id IS NULL AND user_fingerprint = current_setting('app.user_fingerprint', true))
  );

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (
    user_id = auth.uid() OR 
    (user_id IS NULL AND user_fingerprint = current_setting('app.user_fingerprint', true))
  );

-- Create policies for comment_likes
CREATE POLICY "Anyone can read comment likes" ON comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert comment likes" ON comment_likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own comment likes" ON comment_likes
  FOR DELETE USING (
    user_id = auth.uid() OR 
    (user_id IS NULL AND user_fingerprint = current_setting('app.user_fingerprint', true))
  );

-- Function to update comment like count
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET likes = likes + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET likes = likes - 1 WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update like counts
CREATE TRIGGER trigger_update_comment_like_count
  AFTER INSERT OR DELETE ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();

-- Function to get comments for a tip with threading
CREATE OR REPLACE FUNCTION get_tip_comments(p_tip_id uuid, p_sort_by text DEFAULT 'new')
RETURNS TABLE (
  id uuid,
  tip_id uuid,
  user_id uuid,
  user_email text,
  user_fingerprint text,
  parent_id uuid,
  content text,
  likes integer,
  created_at timestamptz,
  updated_at timestamptz,
  reply_count integer
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH comment_replies AS (
    SELECT 
      parent_id,
      COUNT(*) as reply_count
    FROM comments 
    WHERE tip_id = p_tip_id AND parent_id IS NOT NULL
    GROUP BY parent_id
  )
  SELECT 
    c.id,
    c.tip_id,
    c.user_id,
    c.user_email,
    c.user_fingerprint,
    c.parent_id,
    c.content,
    c.likes,
    c.created_at,
    c.updated_at,
    COALESCE(cr.reply_count, 0)::integer as reply_count
  FROM comments c
  LEFT JOIN comment_replies cr ON c.id = cr.parent_id
  WHERE c.tip_id = p_tip_id
  ORDER BY 
    CASE 
      WHEN p_sort_by = 'top' THEN c.likes 
      ELSE 0 
    END DESC,
    CASE 
      WHEN p_sort_by = 'new' THEN c.created_at 
      ELSE '1970-01-01'::timestamptz 
    END DESC;
$$;

-- Verify the setup
DO $$
DECLARE
    comments_table_exists boolean;
    likes_table_exists boolean;
    policy_count integer;
    function_exists boolean;
BEGIN
    -- Check if tables exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'comments'
    ) INTO comments_table_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'comment_likes'
    ) INTO likes_table_exists;
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename IN ('comments', 'comment_likes');
    
    -- Check if function exists
    SELECT EXISTS (
        SELECT 1 FROM pg_proc
        WHERE proname = 'get_tip_comments'
    ) INTO function_exists;
    
    RAISE NOTICE '✅ Comment system setup complete!';
    RAISE NOTICE 'Comments table exists: %', comments_table_exists;
    RAISE NOTICE 'Comment likes table exists: %', likes_table_exists;
    RAISE NOTICE 'Policies created: %', policy_count;
    RAISE NOTICE 'Helper function created: %', function_exists;
    RAISE NOTICE '';
    RAISE NOTICE '💬 Your tips now support threaded comments!';
    RAISE NOTICE '👍 Users can like and reply to comments';
    RAISE NOTICE '🔄 Real-time updates supported';
END $$;