-- Add profile_extras JSONB field to store completion modal data
ALTER TABLE public.profiles 
ADD COLUMN profile_extras JSONB NOT NULL DEFAULT '{}';

-- Create trigger to automatically recalculate profile completion
CREATE OR REPLACE FUNCTION public.calculate_profile_completion()
RETURNS TRIGGER AS $$
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
  
  IF NEW.what_you_do IS NOT NULL THEN
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
$$ LANGUAGE plpgsql;

-- Attach trigger to profiles table
CREATE TRIGGER profiles_calc_completion
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_profile_completion();

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 52428800, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

-- Create RLS policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);