import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Recipe, RecipeAPI } from '@/services/recipeApi';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadRecipe(id);
      if (user) {
        checkIfFavorited(id);
      }
    }
  }, [id, user]);

  const loadRecipe = async (recipeId: string) => {
    setIsLoading(true);
    try {
      const recipeData = await RecipeAPI.getRecipeById(recipeId);
      setRecipe(recipeData);
    } catch (error) {
      console.error('Error loading recipe:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load recipe details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfFavorited = async (recipeId: string) => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .maybeSingle();
      
      setIsFavorited(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user || !recipe) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to favorite recipes.",
      });
      return;
    }

    try {
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipe.idMeal);
        
        setIsFavorited(false);
        toast({
          title: "Removed from favorites",
          description: "Recipe removed from your favorites.",
        });
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            recipe_id: recipe.idMeal,
            title: recipe.strMeal,
            thumbnail: recipe.strMealThumb,
          });
        
        setIsFavorited(true);
        toast({
          title: "Added to favorites",
          description: "Recipe saved to your favorites!",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update favorites.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-32 bg-muted rounded" />
            <div className="h-64 bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Recipe not found</h1>
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const ingredients = RecipeAPI.getIngredients(recipe);
  const instructions = RecipeAPI.getInstructions(recipe);
  const isVegetarian = RecipeAPI.isVegetarian(recipe);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto max-w-4xl p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Recipes
          </Button>
          
          <Button
            variant={isFavorited ? "default" : "outline"}
            onClick={handleFavoriteToggle}
            className="gap-2"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
            {isFavorited ? 'Favorited' : 'Add to Favorites'}
          </Button>
        </div>

        {/* Recipe Image and Basic Info */}
        <Card className="overflow-hidden shadow-elegant">
          <div className="relative">
            <img
              src={recipe.strMealThumb}
              alt={recipe.strMeal}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{recipe.strMeal}</h1>
              <div className="flex items-center gap-4 text-sm">
                <span>{recipe.strArea} Cuisine</span>
                <span>•</span>
                <span>{recipe.strCategory}</span>
              </div>
            </div>
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {isVegetarian && (
                <Badge className="bg-vegetarian text-vegetarian-foreground">
                  Vegetarian
                </Badge>
              )}
              <Badge variant="secondary" className="bg-card/80 backdrop-blur-sm">
                {recipe.strCategory}
              </Badge>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>30-45 min</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>4 servings</span>
              </div>
              {recipe.strYoutube && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(recipe.strYoutube, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Watch Video
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ingredients and Instructions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Ingredients */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
              <ul className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Instructions</h2>
              <ol className="space-y-3">
                {instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{instruction}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Source Link */}
        {recipe.strSource && (
          <Card className="shadow-card">
            <CardContent className="p-4 text-center">
              <Button
                variant="outline"
                onClick={() => window.open(recipe.strSource, '_blank')}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Original Recipe
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}