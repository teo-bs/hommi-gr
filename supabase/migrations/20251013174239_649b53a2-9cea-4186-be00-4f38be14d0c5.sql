-- Phase 1: Database & Storage Setup

-- 1.1 Add metadata column to verifications table
ALTER TABLE public.verifications 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 1.2 Create verification-documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 1.3 RLS Policies for verification-documents bucket
CREATE POLICY "Users can upload own verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all verification documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete verification documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-documents' 
  AND public.has_role(auth.uid(), 'admin')
);

-- 1.4 Create verification_otps table for future SMS integration
CREATE TABLE IF NOT EXISTS public.verification_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  attempts INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_verification_otps_user_phone ON public.verification_otps(user_id, phone);
CREATE INDEX IF NOT EXISTS idx_verification_otps_expires ON public.verification_otps(expires_at);

-- RLS for verification_otps
ALTER TABLE public.verification_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own OTPs"
ON public.verification_otps FOR SELECT
TO authenticated
USING (user_id = auth.uid());