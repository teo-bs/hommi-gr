-- Add trigger to refresh search cache when listings are deleted
CREATE OR REPLACE FUNCTION public.trigger_refresh_on_listing_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only refresh if this is a new soft delete (deleted_at was NULL, now it's set)
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.room_search_cache;
    RAISE NOTICE 'Search cache refreshed due to listing deletion: %', NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on listings table
CREATE TRIGGER trg_refresh_cache_on_delete
  AFTER UPDATE OF deleted_at ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_refresh_on_listing_delete();

-- Schedule hourly automatic refresh as safety net
SELECT cron.schedule(
  'refresh-search-cache-hourly',
  '0 * * * *',
  $$ REFRESH MATERIALIZED VIEW CONCURRENTLY public.room_search_cache; $$
);