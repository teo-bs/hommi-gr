-- Create materialized view for optimized search
CREATE MATERIALIZED VIEW IF NOT EXISTS public.room_search_cache AS
SELECT 
  r.id as room_id,
  r.slug,
  l.id as listing_id,
  l.title,
  l.price_month,
  l.city,
  l.neighborhood,
  l.availability_date,
  l.availability_to,
  l.min_stay_months,
  l.max_stay_months,
  l.flatmates_count,
  l.couples_accepted,
  l.pets_allowed,
  l.smoking_allowed,
  l.bills_included,
  r.room_type,
  l.lat,
  l.lng,
  (SELECT rp.url 
   FROM public.room_photos rp 
   WHERE rp.room_id = r.id 
     AND rp.is_cover = true 
     AND rp.deleted_at IS NULL 
   LIMIT 1) as cover_photo_url,
  p.kyc_status,
  p.lister_type,
  p.id as lister_profile_id,
  p.avatar_url as lister_avatar_url,
  p.first_name as lister_first_name,
  p.lister_score,
  p.verifications_json,
  p.profile_extras as lister_profile_extras,
  l.audience_preferences,
  l.formatted_address,
  l.published_at,
  l.created_at as listing_created_at,
  ARRAY(
    SELECT a.key 
    FROM public.listing_amenities la 
    JOIN public.amenities a ON la.amenity_id = a.id 
    WHERE la.listing_id = l.id
  ) as amenity_keys
FROM public.rooms r
JOIN public.listings l ON r.listing_id = l.id
JOIN public.profiles p ON l.owner_id = p.id
WHERE r.deleted_at IS NULL 
  AND l.deleted_at IS NULL 
  AND l.status = 'published';

-- Create unique index on room_id for concurrent refresh
CREATE UNIQUE INDEX IF NOT EXISTS room_search_cache_room_id_idx ON public.room_search_cache (room_id);

-- Create indexes for common search filters
CREATE INDEX IF NOT EXISTS room_search_cache_city_price_idx ON public.room_search_cache (city, price_month);
CREATE INDEX IF NOT EXISTS room_search_cache_location_idx ON public.room_search_cache (lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS room_search_cache_availability_idx ON public.room_search_cache (availability_date);
CREATE INDEX IF NOT EXISTS room_search_cache_published_idx ON public.room_search_cache (published_at DESC NULLS LAST);

-- Grant select permissions
GRANT SELECT ON public.room_search_cache TO anon, authenticated;

-- Initial refresh
REFRESH MATERIALIZED VIEW CONCURRENTLY public.room_search_cache;