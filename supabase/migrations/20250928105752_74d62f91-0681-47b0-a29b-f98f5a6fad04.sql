-- Add new address fields to listings table
ALTER TABLE public.listings 
ADD COLUMN region text,
ADD COLUMN postcode text,
ADD COLUMN country text DEFAULT 'Greece',
ADD COLUMN street text,
ADD COLUMN street_number text,
ADD COLUMN formatted_address text;

-- Add comment explaining the new fields
COMMENT ON COLUMN public.listings.region IS 'Region/prefecture from Mapbox geocoding';
COMMENT ON COLUMN public.listings.postcode IS 'Postal code from Mapbox geocoding';
COMMENT ON COLUMN public.listings.country IS 'Country from Mapbox geocoding, defaults to Greece';
COMMENT ON COLUMN public.listings.street IS 'Street name from Mapbox geocoding';
COMMENT ON COLUMN public.listings.street_number IS 'Street number from Mapbox geocoding';
COMMENT ON COLUMN public.listings.formatted_address IS 'Full formatted address from Mapbox';