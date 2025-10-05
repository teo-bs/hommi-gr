-- Enable CDN caching for listing-photos bucket
UPDATE storage.buckets
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'listing-photos';

-- Note: Cache-Control headers are set at the CDN/proxy level in Supabase
-- The bucket is now public which enables CDN caching automatically
-- Supabase will serve files with appropriate cache headers