/*
# Default busy-time blocking to on and clear placeholder Google emails

1. Modified Tables
- `google_calendar_connections.block_busy_times`: default changed from false to true, so new Google connections start with blocking switched on. Existing rows are not changed.
- `google_calendar_connections.google_email`: rows where the value was the placeholder text "unknown" are set to NULL, because that text was stored when Google did not return an email address.

2. Security
- No policy or grant changes.

3. Notes
- Reconnecting Google refreshes the stored email address.
*/

ALTER TABLE google_calendar_connections
  ALTER COLUMN block_busy_times SET DEFAULT true;

UPDATE google_calendar_connections
   SET google_email = NULL
 WHERE google_email = 'unknown';
