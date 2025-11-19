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

// Get video duration using YouTube oEmbed API (simpler and more reliable)
async function getVideoDuration(videoId: string): Promise<number> {
  try {
    // Method 1: Try oEmbed (doesn't have duration, but we can try)
    // Method 2: Use a public API or fetch video page
    // For now, we'll use a workaround with YouTube's video info
    
    // Try to get video info from a public endpoint
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch video info');
    }
    
    // oEmbed doesn't provide duration, so we'll need to estimate
    // or use the iframe method as fallback
    return 0; // Will be handled by API
  } catch (error) {
    console.error('Error getting video duration:', error);
    return 0; // Will use default in API
  }
}

// Parse recipe steps from YouTube video
async function parseRecipeSteps(url: string, duration?: number): Promise<{ videoId: string; steps: RecipeStep[]; duration: number; error?: string }> {
  try {
    const response = await fetch('/api/youtube-parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, duration }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to parse video');
    }
    
    const data = await response.json();
    return {
      videoId: data.videoId,
      steps: data.steps || [],
      duration: data.duration || 0,
      error: data.error,
    };
  } catch (error) {
    console.error('Parse error:', error);
    throw error;
  }
}

export default function YouTubePage() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [steps, setSteps] = useState<RecipeStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);

  const handleParse = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const parsed = parseYouTubeURL(url);
      
      if (!parsed.isValid || !parsed.videoId) {
        setError('Invalid YouTube URL. Please check and try again.');
        setIsLoading(false);
        return;
      }

      // Set video ID first
      setVideoId(parsed.videoId);
      setCurrentTimestamp(0);
      
      // Get duration FIRST using YouTube iframe API, then parse steps
      let actualDuration = 0;
      
      // Load YouTube iframe API
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        await new Promise<void>((resolve) => {
          (window as any).onYouTubeIframeAPIReady = () => resolve();
        });
      }
      
      // Create temporary hidden player to get duration
      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-duration-check';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '1px';
      tempDiv.style.height = '1px';
      document.body.appendChild(tempDiv);
      
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout getting duration'));
          }, 10000);
          
          const player = new (window as any).YT.Player('temp-duration-check', {
            videoId: parsed.videoId,
            width: 1,
            height: 1,
            events: {
              onReady: (event: any) => {
                try {
                  actualDuration = event.target.getDuration();
                  console.log('✅ Got video duration:', actualDuration, 'seconds');
                  clearTimeout(timeout);
                  event.target.destroy();
                  document.body.removeChild(tempDiv);
                  resolve();
                } catch (err) {
                  clearTimeout(timeout);
                  document.body.removeChild(tempDiv);
                  reject(err);
                }
              },
              onError: () => {
                clearTimeout(timeout);
                document.body.removeChild(tempDiv);
                reject(new Error('Failed to load video'));
              },
            },
          });
        });
      } catch (err) {
        console.error('Error getting duration:', err);
        document.body.removeChild(tempDiv);
        setError('Could not get video duration. Please try again.');
        setIsLoading(false);
        return;
      }
      
      // Initialize the main YouTube player with API (after steps are loaded)
      setTimeout(() => {
        const container = document.getElementById('youtube-player-container');
        if (container) {
          // Destroy existing player if any
          if ((window as any).youtubePlayer) {
            try {
              (window as any).youtubePlayer.destroy();
            } catch (e) {
              // Ignore errors
            }
          }
          
          // Create new player
          (window as any).youtubePlayer = new (window as any).YT.Player('youtube-player-container', {
            videoId: parsed.videoId,
            width: '100%',
            height: '100%',
            playerVars: {
              enablejsapi: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: (event: any) => {
                console.log('✅ YouTube player ready');
              },
            },
          });
        }
      }, 1000);

      // Verify duration was actually retrieved
      if (!actualDuration || actualDuration <= 0 || isNaN(actualDuration)) {
        console.error('❌ ERROR: Invalid duration:', actualDuration);
        setError(`Could not get video duration (got: ${actualDuration}). Please try again.`);
        setIsLoading(false);
        return;
      }
      
      console.log('✅ Duration verified:', actualDuration, 'seconds (', Math.floor(actualDuration / 60), ':', (actualDuration % 60).toString().padStart(2, '0'), ')');

      // Now parse steps with actual duration
      const result = await parseRecipeSteps(url, actualDuration);
      
      if (result.error && result.steps.length === 0) {
        setError(result.error || 'Could not extract recipe steps. Please try again.');
        setIsLoading(false);
        return;
      }

      // CRITICAL: Filter steps to only include those within actual video duration
      console.log('🔍 Filtering steps...');
      console.log('  Video duration:', actualDuration, 'seconds');
      console.log('  Steps from API:', result.steps.length);
      
      if (result.steps.length > 0) {
        console.log('  Steps timestamps:', result.steps.map((s: RecipeStep) => `${s.time} (${s.timestamp}s)`));
        console.log('  Max step timestamp:', Math.max(...result.steps.map((s: RecipeStep) => s.timestamp)), 'seconds');
      }
      
      const filteredSteps = result.steps.filter((step: RecipeStep) => {
        const isValid = step.timestamp <= actualDuration;
        if (!isValid) {
          console.log(`  ❌ Filtered out: ${step.time} (${step.timestamp}s > ${actualDuration}s)`);
        }
        return isValid;
      });

      console.log('  ✅ Final steps:', filteredSteps.length);
      if (filteredSteps.length > 0) {
        console.log('  Final steps:', filteredSteps.map((s: RecipeStep) => `${s.time} - ${s.instruction.substring(0, 40)}...`));
      } else {
        console.warn('  ⚠️ WARNING: No steps after filtering!');
      }

      // Double check: ensure no steps exceed duration
      const invalidSteps = filteredSteps.filter(s => s.timestamp > actualDuration);
      if (invalidSteps.length > 0) {
        console.error('❌ ERROR: Found invalid steps that exceed duration!', invalidSteps);
        const validSteps = filteredSteps.filter(s => s.timestamp <= actualDuration);
        setSteps(validSteps);
      } else {
        setSteps(filteredSteps);
      }
      
      setVideoDuration(actualDuration);
    } catch (err: any) {
      setError(err.message || 'Failed to parse video. Please try again.');
      console.error('Parse error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const jumpToTimestamp = (timestamp: number) => {
    setCurrentTimestamp(timestamp);
    
    // Use YouTube iframe API to seek without reloading
    if ((window as any).YT && (window as any).YT.Player) {
      const player = (window as any).youtubePlayer;
      if (player && typeof player.seekTo === 'function') {
        player.seekTo(timestamp, true); // true = allowSeekAhead
        console.log(`⏩ Seeking to ${timestamp}s`);
        return;
      }
    }
    
    // Fallback: update iframe src (will reload video)
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
              <div className="aspect-video bg-black relative">
                <div id="youtube-player-container" className="w-full h-full" />
              </div>
              {videoDuration && (
                <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                  비디오 길이: {Math.floor(videoDuration / 60)}:{Math.floor(videoDuration % 60).toString().padStart(2, '0')}
                </div>
              )}
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
