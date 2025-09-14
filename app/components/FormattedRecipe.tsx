'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRecipe } from './RecipeContext';

export default function FormattedRecipe() {
  const { originalRecipe, formattedRecipe, setActiveTab } = useRecipe();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const router = useRouter();

  const handleSaveAndShare = async () => {
    if (!originalRecipe || !formattedRecipe) return;

    setIsSaving(true);
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

      // Redirect to the shared recipe page
      router.push(data.shareUrl);
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard');
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
        <div>
          {!shareUrl ? (
            <button
              onClick={handleSaveAndShare}
              disabled={isSaving}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
            >
              {isSaving ? 'Saving...' : 'Save & Share'}
            </button>
          ) : (
            <button
              onClick={copyToClipboard}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
            >
              {copySuccess ? 'Copied!' : 'Copy Share Link'}
            </button>
          )}
        </div>
      </div>

      {shareUrl && (
        <div className="bg-green-900 border border-green-700 p-3 rounded-md">
          <p className="text-green-300 text-sm mb-2">Recipe saved! Share this link:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 bg-green-800 text-green-100 p-2 rounded text-sm"
            />
            <button
              onClick={copyToClipboard}
              className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors text-sm"
            >
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-600 rounded-md p-6">
        <div
          className="prose max-w-none text-white"
          dangerouslySetInnerHTML={{
            __html: formattedRecipe
              .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-white">$1</h1>')
              .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3 text-white">$1</h2>')
              .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mt-4 mb-2 text-gray-200">$1</h3>')
              .replace(/^- (.*$)/gm, '<li class="ml-4 text-gray-300">$1</li>')
              .replace(/^---$/gm, '<hr class="my-4 border-gray-600">')
              .replace(/\n\n/g, '</p><p class="mb-3 text-gray-300">')
              .replace(/^(?!<[h|l|p])/gm, '<p class="mb-3 text-gray-300">')
              .replace(/(<li.*<\/li>)/g, '<ul class="list-disc list-inside space-y-1 mb-4">$1</ul>')
              .replace(/<\/li><li/g, '</li><li')
          }}
        />
      </div>
    </div>
  );
}