'use client';

import { useTranslations } from 'next-intl';
import { Target, Zap, Heart } from 'lucide-react';
import { FadeIn } from '@/shared/components/magic-ui';

const values = [
  {
    icon: Target,
    key: 'mission',
  },
  {
    icon: Zap,
    key: 'vision',
  },
  {
    icon: Heart,
    key: 'values',
  },
];

export function AboutMission() {
  const t = useTranslations('about.mission');

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="grid md:grid-cols-3 gap-8">
        {values.map((item, index) => (
          <FadeIn key={item.key} delay={index * 0.1}>
            <div className="text-center p-8 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card transition-colors">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {t(`${item.key}.title`)}
              </h3>
              <p className="text-muted-foreground">
                {t(`${item.key}.description`)}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
