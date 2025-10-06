-- Migration: Transfer photos from listings.photos (JSONB) to room_photos for published listings
-- This fixes the photo inconsistency issue

INSERT INTO public.room_photos (room_id, url, sort_order, alt_text)
SELECT 
  r.id as room_id,
  photo_url.value::text as url,
  (row_number() OVER (PARTITION BY r.id ORDER BY photo_url.ordinality)) - 1 as sort_order,
  'Room photo ' || (row_number() OVER (PARTITION BY r.id ORDER BY photo_url.ordinality)) as alt_text
FROM public.listings l
JOIN public.rooms r ON r.listing_id = l.id
CROSS JOIN LATERAL jsonb_array_elements_text(l.photos) WITH ORDINALITY AS photo_url(value, ordinality)
WHERE l.status = 'published'
  AND l.photos IS NOT NULL 
  AND jsonb_array_length(l.photos) > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.room_photos rp 
    WHERE rp.room_id = r.id
  )
ON CONFLICT DO NOTHING;