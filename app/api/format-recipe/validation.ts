import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ValidationResult {
  isRecipe: boolean;
  reason?: string;
}

export async function validateIsRecipe(text: string): Promise<ValidationResult> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a recipe classifier. Determine if the given text is a recipe or contains recipe instructions. Answer with YES if it is a recipe, or NO if it is not. After your YES/NO answer, provide a brief reason.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0,
      max_tokens: 100,
    });

    const result = response.choices[0]?.message?.content?.trim() || '';
    const isRecipe = result.toUpperCase().startsWith('YES');

    // Extract reason (everything after YES/NO)
    const reason = result.substring(result.indexOf(' ') + 1).trim();

    return {
      isRecipe,
      reason: reason || undefined,
    };
  } catch (error) {
    console.error('Error validating recipe:', error);
    // On validation error, allow the formatting to proceed (fail open)
    return { isRecipe: true, reason: 'Validation check failed, proceeding anyway' };
  }
}
