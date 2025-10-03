-- Backfill formatted_address from existing address data
UPDATE listings
SET formatted_address = CASE
  WHEN street_address IS NOT NULL AND street_address != '' THEN street_address
  WHEN neighborhood IS NOT NULL AND city IS NOT NULL THEN neighborhood || ', ' || city || ', Greece'
  WHEN city IS NOT NULL THEN city || ', Greece'
  ELSE 'Greece'
END
WHERE formatted_address IS NULL OR formatted_address = '';

-- Create index for better map query performance
CREATE INDEX IF NOT EXISTS idx_listings_geo_bounds ON listings (lat, lng) WHERE status = 'published';