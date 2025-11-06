-- Phase 3: Fun Features - Reactions, Voice Messages, Response Time

-- Message reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('heart', 'thumbs_up', 'laugh', 'fire', 'clap')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(message_id, user_id, reaction)
);

-- Add average response time to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avg_response_time_minutes INTEGER;

-- Add last_activity_at for response time calculation
ALTER TABLE threads ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);

-- RLS Policies for message_reactions
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions for their threads"
  ON message_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN threads t ON t.id = m.thread_id
      WHERE m.id = message_reactions.message_id
        AND (t.host_id = current_profile_id() OR t.seeker_id = current_profile_id())
    )
  );

CREATE POLICY "Users can add reactions to messages in their threads"
  ON message_reactions FOR INSERT
  WITH CHECK (
    user_id = current_profile_id() AND
    EXISTS (
      SELECT 1 FROM messages m
      JOIN threads t ON t.id = m.thread_id
      WHERE m.id = message_reactions.message_id
        AND (t.host_id = current_profile_id() OR t.seeker_id = current_profile_id())
    )
  );

CREATE POLICY "Users can delete their own reactions"
  ON message_reactions FOR DELETE
  USING (user_id = current_profile_id());

-- Function to calculate average response time
CREATE OR REPLACE FUNCTION calculate_avg_response_time(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  avg_minutes INTEGER;
BEGIN
  SELECT AVG(EXTRACT(EPOCH FROM (m.created_at - prev_msg.created_at)) / 60)::INTEGER
  INTO avg_minutes
  FROM messages m
  JOIN threads t ON t.id = m.thread_id
  JOIN LATERAL (
    SELECT created_at
    FROM messages
    WHERE thread_id = t.id
      AND created_at < m.created_at
      AND sender_id != m.sender_id
    ORDER BY created_at DESC
    LIMIT 1
  ) prev_msg ON true
  WHERE m.sender_id IN (SELECT id FROM profiles WHERE user_id = p_user_id)
    AND m.created_at > NOW() - INTERVAL '30 days'
    AND EXTRACT(EPOCH FROM (m.created_at - prev_msg.created_at)) / 60 < 1440; -- Exclude responses over 24h
  
  RETURN COALESCE(avg_minutes, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update avg_response_time when new message is sent
CREATE OR REPLACE FUNCTION update_avg_response_time()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET avg_response_time_minutes = calculate_avg_response_time(user_id)
  WHERE id = NEW.sender_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_response_time
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_avg_response_time();

-- Create storage bucket for voice messages
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-voice', 'message-voice', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for voice messages
CREATE POLICY "Users can upload voice messages"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'message-voice' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can view voice messages from their threads"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'message-voice' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can delete their own voice messages"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'message-voice' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );