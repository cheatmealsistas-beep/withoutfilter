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

  // First, get the organization
  // Note: is_personal can be null or false for non-personal orgs
  const { data: org, error } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url, tagline, primary_color, created_by')
    .eq('slug', slug)
    .or('is_personal.eq.false,is_personal.is.null')
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
    primaryColor: org.primary_color || '#000000',
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
