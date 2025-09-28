-- Step 1: Update materialized view to handle both photo formats and fallback to listings.photos
DROP MATERIALIZED VIEW IF EXISTS room_search_cache;

CREATE MATERIALIZED VIEW room_search_cache AS
SELECT DISTINCT 
  r.id AS room_id,
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
  COALESCE(p.display_name,
    CASE
      WHEN ((p.first_name IS NOT NULL) AND (p.last_name IS NOT NULL)) THEN (((p.first_name || ' '::text) || "left"(p.last_name, 1)) || '.'::text)
      ELSE split_part(p.email, '@'::text, 1)
    END) AS lister_name,
  p.kyc_status AS lister_verification,
  p.member_since AS lister_member_since,
  -- Updated cover_photo_url logic to handle both formats
  COALESCE(
    -- First try to get from room_photos table
    (SELECT rp.url FROM room_photos rp WHERE rp.room_id = r.id ORDER BY rp.sort_order, rp.created_at LIMIT 1),
    -- Fallback to listings.photos for backward compatibility
    CASE 
      WHEN jsonb_typeof(l.photos->0) = 'object' THEN l.photos->0->>'url'
      WHEN jsonb_typeof(l.photos->0) = 'string' THEN l.photos->>0
      ELSE NULL
    END
  ) AS cover_photo_url,
  to_tsvector('english'::regconfig, ((((((COALESCE(l.title, ''::text) || ' '::text) || COALESCE(l.description, ''::text)) || ' '::text) || COALESCE(l.city, ''::text)) || ' '::text) || COALESCE(l.neighborhood, ''::text))) AS search_tsv
FROM ((rooms r
  JOIN listings l ON ((r.listing_id = l.id)))
  JOIN profiles p ON ((l.owner_id = p.id)))
WHERE (l.status = 'published'::publish_status_enum);

-- Recreate unique index
CREATE UNIQUE INDEX idx_room_search_cache_room_id ON room_search_cache(room_id);

-- Step 2: Backfill room_photos for published listings that have photos in listings.photos
INSERT INTO room_photos (room_id, url, sort_order, alt_text)
SELECT 
  r.id as room_id,
  -- Extract URL based on photo format
  CASE 
    WHEN jsonb_typeof(photo.value) = 'object' THEN photo.value->>'url'
    WHEN jsonb_typeof(photo.value) = 'string' THEN photo.value::text
    ELSE NULL
  END as url,
  (photo.ordinality - 1) as sort_order,
  'Listing photo' as alt_text
FROM listings l
JOIN rooms r ON l.id = r.listing_id
CROSS JOIN LATERAL jsonb_array_elements(l.photos) WITH ORDINALITY AS photo(value, ordinality)
WHERE l.status = 'published'::publish_status_enum
  AND l.photos IS NOT NULL 
  AND jsonb_array_length(l.photos) > 0
  -- Only insert if room doesn't already have photos
  AND NOT EXISTS (SELECT 1 FROM room_photos rp WHERE rp.room_id = r.id)
  -- Filter out base64 data URLs
  AND (
    (jsonb_typeof(photo.value) = 'object' AND photo.value->>'url' IS NOT NULL AND photo.value->>'url' NOT LIKE 'data:%')
    OR (jsonb_typeof(photo.value) = 'string' AND photo.value::text NOT LIKE 'data:%')
  )
ON CONFLICT DO NOTHING;

-- Step 3: Refresh the materialized view
REFRESH MATERIALIZED VIEW CONCURRENTLY room_search_cache;