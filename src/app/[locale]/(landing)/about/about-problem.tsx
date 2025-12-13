'use client';

import { useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';

export function AboutProblem() {
  const t = useTranslations('about.problem');

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-amber-500/10 mb-6">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            {t('title')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {t('description')}
          </p>
        </div>
      </div>
    </section>
  );
}
