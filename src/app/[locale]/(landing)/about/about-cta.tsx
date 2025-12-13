'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Users, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export function AboutCTA() {
  const t = useTranslations('about.cta');

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10" />

      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="container relative mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {t('title')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {t('description')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              asChild
              size="lg"
              className="h-14 px-8 text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Link href="/register">
                {t('primaryButton')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base rounded-xl border-2 bg-background/50 backdrop-blur-sm hover:bg-background/80"
            >
              <Link href="/pricing">{t('secondaryButton')}</Link>
            </Button>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-background/50 backdrop-blur-sm mb-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-xl font-bold text-foreground">1,000+</div>
              <div className="text-xs text-muted-foreground">Users</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-background/50 backdrop-blur-sm mb-2">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="text-xl font-bold text-foreground">10 min</div>
              <div className="text-xs text-muted-foreground">Setup</div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-background/50 backdrop-blur-sm mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="text-xl font-bold text-foreground">0</div>
              <div className="text-xs text-muted-foreground">Code</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
