ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS email_admin_reschedule_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_admin_reschedule_elements jsonb,
  ADD COLUMN IF NOT EXISTS email_admin_cancellation_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS email_admin_cancellation_elements jsonb;