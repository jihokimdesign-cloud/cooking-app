'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, Plus, Calendar, ShoppingCart, ChefHat, AlertCircle } from 'lucide-react';
import { sampleRecipes } from '@/lib/recipes';
import type { Recipe } from '@/lib/types';

interface DetectedIngredient {
  name: string;
  confidence: number;
  category: string;
  emoji: string;
}

interface ShoppingListItem {
  id: string;
  name: string;
  category: string;
  addedAt: string;
  expiryDate?: string;
  isPurchased: boolean;
}

// Mock ingredient database
const ingredientDatabase: Record<string, { category: string; emoji: string }> = {
  'apple': { category: 'Fruits', emoji: '🍎' },
  'banana': { category: 'Fruits', emoji: '🍌' },
  'orange': { category: 'Fruits', emoji: '🍊' },
  'tomato': { category: 'Vegetables', emoji: '🍅' },
  'onion': { category: 'Vegetables', emoji: '🧅' },
  'garlic': { category: 'Vegetables', emoji: '🧄' },
  'carrot': { category: 'Vegetables', emoji: '🥕' },
  'lettuce': { category: 'Vegetables', emoji: '🥬' },
  'chicken': { category: 'Meat', emoji: '🍗' },
  'beef': { category: 'Meat', emoji: '🥩' },
  'pork': { category: 'Meat', emoji: '🥓' },
  'fish': { category: 'Seafood', emoji: '🐟' },
  'salmon': { category: 'Seafood', emoji: '🐟' },
  'shrimp': { category: 'Seafood', emoji: '🦐' },
  'egg': { category: 'Dairy', emoji: '🥚' },
  'milk': { category: 'Dairy', emoji: '🥛' },
  'cheese': { category: 'Dairy', emoji: '🧀' },
  'butter': { category: 'Dairy', emoji: '🧈' },
  'bread': { category: 'Bakery', emoji: '🍞' },
  'pasta': { category: 'Grains', emoji: '🍝' },
  'rice': { category: 'Grains', emoji: '🍚' },
  'flour': { category: 'Grains', emoji: '🌾' },
  'potato': { category: 'Vegetables', emoji: '🥔' },
  'bell pepper': { category: 'Vegetables', emoji: '🫑' },
  'mushroom': { category: 'Vegetables', emoji: '🍄' },
  'broccoli': { category: 'Vegetables', emoji: '🥦' },
  'avocado': { category: 'Fruits', emoji: '🥑' },
};

// Mock detection function (simulates AI recognition)
function detectIngredients(imageFile: File): Promise<DetectedIngredient[]> {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      // Mock detection - in real app, this would use TensorFlow.js or API
      const mockDetections: DetectedIngredient[] = [
        { name: 'tomato', confidence: 0.95, category: 'Vegetables', emoji: '🍅' },
        { name: 'onion', confidence: 0.87, category: 'Vegetables', emoji: '🧅' },
        { name: 'garlic', confidence: 0.82, category: 'Vegetables', emoji: '🧄' },
        { name: 'chicken', confidence: 0.91, category: 'Meat', emoji: '🍗' },
      ];
      resolve(mockDetections);
    }, 2000);
  });
}

function getExpiryDate(ingredientName: string): string {
  const today = new Date();
  const expiryDays: Record<string, number> = {
    'chicken': 2,
    'beef': 3,
    'pork': 3,
    'fish': 1,
    'salmon': 2,
    'shrimp': 1,
    'milk': 7,
    'cheese': 14,
    'butter': 30,
    'egg': 21,
    'tomato': 7,
    'lettuce': 5,
    'onion': 30,
    'garlic': 60,
    'carrot': 14,
    'potato': 30,
    'apple': 14,
    'banana': 5,
    'bread': 7,
  };
  
  const days = expiryDays[ingredientName.toLowerCase()] || 7;
  const expiry = new Date(today);
  expiry.setDate(today.getDate() + days);
  return expiry.toISOString().split('T')[0];
}

export default function ScanPage() {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredient[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load shopping list from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('shoppingList');
    if (stored) {
      try {
        setShoppingList(JSON.parse(stored));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Save shopping list to localStorage
  useEffect(() => {
    if (shoppingList.length > 0) {
      localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
    }
  }, [shoppingList]);

  // Start camera
  const startCamera = async () => {
    try {
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Could not access camera. ';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow camera permissions in your browser settings.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += 'Please check your camera settings.';
      }
      alert(errorMessage);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Capture image from camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      
      // Check if video is ready
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        alert('Video is not ready yet. Please wait a moment and try again.');
        return;
      }

      const canvas = canvasRef.current;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      if (videoWidth === 0 || videoHeight === 0) {
        alert('Video stream is not ready. Please wait a moment and try again.');
        return;
      }

      canvas.width = videoWidth;
      canvas.height = videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw the video frame to canvas
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        
        // Convert to image
        try {
          const imageData = canvas.toDataURL('image/jpeg', 0.9);
          setCapturedImage(imageData);
          stopCamera();
        } catch (error) {
          console.error('Error capturing image:', error);
          alert('Error capturing image. Please try again.');
        }
      }
    } else {
      alert('Camera is not ready. Please start the camera first.');
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Scan image for ingredients
  const scanImage = async () => {
    const imageToScan = capturedImage || uploadedImage;
    if (!imageToScan) return;

    setIsScanning(true);
    setDetectedIngredients([]);
    setSuggestedRecipes([]);

    try {
      // Convert data URL to File for mock detection
      const response = await fetch(imageToScan);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

      const detections = await detectIngredients(file);
      setDetectedIngredients(detections);

      // Find recipes that match detected ingredients
      const detectedNames = detections.map(d => d.name.toLowerCase());
      const matchingRecipes = sampleRecipes.filter(recipe =>
        recipe.ingredients.some(ing =>
          detectedNames.some(detected =>
            ing.toLowerCase().includes(detected) || detected.includes(ing.toLowerCase())
          )
        )
      );
      setSuggestedRecipes(matchingRecipes.slice(0, 3));
    } catch (error) {
      console.error('Error scanning image:', error);
      alert('Error scanning image. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  // Add to shopping list
  const addToShoppingList = (ingredient: DetectedIngredient) => {
    const newItem: ShoppingListItem = {
      id: Date.now().toString(),
      name: ingredient.name,
      category: ingredient.category,
      addedAt: new Date().toISOString(),
      expiryDate: getExpiryDate(ingredient.name),
      isPurchased: false,
    };
    setShoppingList([...shoppingList, newItem]);
  };

  // Toggle purchased status
  const togglePurchased = (id: string) => {
    setShoppingList(shoppingList.map(item =>
      item.id === id ? { ...item, isPurchased: !item.isPurchased } : item
    ));
  };

  // Remove from shopping list
  const removeFromShoppingList = (id: string) => {
    setShoppingList(shoppingList.filter(item => item.id !== id));
  };

  // Get items expiring soon
  const getExpiringSoon = () => {
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    return shoppingList.filter(item => {
      if (!item.expiryDate || item.isPurchased) return false;
      const expiry = new Date(item.expiryDate);
      return expiry <= threeDaysFromNow;
    });
  };

  const expiringSoon = getExpiringSoon();

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Ensure video plays when stream is set
  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;
      
      const playVideo = async () => {
        try {
          await video.play();
        } catch (error) {
          console.error('Error playing video:', error);
        }
      };

      const handleLoadedMetadata = () => {
        console.log('Video metadata loaded:', {
          width: video.videoWidth,
          height: video.videoHeight,
          readyState: video.readyState
        });
        playVideo();
      };

      const handleCanPlay = () => {
        playVideo();
      };

      const handleError = (e: Event) => {
        console.error('Video error:', e);
        alert('Error loading video stream. Please try again.');
      };

      if (video.readyState >= 2) {
        // Video already has metadata
        playVideo();
      } else {
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
      }
      
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };
    }
  }, [stream]);

  const currentImage = capturedImage || uploadedImage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📸</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Ingredient Scanner
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Scan ingredients with AI-powered recognition! 🤖👨‍🍳
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => {
              setMode('camera');
              stopCamera();
              setCapturedImage(null);
              setUploadedImage(null);
              setDetectedIngredients([]);
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              mode === 'camera'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
            }`}
          >
            <Camera className="w-5 h-5" />
            Camera
          </button>
          <button
            onClick={() => {
              setMode('upload');
              stopCamera();
              setCapturedImage(null);
              setUploadedImage(null);
              setDetectedIngredients([]);
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              mode === 'upload'
                ? 'bg-purple-500 text-white shadow-md'
                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
            }`}
          >
            <Upload className="w-5 h-5" />
            Upload Image
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera/Upload Section */}
          <div className="space-y-6">
            {/* Camera View */}
            {mode === 'camera' && (
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Camera Scanner
                </h2>
                
                {!stream && !capturedImage && (
                  <div className="aspect-video bg-gray-100 dark:bg-zinc-700 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <Camera className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                      <button
                        onClick={startCamera}
                        className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Start Camera
                      </button>
                    </div>
                  </div>
                )}

                {stream && !capturedImage && (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }} // Mirror the video
                    />
                    <div className="absolute inset-0 border-4 border-purple-500 border-dashed m-4 pointer-events-none" />
                    {videoRef.current && videoRef.current.readyState === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <div className="text-white text-center">
                          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p className="text-sm">Loading camera...</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {capturedImage && (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setCapturedImage(null);
                        startCamera();
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {stream && !capturedImage && (
                  <div className="flex gap-3">
                    <button
                      onClick={captureImage}
                      className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Capture Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-6 py-3 bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Upload View */}
            {mode === 'upload' && (
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Upload Image
                </h2>
                
                {!uploadedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Scan Button */}
            {currentImage && (
              <button
                onClick={scanImage}
                disabled={isScanning}
                className="w-full px-6 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Scan Ingredients
                  </>
                )}
              </button>
            )}

            {/* Detected Ingredients */}
            {detectedIngredients.length > 0 && (
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Detected Ingredients ({detectedIngredients.length})
                </h3>
                <div className="space-y-3">
                  {detectedIngredients.map((ingredient, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{ingredient.emoji}</span>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white capitalize">
                            {ingredient.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {ingredient.category} • {(ingredient.confidence * 100).toFixed(0)}% confidence
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => addToShoppingList(ingredient)}
                        className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        title="Add to shopping list"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Recipes */}
            {suggestedRecipes.length > 0 && (
              <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-purple-500" />
                  Suggested Recipes
                </h3>
                <div className="space-y-3">
                  {suggestedRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {recipe.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {recipe.cookingTime} min • {recipe.servings} servings
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Shopping List & Expiry Tracker */}
          <div className="space-y-6">
            {/* Shopping List */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-purple-500" />
                Shopping List ({shoppingList.filter(i => !i.isPurchased).length})
              </h3>
              
              {shoppingList.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No items yet. Scan ingredients to add them!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {shoppingList.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        item.isPurchased
                          ? 'bg-gray-100 dark:bg-zinc-700 border-gray-200 dark:border-zinc-600 opacity-60'
                          : 'bg-gray-50 dark:bg-zinc-700 border-transparent hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => togglePurchased(item.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            item.isPurchased
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-300 dark:border-zinc-600'
                          }`}
                        >
                          {item.isPurchased && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <div className="flex-1">
                          <div className={`font-medium capitalize ${item.isPurchased ? 'line-through' : ''}`}>
                            {item.name}
                          </div>
                          {item.expiryDate && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Expires: {new Date(item.expiryDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromShoppingList(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expiry Tracker */}
            {expiringSoon.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-orange-900 dark:text-orange-200 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Expiring Soon
                </h3>
                <div className="space-y-2">
                  {expiringSoon.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white capitalize">
                          {item.name}
                        </div>
                        <div className="text-sm text-orange-600 dark:text-orange-400">
                          Expires: {new Date(item.expiryDate!).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

