import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getSystemPrompt(): string {
  try {
    const promptPath = join(process.cwd(), 'specs', 'system-message.txt');
    return readFileSync(promptPath, 'utf-8');
  } catch (error) {
    console.error('Error reading system prompt file:', error);
    throw new Error('Failed to load system prompt');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { recipe } = await request.json();

    if (!recipe || typeof recipe !== 'string') {
      return NextResponse.json(
        { error: 'Recipe text is required' },
        { status: 400 }
      );
    }

    const systemPrompt = getSystemPrompt();
    const fullPrompt = `${systemPrompt}\n\n${recipe}`;

    const result = await openai.responses.create({
      model: 'gpt-5-nano',
      input: fullPrompt,
      reasoning: { effort: 'minimal' },
      text: { verbosity: 'low' },
    });

    const formattedRecipe = result.output_text;

    if (!formattedRecipe) {
      return NextResponse.json(
        { error: 'Failed to format recipe' },
        { status: 500 }
      );
    }

    return NextResponse.json({ formattedRecipe });
  } catch (error) {
    console.error('Error formatting recipe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}