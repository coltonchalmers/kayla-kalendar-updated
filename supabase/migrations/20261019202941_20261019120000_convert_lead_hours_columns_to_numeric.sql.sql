/*
# Convert lead-hours columns to numeric(5,1) for half-hour support

## Purpose
Changes three "lead hours" columns on `admin_settings` from `integer` to
`numeric(5,1)` so the admin can enter half-hour increments such as 0.5
(30 minutes) or 2.5 (2 hours 30 minutes). Previously these were integers
and could only store whole hours.

## Modified Columns on `admin_settings`
1. `email_admin_event_notification_lead_hours` (integer -> numeric(5,1))
   - Hours before a meeting to send the admin event-notification email.
   - Keeps its existing CHECK constraint `>= 0` (dropped and re-added
     around the type change because constraints are bound to the column).
2. `client_reminder_lead_hours` (integer -> numeric(5,1))
   - Hours before a meeting to send the client reminder email.
3. `booking_lead_hours` (integer -> numeric(5,1))
   - Minimum number of hours ahead that a client can book a meeting.

## Security
- No new tables.
- No RLS or policy changes. `admin_settings` keeps its existing owner-scoped
  policies.

## Important Notes
1. The CHECK constraint `admin_event_notification_lead_hours_non_negative`
   is dropped in the same migration and re-added against the now-numeric
   column so the schema never ends up in a half-applied state.
2. Existing integer values auto-convert to numeric cleanly (e.g. 24 -> 24.0).
3. `notification_lead_hours` (the legacy admin-reminder column) is NOT
   touched. Nothing reads or writes it after the legacy reminder system is
   replaced, and altering it would add risk without benefit.
4. This migration is idempotent: it only alters a column if its current
   type is `integer`, and only drops/re-adds the constraint if needed.
*/

-- 1. email_admin_event_notification_lead_hours: integer -> numeric(5,1)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_settings'
      AND column_name = 'email_admin_event_notification_lead_hours'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE admin_settings ALTER COLUMN email_admin_event_notification_lead_hours
      TYPE numeric(5,1) USING email_admin_event_notification_lead_hours::numeric(5,1);
  END IF;
END $$;

-- 2. client_reminder_lead_hours: integer -> numeric(5,1)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_settings'
      AND column_name = 'client_reminder_lead_hours'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE admin_settings ALTER COLUMN client_reminder_lead_hours
      TYPE numeric(5,1) USING client_reminder_lead_hours::numeric(5,1);
  END IF;
END $$;

-- 3. booking_lead_hours: integer -> numeric(5,1)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_settings'
      AND column_name = 'booking_lead_hours'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE admin_settings ALTER COLUMN booking_lead_hours
      TYPE numeric(5,1) USING booking_lead_hours::numeric(5,1);
  END IF;
END $$;

-- 4. Drop and re-add the CHECK constraint on the now-numeric event lead column.
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'admin_event_notification_lead_hours_non_negative'
  ) THEN
    ALTER TABLE admin_settings ADD CONSTRAINT admin_event_notification_lead_hours_non_negative
      CHECK (email_admin_event_notification_lead_hours >= 0);
  END IF;
END $$;
