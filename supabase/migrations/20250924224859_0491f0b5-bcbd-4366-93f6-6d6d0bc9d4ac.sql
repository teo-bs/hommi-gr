-- Add thread status enum and update threads table
CREATE TYPE thread_status_enum AS ENUM ('pending', 'accepted', 'declined', 'blocked', 'archived');

-- Add new columns to threads table
ALTER TABLE public.threads 
ADD COLUMN status_new thread_status_enum DEFAULT 'pending',
ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN declined_at TIMESTAMP WITH TIME ZONE NULL;

-- Update existing threads to have 'accepted' status (since they were created before gating)
UPDATE public.threads SET status_new = 'accepted', accepted_at = created_at;

-- Drop old status column and rename new one
ALTER TABLE public.threads DROP COLUMN status;
ALTER TABLE public.threads RENAME COLUMN status_new TO status;

-- Ensure rooms have slugs - update any missing slugs
UPDATE public.rooms 
SET slug = COALESCE(slug, 'room-' || LOWER(REPLACE(id::text, '-', '')))
WHERE slug IS NULL OR slug = '';

-- Add unique constraint on room slug
ALTER TABLE public.rooms ADD CONSTRAINT rooms_slug_unique UNIQUE (slug);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_rooms_slug ON public.rooms(slug);

-- Update RLS policies for threads to include new status
DROP POLICY IF EXISTS "Users can view their own threads" ON public.threads;
CREATE POLICY "Users can view their own threads" 
ON public.threads 
FOR SELECT 
USING ((auth.uid() IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.id = threads.host_id))) OR (auth.uid() IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.id = threads.seeker_id))));

-- Allow users to create threads (for sending requests)
CREATE POLICY "Users can create threads" 
ON public.threads 
FOR INSERT 
WITH CHECK (auth.uid() IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.id = threads.seeker_id)));

-- Allow hosts to update thread status (accept/decline requests)
CREATE POLICY "Hosts can update thread status" 
ON public.threads 
FOR UPDATE 
USING (auth.uid() IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.id = threads.host_id)))
WITH CHECK (auth.uid() IN ( SELECT profiles.user_id
   FROM profiles
  WHERE (profiles.id = threads.host_id)));

-- Create function to handle thread status updates
CREATE OR REPLACE FUNCTION public.update_thread_status(
  thread_id UUID,
  new_status thread_status_enum
) RETURNS VOID AS $$
BEGIN
  UPDATE public.threads 
  SET 
    status = new_status,
    accepted_at = CASE WHEN new_status = 'accepted' THEN NOW() ELSE accepted_at END,
    declined_at = CASE WHEN new_status = 'declined' THEN NOW() ELSE declined_at END
  WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;