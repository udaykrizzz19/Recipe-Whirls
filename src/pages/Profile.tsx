import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, Trash2, Eye, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserRecipe {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  cuisine_type: string | null;
  difficulty: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  dietary_tags: string[] | null;
  created_at: string;
}

interface ProfileData {
  name: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userRecipes, setUserRecipes] = useState<UserRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadProfile();
      loadUserRecipes();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRecipes = async () => {
    if (!user) return;

    setIsLoadingRecipes(true);
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserRecipes(data || []);
    } catch (error) {
      console.error('Error loading user recipes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your recipes.",
      });
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  const deleteRecipe = async (recipeId: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setUserRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
      toast({
        title: "Recipe deleted",
        description: "Your recipe has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete recipe.",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-muted-foreground mb-4">You need to be signed in to view your profile.</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto max-w-6xl p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="gap-2"
          >
            Sign Out
          </Button>
        </div>

        {/* Profile Section */}
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="animate-pulse flex items-center space-x-4">
                <div className="w-20 h-20 bg-muted rounded-full" />
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-muted rounded" />
                  <div className="h-4 w-48 bg-muted rounded" />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">
                    {profile?.name || user.email?.split('@')[0]}
                  </h1>
                  <p className="text-muted-foreground">{user.email}</p>
                  {profile?.bio && (
                    <p className="mt-2 text-sm">{profile.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <span>{userRecipes.length} recipe{userRecipes.length !== 1 ? 's' : ''}</span>
                    <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Recipes */}
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Recipes</CardTitle>
            <Button
              onClick={() => navigate('/create-recipe')}
              className="gap-2 bg-gradient-primary hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create Recipe
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingRecipes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg h-48 mb-4" />
                    <div className="space-y-2">
                      <div className="bg-muted rounded h-4 w-3/4" />
                      <div className="bg-muted rounded h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : userRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userRecipes.map((recipe) => (
                  <Card 
                    key={recipe.id} 
                    className="group overflow-hidden bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] border-border/20"
                  >
                    <div className="relative overflow-hidden">
                      {recipe.image_url ? (
                        <img
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-subtle flex items-center justify-center">
                          <span className="text-4xl opacity-50">🍽️</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {recipe.difficulty && (
                          <Badge variant="secondary" className="bg-card/80 backdrop-blur-sm">
                            {recipe.difficulty}
                          </Badge>
                        )}
                        {recipe.cuisine_type && (
                          <Badge variant="secondary" className="bg-card/80 backdrop-blur-sm">
                            {recipe.cuisine_type}
                          </Badge>
                        )}
                      </div>

                      {/* Action buttons overlay */}
                      <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 bg-card/80 backdrop-blur-sm hover:bg-card"
                          onClick={() => navigate(`/recipe/${recipe.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 bg-card/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => deleteRecipe(recipe.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                          {recipe.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {recipe.description}
                        </p>
                      </div>

                      {/* Recipe Info */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          {(recipe.prep_time || recipe.cook_time) && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {recipe.prep_time && recipe.cook_time 
                                  ? `${recipe.prep_time + recipe.cook_time} min`
                                  : `${recipe.prep_time || recipe.cook_time} min`
                                }
                              </span>
                            </div>
                          )}
                          {recipe.servings && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{recipe.servings}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dietary Tags */}
                      {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {recipe.dietary_tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {recipe.dietary_tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{recipe.dietary_tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Created {new Date(recipe.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Plus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No recipes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first recipe to get started
                </p>
                <Button 
                  onClick={() => navigate('/create-recipe')}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  Create Your First Recipe
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}