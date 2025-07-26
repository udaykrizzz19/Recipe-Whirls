import React, { useState, useEffect } from 'react';
import { ChefHat, Settings, User, Heart, BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { SearchBar, SearchFilters } from '@/components/SearchBar';
import { RecipeCard } from '@/components/RecipeCard';
import { Recipe, RecipeAPI } from '@/services/recipeApi';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    vegetarian: false,
    nonVegetarian: false,
  });
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set());
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load user profile and preferences
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  // Load initial recipes
  useEffect(() => {
    if (!searchQuery) {
      loadRandomRecipes();
    }
  }, []);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Load profile by email since ID types don't match
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();
      
      setUserProfile(profile);

      // Load favorites
      const { data: favorites } = await supabase
        .from('favorites')
        .select('recipe_id')
        .eq('user_id', user.id);
      
      if (favorites) {
        setUserFavorites(new Set(favorites.map(f => f.recipe_id)));
      }

      // Load likes
      const { data: likes } = await supabase
        .from('recipe_ratings')
        .select('recipe_id')
        .eq('user_id', user.id)
        .eq('rating', 1);
      
      if (likes) {
        setUserLikes(new Set(likes.map(l => l.recipe_id)));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadRandomRecipes = async () => {
    setIsLoading(true);
    try {
      const randomRecipes = await RecipeAPI.getRandomRecipes(12);
      setRecipes(randomRecipes);
    } catch (error) {
      console.error('Error loading random recipes:', error);
      toast({
        variant: "destructive",
        title: "Error loading recipes",
        description: "Failed to load recipes. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      loadRandomRecipes();
      return;
    }

    setIsLoading(true);
    try {
      // Search by ingredient first, fallback to name search
      let searchResults = await RecipeAPI.searchByIngredient(query);
      
      if (searchResults.length === 0) {
        searchResults = await RecipeAPI.searchByName(query);
      }

      // Save search history
      if (user && query.trim()) {
        await supabase
          .from('search_history')
          .insert({
            user_id: user.id,
            search_term: query.trim(),
          });
      }

      setRecipes(searchResults);
    } catch (error) {
      console.error('Error searching recipes:', error);
      toast({
        variant: "destructive",
        title: "Search failed",
        description: "Failed to search recipes. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    // Apply filters to current recipes
    applyFilters(recipes, newFilters);
  };

  const applyFilters = (recipesToFilter: Recipe[], appliedFilters: SearchFilters) => {
    let filteredRecipes = [...recipesToFilter];

    if (appliedFilters.vegetarian && !appliedFilters.nonVegetarian) {
      filteredRecipes = filteredRecipes.filter(recipe => RecipeAPI.isVegetarian(recipe));
    } else if (appliedFilters.nonVegetarian && !appliedFilters.vegetarian) {
      filteredRecipes = filteredRecipes.filter(recipe => !RecipeAPI.isVegetarian(recipe));
    }

    if (appliedFilters.category) {
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.strCategory === appliedFilters.category
      );
    }

    setRecipes(filteredRecipes);
  };

  const handleRecipeDislike = (recipeId: string) => {
    setRecipes(prev => prev.filter(recipe => recipe.idMeal !== recipeId));
  };

  const handleFavoriteChange = (recipeId: string, isFavorited: boolean) => {
    if (isFavorited) {
      setUserFavorites(prev => new Set([...prev, recipeId]));
    } else {
      setUserFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeId);
        return newSet;
      });
    }
  };

  const handleLikeChange = (recipeId: string, isLiked: boolean) => {
    if (isLiked) {
      setUserLikes(prev => new Set([...prev, recipeId]));
    } else {
      setUserLikes(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeId);
        return newSet;
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl shadow-elegant">
            <ChefHat className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Recipe Whirl
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              Discover amazing recipes with ingredients you have
            </p>
          </div>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-3 h-auto"
          >
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/20 bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-6 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gradient-primary rounded-xl">
                <ChefHat className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Recipe Whirl
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  Hello, {userProfile?.name || user.email?.split('@')[0]}!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => navigate('/create-recipe')}>
                <Plus className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => navigate('/favorites')}>
                <Heart className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => navigate('/profile')}>
                <User className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => navigate('/profile')}>
                <Settings className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Search Section */}
        <div className="mb-6 md:mb-8">
          <SearchBar
            onSearch={handleSearch}
            onFiltersChange={handleFiltersChange}
            filters={filters}
            isLoading={isLoading}
          />
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {!searchQuery && (
            <div className="text-center space-y-2 mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-semibold">Discover New Recipes</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Search ingredients you have or explore curated collection
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-48 md:h-64 mb-4" />
                  <div className="space-y-2">
                    <div className="bg-muted rounded h-4 w-3/4" />
                    <div className="bg-muted rounded h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe.idMeal}
                  recipe={recipe}
                  onDislike={() => handleRecipeDislike(recipe.idMeal)}
                  isFavorited={userFavorites.has(recipe.idMeal)}
                  isLiked={userLikes.has(recipe.idMeal)}
                  onFavoriteChange={(isFavorited) => handleFavoriteChange(recipe.idMeal, isFavorited)}
                  onLikeChange={(isLiked) => handleLikeChange(recipe.idMeal, isLiked)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
              <p className="text-muted-foreground mb-4">
                Try searching with different ingredients or adjust your filters
              </p>
              <Button onClick={loadRandomRecipes} variant="outline">
                Show Random Recipes
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}