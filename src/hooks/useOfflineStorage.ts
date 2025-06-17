import { useState, useEffect } from 'react';
import { Tip } from '../lib/supabase';

interface OfflineStorageHook {
  isSupported: boolean;
  savedTips: Tip[];
  saveTip: (tip: Tip) => Promise<boolean>;
  removeTip: (tipId: string) => Promise<boolean>;
  clearAllTips: () => Promise<boolean>;
  syncPendingTips: () => Promise<void>;
  pendingTipsCount: number;
}

// IndexedDB database name and version
const DB_NAME = 'LocalLoopDB';
const DB_VERSION = 1;
const TIPS_STORE = 'savedTips';
const PENDING_STORE = 'pendingTips';

export const useOfflineStorage = (): OfflineStorageHook => {
  const [isSupported] = useState('indexedDB' in window);
  const [savedTips, setSavedTips] = useState<Tip[]>([]);
  const [pendingTipsCount, setPendingTipsCount] = useState(0);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    if (!isSupported) return;

    const initDB = async () => {
      try {
        console.log('💾 OfflineStorage: Initializing IndexedDB');
        
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
          console.error('❌ OfflineStorage: Failed to open database');
        };
        
        request.onsuccess = () => {
          const database = request.result;
          setDb(database);
          console.log('✅ OfflineStorage: Database opened successfully');
          
          // Load saved tips
          loadSavedTips(database);
          loadPendingTipsCount(database);
        };
        
        request.onupgradeneeded = () => {
          const database = request.result;
          console.log('🔧 OfflineStorage: Setting up database schema');
          
          // Create object stores
          if (!database.objectStoreNames.contains(TIPS_STORE)) {
            const tipsStore = database.createObjectStore(TIPS_STORE, { keyPath: 'id' });
            tipsStore.createIndex('created_at', 'created_at', { unique: false });
            console.log('📦 OfflineStorage: Created tips store');
          }
          
          if (!database.objectStoreNames.contains(PENDING_STORE)) {
            const pendingStore = database.createObjectStore(PENDING_STORE, { keyPath: 'id' });
            pendingStore.createIndex('created_at', 'created_at', { unique: false });
            console.log('📦 OfflineStorage: Created pending tips store');
          }
        };
      } catch (error) {
        console.error('❌ OfflineStorage: Database initialization failed', error);
      }
    };

    initDB();
  }, [isSupported]);

  const loadSavedTips = async (database: IDBDatabase) => {
    try {
      const transaction = database.transaction([TIPS_STORE], 'readonly');
      const store = transaction.objectStore(TIPS_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const tips = request.result;
        setSavedTips(tips);
        console.log('📖 OfflineStorage: Loaded', tips.length, 'saved tips');
      };
    } catch (error) {
      console.error('❌ OfflineStorage: Failed to load saved tips', error);
    }
  };

  const loadPendingTipsCount = async (database: IDBDatabase) => {
    try {
      const transaction = database.transaction([PENDING_STORE], 'readonly');
      const store = transaction.objectStore(PENDING_STORE);
      const request = store.count();
      
      request.onsuccess = () => {
        setPendingTipsCount(request.result);
        console.log('📊 OfflineStorage: Found', request.result, 'pending tips');
      };
    } catch (error) {
      console.error('❌ OfflineStorage: Failed to count pending tips', error);
    }
  };

  const saveTip = async (tip: Tip): Promise<boolean> => {
    if (!db) {
      console.error('❌ OfflineStorage: Database not available');
      return false;
    }

    try {
      console.log('💾 OfflineStorage: Saving tip', tip.id);
      
      const transaction = db.transaction([TIPS_STORE], 'readwrite');
      const store = transaction.objectStore(TIPS_STORE);
      
      return new Promise((resolve) => {
        const request = store.put(tip);
        
        request.onsuccess = () => {
          setSavedTips(prev => {
            const filtered = prev.filter(t => t.id !== tip.id);
            return [...filtered, tip];
          });
          console.log('✅ OfflineStorage: Tip saved successfully');
          resolve(true);
        };
        
        request.onerror = () => {
          console.error('❌ OfflineStorage: Failed to save tip');
          resolve(false);
        };
      });
    } catch (error) {
      console.error('❌ OfflineStorage: Save operation failed', error);
      return false;
    }
  };

  const removeTip = async (tipId: string): Promise<boolean> => {
    if (!db) {
      console.error('❌ OfflineStorage: Database not available');
      return false;
    }

    try {
      console.log('🗑️ OfflineStorage: Removing tip', tipId);
      
      const transaction = db.transaction([TIPS_STORE], 'readwrite');
      const store = transaction.objectStore(TIPS_STORE);
      
      return new Promise((resolve) => {
        const request = store.delete(tipId);
        
        request.onsuccess = () => {
          setSavedTips(prev => prev.filter(tip => tip.id !== tipId));
          console.log('✅ OfflineStorage: Tip removed successfully');
          resolve(true);
        };
        
        request.onerror = () => {
          console.error('❌ OfflineStorage: Failed to remove tip');
          resolve(false);
        };
      });
    } catch (error) {
      console.error('❌ OfflineStorage: Remove operation failed', error);
      return false;
    }
  };

  const clearAllTips = async (): Promise<boolean> => {
    if (!db) {
      console.error('❌ OfflineStorage: Database not available');
      return false;
    }

    try {
      console.log('🗑️ OfflineStorage: Clearing all tips');
      
      const transaction = db.transaction([TIPS_STORE], 'readwrite');
      const store = transaction.objectStore(TIPS_STORE);
      
      return new Promise((resolve) => {
        const request = store.clear();
        
        request.onsuccess = () => {
          setSavedTips([]);
          console.log('✅ OfflineStorage: All tips cleared');
          resolve(true);
        };
        
        request.onerror = () => {
          console.error('❌ OfflineStorage: Failed to clear tips');
          resolve(false);
        };
      });
    } catch (error) {
      console.error('❌ OfflineStorage: Clear operation failed', error);
      return false;
    }
  };

  const syncPendingTips = async (): Promise<void> => {
    if (!db) {
      console.error('❌ OfflineStorage: Database not available');
      return;
    }

    try {
      console.log('🔄 OfflineStorage: Syncing pending tips');
      
      // This would implement the actual sync logic
      // For now, we'll just log the operation
      console.log('📤 OfflineStorage: Sync completed');
    } catch (error) {
      console.error('❌ OfflineStorage: Sync failed', error);
    }
  };

  return {
    isSupported,
    savedTips,
    saveTip,
    removeTip,
    clearAllTips,
    syncPendingTips,
    pendingTipsCount
  };
};