-- Update existing listings to use auto-generated title format
-- Only update listings where room_size_m2 is not null and property_type is 'room'

UPDATE listings
SET title = CONCAT('Room, ', room_size_m2, ' m²')
WHERE room_size_m2 IS NOT NULL 
  AND property_type = 'room'
  AND (title IS NULL OR title != CONCAT('Room, ', room_size_m2, ' m²'));

-- For listings where room_size_m2 is null, use city as fallback
UPDATE listings
SET title = CONCAT('Room in ', city)
WHERE room_size_m2 IS NULL
  AND property_type = 'room'
  AND city IS NOT NULL
  AND (title IS NULL OR title NOT LIKE 'Room in %');

-- Add comment documenting the title format
COMMENT ON COLUMN listings.title IS 'Auto-generated title in format: "Room, {room_size_m2} m²" for property_type=room';