import React, { useState, useEffect } from 'react';
import { X, MapPin, Users, ArrowRight, ArrowLeft, Check, MessageSquare, Tag, Camera, Globe, Shield } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCount, setConfirmationCount] = useState(0);

  const totalSteps = 3;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setShowConfirmation(false);
      setConfirmationCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentStep === 3) {
      const timer = setTimeout(() => {
        setShowConfirmation(true);
        setTimeout(() => setConfirmationCount(1), 1000);
        setTimeout(() => setConfirmationCount(2), 2000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const steps = [
    {
      title: "You're walking down a street...",
      subtitle: "Looking for a shortcut to avoid the crowds",
      description: "LocalLoop helps you discover local knowledge from people who know the area best. Every neighborhood has hidden gems, shortcuts, and insider tips that only locals know.",
      icon: Globe,
      gradient: "from-blue-500 to-purple-600",
      features: [
        "Find local shortcuts and hidden spots",
        "Share your neighborhood knowledge",
        "Build a trusted community network"
      ]
    },
    {
      title: "Community Knowledge",
      subtitle: "Discover local insights",
      description: "LocalLoop connects you with local insights from people who know the area best. Discover shortcuts, hidden gems, and insider tips that make every neighborhood special.",
      icon: Users,
      gradient: "from-emerald-500 to-teal-600",
      features: [
        "Interactive map with local tips",
        "Filter by category and location",
        "Real-time community updates"
      ]
    },
    {
      title: "Community-Driven",
      subtitle: "Share and discover together",
      description: "Join a community of locals sharing their favorite spots and secret shortcuts. Help others discover what makes your neighborhood unique.",
      icon: MessageSquare,
      gradient: "from-orange-500 to-red-600",
      features: [
        "Easy tip creation with photos",
        "Categorize your discoveries",
        "Add detailed descriptions"
      ]
    }
  ];

  const currentStepData = steps[currentStep - 1];
  const IconComponent = currentStepData.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-2 sm:p-4">
      {/* Enhanced Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal - Responsive: mobile optimized, desktop as before */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-[1800px] lg:max-w-[2200px] xl:max-w-[2600px] h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden p-0 border border-gray-200">
        {/* Enhanced Header with gradient - Mobile optimized */}
        <div className={`relative bg-gradient-to-r ${currentStepData.gradient} p-4 sm:px-8 sm:py-6 text-white overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl shadow-lg">
                <IconComponent className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">LocalLoop Tutorial</h2>
                <p className="text-white/90">Step {currentStep} of {totalSteps}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm text-sm font-medium"
              >
                Skip Tutorial
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Bar - Mobile optimized */}
        <div className="px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Step {currentStep} of {totalSteps}</span>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
              {Math.round((currentStep / totalSteps) * 100)}% complete
            </span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-2 sm:h-2.5 overflow-hidden shadow-inner">
            <div 
              className={`h-2 sm:h-2.5 bg-gradient-to-r ${currentStepData.gradient} rounded-full transition-all duration-700 ease-out shadow-sm`}
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content - Mobile optimized layout */}
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Single scrollable container for mobile */}
          <div className="flex-1 overflow-auto">
            <div className="flex flex-col sm:flex-row min-h-full">
              {/* Visual Demo (mobile: full width, desktop: half width) */}
              <div className="w-full sm:w-1/2 p-4 sm:p-6 sm:sticky sm:top-0 flex-shrink-0">
                <div className="w-full aspect-[4/3] sm:aspect-auto sm:h-[calc(100vh-280px)] flex flex-col justify-center items-center rounded-2xl shadow-xl border border-gray-200 relative bg-gradient-to-br from-gray-50 to-white">
                  {/* Step 1: Walking Scenario */}
                  {currentStep === 1 && (
                    <div className="h-full w-full flex flex-col items-center justify-center p-8 overflow-hidden">
                      <div className="text-center space-y-6 max-w-md">
                        <div className={`bg-gradient-to-br ${currentStepData.gradient} p-8 rounded-3xl shadow-2xl mx-auto w-fit`}>
                          <Globe className="h-16 w-16 text-white" />
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-2xl font-bold text-gray-900">Local Knowledge</h4>
                          <p className="text-gray-600">Discover shortcuts and hidden gems</p>
                        </div>
                        <div className="flex justify-center space-x-4">
                          <div className="bg-white p-4 rounded-xl shadow-lg border">
                            <MapPin className="h-8 w-8 text-blue-500" />
                            <p className="text-sm font-medium mt-2">Shortcuts</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-lg border">
                            <Users className="h-8 w-8 text-emerald-500" />
                            <p className="text-sm font-medium mt-2">Community</p>
                          </div>
                          <div className="bg-white p-4 rounded-xl shadow-lg border">
                            <Shield className="h-8 w-8 text-purple-500" />
                            <p className="text-sm font-medium mt-2">Trusted</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Step 2: Community Knowledge */}
                  {currentStep === 2 && (
                    <div className="h-full w-full flex flex-col items-center justify-center p-8 overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
                      <div className="text-center space-y-6 max-w-md">
                        <div className={`bg-gradient-to-br ${currentStepData.gradient} p-6 rounded-2xl shadow-lg mx-auto w-fit`}>
                          <Users className="h-12 w-12 text-white" />
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-2xl font-bold text-gray-900">Community Knowledge</h4>
                          <p className="text-gray-600">Learn from local experts</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-emerald-200 max-w-sm mx-auto">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="font-medium text-emerald-700">Local Insights</span>
                          </div>
                          <p className="text-sm text-gray-600">Discover hidden gems and shortcuts that only locals know about.</p>
                          <div className="flex items-center space-x-2 mt-3">
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Tips & Tricks</span>
                            <span className="text-xs text-gray-500">• Verified by locals</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Step 3: Community-Driven */}
                  {currentStep === 3 && (
                    <div className="h-full w-full flex flex-col items-center justify-center p-8 overflow-hidden bg-gradient-to-br from-orange-50 to-red-50">
                      <div className="text-center space-y-6 max-w-md">
                        <div className={`bg-gradient-to-br ${currentStepData.gradient} p-6 rounded-2xl shadow-lg mx-auto w-fit`}>
                          <MessageSquare className="h-12 w-12 text-white" />
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-2xl font-bold text-gray-900">Share Your Knowledge</h4>
                          <p className="text-gray-600">Help others discover your neighborhood</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-orange-200 max-w-sm mx-auto">
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Tag className="h-5 w-5 text-orange-500" />
                              <span className="font-medium text-orange-700">Hidden Gems</span>
                            </div>
                            <div className="text-left">
                              <p className="text-sm text-gray-700 font-medium mb-2">Share your favorite spots</p>
                              <p className="text-sm text-gray-600">Help others discover what makes your neighborhood special</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Camera className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">Add photos and details</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions (mobile: full width, desktop: half width) */}
              <div className="w-full sm:w-1/2 p-4 sm:p-8">
                <div className="space-y-6 sm:space-y-8 sm:pl-8">
                  {/* Step Content */}
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900">{currentStepData.title}</h2>
                    <p className="text-xl text-gray-600">{currentStepData.subtitle}</p>
                    <p className="text-gray-600 leading-relaxed">{currentStepData.description}</p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4">
                    {currentStepData.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`p-1 rounded-full bg-gradient-to-r ${currentStepData.gradient}`}>
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 sm:pt-8">
                    <button
                      onClick={handlePrevious}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-colors ${
                        currentStep === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      disabled={currentStep === 1}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>

                    <button
                      onClick={handleNext}
                      className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-white transition-all ${
                        currentStepData.gradient
                      } hover:shadow-lg`}
                    >
                      <span>{currentStep === totalSteps ? 'Get Started' : 'Next'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;