-- Create table to track photo health check status
CREATE TABLE IF NOT EXISTS public.photo_health_check_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_run_at TIMESTAMPTZ DEFAULT NOW(),
  photos_checked INT DEFAULT 0,
  broken_found INT DEFAULT 0,
  run_duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.photo_health_check_status ENABLE ROW LEVEL SECURITY;

-- Only admins can view health check status
CREATE POLICY "Admins can view health check status"
  ON public.photo_health_check_status
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert health check records
CREATE POLICY "System can insert health check records"
  ON public.photo_health_check_status
  FOR INSERT
  WITH CHECK (true);

-- Setup cron job to run photo validation daily at 3 AM Athens time (1 AM UTC)
SELECT cron.schedule(
  'validate-listing-photos-daily',
  '0 1 * * *',
  $$
  SELECT net.http_post(
    url := 'https://grtanmuzjwmuayhljoqj.supabase.co/functions/v1/validate-listing-photos',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydGFubXV6andtdWF5aGxqb3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0ODM2MzIsImV4cCI6MjA3NDA1OTYzMn0.tQuT7by7aDyw5fcvoufU9jaEZkfH6bbHzmAxwKw5Ym8"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);

COMMENT ON TABLE public.photo_health_check_status IS 'Tracks automated photo validation runs';
COMMENT ON COLUMN public.photo_health_check_status.photos_checked IS 'Number of photos checked in this run';
COMMENT ON COLUMN public.photo_health_check_status.broken_found IS 'Number of broken photos found in this run';