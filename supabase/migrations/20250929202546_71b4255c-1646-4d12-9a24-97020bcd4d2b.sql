-- Add required_verifications column to listings table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS required_verifications text[] DEFAULT '{}';

COMMENT ON COLUMN listings.required_verifications IS 'Array of verification types required from seekers: phone, email, id';