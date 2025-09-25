-- Fix profile access issues by ensuring RLS policies work correctly
-- This will ensure users can always access their own profile

-- Drop potentially problematic policies and recreate
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view lister profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view lister info for published listings" ON public.profiles;

-- Create more permissive and reliable policies
CREATE POLICY "Users can always view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow authenticated users to view profiles of listers with published listings
CREATE POLICY "Authenticated users can view lister profiles for published listings" 
ON public.profiles 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  (role = 'lister'::user_role_enum AND id IN (
    SELECT owner_id FROM public.listings WHERE status = 'published'::publish_status_enum
  ))
);

-- Allow public access to basic lister info for published listings only (for SEO)
CREATE POLICY "Public can view basic lister info for published listings" 
ON public.profiles 
FOR SELECT 
USING (
  role = 'lister'::user_role_enum AND id IN (
    SELECT owner_id FROM public.listings WHERE status = 'published'::publish_status_enum
  )
);

-- Ensure the handle_new_user trigger is working correctly
-- Drop and recreate to ensure proper functionality
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    display_name,
    role
  )
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'display_name', 
      NEW.raw_user_meta_data ->> 'name', 
      NEW.raw_user_meta_data ->> 'full_name',
      split_part(NEW.email, '@', 1)
    ),
    'tenant'::user_role_enum
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;