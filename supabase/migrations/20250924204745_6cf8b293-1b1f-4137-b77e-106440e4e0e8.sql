-- Enhanced User Profiles, Listings & Verification System Migration

-- Phase 1: Create Enums
CREATE TYPE public.user_role_enum AS ENUM ('tenant', 'lister');
CREATE TYPE public.verification_kind_enum AS ENUM ('email', 'phone', 'govgr', 'google', 'facebook');
CREATE TYPE public.verification_status_enum AS ENUM ('unverified', 'pending', 'verified');
CREATE TYPE public.publish_status_enum AS ENUM ('draft', 'published');
CREATE TYPE public.gender_enum AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- Phase 2: Add Profile Columns
ALTER TABLE public.profiles 
ADD COLUMN gender public.gender_enum,
ADD COLUMN date_of_birth date,
ADD COLUMN country text DEFAULT 'GR',
ADD COLUMN social_instagram text,
ADD COLUMN social_tiktok text,
ADD COLUMN social_twitter_x text,
ADD COLUMN social_linkedin text,
ADD COLUMN about_me text,
ADD COLUMN profile_completion_pct integer DEFAULT 0 CHECK (profile_completion_pct >= 0 AND profile_completion_pct <= 100),
ADD COLUMN user_role public.user_role_enum DEFAULT 'tenant',
ADD COLUMN terms_accepted_at timestamptz,
ADD COLUMN marketing_opt_in boolean DEFAULT false,
ADD COLUMN google_connected boolean DEFAULT false,
ADD COLUMN facebook_connected boolean DEFAULT false;

-- Update existing role column to use enum (with data migration)
ALTER TABLE public.profiles ADD COLUMN new_role public.user_role_enum;
UPDATE public.profiles SET new_role = 
  CASE 
    WHEN role = 'seeker' THEN 'tenant'::public.user_role_enum
    WHEN role = 'lister' THEN 'lister'::public.user_role_enum
    ELSE 'tenant'::public.user_role_enum
  END;
ALTER TABLE public.profiles DROP COLUMN role;
ALTER TABLE public.profiles RENAME COLUMN new_role TO role;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'tenant'::public.user_role_enum;
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;

-- Phase 3a: Drop policies that depend on listings.status
DROP POLICY IF EXISTS "Published listings are viewable by everyone" ON public.listings;
DROP POLICY IF EXISTS "Published rooms are viewable by everyone" ON public.rooms;
DROP POLICY IF EXISTS "Room photos are viewable for published rooms" ON public.room_photos;
DROP POLICY IF EXISTS "Room amenities are viewable for published rooms" ON public.room_amenities;
DROP POLICY IF EXISTS "Room stats are viewable for published rooms" ON public.room_stats;

-- Phase 3b: Enhanced Listings Structure
ALTER TABLE public.listings
ADD COLUMN street_address text,
ADD COLUMN floor integer,
ADD COLUMN door text,
ADD COLUMN lat decimal(10,8),
ADD COLUMN lng decimal(11,8),
ADD COLUMN is_location_approx boolean DEFAULT true,
ADD COLUMN property_size_m2 integer,
ADD COLUMN room_size_m2 integer,
ADD COLUMN deposit integer,
ADD COLUMN price_per_m2 decimal(10,2),
ADD COLUMN services text[] DEFAULT '{}',
ADD COLUMN house_rules text[] DEFAULT '{}',
ADD COLUMN audience_preferences jsonb DEFAULT '{}',
ADD COLUMN publish_status public.publish_status_enum DEFAULT 'draft',
ADD COLUMN publish_warnings jsonb DEFAULT '{}';

-- Update existing status column to use enum
ALTER TABLE public.listings ADD COLUMN new_status public.publish_status_enum;
UPDATE public.listings SET new_status = 
  CASE 
    WHEN status = 'published' THEN 'published'::public.publish_status_enum
    ELSE 'draft'::public.publish_status_enum
  END;
ALTER TABLE public.listings DROP COLUMN status;
ALTER TABLE public.listings RENAME COLUMN new_status TO status;
ALTER TABLE public.listings ALTER COLUMN status SET DEFAULT 'draft'::public.publish_status_enum;
ALTER TABLE public.listings ALTER COLUMN status SET NOT NULL;

-- Phase 3c: Recreate the RLS policies with new enum column
CREATE POLICY "Published listings are viewable by everyone" 
ON public.listings FOR SELECT
USING ((status = 'published'::public.publish_status_enum) OR (auth.uid() IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.id = listings.owner_id))));

CREATE POLICY "Published rooms are viewable by everyone" 
ON public.rooms FOR SELECT
USING (listing_id IN ( SELECT listings.id
   FROM listings
  WHERE (listings.status = 'published'::public.publish_status_enum)));

CREATE POLICY "Room photos are viewable for published rooms" 
ON public.room_photos FOR SELECT
USING (room_id IN ( SELECT r.id
   FROM (rooms r
     JOIN listings l ON ((r.listing_id = l.id)))
  WHERE (l.status = 'published'::public.publish_status_enum)));

CREATE POLICY "Room amenities are viewable for published rooms" 
ON public.room_amenities FOR SELECT
USING (room_id IN ( SELECT r.id
   FROM (rooms r
     JOIN listings l ON ((r.listing_id = l.id)))
  WHERE (l.status = 'published'::public.publish_status_enum)));

CREATE POLICY "Room stats are viewable for published rooms" 
ON public.room_stats FOR SELECT
USING (room_id IN ( SELECT r.id
   FROM (rooms r
     JOIN listings l ON ((r.listing_id = l.id)))
  WHERE (l.status = 'published'::public.publish_status_enum)));

-- Migrate geo jsonb to lat/lng columns
UPDATE public.listings 
SET 
  lat = CAST(geo->>'lat' AS decimal(10,8)),
  lng = CAST(geo->>'lng' AS decimal(11,8))
WHERE geo IS NOT NULL 
  AND geo->>'lat' IS NOT NULL 
  AND geo->>'lng' IS NOT NULL;

-- Phase 4: Create New Tables

-- Verifications table
CREATE TABLE public.verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  kind public.verification_kind_enum NOT NULL,
  status public.verification_status_enum DEFAULT 'unverified' NOT NULL,
  value text,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on verifications
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for verifications
CREATE POLICY "Users can view their own verifications"
ON public.verifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own verifications"
ON public.verifications FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own verifications"
ON public.verifications FOR UPDATE
USING (user_id = auth.uid());

-- Onboarding progress table
CREATE TABLE public.onboarding_progress (
  user_id uuid NOT NULL PRIMARY KEY,
  role public.user_role_enum NOT NULL,
  current_step integer DEFAULT 1 NOT NULL,
  completed_steps integer[] DEFAULT '{}' NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on onboarding_progress
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for onboarding_progress
CREATE POLICY "Users can view their own onboarding progress"
ON public.onboarding_progress FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own onboarding progress"
ON public.onboarding_progress FOR ALL
USING (user_id = auth.uid());

-- Phase 5: Add Computed Fields & Functions

-- Function to calculate price per m2
CREATE OR REPLACE FUNCTION public.update_price_per_m2()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.property_size_m2 IS NOT NULL AND NEW.property_size_m2 > 0 THEN
    NEW.price_per_m2 = NEW.price_month::decimal / NEW.property_size_m2;
  ELSE
    NEW.price_per_m2 = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update price_per_m2 automatically
CREATE TRIGGER update_listings_price_per_m2
  BEFORE INSERT OR UPDATE OF price_month, property_size_m2
  ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_price_per_m2();

-- Function to update profile completion percentage
CREATE OR REPLACE FUNCTION public.calculate_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
  completion_score integer := 0;
  total_fields integer := 15; -- Total weighted fields
BEGIN
  -- Basic fields (required)
  IF NEW.display_name IS NOT NULL THEN completion_score := completion_score + 2; END IF;
  IF NEW.avatar_url IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.profession IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.about_me IS NOT NULL THEN completion_score := completion_score + 2; END IF;
  
  -- Demographics
  IF NEW.gender IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.date_of_birth IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  IF NEW.country IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  
  -- Social media (any one counts)
  IF NEW.social_instagram IS NOT NULL OR 
     NEW.social_tiktok IS NOT NULL OR 
     NEW.social_twitter_x IS NOT NULL OR 
     NEW.social_linkedin IS NOT NULL THEN 
    completion_score := completion_score + 1; 
  END IF;
  
  -- Languages (default is provided)
  IF array_length(NEW.languages, 1) > 0 THEN completion_score := completion_score + 1; END IF;
  
  -- Verification status (check if any verifications exist)
  IF EXISTS(SELECT 1 FROM public.verifications WHERE user_id = NEW.user_id AND status = 'verified') THEN
    completion_score := completion_score + 3;
  END IF;
  
  -- Terms acceptance
  IF NEW.terms_accepted_at IS NOT NULL THEN completion_score := completion_score + 1; END IF;
  
  NEW.profile_completion_pct := ROUND((completion_score::decimal / total_fields) * 100);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile completion percentage
CREATE TRIGGER update_profile_completion
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_profile_completion();

-- Phase 6: Add Indexes for Performance
CREATE INDEX idx_verifications_user_id ON public.verifications(user_id);
CREATE INDEX idx_verifications_kind_status ON public.verifications(kind, status);
CREATE INDEX idx_listings_location ON public.listings(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX idx_listings_publish_status ON public.listings(status);
CREATE INDEX idx_listings_price_range ON public.listings(price_month) WHERE status = 'published';
CREATE INDEX idx_profiles_user_role ON public.profiles(user_role);
CREATE INDEX idx_profiles_completion ON public.profiles(profile_completion_pct);

-- Add constraints
ALTER TABLE public.listings ADD CONSTRAINT check_price_positive CHECK (price_month > 0);
ALTER TABLE public.listings ADD CONSTRAINT check_deposit_non_negative CHECK (deposit >= 0);
ALTER TABLE public.listings ADD CONSTRAINT check_room_size_positive CHECK (room_size_m2 > 0);
ALTER TABLE public.listings ADD CONSTRAINT check_property_size_positive CHECK (property_size_m2 > 0);
ALTER TABLE public.profiles ADD CONSTRAINT check_age_reasonable CHECK (date_of_birth IS NULL OR date_of_birth > '1900-01-01' AND date_of_birth < CURRENT_DATE);

-- Update updated_at trigger for new tables
CREATE TRIGGER update_verifications_updated_at
  BEFORE UPDATE ON public.verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_progress_updated_at
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();