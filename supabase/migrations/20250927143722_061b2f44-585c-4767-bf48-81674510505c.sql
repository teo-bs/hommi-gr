-- Add trigger for profile completion calculation
CREATE OR REPLACE FUNCTION public.calculate_profile_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  completion_pct INTEGER := 0;
BEGIN
  -- Calculate completion percentage based on filled fields
  -- First name (20%)
  IF NEW.first_name IS NOT NULL AND NEW.first_name != '' THEN
    completion_pct := completion_pct + 20;
  END IF;
  
  -- Last name (20%)  
  IF NEW.last_name IS NOT NULL AND NEW.last_name != '' THEN
    completion_pct := completion_pct + 20;
  END IF;
  
  -- Date of birth (20%)
  IF NEW.date_of_birth IS NOT NULL THEN
    completion_pct := completion_pct + 20;
  END IF;
  
  -- Profession (20%)
  IF NEW.profession IS NOT NULL AND NEW.profession != '' THEN
    completion_pct := completion_pct + 20;
  END IF;
  
  -- Country (20%)
  IF NEW.country IS NOT NULL AND NEW.country != '' THEN
    completion_pct := completion_pct + 20;
  END IF;

  NEW.profile_completion_pct := completion_pct;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS profiles_profile_completion_trigger ON public.profiles;
CREATE TRIGGER profiles_profile_completion_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_profile_completion();

-- Ensure display name trigger exists
CREATE OR REPLACE FUNCTION public.update_display_name()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update display_name if we have both first_name and last_name
  IF NEW.first_name IS NOT NULL AND NEW.first_name != '' AND 
     NEW.last_name IS NOT NULL AND NEW.last_name != '' THEN
    NEW.display_name := NEW.first_name || ' ' || SUBSTRING(NEW.last_name FROM 1 FOR 1) || '.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the display name trigger
DROP TRIGGER IF EXISTS profiles_display_name_trigger ON public.profiles;
CREATE TRIGGER profiles_display_name_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_display_name();