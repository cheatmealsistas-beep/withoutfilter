'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { WizardProgress } from './wizard-progress';
import { WizardNavigation } from './wizard-navigation';

interface WizardShellProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onBack?: () => void;
  onSkip?: () => void;
  showBack?: boolean;
  showSkip?: boolean;
}

export function WizardShell({
  currentStep,
  totalSteps,
  children,
  onBack,
  onSkip,
  showBack = false,
  showSkip = true,
}: WizardShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress bar at top */}
      <WizardProgress current={currentStep} total={totalSteps} />

      {/* Step content with animation */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-md mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation at bottom */}
      <WizardNavigation
        showBack={showBack}
        showSkip={showSkip}
        onBack={onBack}
        onSkip={onSkip}
      />
    </div>
  );
}
