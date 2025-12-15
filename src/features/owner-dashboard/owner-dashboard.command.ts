import { createClient } from '@supabase/supabase-js';

// Admin client to bypass RLS for module commands
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Toggle module enabled state
 * Note: When enabling courses, it's also set to public automatically
 */
export async function toggleModule(
  organizationId: string,
  moduleType: string,
  isEnabled: boolean
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();

  // When enabling courses, also make it public
  const updateData: { is_enabled: boolean; is_public?: boolean; updated_at: string } = {
    is_enabled: isEnabled,
    updated_at: new Date().toISOString(),
  };

  if (moduleType === 'courses' && isEnabled) {
    updateData.is_public = true;
  }

  const { error } = await supabase
    .from('app_modules')
    .update(updateData)
    .eq('organization_id', organizationId)
    .eq('type', moduleType);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Update module public state
 */
export async function setModulePublic(
  organizationId: string,
  moduleType: string,
  isPublic: boolean
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('app_modules')
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq('organization_id', organizationId)
    .eq('type', moduleType);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Reorder modules
 */
export async function reorderModules(
  organizationId: string,
  modules: Array<{ type: string; displayOrder: number }>
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();

  // Update each module's display order
  for (const mod of modules) {
    const { error } = await supabase
      .from('app_modules')
      .update({
        display_order: mod.displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', organizationId)
      .eq('type', mod.type);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true, error: null };
}

/**
 * Update module navigation settings (custom label, navbar/footer visibility)
 */
export async function updateModuleSettings(
  organizationId: string,
  moduleType: string,
  settings: {
    customLabel?: string | null;
    showInNavbar?: boolean;
    showInFooter?: boolean;
  }
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (settings.customLabel !== undefined) {
    // Empty string becomes null
    updateData.custom_label = settings.customLabel?.trim() || null;
  }
  if (settings.showInNavbar !== undefined) {
    updateData.show_in_navbar = settings.showInNavbar;
  }
  if (settings.showInFooter !== undefined) {
    updateData.show_in_footer = settings.showInFooter;
  }

  const { error } = await supabase
    .from('app_modules')
    .update(updateData)
    .eq('organization_id', organizationId)
    .eq('type', moduleType);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
