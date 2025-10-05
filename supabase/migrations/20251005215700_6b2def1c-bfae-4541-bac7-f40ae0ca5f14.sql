-- Backfill room_photos from listings.photos for published listings
INSERT INTO room_photos (room_id, url, sort_order, alt_text)
SELECT 
  r.id as room_id,
  photo_url,
  photo_index - 1 as sort_order,
  l.title as alt_text
FROM listings l
JOIN rooms r ON r.listing_id = l.id
CROSS JOIN LATERAL (
  SELECT 
    jsonb_array_elements_text(l.photos) as photo_url,
    ROW_NUMBER() OVER () as photo_index
) photos
WHERE l.status = 'published'
  AND l.photos IS NOT NULL
  AND jsonb_array_length(l.photos) > 0
  AND NOT EXISTS (
    SELECT 1 FROM room_photos rp 
    WHERE rp.room_id = r.id 
    AND rp.url = photo_url
  );

-- Refresh the search cache to update cover photos
SELECT refresh_room_search_cache();