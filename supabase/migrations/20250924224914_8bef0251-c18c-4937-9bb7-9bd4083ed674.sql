-- Fix security linter issue: Function Search Path Mutable
DROP FUNCTION IF EXISTS public.update_thread_status(UUID, thread_status_enum);

CREATE OR REPLACE FUNCTION public.update_thread_status(
  thread_id UUID,
  new_status thread_status_enum
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.threads 
  SET 
    status = new_status,
    accepted_at = CASE WHEN new_status = 'accepted' THEN NOW() ELSE accepted_at END,
    declined_at = CASE WHEN new_status = 'declined' THEN NOW() ELSE declined_at END
  WHERE id = thread_id;
END;
$$;