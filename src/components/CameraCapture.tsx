import React, { useState, useEffect } from 'react';
import { Camera, X, RotateCcw, Zap, ZapOff, Download } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { supabase, generateUserFingerprint } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import toast from 'react-hot-toast';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ isOpen, onClose, onCapture }) => {
  const {
    isSupported,
    isActive,
    error,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    hasMultipleCameras
  } = useCamera();

  const [isCapturing, setIsCapturing] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && isSupported) {
      console.log('📷 CameraCapture: Starting camera for modal');
      startCamera();
    }
    
    return () => {
      if (isActive) {
        console.log('📷 CameraCapture: Stopping camera on cleanup');
        stopCamera();
      }
    };
  }, [isOpen, isSupported]);

  // Enhanced capture with database integration
  const handleCapture = async () => {
    if (isCapturing || isProcessing) {
      console.log('⚠️ Camera: Already capturing or processing, ignoring click');
      return;
    }
    
    console.log('📸 Camera: Starting capture process');
    setIsCapturing(true);
    setIsProcessing(true);
    
    try {
      // Flash effect
      if (flashEnabled) {
        console.log('⚡ Camera: Applying flash effect');
        const flashDiv = document.createElement('div');
        flashDiv.style.position = 'fixed';
        flashDiv.style.top = '0';
        flashDiv.style.left = '0';
        flashDiv.style.width = '100%';
        flashDiv.style.height = '100%';
        flashDiv.style.backgroundColor = 'white';
        flashDiv.style.zIndex = '9999';
        flashDiv.style.opacity = '0.8';
        flashDiv.style.pointerEvents = 'none';
        document.body.appendChild(flashDiv);
        
        setTimeout(() => {
          if (document.body.contains(flashDiv)) {
            document.body.removeChild(flashDiv);
          }
        }, 150);
      }
      
      console.log('📷 Camera: Capturing photo from video stream');
      const photoFile = await capturePhoto();
      
      if (!photoFile) {
        throw new Error('Failed to capture photo from camera');
      }
      
      console.log('✅ Camera: Photo captured successfully', {
        name: photoFile.name,
        size: photoFile.size,
        type: photoFile.type
      });

      // Create image metadata for database
      const user = await getCurrentUser();
      const fingerprint = generateUserFingerprint();
      
      const imageMetadata = {
        user_id: user?.id || null,
        user_email: user?.email || null,
        user_fingerprint: fingerprint,
        filename: photoFile.name,
        original_filename: photoFile.name,
        file_size: photoFile.size,
        mime_type: photoFile.type,
        processing_status: 'pending',
        taken_at: new Date().toISOString(),
        caption: 'Photo taken with camera'
      };

      console.log('💾 Camera: Saving image metadata to database', imageMetadata);

      // Save metadata to database
      const { data: imageRecord, error: dbError } = await supabase
        .from('images')
        .insert([imageMetadata])
        .select()
        .single();

      if (dbError) {
        console.error('❌ Camera: Database error saving image metadata:', dbError);
        // Don't fail the whole operation, just log the error
        toast.error('Photo captured but metadata save failed');
      } else {
        console.log('✅ Camera: Image metadata saved successfully:', imageRecord.id);
        toast.success('📸 Photo captured and saved!');
      }
      
      // Call the onCapture callback with the file
      onCapture(photoFile);
      onClose();
      
    } catch (error) {
      console.error('❌ Camera: Capture failed:', error);
      
      let errorMessage = 'Failed to capture photo';
      if (error instanceof Error) {
        if (error.message.includes('canvas')) {
          errorMessage = 'Camera canvas error. Please try again.';
        } else if (error.message.includes('video')) {
          errorMessage = 'Video stream error. Please restart camera.';
        } else if (error.message.includes('blob')) {
          errorMessage = 'Image processing error. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      console.log('🏁 Camera: Clearing capture states');
      setIsCapturing(false);
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    console.log('❌ Camera: Closing camera modal');
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  if (!isSupported) {
    return (
      <div className="fixed inset-0 z-[3000] bg-black/80 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Camera className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Not Supported</h3>
          <p className="text-gray-600 mb-4">Your device doesn't support camera access or you're using an unsupported browser.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[3000] bg-black">
      {/* Camera View */}
      <div className="relative w-full h-full">
        {isActive ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Starting camera...</p>
              {error && (
                <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mt-4 max-w-xs">
                  <p className="text-red-400 text-sm font-medium">Camera Error</p>
                  <p className="text-red-300 text-xs mt-1">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-3"></div>
              <p className="text-gray-800 font-medium">Processing photo...</p>
              <p className="text-gray-600 text-sm mt-1">Saving to database</p>
            </div>
          </div>
        )}

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="p-3 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors disabled:opacity-50"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-3">
              {/* Flash Toggle */}
              <button
                onClick={() => setFlashEnabled(!flashEnabled)}
                disabled={isProcessing}
                className={`p-3 backdrop-blur-sm rounded-full transition-colors disabled:opacity-50 ${
                  flashEnabled 
                    ? 'bg-yellow-500/80 text-white' 
                    : 'bg-black/30 text-white hover:bg-black/50'
                }`}
              >
                {flashEnabled ? <Zap className="h-6 w-6" /> : <ZapOff className="h-6 w-6" />}
              </button>
              
              {/* Camera Switch */}
              {hasMultipleCameras && (
                <button
                  onClick={switchCamera}
                  disabled={isProcessing}
                  className="p-3 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
          <div className="flex items-center justify-center">
            {/* Capture Button */}
            <button
              onClick={handleCapture}
              disabled={!isActive || isCapturing || isProcessing}
              className={`w-20 h-20 rounded-full border-4 border-white transition-all duration-200 ${
                isActive && !isCapturing && !isProcessing
                  ? 'bg-white hover:scale-110 active:scale-95'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isCapturing || isProcessing ? (
                <div className="w-full h-full rounded-full bg-emerald-500 animate-pulse flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-transparent" />
              )}
            </button>
          </div>
          
          {/* Instructions */}
          <div className="text-center mt-4">
            <p className="text-white text-sm opacity-80">
              {isProcessing 
                ? 'Processing photo...' 
                : isActive 
                  ? 'Tap the button to capture' 
                  : 'Waiting for camera...'
              }
            </p>
          </div>
        </div>

        {/* Camera Grid Overlay (optional) */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="w-full h-full grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="border border-white/30" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;