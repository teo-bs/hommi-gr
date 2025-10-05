-- Add thumbnail columns to room_photos table
ALTER TABLE public.room_photos 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS medium_url TEXT,
ADD COLUMN IF NOT EXISTS large_url TEXT;

-- Update storage bucket settings for listing-photos
UPDATE storage.buckets
SET 
  public = true,
  file_size_limit = 10485760, -- 10MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
WHERE id = 'listing-photos';

COMMENT ON COLUMN public.room_photos.thumbnail_url IS 'Thumbnail version (200px max)';
COMMENT ON COLUMN public.room_photos.medium_url IS 'Medium version (800px max)';
COMMENT ON COLUMN public.room_photos.large_url IS 'Large version (1600px max) - same as url for now';