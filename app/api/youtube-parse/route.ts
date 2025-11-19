import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

interface RecipeStep {
  timestamp: number;
  time: string;
  instruction: string;
  category?: string; // e.g., 'prep', 'cooking', 'serving'
}

// Extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Parse YouTube chapters from description or transcript
function parseChapters(description: string, transcript: string): RecipeStep[] {
  const steps: RecipeStep[] = [];
  
  if (!description && !transcript) {
    return steps;
  }
  
  // Pattern 1: YouTube chapter format (0:00 Chapter Name)
  // This is the most common format in YouTube descriptions
  const chapterPattern = /(\d{1,2}):(\d{2})\s+(.+?)(?=\n|\d{1,2}:\d{2}|$)/g;
  let match;
  
  while ((match = chapterPattern.exec(description)) !== null) {
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const timestamp = minutes * 60 + seconds;
    const instruction = match[3].trim();
    
    // Filter out very short or invalid chapters
    if (instruction.length > 3 && timestamp >= 0) {
      steps.push({
        timestamp,
        time: formatTime(timestamp),
        instruction,
      });
    }
  }
  
  // Pattern 2: Alternative chapter formats
  // Format: [0:00] Chapter Name or 0:00 - Chapter Name
  if (steps.length === 0) {
    const altPattern = /\[(\d{1,2}):(\d{2})\]\s*(.+?)(?=\n|\[|$)/g;
    let altMatch;
    
    while ((altMatch = altPattern.exec(description)) !== null) {
      const minutes = parseInt(altMatch[1], 10);
      const seconds = parseInt(altMatch[2], 10);
      const timestamp = minutes * 60 + seconds;
      const instruction = altMatch[3].trim();
      
      if (instruction.length > 3) {
        steps.push({
          timestamp,
          time: formatTime(timestamp),
          instruction,
        });
      }
    }
  }
  
  // Pattern 3: Parse transcript with timestamps from youtube-transcript
  // Extract meaningful cooking steps from transcript using actual offset values
  // This function receives transcriptData directly for accurate timestamps
  return steps;
}

// Extract steps from transcript data with accurate timestamps
function extractStepsFromTranscript(
  transcriptData: Array<{offset: number, duration: number, text: string}>,
  maxDuration: number
): RecipeStep[] {
  const steps: RecipeStep[] = [];
  
  if (transcriptData.length === 0) {
    return steps;
  }
  
  // Recipe-focused cooking action keywords (actual cooking instructions)
  const recipeActionKeywords = [
    // Cooking methods
    'add', 'mix', 'stir', 'cook', 'fry', 'boil', 'bake', 'roast', 'grill', 'steam', 'sauté',
    'simmer', 'braise', 'sear', 'caramelize', 'deglaze', 'reduce', 'heat', 'warm',
    // Preparation actions
    'chop', 'cut', 'slice', 'dice', 'mince', 'peel', 'grate', 'shred', 'julienne',
    'whisk', 'beat', 'fold', 'knead', 'roll', 'press', 'crush', 'crush',
    // Seasoning and finishing
    'season', 'salt', 'pepper', 'garnish', 'drizzle', 'sprinkle', 'toss',
    // Combining and mixing
    'combine', 'blend', 'marinate', 'marinade', 'coat', 'dredge',
    // Serving
    'serve', 'plate', 'arrange', 'top', 'finish',
    // Korean cooking terms
    '추가', '넣어', '볶아', '끓여', '굽어', '찌고', '자르고', '썰고', '다지고', 
    '갈아', '섞어', '양념', '볶음', '끓임', '굽기', '찜', '튀김'
  ];
  
  // Words to exclude (conversational, not recipe-focused)
  const excludeKeywords = [
    'subscribe', 'like', 'comment', 'share', 'video', 'channel', 'thanks', 'thank you',
    'welcome', 'hello', 'hey', 'hi', 'guys', 'everyone', 'today', 'today we',
    'before we', 'if you', 'you can', 'you should', 'i hope', 'i think',
    'make sure', 'don\'t forget', 'remember', 'also', 'by the way',
    '구독', '좋아요', '댓글', '공유', '영상', '채널', '감사', '안녕', '오늘', '오늘은'
  ];
  
  // Recipe step indicators (actual instruction markers)
  const recipeStepIndicators = [
    'first', 'next', 'then', 'now', 'after', 'add the', 'put the', 'place the',
    'pour', 'pour in', 'pour the', 'mix in', 'stir in', 'add in',
    '단계', '첫', '다음', '그리고', '이제', '마지막', '넣고', '넣어서'
  ];
  
  // Process transcript segments - group related segments and use accurate timestamps
  // Group consecutive segments that form complete sentences/instructions
  const groupedSegments: Array<{timestamp: number, text: string, endTime: number}> = [];
  let currentGroup: {timestamp: number, texts: string[], endTime: number} | null = null;
  const groupTimeWindow = 3000; // 3 seconds - group segments within this window
  
  for (let i = 0; i < transcriptData.length; i++) {
    const item = transcriptData[i];
    const timestamp = Math.floor(item.offset / 1000); // seconds
    const endTime = Math.floor((item.offset + (item.duration || 0)) / 1000);
    const text = item.text.trim();
    
    // Skip if timestamp exceeds video duration
    if (timestamp > maxDuration) {
      continue;
    }
    
    // Skip very short segments
    if (text.length < 5) {
      continue;
    }
    
    // Start a new group or add to current group
    if (!currentGroup || (timestamp - currentGroup.endTime) > 3) {
      // Save previous group if exists
      if (currentGroup && currentGroup.texts.length > 0) {
        const combinedText = currentGroup.texts.join(' ').trim();
        if (combinedText.length > 10) {
          groupedSegments.push({
            timestamp: currentGroup.timestamp,
            text: combinedText,
            endTime: currentGroup.endTime,
          });
        }
      }
      
      // Start new group
      currentGroup = {
        timestamp,
        texts: [text],
        endTime,
      };
    } else {
      // Add to current group
      currentGroup.texts.push(text);
      currentGroup.endTime = Math.max(currentGroup.endTime, endTime);
    }
  }
  
  // Add last group
  if (currentGroup && currentGroup.texts.length > 0) {
    const combinedText = currentGroup.texts.join(' ').trim();
    if (combinedText.length > 10) {
      groupedSegments.push({
        timestamp: currentGroup.timestamp,
        text: combinedText,
        endTime: currentGroup.endTime,
      });
    }
  }
  
  // Now extract recipe-focused steps from grouped segments
  for (const segment of groupedSegments) {
    const text = segment.text;
    const textLower = text.toLowerCase();
    
    // Skip if it contains excluded conversational content
    const hasExcludedContent = excludeKeywords.some(keyword => textLower.includes(keyword));
    if (hasExcludedContent) {
      continue;
    }
    
    // Check if this segment contains recipe-focused content
    const hasRecipeAction = recipeActionKeywords.some(keyword => textLower.includes(keyword));
    const hasStepIndicator = recipeStepIndicators.some(indicator => textLower.includes(indicator));
    const hasMeasurement = /\d+\s*(cup|cups|tbsp|tsp|gram|grams|ounce|ounces|ml|liter|liters|분|시간|컵|스푼|티스푼|그램)/i.test(text);
    const hasIngredient = /(chicken|beef|pork|fish|vegetable|onion|garlic|tomato|rice|noodle|pasta|egg|cheese|butter|oil|flour|sugar|salt|pepper|water|sauce|broth|stock|meat|vegetables|ingredients|carrot|potato|pepper|bell pepper|mushroom|spinach|lettuce|celery|herbs|spices)/i.test(text);
    
    // Must have recipe action or step indicator, AND (measurement or ingredient)
    // This ensures we only get actual cooking instructions, not general conversation
    const isRecipeStep = (hasRecipeAction || hasStepIndicator) && (hasMeasurement || hasIngredient || text.length > 30);
    
    if (isRecipeStep && text.length > 15) {
      // Clean up and format as recipe instruction
      let cleanedText = text.replace(/\s+/g, ' ').trim();
      
      // Remove conversational phrases at the start
      cleanedText = cleanedText.replace(/^(so|now|then|and|but|or|well|okay|ok|alright|right|yeah|yes|no|hmm|um|uh)\s*,?\s*/i, '');
      cleanedText = cleanedText.replace(/^(이제|그래서|그리고|그런데|그럼|음|어|아)\s*,?\s*/i, '');
      
      // Capitalize first letter
      const instruction = cleanedText.charAt(0).toUpperCase() + cleanedText.slice(1);
      
      // Ensure it ends with proper punctuation
      const finalInstruction = instruction.endsWith('.') || instruction.endsWith('!') || instruction.endsWith('?') 
        ? instruction 
        : instruction + '.';
      
      steps.push({
        timestamp: segment.timestamp,
        time: formatTime(segment.timestamp),
        instruction: finalInstruction,
      });
    }
  }
  
  console.log(`📝 Found ${steps.length} potential steps from transcript`);
  
  // If we got steps from transcript, group them intelligently
  if (steps.length > 0) {
    // Group transcript steps - only keep significant ones
    const grouped: RecipeStep[] = [];
    const timeThreshold = 20; // At least 20 seconds between steps
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const lastStep = grouped[grouped.length - 1];
      
      // Add if it's the first step, or if enough time has passed
      if (!lastStep || (step.timestamp - lastStep.timestamp) >= timeThreshold) {
        grouped.push(step);
      } else {
        // If steps are too close, merge the instructions
        const mergedInstruction = lastStep.instruction + '. ' + step.instruction;
        grouped[grouped.length - 1] = {
          ...lastStep,
          instruction: mergedInstruction,
        };
      }
    }
    
    // Final cleanup: ensure steps are meaningful and not too similar
    const finalSteps: RecipeStep[] = [];
    for (const step of grouped) {
      const lastStep = finalSteps[finalSteps.length - 1];
      
      // Skip if too similar to previous step
      if (lastStep) {
        const similarity = calculateSimilarity(step.instruction, lastStep.instruction);
        if (similarity > 0.6) {
          // Too similar, skip or merge
          continue;
        }
      }
      
      finalSteps.push(step);
    }
    
    console.log(`📝 Grouped to ${finalSteps.length} steps (removed duplicates)`);
    console.log(`   Sample steps:`, finalSteps.slice(0, 3).map(s => `${s.time} - ${s.instruction.substring(0, 50)}`));
    return finalSteps;
  }
  
  console.log('⚠️ No steps extracted from transcript - will use default steps');
  return steps;
}

// More aggressive extraction - use more transcript segments as steps
// This extracts actual content from transcript even if it doesn't match strict recipe filters
function extractStepsAggressively(
  transcriptData: Array<{offset: number, duration: number, text: string}>,
  maxDuration: number
): RecipeStep[] {
  const steps: RecipeStep[] = [];
  
  if (transcriptData.length === 0) {
    return steps;
  }
  
  // Group segments into meaningful chunks (every 3-5 seconds of content)
  const groupedChunks: Array<{timestamp: number, texts: string[]}> = [];
  let currentChunk: {timestamp: number, texts: string[]} | null = null;
  const chunkTimeWindow = 5; // 5 seconds
  
  for (const item of transcriptData) {
    const timestamp = Math.floor(item.offset / 1000);
    const text = item.text.trim();
    
    if (timestamp > maxDuration || text.length < 5) {
      continue;
    }
    
    if (!currentChunk || (timestamp - currentChunk.timestamp) > chunkTimeWindow) {
      if (currentChunk && currentChunk.texts.length > 0) {
        groupedChunks.push(currentChunk);
      }
      currentChunk = {
        timestamp,
        texts: [text],
      };
    } else {
      currentChunk.texts.push(text);
    }
  }
  
  if (currentChunk && currentChunk.texts.length > 0) {
    groupedChunks.push(currentChunk);
  }
  
  // Extract steps from chunks - take every 3rd-5th chunk depending on video length
  const stepInterval = Math.max(2, Math.floor(groupedChunks.length / 8)); // Aim for 6-8 steps
  
  for (let i = 0; i < groupedChunks.length; i += stepInterval) {
    const chunk = groupedChunks[i];
    const combinedText = chunk.texts.join(' ').trim();
    
    if (combinedText.length < 15) {
      continue;
    }
    
    // Clean up text
    let cleanedText = combinedText.replace(/\s+/g, ' ').trim();
    
    // Remove conversational starters
    cleanedText = cleanedText.replace(/^(so|now|then|and|but|or|well|okay|ok|alright|right|yeah|yes|no|hmm|um|uh|hey|hi|hello)\s*,?\s*/i, '');
    cleanedText = cleanedText.replace(/^(이제|그래서|그리고|그런데|그럼|음|어|아|안녕)\s*,?\s*/i, '');
    
    // Skip if it's clearly not recipe content
    const isNotRecipe = /(subscribe|like|comment|share|channel|video|thanks|thank you|구독|좋아요|댓글)/i.test(cleanedText);
    if (isNotRecipe) {
      continue;
    }
    
    // Capitalize and format
    const instruction = cleanedText.charAt(0).toUpperCase() + cleanedText.slice(1);
    const finalInstruction = instruction.endsWith('.') || instruction.endsWith('!') || instruction.endsWith('?') 
      ? instruction 
      : instruction + '.';
    
    steps.push({
      timestamp: chunk.timestamp,
      time: formatTime(chunk.timestamp),
      instruction: finalInstruction,
    });
  }
  
  // Always add first meaningful chunk if it's recipe-related
  if (groupedChunks.length > 0) {
    const firstChunk = groupedChunks[0];
    const firstText = firstChunk.texts.join(' ').trim();
    const isRecipeStart = /(ingredient|recipe|cook|make|prepare|add|mix|chop|cut|재료|요리|만들|준비)/i.test(firstText);
    
    if (isRecipeStart && firstText.length > 15 && !steps.some(s => Math.abs(s.timestamp - firstChunk.timestamp) < 5)) {
      let cleaned = firstText.replace(/\s+/g, ' ').trim();
      cleaned = cleaned.replace(/^(so|now|then|and|but|or|well|okay|ok|alright|right|yeah|yes|no|hmm|um|uh)\s*,?\s*/i, '');
      const instruction = cleaned.charAt(0).toUpperCase() + cleaned.slice(1) + '.';
      steps.unshift({
        timestamp: firstChunk.timestamp,
        time: formatTime(firstChunk.timestamp),
        instruction,
      });
    }
  }
  
  // Remove duplicates and sort
  const uniqueSteps = steps.filter((step, index, self) =>
    index === self.findIndex(s => Math.abs(s.timestamp - step.timestamp) < 5)
  );
  
  uniqueSteps.sort((a, b) => a.timestamp - b.timestamp);
  
  console.log(`📝 Aggressive extraction: ${uniqueSteps.length} steps from ${transcriptData.length} segments`);
  if (uniqueSteps.length > 0) {
    console.log(`   Sample:`, uniqueSteps.slice(0, 3).map(s => `${s.time} - ${s.instruction.substring(0, 40)}`));
  }
  
  return uniqueSteps;
}

// Intelligent step detection from transcript (not used currently, but kept for future)
function detectCookingSteps(transcript: string, videoDuration: number): RecipeStep[] {
  const steps: RecipeStep[] = [];
  
  // Common cooking action keywords
  const cookingKeywords = [
    'add', 'mix', 'stir', 'cook', 'fry', 'boil', 'bake', 'roast', 'grill',
    'chop', 'cut', 'slice', 'dice', 'mince', 'peel', 'grate', 'whisk',
    'season', 'salt', 'pepper', 'heat', 'simmer', 'reduce', 'drain',
    'serve', 'plate', 'garnish', 'finish', 'combine', 'blend', 'fold'
  ];
  
  // Split transcript into sentences
  const sentences = transcript.split(/[.!?]\s+/).filter(s => s.length > 20);
  
  // Estimate timestamps based on sentence position
  const avgWordsPerSecond = 2.5; // Average speaking rate
  let currentTime = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const wordCount = sentence.split(/\s+/).length;
    const estimatedDuration = wordCount / avgWordsPerSecond;
    
    // Check if sentence contains cooking actions
    const hasCookingAction = cookingKeywords.some(keyword => 
      sentence.toLowerCase().includes(keyword)
    );
    
    // Check if sentence is a step (not just description)
    const isStep = hasCookingAction || 
                   sentence.match(/\d+\s*(cup|tbsp|tsp|gram|ounce|minute|hour)/i) !== null ||
                   sentence.match(/^(first|next|then|now|after|before)/i) !== null;
    
    if (isStep && currentTime < videoDuration) {
      steps.push({
        timestamp: Math.floor(currentTime),
        time: formatTime(Math.floor(currentTime)),
        instruction: sentence.trim(),
      });
    }
    
    currentTime += estimatedDuration;
    
    // Stop if we've exceeded video duration
    if (currentTime >= videoDuration) break;
  }
  
  return steps;
}

// Group steps by similarity to avoid duplicates
function groupSimilarSteps(steps: RecipeStep[]): RecipeStep[] {
  if (steps.length === 0) return steps;
  
  const grouped: RecipeStep[] = [steps[0]];
  
  for (let i = 1; i < steps.length; i++) {
    const current = steps[i];
    const last = grouped[grouped.length - 1];
    
    // Skip if too close in time (within 10 seconds)
    if (current.timestamp - last.timestamp < 10) {
      continue;
    }
    
    // Skip if instruction is too similar
    const similarity = calculateSimilarity(current.instruction, last.instruction);
    if (similarity > 0.7) {
      continue;
    }
    
    grouped.push(current);
  }
  
  return grouped;
}

// Simple string similarity (Jaccard similarity)
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const words1Array = Array.from(words1);
  const words2Array = Array.from(words2);
  const intersection = new Set(words1Array.filter(x => words2.has(x)));
  const union = new Set([...words1Array, ...words2Array]);
  
  return intersection.size / union.size;
}

export async function POST(request: NextRequest) {
  try {
    const { url, duration } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }
    
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }
    
    // Use provided duration from client (via YouTube iframe API)
    // If duration is not provided, we'll create steps that can be filtered later
    // But we'll use a reasonable estimate to avoid creating too many steps
    const maxDuration = duration && duration > 0 ? duration : 0;
    let description = '';
    let transcript = '';
    
    // Method 1: Try to get transcript using youtube-transcript (FREE, no API key needed)
    // This library supports both manual and auto-generated captions
    let transcriptData: Array<{offset: number, duration: number, text: string}> = [];
    let rawTranscript: any[] = [];
    
    try {
      console.log(`🔍 Attempting to fetch transcript for video: ${videoId}`);
      console.log(`   (Supports both manual and auto-generated captions)`);
      
      // Strategy: Try default first, then extract available languages from error if needed
      try {
        console.log(`📥 Step 1: Trying default transcript fetch (auto-detect)...`);
        rawTranscript = await YoutubeTranscript.fetchTranscript(videoId);
        console.log(`✅ SUCCESS! Raw transcript (default): ${rawTranscript.length} items`);
      } catch (defaultError: any) {
          console.log(`⚠️ Default fetch failed: ${defaultError.message}`);
          console.log(`📥 Step 2: Checking available languages from error message...`);
          const errorMsg = defaultError.message || '';
          
          // Extract available languages from error message
          // Format: "Available languages: en, es"
          const availableLangsMatch = errorMsg.match(/Available languages:\s*([^)]+)/i);
          
          if (availableLangsMatch) {
            const availableLangs = availableLangsMatch[1]
              .split(',')
              .map((l: string) => l.trim())
              .filter((l: string) => l.length > 0);
            
            console.log(`📥 Found available languages: ${availableLangs.join(', ')}`);
            
            // Try each available language (prefer 'en' first)
            const langsToTry = availableLangs.includes('en') 
              ? ['en', ...availableLangs.filter((l: string) => l !== 'en')]
              : availableLangs;
            
            console.log(`📥 Step 3: Trying languages in order: ${langsToTry.join(', ')}`);
            for (const lang of langsToTry) {
              try {
                console.log(`   → Attempting ${lang}...`);
                rawTranscript = await YoutubeTranscript.fetchTranscript(videoId, { lang });
                console.log(`   ✅ SUCCESS! Raw transcript (${lang}): ${rawTranscript.length} items`);
                if (rawTranscript.length > 0) break;
              } catch (langError: any) {
                console.warn(`   ❌ Failed for ${lang}: ${langError.message}`);
                continue;
              }
            }
          } else {
            // No language info in error, try common languages
            console.log('📥 Step 3: No language info in error, trying common languages (en, es, ko)...');
            const commonLangs = ['en', 'es', 'ko'];
            for (const lang of commonLangs) {
              try {
                console.log(`   → Attempting ${lang}...`);
                rawTranscript = await YoutubeTranscript.fetchTranscript(videoId, { lang });
                console.log(`   ✅ SUCCESS! Raw transcript (${lang}): ${rawTranscript.length} items`);
                if (rawTranscript.length > 0) break;
              } catch (langError: any) {
                const langErrorMsg = langError.message || '';
                console.warn(`   ❌ Failed for ${lang}: ${langErrorMsg.substring(0, 100)}`);
                
                // Check if this error has language info
                const langMatch = langErrorMsg.match(/Available languages:\s*([^)]+)/i);
                if (langMatch) {
                  const availableLangs = langMatch[1].split(',').map((l: string) => l.trim());
                  console.log(`   📥 Found available languages in error: ${availableLangs.join(', ')}`);
                  
                  // Try the first available language
                  if (availableLangs.length > 0) {
                    try {
                      console.log(`   → Trying first available: ${availableLangs[0]}...`);
                      rawTranscript = await YoutubeTranscript.fetchTranscript(videoId, { lang: availableLangs[0] });
                      console.log(`   ✅ SUCCESS! Raw transcript (${availableLangs[0]}): ${rawTranscript.length} items`);
                      break;
                    } catch (e: any) {
                      console.warn(`   ❌ Failed for ${availableLangs[0]}: ${e.message}`);
                    }
                  }
                }
                continue;
              }
            }
          }
        }
      
      if (rawTranscript.length > 0) {
        console.log(`✅ Successfully fetched ${rawTranscript.length} transcript items`);
        console.log(`📥 First item sample:`, JSON.stringify(rawTranscript[0], null, 2));
        console.log(`📥 First item keys:`, Object.keys(rawTranscript[0]));
      } else {
        console.warn('⚠️ No transcript items received from youtube-transcript');
        console.warn('   Trying alternative method: scraping from YouTube page HTML...');
        
        // Fallback: Try to extract transcript from YouTube page HTML
        try {
          const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
          const pageResponse = await fetch(videoPageUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            },
          });
          
          if (pageResponse.ok) {
            const html = await pageResponse.text();
            
            // Try to find transcript data in ytInitialPlayerResponse
            // YouTube stores transcript data in a large JSON object embedded in the HTML
            let transcriptUrl: string | null = null;
            
            // Method 1: Extract ytInitialPlayerResponse (more reliable)
            const playerResponseMatch = html.match(/var ytInitialPlayerResponse = ({[\s\S]+?});/);
            if (playerResponseMatch) {
              try {
                const playerResponse = JSON.parse(playerResponseMatch[1]);
                const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
                
                // Find English caption track (prefer 'en', fallback to first available)
                const enTrack = captionTracks.find((track: any) => 
                  track.languageCode === 'en' || track.languageCode?.startsWith('en')
                ) || captionTracks[0];
                
                if (enTrack?.baseUrl) {
                  transcriptUrl = enTrack.baseUrl;
                  console.log(`✅ Found transcript URL in ytInitialPlayerResponse: ${transcriptUrl?.substring(0, 100)}...`);
                }
              } catch (e: any) {
                console.warn(`⚠️ Failed to parse ytInitialPlayerResponse: ${e.message}`);
              }
            }
            
            // Method 2: Try simpler regex patterns if Method 1 failed
            if (!transcriptUrl) {
              const transcriptPatterns = [
                // Pattern 1: captionTracks array directly
                /"captionTracks":\s*(\[[^\]]+\])/,
                // Pattern 2: baseUrl in captions
                /"baseUrl":\s*"([^"]+)"/,
              ];
              
              for (const pattern of transcriptPatterns) {
                const match = html.match(pattern);
                if (match) {
                  try {
                    if (pattern.source.includes('captionTracks')) {
                      const captionTracks = JSON.parse(match[1]);
                      const enTrack = captionTracks.find((track: any) => 
                        track.languageCode === 'en' || track.languageCode?.startsWith('en')
                      ) || captionTracks[0];
                      
                      if (enTrack?.baseUrl) {
                        transcriptUrl = enTrack.baseUrl;
                        console.log(`✅ Found transcript URL via pattern: ${transcriptUrl?.substring(0, 100)}...`);
                        break;
                      }
                    } else if (pattern.source.includes('baseUrl')) {
                      // Check if this looks like a transcript URL
                      const url = match[1];
                      if (url.includes('timedtext') || url.includes('caption')) {
                        transcriptUrl = url;
                        console.log(`✅ Found transcript URL directly: ${transcriptUrl.substring(0, 100)}...`);
                        break;
                      }
                    }
                  } catch (e) {
                    // Continue to next pattern
                    continue;
                  }
                }
              }
            }
            
            // If we found a transcript URL, fetch it
            if (transcriptUrl) {
              try {
                const transcriptResponse = await fetch(transcriptUrl);
                if (transcriptResponse.ok) {
                  const transcriptXml = await transcriptResponse.text();
                  
                  // Parse XML transcript (YouTube uses XML format)
                  // Format: <transcript><text start="0.0" dur="2.5">Hello</text>...</transcript>
                  const textMatches = Array.from(transcriptXml.matchAll(/<text start="([^"]+)" dur="([^"]+)"[^>]*>([^<]+)<\/text>/g));
                  
                  for (const match of textMatches) {
                    const start = parseFloat(match[1]);
                    const dur = parseFloat(match[2]);
                    const text = match[3].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
                    
                    rawTranscript.push({
                      text: text.trim(),
                      offset: Math.floor(start * 1000), // Convert to milliseconds
                      duration: Math.floor(dur * 1000),
                    });
                  }
                  
                  if (rawTranscript.length > 0) {
                    console.log(`✅ Successfully scraped ${rawTranscript.length} transcript items from HTML`);
                  }
                }
              } catch (fetchError: any) {
                console.warn(`⚠️ Failed to fetch transcript from URL: ${fetchError.message}`);
              }
            } else {
              console.warn('⚠️ Could not find transcript URL in page HTML');
            }
          }
        } catch (scrapeError: any) {
          console.warn(`⚠️ Failed to scrape transcript from HTML: ${scrapeError.message}`);
        }
        
        if (rawTranscript.length === 0) {
          console.warn('⚠️ All transcript methods failed');
          console.warn('   This could mean:');
          console.warn('   1. Video has no captions (auto-generated or manual)');
          console.warn('   2. Captions are disabled for this video');
          console.warn('   3. YouTube structure has changed');
          console.warn('   Check video: https://www.youtube.com/watch?v=' + videoId);
          console.warn('   Look for the "CC" button - if it\'s grayed out, captions are not available');
        }
      }
      
      // youtube-transcript returns items with structure: { text, offset, duration }
      // But let's handle all possible formats
      transcriptData = rawTranscript.map((item: any, index: number) => {
        // Try different possible field names
        let offset = item.offset;
        if (offset === undefined) offset = item.start;
        if (offset === undefined) offset = item.startTimeMs;
        if (offset === undefined) offset = item.startTime;
        if (offset === undefined) offset = item.time;
        if (offset === undefined) offset = 0;
        
        let duration = item.duration;
        if (duration === undefined) duration = item.dur;
        if (duration === undefined) duration = 0;
        
        let text = item.text;
        if (text === undefined) text = item.transcript;
        if (text === undefined) text = item.content;
        if (text === undefined) text = '';
        
        // Convert offset to milliseconds if it's in seconds
        if (typeof offset === 'number' && offset < 100000) {
          // Likely in seconds, convert to milliseconds
          offset = offset * 1000;
        }
        
        const result = {
          offset: typeof offset === 'number' ? offset : 0, // milliseconds
          duration: typeof duration === 'number' ? duration : 0, // milliseconds
          text: String(text || '').trim(),
        };
        
        // Log first few items for debugging
        if (index < 3) {
          console.log(`   Item ${index}: offset=${result.offset}ms, duration=${result.duration}ms, text="${result.text.substring(0, 50)}"`);
        }
        
        return result;
      }).filter(item => item.text.length > 0); // Filter out empty items
      
      console.log(`✅ Processed transcript: ${transcriptData.length} segments (from ${rawTranscript.length} raw items)`);
      
      // Debug: Check why items might be filtered out
      if (rawTranscript.length > 0 && transcriptData.length === 0) {
        console.error('❌ CRITICAL: All transcript items were filtered out!');
        console.error(`   Raw transcript had ${rawTranscript.length} items, but processed transcript has 0`);
        console.error('   Checking first few raw items:');
        for (let i = 0; i < Math.min(5, rawTranscript.length); i++) {
          const item = rawTranscript[i];
          console.error(`   Item ${i}:`, {
            keys: Object.keys(item),
            offset: item.offset,
            start: item.start,
            startTimeMs: item.startTimeMs,
            text: item.text ? `"${String(item.text).substring(0, 50)}"` : 'MISSING',
            textLength: item.text ? String(item.text).length : 0,
            fullItem: JSON.stringify(item),
          });
        }
      }
      
      // Convert transcript to text with timestamps for parsing
      // offset is in milliseconds, convert to seconds
      transcript = transcriptData
        .map(item => {
          const seconds = Math.floor(item.offset / 1000);
          return `${formatTime(seconds)} ${item.text}`;
        })
        .join('\n');
      
      if (transcriptData.length > 0) {
        const first = transcriptData[0];
        const last = transcriptData[transcriptData.length - 1];
        console.log(`   First segment: ${formatTime(Math.floor(first.offset / 1000))} - "${first.text.substring(0, 50)}"`);
        console.log(`   Last segment: ${formatTime(Math.floor(last.offset / 1000))} - "${last.text.substring(0, 50)}"`);
        console.log(`   Offset format: ${first.offset}ms = ${Math.floor(first.offset / 1000)}s`);
        console.log(`   Total transcript length: ${transcript.length} characters`);
      } else {
        console.warn('⚠️ Transcript array is empty after processing');
        console.warn(`   Raw transcript had ${rawTranscript.length} items`);
      }
    } catch (transcriptError: any) {
      console.error('❌ Error in transcript processing:', transcriptError);
      console.error('   Error message:', transcriptError.message);
      console.error('   Error stack:', transcriptError.stack);
      // Continue without transcript
      transcriptData = [];
    }
    
    // Method 2: Try to fetch video description from HTML (for chapters)
    // This is important when transcript is not available
    try {
      const videoPageUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const pageResponse = await fetch(videoPageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      
      if (pageResponse.ok) {
        const html = await pageResponse.text();
        
        // Try multiple methods to extract description
        let descMatch = html.match(/"shortDescription":"([^"]+)"/);
        if (!descMatch) descMatch = html.match(/"description":"([^"]+)"/);
        if (!descMatch) descMatch = html.match(/<meta name="description" content="([^"]+)"/);
        if (!descMatch) {
          // Try to find in ytInitialData
          const ytDataMatch = html.match(/var ytInitialData = ({.+?});/);
          if (ytDataMatch) {
            try {
              const ytData = JSON.parse(ytDataMatch[1]);
              const desc = ytData?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.find((c: any) => 
                c?.videoSecondaryInfoRenderer?.description?.runs
              )?.videoSecondaryInfoRenderer?.description?.runs?.map((r: any) => r.text).join('');
              if (desc) {
                description = desc;
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        }
        
        if (descMatch && !description) {
          description = descMatch[1]
            .replace(/\\n/g, '\n')
            .replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => String.fromCharCode(parseInt(code, 16)))
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'");
        }
        
        if (description) {
          console.log(`✅ Got description (${description.length} chars)`);
          console.log(`   First 200 chars: ${description.substring(0, 200)}`);
        } else {
          console.warn('⚠️ Could not extract description from video page');
        }
      } else {
        console.warn(`⚠️ Failed to fetch video page: ${pageResponse.status} ${pageResponse.statusText}`);
      }
    } catch (fetchError: any) {
      console.warn('Could not fetch video page:', fetchError.message);
    }
    
    // Try to parse chapters from description first, then from transcript
    let steps = parseChapters(description, transcript);
    
    console.log(`📊 Parsing results: ${steps.length} steps from chapters/description, video duration: ${maxDuration}s`);
    
    // ALWAYS try to extract from transcript if available (even if we have chapters)
    // Transcript gives us actual video content, not just chapter markers
    console.log(`🔍 Checking transcript data: ${transcriptData.length} segments available`);
    
    if (transcriptData.length > 0) {
      console.log('📝 Extracting steps from transcript (actual video content)...');
      const transcriptSteps = extractStepsFromTranscript(transcriptData, maxDuration);
      
      console.log(`📊 Transcript extraction result: ${transcriptSteps.length} steps found`);
      
      // If we got steps from transcript, use them (they're more accurate)
      if (transcriptSteps.length > 0) {
        console.log(`✅ Using ${transcriptSteps.length} steps from transcript (actual content)`);
        steps = transcriptSteps;
      } else {
        // If no steps from transcript with filters, try aggressive extraction
        console.log('📝 No steps found with filters, trying aggressive extraction...');
        const aggressiveSteps = extractStepsAggressively(transcriptData, maxDuration);
        
        if (aggressiveSteps.length > 0) {
          console.log(`📝 Aggressive extraction found ${aggressiveSteps.length} steps`);
          steps = aggressiveSteps;
        } else {
          console.log('⚠️ No steps extracted from transcript at all - will try very lenient extraction later');
        }
      }
    } else {
      console.log('⚠️ No transcript data available - transcriptData.length is 0');
      console.log('   This could mean:');
      console.log('   1. Video has no transcript/captions');
      console.log('   2. Transcript fetch failed (check error logs above)');
      console.log('   3. Transcript format is not recognized');
    }
    
    // Filter steps to only include those within video duration
    const stepsBeforeFilter = steps.length;
    steps = steps.filter(step => {
      const isValid = step.timestamp <= maxDuration;
      if (!isValid && maxDuration > 0) {
        console.log(`❌ Filtered out step at ${step.time} (${step.timestamp}s > ${maxDuration}s)`);
      }
      return isValid;
    });
    
    console.log(`🔍 After duration filter: ${steps.length} steps (removed ${stepsBeforeFilter - steps.length})`);
    
    // If no steps found from transcript/chapters, ONLY create default steps if transcript is not available
    if (steps.length === 0) {
      // If we have transcript data but couldn't extract steps, try one more time with very lenient extraction
      if (transcriptData.length > 0) {
        console.log('⚠️ No steps extracted, trying very lenient extraction from transcript...');
        // Use every chunk as a step (very aggressive)
        const veryLenientSteps: RecipeStep[] = [];
        const chunkSize = Math.max(10, Math.floor(transcriptData.length / 6)); // Aim for ~6 steps
        
        for (let i = 0; i < transcriptData.length; i += chunkSize) {
          const chunk = transcriptData.slice(i, Math.min(i + chunkSize, transcriptData.length));
          if (chunk.length === 0) continue;
          
          const firstItem = chunk[0];
          const timestamp = Math.floor(firstItem.offset / 1000);
          const combinedText = chunk.map(item => item.text.trim()).join(' ').trim();
          
          if (timestamp > maxDuration || combinedText.length < 10) continue;
          
          // Skip obvious non-recipe content
          if (/(subscribe|like|comment|share|channel|video|thanks|thank you|구독|좋아요|댓글)/i.test(combinedText)) {
            continue;
          }
          
          let cleaned = combinedText.replace(/\s+/g, ' ').trim();
          cleaned = cleaned.replace(/^(so|now|then|and|but|or|well|okay|ok|alright|right|yeah|yes|no|hmm|um|uh|hey|hi|hello)\s*,?\s*/i, '');
          
          if (cleaned.length > 15) {
            const instruction = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
            const finalInstruction = instruction.endsWith('.') || instruction.endsWith('!') || instruction.endsWith('?') 
              ? instruction 
              : instruction + '.';
            
            veryLenientSteps.push({
              timestamp,
              time: formatTime(timestamp),
              instruction: finalInstruction,
            });
          }
        }
        
        if (veryLenientSteps.length > 0) {
          console.log(`✅ Very lenient extraction found ${veryLenientSteps.length} steps`);
          steps = veryLenientSteps;
        }
      }
      
      // ONLY create default steps if we have NO transcript data at all
      if (steps.length === 0 && transcriptData.length === 0) {
        // If we don't have duration, return empty steps - client will handle it
        if (maxDuration <= 0) {
          console.log('⚠️ No duration provided, returning empty steps');
          return NextResponse.json({
            videoId,
            steps: [],
            duration: 0,
            needsDuration: true, // Flag to indicate client should get duration
          });
        }
        
        console.log(`📝 Creating default steps for ${maxDuration}s video (no transcript available)`);
        
        // CRITICAL: Only create steps within the actual video duration
        // For short videos (under 5 minutes), create fewer steps
        const stepCount = maxDuration < 300 
          ? Math.min(4, Math.max(2, Math.floor(maxDuration / 60))) // 2-4 steps for short videos
          : Math.min(6, Math.max(3, Math.floor(maxDuration / 60))); // 3-6 steps for longer videos
        
        const stepInterval = Math.floor(maxDuration / (stepCount + 1));
        
        const stepLabels = [
          'Introduction and ingredients overview',
          'Preparation and setup',
          'Start cooking process',
          'Main cooking steps',
          'Finishing touches',
          'Final presentation and serving',
        ];
        
        steps = [];
        for (let i = 0; i < stepCount; i++) {
          const timestamp = Math.floor(stepInterval * (i + 1));
          // CRITICAL: Only add step if it's within video duration
          if (timestamp < maxDuration) {
            steps.push({
              timestamp,
              time: formatTime(timestamp),
              instruction: stepLabels[i] || `Step ${i + 1}`,
            });
            console.log(`  ✅ Created step at ${formatTime(timestamp)} (${timestamp}s < ${maxDuration}s)`);
          } else {
            console.log(`  ❌ Skipped step at ${formatTime(timestamp)} (${timestamp}s >= ${maxDuration}s)`);
          }
        }
        
        // Always add start step if video is longer than 5 seconds
        if (maxDuration > 5 && (steps.length === 0 || steps[0].timestamp > 5)) {
          steps.unshift({
            timestamp: 0,
            time: '0:00',
            instruction: 'Introduction',
          });
        }
      }
    }
    
    // Group similar steps and ensure all are within video duration
    steps = groupSimilarSteps(steps);
    const finalStepsBeforeFilter = steps.length;
    steps = steps.filter(step => {
      const isValid = step.timestamp <= maxDuration;
      return isValid;
    });
    
    if (finalStepsBeforeFilter !== steps.length) {
      console.log(`🔍 Final filter: ${steps.length} steps (removed ${finalStepsBeforeFilter - steps.length} duplicates)`);
    }
    
    // Sort by timestamp
    steps.sort((a, b) => a.timestamp - b.timestamp);
    
    console.log(`✅ Final result: ${steps.length} steps for ${maxDuration}s video`);
    console.log('   Steps:', steps.map(s => `${s.time} - ${s.instruction.substring(0, 30)}...`));
    
    return NextResponse.json({
      videoId,
      steps,
      duration: maxDuration,
    });
  } catch (error: any) {
    console.error('YouTube parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse YouTube video', details: error.message },
      { status: 500 }
    );
  }
}

