export interface Recipe {
  id: number;
  title: string;
  image: string;
  ingredients: string[];
  cookingTime: number; // in minutes
  description: string;
  cuisine: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  instructions: string[];
  diet?: ('Vegetarian' | 'Vegan' | 'Gluten-free')[];
}

export interface SavedRecipe extends Recipe {
  savedAt: string;
}

