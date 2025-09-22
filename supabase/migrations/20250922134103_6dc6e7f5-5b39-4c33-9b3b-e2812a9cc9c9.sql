-- Insert test profiles for listers
INSERT INTO public.profiles (id, user_id, email, display_name, role, profession, member_since, kyc_status, verifications_json, languages) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'maria.koutsouki@gmail.com', 'Μαρία Κουτσούκη', 'host', 'Graphic Designer', '2023-05-15', 'verified', '{"email": true, "phone": true, "id_document": true}', ARRAY['el', 'en']),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'dimitris.papadopoulos@yahoo.gr', 'Δημήτρης Παπαδόπουλος', 'host', 'Software Engineer', '2023-03-10', 'verified', '{"email": true, "phone": true, "id_document": true}', ARRAY['el', 'en', 'de']),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'elena.georgiou@hotmail.com', 'Έλενα Γεωργίου', 'host', 'Marketing Manager', '2023-08-22', 'verified', '{"email": true, "phone": true}', ARRAY['el', 'en', 'fr']),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'nikos.stavros@gmail.com', 'Νίκος Σταύρος', 'host', 'Teacher', '2023-01-18', 'partial', '{"email": true, "phone": false}', ARRAY['el']),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'sofia.andrianaki@gmail.com', 'Σοφία Ανδριανάκη', 'host', 'Architect', '2023-06-30', 'verified', '{"email": true, "phone": true, "id_document": true}', ARRAY['el', 'en', 'it']),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 'kostas.michalis@outlook.com', 'Κώστας Μιχάλης', 'host', 'Data Analyst', '2023-04-05', 'verified', '{"email": true, "phone": true, "id_document": true}', ARRAY['el', 'en']),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'anna.vasiliou@gmail.com', 'Άννα Βασιλείου', 'host', 'Doctor', '2023-09-12', 'verified', '{"email": true, "phone": true, "id_document": true}', ARRAY['el', 'en', 'es']);

-- Insert corresponding lister profiles
INSERT INTO public.listers (id, profile_id, score, badges) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 92, '["verified_host", "super_host", "quick_responder"]'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 88, '["verified_host", "excellent_reviews"]'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 85, '["verified_host", "quick_responder"]'),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 78, '["verified_host"]'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 95, '["verified_host", "super_host", "excellent_reviews", "quick_responder"]'),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 89, '["verified_host", "quick_responder"]'),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 91, '["verified_host", "super_host", "excellent_reviews"]');

-- Insert test listings in various Athens neighborhoods
INSERT INTO public.listings (id, owner_id, title, city, neighborhood, price_month, status, availability_date, flatmates_count, couples_accepted, pets_allowed, smoking_allowed, photos, geo) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Cozy room in trendy Koukaki', 'Αθήνα', 'Κουκάκι', 520, 'published', '2024-10-15', 2, true, false, false, '[{"url": "/placeholder.svg", "alt": "Modern living room"}, {"url": "/placeholder.svg", "alt": "Bright bedroom"}]', '{"lat": 37.9596, "lng": 23.7348, "address": "Φαλήρου 45, Κουκάκι"}'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Spacious room near Acropolis Museum', 'Αθήνα', 'Μακρυγιάννη', 680, 'published', '2024-11-01', 1, false, true, false, '[{"url": "/placeholder.svg", "alt": "Elegant bedroom"}, {"url": "/placeholder.svg", "alt": "Shared kitchen"}]', '{"lat": 37.9687, "lng": 23.7279, "address": "Αθανασίου Διάκου 12, Μακρυγιάννη"}'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Bohemian flat in Exarchia', 'Αθήνα', 'Εξάρχεια', 450, 'published', '2024-10-20', 3, true, true, true, '[{"url": "/placeholder.svg", "alt": "Artistic living space"}, {"url": "/placeholder.svg", "alt": "Colorful bedroom"}]', '{"lat": 37.9838, "lng": 23.7364, "address": "Τζαβέλλα 8, Εξάρχεια"}'),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Quiet room in Pangrati', 'Αθήνα', 'Παγκράτι', 480, 'published', '2024-11-15', 2, false, false, false, '[{"url": "/placeholder.svg", "alt": "Peaceful bedroom"}, {"url": "/placeholder.svg", "alt": "Study area"}]', '{"lat": 37.9678, "lng": 23.7417, "address": "Αρχιμήδους 23, Παγκράτι"}'),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Luxury apartment in Kolonaki', 'Αθήνα', 'Κολωνάκι', 750, 'published', '2024-10-30', 1, true, false, false, '[{"url": "/placeholder.svg", "alt": "Luxury living room"}, {"url": "/placeholder.svg", "alt": "Designer bedroom"}]', '{"lat": 37.9755, "lng": 23.7348, "address": "Σκουφά 35, Κολωνάκι"}'),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 'Modern studio near Metro', 'Αθήνα', 'Αμπελόκηποι', 550, 'published', '2024-11-10', 0, false, true, false, '[{"url": "/placeholder.svg", "alt": "Modern studio"}, {"url": "/placeholder.svg", "alt": "Kitchen area"}]', '{"lat": 37.9755, "lng": 23.7520, "address": "Αλεξάνδρας 112, Αμπελόκηποι"}'),
('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'Traditional flat in Plaka', 'Αθήνα', 'Πλάκα', 620, 'published', '2024-12-01', 2, true, false, false, '[{"url": "/placeholder.svg", "alt": "Traditional Greek room"}, {"url": "/placeholder.svg", "alt": "Historic balcony"}]', '{"lat": 37.9725, "lng": 23.7275, "address": "Αδριανού 89, Πλάκα"}');

-- Insert rooms for each listing
INSERT INTO public.rooms (id, listing_id, slug, room_type, room_size_m2, is_interior, has_bed) VALUES
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'cozy-koukaki-room-1', 'private', 18, false, true),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'acropolis-museum-room-1', 'private', 22, false, true),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'bohemian-exarchia-room-1', 'private', 16, true, true),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'quiet-pangrati-room-1', 'private', 20, false, true),
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', 'luxury-kolonaki-room-1', 'private', 25, false, true),
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440006', 'modern-ambelokipi-studio-1', 'private', 30, false, false),
('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440007', 'traditional-plaka-room-1', 'private', 19, true, true);

-- Insert room photos
INSERT INTO public.room_photos (id, room_id, url, alt_text, sort_order) VALUES
-- Koukaki room photos
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '/placeholder.svg', 'Bright bedroom with balcony door', 0),
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', '/placeholder.svg', 'Cozy reading nook', 1),
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', '/placeholder.svg', 'Shared living area', 2),
-- Acropolis Museum room photos  
('990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440002', '/placeholder.svg', 'Spacious master bedroom', 0),
('990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440002', '/placeholder.svg', 'Modern bathroom', 1),
('990e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440002', '/placeholder.svg', 'Fully equipped kitchen', 2),
-- Exarchia room photos
('990e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440003', '/placeholder.svg', 'Artistic bedroom corner', 0),
('990e8400-e29b-41d4-a716-446655440008', '880e8400-e29b-41d4-a716-446655440003', '/placeholder.svg', 'Creative workspace', 1),
-- Pangrati room photos
('990e8400-e29b-41d4-a716-446655440009', '880e8400-e29b-41d4-a716-446655440004', '/placeholder.svg', 'Peaceful bedroom with garden view', 0),
('990e8400-e29b-41d4-a716-446655440010', '880e8400-e29b-41d4-a716-446655440004', '/placeholder.svg', 'Quiet study area', 1),
-- Kolonaki room photos
('990e8400-e29b-41d4-a716-446655440011', '880e8400-e29b-41d4-a716-446655440005', '/placeholder.svg', 'Luxury bedroom with designer furniture', 0),
('990e8400-e29b-41d4-a716-446655440012', '880e8400-e29b-41d4-a716-446655440005', '/placeholder.svg', 'Premium bathroom', 1),
('990e8400-e29b-41d4-a716-446655440013', '880e8400-e29b-41d4-a716-446655440005', '/placeholder.svg', 'High-end kitchen', 2),
-- Ambelokipi studio photos
('990e8400-e29b-41d4-a716-446655440014', '880e8400-e29b-41d4-a716-446655440006', '/placeholder.svg', 'Modern studio layout', 0),
('990e8400-e29b-41d4-a716-446655440015', '880e8400-e29b-41d4-a716-446655440006', '/placeholder.svg', 'Compact kitchen design', 1),
-- Plaka room photos
('990e8400-e29b-41d4-a716-446655440016', '880e8400-e29b-41d4-a716-446655440007', '/placeholder.svg', 'Traditional Greek bedroom', 0),
('990e8400-e29b-41d4-a716-446655440017', '880e8400-e29b-41d4-a716-446655440007', '/placeholder.svg', 'Historic balcony with Acropolis view', 1);

-- Insert amenities data
INSERT INTO public.amenities (id, name, category, icon) VALUES
-- Property amenities
('aa0e8400-e29b-41d4-a716-446655440001', 'Ασανσέρ', 'property', 'ArrowUp'),
('aa0e8400-e29b-41d4-a716-446655440002', 'Μπαλκόνι', 'property', 'Home'),
('aa0e8400-e29b-41d4-a716-446655440003', 'Κήπος', 'property', 'Flower'),
('aa0e8400-e29b-41d4-a716-446655440004', 'Parking', 'property', 'Car'),
('aa0e8400-e29b-41d4-a716-446655440005', 'Wi-Fi', 'property', 'Wifi'),
('aa0e8400-e29b-41d4-a716-446655440006', 'Κλιματισμός', 'property', 'Snowflake'),
('aa0e8400-e29b-41d4-a716-446655440007', 'Πλυντήριο', 'property', 'Waves'),
-- Room amenities
('aa0e8400-e29b-41d4-a716-446655440008', 'Γραφείο', 'room', 'Laptop'),
('aa0e8400-e29b-41d4-a716-446655440009', 'Ντουλάπα', 'room', 'Package'),
('aa0e8400-e29b-41d4-a716-446655440010', 'Τηλεόραση', 'room', 'Tv'),
('aa0e8400-e29b-41d4-a716-446655440011', 'Ιδιωτικό μπάνιο', 'room', 'Bath'),
('aa0e8400-e29b-41d4-a716-446655440012', 'Μίνι ψυγείο', 'room', 'Refrigerator');

-- Link amenities to rooms
INSERT INTO public.room_amenities (room_id, amenity_id) VALUES
-- Koukaki room amenities
('880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440002'), -- Balcony
('880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440005'), -- Wi-Fi
('880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440006'), -- AC
('880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440008'), -- Desk
('880e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440009'), -- Wardrobe
-- Acropolis Museum room amenities
('880e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440001'), -- Elevator
('880e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440005'), -- Wi-Fi
('880e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440006'), -- AC
('880e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440011'), -- Private bathroom
('880e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440008'), -- Desk
-- Exarchia room amenities
('880e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440005'), -- Wi-Fi
('880e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440008'), -- Desk
('880e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440010'), -- TV
-- Pangrati room amenities
('880e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440003'), -- Garden
('880e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440005'), -- Wi-Fi
('880e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440008'), -- Desk
('880e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440009'), -- Wardrobe
-- Kolonaki luxury room amenities
('880e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440001'), -- Elevator
('880e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440002'), -- Balcony
('880e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440005'), -- Wi-Fi
('880e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440006'), -- AC
('880e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440011'), -- Private bathroom
('880e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440008'), -- Desk
('880e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440010'), -- TV
-- Ambelokipi studio amenities
('880e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440001'), -- Elevator
('880e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440005'), -- Wi-Fi
('880e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440006'), -- AC
('880e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440012'), -- Mini fridge
-- Plaka traditional room amenities
('880e8400-e29b-41d4-a716-446655440007', 'aa0e8400-e29b-41d4-a716-446655440002'), -- Balcony
('880e8400-e29b-41d4-a716-446655440007', 'aa0e8400-e29b-41d4-a716-446655440005'), -- Wi-Fi
('880e8400-e29b-41d4-a716-446655440007', 'aa0e8400-e29b-41d4-a716-446655440008'), -- Desk
('880e8400-e29b-41d4-a716-446655440007', 'aa0e8400-e29b-41d4-a716-446655440009'); -- Wardrobe

-- Initialize room stats
INSERT INTO public.room_stats (id, room_id, view_count, request_count, last_viewed_at) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 45, 8, now() - interval '2 hours'),
('bb0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 67, 12, now() - interval '30 minutes'),
('bb0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 34, 6, now() - interval '1 day'),
('bb0e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', 28, 4, now() - interval '5 hours'),
('bb0e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440005', 89, 18, now() - interval '15 minutes'),
('bb0e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440006', 52, 9, now() - interval '3 hours'),
('bb0e8400-e29b-41d4-a716-446655440007', '880e8400-e29b-41d4-a716-446655440007', 73, 15, now() - interval '1 hour');