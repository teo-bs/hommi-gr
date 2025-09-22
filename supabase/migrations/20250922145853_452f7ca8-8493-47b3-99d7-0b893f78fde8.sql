-- Use existing user IDs and update their role to host, then create sample data
DO $$
DECLARE
    user1_id uuid;
    user2_id uuid;
    user3_id uuid;
    profile1_id uuid;
    profile2_id uuid;
    profile3_id uuid;
    listing1_id uuid := gen_random_uuid();
    listing2_id uuid := gen_random_uuid();
    listing3_id uuid := gen_random_uuid();
    room1_id uuid := gen_random_uuid();
    room2_id uuid := gen_random_uuid();
    room3_id uuid := gen_random_uuid();
BEGIN
    -- Get existing user IDs
    SELECT user_id, id INTO user1_id, profile1_id FROM profiles WHERE email LIKE '%@gmail.com' LIMIT 1 OFFSET 0;
    SELECT user_id, id INTO user2_id, profile2_id FROM profiles WHERE email LIKE '%@gmail.com' LIMIT 1 OFFSET 1;
    SELECT user_id, id INTO user3_id, profile3_id FROM profiles WHERE email LIKE '%@gmail.com' LIMIT 1 OFFSET 2;

    -- Update existing profiles to be hosts with better names
    UPDATE profiles SET 
        display_name = 'Maria Papadopoulos',
        role = 'host',
        profession = 'Software Engineer',
        languages = ARRAY['el', 'en']
    WHERE id = profile1_id;

    UPDATE profiles SET 
        display_name = 'Nikos Georgiadis', 
        role = 'host',
        profession = 'Marketing Manager',
        languages = ARRAY['el', 'en']
    WHERE id = profile2_id;

    UPDATE profiles SET 
        display_name = 'Elena Dimitriou',
        role = 'host', 
        profession = 'Teacher',
        languages = ARRAY['el', 'en', 'fr']
    WHERE id = profile3_id;

    -- Create lister profiles
    INSERT INTO listers (profile_id, score, badges) VALUES
    (profile1_id, 85, '["verified", "top_host"]'),
    (profile2_id, 92, '["verified", "super_host"]'),
    (profile3_id, 78, '["verified"]');

    -- Create published listings
    INSERT INTO listings (id, title, city, neighborhood, price_month, owner_id, status, photos, amenities_property, amenities_room, flatmates_count, couples_accepted, pets_allowed, smoking_allowed, availability_date, geo) VALUES
    (listing1_id, 'Cozy Room in Exarchia - Perfect for Students', 'Athens', 'Exarchia', 450, profile1_id, 'published', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800"]', '["wifi", "kitchen", "washing_machine"]', '["bed", "desk", "wardrobe"]', 2, false, false, false, '2024-10-01', '{"lat": 37.9838, "lng": 23.7275}'),
    (listing2_id, 'Bright Room in Kolonaki - City Center', 'Athens', 'Kolonaki', 650, profile2_id, 'published', '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]', '["wifi", "air_conditioning", "balcony"]', '["bed", "desk", "wardrobe", "tv"]', 1, true, false, false, '2024-09-15', '{"lat": 37.9755, "lng": 23.7348}'),
    (listing3_id, 'Spacious Room in Pangrati - Near Metro', 'Athens', 'Pangrati', 520, profile3_id, 'published', '["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]', '["wifi", "kitchen", "parking"]', '["bed", "desk", "wardrobe"]', 3, true, true, false, '2024-11-01', '{"lat": 37.9687, "lng": 23.7467}');

    -- Create rooms for these listings
    INSERT INTO rooms (id, listing_id, slug, room_type, room_size_m2, has_bed, is_interior) VALUES
    (room1_id, listing1_id, 'cozy-room-exarchia-perfect-students', 'private', 15, true, false),
    (room2_id, listing2_id, 'bright-room-kolonaki-city-center', 'private', 18, true, false),
    (room3_id, listing3_id, 'spacious-room-pangrati-near-metro', 'private', 20, true, true);

    -- Create room photos
    INSERT INTO room_photos (room_id, url, alt_text, sort_order) VALUES
    (room1_id, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'Main room view', 0),
    (room1_id, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 'Room detail', 1),
    (room2_id, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'Bright room view', 0),
    (room2_id, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'Room with natural light', 1),
    (room3_id, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800', 'Spacious room', 0),
    (room3_id, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'Room interior', 1);

    -- Create room stats
    INSERT INTO room_stats (room_id, view_count, request_count) VALUES
    (room1_id, 24, 3),
    (room2_id, 18, 5),
    (room3_id, 31, 2);
END $$;