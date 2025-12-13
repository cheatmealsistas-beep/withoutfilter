import { createClientServer } from '@/shared/database/supabase';
import type { OwnerDashboardData } from './types';

/**
 * Check if user is owner of an organization by slug
 */
export async function isOwnerOfOrganization(
  userId: string,
  slug: string
): Promise<boolean> {
  const supabase = await createClientServer();

  const { data } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .eq('created_by', userId)
    .maybeSingle();

  return !!data;
}

/**
 * Get organization by slug for owner
 */
export async function getOrganizationBySlug(slug: string): Promise<{
  data: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    createdBy: string;
  } | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url, created_by')
    .eq('slug', slug)
    .or('is_personal.eq.false,is_personal.is.null')
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return {
    data: data
      ? {
          id: data.id,
          name: data.name,
          slug: data.slug,
          logoUrl: data.logo_url,
          createdBy: data.created_by,
        }
      : null,
    error: null,
  };
}

/**
 * Get owner dashboard data
 */
export async function getOwnerDashboardData(
  userId: string,
  slug: string
): Promise<{ data: OwnerDashboardData | null; error: string | null }> {
  const supabase = await createClientServer();

  // Get organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url, created_by')
    .eq('slug', slug)
    .eq('created_by', userId)
    .or('is_personal.eq.false,is_personal.is.null')
    .maybeSingle();

  if (orgError || !org) {
    return { data: null, error: orgError?.message || 'Organization not found' };
  }

  // Get modules for this organization
  const { data: modules } = await supabase
    .from('app_modules')
    .select('id, type, is_enabled, is_public, display_order')
    .eq('organization_id', org.id)
    .order('display_order', { ascending: true });

  // Get user profile for trial info
  const { data: profile } = await supabase
    .from('profiles')
    .select('trial_ends_at')
    .eq('id', userId)
    .single();

  // Calculate trial days remaining
  let trialDaysRemaining: number | null = null;
  if (profile?.trial_ends_at) {
    const trialEnd = new Date(profile.trial_ends_at);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    trialDaysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (trialDaysRemaining < 0) trialDaysRemaining = 0;
  }

  return {
    data: {
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        logoUrl: org.logo_url,
      },
      stats: {
        totalViews: 0, // TODO: Implement analytics
        totalClicks: 0,
        trialDaysRemaining,
        modulesCount: modules?.length || 0,
      },
      modules: (modules || []).map((m) => ({
        id: m.id,
        type: m.type,
        isEnabled: m.is_enabled ?? false,
        isPublic: m.is_public ?? true,
        displayOrder: m.display_order ?? 0,
      })),
      trialEndsAt: profile?.trial_ends_at || null,
    },
    error: null,
  };
}

/**
 * Get home module content for an organization
 */
export async function getHomeContent(
  slug: string
): Promise<{
  data: {
    headline: string;
    description: string | null;
    ctaText: string | null;
  } | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  // Get organization
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .or('is_personal.eq.false,is_personal.is.null')
    .maybeSingle();

  if (!org) {
    return { data: null, error: 'Organization not found' };
  }

  // Get home module content
  const { data: module, error } = await supabase
    .from('app_modules')
    .select('content')
    .eq('organization_id', org.id)
    .eq('type', 'home')
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!module?.content) {
    return {
      data: {
        headline: '',
        description: null,
        ctaText: null,
      },
      error: null,
    };
  }

  const content = module.content as {
    headline?: string;
    description?: string | null;
    ctaText?: string | null;
  };

  return {
    data: {
      headline: content.headline || '',
      description: content.description || null,
      ctaText: content.ctaText || null,
    },
    error: null,
  };
}
