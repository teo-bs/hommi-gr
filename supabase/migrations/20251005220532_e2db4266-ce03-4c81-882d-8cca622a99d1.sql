-- Create broken_photos_log table to track broken photo URLs
CREATE TABLE IF NOT EXISTS public.broken_photos_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  lister_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint to prevent duplicate logging
CREATE UNIQUE INDEX IF NOT EXISTS idx_broken_photos_unique 
  ON public.broken_photos_log(room_id, photo_url);

-- Create index for fast lister queries
CREATE INDEX IF NOT EXISTS idx_broken_photos_lister 
  ON public.broken_photos_log(lister_id);

-- Enable RLS
ALTER TABLE public.broken_photos_log ENABLE ROW LEVEL SECURITY;

-- Users can view broken photos for their own listings
CREATE POLICY "Listers can view broken photos for their listings"
  ON public.broken_photos_log
  FOR SELECT
  USING (
    lister_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- System can insert broken photo logs
CREATE POLICY "Authenticated users can log broken photos"
  ON public.broken_photos_log
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);