import { supabase, generateUserFingerprint } from './supabase';
import { getCurrentUser } from './auth';
import type { Comment, CommentLike, CommentSortBy } from '../types/comments';

// Get comments for a tip with real-time subscription
export const getCommentsForTip = async (tipId: string, sortBy: CommentSortBy = 'new'): Promise<Comment[]> => {
  try {
    console.log('💬 Loading comments for tip:', tipId, 'sorted by:', sortBy);
    
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('tip_id', tipId)
      .order(sortBy === 'top' ? 'likes' : 'created_at', { ascending: sortBy === 'new' ? false : false });

    if (error) {
      console.error('❌ Error loading comments:', error);
      throw error;
    }

    // Organize comments into threaded structure
    const comments = data || [];
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create comment map
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into threads
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parent_id) {
        // This is a reply
        const parent = commentMap.get(comment.parent_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        // This is a root comment
        rootComments.push(commentWithReplies);
      }
    });

    console.log('✅ Loaded', comments.length, 'comments organized into', rootComments.length, 'threads');
    return rootComments;
  } catch (error) {
    console.error('💥 Error in getCommentsForTip:', error);
    return [];
  }
};

// Add a new comment
export const addComment = async (
  tipId: string, 
  content: string, 
  parentId?: string
): Promise<{ success: boolean; comment?: Comment; error?: string }> => {
  try {
    console.log('💬 Adding comment to tip:', tipId, parentId ? '(reply)' : '(root)');
    
    if (!content.trim()) {
      return { success: false, error: 'Comment content is required' };
    }

    const user = await getCurrentUser();
    const fingerprint = generateUserFingerprint();

    const commentData = {
      tip_id: tipId,
      user_id: user?.id || null,
      user_email: user?.email || null,
      user_fingerprint: fingerprint,
      parent_id: parentId || null,
      content: content.trim()
    };

    const { data, error } = await supabase
      .from('comments')
      .insert([commentData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding comment:', error);
      throw error;
    }

    console.log('✅ Comment added successfully:', data.id);
    return { success: true, comment: data };
  } catch (error) {
    console.error('💥 Error in addComment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
    return { success: false, error: errorMessage };
  }
};

// FIXED: Toggle like using new database function
export const toggleCommentLike = async (commentId: string): Promise<{ success: boolean; action: 'liked' | 'unliked'; newCount: number; error?: string }> => {
  try {
    console.log('👍 TOGGLE: Starting like toggle for comment:', commentId);
    
    const user = await getCurrentUser();
    const fingerprint = generateUserFingerprint();
    
    console.log('🔍 User context:', user ? `authenticated (${user.email})` : `anonymous (${fingerprint.substring(0, 8)}...)`);

    // Use the new database function to toggle likes
    const { data, error } = await supabase.rpc('toggle_comment_like', {
      p_comment_id: commentId,
      p_user_id: user?.id || null,
      p_fingerprint: fingerprint
    });

    if (error) {
      console.error('❌ Database function error:', error);
      throw error;
    }

    console.log('✅ Database function result:', data);

    if (!data.success) {
      console.error('❌ Function returned error:', data.error);
      return {
        success: false,
        action: 'liked',
        newCount: 0,
        error: data.message || 'Failed to toggle like'
      };
    }

    console.log(`✅ Comment ${data.action} successfully, new count: ${data.new_count}`);
    
    return {
      success: true,
      action: data.action,
      newCount: data.new_count
    };
    
  } catch (error) {
    console.error('💥 Error in toggleCommentLike:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to toggle like';
    return { 
      success: false, 
      action: 'liked', 
      newCount: 0, 
      error: errorMessage 
    };
  }
};

// Get user's liked comments for a tip using new database function
export const getUserLikedComments = async (tipId: string): Promise<Set<string>> => {
  try {
    const user = await getCurrentUser();
    const fingerprint = generateUserFingerprint();

    const { data, error } = await supabase.rpc('get_user_liked_comments_for_tip', {
      p_tip_id: tipId,
      p_user_id: user?.id || null,
      p_fingerprint: fingerprint
    });

    if (error) {
      console.error('❌ Error getting user liked comments:', error);
      return new Set();
    }

    const likedCommentIds = new Set(data?.map((item: any) => item.comment_id) || []);
    console.log('👍 User has liked', likedCommentIds.size, 'comments');
    
    return likedCommentIds;
  } catch (error) {
    console.error('💥 Error in getUserLikedComments:', error);
    return new Set();
  }
};

// Subscribe to real-time comment updates
export const subscribeToComments = (
  tipId: string, 
  onUpdate: (comments: Comment[]) => void,
  sortBy: CommentSortBy = 'new'
) => {
  console.log('🔄 Setting up real-time comment subscription for tip:', tipId);
  
  const channel = supabase
    .channel(`comments-${tipId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `tip_id=eq.${tipId}`
      },
      async (payload) => {
        console.log('🔄 Real-time comment update:', payload.eventType);
        // Reload comments when any change occurs
        const updatedComments = await getCommentsForTip(tipId, sortBy);
        onUpdate(updatedComments);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comment_likes'
      },
      async (payload) => {
        console.log('🔄 Real-time like update:', payload.eventType);
        // Reload comments when likes change (this updates the like counts from database)
        const updatedComments = await getCommentsForTip(tipId, sortBy);
        onUpdate(updatedComments);
      }
    )
    .subscribe();

  return () => {
    console.log('🧹 Cleaning up comment subscription');
    supabase.removeChannel(channel);
  };
};

// Delete a comment
export const deleteComment = async (commentId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🗑️ Deleting comment:', commentId);
    
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('❌ Error deleting comment:', error);
      throw error;
    }

    console.log('✅ Comment deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('💥 Error in deleteComment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete comment';
    return { success: false, error: errorMessage };
  }
};

// Update a comment
export const updateComment = async (commentId: string, content: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('✏️ Updating comment:', commentId);
    
    if (!content.trim()) {
      return { success: false, error: 'Comment content is required' };
    }

    const { error } = await supabase
      .from('comments')
      .update({ 
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId);

    if (error) {
      console.error('❌ Error updating comment:', error);
      throw error;
    }

    console.log('✅ Comment updated successfully');
    return { success: true };
  } catch (error) {
    console.error('💥 Error in updateComment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update comment';
    return { success: false, error: errorMessage };
  }
};