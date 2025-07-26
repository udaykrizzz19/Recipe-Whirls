-- Fix profiles table to use proper UUID type for id column
ALTER TABLE public.profiles 
ALTER COLUMN id TYPE UUID USING id::text::uuid;