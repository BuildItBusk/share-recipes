'use client';

import { useRecipe } from './RecipeContext';
import PasteRecipe from './PasteRecipe';
import FormattedRecipe from './FormattedRecipe';

export default function RecipeTabs() {
  const { activeTab, setActiveTab } = useRecipe();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="border-b border-gray-600 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('paste')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'paste'
                ? 'border-white text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-400'
            } transition-colors`}
          >
            Paste Recipe
          </button>
          <button
            onClick={() => setActiveTab('formatted')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'formatted'
                ? 'border-white text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-400'
            } transition-colors`}
          >
            Formatted Recipe
          </button>
        </nav>
      </div>

      <div className="min-h-96">
        {activeTab === 'paste' && <PasteRecipe />}
        {activeTab === 'formatted' && <FormattedRecipe />}
      </div>
    </div>
  );
}