/*
# Add admin daily summary toggle column

## Purpose
Adds a single boolean column `email_admin_daily_summary_enabled` to
`admin_settings` so the rebuilt "Admin Daily Summary" email can be toggled
independently, matching the pattern used by every other email type
(`email_confirmation_enabled`, `email_admin_event_notification_enabled`, etc).

## Context
Previously the daily summary was gated by the legacy
`notification_enabled` + `admin_reminder_mode = 'daily'` combination. That
legacy system is being replaced. The new daily summary feature reuses the
existing `admin_daily_summary_time` and `admin_daily_summary_night_before`
columns but needs its own master toggle.

## New Column on `admin_settings`
1. `email_admin_daily_summary_enabled` (boolean, NOT NULL, default FALSE)
   - Master toggle for the admin daily-summary email type.
   - Defaults to FALSE (off) so existing users are not surprised by a new
     scheduled email. They can opt in from the Settings page.

## Security
- No new tables.
- No RLS or policy changes. `admin_settings` keeps its existing owner-scoped
  policies.

## Important Notes
1. Added idempotently using a DO $$ ... IF NOT EXISTS ... END $$ block.
2. No existing columns are dropped or renamed.
3. `admin_daily_summary_time` and `admin_daily_summary_night_before` are
   reused as-is; only the master toggle is new.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_settings'
      AND column_name = 'email_admin_daily_summary_enabled'
  ) THEN
    ALTER TABLE admin_settings
      ADD COLUMN email_admin_daily_summary_enabled boolean NOT NULL DEFAULT FALSE;
  END IF;
END $$;
