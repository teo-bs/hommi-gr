-- Migration 1: Add flagging columns to listings table
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS flagged_reason TEXT,
  ADD COLUMN IF NOT EXISTS flagged_by UUID REFERENCES auth.users(id);

-- Index for faster queries on flagged listings
CREATE INDEX IF NOT EXISTS idx_listings_flagged ON public.listings(flagged_at) 
WHERE flagged_at IS NOT NULL;

-- Migration 2: Create admin impersonations tracking table
CREATE TABLE IF NOT EXISTS public.admin_impersonations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  reason TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on impersonations table
ALTER TABLE public.admin_impersonations ENABLE ROW LEVEL SECURITY;

-- RLS policies for impersonations
CREATE POLICY "Admins can view impersonation logs"
ON public.admin_impersonations FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert impersonation records"
ON public.admin_impersonations FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Indexes for activity log queries
CREATE INDEX IF NOT EXISTS idx_impersonations_admin ON public.admin_impersonations(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonations_target ON public.admin_impersonations(target_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonations_started ON public.admin_impersonations(started_at DESC);