'use client';

import { useState } from 'react';
import { useRecipe } from './RecipeContext';

export default function PasteRecipe() {
  const [recipeText, setRecipeText] = useState('');
  const {
    setFormattedRecipe,
    setActiveTab,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useRecipe();

  const handleFormat = async () => {
    if (!recipeText.trim()) {
      setError('Please enter a recipe to format');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/format-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipe: recipeText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to format recipe');
      }

      setFormattedRecipe(data.formattedRecipe);
      setActiveTab('formatted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="recipe-input" className="block text-sm font-medium mb-2 text-white">
          Paste your recipe here:
        </label>
        <textarea
          id="recipe-input"
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          placeholder="Paste your recipe text here..."
          className="w-full h-64 p-3 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent resize-none"
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="text-red-300 text-sm bg-red-900 border border-red-700 p-3 rounded-md">
          {error}
        </div>
      )}

      <button
        onClick={handleFormat}
        disabled={isLoading || !recipeText.trim()}
        className="w-full bg-white text-black py-3 px-4 rounded-md hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Formatting...' : 'Format Recipe'}
      </button>
    </div>
  );
}