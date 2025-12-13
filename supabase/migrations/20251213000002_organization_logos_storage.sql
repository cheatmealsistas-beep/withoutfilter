-- Migration: Organization Logos Storage Bucket
-- Description: Create storage bucket for organization logos

-- ============================================
-- CREATE STORAGE BUCKET
-- ============================================

-- Create the bucket for organization logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'organization-logos',
  'organization-logos',
  true,  -- Public bucket so logos can be displayed without auth
  2097152,  -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- RLS POLICIES FOR STORAGE
-- ============================================

-- Allow authenticated users to upload their own organization logos
CREATE POLICY "Users can upload logos for their organizations"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-logos' AND
  -- Path format: {organization_id}/logo.{ext}
  (storage.foldername(name))[1] IN (
    SELECT o.id::text FROM organizations o
    JOIN organization_members om ON om.organization_id = o.id
    WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
  )
);

-- Allow users to update their organization logos
CREATE POLICY "Users can update logos for their organizations"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'organization-logos' AND
  (storage.foldername(name))[1] IN (
    SELECT o.id::text FROM organizations o
    JOIN organization_members om ON om.organization_id = o.id
    WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
  )
);

-- Allow users to delete their organization logos
CREATE POLICY "Users can delete logos for their organizations"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-logos' AND
  (storage.foldername(name))[1] IN (
    SELECT o.id::text FROM organizations o
    JOIN organization_members om ON om.organization_id = o.id
    WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
  )
);

-- Allow public read access to all logos (public bucket)
CREATE POLICY "Anyone can view organization logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'organization-logos');

-- Note: COMMENT ON POLICY requires superuser privileges
-- and is not supported via standard Supabase migrations.
