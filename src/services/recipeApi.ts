export interface Recipe {
  idMeal: string;
  strMeal: string;
  strDrinkAlternate?: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags?: string;
  strYoutube?: string;
  strSource?: string;
  [key: string]: string | undefined;
}

export interface SearchResponse {
  meals: Recipe[] | null;
}

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export class RecipeAPI {
  static async searchByIngredient(ingredient: string): Promise<Recipe[]> {
    try {
      const response = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
      const data: SearchResponse = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error searching recipes by ingredient:', error);
      return [];
    }
  }

  static async searchByName(name: string): Promise<Recipe[]> {
    try {
      const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(name)}`);
      const data: SearchResponse = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error searching recipes by name:', error);
      return [];
    }
  }

  static async getRecipeById(id: string): Promise<Recipe | null> {
    try {
      const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
      const data: SearchResponse = await response.json();
      return data.meals?.[0] || null;
    } catch (error) {
      console.error('Error fetching recipe by ID:', error);
      return null;
    }
  }

  static async getRandomRecipes(count: number = 10): Promise<Recipe[]> {
    try {
      const promises = Array(count).fill(null).map(() =>
        fetch(`${BASE_URL}/random.php`).then(res => res.json())
      );
      
      const responses = await Promise.all(promises);
      return responses
        .filter(data => data.meals?.[0])
        .map(data => data.meals[0]);
    } catch (error) {
      console.error('Error fetching random recipes:', error);
      return [];
    }
  }

  static async getRecipesByCategory(category: string): Promise<Recipe[]> {
    try {
      const response = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
      const data: SearchResponse = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error fetching recipes by category:', error);
      return [];
    }
  }

  static getIngredients(recipe: Recipe): string[] {
    const ingredients: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim()) {
        ingredients.push(measure ? `${measure.trim()} ${ingredient.trim()}` : ingredient.trim());
      }
    }
    return ingredients;
  }

  static getInstructions(recipe: Recipe): string[] {
    return recipe.strInstructions
      .split(/\r?\n/)
      .filter(step => step.trim())
      .map(step => step.trim());
  }

  static isVegetarian(recipe: Recipe): boolean {
    const nonVegKeywords = ['chicken', 'beef', 'pork', 'lamb', 'fish', 'seafood', 'meat', 'bacon', 'ham', 'turkey', 'duck'];
    const recipeText = `${recipe.strMeal} ${recipe.strCategory} ${recipe.strInstructions} ${this.getIngredients(recipe).join(' ')}`.toLowerCase();
    
    return !nonVegKeywords.some(keyword => recipeText.includes(keyword));
  }
}