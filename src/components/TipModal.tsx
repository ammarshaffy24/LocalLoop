import React, { useState, useRef, useEffect } from 'react';
import { X, MapPin, Tag, MessageSquare, Move, Clock, Camera, Upload, Trash2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { supabase, type Tip } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';
import CameraCapture from './CameraCapture';
import toast from 'react-hot-toast';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTipCreated: (tip: Tip) => void;
  initialLocation?: [number, number] | null;
}

const categories = [
  'Shortcuts',
  'Free Stuff', 
  'Hidden Gems',
  'Food & Drink',
  'Shopping',
  'Nature',
  'Entertainment',
  'Services',
  'Events',
  'Other'
];

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom draggable marker component
const DraggableMarker: React.FC<{
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}> = ({ position, onPositionChange }) => {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        onPositionChange(newPos.lat, newPos.lng);
      }
    },
  };

  const customIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.59644 0 0 5.59644 0 12.5C0 19.4036 12.5 41 12.5 41C12.5 41 25 19.4036 25 12.5C25 5.59644 19.4036 0 12.5 0Z" fill="#EF4444"/>
        <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={customIcon}
    />
  );
};

// Map click handler component
const MapClickHandler: React.FC<{
  onMapClick: (lat: number, lng: number) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const TipModal: React.FC<TipModalProps> = ({ isOpen, onClose, onTipCreated, initialLocation }) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [position, setPosition] = useState<[number, number]>([40.7128, -74.0060]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Image upload states
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens and set initial location if provided
  useEffect(() => {
    if (isOpen) {
      console.log('🎯 TipModal opened, resetting form');
      setDescription('');
      setCategory('');
      setMapError(null);
      setSelectedImage(null);
      setImagePreview(null);
      setIsUploadingImage(false);
      setShowCamera(false);
      
      // Set position based on initial location or default
      if (initialLocation) {
        console.log('📍 Setting initial location from map click:', initialLocation);
        setPosition(initialLocation);
      } else {
        console.log('📍 Using default location (no map click)');
        setPosition([40.7128, -74.0060]);
      }
    }
  }, [isOpen, initialLocation]);

  const handlePositionChange = (lat: number, lng: number) => {
    console.log('📍 Position changed:', { lat, lng });
    setPosition([lat, lng]);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    console.log('📸 Image selected:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (file: File) => {
    console.log('📸 Camera capture received:', file.name);
    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setShowCamera(false);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImageToSupabase = async (file: File, tipId: string): Promise<string | null> => {
    try {
      setIsUploadingImage(true);
      console.log('📤 Uploading image to Supabase storage...');

      const fileExt = file.name.split('.').pop();
      const fileName = `${tipId}.${fileExt}`;
      const filePath = `tip-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('tip-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Image upload error:', error);
        throw error;
      }

      console.log('✅ Image uploaded successfully:', data.path);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('tip-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('💥 Error uploading image:', error);
      toast.error('Failed to upload image. Tip will be saved without image.');
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 Form submitted with:', {
      description: description.trim(),
      category,
      position,
      hasImage: !!selectedImage
    });
    
    if (!description.trim()) {
      toast.error('Please add a description for your tip');
      return;
    }
    
    if (!category) {
      toast.error('Please select a category');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user (if any)
      const currentUser = await getCurrentUser();
      console.log('👤 Current user:', currentUser?.email || 'anonymous');

      // First, test the connection with timeout
      console.log('🔗 Testing Supabase connection...');
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection test timed out after 5 seconds')), 5000);
      });
      
      const connectionTest = supabase
        .from('tips')
        .select('count', { count: 'exact', head: true });

      const { data: connectionTestData, error: connectionError } = await Promise.race([
        connectionTest,
        timeoutPromise
      ]) as any;

      if (connectionError) {
        console.error('❌ Connection test failed:', connectionError);
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }

      console.log('✅ Connection test passed, current tip count:', connectionTestData);

      console.log('💾 Submitting tip to database:', {
        lat: position[0],
        lng: position[1],
        category,
        description: description.trim(),
        user_id: currentUser?.id || null,
        user_email: currentUser?.email || null,
      });

      const now = new Date().toISOString();

      // Add timeout to insert operation
      const insertPromise = supabase
        .from('tips')
        .insert([
          {
            lat: position[0],
            lng: position[1],
            category,
            description: description.trim(),
            last_confirmed_at: now, // Set initial confirmation timestamp
            user_id: currentUser?.id || null,
            user_email: currentUser?.email || null,
          }
        ])
        .select()
        .single();

      const insertTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Insert operation timed out after 10 seconds')), 10000);
      });

      const { data, error } = await Promise.race([
        insertPromise,
        insertTimeoutPromise
      ]) as any;

      if (error) {
        console.error('❌ Supabase insert error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Provide more specific error messages
        let errorMessage = 'Failed to save tip';
        if (error.code === 'PGRST116') {
          errorMessage = 'Database table not found. Please check your Supabase setup.';
        } else if (error.code === '42501') {
          errorMessage = 'Permission denied. Please check your database policies.';
        } else if (error.message.includes('JWT')) {
          errorMessage = 'Authentication error. Please check your Supabase keys.';
        } else {
          errorMessage = `Database error: ${error.message}`;
        }
        
        throw new Error(errorMessage);
      }

      console.log('✅ Tip created successfully:', data);

      // Upload image if selected
      let imageUrl = null;
      if (selectedImage) {
        console.log('📸 Uploading image for tip:', data.id);
        imageUrl = await uploadImageToSupabase(selectedImage, data.id);
        
        if (imageUrl) {
          // Update tip with image URL
          const { error: updateError } = await supabase
            .from('tips')
            .update({ image_url: imageUrl })
            .eq('id', data.id);
          
          if (updateError) {
            console.error('❌ Failed to update tip with image URL:', updateError);
            // Don't fail the whole operation, just log the error
          } else {
            console.log('✅ Tip updated with image URL');
          }
        }
      }

      // Create tip object for immediate rendering
      const newTip: Tip = {
        id: data.id,
        lat: data.lat,
        lng: data.lng,
        category: data.category,
        description: data.description,
        confirmations: data.confirmations || 0,
        created_at: data.created_at,
        last_confirmed_at: data.last_confirmed_at || now,
        image_url: imageUrl || undefined
      };

      onTipCreated(newTip);
      
      const successMessage = currentUser 
        ? selectedImage 
          ? '🎉 Tip with image shared with the neighborhood! You can manage it from "My Tips".'
          : '🎉 Tip shared with the neighborhood! You can manage it from "My Tips".'
        : selectedImage
          ? '🎉 Tip with image shared with the neighborhood!'
          : '🎉 Tip shared with the neighborhood!';
      
      toast.success(successMessage, {
        duration: 4000,
        style: {
          background: '#10B981',
          color: 'white',
          fontWeight: '500',
        },
      });
      
      onClose();
    } catch (error) {
      console.error('💥 Error creating tip:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          maxWidth: '400px',
        },
      });
    } finally {
      // CRITICAL: Always clear the submitting state
      console.log('🏁 FINALLY: Clearing submitting state');
      setIsSubmitting(false);
    }
  };

  // Don't render anything if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-8">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg mx-auto p-4 sm:p-8 overflow-y-auto max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <MapPin className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Drop a Tip</h2>
              <p className="text-sm text-gray-500">
                {initialLocation ? 'Share your local knowledge at this location' : 'Share your local knowledge'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Map Preview - Smaller height with error handling */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Move className="h-4 w-4" />
                <span>Location</span>
                {initialLocation && (
                  <span className="text-emerald-600 text-xs bg-emerald-50 px-2 py-1 rounded-full">
                    📍 Set from map click
                  </span>
                )}
              </label>
              
              {mapError ? (
                <div className="h-40 rounded-lg border border-red-200 bg-red-50 flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-red-600 text-sm font-medium">Map Error</p>
                    <p className="text-red-500 text-xs mt-1">{mapError}</p>
                    <button
                      type="button"
                      onClick={() => setMapError(null)}
                      className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-40 rounded-lg overflow-hidden border border-gray-200">
                  <MapContainer
                    center={position}
                    zoom={15}
                    className="h-full w-full"
                    zoomControl={true}
                    key={`map-${position[0]}-${position[1]}`} // Force re-render on position change
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <DraggableMarker 
                      position={position} 
                      onPositionChange={handlePositionChange}
                    />
                    <MapClickHandler onMapClick={handlePositionChange} />
                  </MapContainer>
                </div>
              )}
              
              <p className="text-xs text-gray-500 flex items-center space-x-1">
                <Move className="h-3 w-3" />
                <span>
                  {initialLocation 
                    ? 'Location set from your map click. Drag the pin or click to adjust.'
                    : 'Drag the pin or click on the map to set location'
                  }
                </span>
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Tag className="h-4 w-4" />
                <span>Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <MessageSquare className="h-4 w-4" />
                <span>Description</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share the details... What makes this place special?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-500">{description.length}/500 characters</p>
            </div>

            {/* Enhanced Image Upload with Camera Support */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Camera className="h-4 w-4" />
                <span>Photo</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Optional</span>
              </label>
              
              {!imagePreview ? (
                <div className="space-y-3">
                  {/* Camera Button */}
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="w-full border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors bg-emerald-50"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="bg-emerald-100 p-3 rounded-full">
                        <Camera className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-700">Take Photo</p>
                        <p className="text-xs text-emerald-600">Use your camera to capture the moment</p>
                      </div>
                    </div>
                  </button>

                  {/* File Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="bg-gray-100 p-3 rounded-full">
                        <Upload className="h-6 w-6 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Upload from device</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Tip preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {selectedImage?.name}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                📸 Photos help others understand your tip better and verify its authenticity!
              </p>
            </div>

            {/* Location coordinates display */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">
                📍 {position[0].toFixed(6)}, {position[1].toFixed(6)}
                {initialLocation && (
                  <span className="ml-2 text-emerald-600 font-medium">
                    (from map click)
                  </span>
                )}
              </p>
            </div>

            {/* Tip Lifecycle Info */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <div className="bg-blue-100 p-1 rounded">
                  <Clock className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Tip Lifecycle</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Tips expire after 7 days without confirmation. Other users can confirm your tip to keep it active and help the community!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex space-x-3 p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !description.trim() || !category || isUploadingImage}
              className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white rounded-lg transition-colors font-medium disabled:cursor-not-allowed btn-hover shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>
                    {isUploadingImage ? 'Uploading image...' : 'Sharing...'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>🎯 Share Tip</span>
                  {selectedImage && <Camera className="h-4 w-4" />}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};

export default TipModal;