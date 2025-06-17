import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import MapComponent from './components/Map';
import FloatingButton from './components/FloatingButton';
import FilterPanel from './components/FilterPanel';
import TipModal from './components/TipModal';
import OnboardingModal from './components/OnboardingModal';
import StatsModal from './components/StatsModal';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import NotificationPrompt from './components/NotificationPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import { supabase, type Tip } from './lib/supabase';
import { onAuthStateChange, type User } from './lib/auth';

function App() {
  const [showTipModal, setShowTipModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [tips, setTips] = useState<Tip[]>([]);
  const [filteredTips, setFilteredTips] = useState<Tip[]>([]);
  const [newTip, setNewTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [clickedLocation, setClickedLocation] = useState<[number, number] | null>(null);

  // FIXED: Check if user has seen onboarding - show by default for new users
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('localloop-onboarding-completed');
    if (!hasSeenOnboarding) {
      console.log('🎯 New user detected - showing onboarding by default');
      setShowOnboarding(true);
    }
  }, []);

  // Set up auth state listener
  useEffect(() => {
    console.log('🔐 Setting up auth state listener in App');
    
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      console.log('🔄 Auth state changed in App:', user?.email || 'anonymous');
      setUser(user);
    });

    return () => {
      console.log('🧹 Cleaning up auth listener in App');
      subscription.unsubscribe();
    };
  }, []);

  // Load tips from Supabase on component mount
  useEffect(() => {
    loadTips();
  }, []);

  // Register service worker for PWA functionality
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          console.log('🔧 PWA: Registering service worker...');
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('✅ PWA: Service worker registered successfully', registration);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            console.log('🔄 PWA: New service worker available');
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🆕 PWA: New content available, will update on next visit');
                }
              });
            }
          });
        } catch (error) {
          console.error('❌ PWA: Service worker registration failed', error);
        }
      });
    }
  }, []);

  const loadTips = async () => {
    try {
      setError(null);
      console.log('🔄 Loading tips from Supabase...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Loading tips timed out after 10 seconds')), 10000);
      });
      
      const loadPromise = supabase
        .from('tips')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error: supabaseError } = await Promise.race([loadPromise, timeoutPromise]);

      if (supabaseError) {
        console.error('❌ Supabase error:', supabaseError);
        
        // Check for specific error types
        if (supabaseError.message?.includes('Supabase not configured')) {
          setError('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
        } else if (supabaseError.message?.includes('relation') && supabaseError.message?.includes('does not exist')) {
          setError('Database tables not found. Please run the database migrations in your Supabase project.');
        } else {
          setError(`Database error: ${supabaseError.message}`);
        }
        throw supabaseError;
      }
      
      console.log('✅ Raw data from Supabase:', data);
      console.log('📊 Number of tips loaded:', data?.length || 0);
      
      // Validate data structure
      if (data) {
        data.forEach((tip: Tip, index: number) => {
          console.log(`🔍 Tip ${index + 1}:`, {
            id: tip.id,
            category: tip.category,
            description: tip.description?.substring(0, 50) + '...',
            lat: tip.lat,
            lng: tip.lng,
            created_at: tip.created_at,
            last_confirmed_at: tip.last_confirmed_at,
            user_id: tip.user_id ? 'has owner' : 'anonymous',
            user_email: tip.user_email || 'anonymous'
          });
        });
      }
      
      const validTips = data || [];
      setTips(validTips);
      setFilteredTips(validTips); // Initialize filtered tips
      console.log('🎯 Tips set in state:', validTips.length);
      
    } catch (error) {
      console.error('💥 Error loading tips:', error);
      
      // Don't set error state for configuration issues - let the user see the setup instructions
      if (error instanceof Error && !error.message.includes('Supabase not configured')) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log('🗺️ Map clicked at:', { lat, lng });
    setClickedLocation([lat, lng]);
    setShowTipModal(true);
  };

  const handleFloatingButtonClick = () => {
    console.log('🎯 Floating button clicked, opening modal without location');
    setClickedLocation(null); // No specific location from floating button
    setShowTipModal(true);
  };

  const handleTipCreated = async (tip: Tip) => {
    console.log('✨ New tip created:', tip);
    
    // Add the new tip to the state immediately for optimistic UI
    setTips(prevTips => {
      const newTips = [tip, ...prevTips];
      console.log('🔄 Updated tips array length:', newTips.length);
      return newTips;
    });
    setNewTip(tip);
    
    // Clear the new tip animation after a delay
    setTimeout(() => setNewTip(null), 3000);
    
    // Reload all tips to ensure consistency
    setTimeout(() => {
      loadTips();
    }, 1000);
  };

  const handleTipConfirmed = () => {
    console.log('✅ Tip confirmed, reloading tips...');
    loadTips();
  };

  const handleModalClose = () => {
    console.log('❌ Modal closed');
    setShowTipModal(false);
    setClickedLocation(null); // Clear clicked location when modal closes
  };

  const handleFilterChange = (filtered: Tip[]) => {
    console.log('🔍 Filter changed, showing', filtered.length, 'of', tips.length, 'tips');
    setFilteredTips(filtered);
  };

  const handleTipUpdated = () => {
    console.log('🔄 Tip updated, reloading tips...');
    loadTips();
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('localloop-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleShowStats = () => {
    setShowStats(true);
  };

  // Calculate tip statistics
  const tipStats = {
    total: tips.length,
    filtered: filteredTips.length,
    byCategory: tips.reduce((acc, tip) => {
      acc[tip.category] = (acc[tip.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    expired: tips.filter(tip => {
      if (!tip.last_confirmed_at) return false;
      const daysSinceConfirmed = (Date.now() - new Date(tip.last_confirmed_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceConfirmed > 7;
    }).length,
    nature: tips.filter(tip => tip.category === 'Nature').length,
    userOwned: tips.filter(tip => tip.user_id === user?.id).length
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading LocalLoop...</p>
          <p className="text-xs text-gray-500 mt-2">Fetching tips from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-2xl mx-auto p-6">
          <div className="bg-red-100 p-6 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h2>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            
            {error.includes('Supabase not configured') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-blue-800 mb-2">🔧 Setup Instructions:</h3>
                <ol className="text-left text-blue-700 text-sm space-y-1">
                  <li>1. Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a> and create a new project</li>
                  <li>2. Wait for your project to be ready (this can take a few minutes)</li>
                  <li>3. Go to Settings → API in your Supabase dashboard</li>
                  <li>4. Copy your Project URL and anon/public key</li>
                  <li>5. Update your .env file with the real values</li>
                  <li>6. Restart your development server</li>
                </ol>
              </div>
            )}
          </div>
          <button
            onClick={loadTips}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gray-50">
      <Header 
        onTipUpdated={handleTipUpdated} 
        onShowOnboarding={handleShowOnboarding}
        onShowStats={handleShowStats}
      />
      {/* Map Container - Adjusted for mobile header height */}
      <div className="absolute inset-0 pt-16 sm:pt-20 pb-20 sm:pb-0"> {/* Add bottom padding for mobile overlays */}
        <MapComponent 
          tips={filteredTips} // Use filtered tips instead of all tips
          newTip={newTip} 
          onTipConfirmed={handleTipConfirmed}
          onMapClick={handleMapClick} // Pass the map click handler
        />
      </div>
      {/* Filter Panel - Mobile optimized */}
      <FilterPanel 
        tips={tips} 
        onFilterChange={handleFilterChange}
      />
      <FloatingButton onClick={handleFloatingButtonClick} />
      {/* PWA Components */}
      <PWAInstallPrompt />
      <NotificationPrompt />
      <OfflineIndicator />
      {/* Onboarding Modal - Shows by default for new users */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
      {/* Stats Modal */}
      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
      />
      {/* Tip Modal with error boundary */}
      {showTipModal && (
        <TipModal
          isOpen={showTipModal}
          onClose={handleModalClose}
          onTipCreated={handleTipCreated}
          initialLocation={clickedLocation} // Pass the clicked location
        />
      )}
      {/* Toast notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            fontWeight: '500',
          },
        }}
      />
      {/* Mobile instructions - Only show on mobile */}
      <div className="sm:hidden absolute top-20 left-2 right-2 z-[900]">
        <div className="bg-white/95 backdrop-blur p-3 rounded-lg shadow-md border border-white/30">
          <p className="text-xs text-gray-700 text-center">
            Tap anywhere on the map or use the + button to share local tips
          </p>
        </div>
      </div>
      {/* Enhanced Debug Panel - Mobile optimized */}
      <div className="absolute bottom-4 left-2 right-2 sm:left-4 sm:right-auto bg-black/90 text-white p-2 sm:p-4 rounded-lg text-xs z-[1000] max-w-xs sm:max-w-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-red-400">📍</span>
            <span>Total tips: <strong className="text-emerald-400">{tips.length}</strong></span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-blue-400">🔍</span>
            <span>Filtered: <strong className="text-emerald-400">{filteredTips.length}</strong></span>
          </div>
          
          {user && tipStats.userOwned > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-purple-400">👤</span>
              <span>Your tips: <strong className="text-emerald-400">{tipStats.userOwned}</strong></span>
            </div>
          )}
          
          {tipStats.nature > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-green-400">🌿</span>
              <span>Nature tips: <strong className="text-emerald-400">{tipStats.nature}</strong></span>
            </div>
          )}
          
          {tipStats.expired > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">⏰</span>
              <span>Expired tips: <strong className="text-yellow-400">{tipStats.expired}</strong></span>
            </div>
          )}
          
          <div className="text-gray-400 text-[10px] mt-2 hidden sm:block">
            <span>📊 Categories: {Object.keys(tipStats.byCategory).join(', ')}</span>
          </div>

          {/* Modal state debugging - Simplified for mobile */}
          <div className="border-t border-gray-600 pt-2 mt-2">
            <div className="text-[10px] text-gray-400">
              <div>User: {user ? user.email : 'Anonymous'}</div>
              <div>Modal Open: {showTipModal ? '✅ Yes' : '❌ No'}</div>
              <div>Database Status: {error ? '❌ Error' : '✅ Connected'}</div>
              <div>Tips in State: {tips.length}</div>
              {clickedLocation && (
                <div className="hidden sm:block">Last Click: [{clickedLocation[0].toFixed(3)}, {clickedLocation[1].toFixed(3)}]</div>
              )}
              <div className="mt-1 hidden sm:block">
                {filteredTips.slice(0, 3).map((tip, i) => (
                  <div key={tip.id}>
                    {i + 1}. {tip.category} at [{tip.lat.toFixed(3)}, {tip.lng.toFixed(3)}]
                  </div>
                ))}
                {filteredTips.length > 3 && <div>... and {filteredTips.length - 3} more</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status Indicator - Mobile optimized */}
      <div className="absolute top-16 sm:top-20 left-2 sm:left-4 z-[900]">
        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
          error 
            ? 'bg-red-100 text-red-700 border border-red-200' 
            : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {error ? '🔴 Connection Error' : '🟢 Connected'}
        </div>
      </div>

      {/* ADDED: Tutorial Refresh Prompt - Mobile optimized */}
      <div className="absolute top-16 sm:top-20 right-2 sm:right-4 z-[900]">
        <button
          onClick={() => {
            localStorage.removeItem('localloop-onboarding-completed');
            setShowOnboarding(true);
          }}
          className="px-2 sm:px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full text-xs font-medium transition-colors border border-blue-200"
          title="Show tutorial again"
        >
          🎯 Tutorial
        </button>
      </div>
    </div>
  );
}

export default App;