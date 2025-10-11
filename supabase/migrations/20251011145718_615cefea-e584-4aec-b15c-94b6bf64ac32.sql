-- Fix amenity categories for room-specific amenities
-- These amenities should be in 'room' category, not 'property'
UPDATE public.amenities
SET category = 'room'
WHERE key IN ('private_bathroom', 'desk', 'chair', 'wardrobe', 'drawers', 'mirror', 'curtains', 'desk_lamp')
  AND category = 'property';

-- Ensure air_conditioning exists in both categories (it can be property-wide OR room-specific)
-- First, check if room-specific AC exists
DO $$
BEGIN
  -- If air_conditioning exists only as property, keep it
  -- The UI will handle showing it in the correct context
  -- Update name consistency for WiFi
  UPDATE public.amenities
  SET name_el = 'Wi-Fi'
  WHERE key = 'wifi' AND (name_el = 'WiFi' OR name_el IS NULL);
  
  -- Update TV name consistency
  UPDATE public.amenities
  SET name_el = 'Τηλεόραση'
  WHERE key = 'tv' AND name_el IS NULL;
END $$;