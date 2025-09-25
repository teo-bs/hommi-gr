-- Migration: Clean up orphan data and add constraints safely
-- Step 1: Clean up orphan room records that reference non-existent listings
DELETE FROM public.rooms 
WHERE listing_id NOT IN (SELECT id FROM public.listings);

-- Clean up orphan room_amenities that reference non-existent rooms
DELETE FROM public.room_amenities 
WHERE room_id NOT IN (SELECT id FROM public.rooms);

-- Clean up orphan room_photos that reference non-existent rooms
DELETE FROM public.room_photos 
WHERE room_id NOT IN (SELECT id FROM public.rooms);

-- Clean up orphan room_stats that reference non-existent rooms
DELETE FROM public.room_stats 
WHERE room_id NOT IN (SELECT id FROM public.rooms);

-- Step 2: Add foreign key constraints with appropriate cascades
-- Foreign key: verifications.user_id → auth.users(id)
ALTER TABLE public.verifications 
ADD CONSTRAINT fk_verifications_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Foreign key: onboarding_progress.user_id → auth.users(id) 
ALTER TABLE public.onboarding_progress 
ADD CONSTRAINT fk_onboarding_progress_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Foreign key: room_amenities.room_id → rooms(id)
ALTER TABLE public.room_amenities 
ADD CONSTRAINT fk_room_amenities_room_id 
FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;

-- Foreign key: room_amenities.amenity_id → amenities(id)
ALTER TABLE public.room_amenities 
ADD CONSTRAINT fk_room_amenities_amenity_id 
FOREIGN KEY (amenity_id) REFERENCES public.amenities(id) ON DELETE RESTRICT;

-- Foreign key: rooms.listing_id → listings(id) (now safe to add)
ALTER TABLE public.rooms 
ADD CONSTRAINT fk_rooms_listing_id 
FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;

-- Step 3: Add NOT NULL constraints where appropriate
-- rooms.listing_id should NOT be NULL
ALTER TABLE public.rooms 
ALTER COLUMN listing_id SET NOT NULL;

-- rooms.room_type should NOT be NULL  
ALTER TABLE public.rooms 
ALTER COLUMN room_type SET NOT NULL;

-- amenities.name should NOT be NULL
ALTER TABLE public.amenities 
ALTER COLUMN name SET NOT NULL;

-- Step 4: Add performance indexes for search and map functionality
-- Index for availability date queries
CREATE INDEX IF NOT EXISTS idx_listings_availability 
ON public.listings USING btree (availability_date, status) 
WHERE status = 'published'::publish_status_enum AND availability_date IS NOT NULL;

-- Index for minimum stay queries
CREATE INDEX IF NOT EXISTS idx_listings_min_stay 
ON public.listings USING btree (min_stay_months, status) 
WHERE status = 'published'::publish_status_enum AND min_stay_months IS NOT NULL;

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_listings_search_filters 
ON public.listings USING btree (status, city, price_month, availability_date) 
WHERE status = 'published'::publish_status_enum;

-- Index for room-specific queries
CREATE INDEX IF NOT EXISTS idx_rooms_listing_type 
ON public.rooms USING btree (listing_id, room_type);

-- Index for room size queries
CREATE INDEX IF NOT EXISTS idx_rooms_size 
ON public.rooms USING btree (room_size_m2) 
WHERE room_size_m2 IS NOT NULL;

-- Indexes for amenities lookups (foreign key performance)
CREATE INDEX IF NOT EXISTS idx_room_amenities_amenity_lookup 
ON public.room_amenities USING btree (amenity_id);

-- Index for amenities by category
CREATE INDEX IF NOT EXISTS idx_amenities_category 
ON public.amenities USING btree (category);

-- Step 5: Create GIN indexes for JSON columns for better search performance
CREATE INDEX IF NOT EXISTS idx_listings_amenities_property_gin 
ON public.listings USING gin (amenities_property);

CREATE INDEX IF NOT EXISTS idx_listings_amenities_room_gin 
ON public.listings USING gin (amenities_room);

-- Index for preferred gender array searches
CREATE INDEX IF NOT EXISTS idx_listings_preferred_gender_gin 
ON public.listings USING gin (preferred_gender);

-- Step 6: Optimize verification lookups
CREATE INDEX IF NOT EXISTS idx_verifications_user_kind_status 
ON public.verifications USING btree (user_id, kind, status);

-- Step 7: Add check constraints for data integrity
ALTER TABLE public.listings 
ADD CONSTRAINT chk_listings_price_positive 
CHECK (price_month > 0);

ALTER TABLE public.listings 
ADD CONSTRAINT chk_listings_valid_coordinates 
CHECK ((lat IS NULL AND lng IS NULL) OR (lat BETWEEN -90 AND 90 AND lng BETWEEN -180 AND 180));

ALTER TABLE public.rooms 
ADD CONSTRAINT chk_rooms_size_positive 
CHECK (room_size_m2 IS NULL OR room_size_m2 > 0);

-- Step 8: Verification and logging
DO $$
DECLARE 
  fk_count INTEGER;
  index_count INTEGER;
  orphan_count INTEGER;
BEGIN
  -- Count foreign keys in public schema
  SELECT COUNT(*) INTO fk_count 
  FROM information_schema.table_constraints 
  WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY';
  
  -- Count indexes on relevant tables  
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  AND tablename IN ('listings', 'rooms', 'room_amenities', 'amenities', 'verifications');
  
  -- Check for remaining orphan data
  SELECT COUNT(*) INTO orphan_count FROM rooms r LEFT JOIN listings l ON r.listing_id = l.id WHERE l.id IS NULL;
  
  RAISE NOTICE 'Migration completed: % foreign keys, % indexes on core tables, % remaining orphans', 
    fk_count, index_count, orphan_count;
END $$;