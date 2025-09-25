-- Migration: Safe constraint and index addition with existence checks
-- Step 1: Clean up orphaned data first
DELETE FROM public.rooms 
WHERE listing_id NOT IN (SELECT id FROM public.listings);

DELETE FROM public.room_amenities 
WHERE room_id NOT IN (SELECT id FROM public.rooms);

DELETE FROM public.room_photos 
WHERE room_id NOT IN (SELECT id FROM public.rooms);

DELETE FROM public.room_stats 
WHERE room_id NOT IN (SELECT id FROM public.rooms);

-- Step 2: Add foreign key constraints with existence checks
DO $$
BEGIN
  -- Foreign key: verifications.user_id → auth.users(id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_verifications_user_id' AND table_name = 'verifications'
  ) THEN
    ALTER TABLE public.verifications 
    ADD CONSTRAINT fk_verifications_user_id 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Foreign key: onboarding_progress.user_id → auth.users(id) 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_onboarding_progress_user_id' AND table_name = 'onboarding_progress'
  ) THEN
    ALTER TABLE public.onboarding_progress 
    ADD CONSTRAINT fk_onboarding_progress_user_id 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Foreign key: room_amenities.room_id → rooms(id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_room_amenities_room_id' AND table_name = 'room_amenities'
  ) THEN
    ALTER TABLE public.room_amenities 
    ADD CONSTRAINT fk_room_amenities_room_id 
    FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;
  END IF;

  -- Foreign key: room_amenities.amenity_id → amenities(id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_room_amenities_amenity_id' AND table_name = 'room_amenities'
  ) THEN
    ALTER TABLE public.room_amenities 
    ADD CONSTRAINT fk_room_amenities_amenity_id 
    FOREIGN KEY (amenity_id) REFERENCES public.amenities(id) ON DELETE RESTRICT;
  END IF;

  -- Foreign key: rooms.listing_id → listings(id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_rooms_listing_id' AND table_name = 'rooms'
  ) THEN
    ALTER TABLE public.rooms 
    ADD CONSTRAINT fk_rooms_listing_id 
    FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 3: Add NOT NULL constraints safely
DO $$
BEGIN
  -- Check and set NOT NULL for rooms.listing_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'listing_id' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.rooms ALTER COLUMN listing_id SET NOT NULL;
  END IF;

  -- Check and set NOT NULL for rooms.room_type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'room_type' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.rooms ALTER COLUMN room_type SET NOT NULL;
  END IF;

  -- Check and set NOT NULL for amenities.name
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'amenities' AND column_name = 'name' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.amenities ALTER COLUMN name SET NOT NULL;
  END IF;
END $$;

-- Step 4: Add performance indexes with existence checks
CREATE INDEX IF NOT EXISTS idx_listings_availability 
ON public.listings USING btree (availability_date, status) 
WHERE status = 'published'::publish_status_enum AND availability_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listings_min_stay 
ON public.listings USING btree (min_stay_months, status) 
WHERE status = 'published'::publish_status_enum AND min_stay_months IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listings_search_filters 
ON public.listings USING btree (status, city, price_month, availability_date) 
WHERE status = 'published'::publish_status_enum;

CREATE INDEX IF NOT EXISTS idx_rooms_listing_type 
ON public.rooms USING btree (listing_id, room_type);

CREATE INDEX IF NOT EXISTS idx_rooms_size 
ON public.rooms USING btree (room_size_m2) 
WHERE room_size_m2 IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_room_amenities_amenity_lookup 
ON public.room_amenities USING btree (amenity_id);

CREATE INDEX IF NOT EXISTS idx_room_amenities_room_lookup 
ON public.room_amenities USING btree (room_id);

CREATE INDEX IF NOT EXISTS idx_amenities_category 
ON public.amenities USING btree (category);

-- Step 5: GIN indexes for JSON columns
CREATE INDEX IF NOT EXISTS idx_listings_amenities_property_gin 
ON public.listings USING gin (amenities_property);

CREATE INDEX IF NOT EXISTS idx_listings_amenities_room_gin 
ON public.listings USING gin (amenities_room);

CREATE INDEX IF NOT EXISTS idx_listings_preferred_gender_gin 
ON public.listings USING gin (preferred_gender);

-- Step 6: Optimize verification lookups
CREATE INDEX IF NOT EXISTS idx_verifications_user_kind_status 
ON public.verifications USING btree (user_id, kind, status);

-- Step 7: Add check constraints safely
DO $$
BEGIN
  -- Add price positive constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_listings_price_positive' AND table_name = 'listings'
  ) THEN
    ALTER TABLE public.listings 
    ADD CONSTRAINT chk_listings_price_positive 
    CHECK (price_month > 0);
  END IF;

  -- Add coordinate validation constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_listings_valid_coordinates' AND table_name = 'listings'
  ) THEN
    ALTER TABLE public.listings 
    ADD CONSTRAINT chk_listings_valid_coordinates 
    CHECK ((lat IS NULL AND lng IS NULL) OR (lat BETWEEN -90 AND 90 AND lng BETWEEN -180 AND 180));
  END IF;

  -- Add room size validation constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_rooms_size_positive' AND table_name = 'rooms'
  ) THEN
    ALTER TABLE public.rooms 
    ADD CONSTRAINT chk_rooms_size_positive 
    CHECK (room_size_m2 IS NULL OR room_size_m2 > 0);
  END IF;
END $$;

-- Step 8: Final verification
DO $$
DECLARE 
  fk_count INTEGER;
  index_count INTEGER;
  cleaned_rooms INTEGER;
BEGIN
  SELECT COUNT(*) INTO fk_count 
  FROM information_schema.table_constraints 
  WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY';
  
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  AND tablename IN ('listings', 'rooms', 'room_amenities', 'amenities', 'verifications');
  
  SELECT COUNT(*) INTO cleaned_rooms FROM public.rooms;
  
  RAISE NOTICE 'Migration completed successfully: % foreign keys, % indexes, % rooms after cleanup', 
    fk_count, index_count, cleaned_rooms;
END $$;