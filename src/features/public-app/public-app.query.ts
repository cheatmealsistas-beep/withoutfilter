import { createClient } from '@supabase/supabase-js';
import type { PublicApp, HomeContent } from './types';

// Admin client for public queries (bypasses RLS for public content)
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
 * Get public app data by slug
 */
export async function getPublicAppBySlug(
  slug: string
): Promise<{ data: PublicApp | null; error: string | null }> {
  const supabase = createAdminClient();

  // Get the organization by slug
  const { data: org, error } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url, tagline, primary_color, created_by')
    .eq('slug', slug)
    .single();

  if (error || !org) {
    return { data: null, error: error?.message ?? 'App not found' };
  }

  // Get owner's profile separately
  let profile: { full_name: string | null; avatar_url: string | null; professional_type: string | null } | null = null;
  if (org.created_by) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, professional_type')
      .eq('id', org.created_by)
      .single();
    profile = profileData;
  }

  const publicApp: PublicApp = {
    id: org.id,
    name: org.name,
    slug: org.slug,
    logoUrl: org.logo_url,
    tagline: org.tagline,
    primaryColor: org.primary_color || '#6366f1',
    ownerName: profile?.full_name ?? null,
    ownerAvatar: profile?.avatar_url ?? null,
    professionalType: profile?.professional_type ?? null,
  };

  return { data: publicApp, error: null };
}

/**
 * Get home module content for an app
 */
export async function getPublicHomeContent(
  organizationId: string
): Promise<{ data: HomeContent | null; error: string | null }> {
  const supabase = createAdminClient();

  // Get home module content
  const { data: module, error } = await supabase
    .from('app_modules')
    .select('content')
    .eq('organization_id', organizationId)
    .eq('type', 'home')
    .maybeSingle();

  if (error || !module) {
    return { data: null, error: error?.message ?? null };
  }

  const content = module.content as HomeContent | null;
  return { data: content, error: null };
}

/**
 * Check if a user is the owner of an app
 */
export async function isAppOwner(
  organizationId: string,
  userId: string
): Promise<boolean> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('role', 'owner')
    .single();

  return !!data;
}

/**
 * Get published page builder content for public display
 */
export async function getPublishedPageContent(
  organizationId: string
): Promise<{
  data: {
    blocks: import('@/features/page-builder/types').PageBlock[];
    settings: import('@/features/page-builder/types').PageSettings;
  } | null;
  error: string | null;
}> {
  const supabase = createAdminClient();

  const { data: module, error } = await supabase
    .from('app_modules')
    .select('content')
    .eq('organization_id', organizationId)
    .eq('type', 'home')
    .maybeSingle();

  if (error || !module) {
    return { data: null, error: error?.message ?? null };
  }

  const content = module.content as Record<string, unknown> | null;

  // Check if it's new page builder format (v2)
  if (content && content.version === 2) {
    const pageContent = content as import('@/features/page-builder/types').PageBuilderContent;
    // Return published content if available, otherwise draft
    const blocksData = pageContent.published || pageContent.draft;
    return {
      data: {
        blocks: blocksData.blocks,
        settings: pageContent.settings,
      },
      error: null,
    };
  }

  // Legacy format - return null (will fall back to old rendering)
  return { data: null, error: null };
}

/**
 * Get published content for any module type
 */
export async function getPublishedModulePageContent(
  organizationId: string,
  moduleType: string
): Promise<{
  data: {
    blocks: import('@/features/page-builder/types').PageBlock[];
    settings: import('@/features/page-builder/types').PageSettings;
  } | null;
  error: string | null;
}> {
  const supabase = createAdminClient();

  const { data: module, error } = await supabase
    .from('app_modules')
    .select('content, is_enabled')
    .eq('organization_id', organizationId)
    .eq('type', moduleType)
    .maybeSingle();

  if (error || !module) {
    return { data: null, error: error?.message ?? null };
  }

  // Module must be enabled
  if (!module.is_enabled) {
    return { data: null, error: 'Module not enabled' };
  }

  const content = module.content as Record<string, unknown> | null;

  // Check if it's new page builder format (v2)
  if (content && content.version === 2) {
    const pageContent = content as import('@/features/page-builder/types').PageBuilderContent;
    // Return published content if available, otherwise draft
    const blocksData = pageContent.published || pageContent.draft;
    return {
      data: {
        blocks: blocksData.blocks,
        settings: pageContent.settings,
      },
      error: null,
    };
  }

  // No content or legacy format
  return { data: null, error: null };
}

/**
 * Get enabled modules for public navigation
 */
export async function getEnabledModules(
  organizationId: string
): Promise<{
  data: Array<{
    id: string;
    type: string;
    isEnabled: boolean;
    isPublic: boolean;
    displayOrder: number;
    customLabel: string | null;
    showInNavbar: boolean;
    showInFooter: boolean;
    customSlug: string | null;
  }> | null;
  error: string | null;
}> {
  const supabase = createAdminClient();

  // Get enabled modules from app_modules
  const { data, error } = await supabase
    .from('app_modules')
    .select('id, type, is_enabled, is_public, display_order, custom_label, show_in_navbar, show_in_footer, custom_slug')
    .eq('organization_id', organizationId)
    .eq('is_enabled', true)
    .order('display_order', { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  const modules = (data || []).map((m) => ({
    id: m.id,
    type: m.type,
    isEnabled: m.is_enabled ?? false,
    isPublic: m.is_public ?? true,
    displayOrder: m.display_order ?? 0,
    customLabel: m.custom_label ?? null,
    showInNavbar: m.show_in_navbar ?? true,
    showInFooter: m.show_in_footer ?? false,
    customSlug: m.custom_slug ?? null,
  }));

  // Check if courses module exists in the list
  const hasCoursesModule = modules.some((m) => m.type === 'courses');

  // If no courses module, check if there are published courses
  if (!hasCoursesModule) {
    const { count } = await supabase
      .from('courses')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'published');

    // If there are published courses, add the courses module dynamically
    if (count && count > 0) {
      modules.push({
        id: 'dynamic-courses',
        type: 'courses',
        isEnabled: true,
        isPublic: true,
        displayOrder: 10,
        customLabel: null,
        showInNavbar: true,
        showInFooter: false,
        customSlug: null,
      });
      // Sort by display order
      modules.sort((a, b) => a.displayOrder - b.displayOrder);
    }
  }

  return {
    data: modules,
    error: null,
  };
}

/**
 * Get a custom page module by its slug
 */
export async function getCustomPageBySlug(
  organizationId: string,
  customSlug: string
): Promise<{
  data: {
    id: string;
    type: string;
    customLabel: string | null;
    content: Record<string, unknown> | null;
  } | null;
  error: string | null;
}> {
  const supabase = createAdminClient();

  const { data: module, error } = await supabase
    .from('app_modules')
    .select('id, type, custom_label, content')
    .eq('organization_id', organizationId)
    .eq('custom_slug', customSlug)
    .eq('is_enabled', true)
    .maybeSingle();

  if (error || !module) {
    return { data: null, error: error?.message ?? 'Page not found' };
  }

  return {
    data: {
      id: module.id,
      type: module.type,
      customLabel: module.custom_label,
      content: module.content as Record<string, unknown> | null,
    },
    error: null,
  };
}
