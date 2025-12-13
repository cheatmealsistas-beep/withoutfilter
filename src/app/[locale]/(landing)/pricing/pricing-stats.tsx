'use client';

import { useTranslations } from 'next-intl';
import { NumberTicker } from '@/shared/components/magic-ui';
import { Users, Server, Globe, Headphones } from 'lucide-react';

export function PricingStats() {
  const t = useTranslations('pricing');

  const stats = [
    { icon: Users, value: 1000, suffix: '+', key: 'users' },
    { icon: Server, value: 99.9, suffix: '%', decimals: 1, key: 'uptime' },
    { icon: Globe, value: 30, suffix: '+', key: 'countries' },
    { icon: Headphones, value: 24, suffix: '/7', key: 'support' }
  ];

  return (
    <div className="mt-16 pt-12 border-t border-border/50">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.key} className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              <NumberTicker value={stat.value} decimalPlaces={stat.decimals || 0} />
              {stat.suffix}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{t(`stats.${stat.key}`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
