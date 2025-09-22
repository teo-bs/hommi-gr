-- Create host profiles 
INSERT INTO profiles (id, user_id, email, display_name, role, profession, languages, member_since) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'maria.host@example.com', 'Maria Papadopoulos', 'host', 'Software Engineer', ARRAY['el', 'en'], '2023-01-15'),
('b2c3d4e5-f6g7-8901-bcde-f23456789012', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 'nikos.host@example.com', 'Nikos Georgiadis', 'host', 'Marketing Manager', ARRAY['el', 'en'], '2023-03-22'),
('c3d4e5f6-g7h8-9012-cdef-345678901234', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'elena.host@example.com', 'Elena Dimitriou', 'host', 'Teacher', ARRAY['el', 'en', 'fr'], '2023-05-10');

-- Create lister profiles for the hosts
INSERT INTO listers (id, profile_id, score, badges) VALUES
('d4e5f6g7-h8i9-0123-defg-456789012345', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 85, '["verified", "top_host"]'),
('e5f6g7h8-i9j0-1234-efgh-567890123456', 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 92, '["verified", "super_host"]'),
('f6g7h8i9-j0k1-2345-fghi-678901234567', 'c3d4e5f6-g7h8-9012-cdef-345678901234', 78, '["verified"]');

-- Create published listings
INSERT INTO listings (id, title, city, neighborhood, price_month, owner_id, status, photos, amenities_property, amenities_room, flatmates_count, couples_accepted, pets_allowed, smoking_allowed, availability_date, geo) VALUES
('l1234567-89ab-cdef-0123-456789abcdef', 'Cozy Room in Exarchia - Perfect for Students', 'Athens', 'Exarchia', 450, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'published', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800"]', '["wifi", "kitchen", "washing_machine"]', '["bed", "desk", "wardrobe"]', 2, false, false, false, '2024-10-01', '{"lat": 37.9838, "lng": 23.7275}'),
('l2345678-9abc-def0-1234-56789abcdef0', 'Bright Room in Kolonaki - City Center', 'Athens', 'Kolonaki', 650, 'b2c3d4e5-f6g7-8901-bcde-f23456789012', 'published', '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]', '["wifi", "air_conditioning", "balcony"]', '["bed", "desk", "wardrobe", "tv"]', 1, true, false, false, '2024-09-15', '{"lat": 37.9755, "lng": 23.7348}'),
('l3456789-abcd-ef01-2345-6789abcdef01', 'Spacious Room in Pangrati - Near Metro', 'Athens', 'Pangrati', 520, 'c3d4e5f6-g7h8-9012-cdef-345678901234', 'published', '["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]', '["wifi", "kitchen", "parking"]', '["bed", "desk", "wardrobe"]', 3, true, true, false, '2024-11-01', '{"lat": 37.9687, "lng": 23.7467}');

-- Create rooms for these listings
INSERT INTO rooms (id, listing_id, slug, room_type, room_size_m2, has_bed, is_interior) VALUES
('r1234567-89ab-cdef-0123-456789abcdef', 'l1234567-89ab-cdef-0123-456789abcdef', 'cozy-room-exarchia-perfect-students', 'private', 15, true, false),
('r2345678-9abc-def0-1234-56789abcdef0', 'l2345678-9abc-def0-1234-56789abcdef0', 'bright-room-kolonaki-city-center', 'private', 18, true, false),
('r3456789-abcd-ef01-2345-6789abcdef01', 'l3456789-abcd-ef01-2345-6789abcdef01', 'spacious-room-pangrati-near-metro', 'private', 20, true, true);

-- Create room photos
INSERT INTO room_photos (id, room_id, url, alt_text, sort_order) VALUES
('p1234567-89ab-cdef-0123-456789abcdef', 'r1234567-89ab-cdef-0123-456789abcdef', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'Main room view', 0),
('p1234567-89ab-cdef-0123-456789abcde0', 'r1234567-89ab-cdef-0123-456789abcdef', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 'Room detail', 1),
('p2345678-9abc-def0-1234-56789abcdef0', 'r2345678-9abc-def0-1234-56789abcdef0', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'Bright room view', 0),
('p2345678-9abc-def0-1234-56789abcde0', 'r2345678-9abc-def0-1234-56789abcdef0', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'Room with natural light', 1),
('p3456789-abcd-ef01-2345-6789abcdef01', 'r3456789-abcd-ef01-2345-6789abcdef01', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 'Spacious room', 0),
('p3456789-abcd-ef01-2345-6789abcde0', 'r3456789-abcd-ef01-2345-6789abcdef01', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'Room interior', 1);

-- Create room stats
INSERT INTO room_stats (id, room_id, view_count, request_count) VALUES
('s1234567-89ab-cdef-0123-456789abcdef', 'r1234567-89ab-cdef-0123-456789abcdef', 24, 3),
('s2345678-9abc-def0-1234-56789abcdef0', 'r2345678-9abc-def0-1234-56789abcdef0', 18, 5),
('s3456789-abcd-ef01-2345-6789abcdef01', 'r3456789-abcd-ef01-2345-6789abcdef01', 31, 2);