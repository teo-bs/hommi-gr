-- Step 1: Deduplicate rooms table (keep earliest per listing)
WITH duplicates AS (
  SELECT listing_id, id,
         ROW_NUMBER() OVER (PARTITION BY listing_id ORDER BY created_at ASC, id ASC) AS rn
  FROM public.rooms
  WHERE deleted_at IS NULL
)
DELETE FROM public.rooms r
USING duplicates d
WHERE r.id = d.id AND d.rn > 1;

-- Step 2: Add unique constraint on listing_id (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'rooms_listing_id_unique'
  ) THEN
    ALTER TABLE public.rooms 
    ADD CONSTRAINT rooms_listing_id_unique UNIQUE (listing_id);
  END IF;
END $$;

-- Step 3: Update the atomic publish function to use the named constraint
CREATE OR REPLACE FUNCTION public.publish_listing_atomic(p_listing_id uuid, p_room_slug text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- 3. Upsert room record using the named constraint
  INSERT INTO public.rooms (listing_id, slug, room_type, has_bed, room_size_m2, is_interior)
  VALUES (
    p_listing_id,
    final_slug,
    CASE WHEN listing_record.property_type = 'whole_property' THEN 'entire_place' ELSE 'private' END,
    true,
    listing_record.room_size_m2,
    CASE WHEN listing_record.orientation = 'interior' THEN true ELSE false END
  )
  ON CONFLICT ON CONSTRAINT rooms_listing_id_unique
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
$function$;