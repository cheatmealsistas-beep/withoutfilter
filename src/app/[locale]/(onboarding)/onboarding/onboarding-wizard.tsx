'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  WizardShell,
  StepWelcome,
  StepProfessionalType,
  StepAppSetup,
  StepLogo,
  StepPreviewEditor,
} from '@/features/onboarding';
import { skipOnboardingAction } from '@/features/onboarding/onboarding.actions';
import { defaultHomeContent } from '@/features/onboarding/types';
import type { ProfessionalType, HomeContent } from '@/features/onboarding/types';
import { toast } from 'sonner';

const TOTAL_STEPS = 5;

interface OnboardingWizardProps {
  initialData: {
    step: number;
    fullName?: string;
    professionalType?: ProfessionalType;
    app?: {
      id: string;
      name: string;
      slug: string;
      logoUrl: string | null;
    };
    homeContent: HomeContent;
  };
  locale: string;
}

export function OnboardingWizard({ initialData, locale }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialData.step);
  const [professionalType, setProfessionalType] = useState<ProfessionalType | undefined>(
    initialData.professionalType
  );
  const [appData, setAppData] = useState(initialData.app);

  const handleStepComplete = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(async () => {
    try {
      const result = await skipOnboardingAction();
      if (result.success) {
        router.push(`/${locale}/dashboard`);
      } else {
        toast.error(result.error ?? 'Error al saltar');
      }
    } catch {
      toast.error('Error inesperado');
    }
  }, [router, locale]);

  const handleComplete = useCallback(() => {
    // Redirect to pricing after completing onboarding
    router.push(`/${locale}/pricing`);
  }, [router, locale]);

  // Get home content based on professional type
  const getHomeContent = (): HomeContent => {
    if (initialData.homeContent && Object.keys(initialData.homeContent).length > 0) {
      return initialData.homeContent;
    }
    return professionalType
      ? defaultHomeContent[professionalType]
      : defaultHomeContent.other;
  };

  return (
    <WizardShell
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      showBack={currentStep > 0 && currentStep < TOTAL_STEPS - 1}
      showSkip={currentStep < TOTAL_STEPS - 1}
      onBack={handleBack}
      onSkip={handleSkip}
    >
      {currentStep === 0 && (
        <StepWelcome
          defaultName={initialData.fullName}
          onComplete={handleStepComplete}
        />
      )}

      {currentStep === 1 && (
        <StepProfessionalType
          onComplete={() => {
            // We need to refresh data after this step
            handleStepComplete();
          }}
        />
      )}

      {currentStep === 2 && (
        <StepAppSetup onComplete={handleStepComplete} />
      )}

      {currentStep === 3 && (
        <StepLogo onComplete={handleStepComplete} />
      )}

      {currentStep === 4 && (
        <StepPreviewEditor
          defaultContent={getHomeContent()}
          appName={appData?.name ?? 'Mi App'}
          logoUrl={appData?.logoUrl ?? undefined}
          onComplete={handleComplete}
        />
      )}
    </WizardShell>
  );
}
