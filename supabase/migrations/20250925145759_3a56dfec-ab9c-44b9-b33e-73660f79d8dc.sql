-- Helper function to avoid recursive RLS checks when viewing lister profiles for published listings
CREATE OR REPLACE FUNCTION public.is_lister_with_published(profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = profile_id
      AND p.role = 'lister'::public.user_role_enum
      AND EXISTS (
        SELECT 1
        FROM public.listings l
        WHERE l.owner_id = profile_id
          AND l.status = 'published'::public.publish_status_enum
      )
  );
$$;

-- Ensure RLS is enabled (no-op if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Replace existing published-lister viewing policies with a single function-based one
DROP POLICY IF EXISTS "Authenticated users can view lister profiles for published list" ON public.profiles;
DROP POLICY IF EXISTS "Public can view basic lister info for published listings" ON public.profiles;

-- Allow anyone to view profiles that belong to listers who have at least one published listing
-- Note: Users can always view their own profile via existing policy; we include it here too for safety
CREATE POLICY "Lister profiles for published listings are viewable by everyone"
ON public.profiles
FOR SELECT
USING (
  public.is_lister_with_published(id) OR auth.uid() = user_id
);
