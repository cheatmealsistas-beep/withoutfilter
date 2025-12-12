import { NextResponse } from 'next/server';
import { createClientServer } from '@/shared/database/supabase';
import { syncAdminRoleFromWhitelist } from '@/shared/auth/roles';
import { getUserOrganizationSlug } from '@/features/auth/auth.command';
import { getOnboardingState } from '@/features/onboarding/onboarding.query';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Extract locale from URL path
  const pathname = new URL(request.url).pathname;
  const localeMatch = pathname.match(/^\/([a-z]{2})\//);
  const locale = localeMatch ? localeMatch[1] : 'es';

  if (code) {
    const supabase = await createClientServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sync admin role from whitelist on successful login
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        await syncAdminRoleFromWhitelist(user.id, user.email);
      }

      // Determine redirect destination
      let redirectPath = `/${locale}/onboarding`;
      if (user) {
        const { data: onboardingState } = await getOnboardingState(user.id);
        const onboardingCompleted = !!(onboardingState?.isCompleted || onboardingState?.isSkipped);

        if (onboardingCompleted) {
          const organizationSlug = await getUserOrganizationSlug(user.id);
          if (organizationSlug) {
            redirectPath = `/${locale}/app/${organizationSlug}/admin`;
          } else {
            redirectPath = `/${locale}/choose-plan`;
          }
        }
        // If onboarding not complete, default redirectPath to /onboarding is correct
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
