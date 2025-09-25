-- Migration: Fix orphan lister data and consolidate into profiles
-- Step 1: Clean up orphan lister records that don't have matching profiles
DELETE FROM public.listers 
WHERE profile_id NOT IN (SELECT id FROM public.profiles);

-- Step 2: Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS lister_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lister_badges JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Step 3: Backfill lister data from listers table to profiles
UPDATE public.profiles 
SET 
  lister_score = l.score,
  lister_badges = l.badges,
  role = 'lister'::user_role_enum
FROM public.listers l 
WHERE profiles.id = l.profile_id;

-- Step 4: Ensure all profiles have a valid role (no nulls)
UPDATE public.profiles 
SET role = 'tenant'::user_role_enum 
WHERE role IS NULL;

-- Step 5: Make role NOT NULL to prevent future issues
ALTER TABLE public.profiles 
ALTER COLUMN role SET NOT NULL;

-- Step 6: Verify data consistency
DO $$
DECLARE 
  lister_count INTEGER;
  profile_lister_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO lister_count FROM public.listers;
  SELECT COUNT(*) INTO profile_lister_count FROM public.profiles WHERE role = 'lister'::user_role_enum;
  
  RAISE NOTICE 'Migration complete: % lister records consolidated into profiles, % total lister profiles', 
    lister_count, profile_lister_count;
END $$;

-- Step 7: Drop the listers table and its policies
DROP POLICY IF EXISTS "Listers are viewable by everyone" ON public.listers;
DROP POLICY IF EXISTS "Users can create their lister profile" ON public.listers;  
DROP POLICY IF EXISTS "Users can update their lister profile" ON public.listers;
DROP TABLE public.listers CASCADE;

-- Step 8: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_lister_role 
ON public.profiles(role) WHERE role = 'lister'::user_role_enum;

CREATE INDEX IF NOT EXISTS idx_profiles_lister_score 
ON public.profiles(lister_score) WHERE role = 'lister'::user_role_enum;

-- Step 9: Update profile completion function for new fields
CREATE OR REPLACE FUNCTION public.calculate_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  completion_score integer := 0;
BEGIN
  -- Photo: 20 points
  IF NEW.avatar_url IS NOT NULL THEN completion_score := completion_score + 20; END IF;
  
  -- Basics: 15 points
  IF NEW.display_name IS NOT NULL AND NEW.date_of_birth IS NOT NULL AND NEW.country IS NOT NULL THEN 
    completion_score := completion_score + 15; 
  END IF;
  
  -- Bio: 10 points
  IF NEW.about_me IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  
  -- Languages: 10 points
  IF array_length(NEW.languages, 1) > 0 THEN completion_score := completion_score + 10; END IF;
  
  -- Profession: 5 points
  IF NEW.profession IS NOT NULL THEN completion_score := completion_score + 5; END IF;
  
  -- Role: 5 points
  IF NEW.role IS NOT NULL THEN completion_score := completion_score + 5; END IF;
  
  -- Email verified: 10 points
  IF EXISTS(SELECT 1 FROM public.verifications WHERE user_id = NEW.user_id AND kind = 'email' AND status = 'verified') THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Phone verified: 15 points
  IF EXISTS(SELECT 1 FROM public.verifications WHERE user_id = NEW.user_id AND kind = 'phone' AND status = 'verified') THEN
    completion_score := completion_score + 15;
  END IF;
  
  -- Lister completion bonus: 10 points
  IF NEW.role = 'lister'::user_role_enum AND (NEW.lister_badges != '[]'::jsonb OR NEW.lister_score > 0) THEN
    completion_score := completion_score + 10;
  END IF;
  
  NEW.profile_completion_pct := completion_score;
  RETURN NEW;
END;
$function$;