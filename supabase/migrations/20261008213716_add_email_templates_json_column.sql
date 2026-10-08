ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS email_templates_json JSONB;

COMMENT ON COLUMN public.admin_settings.email_templates_json IS
  'Stores component-based email templates for react-email, keyed by email type (confirmation, recurring_confirmation, cancellation, reschedule, change, invite, notification, admin_change_notification, admin_daily_summary). Each value is a JSON object containing a component tree, subject line, and optional preview text.';
