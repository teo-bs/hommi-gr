-- Add only the truly missing amenities
INSERT INTO public.amenities (key, name_el, name_en, category_id, icon, is_active, sort_order)
VALUES
  ('dishwasher', 'Πλυντήριο πιάτων', 'Dishwasher', (SELECT id FROM public.amenity_categories WHERE key = 'essentials' LIMIT 1), 'utensils', true, 150),
  ('private_parking', 'Ιδιωτικό πάρκινγκ', 'Private parking', (SELECT id FROM public.amenity_categories WHERE key = 'features' LIMIT 1), 'car', true, 160),
  ('paid_parking', 'Πάρκινγκ με πληρωμή', 'Paid parking', (SELECT id FROM public.amenity_categories WHERE key = 'features' LIMIT 1), 'car', true, 170),
  ('outdoor_dining', 'Υπαίθρια τραπεζαρία', 'Outdoor dining', (SELECT id FROM public.amenity_categories WHERE key = 'features' LIMIT 1), 'utensils', true, 200),
  ('cleaning', 'Καθαρισμός', 'Cleaning service', (SELECT id FROM public.amenity_categories WHERE key = 'features' LIMIT 1), 'sparkles', true, 230),
  ('chair', 'Καρέκλα', 'Chair', (SELECT id FROM public.amenity_categories WHERE key = 'essentials' LIMIT 1), 'armchair', true, 240),
  ('drawers', 'Συρτάρια', 'Drawers', (SELECT id FROM public.amenity_categories WHERE key = 'essentials' LIMIT 1), 'package', true, 250),
  ('mirror', 'Καθρέφτης', 'Mirror', (SELECT id FROM public.amenity_categories WHERE key = 'essentials' LIMIT 1), 'mirror', true, 260),
  ('curtains', 'Κουρτίνες', 'Curtains', (SELECT id FROM public.amenity_categories WHERE key = 'essentials' LIMIT 1), 'window', true, 270),
  ('desk_lamp', 'Φωτισμός γραφείου', 'Desk lamp', (SELECT id FROM public.amenity_categories WHERE key = 'essentials' LIMIT 1), 'lamp', true, 280)
ON CONFLICT (key) DO NOTHING;

-- Fix the existing listing (slug: perif-reia-attik-s-diath-simo-dom-tio-6)
-- Clear existing amenities first to avoid duplicates
DELETE FROM public.listing_amenities 
WHERE listing_id IN (SELECT id FROM public.listings WHERE slug = 'perif-reia-attik-s-diath-simo-dom-tio-6');

-- Add property amenities: WiFi, TV, Kitchen, Washer (from user's screenshot)
INSERT INTO public.listing_amenities (listing_id, amenity_id, scope)
SELECT 
  l.id,
  a.id,
  'property'
FROM public.listings l
CROSS JOIN public.amenities a
WHERE l.slug = 'perif-reia-attik-s-diath-simo-dom-tio-6'
  AND a.key IN ('wifi', 'tv', 'kitchen', 'washer')
  AND a.is_active = true;

-- Clear existing room amenities
DELETE FROM public.room_amenities 
WHERE room_id IN (
  SELECT r.id FROM public.rooms r
  JOIN public.listings l ON l.id = r.listing_id
  WHERE l.slug = 'perif-reia-attik-s-diath-simo-dom-tio-6'
);

-- Add room amenities: Private bathroom, TV, AC (from user's screenshot)
INSERT INTO public.room_amenities (room_id, amenity_id)
SELECT 
  r.id,
  a.id
FROM public.rooms r
JOIN public.listings l ON l.id = r.listing_id
CROSS JOIN public.amenities a
WHERE l.slug = 'perif-reia-attik-s-diath-simo-dom-tio-6'
  AND a.key IN ('private_bathroom', 'tv', 'air_conditioning')
  AND a.is_active = true;