-- Fix security warnings - Set search_path for functions

-- Fix Function 1: update_price_per_m2
CREATE OR REPLACE FUNCTION public.update_price_per_m2()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.property_size_m2 IS NOT NULL AND NEW.property_size_m2 > 0 THEN
    NEW.price_per_m2 = NEW.price_month::decimal / NEW.property_size_m2;
  ELSE
    NEW.price_per_m2 = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Fix Function 2: calculate_profile_completion
CREATE OR REPLACE FUNCTION public.calculate_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
  completion_score integer := 0;
  total_fields integer := 15; -- Total weighted fields
BEGIN
  -- Basic fields (required)
  IF NEW.display_name IS NOT NULL THEN completion_score := completion_score + 2; END IF;
  IF NEW.avatar_url IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.profession IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.about_me IS NOT NULL THEN completion_score := completion_score + 2; END IF;
  
  -- Demographics
  IF NEW.gender IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.date_of_birth IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.country IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  
  -- Social media (any one counts)
  IF NEW.social_instagram IS NOT NULL OR 
     NEW.social_tiktok IS NOT NULL OR 
     NEW.social_twitter_x IS NOT NULL OR 
     NEW.social_linkedin IS NOT NULL THEN 
    completion_score := completion_score + 1; 
  END IF;
  
  -- Languages (default is provided)
  IF array_length(NEW.languages, 1) > 0 THEN completion_score := completion_score + 1; END IF;
  
  -- Verification status (check if any verifications exist)
  IF EXISTS(SELECT 1 FROM public.verifications WHERE user_id = NEW.user_id AND status = 'verified') THEN
    completion_score := completion_score + 3;
  END IF;
  
  -- Terms acceptance
  IF NEW.terms_accepted_at IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  
  NEW.profile_completion_pct := ROUND((completion_score::decimal / total_fields) * 100);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;