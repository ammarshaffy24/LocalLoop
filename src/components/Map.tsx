import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Heart, MessageCircle, CheckCircle, Clock, AlertTriangle, MapPin, Trash2, Camera } from 'lucide-react';
import { supabase, type Tip, isTipExpired, getDaysUntilExpiration, getUserConfirmations, toggleTipConfirmation } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import CommentSection from './CommentSection';
import toast from 'react-hot-toast';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapProps {
  tips: Tip[];
  newTip?: Tip | null;
  onTipConfirmed: () => void;
  onMapClick: (lat: number, lng: number) => void;
}

// Component to fit all tips in view
const FitBoundsController: React.FC<{ tips: Tip[]; shouldFit: boolean; onFitComplete: () => void }> = ({ 
  tips, 
  shouldFit, 
  onFitComplete 
}) => {
  const map = useMap();

  useEffect(() => {
    if (shouldFit && tips.length > 0) {
      console.log('🎯 Fitting bounds to show all tips:', tips.length);
      
      const bounds = L.latLngBounds(tips.map(tip => [tip.lat, tip.lng]));
      
      // Add some padding around the bounds
      const paddedBounds = bounds.pad(0.1);
      
      map.fitBounds(paddedBounds, {
        padding: [20, 20],
        maxZoom: 15
      });
      
      onFitComplete();
    }
  }, [map, tips, shouldFit, onFitComplete]);

  return null;
};

// Component for handling map clicks to add tips
const MapClickHandler: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      console.log('🗺️ Map clicked at:', e.latlng);
      onMapClick(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
};

// Component for handling edge-based map navigation (both horizontal and vertical)
const EdgeNavigation: React.FC = () => {
  const map = useMap();
  const animationRef = useRef<number>();
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleDragStart = () => {
      isDraggingRef.current = true;
    };

    const handleDragEnd = () => {
      isDraggingRef.current = false;
    };

    const animate = () => {
      if (!isDraggingRef.current) {
        const { x, y } = mousePositionRef.current;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const edgeThreshold = 50;
        const panSpeed = 3;

        // Horizontal navigation (existing)
        if (x <= edgeThreshold && x > 0) {
          // Pan left
          const intensity = (edgeThreshold - x) / edgeThreshold;
          map.panBy([-panSpeed * intensity, 0], { animate: false });
        } else if (x >= windowWidth - edgeThreshold && x < windowWidth) {
          // Pan right
          const intensity = (x - (windowWidth - edgeThreshold)) / edgeThreshold;
          map.panBy([panSpeed * intensity, 0], { animate: false });
        }

        // Vertical navigation (new)
        if (y <= edgeThreshold + 64 && y > 64) { // +64 to account for header height
          // Pan up
          const intensity = (edgeThreshold - (y - 64)) / edgeThreshold;
          map.panBy([0, -panSpeed * intensity], { animate: false });
        } else if (y >= windowHeight - edgeThreshold && y < windowHeight) {
          // Pan down
          const intensity = (y - (windowHeight - edgeThreshold)) / edgeThreshold;
          map.panBy([0, panSpeed * intensity], { animate: false });
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animationRef.current = requestAnimationFrame(animate);

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    map.on('dragstart', handleDragStart);
    map.on('dragend', handleDragEnd);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      map.off('dragstart', handleDragStart);
      map.off('dragend', handleDragEnd);
    };
  }, [map]);

  return null;
};

const MapComponent: React.FC<MapProps> = ({ tips, newTip, onTipConfirmed, onMapClick }) => {
  const [animatingTip, setAnimatingTip] = useState<string | null>(null);
  const [confirmingTip, setConfirmingTip] = useState<string | null>(null);
  const [deletingTip, setDeletingTip] = useState<string | null>(null);
  const [shouldFitBounds, setShouldFitBounds] = useState(false);
  const [userConfirmations, setUserConfirmations] = useState<Set<string>>(new Set());
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, { confirmations: number; confirmed: boolean }>>(new Map());
  const [showComments, setShowComments] = useState<string | null>(null);

  // Debug: Log tips when they change
  useEffect(() => {
    console.log('🗺️ MapComponent received tips:', tips.length);
    console.log('🗺️ Tips data:', tips);
    
    // Log all tip positions
    tips.forEach((tip, index) => {
      console.log(`📍 Tip ${index + 1} (${tip.category}):`, {
        id: tip.id,
        position: [tip.lat, tip.lng],
        description: tip.description.substring(0, 30) + '...',
        confirmations: tip.confirmations,
        hasImage: !!tip.image_url
      });
    });
    
    // Check for Nature tips specifically
    const natureTips = tips.filter(tip => tip.category === 'Nature');
    console.log('🌿 Nature tips in MapComponent:', natureTips.length);
    natureTips.forEach((tip, index) => {
      console.log(`🌿 Nature tip ${index + 1}:`, {
        id: tip.id,
        category: tip.category,
        description: tip.description,
        lat: tip.lat,
        lng: tip.lng,
        created_at: tip.created_at,
        confirmations: tip.confirmations,
        hasImage: !!tip.image_url
      });
    });
  }, [tips]);

  // Check user confirmations for all tips efficiently - FIXED to handle errors gracefully
  useEffect(() => {
    const checkUserConfirmations = async () => {
      if (tips.length === 0) {
        console.log('ℹ️ No tips to check confirmations for');
        return;
      }
      
      console.log('🔍 Checking user confirmations for', tips.length, 'tips');
      
      try {
        // Get current user with timeout protection
        const currentUser = await getCurrentUser();
        console.log('👤 Current user for confirmations:', currentUser?.email || 'anonymous');
        
        const tipIds = tips.map(tip => tip.id);
        
        // Get confirmations with timeout protection
        const confirmedTips = await getUserConfirmations(tipIds, currentUser?.id);
        
        console.log('🎯 User has confirmed', confirmedTips.size, 'tips:', Array.from(confirmedTips));
        setUserConfirmations(confirmedTips);
      } catch (error) {
        // Handle gracefully - this is expected for anonymous users or connection issues
        console.log('ℹ️ Could not check confirmations (this is normal):', error instanceof Error ? error.message : 'Unknown error');
        setUserConfirmations(new Set()); // Set empty set as fallback
      }
    };
    
    // Add a small delay to avoid overwhelming the system
    const timeoutId = setTimeout(checkUserConfirmations, 100);
    
    return () => clearTimeout(timeoutId);
  }, [tips]);

  // Animate new tip when it's added
  useEffect(() => {
    if (newTip) {
      console.log('✨ Animating new tip:', newTip);
      setAnimatingTip(newTip.id);
      // Remove animation after 2 seconds
      const timer = setTimeout(() => {
        setAnimatingTip(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [newTip]);

  const createCustomIcon = (isAnimating = false, category = '', isExpired = false, hasImage = false) => {
    // Enhanced color mapping for better visibility
    const categoryColors: { [key: string]: string } = {
      'Shortcuts': '#3B82F6',      // Blue
      'Free Stuff': '#10B981',     // Emerald
      'Hidden Gems': '#8B5CF6',    // Purple
      'Food & Drink': '#F59E0B',   // Amber
      'Shopping': '#EC4899',       // Pink
      'Nature': '#059669',         // Emerald-600 (darker green for better visibility)
      'Entertainment': '#EAB308',  // Yellow
      'Services': '#6366F1',       // Indigo
      'Events': '#EF4444',         // Red
      'Other': '#6B7280'           // Gray
    };
    
    let color = isAnimating ? '#EF4444' : (categoryColors[category] || '#10B981');
    
    // Grey out expired tips
    if (isExpired) {
      color = '#9CA3AF'; // Gray-400
    }
    
    const scale = isAnimating ? 1.2 : 1;
    const opacity = isExpired ? 0.6 : 1;
    
    console.log(`🎨 Creating icon for category "${category}" with color ${color}${isExpired ? ' (expired)' : ''}${hasImage ? ' (with image)' : ''}`);
    
    return new L.Icon({
      iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg width="${25 * scale}" height="${41 * scale}" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
          <path d="M12.5 0C5.59644 0 0 5.59644 0 12.5C0 19.4036 12.5 41 12.5 41C12.5 41 25 19.4036 25 12.5C25 5.59644 19.4036 0 12.5 0Z" fill="${color}"/>
          <circle cx="12.5" cy="12.5" r="6" fill="white"/>
          ${hasImage ? '<circle cx="12.5" cy="12.5" r="3" fill="' + color + '"/><circle cx="12.5" cy="12.5" r="1.5" fill="white"/>' : ''}
          ${isAnimating ? '<circle cx="12.5" cy="12.5" r="3" fill="' + color + '"/>' : ''}
          ${isExpired ? '<path d="M8 8 L17 17 M17 8 L8 17" stroke="white" stroke-width="2" stroke-linecap="round"/>' : ''}
        </svg>
      `),
      iconSize: [25 * scale, 41 * scale],
      iconAnchor: [12 * scale, 41 * scale],
      popupAnchor: [1, -34 * scale],
      className: isAnimating ? 'animate-bounce' : (isExpired ? 'opacity-60' : ''),
    });
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

  const handleToggleConfirmation = async (tipId: string) => {
    console.log('🔄 TOGGLE: Button clicked for tip:', tipId);
    
    if (confirmingTip === tipId) {
      console.log('⚠️ Already processing this tip, ignoring click');
      return;
    }
    
    console.log('🎯 Starting toggle confirmation process for tip:', tipId);
    
    // Check current state
    const hasUserConfirmed = userConfirmations.has(tipId);
    console.log('🔍 Current confirmation state:', hasUserConfirmed ? 'CONFIRMED' : 'NOT CONFIRMED');
    
    setConfirmingTip(tipId);
    
    // Show immediate loading toast
    const loadingToastId = toast.loading(
      hasUserConfirmed ? 'Removing confirmation...' : 'Adding confirmation...',
      { id: tipId }
    );
    
    // Optimistic update - immediately show the opposite state
    const currentTip = tips.find(t => t.id === tipId);
    if (currentTip) {
      const newCount = hasUserConfirmed ? Math.max(0, currentTip.confirmations - 1) : currentTip.confirmations + 1;
      console.log('📈 Optimistic update:', {
        tipId: tipId.substring(0, 8) + '...',
        oldCount: currentTip.confirmations,
        newCount,
        action: hasUserConfirmed ? 'UNCONFIRM' : 'CONFIRM'
      });
      
      setOptimisticUpdates(prev => new Map(prev.set(tipId, { 
        confirmations: newCount, 
        confirmed: !hasUserConfirmed 
      })));
      
      // Update user confirmations immediately
      setUserConfirmations(prev => {
        const newSet = new Set(prev);
        if (hasUserConfirmed) {
          newSet.delete(tipId);
        } else {
          newSet.add(tipId);
        }
        return newSet;
      });
    }
    
    try {
      console.log('💾 Getting current user...');
      const currentUser = await getCurrentUser();
      console.log('👤 Current user:', currentUser?.email || 'anonymous');
      
      console.log('📞 Calling toggleTipConfirmation...');
      
      const result = await toggleTipConfirmation(tipId, currentUser?.id);
      
      console.log('🔄 Toggle result:', result);
      
      if (!result.success) {
        console.error('❌ Failed to toggle confirmation:', result.message);
        
        toast.error(`Failed: ${result.message}`, { id: loadingToastId });
        
        // Revert optimistic update
        console.log('🔄 Reverting optimistic update...');
        setOptimisticUpdates(prev => {
          const newMap = new Map(prev);
          newMap.delete(tipId);
          return newMap;
        });
        setUserConfirmations(prev => {
          const newSet = new Set(prev);
          if (hasUserConfirmed) {
            newSet.add(tipId); // Revert back to confirmed
          } else {
            newSet.delete(tipId); // Revert back to not confirmed
          }
          return newSet;
        });
        
        return;
      }
      
      console.log('✅ Toggle successful:', result.action);
      
      // Show success message
      const actionText = result.action === 'confirmed' ? 'confirmed' : 'unconfirmed';
      const emoji = result.action === 'confirmed' ? '👍' : '👎';
      
      toast.success(`${emoji} Tip ${actionText}! ${result.message}`, {
        id: loadingToastId,
        duration: 3000,
        style: {
          background: result.action === 'confirmed' ? '#10B981' : '#6B7280',
          color: 'white',
          fontWeight: '500',
        },
      });
      
      // Refresh the data in the background
      setTimeout(() => {
        console.log('🔄 Refreshing tips data...');
        onTipConfirmed();
        // Clear optimistic update after real data loads
        setTimeout(() => {
          setOptimisticUpdates(prev => {
            const newMap = new Map(prev);
            newMap.delete(tipId);
            return newMap;
          });
        }, 1000);
      }, 500);
      
    } catch (error) {
      console.error('💥 Error toggling confirmation:', error);
      
      // Revert optimistic update on error
      console.log('🔄 Reverting optimistic update due to error...');
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(tipId);
        return newMap;
      });
      setUserConfirmations(prev => {
        const newSet = new Set(prev);
        if (hasUserConfirmed) {
          newSet.add(tipId); // Revert back to confirmed
        } else {
          newSet.delete(tipId); // Revert back to not confirmed
        }
        return newSet;
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to toggle confirmation: ${errorMessage}`, { id: loadingToastId });
    } finally {
      // CRITICAL: Always clear the confirming state
      console.log('🏁 FINALLY: Clearing confirming state for tip:', tipId);
      setConfirmingTip(null);
    }
  };

  const handleDeleteTip = async (tipId: string, tipDescription: string) => {
    if (deletingTip === tipId) return;
    
    // Create the confirmation message using string concatenation instead of template literals
    const truncatedDescription = tipDescription.length > 100 
      ? tipDescription.substring(0, 100) + '...' 
      : tipDescription;
    
    const confirmMessage = 'Are you sure you want to delete this tip?\n\n"' + 
      truncatedDescription + 
      '"\n\nThis action cannot be undone.';
    
    // Show confirmation dialog
    const confirmDelete = window.confirm(confirmMessage);
    
    if (!confirmDelete) return;
    
    setDeletingTip(tipId);
    
    // Show immediate feedback
    const loadingToastId = toast.loading('Deleting tip...', { id: tipId });
    
    try {
      console.log('🗑️ Deleting tip:', tipId);
      
      // Create timeout promise - REDUCED from 15 to 8 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Delete operation timed out after 8 seconds')), 8000);
      });
      
      const deletePromise = supabase
        .from('tips')
        .delete()
        .eq('id', tipId);

      const { error } = await Promise.race([deletePromise, timeoutPromise]);

      if (error) {
        console.error('❌ Error deleting tip:', error);
        throw error;
      }

      console.log('✅ Tip deleted successfully');
      
      toast.success('🗑️ Tip deleted successfully!', {
        id: loadingToastId,
        duration: 3000,
        style: {
          background: '#EF4444',
          color: 'white',
          fontWeight: '500',
        },
      });

      // Immediate UI update
      onTipConfirmed();
    } catch (error) {
      console.error('💥 Error deleting tip:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to delete tip: ${errorMessage}`, { id: loadingToastId });
    } finally {
      // CRITICAL: Always clear the deleting state
      console.log('🏁 FINALLY: Clearing deleting state for tip:', tipId);
      setDeletingTip(null);
    }
  };

  const handleFitComplete = () => {
    setShouldFitBounds(false);
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[40.7128, -74.0060]}
        zoom={13}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <EdgeNavigation />
        <MapClickHandler onMapClick={onMapClick} />
        <FitBoundsController 
          tips={tips} 
          shouldFit={shouldFitBounds} 
          onFitComplete={handleFitComplete}
        />
        {tips.map((tip) => {
          const isAnimating = animatingTip === tip.id;
          const isConfirming = confirmingTip === tip.id;
          const isDeleting = deletingTip === tip.id;
          const isExpired = isTipExpired(tip.last_confirmed_at);
          const daysUntilExpiration = getDaysUntilExpiration(tip.last_confirmed_at);
          const hasUserConfirmed = userConfirmations.has(tip.id);
          const optimisticUpdate = optimisticUpdates.get(tip.id);
          const displayConfirmations = optimisticUpdate?.confirmations ?? tip.confirmations;
          const displayConfirmed = optimisticUpdate?.confirmed ?? hasUserConfirmed;
          const hasImage = !!tip.image_url;
          
          console.log(`🗺️ Rendering marker for tip:`, {
            id: tip.id,
            category: tip.category,
            position: [tip.lat, tip.lng],
            isAnimating,
            isExpired,
            daysUntilExpiration,
            confirmations: displayConfirmations,
            hasUserConfirmed: displayConfirmed,
            isConfirming,
            hasImage
          });
          
          return (
            <Marker 
              key={tip.id} 
              position={[tip.lat, tip.lng]} 
              icon={createCustomIcon(isAnimating, tip.category, isExpired, hasImage)}
            >
              <Popup className="custom-popup" maxWidth={350} minWidth={320}>
                <div className="p-4">
                  {/* Expiration Warning */}
                  {isExpired && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-red-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">This tip has expired</span>
                      </div>
                      <p className="text-xs text-red-600 mt-1">
                        No confirmations in the last 7 days
                      </p>
                    </div>
                  )}

                  {/* Expiration Warning for tips expiring soon */}
                  {!isExpired && daysUntilExpiration <= 2 && (
                    <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-yellow-700">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Expires in {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-yellow-600 mt-1">
                        Confirm to keep this tip active
                      </p>
                    </div>
                  )}

                  {/* Confirmation status notice */}
                  {displayConfirmed && (
                    <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">You've confirmed this tip</span>
                      </div>
                    </div>
                  )}

                  {/* Image Display */}
                  {hasImage && tip.image_url && (
                    <div className="mb-4">
                      <img
                        src={tip.image_url}
                        alt="Tip image"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                        onError={(e) => {
                          console.error('Failed to load tip image:', tip.image_url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="flex items-center justify-center mt-2">
                        <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          <Camera className="h-3 w-3" />
                          <span>Photo by community</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-4">
                    <p className={`text-sm leading-relaxed font-medium ${isExpired ? 'text-gray-500' : 'text-gray-800'}`}>
                      {tip.description}
                    </p>
                  </div>

                  {/* Category and Time */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(tip.category)} ${isExpired ? 'opacity-60' : ''}`}>
                      {tip.category}
                    </span>
                    <div className={`flex items-center space-x-1 text-xs ${isExpired ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Clock className="h-3 w-3" />
                      <span>{getTimeAgo(tip.created_at)}</span>
                    </div>
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between mb-3">
                    {/* Stats in one line */}
                    <div className={`flex items-center space-x-1 text-xs ${isExpired ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Heart className="h-3 w-3" />
                      <span className="font-medium">{displayConfirmations} confirmation{displayConfirmations !== 1 ? 's' : ''}</span>
                      <span className="text-gray-300">•</span>
                      <MessageCircle className="h-3 w-3" />
                      <span>Local tip</span>
                      {hasImage && (
                        <>
                          <span className="text-gray-300">•</span>
                          <Camera className="h-3 w-3" />
                          <span>Photo</span>
                        </>
                      )}
                    </div>
                    
                    {/* Toggle Confirm/Unconfirm Button */}
                    <button
                      onClick={() => {
                        console.log('🖱️ Toggle button clicked for tip:', tip.id);
                        handleToggleConfirmation(tip.id);
                      }}
                      disabled={isConfirming}
                      className={`flex items-center space-x-1 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed ${
                        displayConfirmed
                          ? 'bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300'
                          : isExpired 
                            ? 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300' 
                            : 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300'
                      }`}
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>
                        {isConfirming 
                          ? 'Processing...' 
                          : displayConfirmed
                            ? 'Confirmed'
                            : isExpired 
                              ? 'Reactivate' 
                              : 'Confirm'
                        }
                      </span>
                    </button>
                  </div>

                  {/* Comments and Delete Buttons */}
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    {/* Comments Button */}
                    <button
                      onClick={() => setShowComments(tip.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span>Comments</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteTip(tip.id, tip.description)}
                      disabled={isDeleting}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </span>
                    </button>
                  </div>

                  {/* Last confirmed info */}
                  {!isExpired && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        Last confirmed: {getTimeAgo(tip.last_confirmed_at)}
                        {daysUntilExpiration > 0 && (
                          <span className="ml-2">• {daysUntilExpiration} days left</span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Debug info for development */}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Debug: ID {tip.id.substring(0, 8)}... | Confirmed: {displayConfirmed ? 'Yes' : 'No'} | Processing: {isConfirming ? 'Yes' : 'No'} | Image: {hasImage ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Comment Section Modal */}
      {showComments && (
        <CommentSection
          tipId={showComments}
          isOpen={!!showComments}
          onClose={() => setShowComments(null)}
        />
      )}
    </div>
  );
};

export default MapComponent;