-- Fix published_at in publish_listing_atomic function
CREATE OR REPLACE FUNCTION public.publish_listing_atomic(p_listing_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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

  -- Update listing to published and set published_at if not already set
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
$$;

-- Backfill published_at for existing published listings
UPDATE public.listings
SET published_at = COALESCE(published_at, created_at)
WHERE status = 'published' AND published_at IS NULL;

-- Create trigger function to refresh search cache on listing updates
CREATE OR REPLACE FUNCTION public.trigger_refresh_search_cache()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only refresh when status changes to published
  IF NEW.status = 'published'::publish_status_enum AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.room_search_cache;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on listings table
DROP TRIGGER IF EXISTS trg_listings_refresh_cache ON public.listings;
CREATE TRIGGER trg_listings_refresh_cache
  AFTER UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_refresh_search_cache();