import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: Request) {
  try {
    const { prompt, apiKey, systemPrompt } = await req.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 401 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });
    console.log(`system prompt: ${systemPrompt}, prompt: ${prompt}`);
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are a code generation assistant. Always respond with only code, no explanations. Generate clean, well-documented TypeScript/JavaScript code based on the user's request. Do not include markdown code blocks in your response - just the raw code."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });
    console.log(`log in chat response: ${JSON.stringify(completion.choices[0].message)}`);
    return NextResponse.json(completion.choices[0].message.content);
  } catch (error: any) {
    console.error('Error:', error);
    
    // Handle specific OpenAI API errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: error?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
