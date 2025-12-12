import { createClient } from '@supabase/supabase-js';
import { createClientServer } from '@/shared/database/supabase';
import type { OnboardingState, HomeContent } from './types';

// Admin client for queries that need to bypass RLS
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
 * Get onboarding state for a user
 */
export async function getOnboardingState(
  userId: string
): Promise<{ data: OnboardingState | null; error: string | null }> {
  const supabase = await createClientServer();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(
      'full_name, professional_type, onboarding_step, onboarding_completed_at, onboarding_skipped_at'
    )
    .eq('id', userId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return {
    data: {
      currentStep: profile.onboarding_step ?? 0,
      isCompleted: !!profile.onboarding_completed_at,
      isSkipped: !!profile.onboarding_skipped_at,
      data: {
        fullName: profile.full_name ?? undefined,
        professionalType: profile.professional_type as OnboardingState['data']['professionalType'],
      },
    },
    error: null,
  };
}

/**
 * Check if a slug is available
 */
export async function checkSlugAvailable(
  slug: string
): Promise<{ available: boolean; error: string | null }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    return { available: false, error: error.message };
  }

  return { available: !data, error: null };
}

/**
 * Get user's first app (non-personal organization)
 */
export async function getUserFirstApp(userId: string): Promise<{
  data: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  } | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url')
    .eq('created_by', userId)
    .or('is_personal.eq.false,is_personal.is.null')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  return {
    data: data
      ? {
          id: data.id,
          name: data.name,
          slug: data.slug ?? '',
          logoUrl: data.logo_url,
        }
      : null,
    error: null,
  };
}

/**
 * Get home module content for an organization
 */
export async function getHomeModuleContent(organizationId: string): Promise<{
  data: HomeContent | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('app_modules')
    .select('content')
    .eq('organization_id', organizationId)
    .eq('type', 'home')
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return {
    data: data.content as HomeContent | null,
    error: null,
  };
}

/**
 * Get all modules for an organization
 */
export async function getOrganizationModules(organizationId: string): Promise<{
  data: Array<{
    id: string;
    type: string;
    isEnabled: boolean;
    isPublic: boolean;
    displayOrder: number;
    content: Record<string, unknown>;
  }>;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('app_modules')
    .select('id, type, is_enabled, is_public, display_order, content')
    .eq('organization_id', organizationId)
    .order('display_order', { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }

  return {
    data: (data ?? []).map((m) => ({
      id: m.id,
      type: m.type,
      isEnabled: m.is_enabled ?? false,
      isPublic: m.is_public ?? true,
      displayOrder: m.display_order ?? 0,
      content: (m.content as Record<string, unknown>) ?? {},
    })),
    error: null,
  };
}
