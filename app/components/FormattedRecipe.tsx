'use client';

import { useRecipe } from './RecipeContext';

export default function FormattedRecipe() {
  const { formattedRecipe, setActiveTab } = useRecipe();

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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Formatted Recipe</h2>
        <button
          onClick={() => setActiveTab('paste')}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Format Another Recipe
        </button>
      </div>

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