'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AnimatedShinyText } from '@/shared/components/magic-ui';
import { cn } from '@/shared/lib/utils';

export function PricingHero() {
  const t = useTranslations('pricing');

  return (
    <div className="text-center mb-12">
      <div className="mb-6 flex justify-center">
        <div
          className={cn(
            'group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800'
          )}
        >
          <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
            <span>{t('badge')}</span>
            <ArrowRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </AnimatedShinyText>
        </div>
      </div>

      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
        {t('title')}
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        {t('description')}
      </p>
    </div>
  );
}
