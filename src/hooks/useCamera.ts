import { useState, useRef, useCallback } from 'react';

interface CameraHook {
  isSupported: boolean;
  isActive: boolean;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
  capturePhoto: () => Promise<File | null>;
  switchCamera: () => Promise<void>;
  hasMultipleCameras: boolean;
}

export const useCamera = (): CameraHook => {
  const [isSupported] = useState('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check for multiple cameras
  const checkCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
      console.log('📷 Camera: Found', videoDevices.length, 'video devices');
    } catch (error) {
      console.error('❌ Camera: Failed to enumerate devices', error);
    }
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      const errorMsg = 'Camera not supported on this device';
      setError(errorMsg);
      console.error('❌ Camera:', errorMsg);
      return false;
    }

    try {
      console.log('📷 Camera: Starting camera with facing mode:', facingMode);
      setError(null);

      // Stop existing stream
      if (currentStream) {
        console.log('🛑 Camera: Stopping existing stream');
        currentStream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        },
        audio: false
      };

      console.log('📷 Camera: Requesting user media with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        console.log('📷 Camera: Setting video source and playing');
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;
          
          const handleLoadedMetadata = () => {
            console.log('📷 Camera: Video metadata loaded');
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('error', handleError);
            resolve();
          };
          
          const handleError = (e: Event) => {
            console.error('❌ Camera: Video error:', e);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('error', handleError);
            reject(new Error('Video failed to load'));
          };
          
          video.addEventListener('loadedmetadata', handleLoadedMetadata);
          video.addEventListener('error', handleError);
          
          video.play().catch(reject);
        });
      }

      setCurrentStream(stream);
      setIsActive(true);
      
      // Check for multiple cameras
      await checkCameras();
      
      console.log('✅ Camera: Started successfully');
      return true;
    } catch (error) {
      console.error('❌ Camera: Failed to start', error);
      
      let errorMessage = 'Failed to access camera';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is already in use by another application.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints not supported. Trying with basic settings...';
          
          // Try again with basic constraints
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
              videoRef.current.srcObject = basicStream;
              await videoRef.current.play();
            }
            setCurrentStream(basicStream);
            setIsActive(true);
            console.log('✅ Camera: Started with basic constraints');
            return true;
          } catch (basicError) {
            console.error('❌ Camera: Basic constraints also failed', basicError);
            errorMessage = 'Camera not compatible with this device.';
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setIsActive(false);
      return false;
    }
  }, [isSupported, facingMode, currentStream]);

  const stopCamera = useCallback(() => {
    console.log('📷 Camera: Stopping camera');
    
    if (currentStream) {
      currentStream.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Camera: Stopped track:', track.kind);
      });
      setCurrentStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setError(null);
  }, [currentStream]);

  const capturePhoto = useCallback(async (): Promise<File | null> => {
    if (!videoRef.current || !isActive) {
      console.error('❌ Camera: Cannot capture - camera not active');
      return null;
    }

    try {
      console.log('📸 Camera: Starting photo capture process');
      
      const video = videoRef.current;
      
      // Wait for video to be ready
      if (video.readyState < 2) {
        console.log('📷 Camera: Waiting for video to be ready...');
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video not ready after 5 seconds'));
          }, 5000);
          
          const checkReady = () => {
            if (video.readyState >= 2) {
              clearTimeout(timeout);
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        });
      }
      
      console.log('📷 Camera: Video ready, creating canvas');
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas 2D context');
      }

      // Set canvas size to video size
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;
      
      console.log('📷 Camera: Canvas size:', canvas.width, 'x', canvas.height);
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Invalid video dimensions');
      }

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      console.log('📷 Camera: Frame drawn to canvas, converting to blob');

      // Convert to blob with high quality
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const file = new File([blob], `photo-${timestamp}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            
            console.log('✅ Camera: Photo file created:', {
              name: file.name,
              size: file.size,
              type: file.type
            });
            
            resolve(file);
          } else {
            console.error('❌ Camera: Failed to create blob from canvas');
            reject(new Error('Failed to create image blob'));
          }
        }, 'image/jpeg', 0.9); // High quality JPEG
      });
    } catch (error) {
      console.error('❌ Camera: Capture failed:', error);
      return null;
    }
  }, [isActive]);

  const switchCamera = useCallback(async (): Promise<void> => {
    if (!hasMultipleCameras) {
      console.log('ℹ️ Camera: No multiple cameras available');
      return;
    }

    console.log('🔄 Camera: Switching camera from', facingMode);
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    // Restart camera with new facing mode
    if (isActive) {
      await startCamera();
    }
  }, [hasMultipleCameras, facingMode, isActive, startCamera]);

  return {
    isSupported,
    isActive,
    error,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    hasMultipleCameras
  };
};