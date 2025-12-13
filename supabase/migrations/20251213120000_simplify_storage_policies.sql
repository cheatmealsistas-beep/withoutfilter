-- Migration: Simplify storage policies for organization-logos bucket
-- Description: Use simpler policies that work reliably

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload logos for their organizations" ON storage.objects;
DROP POLICY IF EXISTS "Users can update logos for their organizations" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete logos for their organizations" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view organization logos" ON storage.objects;

-- Simpler approach: Allow upload if user is owner/admin of the org matching the folder name
-- The folder name is the first part of the path (organization_id/filename)

-- Allow authenticated users to insert if they own/admin the organization
CREATE POLICY "Org owners can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-logos' AND
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
    AND om.organization_id::text = split_part(name, '/', 1)
  )
);

-- Allow update
CREATE POLICY "Org owners can update logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'organization-logos' AND
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
    AND om.organization_id::text = split_part(name, '/', 1)
  )
);

-- Allow delete
CREATE POLICY "Org owners can delete logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-logos' AND
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
    AND om.organization_id::text = split_part(name, '/', 1)
  )
);

-- Public read access
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'organization-logos');
