import React, { useState, useEffect } from 'react';
import { X, MapPin, Edit3, Trash2, Clock, Heart, AlertTriangle } from 'lucide-react';
import { supabase, type Tip, isTipExpired, getDaysUntilExpiration } from '../lib/supabase';
import { type User } from '../lib/auth';
import toast from 'react-hot-toast';

interface UserTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onTipUpdated: () => void;
}

const UserTipsModal: React.FC<UserTipsModalProps> = ({ isOpen, onClose, user, onTipUpdated }) => {
  const [userTips, setUserTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [deletingTip, setDeletingTip] = useState<string | null>(null);
  const [updatingTip, setUpdatingTip] = useState<string | null>(null);

  const categories = [
    'Shortcuts', 'Free Stuff', 'Hidden Gems', 'Food & Drink', 'Shopping',
    'Nature', 'Entertainment', 'Services', 'Events', 'Other'
  ];

  useEffect(() => {
    if (isOpen && user) {
      loadUserTips();
    }
  }, [isOpen, user]);

  const loadUserTips = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading tips for user:', user.email);

      // Add timeout to prevent infinite hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Loading user tips timed out after 10 seconds')), 10000);
      });
      
      const loadPromise = supabase
        .from('tips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([loadPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Error loading user tips:', error);
        throw error;
      }

      console.log('✅ Loaded user tips:', data?.length || 0);
      setUserTips(data || []);
    } catch (error) {
      console.error('💥 Failed to load user tips:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load your tips';
      toast.error(errorMessage);
    } finally {
      // CRITICAL: Always clear the loading state
      console.log('🏁 FINALLY: Clearing loading state');
      setLoading(false);
    }
  };

  const handleEditTip = (tip: Tip) => {
    setEditingTip(tip);
    setEditDescription(tip.description);
    setEditCategory(tip.category);
  };

  const handleUpdateTip = async () => {
    if (!editingTip || !editDescription.trim() || !editCategory) {
      toast.error('Please fill in all fields');
      return;
    }

    setUpdatingTip(editingTip.id);

    try {
      // Add timeout to prevent infinite hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Update operation timed out after 10 seconds')), 10000);
      });
      
      const updatePromise = supabase
        .from('tips')
        .update({
          description: editDescription.trim(),
          category: editCategory,
        })
        .eq('id', editingTip.id);

      const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

      if (error) throw error;

      toast.success('Tip updated successfully! 🎉');
      setEditingTip(null);
      loadUserTips();
      onTipUpdated();
    } catch (error) {
      console.error('Error updating tip:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update tip';
      toast.error(errorMessage);
    } finally {
      // CRITICAL: Always clear the updating state
      console.log('🏁 FINALLY: Clearing updating state');
      setUpdatingTip(null);
    }
  };

  const handleDeleteTip = async (tip: Tip) => {
    const confirmMessage = `Are you sure you want to delete this tip?\n\n"${
      tip.description.length > 100 ? tip.description.substring(0, 100) + '...' : tip.description
    }"\n\nThis action cannot be undone.`;

    if (!window.confirm(confirmMessage)) return;

    setDeletingTip(tip.id);

    try {
      // Add timeout to prevent infinite hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Delete operation timed out after 10 seconds')), 10000);
      });
      
      const deletePromise = supabase
        .from('tips')
        .delete()
        .eq('id', tip.id);

      const { error } = await Promise.race([deletePromise, timeoutPromise]) as any;

      if (error) throw error;

      toast.success('Tip deleted successfully! 🗑️');
      loadUserTips();
      onTipUpdated();
    } catch (error) {
      console.error('Error deleting tip:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete tip';
      toast.error(errorMessage);
    } finally {
      // CRITICAL: Always clear the deleting state
      console.log('🏁 FINALLY: Clearing deleting state');
      setDeletingTip(null);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Shortcuts': 'bg-blue-100 text-blue-700 border-blue-200',
      'Free Stuff': 'bg-green-100 text-green-700 border-green-200',
      'Hidden Gems': 'bg-purple-100 text-purple-700 border-purple-200',
      'Food & Drink': 'bg-orange-100 text-orange-700 border-orange-200',
      'Shopping': 'bg-pink-100 text-pink-700 border-pink-200',
      'Nature': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Entertainment': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Services': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Events': 'bg-red-100 text-red-700 border-red-200',
      'Other': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">My Tips</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your tips...</p>
              </div>
            </div>
          ) : userTips.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tips Yet</h3>
              <p className="text-gray-500 mb-4">You haven't shared any tips yet.</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Start Sharing Tips
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Your Tips ({userTips.length})
                </h3>
              </div>

              {userTips.map((tip) => {
                const isExpired = isTipExpired(tip.last_confirmed_at);
                const daysUntilExpiration = getDaysUntilExpiration(tip.last_confirmed_at);
                const isEditing = editingTip?.id === tip.id;
                const isDeleting = deletingTip === tip.id;
                const isUpdating = updatingTip === tip.id;

                return (
                  <div key={tip.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {isEditing ? (
                      /* Edit Mode */
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                            maxLength={500}
                          />
                          <p className="text-xs text-gray-500 mt-1">{editDescription.length}/500 characters</p>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdateTip}
                            disabled={isUpdating}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-emerald-300 transition-colors disabled:cursor-not-allowed"
                          >
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={() => setEditingTip(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div>
                        {/* Expiration Warning */}
                        {isExpired && (
                          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center space-x-2 text-red-700">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm font-medium">This tip has expired</span>
                            </div>
                          </div>
                        )}

                        {!isExpired && daysUntilExpiration <= 2 && (
                          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center space-x-2 text-yellow-700">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                Expires in {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium mb-2">{tip.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(tip.category)}`}>
                                {tip.category}
                              </span>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{getTimeAgo(tip.created_at)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart className="h-3 w-3" />
                                <span>{tip.confirmations} confirmation{tip.confirmations !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleEditTip(tip)}
                              className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Edit tip"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTip(tip)}
                              disabled={isDeleting}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:cursor-not-allowed"
                              title="Delete tip"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-gray-400">
                          Location: {tip.lat.toFixed(6)}, {tip.lng.toFixed(6)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTipsModal;