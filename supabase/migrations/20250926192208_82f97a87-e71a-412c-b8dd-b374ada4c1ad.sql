-- Fix the calculate_profile_completion function to use 'profession' instead of non-existent 'what_you_do'
CREATE OR REPLACE FUNCTION public.calculate_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  completion_pct INTEGER := 0;
BEGIN
  -- Calculate completion percentage based on filled fields
  IF NEW.display_name IS NOT NULL AND NEW.display_name != '' THEN
    completion_pct := completion_pct + 20;
  END IF;
  
  IF NEW.date_of_birth IS NOT NULL THEN
    completion_pct := completion_pct + 20;
  END IF;
  
  -- Fixed: Use 'profession' instead of non-existent 'what_you_do'
  IF NEW.profession IS NOT NULL AND NEW.profession != '' THEN
    completion_pct := completion_pct + 20;
  END IF;
  
  IF NEW.country IS NOT NULL AND NEW.country != '' THEN
    completion_pct := completion_pct + 20;
  END IF;
  
  IF NEW.languages IS NOT NULL AND array_length(NEW.languages, 1) > 0 THEN
    completion_pct := completion_pct + 20;
  END IF;

  NEW.profile_completion_pct := completion_pct;
  
  RETURN NEW;
END;
$function$;