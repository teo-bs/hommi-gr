-- Fix duplicate sort_order values in room_photos
WITH ranked_photos AS (
  SELECT 
    id,
    room_id,
    ROW_NUMBER() OVER (PARTITION BY room_id ORDER BY sort_order, created_at, id) - 1 AS new_sort_order
  FROM room_photos
)
UPDATE room_photos rp
SET sort_order = ranked_photos.new_sort_order
FROM ranked_photos
WHERE rp.id = ranked_photos.id
  AND rp.sort_order != ranked_photos.new_sort_order;