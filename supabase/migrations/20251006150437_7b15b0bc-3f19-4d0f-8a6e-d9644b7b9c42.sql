-- Fix ON CONFLICT errors in publish flow by enforcing proper uniqueness and cleaning duplicates
-- 1) Deduplicate rooms per listing_id and remove dependent rows for extras
-- 2) Add UNIQUE (listing_id) on rooms
-- 3) Deduplicate room_stats per room_id
-- 4) Add UNIQUE (room_id) on room_stats

-- Use a transaction (Supabase migrations run in a transaction by default)

-- Step 1: Deduplicate rooms per listing_id keeping the most recently updated
CREATE TEMP TABLE _rooms_to_delete ON COMMIT DROP AS
SELECT id
FROM (
  SELECT r.id,
         r.listing_id,
         ROW_NUMBER() OVER (
           PARTITION BY r.listing_id
           ORDER BY r.updated_at DESC NULLS LAST, r.created_at DESC NULLS LAST, r.id DESC
         ) AS rn
  FROM public.rooms r
) x
WHERE x.rn > 1;

-- Remove dependent rows first (in case there are no FKs)
DELETE FROM public.room_photos rp WHERE rp.room_id IN (SELECT id FROM _rooms_to_delete);
DELETE FROM public.room_amenities ra WHERE ra.room_id IN (SELECT id FROM _rooms_to_delete);
DELETE FROM public.room_stats rs WHERE rs.room_id IN (SELECT id FROM _rooms_to_delete);

-- Now delete the duplicate rooms
DELETE FROM public.rooms r WHERE r.id IN (SELECT id FROM _rooms_to_delete);

-- Step 2: Ensure unique room per listing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'rooms_listing_id_key'
      AND conrelid = 'public.rooms'::regclass
  ) THEN
    ALTER TABLE public.rooms
    ADD CONSTRAINT rooms_listing_id_key UNIQUE (listing_id);
    COMMENT ON CONSTRAINT rooms_listing_id_key ON public.rooms IS
      'Each listing can have only one room record; required for ON CONFLICT (listing_id).';
  END IF;
END$$;

-- Step 3: Deduplicate room_stats per room_id keeping the most recently updated
CREATE TEMP TABLE _room_stats_to_delete ON COMMIT DROP AS
SELECT id
FROM (
  SELECT rs.id,
         rs.room_id,
         ROW_NUMBER() OVER (
           PARTITION BY rs.room_id
           ORDER BY rs.updated_at DESC NULLS LAST, rs.created_at DESC NULLS LAST, rs.id DESC
         ) AS rn
  FROM public.room_stats rs
) y
WHERE y.rn > 1;

DELETE FROM public.room_stats rs WHERE rs.id IN (SELECT id FROM _room_stats_to_delete);

-- Step 4: Add unique constraint on room_stats.room_id for ON CONFLICT (room_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'room_stats_room_id_key'
      AND conrelid = 'public.room_stats'::regclass
  ) THEN
    ALTER TABLE public.room_stats
    ADD CONSTRAINT room_stats_room_id_key UNIQUE (room_id);
    COMMENT ON CONSTRAINT room_stats_room_id_key ON public.room_stats IS
      'Enforces one stats row per room; required for ON CONFLICT (room_id).';
  END IF;
END$$;