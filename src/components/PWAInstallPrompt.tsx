import React from 'react';
import { X, Download, Smartphone, Zap, Wifi } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const PWAInstallPrompt: React.FC = () => {
  const { showInstallPrompt, installApp, dismissInstallPrompt, isInstalled } = usePWA();

  if (!showInstallPrompt || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      console.log('✅ PWA: App installed successfully');
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[2000] sm:left-auto sm:right-4 sm:w-96">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-2xl p-6 slide-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Install LocalLoop</h3>
              <p className="text-emerald-100 text-sm">Get the full app experience</p>
            </div>
          </div>
          <button
            onClick={dismissInstallPrompt}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3">
            <Zap className="h-4 w-4 text-emerald-200" />
            <span className="text-sm text-emerald-100">Faster loading and smoother experience</span>
          </div>
          <div className="flex items-center space-x-3">
            <Wifi className="h-4 w-4 text-emerald-200" />
            <span className="text-sm text-emerald-100">Works offline with saved tips</span>
          </div>
          <div className="flex items-center space-x-3">
            <Download className="h-4 w-4 text-emerald-200" />
            <span className="text-sm text-emerald-100">Push notifications for nearby tips</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={handleInstall}
            className="flex-1 bg-white text-emerald-600 font-semibold py-3 px-4 rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Install App</span>
          </button>
          <button
            onClick={dismissInstallPrompt}
            className="px-4 py-3 text-emerald-100 hover:text-white transition-colors"
          >
            Not now
          </button>
        </div>

        {/* Install instructions for iOS */}
        <div className="mt-4 pt-4 border-t border-emerald-400/30">
          <p className="text-xs text-emerald-200">
            📱 On iOS: Tap the share button and select "Add to Home Screen"
          </p>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;