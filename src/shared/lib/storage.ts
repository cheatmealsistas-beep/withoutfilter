import { createClient } from '@/shared/database/supabase/client';

interface UploadResult {
  url: string | null;
  error: string | null;
}

/**
 * Upload organization logo to Supabase Storage via server action
 * This function converts the file to base64 and sends it to a server action
 * @param organizationId - The organization ID
 * @param file - The file to upload
 * @returns The public URL of the uploaded file
 */
export async function uploadOrganizationLogo(
  organizationId: string,
  file: File
): Promise<UploadResult> {
  try {
    // Convert file to base64 for server transmission
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';

    // Call server action
    const response = await fetch('/api/upload-logo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId,
        fileBase64: base64,
        fileExt,
        mimeType: file.type,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { url: null, error: result.error || 'Error uploading file' };
    }

    return { url: result.url, error: null };
  } catch (error) {
    console.error('Upload error:', error);
    return { url: null, error: 'Error uploading file' };
  }
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
