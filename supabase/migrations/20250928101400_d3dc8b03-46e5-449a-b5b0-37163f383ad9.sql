-- Update the materialized view to include cover photos
DROP MATERIALIZED VIEW IF EXISTS room_search_cache;

CREATE MATERIALIZED VIEW room_search_cache AS
SELECT DISTINCT
  r.id as room_id,
  r.slug,
  l.title,
  l.price_month,
  l.city,
  l.neighborhood,
  l.lat,
  l.lng,
  l.availability_date,
  l.flatmates_count,
  l.couples_accepted,
  l.pets_allowed,
  l.smoking_allowed,
  l.created_at,
  -- Get lister name with proper fallback
  COALESCE(
    p.display_name,
    CASE 
      WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL 
      THEN p.first_name || ' ' || LEFT(p.last_name, 1) || '.'
      ELSE SPLIT_PART(p.email, '@', 1)
    END
  ) as lister_name,
  p.kyc_status as lister_verification,
  p.member_since as lister_member_since,
  -- Get the first photo as cover photo
  (
    SELECT rp.url 
    FROM room_photos rp 
    WHERE rp.room_id = r.id 
    ORDER BY rp.sort_order ASC, rp.created_at ASC 
    LIMIT 1
  ) as cover_photo_url,
  -- Create a searchable text column
  to_tsvector('english', 
    COALESCE(l.title, '') || ' ' || 
    COALESCE(l.description, '') || ' ' || 
    COALESCE(l.city, '') || ' ' || 
    COALESCE(l.neighborhood, '')
  ) as search_tsv
FROM rooms r
JOIN listings l ON r.listing_id = l.id
JOIN profiles p ON l.owner_id = p.id
WHERE l.status = 'published';

-- Create indexes for better performance
CREATE UNIQUE INDEX idx_room_search_cache_room_id ON room_search_cache(room_id);
CREATE INDEX idx_room_search_cache_slug ON room_search_cache(slug);
CREATE INDEX idx_room_search_cache_city ON room_search_cache(city);
CREATE INDEX idx_room_search_cache_search_tsv ON room_search_cache USING GIN(search_tsv);
CREATE INDEX idx_room_search_cache_location ON room_search_cache(lat, lng);
CREATE INDEX idx_room_search_cache_price ON room_search_cache(price_month);

-- Refresh the view
REFRESH MATERIALIZED VIEW room_search_cache;