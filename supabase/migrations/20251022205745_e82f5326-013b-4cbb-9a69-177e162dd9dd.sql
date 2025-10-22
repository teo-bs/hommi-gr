-- Enable RLS on junction tables that contain user-related data
-- These tables link listings to their amenities and house rules

-- Enable RLS on listing_amenities
ALTER TABLE public.listing_amenities ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view amenities for published listings
CREATE POLICY "Public can view amenities for published listings"
ON public.listing_amenities FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_amenities.listing_id
    AND l.status = 'published'::publish_status_enum
    AND l.deleted_at IS NULL
  )
);

-- Policy: Owners can manage their listing amenities
CREATE POLICY "Owners can manage their listing amenities"
ON public.listing_amenities FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_amenities.listing_id
    AND l.owner_id = current_profile_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_amenities.listing_id
    AND l.owner_id = current_profile_id()
  )
);

-- Policy: Admins can manage all listing amenities
CREATE POLICY "Admins can manage all listing amenities"
ON public.listing_amenities FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable RLS on listing_house_rules
ALTER TABLE public.listing_house_rules ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view house rules for published listings
CREATE POLICY "Public can view house rules for published listings"
ON public.listing_house_rules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_house_rules.listing_id
    AND l.status = 'published'::publish_status_enum
    AND l.deleted_at IS NULL
  )
);

-- Policy: Owners can manage their listing house rules
CREATE POLICY "Owners can manage their listing house rules"
ON public.listing_house_rules FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_house_rules.listing_id
    AND l.owner_id = current_profile_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = listing_house_rules.listing_id
    AND l.owner_id = current_profile_id()
  )
);

-- Policy: Admins can manage all listing house rules
CREATE POLICY "Admins can manage all listing house rules"
ON public.listing_house_rules FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));