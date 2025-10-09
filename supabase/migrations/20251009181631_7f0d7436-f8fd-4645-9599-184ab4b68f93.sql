-- Step 1: Recreate room_search_cache with proper photo fallback and formatted_address
DROP MATERIALIZED VIEW IF EXISTS public.room_search_cache CASCADE;

CREATE MATERIALIZED VIEW public.room_search_cache AS
SELECT
  r.id AS room_id,
  r.slug,
  l.id AS listing_id,
  l.title,
  l.city,
  l.neighborhood,
  l.price_month,
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
  p.kyc_status,
  p.lister_type,
  p.id AS lister_profile_id,
  p.avatar_url AS lister_avatar_url,
  p.first_name AS lister_first_name,
  p.lister_score,
  p.verifications_json,
  p.profile_extras AS lister_profile_extras,
  l.audience_preferences,
  l.published_at,
  l.created_at AS listing_created_at,
  COALESCE(
    (SELECT url FROM public.listing_photos WHERE listing_id = l.id AND is_cover = true AND deleted_at IS NULL ORDER BY sort_order, created_at LIMIT 1),
    (SELECT url FROM public.listing_photos WHERE listing_id = l.id AND deleted_at IS NULL ORDER BY sort_order, created_at LIMIT 1),
    (SELECT url FROM public.room_photos rp JOIN public.rooms rr ON rp.room_id = rr.id WHERE rr.listing_id = l.id AND rp.is_cover = true AND rp.deleted_at IS NULL ORDER BY rp.sort_order, rp.created_at LIMIT 1),
    (SELECT url FROM public.room_photos rp JOIN public.rooms rr ON rp.room_id = rr.id WHERE rr.listing_id = l.id AND rp.deleted_at IS NULL ORDER BY rp.sort_order, rp.created_at LIMIT 1)
  ) AS cover_photo_url,
  ARRAY(
    SELECT a.key
    FROM public.listing_amenities la
    JOIN public.amenities a ON la.amenity_id = a.id
    WHERE la.listing_id = l.id AND a.is_active
  ) AS amenity_keys
FROM public.rooms r
JOIN public.listings l ON r.listing_id = l.id
JOIN public.profiles p ON l.owner_id = p.id
WHERE l.status = 'published' AND l.deleted_at IS NULL AND r.deleted_at IS NULL;

-- Create indexes for performance
CREATE UNIQUE INDEX room_search_cache_room_id_idx ON public.room_search_cache(room_id);
CREATE INDEX room_search_cache_city_idx ON public.room_search_cache(city);
CREATE INDEX room_search_cache_price_idx ON public.room_search_cache(price_month);
CREATE INDEX room_search_cache_availability_idx ON public.room_search_cache(availability_date);
CREATE INDEX room_search_cache_location_idx ON public.room_search_cache(lat, lng);
CREATE INDEX room_search_cache_amenity_keys_idx ON public.room_search_cache USING GIN(amenity_keys);

-- Grant permissions
GRANT SELECT ON public.room_search_cache TO anon, authenticated;

-- Step 2: One-off backfill - seed listing_photos from room_photos for listings without any
INSERT INTO public.listing_photos (listing_id, url, alt_text, sort_order, is_cover, created_at)
SELECT 
  l.id, 
  rp.url, 
  rp.alt_text, 
  rp.sort_order, 
  rp.is_cover,
  rp.created_at
FROM public.rooms r
JOIN public.listings l ON l.id = r.listing_id
JOIN public.room_photos rp ON rp.room_id = r.id AND rp.deleted_at IS NULL
WHERE l.status = 'published'
  AND NOT EXISTS (SELECT 1 FROM public.listing_photos lp WHERE lp.listing_id = l.id)
ON CONFLICT DO NOTHING;

-- Step 3: Refresh the materialized view
REFRESH MATERIALIZED VIEW CONCURRENTLY public.room_search_cache;