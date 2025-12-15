'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { getUser } from '@/shared/auth';
import { isOwnerOfOrganization, getOrganizationBySlug } from './owner-dashboard.query';
import {
  handleToggleModule,
  handleSetModulePublic,
  handleReorderModules,
  handleUpdateModuleSettings,
} from './owner-dashboard.handler';

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

interface HomeContent {
  headline: string;
  description?: string | null;
  ctaText?: string | null;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Save home content for an organization
 */
export async function saveHomeContentAction(
  slug: string,
  content: HomeContent
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Verify ownership
  const isOwner = await isOwnerOfOrganization(user.id, slug);
  if (!isOwner) {
    return { success: false, error: 'No tienes permiso para editar esta organización' };
  }

  // Get organization
  const { data: org, error: orgError } = await getOrganizationBySlug(slug);
  if (orgError || !org) {
    return { success: false, error: 'Organización no encontrada' };
  }

  const supabase = createAdminClient();

  // Get or create home module
  const { data: existingModule } = await supabase
    .from('app_modules')
    .select('id')
    .eq('organization_id', org.id)
    .eq('type', 'home')
    .maybeSingle();

  if (existingModule) {
    // Update existing module
    const { error: updateError } = await supabase
      .from('app_modules')
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingModule.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }
  } else {
    // Create new home module
    const { error: insertError } = await supabase.from('app_modules').insert({
      organization_id: org.id,
      type: 'home',
      is_enabled: true,
      display_order: 0,
      content,
    });

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  revalidatePath(`/app/${slug}`);
  revalidatePath(`/app/${slug}/admin`);
  revalidatePath(`/app/${slug}/admin/customize`);

  return { success: true };
}

/**
 * Update organization logo
 */
export async function updateLogoAction(
  slug: string,
  logoUrl: string
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  // Verify ownership
  const isOwner = await isOwnerOfOrganization(user.id, slug);
  if (!isOwner) {
    return { success: false, error: 'No tienes permiso para editar esta organización' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('organizations')
    .update({ logo_url: logoUrl })
    .eq('slug', slug);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/app/${slug}`);
  revalidatePath(`/app/${slug}/admin`);

  return { success: true };
}

/**
 * Toggle module enabled/disabled
 */
export async function toggleModuleAction(
  slug: string,
  moduleType: string,
  isEnabled: boolean
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const result = await handleToggleModule(user.id, slug, {
    type: moduleType,
    isEnabled,
  });

  if (result.success) {
    // Revalidate all paths that might show modules
    revalidatePath(`/app/${slug}`);
    revalidatePath(`/app/${slug}/admin`);
    revalidatePath(`/app/${slug}/admin/modules`);
  }

  return {
    success: result.success,
    error: result.error || undefined,
  };
}

/**
 * Set module public/private visibility
 */
export async function setModulePublicAction(
  slug: string,
  moduleType: string,
  isPublic: boolean
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const result = await handleSetModulePublic(user.id, slug, {
    type: moduleType,
    isPublic,
  });

  if (result.success) {
    revalidatePath(`/app/${slug}`);
    revalidatePath(`/app/${slug}/admin/modules`);
  }

  return {
    success: result.success,
    error: result.error || undefined,
  };
}

/**
 * Reorder modules
 */
export async function reorderModulesAction(
  slug: string,
  modules: Array<{ type: string; displayOrder: number }>
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const result = await handleReorderModules(user.id, slug, modules);

  if (result.success) {
    revalidatePath(`/app/${slug}`);
    revalidatePath(`/app/${slug}/admin/modules`);
  }

  return {
    success: result.success,
    error: result.error || undefined,
  };
}

/**
 * Update module settings (custom label, navbar/footer visibility)
 */
export async function updateModuleSettingsAction(
  slug: string,
  moduleType: string,
  settings: {
    customLabel?: string | null;
    showInNavbar?: boolean;
    showInFooter?: boolean;
  }
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const result = await handleUpdateModuleSettings(user.id, slug, {
    type: moduleType,
    ...settings,
  });

  if (result.success) {
    // Revalidate all paths that show navigation
    revalidatePath(`/app/${slug}`);
    revalidatePath(`/app/${slug}/admin`);
    revalidatePath(`/app/${slug}/admin/modules`);
    revalidatePath(`/app/${slug}/about`);
    revalidatePath(`/app/${slug}/contact`);
    revalidatePath(`/app/${slug}/services`);
    revalidatePath(`/app/${slug}/courses`);
  }

  return {
    success: result.success,
    error: result.error || undefined,
  };
}
