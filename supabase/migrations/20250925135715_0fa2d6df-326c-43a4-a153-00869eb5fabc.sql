-- Migration: Create saved_rooms and agency_leads tables
-- Step 1: Create saved_rooms table for user favorites
CREATE TABLE public.saved_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint to prevent duplicate saves
  UNIQUE(user_id, room_id)
);

-- Enable RLS for saved_rooms
ALTER TABLE public.saved_rooms ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_rooms
CREATE POLICY "Users can view their own saved rooms" 
ON public.saved_rooms 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save rooms" 
ON public.saved_rooms 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their own rooms" 
ON public.saved_rooms 
FOR DELETE 
USING (auth.uid() = user_id);

-- Step 2: Create agency_leads table for external agency inquiries
CREATE TABLE public.agency_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Add constraints for data validation
  CONSTRAINT chk_agency_leads_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT chk_agency_leads_status_valid CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed'))
);

-- Enable RLS for agency_leads (admin only access)
ALTER TABLE public.agency_leads ENABLE ROW LEVEL SECURITY;

-- RLS policy - only system/admin can access agency leads
CREATE POLICY "Agency leads are admin only" 
ON public.agency_leads 
FOR ALL 
USING (false); -- Will be updated when admin roles are implemented

-- Step 3: Create performance indexes
-- Index for saved_rooms lookups
CREATE INDEX idx_saved_rooms_user_id ON public.saved_rooms(user_id);
CREATE INDEX idx_saved_rooms_room_id ON public.saved_rooms(room_id);
CREATE INDEX idx_saved_rooms_created_at ON public.saved_rooms(created_at DESC);

-- Index for agency_leads
CREATE INDEX idx_agency_leads_status ON public.agency_leads(status);
CREATE INDEX idx_agency_leads_created_at ON public.agency_leads(created_at DESC);
CREATE INDEX idx_agency_leads_email ON public.agency_leads(email);

-- Step 4: Add trigger for updated_at on agency_leads
CREATE TRIGGER update_agency_leads_updated_at
BEFORE UPDATE ON public.agency_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Step 5: Create function to check if room is saved by user
CREATE OR REPLACE FUNCTION public.is_room_saved_by_user(room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.saved_rooms 
    WHERE room_id = room_uuid AND user_id = user_uuid
  );
$$;

-- Step 6: Create function to get user's saved rooms count
CREATE OR REPLACE FUNCTION public.get_user_saved_rooms_count(user_uuid UUID)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.saved_rooms 
  WHERE user_id = user_uuid;
$$;

-- Step 7: Verification
DO $$
DECLARE 
  saved_rooms_count INTEGER;
  agency_leads_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO saved_rooms_count FROM public.saved_rooms;
  SELECT COUNT(*) INTO agency_leads_count FROM public.agency_leads;
  
  RAISE NOTICE 'Migration completed: saved_rooms table (% records), agency_leads table (% records)', 
    saved_rooms_count, agency_leads_count;
END $$;