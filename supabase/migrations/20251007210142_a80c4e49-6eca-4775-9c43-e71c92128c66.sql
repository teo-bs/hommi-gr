-- Enhance room_search_cache materialized view with additional filter columns
DROP MATERIALIZED VIEW IF EXISTS public.room_search_cache CASCADE;

CREATE MATERIALIZED VIEW public.room_search_cache AS
SELECT 
  r.id AS room_id,
  r.slug,
  l.id AS listing_id,
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
  l.formatted_address,
  l.published_at,
  l.created_at AS listing_created_at,
  
  -- Cover photo
  COALESCE(
    (SELECT lp.url FROM public.listing_photos lp 
     WHERE lp.listing_id = l.id AND lp.is_cover = true AND lp.deleted_at IS NULL 
     LIMIT 1),
    (SELECT lp.url FROM public.listing_photos lp 
     WHERE lp.listing_id = l.id AND lp.deleted_at IS NULL 
     ORDER BY lp.sort_order, lp.created_at 
     LIMIT 1)
  ) AS cover_photo_url,
  
  -- Lister data
  p.id AS lister_profile_id,
  p.lister_type,
  p.kyc_status,
  p.avatar_url AS lister_avatar_url,
  p.first_name AS lister_first_name,
  p.lister_score,
  p.verifications_json,
  p.profile_extras AS lister_profile_extras,
  l.audience_preferences,
  
  -- Amenity keys array
  COALESCE(
    ARRAY(
      SELECT a.key 
      FROM public.listing_amenities la
      JOIN public.amenities a ON a.id = la.amenity_id
      WHERE la.listing_id = l.id AND a.is_active
    ),
    ARRAY[]::text[]
  ) AS amenity_keys

FROM public.rooms r
JOIN public.listings l ON l.id = r.listing_id
JOIN public.profiles p ON p.id = l.owner_id
WHERE 
  l.status = 'published'::public.publish_status_enum
  AND l.deleted_at IS NULL
  AND r.deleted_at IS NULL;

-- Create unique index for CONCURRENTLY refresh
CREATE UNIQUE INDEX idx_room_search_cache_room_id ON public.room_search_cache(room_id);

-- Performance indexes
CREATE INDEX idx_room_search_cache_price ON public.room_search_cache(price_month);
CREATE INDEX idx_room_search_cache_city ON public.room_search_cache(city);
CREATE INDEX idx_room_search_cache_availability ON public.room_search_cache(availability_date);
CREATE INDEX idx_room_search_cache_published ON public.room_search_cache(published_at DESC NULLS LAST, listing_created_at DESC);
CREATE INDEX idx_room_search_cache_lister_type ON public.room_search_cache(lister_type);
CREATE INDEX idx_room_search_cache_location ON public.room_search_cache(lat, lng);
CREATE INDEX idx_room_search_cache_amenities ON public.room_search_cache USING GIN(amenity_keys);