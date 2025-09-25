-- Update profiles RLS policy to be more restrictive
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create more restrictive policies
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Authenticated users can view profiles of listers (for listings)
CREATE POLICY "Authenticated users can view lister profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  (role = 'lister'::user_role_enum OR id IN (
    SELECT owner_id FROM public.listings WHERE status = 'published'::publish_status_enum
  ))
);

-- Public users can view basic lister info for published listings only
CREATE POLICY "Public can view lister info for published listings" 
ON public.profiles 
FOR SELECT 
USING (
  id IN (
    SELECT owner_id FROM public.listings WHERE status = 'published'::publish_status_enum
  )
);