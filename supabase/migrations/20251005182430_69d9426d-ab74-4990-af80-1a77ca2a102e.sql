-- Phase 1: Add account_status to profiles table
CREATE TYPE account_status_enum AS ENUM ('active', 'pending_qualification', 'suspended');

ALTER TABLE profiles 
ADD COLUMN account_status account_status_enum DEFAULT 'active' NOT NULL;

CREATE INDEX idx_profiles_account_status ON profiles(account_status);

-- Phase 2: Add user_id to agency_leads table
ALTER TABLE agency_leads 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX idx_agency_leads_user_id ON agency_leads(user_id);

ALTER TABLE agency_leads 
ADD CONSTRAINT unique_user_agency_lead UNIQUE (user_id);

-- Phase 3: Update RLS policy for listings to check account_status
DROP POLICY IF EXISTS "Users can create their own listings" ON listings;

CREATE POLICY "Active users can create listings"
ON listings FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE user_id = auth.uid() 
    AND account_status = 'active'::account_status_enum
  )
);