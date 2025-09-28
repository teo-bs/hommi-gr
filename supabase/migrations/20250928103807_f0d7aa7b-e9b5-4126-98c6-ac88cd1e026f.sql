-- Add archived status to publish_status_enum
ALTER TYPE publish_status_enum ADD VALUE 'archived';

-- Add missing RLS policies for listing_amenities table
CREATE POLICY "Users can view listing amenities for published listings or their own" 
ON public.listing_amenities 
FOR SELECT 
USING (
  listing_id IN (
    SELECT id FROM public.listings 
    WHERE status = 'published'
  ) 
  OR listing_id IN (
    SELECT l.id FROM public.listings l
    JOIN public.profiles p ON l.owner_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage amenities for their own listings" 
ON public.listing_amenities 
FOR ALL 
USING (
  listing_id IN (
    SELECT l.id FROM public.listings l
    JOIN public.profiles p ON l.owner_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- Add missing RLS policies for room_amenities table
CREATE POLICY "Users can view room amenities for published rooms or their own" 
ON public.room_amenities 
FOR SELECT 
USING (
  room_id IN (
    SELECT r.id FROM public.rooms r
    JOIN public.listings l ON r.listing_id = l.id
    WHERE l.status = 'published'
  )
  OR room_id IN (
    SELECT r.id FROM public.rooms r
    JOIN public.listings l ON r.listing_id = l.id
    JOIN public.profiles p ON l.owner_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage amenities for their own rooms" 
ON public.room_amenities 
FOR ALL 
USING (
  room_id IN (
    SELECT r.id FROM public.rooms r
    JOIN public.listings l ON r.listing_id = l.id
    JOIN public.profiles p ON l.owner_id = p.id
    WHERE p.user_id = auth.uid()
  )
);