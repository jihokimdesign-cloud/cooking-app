'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { BookOpen, Heart, Trash2, Clock, Users } from 'lucide-react';
import { sampleRecipes } from '@/lib/recipes';
import type { SavedRecipe } from '@/lib/types';

export default function CookbookPage() {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);

  useEffect(() => {
    // Load saved recipes from localStorage
    const stored = localStorage.getItem('savedRecipes');
    if (stored) {
      setSavedRecipes(JSON.parse(stored));
    }
  }, []);

  const saveRecipe = (recipeId: number) => {
    const recipe = sampleRecipes.find((r) => r.id === recipeId);
    if (!recipe) return;

    const savedRecipe: SavedRecipe = {
      ...recipe,
      savedAt: new Date().toISOString(),
    };

    const updated = [...savedRecipes, savedRecipe];
    setSavedRecipes(updated);
    localStorage.setItem('savedRecipes', JSON.stringify(updated));
  };

  const removeRecipe = (recipeId: number) => {
    const updated = savedRecipes.filter((r) => r.id !== recipeId);
    setSavedRecipes(updated);
    localStorage.setItem('savedRecipes', JSON.stringify(updated));
  };

  const isSaved = (recipeId: number) => {
    return savedRecipes.some((r) => r.id === recipeId);
  };

  // Show all recipes with save/unsave functionality
  const allRecipes = sampleRecipes.map((recipe) => ({
    ...recipe,
    isSaved: isSaved(recipe.id),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-5xl">📚</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                My Cookbook
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your saved recipe collection
              </p>
            </div>
          </div>
        </div>

        {/* Saved Recipes Count */}
        {savedRecipes.length > 0 && (
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <Heart className="w-5 h-5 fill-current" />
              <span className="text-lg font-semibold">
                {savedRecipes.length} {savedRecipes.length === 1 ? 'recipe' : 'recipes'} saved
              </span>
            </div>
          </div>
        )}

        {/* Saved Recipes Section */}
        {savedRecipes.length > 0 ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-orange-500" />
              Saved Recipes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white dark:bg-zinc-800 rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                >
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={recipe.image}
                      alt={recipe.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.cookingTime} min
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeRecipe(recipe.id)}
                      className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-lg"
                      aria-label="Remove from cookbook"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {recipe.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {recipe.servings} servings
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-700 rounded-md">
                        {recipe.difficulty}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredients.slice(0, 3).map((ingredient) => (
                        <span
                          key={ingredient}
                          className="px-2 py-1 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium"
                        >
                          {ingredient}
                        </span>
                      ))}
                      {recipe.ingredients.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                          +{recipe.ingredients.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-zinc-800 rounded-xl shadow-md mb-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Your cookbook is empty
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start saving your favorite recipes!
            </p>
          </div>
        )}

        {/* All Recipes Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            All Recipes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                      {recipe.cookingTime} min
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      recipe.isSaved ? removeRecipe(recipe.id) : saveRecipe(recipe.id)
                    }
                    className={`absolute top-3 left-3 p-2 rounded-full transition-colors shadow-lg ${
                      recipe.isSaved
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-white/90 dark:bg-zinc-900/90 hover:bg-orange-500 text-gray-800 dark:text-white hover:text-white'
                    }`}
                    aria-label={recipe.isSaved ? 'Remove from cookbook' : 'Save to cookbook'}
                  >
                    {recipe.isSaved ? (
                      <Trash2 className="w-4 h-4" />
                    ) : (
                      <Heart className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recipe.ingredients.slice(0, 4).map((ingredient) => (
                      <span
                        key={ingredient}
                        className="px-2 py-1 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium"
                      >
                        {ingredient}
                      </span>
                    ))}
                    {recipe.ingredients.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                        +{recipe.ingredients.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

