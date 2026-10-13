/*
# Recreate ping-send-reminders cron job (per-user site_url)

1. Changes
- Unschedule the old ping-send-reminders job that read only the first
  admin_settings row's site_url and passed it as a shared value for all
  users.
- Recreate it with an empty body. The send-reminders edge function now
  reads each user's own site_url from their admin_settings row and uses
  that when building "manage your booking" links in reminder emails.
- Falls back to the PUBLIC_SITE_URL env var (now set to the real app URL)
  if a user's site_url is null.

2. Security
- No RLS changes. Uses the anon key JWT already used by the previous job.
*/

SELECT cron.unschedule('ping-send-reminders');

SELECT cron.schedule(
  'ping-send-reminders',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://etqmkgomwbfxdwjoqjei.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cW1rZ29td2JmeGR3am9xamVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5OTA0NzAsImV4cCI6MjEwMjU2NjQ3MH0.ocn0uaoLtY6vNN1xnodsYrF11gNPXSvRr5x6JagtkTM'
    ),
    body := '{}'::jsonb
  );
  $$
);
