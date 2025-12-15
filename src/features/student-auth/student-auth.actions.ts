'use server';

import { redirect } from 'next/navigation';
import { getUser } from '@/shared/auth';
import { handleLogin, handleRegister, handleMagicLink } from '@/features/auth/auth.handler';
import { handleSelfEnroll } from '@/features/courses/courses.handler';
import { getCourseBySlug } from '@/features/courses/courses.query';
import { getPublicAppBySlug } from '@/features/public-app/public-app.query';
import type { AuthState } from '@/features/auth/types';
import type { AttributionData } from '@/shared/types';

/**
 * Parse attribution data from form data
 */
function parseAttributionFromForm(formData: FormData): AttributionData | undefined {
  const attributionJson = formData.get('attribution_data') as string;
  if (!attributionJson) return undefined;

  try {
    return JSON.parse(attributionJson) as AttributionData;
  } catch {
    return undefined;
  }
}

/**
 * Try to auto-enroll student in a course if coming from a course page
 * This is a best-effort operation - failures are silent
 */
async function tryAutoEnroll(userId: string, orgSlug: string, redirectPath: string): Promise<void> {
  // Check if redirect is to a course page: /courses/[courseSlug]
  const courseMatch = redirectPath.match(/^\/courses\/([^/]+)$/);
  if (!courseMatch) return;

  const courseSlug = courseMatch[1];

  try {
    // Get org to find course
    const { data: app } = await getPublicAppBySlug(orgSlug);
    if (!app) return;

    // Get course by slug
    const { data: course } = await getCourseBySlug(app.id, courseSlug);
    if (!course) return;

    // Try to self-enroll (will fail silently if already enrolled or course is private)
    await handleSelfEnroll(course.id, userId);
  } catch {
    // Silent fail - user can still enroll manually
  }
}

/**
 * Student login action - redirects back to the app, not to onboarding
 */
export async function studentLoginAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const locale = (formData.get('locale') as string) || 'es';
  const slug = formData.get('slug') as string;
  const redirectTo = formData.get('redirect') as string;

  const result = await handleLogin(email, password);

  if (result.success) {
    // Get the logged in user to try auto-enrollment
    const user = await getUser();
    if (user && redirectTo) {
      // Try to auto-enroll if coming from a course page
      await tryAutoEnroll(user.id, slug, redirectTo);
    }

    // For students, redirect back to the app - NOT to onboarding
    if (redirectTo) {
      // Redirect to specific page (e.g., course they were trying to access)
      redirect(`/${locale}/app/${slug}${redirectTo}`);
    } else {
      // Default: go to student's courses dashboard
      redirect(`/${locale}/app/${slug}/mis-cursos`);
    }
  }

  return { ...result, email };
}

/**
 * Student register action - creates account without onboarding
 */
export async function studentRegisterAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const locale = (formData.get('locale') as string) || 'es';
  const slug = formData.get('slug') as string;
  const redirectTo = formData.get('redirect') as string;
  const attributionData = parseAttributionFromForm(formData);

  const result = await handleRegister(email, password, attributionData, locale);

  // If registration successful and no email confirmation needed
  if (result.success && !result.messageKey) {
    // Get the logged in user to try auto-enrollment
    const user = await getUser();
    if (user && redirectTo) {
      // Try to auto-enroll if coming from a course page
      await tryAutoEnroll(user.id, slug, redirectTo);
    }

    // For students, redirect back to the app - NOT to onboarding
    if (redirectTo) {
      redirect(`/${locale}/app/${slug}${redirectTo}`);
    } else {
      redirect(`/${locale}/app/${slug}/mis-cursos`);
    }
  }

  return { ...result, email };
}

/**
 * Student magic link action
 * Note: For now, magic link redirects to default onboarding flow
 * TODO: Add custom redirect support for students
 */
export async function studentMagicLinkAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const locale = (formData.get('locale') as string) || 'es';
  const attributionData = parseAttributionFromForm(formData);

  const result = await handleMagicLink(email, attributionData, locale);

  return { ...result, email };
}
