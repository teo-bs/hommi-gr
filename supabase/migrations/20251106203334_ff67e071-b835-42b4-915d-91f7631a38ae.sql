-- Create blocked_users table
CREATE TABLE public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id),
  CHECK (user_id != blocked_user_id)
);

-- Create reported_messages table
CREATE TABLE public.reported_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  admin_notes TEXT
);

-- Create reported_threads table
CREATE TABLE public.reported_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id),
  admin_notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_blocked_users_user_id ON public.blocked_users(user_id);
CREATE INDEX idx_blocked_users_blocked_user_id ON public.blocked_users(blocked_user_id);
CREATE INDEX idx_reported_messages_status ON public.reported_messages(status);
CREATE INDEX idx_reported_messages_created_at ON public.reported_messages(created_at DESC);
CREATE INDEX idx_reported_threads_status ON public.reported_threads(status);
CREATE INDEX idx_reported_threads_created_at ON public.reported_threads(created_at DESC);

-- RLS Policies for blocked_users
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can block other users"
  ON public.blocked_users
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = current_profile_id());

CREATE POLICY "Users can view their own blocks"
  ON public.blocked_users
  FOR SELECT
  TO authenticated
  USING (user_id = current_profile_id());

CREATE POLICY "Users can unblock users they blocked"
  ON public.blocked_users
  FOR DELETE
  TO authenticated
  USING (user_id = current_profile_id());

CREATE POLICY "Admins can view all blocks"
  ON public.blocked_users
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for reported_messages
ALTER TABLE public.reported_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can report messages"
  ON public.reported_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = current_profile_id());

CREATE POLICY "Users can view their own reports"
  ON public.reported_messages
  FOR SELECT
  TO authenticated
  USING (reporter_id = current_profile_id());

CREATE POLICY "Admins can view all message reports"
  ON public.reported_messages
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS Policies for reported_threads
ALTER TABLE public.reported_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can report threads"
  ON public.reported_threads
  FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = current_profile_id());

CREATE POLICY "Users can view their own thread reports"
  ON public.reported_threads
  FOR SELECT
  TO authenticated
  USING (reporter_id = current_profile_id());

CREATE POLICY "Admins can view all thread reports"
  ON public.reported_threads
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Function to check if a user has blocked another user
CREATE OR REPLACE FUNCTION public.is_user_blocked(p_user_id UUID, p_target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (user_id = p_user_id AND blocked_user_id = p_target_user_id)
       OR (user_id = p_target_user_id AND blocked_user_id = p_user_id)
  );
$$;

-- Update thread creation to check for blocks
CREATE OR REPLACE FUNCTION public.check_blocked_before_thread()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF public.is_user_blocked(NEW.host_id, NEW.seeker_id) THEN
    RAISE EXCEPTION 'Cannot create thread with blocked user';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_blocked_thread_creation
  BEFORE INSERT ON public.threads
  FOR EACH ROW
  EXECUTE FUNCTION public.check_blocked_before_thread();

-- Update message creation to check for blocks
CREATE OR REPLACE FUNCTION public.check_blocked_before_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_host_id UUID;
  v_seeker_id UUID;
BEGIN
  SELECT host_id, seeker_id INTO v_host_id, v_seeker_id
  FROM public.threads
  WHERE id = NEW.thread_id;
  
  IF public.is_user_blocked(v_host_id, v_seeker_id) THEN
    RAISE EXCEPTION 'Cannot send message to blocked user';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_blocked_message_creation
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_blocked_before_message();