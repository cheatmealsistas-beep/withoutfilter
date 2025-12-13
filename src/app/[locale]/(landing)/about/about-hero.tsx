'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/shared/components/ui/badge';

export function AboutHero() {
  const t = useTranslations('about');

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <Badge
            variant="secondary"
            className="mb-6 rounded-full px-4 py-1.5 bg-primary/10 text-primary border-0"
          >
            {t('hero.label')}
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            {t('hero.titleStart')}{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('hero.titleHighlight')}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            {t('hero.description')}
          </p>
        </div>
      </div>
    </section>
  );
}
