import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Users, TrendingUp, ArrowRight, ArrowLeft, Check, ChevronDown, Sparkles, Target, Heart, MessageSquare, Tag, Camera, Upload, Trash2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

// FIXED: Mobile-optimized Tip Creation Modal Component
const TipCreationExample: React.FC<{ 
  isVisible: boolean; 
  onClose: () => void; 
}> = ({ isVisible, onClose }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const minTimeSeconds = 10; // Reduced for mobile

  // Reset state when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      console.log('🎯 TipCreationExample: Modal becoming visible, resetting state');
      setTimeElapsed(0);
      setCanClose(false);
      setIsPaused(false);
      setIsClosing(false);
      
      // Set example image after a short delay
      setTimeout(() => {
        setImagePreview('https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400');
      }, 1000);
    }
  }, [isVisible]);

  // Timer to track elapsed time and enable closing after minimum time
  useEffect(() => {
    if (!isVisible || isPaused || isClosing) {
      return;
    }

    console.log('🕐 TipCreationExample: Starting timer, current elapsed:', timeElapsed);

    const timer = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + 1;
        console.log('⏰ Timer tick:', newTime, '/', minTimeSeconds);
        
        if (newTime >= minTimeSeconds && !canClose) {
          console.log('✅ Minimum time reached, enabling close button');
          setCanClose(true);
        }
        return newTime;
      });
    }, 1000);

    return () => {
      console.log('🧹 Cleaning up timer');
      clearInterval(timer);
    };
  }, [isVisible, isPaused, isClosing, canClose, minTimeSeconds]);

  // Handle close - only allow if minimum time has elapsed
  const handleClose = () => {
    console.log('🎯 TipCreationExample: Close requested, canClose:', canClose);
    
    if (canClose && !isClosing) {
      console.log('✅ Closing modal');
      setIsClosing(true);
      onClose();
    } else {
      console.log('❌ Cannot close yet - minimum time not elapsed');
    }
  };

  // Prevent modal from disappearing if it shouldn't
  if (!isVisible || isClosing) {
    console.log('🎯 TipCreationExample: Not rendering - isVisible:', isVisible, 'isClosing:', isClosing);
    return null;
  }

  console.log('🎯 TipCreationExample: Rendering modal - timeElapsed:', timeElapsed, 'canClose:', canClose);

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-emerald-100 p-1.5 sm:p-2 rounded-lg">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Drop a Tip</h3>
              <p className="text-xs sm:text-sm text-gray-500">Share local knowledge</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Status indicator */}
            <div className="flex items-center space-x-1 sm:space-x-2 bg-blue-50 px-2 sm:px-3 py-1 rounded-full border border-blue-200">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${canClose ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
              <span className="text-xs font-medium text-blue-700">
                {canClose ? 'Ready' : 'Reading'}
              </span>
            </div>
            <button
              onClick={handleClose}
              disabled={!canClose}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                canClose 
                  ? 'hover:bg-gray-100 text-gray-500' 
                  : 'text-gray-300 cursor-not-allowed'
              }`}
              title={canClose ? 'Close' : `Please read for ${minTimeSeconds - timeElapsed} more seconds...`}
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div 
          className="p-4 sm:p-6 space-y-3 sm:space-y-4"
          onTouchStart={() => {
            console.log('📱 Touch started - pausing timer');
            setIsPaused(true);
          }}
          onTouchEnd={() => {
            console.log('📱 Touch ended - resuming timer');
            setIsPaused(false);
          }}
          onMouseEnter={() => {
            console.log('🖱️ Mouse entered modal - pausing timer');
            setIsPaused(true);
          }}
          onMouseLeave={() => {
            console.log('🖱️ Mouse left modal - resuming timer');
            setIsPaused(false);
          }}
        >
          {/* Reading indicator */}
          {!canClose && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <div className="flex items-center space-x-2 text-yellow-700">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm font-medium">
                  {isPaused ? 'Reading paused - lift finger to continue' : 'Take your time to read - touch to pause'}
                </span>
              </div>
            </div>
          )}

          {/* Ready indicator */}
          {canClose && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
              <div className="flex items-center space-x-2 text-green-700">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium">Ready to close! You can now dismiss this example.</span>
              </div>
            </div>
          )}

          {/* Location Display - REALISTIC EXAMPLE */}
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <div className="flex items-center space-x-2 text-emerald-700">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">
                📍 Central Park West, NYC
              </span>
            </div>
          </div>

          {/* Category Selection Example - REALISTIC */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-gray-700">
              <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Category</span>
            </label>
            <div className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-emerald-200 rounded-lg bg-emerald-50">
              <span className="text-emerald-700 font-medium text-sm">Hidden Gems</span>
            </div>
            <p className="text-xs text-gray-500 italic">Perfect category for this secret spot!</p>
          </div>

          {/* Description Example - REALISTIC AND DETAILED */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-gray-700">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Description</span>
            </label>
            <div className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-emerald-200 rounded-lg bg-emerald-50 min-h-[100px] sm:min-h-[120px]">
              <p className="text-emerald-700 text-xs sm:text-sm leading-relaxed font-medium">
                "Secret rooftop garden on the 6th floor of the Ansonia building. Take the elevator to 6, turn left, and look for the unmarked door with the small plant symbol.
                <br/><br/>
                Amazing city views, especially at sunset! Usually empty during weekdays. Perfect spot for a quiet lunch break or reading.
                <br/><br/>
                Open 9am-7pm, but security doesn't check after 5pm. Bring your own seating - just a few benches available."
              </p>
            </div>
            <p className="text-xs text-gray-500 italic">Detailed, specific, and incredibly helpful!</p>
          </div>

          {/* Image Example - REALISTIC */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-gray-700">
              <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Photo</span>
              <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Added!</span>
            </label>
            
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Rooftop garden example"
                  className="w-full h-32 sm:h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                />
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  rooftop_garden_view.jpg
                </div>
                <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full">
                  <Camera className="h-2 w-2 sm:h-3 sm:w-3" />
                </div>
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              📸 Photos help others find and verify your tip! This shows the amazing view from the secret garden.
            </p>
          </div>

          {/* Example Action Buttons */}
          <div className="flex space-x-2 sm:space-x-3 pt-3 sm:pt-4">
            <button
              onClick={handleClose}
              disabled={!canClose}
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm ${
                canClose
                  ? 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  : 'text-gray-400 bg-gray-50 cursor-not-allowed'
              }`}
            >
              {canClose ? 'Close Example' : `Wait ${minTimeSeconds - timeElapsed}s...`}
            </button>
            <button
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-emerald-500 text-white rounded-lg font-medium opacity-70 cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 text-sm"
            >
              <span>🎯 Share Tip</span>
              <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs">(Demo)</span>
            </button>
          </div>
        </div>

        {/* Enhanced Info Box */}
        <div className="mx-4 sm:mx-6 mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="bg-blue-100 p-1 rounded">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-800">This is a realistic example!</p>
              <p className="text-xs text-blue-600 mt-1">
                This shows exactly how you'd share a real hidden gem in NYC. Notice the specific details, 
                helpful timing info, and photo that proves the tip is real.
              </p>
              <p className="text-xs text-blue-500 mt-2 font-medium">
                💡 Great tips include: specific location details, timing, access instructions, and photos!
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar showing minimum time requirement */}
        <div className="mx-4 sm:mx-6 mb-4 sm:mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${Math.min((timeElapsed / minTimeSeconds) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{canClose ? 'Ready to close' : `${timeElapsed}/${minTimeSeconds}s`}</span>
            <span>{isPaused ? 'Paused' : 'Touch to pause'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile-optimized scroll indicator component
const ScrollIndicator: React.FC<{ onClick: () => void; visible: boolean }> = ({ onClick, visible }) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-10">
      <button
        onClick={onClick}
        className="flex flex-col items-center space-y-1 sm:space-y-2 px-3 sm:px-4 py-2 sm:py-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/20 hover:bg-white transition-all duration-200 hover:scale-105 group"
      >
        <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800">Scroll to explore</span>
        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500 animate-bounce" />
      </button>
    </div>
  );
};

// Enhanced Trust meter component with mobile optimization
const TrustMeter: React.FC<{ value: number; animated: boolean }> = ({ value, animated }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(value);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);

  const getTrustLevel = (val: number) => {
    if (val < 30) return { text: 'Unverified', color: 'text-gray-500' };
    if (val < 60) return { text: 'Building Trust', color: 'text-yellow-600' };
    if (val < 80) return { text: 'Trusted', color: 'text-emerald-600' };
    return { text: 'Highly Trusted', color: 'text-emerald-700' };
  };

  const trustLevel = getTrustLevel(displayValue);

  return (
    <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-4 sm:p-6 shadow-xl border border-emerald-100">
      <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 sm:p-3 rounded-xl shadow-lg">
          <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Community Trust</h3>
          <p className="text-xs sm:text-sm text-gray-600">How reliable is this tip?</p>
        </div>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        <div className="flex justify-between items-center">
          <span className={`text-xs sm:text-sm font-medium ${trustLevel.color}`}>{trustLevel.text}</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-600">{Math.round(displayValue)}%</span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${displayValue}%` }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [trustValue, setTrustValue] = useState(20);
  const [confirmationCount, setConfirmationCount] = useState(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🎯 OnboardingModal: Opening, resetting all state');
      setCurrentStep(1);
      setShowTipModal(false);
      setShowConfirmation(false);
      setTrustValue(20);
      setConfirmationCount(0);
      setShowScrollIndicator(true);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      setShowScrollIndicator(true);
      
      // FIXED: Auto-show tip modal in step 2 without requiring map click
      if (currentStep === 1) {
        // Moving to step 2 - show tip modal automatically
        setTimeout(() => {
          console.log('🎯 OnboardingModal: Auto-showing tip modal for step 2');
          setShowTipModal(true);
        }, 500);
      }
      
      // If moving to step 3, start the confirmation animation
      if (currentStep === 2) {
        setTimeout(() => {
          setShowConfirmation(true);
          setConfirmationCount(1);
          setTrustValue(65);
          
          // Add more confirmations
          setTimeout(() => {
            setConfirmationCount(3);
            setTrustValue(85);
          }, 1500);
        }, 1000);
      }
    } else {
      onComplete();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setShowScrollIndicator(true);
      
      // Reset step-specific state when going back
      if (currentStep === 3) {
        setShowConfirmation(false);
        setTrustValue(20);
        setConfirmationCount(0);
      }
      if (currentStep === 2) {
        setShowTipModal(false);
      }
    }
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  const handleScroll = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth'
      });
      setShowScrollIndicator(false);
    }
  };

  // Close tip modal properly with logging
  const handleCloseTipModal = () => {
    console.log('🎯 OnboardingModal: Closing tip creation example');
    setShowTipModal(false);
  };

  const steps = [
    {
      title: "You're walking down a street...",
      subtitle: "Looking for a shortcut to avoid the crowds",
      description: "LocalLoop helps you discover local knowledge from people who know the area best. Every neighborhood has hidden gems, shortcuts, and insider tips that only locals know.",
      gradient: "from-blue-400 to-purple-600"
    },
    {
      title: "You know a shortcut!",
      subtitle: "See how easy it is to share local knowledge",
      description: "Share your knowledge with the community. Every local insight makes the neighborhood better for everyone. Your tip could save someone time, money, or help them discover something amazing.",
      gradient: "from-emerald-400 to-teal-600"
    },
    {
      title: "Someone else confirms it!",
      subtitle: "Watch how community validation builds trust",
      description: "When others confirm your tip, it becomes more trusted and helps more people. This creates a self-improving system where the best tips rise to the top through community validation.",
      gradient: "from-orange-400 to-red-600"
    }
  ];

  const currentStepData = steps[currentStep - 1];

  console.log('🎯 OnboardingModal: Rendering - currentStep:', currentStep, 'showTipModal:', showTipModal);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-2 sm:p-4">
      {/* Enhanced Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm" />
      {/* Modal - Responsive: mobile optimized, desktop as before */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-screen-2xl h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden p-4 sm:p-0">
        {/* Enhanced Header with gradient - Mobile optimized */}
        <div className={`relative bg-gradient-to-r ${currentStepData.gradient} p-4 sm:p-6 text-white overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg">
                <MapPin className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Welcome to LocalLoop</h2>
                </div>
                <p className="text-white/90 drop-shadow text-xs sm:text-base">Discover how local knowledge sharing works</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={handleSkip}
                className="px-2 sm:px-4 py-1 sm:py-2 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm text-xs sm:text-base"
              >
                Skip Tutorial
              </button>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Bar - Mobile optimized */}
        <div className="px-4 sm:px-8 py-3 sm:py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Step {currentStep} of 3</span>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
              {Math.round((currentStep / 3) * 100)}% complete
            </span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden shadow-inner">
            <div 
              className={`h-2 sm:h-3 bg-gradient-to-r ${currentStepData.gradient} rounded-full transition-all duration-700 ease-out shadow-sm`}
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
          </div>
        </div>

        {/* Content - Mobile optimized layout */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Text Content - Mobile first, then side-by-side on desktop */}
          <div 
            ref={contentRef}
            className="w-full sm:w-1/2 overflow-y-auto custom-scrollbar"
            onScroll={() => setShowScrollIndicator(false)}
          >
            <div className="p-2 sm:p-8 space-y-8 sm:space-y-8">
              <div className="sm:hidden">
                {/* Step Title Card */}
                <div className="bg-white/90 rounded-2xl shadow p-8 mb-8 max-w-xs mx-auto flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentStepData.title}</h3>
                  <p className="text-lg text-gray-700 font-semibold mb-2">{currentStepData.subtitle}</p>
                  <p className="text-gray-600 leading-relaxed text-base">{currentStepData.description}</p>
                </div>
                {/* Step-specific content cards with dividers */}
              {currentStep === 1 && (
                  <>
                    <div className="bg-blue-50 rounded-2xl shadow p-6 mb-8 max-w-xs mx-auto">
                      <div className="flex items-center justify-center mb-3">
                        <Users className="h-7 w-7 text-blue-600" />
                      </div>
                      <p className="font-bold text-blue-900 text-lg mb-2">Community-Driven</p>
                      <p className="text-blue-700 text-base">Real tips from real locals who know the area</p>
                      </div>
                    <div className="border-t border-gray-200 my-4"></div>
                    <div className="bg-emerald-50 rounded-2xl shadow p-6 mb-8 max-w-xs mx-auto">
                      <div className="flex items-center justify-center mb-3">
                        <TrendingUp className="h-7 w-7 text-emerald-600" />
                    </div>
                      <p className="font-bold text-emerald-900 text-lg mb-2">Trust-Based</p>
                      <p className="text-emerald-700 text-base">Tips get better with community validation</p>
                  </div>
                  </>
                )}
                {currentStep === 2 && (
                  <div className="bg-yellow-50 rounded-2xl shadow p-6 mb-8 max-w-xs mx-auto">
                    <div className="flex items-center justify-center mb-3">
                      <Target className="h-7 w-7 text-yellow-600" />
                      </div>
                    <p className="font-bold text-yellow-900 text-lg mb-2">See how it works!</p>
                    <p className="text-yellow-700 text-base">The tip creation modal shows automatically with a realistic example</p>
                      </div>
                )}
                {currentStep === 3 && (
                  <div className="bg-emerald-50 rounded-2xl shadow p-6 mb-8 max-w-xs mx-auto">
                    <div className="flex items-center justify-center mb-3">
                      <Heart className="h-7 w-7 text-emerald-600" />
                    </div>
                    <p className="font-bold text-emerald-900 text-lg mb-2">Community Validation</p>
                    <p className="text-emerald-700 text-base">When others confirm your tip, trust increases and the best info rises to the top.</p>
                  </div>
                )}
                {/* Navigation Buttons - sticky bottom for mobile */}
                <div className="fixed bottom-0 left-0 w-full bg-white/95 p-4 border-t border-gray-200 flex items-center justify-between z-50 sm:hidden mt-8">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className={`px-5 py-3 rounded-xl font-semibold text-lg ${currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                  >
                    <ArrowLeft className="h-6 w-6 inline-block mr-1" /> Previous
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-lg"
                  >
                    {currentStep === 3 ? 'Start Exploring LocalLoop' : 'Continue'} <ArrowRight className="h-6 w-6 inline-block ml-1" />
                  </button>
                      </div>
              </div>
              {/* Desktop content: restore original wide, side-by-side layout */}
              <div className="hidden sm:block">
                <div className="flex flex-row h-full w-full">
                  {/* Left side: stepper, progress, and text */}
                  <div className="w-1/2 flex flex-col justify-between p-8">
                      <div>
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-lg">
                          <MapPin className="h-7 w-7 text-white" />
                      </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white sm:text-gray-900 sm:drop-shadow-none">Welcome to LocalLoop</h2>
                          <p className="text-white/90 drop-shadow text-base">Discover how local knowledge sharing works</p>
                    </div>
                  </div>
                      <div className="mb-8">
                        <span className="text-sm font-semibold text-gray-700">Step {currentStep} of 3</span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full ml-4">
                          {Math.round((currentStep / 3) * 100)}% complete
                        </span>
                        <div className="relative w-full bg-gray-200 rounded-full h-3 mt-2 overflow-hidden shadow-inner">
                          <div 
                            className={`h-3 bg-gradient-to-r ${currentStepData.gradient} rounded-full transition-all duration-700 ease-out shadow-sm`}
                            style={{ width: `${(currentStep / 3) * 100}%` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
                </div>
                      </div>
                      <div className="mb-8">
                        <h3 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{currentStepData.title}</h3>
                        <p className={`text-xl bg-gradient-to-r ${currentStepData.gradient} bg-clip-text text-transparent font-semibold mb-2`}>
                          {currentStepData.subtitle}
                        </p>
                        <p className="text-gray-600 leading-relaxed text-lg">{currentStepData.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                      <button
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-200 font-semibold text-base ${currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:scale-105'}`}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Previous</span>
                      </button>
                      <button
                        onClick={handleNext}
                        className={`flex items-center space-x-3 px-8 py-4 bg-gradient-to-r ${currentStepData.gradient} hover:shadow-xl text-white rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg font-semibold text-lg`}
                      >
                        <span>{currentStep === 3 ? 'Start Exploring LocalLoop' : 'Continue'}</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                  </div>
                        </div>
                  {/* Right side: feature card for current step */}
                  <div className="w-1/2 flex items-center justify-center p-8">
                    {currentStep === 1 && (
                      <div className="bg-white/80 rounded-3xl shadow-2xl p-12 flex flex-col items-center max-w-lg">
                        <div className="bg-gradient-to-br from-blue-400 to-purple-600 p-6 rounded-2xl shadow-lg mb-6">
                          <Users className="h-12 w-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Knowledge</h3>
                        <p className="text-gray-600 leading-relaxed text-lg text-center">
                          LocalLoop connects you with local insights from people who know the area best. 
                          Discover shortcuts, hidden gems, and insider tips that make every neighborhood special.
                        </p>
                    </div>
                  )}
                    {currentStep === 2 && (
                      <div className="bg-white/80 rounded-3xl shadow-2xl p-12 flex flex-col items-center max-w-lg">
                        <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-6 rounded-2xl shadow-lg mb-6">
                          <MapPin className="h-12 w-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Realistic Tip Example</h3>
                        <p className="text-gray-600 leading-relaxed text-lg text-center mb-6">
                          See exactly how you'd share a real hidden gem with detailed information, timing, and photos.
                        </p>
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-emerald-200">
                          <p className="text-sm text-emerald-700 font-medium">
                            ✨ This shows a complete, realistic example of sharing a secret NYC rooftop garden!
                          </p>
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                      <div className="bg-white/80 rounded-3xl shadow-2xl p-12 flex flex-col items-center max-w-lg">
                        <div className="bg-gradient-to-br from-orange-400 to-red-600 p-6 rounded-2xl shadow-lg mb-6">
                          <TrendingUp className="h-12 w-12 text-white" />
                          </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Validation</h3>
                        <p className="text-gray-600 leading-relaxed text-lg text-center mb-6">
                          When community members confirm tips, trust levels increase. 
                          This creates a self-improving system where the best information rises to the top.
                        </p>
                        {/* Confirmation animation overlay can be added here if needed */}
                    </div>
                  )}
                </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Right Side - Interactive Display - Hidden on mobile, shown on desktop */}
          <div className="hidden sm:block w-1/2 p-6 relative">
            <div className="h-full rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200 relative bg-gradient-to-br from-gray-100 to-gray-200">
              {/* Step 2: Show tip creation modal automatically */}
              {currentStep === 2 && (
                <div className="h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center relative">
                  <div className="text-center p-8">
                    <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-6 rounded-2xl shadow-lg mx-auto mb-6 w-fit">
                      <MapPin className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Realistic Tip Example</h3>
                    <p className="text-gray-600 mb-6">
                      See exactly how you'd share a real hidden gem with detailed information, timing, and photos.
                    </p>
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-emerald-200">
                      <p className="text-sm text-emerald-700 font-medium">
                        ✨ This shows a complete, realistic example of sharing a secret NYC rooftop garden!
                      </p>
                    </div>
                  </div>
                  
                  {/* FIXED: Tip Creation Example Modal - Shows automatically */}
                  <TipCreationExample 
                    isVisible={showTipModal} 
                    onClose={handleCloseTipModal}
                  />
                </div>
              )}
              
              {/* Step 1: Welcome content */}
              {currentStep === 1 && (
                <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-blue-400 to-purple-600 p-6 rounded-2xl shadow-lg mx-auto mb-6 w-fit">
                      <Users className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Knowledge</h3>
                    <p className="text-gray-600 leading-relaxed">
                      LocalLoop connects you with local insights from people who know the area best. 
                      Discover shortcuts, hidden gems, and insider tips that make every neighborhood special.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Step 3: Trust and confirmation animation */}
              {currentStep === 3 && (
                <div className="h-full bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-8 relative">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-orange-400 to-red-600 p-6 rounded-2xl shadow-lg mx-auto mb-6 w-fit">
                      <TrendingUp className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Validation</h3>
                    <p className="text-gray-600 leading-relaxed">
                      When community members confirm tips, trust levels increase. 
                      This creates a self-improving system where the best information rises to the top.
                    </p>
                  </div>
                  
                  {/* Enhanced confirmation animation overlay */}
                  {showConfirmation && (
                    <div className="absolute top-6 left-6 right-6 space-y-3">
                      <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl animate-in slide-in-from-top border border-emerald-200">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-br from-emerald-400 to-green-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900">Sarah confirmed this tip</span>
                            <p className="text-sm text-gray-600">Trust increased!</p>
                          </div>
                        </div>
                      </div>
                      
                      {confirmationCount > 1 && (
                        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl animate-in slide-in-from-top delay-1000 border border-emerald-200">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-br from-emerald-400 to-green-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                              <Check className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900">Mike & Alex also confirmed</span>
                              <p className="text-sm text-gray-600">Highly trusted now!</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Scroll Indicator */}
            <ScrollIndicator onClick={handleScroll} visible={showScrollIndicator} />
          </div>
        </div>

        {/* Mobile-only tip modal overlay */}
        {currentStep === 2 && (
          <TipCreationExample 
            isVisible={showTipModal} 
            onClose={handleCloseTipModal}
          />
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;