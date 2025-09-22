-- Create rooms table (extends listings with room-specific data)
CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id uuid NOT NULL,
  slug text NOT NULL UNIQUE,
  room_type text NOT NULL DEFAULT 'private',
  room_size_m2 integer,
  is_interior boolean DEFAULT true,
  has_bed boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create listers table (extends profiles for listing owners)
CREATE TABLE public.listers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL,
  score integer DEFAULT 0,
  badges jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create room_photos table 
CREATE TABLE public.room_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL,
  url text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Create amenities table
CREATE TABLE public.amenities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL DEFAULT 'property', -- 'property' or 'room'
  created_at timestamp with time zone DEFAULT now()
);

-- Create room_amenities junction table
CREATE TABLE public.room_amenities (
  room_id uuid NOT NULL,
  amenity_id uuid NOT NULL,
  PRIMARY KEY (room_id, amenity_id)
);

-- Create room_stats table for tracking views, requests etc
CREATE TABLE public.room_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL UNIQUE,
  view_count integer DEFAULT 0,
  request_count integer DEFAULT 0,
  last_viewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms (public read for published rooms)
CREATE POLICY "Published rooms are viewable by everyone"
ON public.rooms FOR SELECT
USING (
  listing_id IN (
    SELECT id FROM public.listings WHERE status = 'published'
  )
);

CREATE POLICY "Users can create rooms for their listings"
ON public.rooms FOR INSERT
WITH CHECK (
  listing_id IN (
    SELECT l.id FROM public.listings l
    JOIN public.profiles p ON l.owner_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own rooms"
ON public.rooms FOR UPDATE
USING (
  listing_id IN (
    SELECT l.id FROM public.listings l
    JOIN public.profiles p ON l.owner_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- RLS Policies for listers (public read)
CREATE POLICY "Listers are viewable by everyone"
ON public.listers FOR SELECT
USING (true);

CREATE POLICY "Users can create their lister profile"
ON public.listers FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their lister profile"
ON public.listers FOR UPDATE
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- RLS Policies for room_photos (public read for published rooms)
CREATE POLICY "Room photos are viewable for published rooms"
ON public.room_photos FOR SELECT
USING (
  room_id IN (
    SELECT r.id FROM public.rooms r
    JOIN public.listings l ON r.listing_id = l.id
    WHERE l.status = 'published'
  )
);

CREATE POLICY "Users can manage photos for their rooms"
ON public.room_photos FOR ALL
USING (
  room_id IN (
    SELECT r.id FROM public.rooms r
    JOIN public.listings l ON r.listing_id = l.id
    JOIN public.profiles p ON l.owner_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- RLS Policies for amenities (public read, admin write)
CREATE POLICY "Amenities are viewable by everyone"
ON public.amenities FOR SELECT
USING (true);

-- RLS Policies for room_amenities (public read for published rooms)
CREATE POLICY "Room amenities are viewable for published rooms"
ON public.room_amenities FOR SELECT
USING (
  room_id IN (
    SELECT r.id FROM public.rooms r
    JOIN public.listings l ON r.listing_id = l.id
    WHERE l.status = 'published'
  )
);

CREATE POLICY "Users can manage amenities for their rooms"
ON public.room_amenities FOR ALL
USING (
  room_id IN (
    SELECT r.id FROM public.rooms r
    JOIN public.listings l ON r.listing_id = l.id
    JOIN public.profiles p ON l.owner_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

-- RLS Policies for room_stats (public read for published rooms)
CREATE POLICY "Room stats are viewable for published rooms"
ON public.room_stats FOR SELECT
USING (
  room_id IN (
    SELECT r.id FROM public.rooms r
    JOIN public.listings l ON r.listing_id = l.id
    WHERE l.status = 'published'
  )
);

CREATE POLICY "System can update room stats"
ON public.room_stats FOR ALL
USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listers_updated_at
BEFORE UPDATE ON public.listers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_room_stats_updated_at
BEFORE UPDATE ON public.room_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment room views
CREATE OR REPLACE FUNCTION public.increment_room_views(rid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.room_stats (room_id, view_count, last_viewed_at)
  VALUES (rid, 1, now())
  ON CONFLICT (room_id) 
  DO UPDATE SET 
    view_count = public.room_stats.view_count + 1,
    last_viewed_at = now(),
    updated_at = now();
END;
$$;

-- Insert sample amenities
INSERT INTO public.amenities (name, icon, category) VALUES
('WiFi', 'wifi', 'property'),
('Κλιματισμός', 'snowflake', 'property'),
('Θέρμανση', 'flame', 'property'),
('Ασανσέρ', 'arrow-up-circle', 'property'),
('Μπαλκόνι', 'sun', 'property'),
('Πλυντήριο', 'washing-machine', 'property'),
('Πλυντήριο πιάτων', 'utensils', 'property'),
('Τηλεόραση', 'tv', 'property'),
('Κρεβάτι', 'bed', 'room'),
('Γραφείο', 'desk', 'room'),
('Ντουλάπα', 'cabinet', 'room'),
('Παράθυρο', 'window', 'room'),
('Κλειδαριά', 'lock', 'room');