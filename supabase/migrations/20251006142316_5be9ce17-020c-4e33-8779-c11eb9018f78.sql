-- Add bills_included array to listings table for structured bill data
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS bills_included TEXT[] DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN public.listings.bills_included IS 
  'Array of bill types included in rent: electricity, water, internet, heating, municipal_fees';