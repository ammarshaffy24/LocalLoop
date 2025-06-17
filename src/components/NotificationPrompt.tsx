import React, { useState, useEffect } from 'react';
import { Bell, BellOff, X, MapPin } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationPrompt: React.FC = () => {
  const { permission, isSupported, requestPermission, subscribeToUpdates } = useNotifications();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Show prompt after user has been active for a while
    const timer = setTimeout(() => {
      if (isSupported && permission === 'default') {
        const hasSeenPrompt = localStorage.getItem('notification-prompt-seen');
        if (!hasSeenPrompt) {
          setShowPrompt(true);
        }
      }
    }, 30000); // Show after 30 seconds

    return () => clearTimeout(timer);
  }, [isSupported, permission]);

  const handleEnable = async () => {
    setIsRequesting(true);
    
    try {
      const granted = await requestPermission();
      
      if (granted) {
        // Subscribe to push notifications
        await subscribeToUpdates();
        setShowPrompt(false);
        localStorage.setItem('notification-prompt-seen', 'true');
      }
    } catch (error) {
      console.error('❌ Notifications: Failed to enable', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('notification-prompt-seen', 'true');
  };

  if (!showPrompt || !isSupported || permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[2000] sm:left-auto sm:right-4 sm:w-96">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 slide-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Stay Updated</h3>
              <p className="text-gray-600 text-sm">Get notified about new tips near you</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-700">New tips discovered in your area</span>
          </div>
          <div className="flex items-center space-x-3">
            <Bell className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-700">Tips that match your interests</span>
          </div>
          <div className="flex items-center space-x-3">
            <BellOff className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-700">You can disable anytime in settings</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={handleEnable}
            disabled={isRequesting}
            className="flex-1 bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-600 disabled:bg-blue-300 transition-colors flex items-center justify-center space-x-2"
          >
            {isRequesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Enabling...</span>
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                <span>Enable Notifications</span>
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Not now
          </button>
        </div>

        {/* Privacy note */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            🔒 We respect your privacy. Notifications are sent only for relevant local tips.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;