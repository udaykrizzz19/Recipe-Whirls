-- Enable RLS on existing tables if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Update profiles table to use UUID for user_id (fixing the current bigint issue)
ALTER TABLE public.profiles ALTER COLUMN id TYPE UUID USING id::text::uuid;

-- Update trigger function to handle new user creation with proper UUID
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$function$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add bio column to profiles table
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

-- Fix favorites table user_id to be NOT NULL
ALTER TABLE public.favorites ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.favorites ALTER COLUMN user_id SET DEFAULT NULL;
ALTER TABLE public.favorites ALTER COLUMN user_id DROP DEFAULT;

-- Fix likes table user_id to be NOT NULL  
ALTER TABLE public.likes ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.likes ALTER COLUMN user_id SET DEFAULT NULL;
ALTER TABLE public.likes ALTER COLUMN user_id DROP DEFAULT;

-- Fix search_history table user_id to be NOT NULL
ALTER TABLE public.search_history ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.search_history ALTER COLUMN user_id SET DEFAULT NULL;
ALTER TABLE public.search_history ALTER COLUMN user_id DROP DEFAULT;