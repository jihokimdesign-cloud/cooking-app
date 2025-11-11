'use client';

import { useState } from 'react';
import { Youtube, Play } from 'lucide-react';

interface RecipeStep {
  timestamp: number; // in seconds
  time: string; // formatted as "5:30"
  instruction: string;
}

// Mock function to extract video ID from YouTube URL
function parseYouTubeURL(url: string): { videoId: string | null; isValid: boolean } {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return { videoId: match[1], isValid: true };
    }
  }
  
  return { videoId: null, isValid: false };
}

// Mock function to generate sample recipe steps
function generateSampleSteps(): RecipeStep[] {
  return [
    { timestamp: 0, time: '0:00', instruction: 'Introduction and ingredients overview' },
    { timestamp: 120, time: '2:00', instruction: 'Start boiling water for pasta. Add salt generously.' },
    { timestamp: 180, time: '3:00', instruction: 'Cook pasta according to package directions until al dente' },
    { timestamp: 300, time: '5:00', instruction: 'While pasta cooks, fry bacon until crispy. Set aside.' },
    { timestamp: 420, time: '7:00', instruction: 'Whisk eggs with grated parmesan cheese in a bowl' },
    { timestamp: 480, time: '8:00', instruction: 'Drain pasta, reserving some pasta water' },
    { timestamp: 540, time: '9:00', instruction: 'Combine hot pasta with bacon, then mix in egg mixture off heat' },
    { timestamp: 600, time: '10:00', instruction: 'Add pasta water if needed, season with black pepper, serve immediately' },
  ];
}

export default function YouTubePage() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [steps, setSteps] = useState<RecipeStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);

  const handleParse = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const parsed = parseYouTubeURL(url);
    
    if (!parsed.isValid || !parsed.videoId) {
      setError('Invalid YouTube URL. Please check and try again.');
      setIsLoading(false);
      return;
    }

    setVideoId(parsed.videoId);
    setSteps(generateSampleSteps());
    setCurrentTimestamp(0);
    setIsLoading(false);
  };

  const jumpToTimestamp = (timestamp: number) => {
    setCurrentTimestamp(timestamp);
    // Update iframe src to jump to timestamp
    const iframe = document.getElementById('youtube-player') as HTMLIFrameElement;
    if (iframe && videoId) {
      iframe.src = `https://www.youtube.com/embed/${videoId}?start=${timestamp}&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Youtube className="w-12 h-12 text-red-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              YouTube Recipe Parser
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Extract recipes from YouTube cooking videos! 🎥👨‍🍳
          </p>
        </div>

        {/* URL Input */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            YouTube Video URL
          </label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Youtube className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleParse()}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              onClick={handleParse}
              disabled={isLoading}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Parse Recipe
                </>
              )}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Video Player and Steps */}
        {videoId && steps.length > 0 && (
          <div className="space-y-6">
            {/* Embedded YouTube Player */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="aspect-video bg-black">
                <iframe
                  id="youtube-player"
                  key={`${videoId}-${currentTimestamp}`}
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}?start=${currentTimestamp}&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Step-by-Step Instructions with Timestamps */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Play className="w-5 h-5 text-red-600" />
                Step-by-Step Instructions
              </h3>
              
              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border-2 border-gray-200 dark:border-zinc-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all cursor-pointer"
                    onClick={() => jumpToTimestamp(step.timestamp)}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        className="flex-shrink-0 w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          jumpToTimestamp(step.timestamp);
                        }}
                      >
                        {idx + 1}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-gray-200 dark:bg-zinc-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-mono">
                            {step.time}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              jumpToTimestamp(step.timestamp);
                            }}
                            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            Jump to step
                          </button>
                        </div>
                        <p className="text-gray-900 dark:text-white">
                          {step.instruction}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!videoId && !isLoading && (
          <div className="text-center py-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg">
            <Youtube className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No video parsed yet
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Enter a YouTube cooking video URL above to extract the recipe
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
