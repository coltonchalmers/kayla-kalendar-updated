/*
# Widen lead-hours columns to numeric(5,2) for 15-minute increment support

## Purpose
Changes three "lead hours" columns on `admin_settings` from `numeric(5,1)`
(one decimal place) to `numeric(5,2)` (two decimal places) so the admin can
enter 15-minute increments such as 0.25 (15 minutes) or 0.75 (45 minutes).

Previously, `numeric(5,1)` silently rounded values like 0.25 to 0.3 on save.
When the value 0.3 was reloaded and the user tried to save again, the
front-end validation (which requires clean 15-minute increments) rejected it,
trapping the user in an error state.

## Modified Columns on `admin_settings`
1. `booking_lead_hours` (numeric(5,1) -> numeric(5,2))
   - Minimum hours ahead a client can book.
2. `client_reminder_lead_hours` (numeric(5,1) -> numeric(5,2))
   - Hours before a meeting to send the client reminder email.
3. `email_admin_event_notification_lead_hours` (numeric(5,1) -> numeric(5,2))
   - Hours before a meeting to send the admin event-notification email.
   - The existing CHECK constraint `admin_event_notification_lead_hours_non_negative`
     is dropped and re-added around the type change because constraints are
     bound to the column.

## Security
- No new tables.
- No RLS or policy changes. `admin_settings` keeps its existing owner-scoped
  policies.

## Important Notes
1. Existing values convert cleanly: 24.0 -> 24.00, 2.0 -> 2.00, 0.5 -> 0.50.
   No data is lost.
2. This migration is idempotent: each ALTER only runs if the column's current
   precision/scale is (5,1).
3. `notification_lead_hours` (legacy, unused) is NOT touched.
*/

-- 1. booking_lead_hours: numeric(5,1) -> numeric(5,2)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_settings'
      AND column_name = 'booking_lead_hours'
      AND data_type = 'numeric'
      AND numeric_precision = 5
      AND numeric_scale = 1
  ) THEN
    ALTER TABLE admin_settings ALTER COLUMN booking_lead_hours
      TYPE numeric(5,2) USING booking_lead_hours::numeric(5,2);
  END IF;
END $$;

-- 2. client_reminder_lead_hours: numeric(5,1) -> numeric(5,2)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_settings'
      AND column_name = 'client_reminder_lead_hours'
      AND data_type = 'numeric'
      AND numeric_precision = 5
      AND numeric_scale = 1
  ) THEN
    ALTER TABLE admin_settings ALTER COLUMN client_reminder_lead_hours
      TYPE numeric(5,2) USING client_reminder_lead_hours::numeric(5,2);
  END IF;
END $$;

-- 3. email_admin_event_notification_lead_hours: numeric(5,1) -> numeric(5,2)
--    Drop and re-add the CHECK constraint around the type change.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'admin_event_notification_lead_hours_non_negative'
  ) THEN
    ALTER TABLE admin_settings DROP CONSTRAINT admin_event_notification_lead_hours_non_negative;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_settings'
      AND column_name = 'email_admin_event_notification_lead_hours'
      AND data_type = 'numeric'
      AND numeric_precision = 5
      AND numeric_scale = 1
  ) THEN
    ALTER TABLE admin_settings ALTER COLUMN email_admin_event_notification_lead_hours
      TYPE numeric(5,2) USING email_admin_event_notification_lead_hours::numeric(5,2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'admin_event_notification_lead_hours_non_negative'
  ) THEN
    ALTER TABLE admin_settings ADD CONSTRAINT admin_event_notification_lead_hours_non_negative
      CHECK (email_admin_event_notification_lead_hours >= 0);
  END IF;
END $$;