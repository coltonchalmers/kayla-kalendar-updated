/*
# Rename existing Notes to Client block labels to "Notes from Jungo"

1. Modified data
- admin_settings.email_templates_json: every Notes to Client block now has the label "Notes from Jungo" instead of "Notes".

2. Security
- No table, column, policy, or grant changes.

3. Important notes
- Only the label text changes. Block order, colors, and other settings are untouched.
- Safe to re-run: blocks already labeled "Notes from Jungo" are left as they are.
- A temporary helper function is created for this change and removed at the end.
*/

CREATE OR REPLACE FUNCTION public.tmp_rename_notes_to_client_labels(node jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
BEGIN
  IF jsonb_typeof(node) = 'object' THEN
    IF node->>'type' = 'notesToClient' AND jsonb_typeof(node->'props') = 'object' THEN
      node := jsonb_set(node, '{props,label}', '"Notes from Jungo"'::jsonb);
    END IF;
    SELECT coalesce(jsonb_object_agg(e.key, public.tmp_rename_notes_to_client_labels(e.value)), '{}'::jsonb)
      INTO result
      FROM jsonb_each(node) AS e;
    RETURN result;
  ELSIF jsonb_typeof(node) = 'array' THEN
    SELECT coalesce(jsonb_agg(public.tmp_rename_notes_to_client_labels(a.value) ORDER BY a.ord), '[]'::jsonb)
      INTO result
      FROM jsonb_array_elements(node) WITH ORDINALITY AS a(value, ord);
    RETURN result;
  END IF;
  RETURN node;
END;
$$;

UPDATE admin_settings
SET email_templates_json = public.tmp_rename_notes_to_client_labels(email_templates_json)
WHERE email_templates_json IS NOT NULL;

DROP FUNCTION IF EXISTS public.tmp_rename_notes_to_client_labels(jsonb);
