import { createClient } from '@/shared/database/supabase/client';

interface UploadResult {
  url: string | null;
  error: string | null;
}

/**
 * Upload organization logo to Supabase Storage
 * @param organizationId - The organization ID
 * @param file - The file to upload
 * @returns The public URL of the uploaded file
 */
export async function uploadOrganizationLogo(
  organizationId: string,
  file: File
): Promise<UploadResult> {
  const supabase = createClient();

  // Generate unique filename
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
  const fileName = `logo.${fileExt}`;
  const filePath = `${organizationId}/${fileName}`;

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from('organization-logos')
    .upload(filePath, file, {
      upsert: true, // Replace existing logo
      cacheControl: '3600',
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return { url: null, error: uploadError.message };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('organization-logos').getPublicUrl(filePath);

  return { url: publicUrl, error: null };
}

/**
 * Delete organization logo from Supabase Storage
 * @param organizationId - The organization ID
 */
export async function deleteOrganizationLogo(
  organizationId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createClient();

  // List files in the organization folder
  const { data: files, error: listError } = await supabase.storage
    .from('organization-logos')
    .list(organizationId);

  if (listError) {
    return { success: false, error: listError.message };
  }

  if (!files || files.length === 0) {
    return { success: true, error: null }; // No logo to delete
  }

  // Delete all files in the folder
  const filePaths = files.map((f) => `${organizationId}/${f.name}`);
  const { error: deleteError } = await supabase.storage
    .from('organization-logos')
    .remove(filePaths);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  return { success: true, error: null };
}
