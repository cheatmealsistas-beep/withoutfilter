import { redirect } from 'next/navigation';
import { getUser } from '@/shared/auth';
import { getOnboardingState, getUserFirstApp, getHomeModuleContent } from '@/features/onboarding/onboarding.query';
import { OnboardingWizard } from './onboarding-wizard';
import { defaultHomeContent } from '@/features/onboarding/types';
import type { ProfessionalType, HomeContent } from '@/features/onboarding/types';

interface OnboardingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { locale } = await params;
  const user = await getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Get onboarding state
  const { data: state } = await getOnboardingState(user.id);

  // If already completed or skipped, redirect to dashboard
  if (state?.isCompleted || state?.isSkipped) {
    redirect(`/${locale}/dashboard`);
  }

  // Get user's first app if exists (for step 3 and 4)
  const { data: app } = await getUserFirstApp(user.id);

  // Get home content if app exists
  let homeContent: HomeContent | null = null;
  if (app?.id) {
    const { data } = await getHomeModuleContent(app.id);
    homeContent = data;
  }

  // Prepare initial data for the wizard
  const initialData = {
    step: state?.currentStep ?? 0,
    fullName: state?.data?.fullName ?? '',
    professionalType: state?.data?.professionalType as ProfessionalType | undefined,
    app: app ?? undefined,
    homeContent: homeContent ?? (state?.data?.professionalType
      ? defaultHomeContent[state.data.professionalType as ProfessionalType]
      : defaultHomeContent.other),
  };

  return (
    <OnboardingWizard
      initialData={initialData}
      locale={locale}
    />
  );
}
