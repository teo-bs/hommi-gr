-- Phase 1: Clean up base64 placeholder images from listing_photos
DELETE FROM public.listing_photos
WHERE url LIKE 'data:image/%';

-- Phase 2: Auto-refresh search cache on publish
-- Create trigger function to refresh materialized view when listing is published
CREATE OR REPLACE FUNCTION public.trigger_refresh_search_cache()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only refresh when status changes to 'published'
  IF NEW.status = 'published'::publish_status_enum 
     AND (OLD.status IS NULL OR OLD.status != 'published'::publish_status_enum) THEN
    -- Refresh the materialized view concurrently (non-blocking)
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.room_search_cache;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on listings table
CREATE TRIGGER refresh_cache_on_publish
AFTER UPDATE OF status ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.trigger_refresh_search_cache();