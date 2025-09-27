-- Add first_name and last_name columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Create function to automatically update display_name from first_name and last_name
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

-- Create trigger to automatically update display_name when first_name or last_name changes
CREATE TRIGGER update_display_name_trigger
BEFORE INSERT OR UPDATE OF first_name, last_name ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_display_name();