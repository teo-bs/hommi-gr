-- Fix existing listing amenities for dab524e7-bf7d-4f8a-ad03-56560a98527c
-- Using NULL for scope as it appears the constraint doesn't accept 'property'

-- First, clear any existing amenities for this listing
DELETE FROM listing_amenities WHERE listing_id = 'dab524e7-bf7d-4f8a-ad03-56560a98527c';
DELETE FROM room_amenities WHERE room_id = 'fe173e8d-563a-4b1b-94b3-69a4531f64c3';

-- Insert property amenities (WiFi, TV, Kitchen, Washer) without scope
INSERT INTO listing_amenities (listing_id, amenity_id)
SELECT 'dab524e7-bf7d-4f8a-ad03-56560a98527c', id
FROM amenities
WHERE key IN ('wifi', 'tv', 'kitchen', 'washer')
AND is_active = true;

-- Insert room amenities (Private bathroom, TV, Air conditioning)
INSERT INTO room_amenities (room_id, amenity_id)
SELECT 'fe173e8d-563a-4b1b-94b3-69a4531f64c3', id
FROM amenities
WHERE key IN ('private_bathroom', 'tv', 'air_conditioning')
AND is_active = true;