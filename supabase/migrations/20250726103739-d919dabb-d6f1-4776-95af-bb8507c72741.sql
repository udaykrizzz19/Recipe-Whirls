-- Fix the profiles table to use UUID for id instead of bigint
-- First, check if there are any existing profiles
DO $$
DECLARE
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  
  IF profile_count = 0 THEN
    -- No existing data, safe to change the column type
    ALTER TABLE public.profiles ALTER COLUMN id TYPE UUID USING id::text::uuid;
  ELSE
    -- There's existing data, need to handle it carefully
    -- Drop and recreate the table with correct types
    DROP TABLE IF EXISTS public.profiles_backup;
    CREATE TABLE public.profiles_backup AS SELECT * FROM public.profiles;
    
    DROP TABLE public.profiles CASCADE;
    
    CREATE TABLE public.profiles (
      id UUID NOT NULL PRIMARY KEY,
      email VARCHAR NOT NULL,
      name VARCHAR NOT NULL,
      bio TEXT,
      avatar_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Enable RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    
    -- Recreate RLS policies
    CREATE POLICY "Users can view all profiles" 
    ON public.profiles
    FOR SELECT 
    USING (true);

    CREATE POLICY "Users can insert their own profile" 
    ON public.profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

    CREATE POLICY "Users can update their own profile" 
    ON public.profiles
    FOR UPDATE 
    USING (auth.uid() = id);
  END IF;
END $$;