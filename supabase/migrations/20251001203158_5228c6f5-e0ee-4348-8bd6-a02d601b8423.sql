
-- Phase 2: Photo Consistency - Database Migration

-- 1. Create listing_photos table for proper photo storage
CREATE TABLE IF NOT EXISTS public.listing_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listing_photos
CREATE POLICY "Photos viewable for published listings"
  ON public.listing_photos FOR SELECT
  USING (
    listing_id IN (
      SELECT id FROM public.listings WHERE status = 'published'
    )
  );

CREATE POLICY "Users can manage photos for their listings"
  ON public.listing_photos FOR ALL
  USING (
    listing_id IN (
      SELECT l.id FROM public.listings l
      JOIN public.profiles p ON l.owner_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_listing_photos_listing_id ON public.listing_photos(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_photos_sort_order ON public.listing_photos(sort_order);
CREATE INDEX IF NOT EXISTS idx_listing_photos_is_cover ON public.listing_photos(is_cover);

-- Add cover_photo_id to listings table
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS cover_photo_id UUID REFERENCES public.listing_photos(id);

-- Create function to ensure only one cover photo per listing
CREATE OR REPLACE FUNCTION public.ensure_single_cover_photo()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_cover = true THEN
    -- Set all other photos for this listing to not be cover
    UPDATE public.listing_photos
    SET is_cover = false
    WHERE listing_id = NEW.listing_id
      AND id != NEW.id
      AND is_cover = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for cover photo enforcement
DROP TRIGGER IF EXISTS trigger_ensure_single_cover_photo ON public.listing_photos;
CREATE TRIGGER trigger_ensure_single_cover_photo
  BEFORE INSERT OR UPDATE ON public.listing_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_cover_photo();

-- Update room_search_cache to include proper photo URLs
DROP MATERIALIZED VIEW IF EXISTS public.room_search_cache;
CREATE MATERIALIZED VIEW public.room_search_cache AS
SELECT
  r.id AS room_id,
  r.slug,
  l.id AS listing_id,
  l.title,
  l.city,
  l.neighborhood,
  l.price_month,
  l.availability_date,
  l.lat,
  l.lng,
  l.flatmates_count,
  l.couples_accepted,
  l.pets_allowed,
  l.smoking_allowed,
  l.bills_included,
  p.kyc_status,
  p.lister_type,
  -- Get cover photo or first photo
  COALESCE(
    (SELECT url FROM public.listing_photos 
     WHERE listing_id = l.id AND is_cover = true 
     ORDER BY sort_order LIMIT 1),
    (SELECT url FROM public.listing_photos 
     WHERE listing_id = l.id 
     ORDER BY sort_order LIMIT 1)
  ) AS cover_photo_url,
  -- Amenity keys array
  ARRAY(
    SELECT a.key 
    FROM public.listing_amenities la
    JOIN public.amenities a ON la.amenity_id = a.id
    WHERE la.listing_id = l.id AND a.is_active
  ) AS amenity_keys
FROM public.rooms r
JOIN public.listings l ON r.listing_id = l.id
JOIN public.profiles p ON l.owner_id = p.id
WHERE l.status = 'published';

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_room_search_cache_room_id ON public.room_search_cache(room_id);
CREATE INDEX IF NOT EXISTS idx_room_search_cache_city ON public.room_search_cache(city);
CREATE INDEX IF NOT EXISTS idx_room_search_cache_price ON public.room_search_cache(price_month);
CREATE INDEX IF NOT EXISTS idx_room_search_cache_availability ON public.room_search_cache(availability_date);

-- Function to refresh the cache
CREATE OR REPLACE FUNCTION public.refresh_room_search_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.room_search_cache;
END;
$$;

-- Trigger to refresh cache when photos change
CREATE OR REPLACE FUNCTION public.notify_search_cache_refresh()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM pg_notify('search_cache_refresh', '1');
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_listing_photos_cache_refresh ON public.listing_photos;
CREATE TRIGGER trigger_listing_photos_cache_refresh
  AFTER INSERT OR UPDATE OR DELETE ON public.listing_photos
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.notify_search_cache_refresh();
