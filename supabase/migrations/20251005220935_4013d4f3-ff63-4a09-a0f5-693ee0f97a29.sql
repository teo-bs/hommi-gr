-- Add resolution tracking to broken_photos_log
ALTER TABLE public.broken_photos_log 
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resolution_action TEXT;

-- Add check constraint for resolution_action values
ALTER TABLE public.broken_photos_log 
DROP CONSTRAINT IF EXISTS broken_photos_log_resolution_action_check;

ALTER TABLE public.broken_photos_log 
ADD CONSTRAINT broken_photos_log_resolution_action_check 
CHECK (resolution_action IN ('replaced', 'deleted', 'fixed_automatically'));

-- Create index for faster queries on unresolved photos
CREATE INDEX IF NOT EXISTS idx_broken_photos_unresolved 
ON public.broken_photos_log(lister_id, resolved_at) 
WHERE resolved_at IS NULL;

COMMENT ON COLUMN public.broken_photos_log.resolved_at IS 'Timestamp when the broken photo was resolved';
COMMENT ON COLUMN public.broken_photos_log.resolution_action IS 'How the photo was resolved: replaced, deleted, or fixed_automatically';