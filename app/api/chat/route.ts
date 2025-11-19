import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Personality = 'friendly' | 'ramsay' | 'science' | 'grandma' | 'gordon' | 'scientific';

interface ChatRequest {
  message: string;
  personality: Personality;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  stream?: boolean;
}

const systemPrompts: Record<'friendly' | 'ramsay' | 'science' | 'grandma', string> = {
  friendly: 'You are a helpful and friendly cooking assistant. Give clear, encouraging advice about cooking and recipes. Be warm and supportive.',
  ramsay: 'You are Gordon Ramsay. Be passionate, direct, and demanding about cooking excellence. Use strong language when appropriate. Be harsh but constructive. Use phrases like "Right, let\'s get this sorted!" and "Do it properly!"',
  science: 'You are a food scientist. Explain the chemistry and science behind cooking techniques. Be precise, educational, and use scientific terminology. Reference molecular gastronomy and food chemistry principles.',
  grandma: 'You are a warm, caring grandmother sharing cooking wisdom. Be encouraging, share tips from experience, and add personal touches. Use phrases like "Oh dear" and "sweetheart". Be nurturing and patient.',
};

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, personality, conversationHistory = [], stream = false } = body;

    if (!message || !personality) {
      return NextResponse.json(
        { error: 'Message and personality are required' },
        { status: 400 }
      );
    }

    // Map frontend personality names to backend names
    const personalityMap: Record<string, 'friendly' | 'ramsay' | 'science' | 'grandma'> = {
      'friendly': 'friendly',
      'gordon': 'ramsay',
      'scientific': 'science',
      'grandma': 'grandma',
      'ramsay': 'ramsay',
      'science': 'science',
    };
    
    const mappedPersonality = personalityMap[personality] || personality;
    
    // Validate personality
    const validPersonalities: ('friendly' | 'ramsay' | 'science' | 'grandma')[] = ['friendly', 'ramsay', 'science', 'grandma'];
    if (!validPersonalities.includes(mappedPersonality)) {
      return NextResponse.json(
        { error: 'Invalid personality type' },
        { status: 400 }
      );
    }

    // Read API key from environment
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error('[chat] OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not set' },
        { status: 500 }
      );
    }

    // Dynamic import of OpenAI module using require to prevent build-time evaluation
    let OpenAI;
    try {
      const openaiModule = require('openai');
      OpenAI = openaiModule.default || openaiModule;
    } catch (importError: any) {
      console.error('[chat] Failed to import OpenAI module:', importError);
      return NextResponse.json(
        { error: 'Failed to import OpenAI module', details: String(importError?.message ?? importError) },
        { status: 500 }
      );
    }

    // Initialize OpenAI client
    const client = new OpenAI({ apiKey });

    // Build messages array
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompts[mappedPersonality] },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Streaming response
    if (stream) {
      try {
        const stream = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: messages as any,
          stream: true,
          max_tokens: 1000,
          temperature: mappedPersonality === 'ramsay' ? 0.9 : mappedPersonality === 'science' ? 0.7 : 0.8,
        });

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                }
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          },
        });

        return new Response(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (error: any) {
        console.error('[chat] Streaming error:', error);
        return NextResponse.json(
          { error: 'Failed to stream response', details: String(error?.message ?? error) },
          { status: 500 }
        );
      }
    }

    // Non-streaming response
    try {
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages as any,
        max_tokens: 1000,
        temperature: personality === 'ramsay' ? 0.9 : personality === 'science' ? 0.7 : 0.8,
      });

      const aiResponse = completion.choices[0]?.message?.content || '';

      return NextResponse.json({
        response: aiResponse,
        personality: mappedPersonality,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('[chat] OpenAI API error:', error);

      // Handle specific errors
      if (error.status === 429) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded. Please try again later.',
            details: String(error?.message ?? error),
          },
          { status: 429 }
        );
      }

      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your configuration.', details: String(error?.message ?? error) },
          { status: 401 }
        );
      }

      // Return error response
      return NextResponse.json(
        {
          error: 'OpenAI API request failed',
          details: String(error?.message ?? error),
        },
        { status: error.status || 500 }
      );
    }
  } catch (err: any) {
    console.error('[chat] Runtime error in /api/chat:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
