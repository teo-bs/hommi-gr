-- Create sample profiles for testing
INSERT INTO public.profiles (id, user_id, email, display_name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'john@example.com', 'John Smith', 'host'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'maria@example.com', 'Maria Papadopoulos', 'host'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'nikos@example.com', 'Nikos Kostas', 'host');

-- Create sample listers
INSERT INTO public.listers (id, profile_id, score, badges) VALUES 
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 95, '["verified", "id_checked"]'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 88, '["verified"]'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 92, '["verified", "id_checked"]');

-- Create sample listings
INSERT INTO public.listings (id, owner_id, title, price_month, city, neighborhood, status, flatmates_count, couples_accepted, pets_allowed, smoking_allowed, availability_date, photos, geo) VALUES 
('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Cozy room in trendy Koukaki', 520, 'Athens', 'Κουκάκι', 'published', 2, true, false, false, '2024-02-01', '["/placeholder.svg"]', '{"lat": 37.9635, "lng": 23.7348}'),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Spacious room near Acropolis Museum', 680, 'Athens', 'Μακρυγιάννη', 'published', 1, false, false, false, '2024-02-15', '["/placeholder.svg"]', '{"lat": 37.9687, "lng": 23.7281}'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Bohemian flat in Exarchia', 450, 'Athens', 'Εξάρχεια', 'published', 3, true, true, false, '2024-03-01', '["/placeholder.svg"]', '{"lat": 37.9886, "lng": 23.7348}'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Quiet room in Pangrati', 480, 'Athens', 'Παγκράτι', 'published', 2, false, false, false, '2024-02-20', '["/placeholder.svg"]', '{"lat": 37.9697, "lng": 23.7516}'),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Luxury apartment in Kolonaki', 750, 'Athens', 'Κολωνάκι', 'published', 1, true, false, false, '2024-03-15', '["/placeholder.svg"]', '{"lat": 37.9755, "lng": 23.7421}');

-- Create sample rooms
INSERT INTO public.rooms (id, listing_id, slug, room_type, room_size_m2, has_bed, is_interior) VALUES 
('880e8400-e29b-41d4-a716-446655440000', '770e8400-e29b-41d4-a716-446655440000', 'cozy-room-koukaki', 'private', 15, true, true),
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'spacious-room-acropolis', 'private', 20, true, true),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'bohemian-room-exarchia', 'shared', 12, true, true),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'quiet-room-pangrati', 'private', 18, true, true),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'luxury-room-kolonaki', 'private', 25, true, true);

-- Create sample room photos
INSERT INTO public.room_photos (id, room_id, url, alt_text, sort_order) VALUES 
('990e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', '/placeholder.svg', 'Cozy room in Koukaki', 0),
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '/placeholder.svg', 'Spacious room near Acropolis', 0),
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', '/placeholder.svg', 'Bohemian room in Exarchia', 0),
('990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', '/placeholder.svg', 'Quiet room in Pangrati', 0),
('990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', '/placeholder.svg', 'Luxury room in Kolonaki', 0);

-- Create sample room stats
INSERT INTO public.room_stats (id, room_id, view_count, request_count) VALUES 
('aa0e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', 42, 5),
('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 38, 3),
('aa0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 51, 8),
('aa0e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 29, 2),
('aa0e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', 67, 12);