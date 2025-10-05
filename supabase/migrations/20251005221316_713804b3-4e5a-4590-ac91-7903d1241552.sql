-- Setup cron job to send weekly broken photos digest every Monday at 9 AM Athens time (7 AM UTC)
SELECT cron.schedule(
  'send-broken-photos-digest-weekly',
  '0 7 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://grtanmuzjwmuayhljoqj.supabase.co/functions/v1/send-broken-photos-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdydGFubXV6andtdWF5aGxqb3FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0ODM2MzIsImV4cCI6MjA3NDA1OTYzMn0.tQuT7by7aDyw5fcvoufU9jaEZkfH6bbHzmAxwKw5Ym8"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);