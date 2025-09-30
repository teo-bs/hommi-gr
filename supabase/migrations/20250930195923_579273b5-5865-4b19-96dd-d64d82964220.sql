-- Add bills_included to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS bills_included boolean DEFAULT false;

-- Add lister_type to profiles table
DO $$ BEGIN
  CREATE TYPE public.lister_type_enum AS ENUM ('individual', 'agency');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS lister_type public.lister_type_enum DEFAULT 'individual';

-- Drop old room_search_cache if exists
DROP MATERIALIZED VIEW IF EXISTS public.room_search_cache CASCADE;

-- Create enhanced room_search_cache with amenity arrays
CREATE MATERIALIZED VIEW public.room_search_cache AS
SELECT 
  r.id as room_id,
  r.slug,
  l.title,
  l.price_month,
  l.bills_included,
  l.city,
  l.neighborhood,
  l.availability_date,
  l.flatmates_count,
  l.couples_accepted,
  l.pets_allowed,
  l.smoking_allowed,
  l.lat,
  l.lng,
  l.min_stay_months,
  l.max_stay_months,
  r.room_type,
  COALESCE((l.photos->0->>'url'), '') as cover_photo_url,
  l.created_at,
  p.display_name as lister_name,
  p.lister_type,
  p.kyc_status as lister_verification,
  p.member_since as lister_member_since,
  l.search_tsv,
  ARRAY(
    SELECT a.key 
    FROM public.listing_amenities la 
    JOIN public.amenities a ON la.amenity_id = a.id 
    WHERE la.listing_id = l.id AND a.is_active = true
  ) as amenity_keys
FROM public.rooms r
JOIN public.listings l ON r.listing_id = l.id
JOIN public.profiles p ON l.owner_id = p.id
WHERE l.status = 'published';

-- Create indexes on the materialized view
CREATE INDEX room_search_cache_city_idx ON public.room_search_cache (city);
CREATE INDEX room_search_cache_price_idx ON public.room_search_cache (price_month);
CREATE INDEX room_search_cache_availability_idx ON public.room_search_cache (availability_date);
CREATE INDEX room_search_cache_location_idx ON public.room_search_cache (lat, lng);
CREATE INDEX room_search_cache_room_type_idx ON public.room_search_cache (room_type);
CREATE INDEX room_search_cache_lister_type_idx ON public.room_search_cache (lister_type);
CREATE INDEX room_search_cache_amenities_idx ON public.room_search_cache USING GIN (amenity_keys);
CREATE INDEX room_search_cache_search_tsv_idx ON public.room_search_cache USING GIN (search_tsv);

-- Grant permissions
GRANT SELECT ON public.room_search_cache TO authenticated, anon;