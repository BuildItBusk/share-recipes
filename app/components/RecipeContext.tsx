'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Tab = 'paste' | 'formatted';

interface RecipeContextType {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  formattedRecipe: string | null;
  setFormattedRecipe: (recipe: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>('paste');
  const [formattedRecipe, setFormattedRecipe] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <RecipeContext.Provider
      value={{
        activeTab,
        setActiveTab,
        formattedRecipe,
        setFormattedRecipe,
        isLoading,
        setIsLoading,
        error,
        setError,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipe() {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipe must be used within a RecipeProvider');
  }
  return context;
}