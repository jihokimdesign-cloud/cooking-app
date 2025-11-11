'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, Clock, Users, ChefHat, Trash2 } from 'lucide-react';
import { sampleRecipes } from '@/lib/recipes';
import type { Recipe } from '@/lib/types';
import Link from 'next/link';

const difficultyMap = {
  'Easy': 'Beginner',
  'Medium': 'Intermediate',
  'Hard': 'Advanced',
} as const;

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    // Load favorite recipe IDs from localStorage
    const stored = localStorage.getItem('favoriteRecipes');
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        setFavoriteIds(ids);
        
        // Get full recipe objects
        const recipes = sampleRecipes.filter(recipe => ids.includes(recipe.id));
        setFavoriteRecipes(recipes);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  const removeFavorite = (recipeId: number) => {
    const updatedIds = favoriteIds.filter(id => id !== recipeId);
    setFavoriteIds(updatedIds);
    setFavoriteRecipes(favoriteRecipes.filter(r => r.id !== recipeId));
    localStorage.setItem('favoriteRecipes', JSON.stringify(updatedIds));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-5xl">❤️</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                My Favorites
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your favorite recipes collection
              </p>
            </div>
          </div>
        </div>

        {/* Favorites Count */}
        {favoriteRecipes.length > 0 && (
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
              <Heart className="w-5 h-5 fill-current" />
              <span className="text-lg font-semibold">
                {favoriteRecipes.length} {favoriteRecipes.length === 1 ? 'favorite recipe' : 'favorite recipes'}
              </span>
            </div>
          </div>
        )}

        {/* Favorites Grid */}
        {favoriteRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-1"
              >
                {/* Recipe Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Cooking Time & Difficulty */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.cookingTime} min
                      </span>
                    </div>
                    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-xs font-semibold text-gray-800 dark:text-white">
                        {difficultyMap[recipe.difficulty]}
                      </span>
                    </div>
                  </div>

                  {/* Remove Favorite Button */}
                  <button
                    onClick={() => removeFavorite(recipe.id)}
                    className="absolute bottom-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-lg"
                    aria-label="Remove from favorites"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Recipe Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md font-medium">
                      {recipe.cuisine}
                    </span>
                    {recipe.diet && recipe.diet.length > 0 && (
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-md font-medium">
                        {recipe.diet.join(', ')}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  {/* Recipe Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {recipe.servings} servings
                    </span>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-700 rounded-md">
                      {recipe.difficulty}
                    </span>
                  </div>

                  {/* Ingredients */}
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Ingredients:
                    </div>
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

                  {/* View Recipe Link */}
                  <Link
                    href="/recipes"
                    className="block w-full text-center px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    View Recipe
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-zinc-800 rounded-xl shadow-md">
            <Heart className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No favorites yet
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start adding recipes to your favorites by clicking the heart icon!
            </p>
            <Link
              href="/recipes"
              className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
            >
              Browse Recipes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

