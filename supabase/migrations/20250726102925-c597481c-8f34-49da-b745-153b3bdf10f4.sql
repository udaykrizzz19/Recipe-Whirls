-- Add bio and avatar_url columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create recipe_ratings table for likes/dislikes
CREATE TABLE IF NOT EXISTS public.recipe_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_id VARCHAR NOT NULL,
  rating INTEGER CHECK (rating IN (-1, 1)), -- -1 for dislike, 1 for like
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS for recipe_ratings
ALTER TABLE public.recipe_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for recipe_ratings
CREATE POLICY "Users can manage their own ratings" 
ON public.recipe_ratings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update updated_at trigger for recipe_ratings
CREATE TRIGGER update_recipe_ratings_updated_at
BEFORE UPDATE ON public.recipe_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();