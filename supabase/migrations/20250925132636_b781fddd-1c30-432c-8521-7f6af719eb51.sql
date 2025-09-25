-- Complete Task 2: Create 6 complete dummy listings with all required data (Fixed - correct listed_space)

-- First, let's create some lister profiles (if they don't exist) - WITH EMAIL
INSERT INTO public.profiles (user_id, email, display_name, about_me, profession, languages, country, role, avatar_url, member_since, profile_completion_pct)
SELECT 
  u.id,
  u.email,  -- Include email from auth.users
  CASE 
    WHEN u.email LIKE '%maria%' THEN 'Μαρία Παπαδοπούλου'
    WHEN u.email LIKE '%nikos%' THEN 'Νίκος Αθανασίου'
    WHEN u.email LIKE '%sofia%' THEN 'Σοφία Μητσοτάκη'
    WHEN u.email LIKE '%dimitris%' THEN 'Δημήτρης Κωνσταντίνου'
    WHEN u.email LIKE '%elena%' THEN 'Έλενα Γεωργίου'
    WHEN u.email LIKE '%kostas%' THEN 'Κώστας Παπαδάκης'
    ELSE 'Host ' || substr(u.id::text, 1, 8)
  END as display_name,
  CASE 
    WHEN u.email LIKE '%maria%' THEN 'Καλησπέρα! Είμαι η Μαρία και νοικιάζω ένα όμορφο δωμάτιο στο κέντρο της Αθήνας. Μου αρέσει να γνωρίζω νέους ανθρώπους!'
    WHEN u.email LIKE '%nikos%' THEN 'Γεια σας! Ο Νίκος εδώ. Έχω ένα διαμέρισμα κοντά στο μετρό και αναζητώ έναν ήσυχο συγκάτοικο.'
    WHEN u.email LIKE '%sofia%' THEN 'Χαίρετε! Η Σοφία εδώ. Μοιράζομαι το σπίτι μου με φοιτητές και εργαζομένους. Ατμόσφαιρα φιλική!'
    WHEN u.email LIKE '%dimitris%' THEN 'Γεια! Ο Δημήτρης εδώ. Έχω ένα ευρύχωρο διαμέρισμα και αναζητώ συγκάτοικο που αγαπά τη καθαριότητα.'
    WHEN u.email LIKE '%elena%' THEN 'Καλησπέρα! Η Έλενα εδώ. Προσφέρω δωμάτιο σε φιλικό περιβάλλον κοντά στο κέντρο.'
    WHEN u.email LIKE '%kostas%' THEN 'Γεια σας! Ο Κώστας εδώ. Έχω ένα όμορφο σπίτι με κήπο και ψάχνω για έναν καλό συγκάτοικο.'
    ELSE 'Φιλικός οικοδεσπότης που αγαπά να γνωρίζει νέους ανθρώπους!'
  END as about_me,
  CASE 
    WHEN u.email LIKE '%maria%' THEN 'Δασκάλα'
    WHEN u.email LIKE '%nikos%' THEN 'Μηχανικός'
    WHEN u.email LIKE '%sofia%' THEN 'Γραφίστρια'
    WHEN u.email LIKE '%dimitris%' THEN 'Προγραμματιστής'
    WHEN u.email LIKE '%elena%' THEN 'Νοσηλεύτρια'
    WHEN u.email LIKE '%kostas%' THEN 'Αρχιτέκτονας'
    ELSE 'Εργαζόμενος'
  END as profession,
  ARRAY['el', 'en'] as languages,
  'GR' as country,
  'lister'::user_role_enum as role,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' as avatar_url,
  CURRENT_DATE - INTERVAL '6 months' as member_since,
  85 as profile_completion_pct
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
)
LIMIT 6;

-- Now create the 6 complete listings
WITH lister_profiles AS (
  SELECT id, user_id, display_name, 
    ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.profiles 
  WHERE role = 'lister'::user_role_enum
  LIMIT 6
),
listing_data AS (
  SELECT 
    lp.id as owner_id,
    lp.user_id,
    lp.display_name,
    lp.rn,
    CASE lp.rn
      WHEN 1 THEN 'Όμορφο δωμάτιο στο κέντρο της Αθήνας'
      WHEN 2 THEN 'Ευρύχωρο διαμέρισμα κοντά στο μετρό'
      WHEN 3 THEN 'Φιλικό περιβάλλον για φοιτητές'
      WHEN 4 THEN 'Μοντέρνο δωμάτιο με όλες τις ανέσεις'
      WHEN 5 THEN 'Ήσυχο σπίτι κοντά στο κέντρο'
      WHEN 6 THEN 'Σπίτι με κήπο και ωραία θέα'
    END as title,
    CASE lp.rn
      WHEN 1 THEN 'Προσφέρω ένα όμορφο και φωτεινό δωμάτιο στο κέντρο της Αθήνας. Το διαμέρισμα είναι πλήρως εξοπλισμένο και βρίσκεται κοντά σε όλες τις ανέσεις.'
      WHEN 2 THEN 'Ευρύχωρο διαμέρισμα 2 υπνοδωματίων κοντά στο μετρό. Ιδανικό για εργαζομένους που θέλουν εύκολη πρόσβαση στο κέντρο.'
      WHEN 3 THEN 'Φιλικό περιβάλλον ιδανικό για φοιτητές. Κοντά σε πανεπιστήμια και με όλες τις ανέσεις που χρειάζεστε.'
      WHEN 4 THEN 'Μοντέρνο δωμάτιο σε νεόδμητο κτίριο. Πλήρως εξοπλισμένο με WiFi, κλιματισμό και όλες τις σύγχρονες ανέσεις.'
      WHEN 5 THEN 'Ήσυχο σπίτι σε φιλική γειτονιά. Ιδανικό για όσους αναζητούν ησυχία αλλά κοντά στις αστικές ανέσεις.'
      WHEN 6 THEN 'Όμορφο σπίτι με κήπο και ωραία θέα. Περιβάλλον γεμάτο πράσινο και φρέσκο αέρα.'
    END as description,
    CASE lp.rn
      WHEN 1 THEN 450
      WHEN 2 THEN 520
      WHEN 3 THEN 380
      WHEN 4 THEN 600
      WHEN 5 THEN 420
      WHEN 6 THEN 480
    END as price_month,
    CASE lp.rn
      WHEN 1 THEN 'Αθήνα'
      WHEN 2 THEN 'Αθήνα'
      WHEN 3 THEN 'Θεσσαλονίκη'
      WHEN 4 THEN 'Αθήνα'
      WHEN 5 THEN 'Πάτρα'
      WHEN 6 THEN 'Ηράκλειο'
    END as city,
    CASE lp.rn
      WHEN 1 THEN 'Εξάρχεια'
      WHEN 2 THEN 'Κυψέλη'
      WHEN 3 THEN 'Κέντρο'
      WHEN 4 THEN 'Κολωνάκι'
      WHEN 5 THEN 'Κέντρο'
      WHEN 6 THEN 'Κέντρο'
    END as neighborhood,
    -- Mock coordinates for Greek cities
    CASE lp.rn
      WHEN 1 THEN 37.9838 + (random() - 0.5) * 0.01  -- Athens
      WHEN 2 THEN 37.9838 + (random() - 0.5) * 0.01  -- Athens
      WHEN 3 THEN 40.6401 + (random() - 0.5) * 0.01  -- Thessaloniki
      WHEN 4 THEN 37.9755 + (random() - 0.5) * 0.01  -- Athens
      WHEN 5 THEN 38.2466 + (random() - 0.5) * 0.01  -- Patras
      WHEN 6 THEN 35.3387 + (random() - 0.5) * 0.01  -- Heraklion
    END as lat,
    CASE lp.rn
      WHEN 1 THEN 23.7275 + (random() - 0.5) * 0.01  -- Athens
      WHEN 2 THEN 23.7348 + (random() - 0.5) * 0.01  -- Athens
      WHEN 3 THEN 22.9444 + (random() - 0.5) * 0.01  -- Thessaloniki
      WHEN 4 THEN 23.7348 + (random() - 0.5) * 0.01  -- Athens
      WHEN 5 THEN 21.7345 + (random() - 0.5) * 0.01  -- Patras
      WHEN 6 THEN 25.1442 + (random() - 0.5) * 0.01  -- Heraklion
    END as lng
  FROM lister_profiles lp
)
INSERT INTO public.listings (
  owner_id, title, description, price_month, city, neighborhood,
  lat, lng, flatmates_count, couples_accepted, pets_allowed, smoking_allowed,
  deposit, property_type, listed_space, availability_date, min_stay_months, max_stay_months,
  bedrooms_single, bedrooms_double, bathrooms, property_size_m2, room_size_m2,
  status, step_completed, has_lift, orientation,
  photos, amenities_property, amenities_room, house_rules,
  created_at, updated_at
)
SELECT 
  ld.owner_id,
  ld.title,
  ld.description,
  ld.price_month,
  ld.city,
  ld.neighborhood,
  ld.lat,
  ld.lng,
  CASE ld.rn WHEN 1 THEN 1 WHEN 2 THEN 2 WHEN 3 THEN 3 WHEN 4 THEN 1 WHEN 5 THEN 2 WHEN 6 THEN 1 END as flatmates_count,
  CASE ld.rn WHEN 1 THEN false WHEN 2 THEN true WHEN 3 THEN false WHEN 4 THEN true WHEN 5 THEN false WHEN 6 THEN true END as couples_accepted,
  CASE ld.rn WHEN 1 THEN false WHEN 2 THEN false WHEN 3 THEN true WHEN 4 THEN false WHEN 5 THEN true WHEN 6 THEN true END as pets_allowed,
  CASE ld.rn WHEN 1 THEN false WHEN 2 THEN false WHEN 3 THEN false WHEN 4 THEN false WHEN 5 THEN false WHEN 6 THEN false END as smoking_allowed,
  ld.price_month as deposit,
  'room' as property_type,
  'room' as listed_space,  -- Fixed: Use 'room' instead of 'private_room'
  CURRENT_DATE + INTERVAL '1 month' as availability_date,
  3 as min_stay_months,
  12 as max_stay_months,
  CASE ld.rn WHEN 1 THEN 2 WHEN 2 THEN 3 WHEN 3 THEN 4 WHEN 4 THEN 2 WHEN 5 THEN 3 WHEN 6 THEN 2 END as bedrooms_single,
  CASE ld.rn WHEN 1 THEN 1 WHEN 2 THEN 1 WHEN 3 THEN 0 WHEN 4 THEN 1 WHEN 5 THEN 1 WHEN 6 THEN 1 END as bedrooms_double,
  CASE ld.rn WHEN 1 THEN 1 WHEN 2 THEN 2 WHEN 3 THEN 2 WHEN 4 THEN 1 WHEN 5 THEN 2 WHEN 6 THEN 1 END as bathrooms,
  CASE ld.rn WHEN 1 THEN 80 WHEN 2 THEN 95 WHEN 3 THEN 70 WHEN 4 THEN 85 WHEN 5 THEN 90 WHEN 6 THEN 75 END as property_size_m2,
  CASE ld.rn WHEN 1 THEN 15 WHEN 2 THEN 18 WHEN 3 THEN 12 WHEN 4 THEN 20 WHEN 5 THEN 16 WHEN 6 THEN 14 END as room_size_m2,
  'published'::publish_status_enum as status,
  5 as step_completed,
  CASE ld.rn WHEN 1 THEN false WHEN 2 THEN true WHEN 3 THEN false WHEN 4 THEN true WHEN 5 THEN false WHEN 6 THEN false END as has_lift,
  CASE ld.rn WHEN 1 THEN 'exterior' WHEN 2 THEN 'exterior' WHEN 3 THEN 'interior' WHEN 4 THEN 'exterior' WHEN 5 THEN 'exterior' WHEN 6 THEN 'exterior' END as orientation,
  -- Photos array
  CASE ld.rn
    WHEN 1 THEN '[{"url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", "alt_text": "Όμορφο δωμάτιο"}, {"url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800", "alt_text": "Σαλόνι"}, {"url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "alt_text": "Κουζίνα"}]'
    WHEN 2 THEN '[{"url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "alt_text": "Ευρύχωρο δωμάτιο"}, {"url": "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800", "alt_text": "Μπάνιο"}, {"url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800", "alt_text": "Μπαλκόνι"}]'
    WHEN 3 THEN '[{"url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800", "alt_text": "Δωμάτιο φοιτητή"}, {"url": "https://images.unsplash.com/photo-1556909925-f662c407c3eb?w=800", "alt_text": "Γραφείο"}, {"url": "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800", "alt_text": "Κοινόχρηστος χώρος"}]'
    WHEN 4 THEN '[{"url": "https://images.unsplash.com/photo-1560448075-bb485b067938?w=800", "alt_text": "Μοντέρνο δωμάτιο"}, {"url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800", "alt_text": "Σύγχρονη κουζίνα"}, {"url": "https://images.unsplash.com/photo-1560449752-d9d4c4c4f6b3?w=800", "alt_text": "Μπάνιο"}]'
    WHEN 5 THEN '[{"url": "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800", "alt_text": "Ήσυχο δωμάτιο"}, {"url": "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800", "alt_text": "Σαλόνι"}, {"url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", "alt_text": "Κουζίνα"}]'
    WHEN 6 THEN '[{"url": "https://images.unsplash.com/photo-1520637836862-4d197d17c86a?w=800", "alt_text": "Δωμάτιο με θέα"}, {"url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800", "alt_text": "Κήπος"}, {"url": "https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800", "alt_text": "Μπάνιο"}]'
  END::jsonb as photos,
  -- Property amenities
  CASE ld.rn
    WHEN 1 THEN '[{"id": "wifi", "name": "WiFi", "icon": "wifi"}, {"id": "air_conditioning", "name": "Κλιματισμός", "icon": "wind"}, {"id": "heating", "name": "Θέρμανση", "icon": "thermometer"}]'
    WHEN 2 THEN '[{"id": "wifi", "name": "WiFi", "icon": "wifi"}, {"id": "elevator", "name": "Ασανσέρ", "icon": "arrow-up"}, {"id": "parking", "name": "Parking", "icon": "car"}]'
    WHEN 3 THEN '[{"id": "wifi", "name": "WiFi", "icon": "wifi"}, {"id": "washing_machine", "name": "Πλυντήριο", "icon": "washing-machine"}, {"id": "study_area", "name": "Χώρος μελέτης", "icon": "book"}]'
    WHEN 4 THEN '[{"id": "wifi", "name": "WiFi", "icon": "wifi"}, {"id": "air_conditioning", "name": "Κλιματισμός", "icon": "wind"}, {"id": "elevator", "name": "Ασανσέρ", "icon": "arrow-up"}, {"id": "gym", "name": "Γυμναστήριο", "icon": "dumbbell"}]'
    WHEN 5 THEN '[{"id": "wifi", "name": "WiFi", "icon": "wifi"}, {"id": "garden", "name": "Κήπος", "icon": "leaf"}, {"id": "parking", "name": "Parking", "icon": "car"}]'
    WHEN 6 THEN '[{"id": "wifi", "name": "WiFi", "icon": "wifi"}, {"id": "garden", "name": "Κήπος", "icon": "leaf"}, {"id": "bbq", "name": "Μπάρμπεκιου", "icon": "flame"}, {"id": "view", "name": "Θέα", "icon": "eye"}]'
  END::jsonb as amenities_property,
  -- Room amenities
  CASE ld.rn
    WHEN 1 THEN '[{"id": "bed", "name": "Κρεβάτι", "icon": "bed"}, {"id": "desk", "name": "Γραφείο", "icon": "desk"}, {"id": "wardrobe", "name": "Ντουλάπα", "icon": "cabinet"}]'
    WHEN 2 THEN '[{"id": "bed", "name": "Κρεβάτι", "icon": "bed"}, {"id": "desk", "name": "Γραφείο", "icon": "desk"}, {"id": "tv", "name": "Τηλεόραση", "icon": "tv"}, {"id": "balcony", "name": "Μπαλκόνι", "icon": "door-open"}]'
    WHEN 3 THEN '[{"id": "bed", "name": "Κρεβάτι", "icon": "bed"}, {"id": "desk", "name": "Γραφείο", "icon": "desk"}, {"id": "bookshelf", "name": "Βιβλιοθήκη", "icon": "book-open"}]'
    WHEN 4 THEN '[{"id": "bed", "name": "Κρεβάτι", "icon": "bed"}, {"id": "desk", "name": "Γραφείο", "icon": "desk"}, {"id": "wardrobe", "name": "Ντουλάπα", "icon": "cabinet"}, {"id": "mini_fridge", "name": "Μίνι ψυγείο", "icon": "refrigerator"}]'
    WHEN 5 THEN '[{"id": "bed", "name": "Κρεβάτι", "icon": "bed"}, {"id": "desk", "name": "Γραφείο", "icon": "desk"}, {"id": "wardrobe", "name": "Ντουλάπα", "icon": "cabinet"}]'
    WHEN 6 THEN '[{"id": "bed", "name": "Κρεβάτι", "icon": "bed"}, {"id": "desk", "name": "Γραφείο", "icon": "desk"}, {"id": "balcony", "name": "Μπαλκόνι", "icon": "door-open"}, {"id": "plants", "name": "Φυτά", "icon": "leaf"}]'
  END::jsonb as amenities_room,
  -- House rules
  CASE ld.rn
    WHEN 1 THEN ARRAY['Όχι κάπνισμα', 'Καθαριότητα', 'Σεβασμός ωραρίων']
    WHEN 2 THEN ARRAY['Όχι κάπνισμα', 'Καθαριότητα', 'Ήσυχα μετά τις 22:00']
    WHEN 3 THEN ARRAY['Καθαριότητα', 'Ήσυχα μετά τις 23:00', 'Κατοικίδια επιτρέπονται']
    WHEN 4 THEN ARRAY['Όχι κάπνισμα', 'Μοντέρνο lifestyle', 'Ήσυχα μετά τις 22:00']
    WHEN 5 THEN ARRAY['Καθαριότητα', 'Σεβασμός κοινόχρηστων χώρων', 'Κατοικίδια επιτρέπονται']
    WHEN 6 THEN ARRAY['Καθαριότητα', 'Φροντίδα κήπου', 'Ζευγάρια καλοδεχούμενα']
  END as house_rules,
  now() - INTERVAL '1 week' as created_at,
  now() as updated_at
FROM listing_data ld;

-- Create room records for each listing
WITH new_listings AS (
  SELECT id, title, owner_id, 
    ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM public.listings 
  WHERE status = 'published'::publish_status_enum
  ORDER BY created_at DESC
  LIMIT 6
)
INSERT INTO public.rooms (
  listing_id, slug, room_type, room_size_m2, is_interior, has_bed, created_at, updated_at
)
SELECT 
  nl.id as listing_id,
  'room-' || substr(nl.id::text, 1, 8) as slug,
  'private' as room_type,
  CASE nl.rn
    WHEN 1 THEN 15
    WHEN 2 THEN 18  
    WHEN 3 THEN 12
    WHEN 4 THEN 20
    WHEN 5 THEN 16
    WHEN 6 THEN 14
  END as room_size_m2,
  CASE nl.rn
    WHEN 1 THEN false  -- exterior
    WHEN 2 THEN false  -- exterior
    WHEN 3 THEN true   -- interior
    WHEN 4 THEN false  -- exterior
    WHEN 5 THEN false  -- exterior
    WHEN 6 THEN false  -- exterior
  END as is_interior,
  true as has_bed,
  now() - INTERVAL '1 week' as created_at,
  now() as updated_at
FROM new_listings nl;