import { NextRequest, NextResponse } from 'next/server';
import { validateIsRecipe } from './validation';
import { formatRecipe } from './formatting';

export async function POST(request: NextRequest) {
  try {
    const { recipe } = await request.json();

    if (!recipe || typeof recipe !== 'string') {
      return NextResponse.json(
        { error: 'Recipe text is required' },
        { status: 400 }
      );
    }

    // Step 1: Validate that the input is actually a recipe
    const validation = await validateIsRecipe(recipe);

    if (!validation.isRecipe) {
      return NextResponse.json(
        {
          error: 'This doesn\'t look like a recipe. Please paste recipe text with ingredients and instructions.',
          reason: validation.reason
        },
        { status: 400 }
      );
    }

    // Step 2: Format the recipe
    const formattedRecipe = await formatRecipe(recipe);

    return NextResponse.json({ formattedRecipe });
  } catch (error) {
    console.error('Error formatting recipe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}