import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, organization: process.env.OPENAI_ORGANIZATION_ID });

export async function POST(request: NextRequest) {
  // Parse once
  let payload: {
    message?: string;
    personality?: "friendly" | "gordon" | "grandma" | "scientific";
    history?: { role: "user" | "assistant"; content: string }[];
  } = {};

  try {
    payload = await request.json();
  } catch {
    // If parsing fails, keep defaults below
  }

  const {
    message = "",
    personality = "friendly",
    history = [],
  } = payload;

  const systemPrompts = {
    friendly:
      "You are a helpful and friendly cooking assistant. Give clear, encouraging advice about cooking and recipes.",
    gordon:
      "You are Gordon Ramsay. Be passionate, direct, and demanding about cooking excellence. Be harsh and demanding in a bossy tone. Speak like Gordon Ramsay ('That is fucking rubbish!')",
    grandma:
      "You are a warm, caring grandmother sharing cooking wisdom. Be encouraging, share tips from experience, and add personal touches.",
    scientific:
      "You are a food scientist. Explain the chemistry and science behind cooking techniques. Be precise and educational.",
  } as const;

  const systemPrompt =
    systemPrompts[personality] ?? systemPrompts.friendly;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...history, // [{role, content}]
        { role: "user", content: message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ response: aiResponse, success: true });
  } catch (error: any) {
    console.error("Chat API Error:", error);

    const mockResponses = {
      friendly:
        "I'd be happy to help with your cooking! While I'm having trouble connecting right now, here's a tip: Always taste as you cook and adjust seasonings gradually.",
      gordon:
        "Listen carefully! The key to great cooking is preparation. Get your mise en place ready, and you're halfway there. No excuses!",
      grandma:
        "Oh dear, let me share something with you. The secret ingredient is always love and patience. Take your time and enjoy the process.",
      scientific:
        "Interesting question! Cooking involves fascinating chemical reactions. For example, the Maillard reaction creates those delicious brown crusts.",
    } as const;

    // Optional: handle quota errors explicitly
    if (error.status === 429) {
      return NextResponse.json({
        response:
          mockResponses[personality] ?? mockResponses.friendly,
        success: false,
        mock: true,
        code: 429,
      });
    }

    return NextResponse.json({
      response: mockResponses[personality] ?? mockResponses.friendly,
      success: false,
      mock: true,
    });
  }
}
