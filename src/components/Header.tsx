import React, { useState, useEffect } from 'react';
import { MapPin, LogIn, User as UserIcon, LogOut, HelpCircle, BarChart3 } from 'lucide-react';
import { type User, onAuthStateChange, signOut } from '../lib/auth';
import AuthModal from './AuthModal';
import UserTipsModal from './UserTipsModal';

interface HeaderProps {
  onTipUpdated?: () => void;
  onShowOnboarding?: () => void;
  onShowStats?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onTipUpdated, 
  onShowOnboarding, 
  onShowStats
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserTipsModal, setShowUserTipsModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 Setting up auth state listener');
    
    const { data: { subscription } } = onAuthStateChange((user) => {
      console.log('🔄 Auth state changed in Header:', user?.email || 'anonymous');
      setUser(user);
      setAuthLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleUserTipsUpdated = () => {
    if (onTipUpdated) {
      onTipUpdated();
    }
  };

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-[1000] bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex flex-col xs:flex-row items-center justify-between h-16 sm:h-20 gap-2 xs:gap-0">
            {/* Left side - Logo and branding */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Bolt Logo - clickable link to bolt.new */}
              <a 
                href="https://bolt.new" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 hover:scale-105 transition-all duration-200 group"
                title="Powered by Bolt"
              >
                <img 
                  src="/white_circle_360x360.png" 
                  alt="Powered by Bolt" 
                  className="w-full h-full object-contain group-hover:opacity-90 transition-opacity"
                />
              </a>
              
              {/* LocalLoop branding */}
              <div className="flex items-center space-x-2">
                <div className="bg-emerald-500 p-1.5 sm:p-2 rounded-xl shadow-lg">
                  <MapPin className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="hidden xs:block">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">LocalLoop</h1>
                  <p className="text-xs text-gray-600 hidden sm:block">Discover local tips</p>
                </div>
              </div>
            </div>
            
            {/* Right side - Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 mt-2 xs:mt-0">
              {/* Desktop instruction text */}
              <div className="hidden lg:flex items-center space-x-4 mr-4">
                <span className="text-sm text-gray-600">Click anywhere to drop a tip</span>
              </div>
              
              {/* Stats Button */}
              {onShowStats && (
                <button
                  onClick={onShowStats}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-all duration-200 hover:scale-105 btn-hover"
                  title="View statistics"
                >
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline text-sm font-medium">Stats</span>
                </button>
              )}
              
              {/* Auth Section */}
              {authLoading ? (
                <div className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse bg-gray-200 rounded-full"></div>
              ) : user ? (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setShowUserTipsModal(true)}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-all duration-200 hover:scale-105 btn-hover"
                    title="View your tips"
                  >
                    <UserIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline text-sm font-medium">My Tips</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 hover:scale-105 btn-hover"
                    title="Sign out"
                  >
                    <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all duration-200 hover:scale-105 btn-hover shadow-lg"
                >
                  <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline text-sm font-medium">Sign In</span>
                </button>
              )}

              {/* Help Button */}
              {onShowOnboarding && (
                <button
                  onClick={onShowOnboarding}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all duration-200 hover:scale-105 btn-hover font-semibold"
                  title="Show tutorial"
                >
                  <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="inline text-sm font-medium">Tutorial</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* User Tips Modal */}
      {user && (
        <UserTipsModal
          isOpen={showUserTipsModal}
          onClose={() => setShowUserTipsModal(false)}
          user={user}
          onTipUpdated={handleUserTipsUpdated}
        />
      )}
    </>
  );
};

export default Header;