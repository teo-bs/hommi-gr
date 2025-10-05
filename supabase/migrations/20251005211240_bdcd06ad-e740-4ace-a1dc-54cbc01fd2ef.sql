-- Drop and recreate materialized view with lister and room data
DROP MATERIALIZED VIEW IF EXISTS public.room_search_cache CASCADE;

CREATE MATERIALIZED VIEW public.room_search_cache AS
SELECT
  r.id AS room_id,
  r.slug,
  r.room_type,
  l.id AS listing_id,
  l.title,
  l.city,
  l.neighborhood,
  l.price_month,
  l.availability_date,
  l.lat,
  l.lng,
  l.flatmates_count,
  l.couples_accepted,
  l.pets_allowed,
  l.smoking_allowed,
  l.bills_included,
  -- Lister data
  p.id AS lister_profile_id,
  p.avatar_url AS lister_avatar_url,
  p.first_name AS lister_first_name,
  p.lister_score,
  p.kyc_status,
  p.lister_type,
  p.verifications_json,
  p.profile_extras AS lister_profile_extras,
  -- Cover photo
  COALESCE(
    (SELECT url FROM public.listing_photos 
     WHERE listing_id = l.id AND is_cover = true 
     ORDER BY sort_order LIMIT 1),
    (SELECT url FROM public.listing_photos 
     WHERE listing_id = l.id 
     ORDER BY sort_order LIMIT 1)
  ) AS cover_photo_url,
  -- Amenity keys
  ARRAY(
    SELECT a.key 
    FROM public.listing_amenities la
    JOIN public.amenities a ON la.amenity_id = a.id
    WHERE la.listing_id = l.id AND a.is_active
  ) AS amenity_keys,
  l.audience_preferences
FROM public.rooms r
JOIN public.listings l ON r.listing_id = l.id
JOIN public.profiles p ON l.owner_id = p.id
WHERE l.status = 'published';

-- Indexes
CREATE UNIQUE INDEX idx_room_search_cache_room_id ON public.room_search_cache(room_id);
CREATE INDEX idx_room_search_cache_city ON public.room_search_cache(city);
CREATE INDEX idx_room_search_cache_price ON public.room_search_cache(price_month);
CREATE INDEX idx_room_search_cache_lister ON public.room_search_cache(lister_profile_id);

-- Refresh
REFRESH MATERIALIZED VIEW public.room_search_cache;