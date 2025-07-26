import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Favorite {
  id: number;
  recipe_id: string;
  title: string;
  thumbnail: string;
  created_at: string;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your favorites.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: number, recipeId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      toast({
        title: "Removed from favorites",
        description: "Recipe has been removed from your favorites.",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove from favorites.",
      });
    }
  };

  const viewRecipe = (recipeId: string) => {
    navigate(`/recipe/${recipeId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-muted-foreground mb-4">You need to be signed in to view your favorites.</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto max-w-6xl p-4 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Heart className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              My Favorites
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {favorites.length} saved recipe{favorites.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Content */}
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
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {favorites.map((favorite) => (
              <Card 
                key={favorite.id} 
                className="group overflow-hidden bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] border-border/20"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={favorite.thumbnail}
                    alt={favorite.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Action buttons overlay */}
                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-card/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeFavorite(favorite.id, favorite.recipe_id)}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                      {favorite.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Added {new Date(favorite.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <Button 
                    onClick={() => viewRecipe(favorite.recipe_id)}
                    className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    View Recipe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-4">
              Start exploring recipes and save your favorites here
            </p>
            <Button onClick={() => navigate('/')} className="bg-gradient-primary hover:opacity-90">
              Discover Recipes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}