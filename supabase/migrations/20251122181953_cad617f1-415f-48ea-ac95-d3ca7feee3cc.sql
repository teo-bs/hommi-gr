-- Drop the old 2-parameter version of publish_listing_atomic that doesn't set published_at
-- This was causing the check_published_at constraint violation
DROP FUNCTION IF EXISTS public.publish_listing_atomic(uuid, text);

-- The correct 1-parameter version already exists and properly sets published_at
-- It uses: published_at = COALESCE(published_at, now())