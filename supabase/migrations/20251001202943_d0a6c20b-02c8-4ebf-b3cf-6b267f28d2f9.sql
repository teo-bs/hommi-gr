
-- Phase 1: Fix Request-to-Chat - Database & RLS

-- 1. Enable RLS on threads and messages if not already enabled
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_threads_listing_id ON public.threads(listing_id);
CREATE INDEX IF NOT EXISTS idx_threads_host_id ON public.threads(host_id);
CREATE INDEX IF NOT EXISTS idx_threads_seeker_id ON public.threads(seeker_id);
CREATE INDEX IF NOT EXISTS idx_threads_status ON public.threads(status);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- 3. Add unread_count tracking to threads
ALTER TABLE public.threads ADD COLUMN IF NOT EXISTS unread_count_host INTEGER DEFAULT 0;
ALTER TABLE public.threads ADD COLUMN IF NOT EXISTS unread_count_seeker INTEGER DEFAULT 0;
ALTER TABLE public.threads ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP WITH TIME ZONE;

-- 4. Enable realtime for threads and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.threads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 5. Create function to update last_message_at and unread counts
CREATE OR REPLACE FUNCTION public.update_thread_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  thread_record public.threads%ROWTYPE;
BEGIN
  -- Get the thread
  SELECT * INTO thread_record FROM public.threads WHERE id = NEW.thread_id;
  
  -- Update last_message_at
  UPDATE public.threads 
  SET last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;
  
  -- Increment unread count for the recipient
  IF NEW.sender_id = thread_record.host_id THEN
    -- Host sent message, increment seeker's unread count
    UPDATE public.threads 
    SET unread_count_seeker = unread_count_seeker + 1
    WHERE id = NEW.thread_id;
  ELSE
    -- Seeker sent message, increment host's unread count
    UPDATE public.threads 
    SET unread_count_host = unread_count_host + 1
    WHERE id = NEW.thread_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Create trigger for updating thread on message
DROP TRIGGER IF EXISTS trigger_update_thread_on_message ON public.messages;
CREATE TRIGGER trigger_update_thread_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_thread_on_message();

-- 7. Create function to reset unread count
CREATE OR REPLACE FUNCTION public.reset_unread_count(p_thread_id UUID, p_user_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_role = 'host' THEN
    UPDATE public.threads 
    SET unread_count_host = 0
    WHERE id = p_thread_id;
  ELSE
    UPDATE public.threads 
    SET unread_count_seeker = 0
    WHERE id = p_thread_id;
  END IF;
END;
$$;
