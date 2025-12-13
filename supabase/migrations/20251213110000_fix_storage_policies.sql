-- Migration: Fix storage policies for organization-logos bucket
-- Description: Recreate storage policies after bucket creation

-- Drop existing policies if they exist (ignore errors)
DROP POLICY IF EXISTS "Users can upload logos for their organizations" ON storage.objects;
DROP POLICY IF EXISTS "Users can update logos for their organizations" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete logos for their organizations" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view organization logos" ON storage.objects;

-- Allow authenticated users to upload their own organization logos
CREATE POLICY "Users can upload logos for their organizations"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-logos' AND
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
