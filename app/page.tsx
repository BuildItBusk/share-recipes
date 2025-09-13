import { RecipeProvider } from './components/RecipeContext';
import RecipeTabs from './components/RecipeTabs';

export default function Home() {
  return (
    <RecipeProvider>
      <div className="min-h-screen bg-black py-8">
        <div className="container mx-auto px-4">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Recipe Formatter</h1>
            <p className="text-gray-300">Paste any recipe and get it formatted with AI</p>
          </header>
          <RecipeTabs />
        </div>
      </div>
    </RecipeProvider>
  );
}
