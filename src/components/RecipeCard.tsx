import React, { useState } from 'react';
import { Heart, ThumbsUp, ThumbsDown, Clock, Users, Eye } from 'lucide-react';
import { GlassCard, GlassCardContent } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recipe, RecipeAPI } from '@/services/recipeApi';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface RecipeCardProps {
  recipe: Recipe;
  onDislike?: () => void;
  isFavorited?: boolean;
  isLiked?: boolean;
  onFavoriteChange?: (isFavorited: boolean) => void;
  onLikeChange?: (isLiked: boolean) => void;
}

export function RecipeCard({ 
  recipe, 
  onDislike, 
  isFavorited = false, 
  isLiked = false,
  onFavoriteChange,
  onLikeChange 
}: RecipeCardProps) {
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFavorite = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to favorite recipes.",
      });
      return;
    }

    setIsTogglingFavorite(true);
    
    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipe.idMeal);

        if (error) throw error;
        
        onFavoriteChange?.(false);
        toast({
          title: "Removed from favorites",
          description: "Recipe removed from your favorites.",
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            recipe_id: recipe.idMeal,
            title: recipe.strMeal,
            thumbnail: recipe.strMealThumb,
          });

        if (error) throw error;
        
        onFavoriteChange?.(true);
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
        description: "Failed to update favorites. Please try again.",
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to like recipes.",
      });
      return;
    }

    setIsTogglingLike(true);
    
    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('recipe_ratings')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipe.idMeal);

        if (error) throw error;
        
        onLikeChange?.(false);
      } else {
        // Add like
        const { error } = await supabase
          .from('recipe_ratings')
          .upsert({
            user_id: user.id,
            recipe_id: recipe.idMeal,
            rating: 1,
          });

        if (error) throw error;
        
        onLikeChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update rating. Please try again.",
      });
    } finally {
      setIsTogglingLike(false);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to interact with recipes.",
      });
      return;
    }

    try {
      // Add dislike rating
      await supabase
        .from('recipe_ratings')
        .upsert({
          user_id: user.id,
          recipe_id: recipe.idMeal,
          rating: -1,
        });

      toast({
        title: "Recipe hidden",
        description: "We'll show you a different recipe next time.",
      });

      onDislike?.();
    } catch (error) {
      console.error('Error disliking recipe:', error);
    }
  };

  const handleViewRecipe = () => {
    navigate(`/recipe/${recipe.idMeal}`);
  };

  const isVegetarian = RecipeAPI.isVegetarian(recipe);

  return (
    <GlassCard variant="elevated" className="group overflow-hidden animate-scale-in rounded-[2rem]">
      <div className="relative overflow-hidden">
        <img
          src={recipe.strMealThumb}
          alt={recipe.strMeal}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 animate-fade-in">
          <Badge variant="secondary" className="bg-card/20 backdrop-blur-glass border-glass">
            {recipe.strCategory}
          </Badge>
          {isVegetarian && (
            <Badge className="bg-vegetarian/80 text-vegetarian-foreground backdrop-blur-glass animate-bounce-in">
              Vegetarian
            </Badge>
          )}
        </div>

        {/* Action buttons overlay */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-slide-up">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 hover:scale-110 transition-transform duration-200 "
            onClick={handleFavorite}
            disabled={isTogglingFavorite}
          >
            <Heart className={`h-4 w-4 transition-colors ${isFavorited ? 'fill-primary text-primary animate-bounce-in' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 hover:scale-110 transition-transform duration-200"
            onClick={handleLike}
            disabled={isTogglingLike}
          >
            <ThumbsUp className={`h-4 w-4 transition-colors ${isLiked ? 'fill-primary text-primary animate-bounce-in' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 hover:scale-110 hover:bg-destructive/20 hover:border-destructive hover:text-destructive transition-all duration-200"
            onClick={handleDislike}
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <GlassCardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {recipe.strMeal}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {recipe.strArea} Cuisine
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>30-45 min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>4 servings</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleViewRecipe}
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Recipe
        </Button>
        </GlassCardContent>
    </GlassCard>
  );
}