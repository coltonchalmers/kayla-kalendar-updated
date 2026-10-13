/*
# Standardize site_url across all admin_settings rows

1. Changes
- Backfill any NULL or malformed site_url values in admin_settings to the
  canonical public URL: https://kayla-kalendar.jungosolutions.com
- Set a column default on site_url so new rows created via signup
  automatically get the correct URL without manual entry.
- This fixes the one row that had "jungosolutions.com" (missing https://)
  and any future rows that would otherwise start NULL.

2. Security
- No RLS or policy changes.
- No new tables or columns.
*/

UPDATE admin_settings
  SET site_url = 'https://kayla-kalendar.jungosolutions.com'
  WHERE site_url IS NULL
     OR site_url = ''
     OR site_url NOT LIKE 'https://%';

ALTER TABLE admin_settings
  ALTER COLUMN site_url SET DEFAULT 'https://kayla-kalendar.jungosolutions.com';
