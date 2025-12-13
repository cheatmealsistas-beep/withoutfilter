-- Migration: Fix organization logos storage migration
-- Description: This migration is empty - the previous migration applied successfully
--              but failed on COMMENT statements which are not needed.
--              The bucket and policies were created successfully.

-- Verify bucket exists (no-op if already exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-logos',
  'organization-logos',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;
