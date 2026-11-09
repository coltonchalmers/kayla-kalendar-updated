/*
# Add Google Calendar busy-time blocking settings

## What this migration does
Lets each admin choose which Google calendars should block client booking times,
and turn that blocking on or off. Existing Google connections are unaffected and
default to blocking turned off with no calendars selected.

## 1. google_calendar_connections (modified)
- `busy_calendar_ids` (text[], default empty) — Google calendar IDs whose busy
  periods hide conflicting times from clients.
- `block_busy_times` (boolean, default false) — master on/off switch for blocking.

## 2. Security
- No new tables. The existing owner-only policies on google_calendar_connections
  already cover reading and updating these columns.

## Important notes
1. Adding columns does not change any existing rows' behavior.
2. The public booking flow reads these values only through the server function,
   never directly from the browser.
*/

ALTER TABLE google_calendar_connections
  ADD COLUMN IF NOT EXISTS busy_calendar_ids text[] NOT NULL DEFAULT '{}';

ALTER TABLE google_calendar_connections
  ADD COLUMN IF NOT EXISTS block_busy_times boolean NOT NULL DEFAULT false;
