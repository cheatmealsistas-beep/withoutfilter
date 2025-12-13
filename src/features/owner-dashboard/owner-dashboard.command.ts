import { createClientServer } from '@/shared/database/supabase';

/**
 * Toggle module enabled state
 */
export async function toggleModule(
  organizationId: string,
  moduleType: string,
  isEnabled: boolean
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  const { error } = await supabase
    .from('app_modules')
    .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
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
  const supabase = await createClientServer();

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
  const supabase = await createClientServer();

  // Update each module's display order
  for (const module of modules) {
    const { error } = await supabase
      .from('app_modules')
      .update({
        display_order: module.displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', organizationId)
      .eq('type', module.type);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true, error: null };
}
