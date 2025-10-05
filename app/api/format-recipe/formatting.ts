import OpenAI from 'openai';
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

export async function formatRecipe(recipe: string): Promise<string> {
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
    throw new Error('Failed to format recipe');
  }

  return formattedRecipe;
}
