-- Phase 2: Platform Features - Tables for photo sharing, templates, and tours

-- Message attachments table for photo/file sharing
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'image' CHECK (type IN ('image', 'document', 'voice')),
  thumbnail_url TEXT,
  file_size_bytes INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Message templates for listers to save common responses
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_default BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Tour requests for scheduling property visits
CREATE TABLE IF NOT EXISTS tour_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  requested_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  requested_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_user_id ON message_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_tour_requests_thread_id ON tour_requests(thread_id);
CREATE INDEX IF NOT EXISTS idx_tour_requests_listing_id ON tour_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_tour_requests_status ON tour_requests(status);

-- RLS Policies for message_attachments
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments for their threads"
  ON message_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN threads t ON t.id = m.thread_id
      WHERE m.id = message_attachments.message_id
        AND (t.host_id = current_profile_id() OR t.seeker_id = current_profile_id())
    )
  );

CREATE POLICY "Users can upload attachments to their messages"
  ON message_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = message_attachments.message_id
        AND m.sender_id = current_profile_id()
    )
  );

-- RLS Policies for message_templates
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own templates"
  ON message_templates FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own templates"
  ON message_templates FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own templates"
  ON message_templates FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own templates"
  ON message_templates FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for tour_requests
ALTER TABLE tour_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tour requests for their threads"
  ON tour_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM threads t
      WHERE t.id = tour_requests.thread_id
        AND (t.host_id = current_profile_id() OR t.seeker_id = current_profile_id())
    )
  );

CREATE POLICY "Users can create tour requests for their threads"
  ON tour_requests FOR INSERT
  WITH CHECK (
    requested_by = current_profile_id() AND
    EXISTS (
      SELECT 1 FROM threads t
      WHERE t.id = tour_requests.thread_id
        AND (t.host_id = current_profile_id() OR t.seeker_id = current_profile_id())
    )
  );

CREATE POLICY "Thread participants can update tour requests"
  ON tour_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM threads t
      WHERE t.id = tour_requests.thread_id
        AND (t.host_id = current_profile_id() OR t.seeker_id = current_profile_id())
    )
  );

-- Trigger to update templates updated_at
CREATE OR REPLACE FUNCTION update_message_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_message_templates_updated_at();

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for message-attachments bucket
CREATE POLICY "Users can upload attachments to their threads"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'message-attachments' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can view attachments from their threads"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'message-attachments' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can delete their own attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'message-attachments' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );