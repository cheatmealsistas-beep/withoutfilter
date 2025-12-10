'use client';

import { useTranslations } from 'next-intl';
import { FadeIn, DotPattern, AnimatedGradientText } from '@/shared/components/magic-ui';

export function AboutHero() {
  const t = useTranslations('about');

  return (
    <section className="relative flex flex-col items-center justify-center px-4 py-32 text-center overflow-hidden">
      <DotPattern className="[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]" />

      <FadeIn>
        <p className="text-sm font-medium text-primary mb-4 tracking-wider uppercase">
          {t('hero.label')}
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl max-w-3xl">
          {t('hero.titleStart')}{' '}
          <AnimatedGradientText>{t('hero.titleHighlight')}</AnimatedGradientText>
        </h1>
      </FadeIn>

      <FadeIn delay={0.2}>
        <p className="mt-6 text-lg md:text-xl leading-8 text-muted-foreground max-w-2xl">
          {t('hero.description')}
        </p>
      </FadeIn>
    </section>
  );
}
