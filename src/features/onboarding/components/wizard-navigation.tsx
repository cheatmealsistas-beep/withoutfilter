'use client';

import { Button } from '@/shared/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface WizardNavigationProps {
  showBack?: boolean;
  showSkip?: boolean;
  onBack?: () => void;
  onSkip?: () => void;
  backLabel?: string;
  skipLabel?: string;
}

export function WizardNavigation({
  showBack = false,
  showSkip = true,
  onBack,
  onSkip,
  backLabel = 'Atrás',
  skipLabel = 'Saltar por ahora',
}: WizardNavigationProps) {
  return (
    <div className="border-t bg-background/80 backdrop-blur-sm">
      <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          {showBack && onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backLabel}
            </Button>
          )}
        </div>
        <div>
          {showSkip && onSkip && (
            <Button variant="link" size="sm" onClick={onSkip} className="text-muted-foreground">
              {skipLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
