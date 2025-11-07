-- Fix all published listings missing published_at timestamp
UPDATE listings 
SET published_at = COALESCE(published_at, updated_at, created_at, NOW())
WHERE status = 'published' 
  AND published_at IS NULL;

-- Update publish_listing_atomic function to always set published_at
CREATE OR REPLACE FUNCTION public.publish_listing_atomic(p_listing_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_result jsonb;
  v_owner_id uuid;
  v_current_status publish_status_enum;
BEGIN
  -- Get listing info
  SELECT owner_id, status INTO v_owner_id, v_current_status
  FROM public.listings
  WHERE id = p_listing_id AND deleted_at IS NULL;

  -- Check ownership
  IF v_owner_id != current_profile_id() THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  -- Update listing to published and ALWAYS set published_at
  UPDATE public.listings
  SET 
    status = 'published'::publish_status_enum,
    published_at = COALESCE(published_at, now()),
    updated_at = now()
  WHERE id = p_listing_id;

  -- Notify for search cache refresh
  PERFORM pg_notify('search_cache_refresh', json_build_object('listing_id', p_listing_id)::text);

  RETURN jsonb_build_object('success', true, 'listing_id', p_listing_id);
END;
$function$;

-- Add constraint to ensure published_at is set when status is published
ALTER TABLE listings DROP CONSTRAINT IF EXISTS check_published_at;

ALTER TABLE listings 
ADD CONSTRAINT check_published_at 
CHECK (
  status != 'published'::publish_status_enum OR published_at IS NOT NULL
);