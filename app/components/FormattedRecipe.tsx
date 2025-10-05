'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipe } from './RecipeContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function FormattedRecipe() {
  const { originalRecipe, formattedRecipe, setActiveTab } = useRecipe();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSaveAndShare = async () => {
    if (!originalRecipe || !formattedRecipe) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/save-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawText: originalRecipe,
          formattedText: formattedRecipe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save recipe');
      }

      // Validate shareUrl before navigation
      if (!data.shareUrl || typeof data.shareUrl !== 'string') {
        throw new Error('Invalid share URL received from server');
      }

      // Redirect to the shared recipe page
      router.push(data.shareUrl);
    } catch (error) {
      console.error('Error saving recipe:', error);
      setError(error instanceof Error ? error.message : 'Failed to save recipe. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };


  if (!formattedRecipe) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <div className="text-gray-400 text-lg">No recipe formatted yet</div>
          <div className="text-gray-500 text-sm">
            Go to the Paste Recipe tab to format a recipe first.
          </div>
          <button
            onClick={() => setActiveTab('paste')}
            className="bg-white text-black py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            Go to Paste Recipe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-white">Formatted Recipe</h2>
        <button
          onClick={handleSaveAndShare}
          disabled={isSaving}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
        >
          {isSaving ? 'Saving...' : 'Save & Share'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 p-3 rounded-md text-red-300">
          {error}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-600 rounded-md p-6">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: (props) => (
              <h1 className="text-2xl font-bold mb-4 text-white" {...props} />
            ),
            h2: (props) => (
              <h2 className="text-xl font-semibold mt-6 mb-3 text-white" {...props} />
            ),
            h3: (props) => (
              <h3 className="text-lg font-medium mt-4 mb-2 text-gray-200" {...props} />
            ),
            p: (props) => (
              <p className="mb-3 text-gray-300" {...props} />
            ),
            ul: (props) => (
              <ul className="list-disc list-inside space-y-1 mb-4 text-gray-300" {...props} />
            ),
            ol: (props) => (
              <ol className="list-decimal list-inside space-y-1 mb-4 text-gray-300" {...props} />
            ),
            li: (props) => (
              <li className="ml-4 text-gray-300" {...props} />
            ),
            hr: (props) => (
              <hr className="my-4 border-gray-600" {...props} />
            ),
          }}
        >
          {formattedRecipe}
        </ReactMarkdown>
      </div>
    </div>
  );
}