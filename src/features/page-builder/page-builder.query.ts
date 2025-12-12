import { createClient } from '@supabase/supabase-js';
import { migrateContent, isPageBuilderContent } from './lib/content-migration';
import type { PageBuilderContent, PageBlock } from './types';

// Admin client for bypassing RLS
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
 * Get page builder content for the editor (includes draft)
 * Automatically migrates legacy content to the new format
 */
export async function getPageBuilderContent(
  slug: string
): Promise<{ data: PageBuilderContent | null; error: string | null }> {
  const supabase = createAdminClient();

  // First get the organization by slug
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, primary_color')
    .eq('slug', slug)
    .single();

  if (orgError || !org) {
    return { data: null, error: orgError?.message ?? 'Organization not found' };
  }

  // Get the home module
  const { data: module, error: moduleError } = await supabase
    .from('app_modules')
    .select('content')
    .eq('organization_id', org.id)
    .eq('type', 'home')
    .maybeSingle();

  if (moduleError) {
    return { data: null, error: moduleError.message };
  }

  // If no module exists or empty content, create migrated content
  const content = module?.content;

  if (!content || Object.keys(content).length === 0) {
    // Return empty content with org's primary color
    const migrated = migrateContent(null, {
      primaryColor: org.primary_color || '#6366f1',
    });
    return { data: migrated, error: null };
  }

  // If already in new format, return as-is
  if (isPageBuilderContent(content)) {
    return { data: content, error: null };
  }

  // Migrate legacy content
  const migrated = migrateContent(content, {
    primaryColor: org.primary_color || '#6366f1',
  });

  return { data: migrated, error: null };
}

/**
 * Get published content for the public page
 * Returns the published blocks, or draft if nothing published yet (for backward compatibility)
 */
export async function getPublishedContent(
  organizationId: string
): Promise<{ data: PageBlock[] | null; error: string | null }> {
  const supabase = createAdminClient();

  // Get the home module
  const { data: module, error } = await supabase
    .from('app_modules')
    .select('content')
    .eq('organization_id', organizationId)
    .eq('type', 'home')
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!module?.content) {
    return { data: null, error: null };
  }

  const content = module.content;

  // If new format, return published blocks (or draft for backward compat)
  if (isPageBuilderContent(content)) {
    // Prefer published, fall back to draft for existing users
    const blocks = content.published?.blocks ?? content.draft.blocks;
    return { data: blocks, error: null };
  }

  // Legacy content - migrate and return as hero block
  const migrated = migrateContent(content);
  return { data: migrated.draft.blocks, error: null };
}

/**
 * Get organization by slug
 */
export async function getOrganizationBySlug(
  slug: string
): Promise<{ data: { id: string; primaryColor: string } | null; error: string | null }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('organizations')
    .select('id, primary_color')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? 'Organization not found' };
  }

  return {
    data: {
      id: data.id,
      primaryColor: data.primary_color || '#6366f1',
    },
    error: null,
  };
}

/**
 * Check if user is owner of the organization
 */
export async function isOwnerOfOrganization(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('organizations')
    .select('id')
    .eq('id', organizationId)
    .eq('created_by', userId)
    .maybeSingle();

  return !!data;
}
