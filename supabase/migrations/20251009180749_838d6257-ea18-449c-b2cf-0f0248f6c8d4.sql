-- Phase 1: Mark first photo of each room as cover
WITH first_photos AS (
  SELECT DISTINCT ON (room_id) id, room_id
  FROM public.room_photos
  WHERE deleted_at IS NULL
  ORDER BY room_id, sort_order ASC, created_at ASC
)
UPDATE public.room_photos rp
SET is_cover = true
FROM first_photos fp
WHERE rp.id = fp.id;

-- Phase 2: Refresh materialized view to pick up cover photos
REFRESH MATERIALIZED VIEW CONCURRENTLY public.room_search_cache;

-- Phase 3: Backfill formatted_address for listings without it
UPDATE public.listings
SET formatted_address = CONCAT(
  COALESCE(street_address || ', ', ''),
  COALESCE(neighborhood || ', ', ''),
  city,
  COALESCE(', ' || postcode, '')
)
WHERE formatted_address IS NULL 
  AND deleted_at IS NULL
  AND city IS NOT NULL;