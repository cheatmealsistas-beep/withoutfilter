'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { FadeIn, BorderBeam } from '@/shared/components/magic-ui';

export function AboutCTA() {
  const t = useTranslations('about.cta');

  return (
    <section className="container mx-auto px-4 py-24">
      <FadeIn>
        <div className="relative rounded-3xl border bg-gradient-to-b from-card to-card/50 p-12 md:p-16 text-center overflow-hidden">
          <BorderBeam size={400} duration={25} colorFrom="#9c40ff" colorTo="#ffaa40" />

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            {t('description')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8" asChild>
              <Link href="/register">
                {t('primaryButton')}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8" asChild>
              <Link href="/pricing">{t('secondaryButton')}</Link>
            </Button>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
