'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/shared/components/ui/badge';
import { Shield, Clock, CreditCard, Zap } from 'lucide-react';

export function PricingHero() {
  const t = useTranslations('pricing');

  const trustIndicators = [
    { icon: Shield, key: 'secure' },
    { icon: Clock, key: 'cancel' },
    { icon: CreditCard, key: 'noCommitment' },
    { icon: Zap, key: 'instant' }
  ];

  return (
    <div className="text-center mb-12">
      <Badge
        variant="secondary"
        className="mb-6 rounded-full px-4 py-1.5 bg-primary/10 text-primary border-0"
      >
        {t('badge')}
      </Badge>

      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
        {t('title')}
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
        {t('description')}
      </p>

      {/* Trust indicators */}
      <div className="flex flex-wrap justify-center gap-6">
        {trustIndicators.map((indicator) => (
          <div key={indicator.key} className="flex items-center gap-2 text-sm text-muted-foreground">
            <indicator.icon className="h-4 w-4 text-primary" />
            <span>{t(`trust.${indicator.key}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
