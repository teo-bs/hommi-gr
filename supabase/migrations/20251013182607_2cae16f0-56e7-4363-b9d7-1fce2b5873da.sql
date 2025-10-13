-- Fix verification-documents bucket visibility
UPDATE storage.buckets 
SET public = true 
WHERE id = 'verification-documents';

-- Comment: This makes verification documents viewable in admin panel while still being protected by RLS policies