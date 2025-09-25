-- Migration: Clean up profiles table and ensure consistency
-- The listers table has already been dropped and columns added, so just ensure data consistency

-- Step 1: Ensure all profiles have a valid role (no nulls)
UPDATE public.profiles 
SET role = 'tenant'::user_role_enum 
WHERE role IS NULL;

-- Step 2: Ensure role is NOT NULL to prevent future issues (may already be set)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'role' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;
  END IF;
END $$;

-- Step 3: Clean up potential duplicate role columns
-- Check if both 'role' and 'user_role' exist and consolidate
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_role'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    -- Update role column with user_role data if role is null/default
    UPDATE public.profiles 
    SET role = user_role 
    WHERE role = 'tenant'::user_role_enum AND user_role != 'tenant'::user_role_enum;
    
    -- Drop the redundant user_role column
    ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_role;
  END IF;
END $$;

-- Step 4: Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_profiles_lister_role 
ON public.profiles(role) 
WHERE role = 'lister'::user_role_enum;

CREATE INDEX IF NOT EXISTS idx_profiles_lister_score 
ON public.profiles(lister_score) 
WHERE role = 'lister'::user_role_enum;

-- Step 5: Verification - log current state
DO $$
DECLARE 
  total_profiles INTEGER;
  tenant_count INTEGER;
  lister_count INTEGER;
  null_roles INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_profiles FROM public.profiles;
  SELECT COUNT(*) INTO tenant_count FROM public.profiles WHERE role = 'tenant'::user_role_enum;
  SELECT COUNT(*) INTO lister_count FROM public.profiles WHERE role = 'lister'::user_role_enum;
  SELECT COUNT(*) INTO null_roles FROM public.profiles WHERE role IS NULL;
  
  RAISE NOTICE 'Migration completed: % total profiles (% tenants, % listers, % null roles)', 
    total_profiles, tenant_count, lister_count, null_roles;
END $$;