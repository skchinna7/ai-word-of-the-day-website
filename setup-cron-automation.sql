-- Supabase Cron Job Configuration
-- This sets up automatic daily word generation at midnight UTC

-- Create the cron extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job to run every day at midnight UTC
SELECT cron.schedule(
  'generate-daily-word',           -- Job name
  '0 0 * * *',                     -- Cron expression (midnight daily)
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-daily-word',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule a job (if needed):
-- SELECT cron.unschedule('generate-daily-word');

-- Alternative: Using Supabase scheduled function (recommended)
-- Instead of pg_cron, you can use Supabase's built-in scheduling
-- Go to: Supabase Dashboard → Database → Cron Jobs
-- Add a new job with this configuration:
--
-- Name: generate-daily-word
-- Schedule: 0 0 * * * (daily at midnight)
-- SQL:
--
-- SELECT net.http_post(
--   url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-daily-word',
--   headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
-- );
