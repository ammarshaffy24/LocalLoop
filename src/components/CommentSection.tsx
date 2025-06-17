import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Reply, MoreVertical, Edit3, Trash2, Send, ArrowUp, ArrowDown } from 'lucide-react';
import { getCurrentUser } from '../lib/auth';
import { 
  getCommentsForTip, 
  addComment, 
  toggleCommentLike, 
  getUserLikedComments,
  subscribeToComments,
  deleteComment,
  updateComment
} from '../lib/comments';
import type { Comment, CommentSortBy } from '../types/comments';
import type { User } from '../lib/auth';
import toast from 'react-hot-toast';

interface CommentSectionProps {
  tipId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface CommentItemProps {
  comment: Comment;
  level: number;
  onReply: (parentId: string) => void;
  onLike: (commentId: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  likedComments: Set<string>;
  currentUser: User | null;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  level,
  onReply,
  onLike,
  onEdit,
  onDelete,
  likedComments,
  currentUser
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLiking, setIsLiking] = useState(false);
  
  // FIXED: Use database values directly, no local state
  const isLiked = likedComments.has(comment.id);
  const likeCount = comment.likes; // Always use database value

  const isOwner = currentUser?.id === comment.user_id;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // FIXED: Handle like with database-only approach
  const handleLike = async () => {
    if (isLiking) {
      console.log('⚠️ Already processing like for comment:', comment.id);
      return;
    }
    
    console.log('👍 CLICK: Like button clicked for comment:', comment.id);
    console.log('🔍 Current state - isLiked:', isLiked, 'count:', likeCount);
    
    setIsLiking(true);
    
    try {
      // Call the like toggle function - database handles everything
      const result = await onLike(comment.id);
      console.log('✅ Like toggle completed:', result);
      
      // NO popup messages - completely silent operation
      // The real-time subscription will update the UI automatically
      
    } catch (error) {
      console.error('❌ Like toggle failed:', error);
      
      // Only show error for actual failures
      if (error instanceof Error && !error.message.includes('already liked')) {
        toast.error('Failed to update like');
      }
    } finally {
      console.log('🏁 FINALLY: Clearing like processing state');
      setIsLiking(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    
    await onEdit(comment.id, editContent);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment.id);
    }
  };

  const marginLeft = Math.min(level * 24, 96); // Max 4 levels deep

  return (
    <div className="space-y-3">
      <div 
        className="flex space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        style={{ marginLeft: `${marginLeft}px` }}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {comment.user_email ? comment.user_email[0].toUpperCase() : '?'}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 text-sm">
                {comment.user_email || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-500">
                {getTimeAgo(comment.created_at)}
              </span>
              {comment.updated_at !== comment.created_at && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>
            
            {/* Menu */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-emerald-500 text-white text-sm rounded hover:bg-emerald-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 text-sm leading-relaxed mb-3">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center space-x-1 text-xs transition-colors ${
                  isLiked 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-500 hover:text-red-500'
                } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isLiked ? 'Unlike this comment' : 'Like this comment'}
              >
                <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''} ${isLiking ? 'animate-pulse' : ''}`} />
                <span className="font-medium">{likeCount}</span>
              </button>
              
              <button
                onClick={() => onReply(comment.id)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-emerald-600 transition-colors"
              >
                <Reply className="h-3 w-3" />
                <span>Reply</span>
              </button>

              {hasReplies && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showReplies ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  <span>
                    {showReplies ? 'Hide' : 'Show'} {comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {hasReplies && showReplies && (
        <div className="space-y-3">
          {comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              level={level + 1}
              onReply={onReply}
              onLike={onLike}
              onEdit={onEdit}
              onDelete={onDelete}
              likedComments={likedComments}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentSection: React.FC<CommentSectionProps> = ({ tipId, isOpen, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<CommentSortBy>('new');
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load user and comments
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, tipId, sortBy]);

  // Set up real-time subscription
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = subscribeToComments(tipId, (updatedComments) => {
      console.log('🔄 Real-time update: received', updatedComments.length, 'comments');
      setComments(updatedComments);
      // Reload liked comments when comments update to get fresh like counts
      loadLikedComments();
    }, sortBy);

    return unsubscribe;
  }, [isOpen, tipId, sortBy]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [user, commentsData] = await Promise.all([
        getCurrentUser(),
        getCommentsForTip(tipId, sortBy)
      ]);
      
      setCurrentUser(user);
      setComments(commentsData);
      
      await loadLikedComments();
    } catch (error) {
      console.error('Error loading comment data:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const loadLikedComments = async () => {
    try {
      const liked = await getUserLikedComments(tipId);
      setLikedComments(liked);
      console.log('👍 Loaded liked comments:', liked.size);
    } catch (error) {
      console.error('Error loading liked comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const result = await addComment(tipId, newComment);
      if (result.success) {
        setNewComment('');
        toast.success('Comment added!');
      } else {
        toast.error(result.error || 'Failed to add comment');
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    
    setSubmitting(true);
    try {
      const result = await addComment(tipId, replyContent, parentId);
      if (result.success) {
        setReplyContent('');
        setReplyingTo(null);
        toast.success('Reply added!');
      } else {
        toast.error(result.error || 'Failed to add reply');
      }
    } catch (error) {
      toast.error('Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  // FIXED: Handle like with proper database integration and NO POPUPS
  const handleLike = async (commentId: string) => {
    console.log('👍 HANDLE LIKE: Processing like for comment:', commentId);
    
    try {
      const result = await toggleCommentLike(commentId);
      console.log('✅ Like toggle result:', result);
      
      if (result.success) {
        // Update liked comments set based on the action
        setLikedComments(prev => {
          const newSet = new Set(prev);
          if (result.action === 'liked') {
            newSet.add(commentId);
            console.log('👍 Added comment to liked set:', commentId);
          } else {
            newSet.delete(commentId);
            console.log('👎 Removed comment from liked set:', commentId);
          }
          return newSet;
        });
        
        // NO POPUP MESSAGES - completely silent operation
        console.log(`✅ Comment ${result.action} silently, new count: ${result.newCount}`);
        
        // The real-time subscription will update the comment counts automatically
        
      } else {
        // Only log errors, don't show popups for duplicate likes
        if (result.error && !result.error.includes('already')) {
          console.error('❌ Like toggle failed:', result.error);
          toast.error('Failed to update like');
        } else {
          console.log('ℹ️ Like operation handled silently (likely duplicate)');
        }
      }
    } catch (error) {
      console.error('💥 Failed to toggle like:', error);
      // Only show error toast for actual failures
      toast.error('Failed to update like');
    }
  };

  const handleEdit = async (commentId: string, content: string) => {
    try {
      const result = await updateComment(commentId, content);
      if (result.success) {
        toast.success('Comment updated!');
      } else {
        toast.error(result.error || 'Failed to update comment');
      }
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const result = await deleteComment(commentId);
      if (result.success) {
        toast.success('Comment deleted!');
      } else {
        toast.error(result.error || 'Failed to delete comment');
      }
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
              <p className="text-sm text-gray-500">{comments.length} comments</p>
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSortBy('new')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  sortBy === 'new' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                New
              </button>
              <button
                onClick={() => setSortBy('top')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  sortBy === 'top' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Top
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
              <p className="text-gray-500">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                level={0}
                onReply={setReplyingTo}
                onLike={handleLike}
                onEdit={handleEdit}
                onDelete={handleDelete}
                likedComments={likedComments}
                currentUser={currentUser}
              />
            ))
          )}
        </div>

        {/* Reply Input */}
        {replyingTo && (
          <div className="px-6 py-4 border-t border-gray-100 bg-blue-50">
            <div className="flex items-center space-x-2 mb-2">
              <Reply className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Replying to comment</span>
              <button
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Cancel
              </button>
            </div>
            <div className="flex space-x-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                maxLength={500}
              />
              <button
                onClick={() => handleReply(replyingTo)}
                disabled={submitting || !replyContent.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* New Comment Input */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {currentUser?.email ? currentUser.email[0].toUpperCase() : '?'}
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {newComment.length}/500 characters
                </span>
                <button
                  onClick={handleAddComment}
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-gray-300 transition-colors disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>Comment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;