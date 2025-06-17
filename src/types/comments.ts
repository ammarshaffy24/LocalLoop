export interface Comment {
  id: string;
  tip_id: string;
  user_id?: string;
  user_email?: string;
  user_fingerprint: string;
  parent_id?: string;
  content: string;
  likes: number;
  created_at: string;
  updated_at: string;
  reply_count?: number;
  
  // Client-side properties
  replies?: Comment[];
  isLiked?: boolean;
  isExpanded?: boolean;
}

export interface CommentLike {
  id: string;
  comment_id: string;
  user_id?: string;
  user_fingerprint: string;
  created_at: string;
}

export type CommentSortBy = 'new' | 'top';