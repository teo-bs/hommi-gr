-- Phase 1: Critical Database Integrity Fixes (drop and recreate function)

-- 1. Add unique constraint on rooms slug to prevent collisions
CREATE UNIQUE INDEX IF NOT EXISTS idx_rooms_slug_unique ON public.rooms (slug);

-- 2. Drop and recreate function to fix parameter naming
DROP FUNCTION IF EXISTS public.generate_greek_safe_slug(text, uuid);

CREATE OR REPLACE FUNCTION public.generate_greek_safe_slug(input_text text, p_listing_id uuid DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
  greek_map jsonb := '{
    "Α": "A", "α": "a", "Β": "B", "β": "b", "Γ": "G", "γ": "g",
    "Δ": "D", "δ": "d", "Ε": "E", "ε": "e", "Ζ": "Z", "ζ": "z",
    "Η": "H", "η": "h", "Θ": "Th", "θ": "th", "Ι": "I", "ι": "i",
    "Κ": "K", "κ": "k", "Λ": "L", "λ": "l", "Μ": "M", "μ": "m",
    "Ν": "N", "ν": "n", "Ξ": "X", "ξ": "x", "Ο": "O", "ο": "o",
    "Π": "P", "π": "p", "Ρ": "R", "ρ": "r", "Σ": "S", "σ": "s", "ς": "s",
    "Τ": "T", "τ": "t", "Υ": "Y", "υ": "y", "Φ": "F", "φ": "f",
    "Χ": "Ch", "χ": "ch", "Ψ": "Ps", "ψ": "ps", "Ω": "O", "ω": "o"
  }'::jsonb;
  char_key text;
  transliterated text;
BEGIN
  -- Start with input text
  transliterated := input_text;
  
  -- Apply Greek transliteration
  FOR char_key IN SELECT jsonb_object_keys(greek_map) LOOP
    transliterated := replace(transliterated, char_key, greek_map->>char_key);
  END LOOP;
  
  -- Generate base slug: lowercase, replace spaces/special chars with dashes
  base_slug := lower(trim(transliterated));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\-]', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Ensure minimum length
  IF length(base_slug) < 3 THEN
    base_slug := 'listing-' || substring(p_listing_id::text from 1 for 8);
  END IF;
  
  -- Check for uniqueness and add counter if needed
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.rooms r WHERE r.slug = final_slug AND (p_listing_id IS NULL OR r.listing_id != p_listing_id)) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- 3. Create trigger to prevent publishing without room and ensure slug safety
CREATE OR REPLACE FUNCTION public.ensure_listing_room_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  room_exists boolean;
  generated_slug text;
BEGIN
  -- Only check when transitioning to published status
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    
    -- Check if room already exists
    SELECT EXISTS (SELECT 1 FROM public.rooms WHERE listing_id = NEW.id) INTO room_exists;
    
    IF NOT room_exists THEN
      -- Generate safe slug
      generated_slug := public.generate_greek_safe_slug(NEW.title, NEW.id);
      
      -- Create room automatically
      INSERT INTO public.rooms (listing_id, slug, room_type, has_bed, room_size_m2)
      VALUES (
        NEW.id,
        generated_slug,
        CASE WHEN NEW.property_type = 'whole_property' THEN 'entire_place' ELSE 'private' END,
        true,
        NEW.room_size_m2
      );
      
      -- Log the automatic room creation
      RAISE NOTICE 'Auto-created room for listing % with slug %', NEW.id, generated_slug;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS ensure_room_on_publish ON public.listings;
CREATE TRIGGER ensure_room_on_publish
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_listing_room_integrity();

-- 4. Create function for atomic publishing with transaction safety
CREATE OR REPLACE FUNCTION public.publish_listing_atomic(
  p_listing_id uuid,
  p_room_slug text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  listing_record public.listings%ROWTYPE;
  room_record public.rooms%ROWTYPE;
  final_slug text;
  result jsonb := '{"success": false}'::jsonb;
BEGIN
  -- 1. Set intermediate status
  UPDATE public.listings 
  SET status = 'publishing'::publish_status_enum, updated_at = now()
  WHERE id = p_listing_id
  RETURNING * INTO listing_record;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Listing not found');
  END IF;
  
  -- 2. Generate or use provided slug
  IF p_room_slug IS NOT NULL THEN
    final_slug := p_room_slug;
  ELSE
    final_slug := public.generate_greek_safe_slug(listing_record.title, p_listing_id);
  END IF;
  
  -- 3. Upsert room record
  INSERT INTO public.rooms (listing_id, slug, room_type, has_bed, room_size_m2, is_interior)
  VALUES (
    p_listing_id,
    final_slug,
    CASE WHEN listing_record.property_type = 'whole_property' THEN 'entire_place' ELSE 'private' END,
    true,
    listing_record.room_size_m2,
    CASE WHEN listing_record.orientation = 'interior' THEN true ELSE false END
  )
  ON CONFLICT (listing_id) 
  DO UPDATE SET 
    slug = EXCLUDED.slug,
    room_type = EXCLUDED.room_type,
    room_size_m2 = EXCLUDED.room_size_m2,
    is_interior = EXCLUDED.is_interior,
    updated_at = now()
  RETURNING * INTO room_record;
  
  -- 4. Set final published status
  UPDATE public.listings 
  SET status = 'published'::publish_status_enum, updated_at = now()
  WHERE id = p_listing_id;
  
  -- 5. Build success response
  result := jsonb_build_object(
    'success', true,
    'listing_id', p_listing_id,
    'room_id', room_record.id,
    'slug', room_record.slug,
    'message', 'Listing published successfully'
  );
  
  -- 6. Notify cache refresh needed
  PERFORM pg_notify('search_cache_refresh', p_listing_id::text);
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  -- Rollback happens automatically
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM,
    'listing_id', p_listing_id
  );
END;
$$;

-- 5. Fix the immediate data issue - create missing room for "ΑΕΚΑΕΚΑΕΚΑΕΚΑΕΚ"
DO $$
DECLARE
  missing_listing_id uuid := '749a36f5-5f6f-4e0f-9e42-0e4dc80ea80e';
  safe_slug text;
BEGIN
  -- Check if room already exists
  IF NOT EXISTS (SELECT 1 FROM public.rooms WHERE listing_id = missing_listing_id) THEN
    -- Generate safe slug for Greek title
    safe_slug := public.generate_greek_safe_slug('ΑΕΚΑΕΚΑΕΚΑΕΚΑΕΚ', missing_listing_id);
    
    -- Create the missing room
    INSERT INTO public.rooms (listing_id, slug, room_type, has_bed, room_size_m2)
    SELECT 
      missing_listing_id,
      safe_slug,
      CASE WHEN l.property_type = 'whole_property' THEN 'entire_place' ELSE 'private' END,
      true,
      l.room_size_m2
    FROM public.listings l
    WHERE l.id = missing_listing_id;
    
    RAISE NOTICE 'Created missing room for listing % with slug %', missing_listing_id, safe_slug;
  END IF;
END $$;