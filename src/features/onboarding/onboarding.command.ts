import { createClient } from '@supabase/supabase-js';
import type { ProfessionalType, HomeContent } from './types';

// Admin client with service role for all onboarding operations (bypass RLS)
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
 * Update profile with onboarding step 0 data (full name)
 */
export async function saveStep0(
  userId: string,
  fullName: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      onboarding_step: 1,
    })
    .eq('id', userId);

  return { success: !error, error: error?.message ?? null };
}

/**
 * Update profile with onboarding step 1 data (professional type)
 */
export async function saveStep1(
  userId: string,
  professionalType: ProfessionalType
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      professional_type: professionalType,
      onboarding_step: 2,
    })
    .eq('id', userId);

  return { success: !error, error: error?.message ?? null };
}

/**
 * Create app (organization) and update profile step - Step 2
 * Uses admin client to bypass RLS for organization creation
 */
export async function saveStep2(
  userId: string,
  appName: string,
  slug: string
): Promise<{ success: boolean; organizationId: string | null; error: string | null }> {
  const supabase = createAdminClient();

  // Create the organization (app)
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: appName,
      slug: slug,
      is_personal: false,
      created_by: userId,
    })
    .select('id')
    .single();

  if (orgError) {
    return { success: false, organizationId: null, error: orgError.message };
  }

  // Add user as owner of the organization
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: org.id,
      user_id: userId,
      role: 'owner',
    });

  if (memberError) {
    return { success: false, organizationId: org.id, error: memberError.message };
  }

  // Update profile step
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      onboarding_step: 3,
      current_organization_id: org.id,
    })
    .eq('id', userId);

  if (profileError) {
    return { success: false, organizationId: org.id, error: profileError.message };
  }

  return { success: true, organizationId: org.id, error: null };
}

/**
 * Update organization logo - Step 3
 */
export async function saveStep3(
  userId: string,
  organizationId: string,
  logoUrl: string | null
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();

  // Update organization logo if provided
  if (logoUrl) {
    const { error: orgError } = await supabase
      .from('organizations')
      .update({ logo_url: logoUrl })
      .eq('id', organizationId);

    if (orgError) {
      return { success: false, error: orgError.message };
    }
  }

  // Update profile step
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ onboarding_step: 4 })
    .eq('id', userId);

  return { success: !profileError, error: profileError?.message ?? null };
}

/**
 * Update home module content - Step 4
 */
export async function saveStep4(
  organizationId: string,
  content: HomeContent
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();

  // Use upsert to ensure the module exists
  const { data: existingModule } = await supabase
    .from('app_modules')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('type', 'home')
    .maybeSingle();

  if (existingModule) {
    const { error } = await supabase
      .from('app_modules')
      .update({ content })
      .eq('id', existingModule.id);

    return { success: !error, error: error?.message ?? null };
  } else {
    // Create if doesn't exist
    const { error } = await supabase
      .from('app_modules')
      .insert({
        organization_id: organizationId,
        type: 'home',
        is_enabled: true,
        is_public: true,
        display_order: 0,
        content,
      });

    return { success: !error, error: error?.message ?? null };
  }
}

/**
 * Set default home content based on professional type
 */
export async function setDefaultHomeContent(
  organizationId: string,
  content: HomeContent
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();

  // First check if the home module exists (created by trigger)
  const { data: existingModule } = await supabase
    .from('app_modules')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('type', 'home')
    .maybeSingle();

  if (existingModule) {
    // Update existing module
    const { error } = await supabase
      .from('app_modules')
      .update({ content })
      .eq('id', existingModule.id);

    return { success: !error, error: error?.message ?? null };
  } else {
    // Create the module if it doesn't exist (fallback if trigger didn't run)
    const { error } = await supabase
      .from('app_modules')
      .insert({
        organization_id: organizationId,
        type: 'home',
        is_enabled: true,
        is_public: true,
        display_order: 0,
        content,
      });

    return { success: !error, error: error?.message ?? null };
  }
}

/**
 * Complete onboarding
 */
export async function completeOnboarding(
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return { success: !error, error: error?.message ?? null };
}

/**
 * Skip onboarding
 */
export async function skipOnboarding(
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      onboarding_skipped_at: new Date().toISOString(),
    })
    .eq('id', userId);

  return { success: !error, error: error?.message ?? null };
}
