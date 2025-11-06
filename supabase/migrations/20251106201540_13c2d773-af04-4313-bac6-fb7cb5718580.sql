-- Phase 1: Add read receipts and delivered status to messages
ALTER TABLE messages 
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ DEFAULT now();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);
CREATE INDEX IF NOT EXISTS idx_messages_delivered_at ON messages(delivered_at);

-- Function to automatically mark messages as read
CREATE OR REPLACE FUNCTION mark_message_as_read()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-mark as read if sender views their own message
  IF NEW.read_at IS NULL AND auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = NEW.sender_id
  ) THEN
    NEW.read_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to mark messages as delivered when inserted
CREATE OR REPLACE FUNCTION set_delivered_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.delivered_at IS NULL THEN
    NEW.delivered_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_message_delivered ON messages;
CREATE TRIGGER set_message_delivered
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION set_delivered_at();