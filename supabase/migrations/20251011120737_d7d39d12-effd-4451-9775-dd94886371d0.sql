-- Fix published_at for existing published listings
UPDATE listings 
SET published_at = now() 
WHERE status = 'published' AND published_at IS NULL;