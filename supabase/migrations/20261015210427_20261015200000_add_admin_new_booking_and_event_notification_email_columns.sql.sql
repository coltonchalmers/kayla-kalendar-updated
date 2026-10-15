/*
# Add admin new-booking-notification and admin event-notification email columns

## Purpose
Adds seven new columns to the `admin_settings` table to support two new admin email types:
1. "Admin new booking notification" — sent immediately to the admin when a client books a meeting.
2. "Admin event notification" — sent to the admin a configurable number of hours before an upcoming meeting.

## New Columns on `admin_settings`

### Admin new booking notification
1. `email_admin_new_booking_notification_enabled` (boolean, NOT NULL, default TRUE)
   - Master toggle for the admin new-booking-notification email type.
2. `email_admin_new_booking_notification_template` (text, nullable)
   - Custom plain-text template override for the new-booking-notification email.
3. `email_admin_new_booking_notification_elements` (jsonb, nullable)
   - Per-email element toggles (company_info, zoom, phone, google_calendar) for this email type.

### Admin event notification
4. `email_admin_event_notification_enabled` (boolean, NOT NULL, default TRUE)
   - Master toggle for the admin event-notification email type.
5. `email_admin_event_notification_template` (text, nullable)
   - Custom plain-text template override for the event-notification email.
6. `email_admin_event_notification_elements` (jsonb, nullable)
   - Per-email element toggles (company_info, zoom, phone, google_calendar) for this email type.
7. `email_admin_event_notification_lead_hours` (integer, NOT NULL, default 24)
   - Number of hours before a meeting to send the event-notification email.
   - CHECK constraint: `email_admin_event_notification_lead_hours >= 0`

## Security
- No new tables created.
- No RLS policy changes — `admin_settings` already has owner-scoped RLS policies.
- No existing columns are dropped or renamed.

## Important Notes
1. All columns are added idempotently using `DO $$ ... IF NOT EXISTS ... END $$` blocks.
2. The CHECK constraint is added only if it does not already exist.
3. Both boolean columns default to TRUE so existing users get the new notifications by default.
4. The lead_hours column defaults to 24 (send event notification 24 hours before the meeting).
*/
DO $$
BEGIN
  -- Admin new booking notification columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'email_admin_new_booking_notification_enabled') THEN
    ALTER TABLE admin_settings ADD COLUMN email_admin_new_booking_notification_enabled boolean NOT NULL DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'email_admin_new_booking_notification_template') THEN
    ALTER TABLE admin_settings ADD COLUMN email_admin_new_booking_notification_template text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'email_admin_new_booking_notification_elements') THEN
    ALTER TABLE admin_settings ADD COLUMN email_admin_new_booking_notification_elements jsonb;
  END IF;

  -- Admin event notification columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'email_admin_event_notification_enabled') THEN
    ALTER TABLE admin_settings ADD COLUMN email_admin_event_notification_enabled boolean NOT NULL DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'email_admin_event_notification_template') THEN
    ALTER TABLE admin_settings ADD COLUMN email_admin_event_notification_template text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'email_admin_event_notification_elements') THEN
    ALTER TABLE admin_settings ADD COLUMN email_admin_event_notification_elements jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_settings' AND column_name = 'email_admin_event_notification_lead_hours') THEN
    ALTER TABLE admin_settings ADD COLUMN email_admin_event_notification_lead_hours integer NOT NULL DEFAULT 24;
  END IF;
END $$;

-- Add CHECK constraint for lead_hours >= 0 if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_event_notification_lead_hours_non_negative') THEN
    ALTER TABLE admin_settings ADD CONSTRAINT admin_event_notification_lead_hours_non_negative
      CHECK (email_admin_event_notification_lead_hours >= 0);
  END IF;
END $$;
