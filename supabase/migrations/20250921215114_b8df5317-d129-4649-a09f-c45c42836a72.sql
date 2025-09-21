-- Create profiles table with role and trust fields
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'seeker' CHECK (role IN ('seeker', 'host', 'agency')),
  can_switch_roles boolean DEFAULT true,
  kyc_status text DEFAULT 'none' CHECK (kyc_status IN ('none', 'pending', 'verified')),
  member_since date DEFAULT CURRENT_DATE,
  verifications_json jsonb DEFAULT '{}',
  languages text[] DEFAULT ARRAY['el'],
  profession text,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create listings table
CREATE TABLE public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  city text NOT NULL,
  neighborhood text,
  geo jsonb, -- {lat, lng, address}
  listed_space text CHECK (listed_space IN ('room', 'whole')),
  price_month integer NOT NULL,
  bills_note text,
  availability_date date,
  flatmates_count integer DEFAULT 0,
  couples_accepted boolean DEFAULT false,
  pets_allowed boolean DEFAULT false,
  smoking_allowed boolean DEFAULT false,
  amenities_property jsonb DEFAULT '[]',
  amenities_room jsonb DEFAULT '[]',
  photos jsonb DEFAULT '[]',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Listings policies
CREATE POLICY "Published listings are viewable by everyone" 
ON public.listings FOR SELECT 
USING (status = 'published' OR auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = owner_id));

CREATE POLICY "Users can create their own listings" 
ON public.listings FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = owner_id));

CREATE POLICY "Users can update their own listings" 
ON public.listings FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = owner_id));

-- Create applications table
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  match_score integer DEFAULT 0,
  why_json jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, seeker_id)
);

-- Enable RLS on applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Applications policies
CREATE POLICY "Users can view applications for their listings or their own applications" 
ON public.applications FOR SELECT 
USING (
  auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = seeker_id) OR
  auth.uid() IN (SELECT user_id FROM public.profiles p JOIN public.listings l ON p.id = l.owner_id WHERE l.id = listing_id)
);

CREATE POLICY "Users can create applications" 
ON public.applications FOR INSERT 
WITH CHECK (auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = seeker_id));

CREATE POLICY "Listing owners can update applications" 
ON public.applications FOR UPDATE 
USING (auth.uid() IN (SELECT user_id FROM public.profiles p JOIN public.listings l ON p.id = l.owner_id WHERE l.id = listing_id));

-- Create threads table for chat
CREATE TABLE public.threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(listing_id, seeker_id)
);

-- Enable RLS on threads
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;

-- Threads policies
CREATE POLICY "Users can view their own threads" 
ON public.threads FOR SELECT 
USING (
  auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = host_id) OR
  auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = seeker_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view messages in their threads" 
ON public.messages FOR SELECT 
USING (
  thread_id IN (
    SELECT t.id FROM public.threads t 
    JOIN public.profiles p ON (p.id = t.host_id OR p.id = t.seeker_id)
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in their threads" 
ON public.messages FOR INSERT 
WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = sender_id) AND
  thread_id IN (
    SELECT t.id FROM public.threads t 
    JOIN public.profiles p ON (p.id = t.host_id OR p.id = t.seeker_id)
    WHERE p.user_id = auth.uid()
  )
);

-- Create holds table for Stripe payments
CREATE TABLE public.holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text DEFAULT 'EUR',
  status text DEFAULT 'created' CHECK (status IN ('created', 'held', 'released', 'canceled')),
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  released_at timestamptz
);

-- Enable RLS on holds
ALTER TABLE public.holds ENABLE ROW LEVEL SECURITY;

-- Holds policies
CREATE POLICY "Users can view their own holds" 
ON public.holds FOR SELECT 
USING (
  auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = seeker_id) OR
  auth.uid() IN (SELECT user_id FROM public.profiles p JOIN public.listings l ON p.id = l.owner_id WHERE l.id = listing_id)
);

-- Create reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(reviewer_id, reviewee_id)
);

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT 
USING (true);

-- Create references table
CREATE TABLE public.references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on references
ALTER TABLE public.references ENABLE ROW LEVEL SECURITY;

-- References policies
CREATE POLICY "References are viewable by everyone" 
ON public.references FOR SELECT 
USING (true);

-- Create viewings table
CREATE TABLE public.viewings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  proposed_date timestamptz,
  status text DEFAULT 'proposed' CHECK (status IN ('proposed', 'confirmed', 'completed', 'canceled')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on viewings
ALTER TABLE public.viewings ENABLE ROW LEVEL SECURITY;

-- Viewings policies
CREATE POLICY "Users can view their own viewings" 
ON public.viewings FOR SELECT 
USING (
  auth.uid() IN (SELECT user_id FROM public.profiles WHERE id = seeker_id) OR
  auth.uid() IN (SELECT user_id FROM public.profiles p JOIN public.listings l ON p.id = l.owner_id WHERE l.id = listing_id)
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();