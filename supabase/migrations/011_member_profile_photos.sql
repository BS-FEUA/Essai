-- Profile photos are public so they can be displayed in member directories
-- and message threads. Uploads and replacements are handled by the authenticated
-- server API using the service role; the bucket stays outside direct client writes.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'member-avatars',
  'member-avatars',
  TRUE,
  3145728,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = TRUE,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
