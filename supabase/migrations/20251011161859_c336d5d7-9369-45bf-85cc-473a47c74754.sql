-- Update is_lister_with_published to check only published listings ownership
CREATE OR REPLACE FUNCTION public.is_lister_with_published(profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.listings l
    WHERE l.owner_id = profile_id
      AND l.status = 'published'::public.publish_status_enum
      AND l.deleted_at IS NULL
  );
$$;

-- Rename RLS policy for clarity
DROP POLICY IF EXISTS "Lister profiles for published listings are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles with published listings are viewable by everyone"
ON public.profiles FOR SELECT
TO public
USING (
  auth.uid() = user_id 
  OR is_lister_with_published(id)
);