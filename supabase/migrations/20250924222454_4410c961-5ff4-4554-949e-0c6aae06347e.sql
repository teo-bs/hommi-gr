-- Update profile completion calculation to match new weights
CREATE OR REPLACE FUNCTION public.calculate_profile_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  completion_score integer := 0;
  total_fields integer := 100; -- Total weighted points
  interests_count integer := 0;
BEGIN
  -- Photo ≥1: 20 points
  IF NEW.avatar_url IS NOT NULL THEN completion_score := completion_score + 20; END IF;
  
  -- Basics (name + age/dob + country): 15 points
  IF NEW.display_name IS NOT NULL AND NEW.date_of_birth IS NOT NULL AND NEW.country IS NOT NULL THEN 
    completion_score := completion_score + 15; 
  END IF;
  
  -- Bio: 10 points
  IF NEW.about_me IS NOT NULL THEN completion_score := completion_score + 10; END IF;
  
  -- Languages: 10 points
  IF array_length(NEW.languages, 1) > 0 THEN completion_score := completion_score + 10; END IF;
  
  -- Profession/Study info: 5 points
  IF NEW.profession IS NOT NULL THEN completion_score := completion_score + 5; END IF;
  
  -- Interests/Lifestyle chips (≥3 total): 10 points
  -- Note: This will need to be implemented when we have lifestyle/interests fields
  -- For now, we'll skip this until those fields are added to the schema
  
  -- Who's moving: 5 points (role selection)
  IF NEW.role IS NOT NULL THEN completion_score := completion_score + 5; END IF;
  
  -- Email verified: 10 points
  IF EXISTS(SELECT 1 FROM public.verifications WHERE user_id = NEW.user_id AND kind = 'email' AND status = 'verified') THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Phone verified: 15 points
  IF EXISTS(SELECT 1 FROM public.verifications WHERE user_id = NEW.user_id AND kind = 'phone' AND status = 'verified') THEN
    completion_score := completion_score + 15;
  END IF;
  
  NEW.profile_completion_pct := completion_score;
  
  RETURN NEW;
END;
$function$;