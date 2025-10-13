-- Admin RLS policies for listings, verifications, and profiles

-- Policy for listings: admins can view and manage all listings (including drafts)
CREATE POLICY "Admins can view all listings"
ON public.listings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all listings"
ON public.listings FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy for verifications: admins can manage all verifications
CREATE POLICY "Admins can view all verifications"
ON public.verifications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all verifications"
ON public.verifications FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policy for profiles: admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Policy for listing_photos: admins can view all listing photos
CREATE POLICY "Admins can view all listing photos"
ON public.listing_photos FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));