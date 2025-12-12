import {
  step0Schema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  defaultHomeContent,
  type Step0Input,
  type Step1Input,
  type Step2Input,
  type Step3Input,
  type Step4Input,
  type ProfessionalType,
} from './types';
import {
  saveStep0,
  saveStep1,
  saveStep2,
  saveStep3,
  saveStep4,
  setDefaultHomeContent,
  completeOnboarding,
  skipOnboarding,
} from './onboarding.command';
import { checkSlugAvailable, getUserFirstApp } from './onboarding.query';

export interface HandlerResult {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

/**
 * Handle step 0: Save user's full name
 */
export async function handleStep0(
  userId: string,
  input: Step0Input
): Promise<HandlerResult> {
  const validation = step0Schema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const result = await saveStep0(userId, validation.data.fullName);

  return {
    success: result.success,
    error: result.error ?? undefined,
  };
}

/**
 * Handle step 1: Save professional type
 */
export async function handleStep1(
  userId: string,
  input: Step1Input
): Promise<HandlerResult> {
  const validation = step1Schema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const result = await saveStep1(userId, validation.data.professionalType);

  return {
    success: result.success,
    error: result.error ?? undefined,
  };
}

/**
 * Handle step 2: Create app with name and slug
 */
export async function handleStep2(
  userId: string,
  input: Step2Input,
  professionalType: ProfessionalType
): Promise<HandlerResult> {
  const validation = step2Schema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  // Check if slug is available
  const slugCheck = await checkSlugAvailable(validation.data.slug);

  if (!slugCheck.available) {
    return {
      success: false,
      error: 'Este slug ya está en uso. Prueba con otro.',
    };
  }

  // Create the organization
  const result = await saveStep2(
    userId,
    validation.data.appName,
    validation.data.slug
  );

  if (!result.success || !result.organizationId) {
    return {
      success: false,
      error: result.error ?? 'Error al crear la app',
    };
  }

  // Set default home content based on professional type
  const defaultContent = defaultHomeContent[professionalType];
  await setDefaultHomeContent(result.organizationId, defaultContent);

  return {
    success: true,
    data: { organizationId: result.organizationId },
  };
}

/**
 * Handle step 3: Save logo (optional)
 */
export async function handleStep3(
  userId: string,
  organizationId: string,
  input: Step3Input
): Promise<HandlerResult> {
  const validation = step3Schema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const result = await saveStep3(
    userId,
    organizationId,
    validation.data.logoUrl || null
  );

  return {
    success: result.success,
    error: result.error ?? undefined,
  };
}

/**
 * Handle step 4: Save home content
 */
export async function handleStep4(
  organizationId: string,
  input: Step4Input
): Promise<HandlerResult> {
  const validation = step4Schema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const result = await saveStep4(organizationId, validation.data.content);

  return {
    success: result.success,
    error: result.error ?? undefined,
  };
}

/**
 * Handle completing the onboarding
 */
export async function handleCompleteOnboarding(
  userId: string
): Promise<HandlerResult> {
  const result = await completeOnboarding(userId);

  return {
    success: result.success,
    error: result.error ?? undefined,
  };
}

/**
 * Handle skipping the onboarding
 */
export async function handleSkipOnboarding(
  userId: string
): Promise<HandlerResult> {
  const result = await skipOnboarding(userId);

  return {
    success: result.success,
    error: result.error ?? undefined,
  };
}

/**
 * Check slug availability (for real-time validation)
 */
export async function handleCheckSlug(
  slug: string
): Promise<{ available: boolean; error?: string }> {
  // Basic validation first
  const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

  if (!slugRegex.test(slug)) {
    return {
      available: false,
      error: 'Slug inválido',
    };
  }

  if (slug.length < 3) {
    return {
      available: false,
      error: 'Mínimo 3 caracteres',
    };
  }

  if (slug.length > 30) {
    return {
      available: false,
      error: 'Máximo 30 caracteres',
    };
  }

  const result = await checkSlugAvailable(slug);

  return {
    available: result.available,
    error: result.available ? undefined : 'Este slug ya está en uso',
  };
}

/**
 * Get current app for user (used in step 3 and 4)
 */
export async function handleGetCurrentApp(userId: string): Promise<{
  organizationId: string | null;
  error?: string;
}> {
  const result = await getUserFirstApp(userId);

  return {
    organizationId: result.data?.id ?? null,
    error: result.error ?? undefined,
  };
}
