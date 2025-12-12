'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/shared/auth';
import {
  handleStep0,
  handleStep1,
  handleStep2,
  handleStep3,
  handleStep4,
  handleCompleteOnboarding,
  handleSkipOnboarding,
  handleCheckSlug,
  handleGetCurrentApp,
} from './onboarding.handler';
import { getOnboardingState } from './onboarding.query';
import type { ProfessionalType, HomeContent } from './types';

export interface ActionResult {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

/**
 * Save step 0 - User's name
 */
export async function saveStep0Action(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const fullName = formData.get('fullName') as string;

  const result = await handleStep0(user.id, { fullName });

  if (result.success) {
    revalidatePath('/onboarding');
  }

  return result;
}

/**
 * Save step 1 - Professional type
 */
export async function saveStep1Action(
  professionalType: ProfessionalType
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const result = await handleStep1(user.id, { professionalType });

  if (result.success) {
    revalidatePath('/onboarding');
  }

  return result;
}

/**
 * Save step 2 - App name and slug
 */
export async function saveStep2Action(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const appName = formData.get('appName') as string;
  const slug = formData.get('slug') as string;

  // Get professional type from profile
  const state = await getOnboardingState(user.id);
  const professionalType = state.data?.data?.professionalType ?? 'other';

  const result = await handleStep2(
    user.id,
    { appName, slug },
    professionalType as ProfessionalType
  );

  if (result.success) {
    revalidatePath('/onboarding');
  }

  return result;
}

/**
 * Save step 3 - Logo (optional)
 */
export async function saveStep3Action(logoUrl?: string): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const { organizationId } = await handleGetCurrentApp(user.id);
  if (!organizationId) {
    return { success: false, error: 'No se encontró la app' };
  }

  const result = await handleStep3(user.id, organizationId, {
    logoUrl: logoUrl || '',
  });

  if (result.success) {
    revalidatePath('/onboarding');
  }

  return result;
}

/**
 * Save step 4 - Home content
 */
export async function saveStep4Action(
  content: HomeContent
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const { organizationId } = await handleGetCurrentApp(user.id);
  if (!organizationId) {
    return { success: false, error: 'No se encontró la app' };
  }

  const result = await handleStep4(organizationId, { content });

  if (result.success) {
    revalidatePath('/onboarding');
  }

  return result;
}

/**
 * Complete onboarding and redirect to pricing
 */
export async function completeOnboardingAction(): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const result = await handleCompleteOnboarding(user.id);

  if (result.success) {
    revalidatePath('/');
  }

  return result;
}

/**
 * Skip onboarding
 */
export async function skipOnboardingAction(): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const result = await handleSkipOnboarding(user.id);

  if (result.success) {
    revalidatePath('/');
  }

  return result;
}

/**
 * Check if slug is available (for real-time validation)
 */
export async function checkSlugAction(
  slug: string
): Promise<{ available: boolean; error?: string }> {
  return handleCheckSlug(slug);
}

/**
 * Get current onboarding state
 */
export async function getOnboardingStateAction(): Promise<{
  step: number;
  isCompleted: boolean;
  isSkipped: boolean;
  data: Record<string, unknown>;
} | null> {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const state = await getOnboardingState(user.id);

  if (!state.data) {
    return null;
  }

  return {
    step: state.data.currentStep,
    isCompleted: state.data.isCompleted,
    isSkipped: state.data.isSkipped,
    data: state.data.data as Record<string, unknown>,
  };
}
