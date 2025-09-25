-- Create materialized view for optimized room search
CREATE MATERIALIZED VIEW public.room_search_cache AS
SELECT 
  r.id as room_id,
  r.slug,
  l.id as listing_id,
  l.title,
  l.price_month,
  l.city,
  l.neighborhood,
  l.availability_date,
  l.min_stay_months,
  l.max_stay_months,
  l.flatmates_count,
  l.couples_accepted,
  l.pets_allowed,
  l.property_type,
  l.listed_space,
  l.lat,
  l.lng,
  l.photos->0->>'url' as cover_photo_url,
  l.created_at,
  l.updated_at,
  -- Profile data for lister
  p.display_name as lister_name,
  p.avatar_url as lister_avatar,
  p.member_since,
  p.last_active,
  p.verifications_json,
  -- Room stats
  COALESCE(rs.view_count, 0) as view_count,
  COALESCE(rs.request_count, 0) as request_count,
  rs.last_viewed_at,
  -- Computed fields for search
  CASE 
    WHEN l.availability_date <= CURRENT_DATE THEN 'available_now'
    WHEN l.availability_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'available_soon'
    ELSE 'available_later'
  END as availability_status,
  -- Search vector for full text search
  to_tsvector('english', 
    COALESCE(l.title, '') || ' ' || 
    COALESCE(l.city, '') || ' ' || 
    COALESCE(l.neighborhood, '') || ' ' ||
    COALESCE(l.description, '')
  ) as search_vector
FROM rooms r
JOIN listings l ON r.listing_id = l.id
JOIN profiles p ON l.owner_id = p.id
LEFT JOIN room_stats rs ON r.id = rs.room_id
WHERE l.status = 'published'::publish_status_enum;

-- Create indexes for fast filtering and searching
CREATE INDEX idx_room_search_cache_price ON public.room_search_cache(price_month);
CREATE INDEX idx_room_search_cache_location ON public.room_search_cache(lat, lng);
CREATE INDEX idx_room_search_cache_availability ON public.room_search_cache(availability_date);
CREATE INDEX idx_room_search_cache_city ON public.room_search_cache(city);
CREATE INDEX idx_room_search_cache_filters ON public.room_search_cache(couples_accepted, pets_allowed, flatmates_count);
CREATE INDEX idx_room_search_cache_created ON public.room_search_cache(created_at DESC);
CREATE INDEX idx_room_search_cache_search_vector ON public.room_search_cache USING GIN(search_vector);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION public.refresh_room_search_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.room_search_cache;
END;
$$;

-- Grant permissions
GRANT SELECT ON public.room_search_cache TO authenticated;
GRANT SELECT ON public.room_search_cache TO anon;