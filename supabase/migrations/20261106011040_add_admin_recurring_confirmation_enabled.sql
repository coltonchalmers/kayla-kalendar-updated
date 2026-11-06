ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS email_admin_recurring_confirmation_enabled boolean NOT NULL DEFAULT true;