import React from 'react';
import { Wifi, WifiOff, Download, FolderSync as Sync } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { useOfflineStorage } from '../hooks/useOfflineStorage';

const OfflineIndicator: React.FC = () => {
  const { isOffline } = usePWA();
  const { savedTips, pendingTipsCount, syncPendingTips } = useOfflineStorage();

  if (!isOffline && pendingTipsCount === 0) {
    return null;
  }

  const handleSync = () => {
    syncPendingTips();
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[1000]">
      <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 shadow-lg backdrop-blur-sm ${
        isOffline 
          ? 'bg-orange-100/90 text-orange-700 border border-orange-200' 
          : 'bg-blue-100/90 text-blue-700 border border-blue-200'
      }`}>
        {isOffline ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Offline Mode</span>
            {savedTips.length > 0 && (
              <>
                <span>•</span>
                <Download className="h-3 w-3" />
                <span>{savedTips.length} saved</span>
              </>
            )}
          </>
        ) : pendingTipsCount > 0 ? (
          <>
            <Sync className="h-4 w-4 animate-spin" />
            <span>{pendingTipsCount} tips syncing...</span>
            <button
              onClick={handleSync}
              className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              Sync Now
            </button>
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4" />
            <span>Online</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;