'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Clock, ChefHat, X, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { sampleRecipes } from '@/lib/recipes';
import type { Recipe } from '@/lib/types';
import { RecipeCardSkeleton } from '@/components/recipe-card-skeleton';

const commonIngredients = [
  'chicken', 'beef', 'pork', 'eggs', 'tomato', 'onion', 'garlic',
  'pasta', 'rice', 'potato', 'lettuce', 'cheese', 'bread', 'butter',
  'milk', 'flour', 'sugar', 'salt', 'pepper', 'olive oil'
];

const difficultyMap = {
  'Easy': 'Beginner',
  'Medium': 'Intermediate',
  'Hard': 'Advanced',
} as const;

type DifficultyFilter = 'Beginner' | 'Intermediate' | 'Advanced' | null;
type DietFilter = 'Vegetarian' | 'Vegan' | 'Gluten-free' | null;
type CuisineFilter = 'Italian' | 'Asian' | 'Mexican' | 'American' | null;

export default function RecipesPage() {
  const [ingredientTags, setIngredientTags] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cookingTimeFilter, setCookingTimeFilter] = useState<number | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>(null);
  const [dietFilter, setDietFilter] = useState<DietFilter>(null);
  const [cuisineFilter, setCuisineFilter] = useState<CuisineFilter>(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // URL 파라미터에서 냉장고 재료 가져오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ingredients = params.get('ingredients');
      if (ingredients) {
        const ingredientList = ingredients.split(',').map(i => i.trim()).filter(Boolean);
        setIngredientTags(ingredientList);
      }
      
      // localStorage에서 냉장고 재료 가져오기
      const fridgeIngredients = localStorage.getItem('fridgeIngredients');
      if (fridgeIngredients && !ingredients) {
        try {
          const parsed = JSON.parse(fridgeIngredients);
          const names = parsed.map((ing: any) => ing.name);
          if (names.length > 0) {
            setIngredientTags(names);
          }
        } catch (e) {
          // Ignore
        }
      }
    }
  }, []);

  // Load favorite recipes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('favoriteRecipes');
    if (stored) {
      try {
        setFavoriteRecipes(JSON.parse(stored));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Filter suggestions based on input
  const suggestions = useMemo(() => {
    if (!ingredientInput.trim()) return [];
    const input = ingredientInput.toLowerCase();
    return commonIngredients
      .filter(ing => 
        ing.toLowerCase().includes(input) && 
        !ingredientTags.includes(ing.toLowerCase())
      )
      .slice(0, 5);
  }, [ingredientInput, ingredientTags]);

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addIngredient = (ingredient?: string) => {
    const toAdd = ingredient || ingredientInput.trim().toLowerCase();
    if (toAdd && !ingredientTags.includes(toAdd)) {
      setIngredientTags([...ingredientTags, toAdd]);
      setIngredientInput('');
      setShowSuggestions(false);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredientTags(ingredientTags.filter((tag) => tag !== ingredient));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        addIngredient(suggestions[0]);
      } else {
        addIngredient();
      }
    }
  };

  // Calculate match percentage
  const calculateMatch = (recipe: Recipe, availableIngredients: string[]): number => {
    if (availableIngredients.length === 0) return 0;
    const recipeIngs = recipe.ingredients.map(ing => ing.toLowerCase());
    const available = availableIngredients.map(ing => ing.toLowerCase());
    const matches = recipeIngs.filter(ing => 
      available.some(avail => ing.includes(avail) || avail.includes(ing))
    ).length;
    return Math.round((matches / recipeIngs.length) * 100);
  };

  // Get missing ingredients
  const getMissingIngredients = (recipe: Recipe, availableIngredients: string[]): string[] => {
    const recipeIngs = recipe.ingredients.map(ing => ing.toLowerCase());
    const available = availableIngredients.map(ing => ing.toLowerCase());
    return recipeIngs.filter(ing => 
      !available.some(avail => ing.includes(avail) || avail.includes(ing))
    );
  };

  const filteredRecipes = useMemo(() => {
    let filtered = sampleRecipes.map(recipe => ({
      ...recipe,
      matchPercentage: calculateMatch(recipe, ingredientTags),
      missingIngredients: getMissingIngredients(recipe, ingredientTags),
    }));

    // Filter by cooking time
    if (cookingTimeFilter !== null) {
      filtered = filtered.filter((recipe) => {
        switch (cookingTimeFilter) {
          case 15:
            return recipe.cookingTime < 15;
          case 30:
            return recipe.cookingTime >= 15 && recipe.cookingTime <= 30;
          case 60:
            return recipe.cookingTime > 30;
          default:
            return true;
        }
      });
    }

    // Filter by difficulty
    if (difficultyFilter) {
      const difficultyMapReverse: Record<string, 'Easy' | 'Medium' | 'Hard'> = {
        'Beginner': 'Easy',
        'Intermediate': 'Medium',
        'Advanced': 'Hard',
      };
      const difficulty = difficultyMapReverse[difficultyFilter];
      if (difficulty) {
        filtered = filtered.filter(recipe => recipe.difficulty === difficulty);
      }
    }

    // Filter by diet
    if (dietFilter) {
      filtered = filtered.filter(recipe => 
        recipe.diet?.includes(dietFilter)
      );
    }

    // Filter by cuisine
    if (cuisineFilter) {
      filtered = filtered.filter(recipe => recipe.cuisine === cuisineFilter);
    }

    // Sort by match percentage (highest first)
    return filtered.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [ingredientTags, cookingTimeFilter, difficultyFilter, dietFilter, cuisineFilter]);

  // Handle loading state when filters change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [ingredientTags, cookingTimeFilter, difficultyFilter, dietFilter, cuisineFilter]);

  const toggleFavorite = (recipeId: number) => {
    setFavoriteRecipes(prev => {
      const newFavorites = prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId];
      
      // Update localStorage
      localStorage.setItem('favoriteRecipes', JSON.stringify(newFavorites));
      
      return newFavorites;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Recipe Search 🔍
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find the perfect recipe by ingredients and filters
          </p>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-6 mb-8">
          {/* Ingredient Tags Input with Autocomplete */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Ingredients 🥘
            </label>
            <div className="relative">
              <div className="flex flex-wrap gap-2 mb-3 min-h-[48px] p-3 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
                {ingredientTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium animate-in fade-in slide-in-from-top-2"
                  >
                    {tag}
                    <button
                      onClick={() => removeIngredient(tag)}
                      className="hover:bg-orange-200 dark:hover:bg-orange-900/50 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  ref={inputRef}
                  type="text"
                  value={ingredientInput}
                  onChange={(e) => {
                    setIngredientInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyPress={handleKeyPress}
                  placeholder={ingredientTags.length === 0 ? "Type an ingredient..." : "Add more..."}
                  className="flex-1 min-w-[150px] bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                >
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => addIngredient(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-orange-50 dark:hover:bg-zinc-700 text-gray-900 dark:text-white transition-colors flex items-center gap-2"
                    >
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {commonIngredients.slice(0, 8).map((ing) => (
                <button
                  key={ing}
                  onClick={() => addIngredient(ing)}
                  disabled={ingredientTags.includes(ing)}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  + {ing}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cooking Time Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Clock className="w-4 h-4 inline mr-1" />
                Cooking Time
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCookingTimeFilter(null)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
                    cookingTimeFilter === null
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setCookingTimeFilter(cookingTimeFilter === 15 ? null : 15)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
                    cookingTimeFilter === 15
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                  }`}
                >
                  &lt;15 min
                </button>
                <button
                  onClick={() => setCookingTimeFilter(cookingTimeFilter === 30 ? null : 30)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
                    cookingTimeFilter === 30
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                  }`}
                >
                  30 min
                </button>
                <button
                  onClick={() => setCookingTimeFilter(cookingTimeFilter === 60 ? null : 60)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
                    cookingTimeFilter === 60
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                  }`}
                >
                  1 hour+
                </button>
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <ChefHat className="w-4 h-4 inline mr-1" />
                Difficulty
              </label>
              <div className="flex flex-wrap gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(difficultyFilter === diff ? null : diff)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
                      difficultyFilter === diff
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Diet Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Diet 🥗
              </label>
              <div className="flex flex-wrap gap-2">
                {(['Vegetarian', 'Vegan', 'Gluten-free'] as const).map((diet) => (
                  <button
                    key={diet}
                    onClick={() => setDietFilter(dietFilter === diet ? null : diet)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
                      dietFilter === diet
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {diet}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisine Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Cuisine 🌍
              </label>
              <div className="flex flex-wrap gap-2">
                {(['Italian', 'Asian', 'Mexican', 'American'] as const).map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => setCuisineFilter(cuisineFilter === cuisine ? null : cuisine)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
                      cuisineFilter === cuisine
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Found <span className="font-semibold text-orange-600 dark:text-orange-400">{filteredRecipes.length}</span>{' '}
            {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
            {ingredientTags.length > 0 && (
              <span className="ml-2 text-sm">
                (sorted by ingredient match)
              </span>
            )}
          </p>
        </div>

        {/* Recipe Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <RecipeCardSkeleton />
              </motion.div>
            ))}
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe, index) => {
              const isFavorite = favoriteRecipes.includes(recipe.id);
              const matchPercentage = recipe.matchPercentage;
              
              return (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-zinc-800 rounded-xl shadow-md hover:shadow-2xl transition-shadow duration-300 overflow-hidden group"
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
                    
                    {/* Match Percentage Badge */}
                    {ingredientTags.length > 0 && (
                      <div className="absolute top-3 left-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <span className={`text-sm font-bold ${
                          matchPercentage >= 80 ? 'text-green-600' :
                          matchPercentage >= 50 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {matchPercentage}% match
                        </span>
                      </div>
                    )}

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

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(recipe.id)}
                      className={`absolute bottom-3 right-3 p-2 rounded-full transition-all shadow-lg ${
                        isFavorite
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-white/90 dark:bg-zinc-900/90 hover:bg-red-500 text-gray-800 dark:text-white hover:text-white'
                      }`}
                      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
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

                    {/* Ingredients */}
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Ingredients:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recipe.ingredients.map((ingredient) => {
                          const isMissing = recipe.missingIngredients.includes(ingredient.toLowerCase());
                          return (
                            <span
                              key={ingredient}
                              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                isMissing && ingredientTags.length > 0
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700'
                                  : 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {ingredient}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/shopping?add=${recipe.missingIngredients.join(',')}`}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        장보기 추가
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-zinc-800 rounded-xl shadow-md">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No recipes found
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters or ingredients
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
