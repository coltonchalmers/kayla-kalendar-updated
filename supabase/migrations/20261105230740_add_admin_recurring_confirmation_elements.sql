/*
# Add content options for admin recurring confirmation email

1. New Columns
- `admin_settings.email_admin_recurring_confirmation_elements` (jsonb, nullable): which optional blocks (company info, Zoom, phone, Google Calendar button) appear in the admin's recurring series email.

2. Modified Tables
- `admin_settings`: one new nullable column. No existing data is changed.

3. Security
- No RLS or grant changes. Existing policies on admin_settings already cover the new column.

4. Important Notes
- Null means the default set of blocks is used, matching the other admin emails.
- The admin recurring email's template text is stored in the existing saved email templates field, so no column is needed for it.
*/

ALTER TABLE public.admin_settings
  ADD COLUMN IF NOT EXISTS email_admin_recurring_confirmation_elements jsonb;
