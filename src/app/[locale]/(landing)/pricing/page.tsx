import { getTranslations } from 'next-intl/server';
import { getUser } from '@/shared/auth';
import { StripePricingTable } from '@/features/billing';
import { Shield } from 'lucide-react';
import { PricingHero } from './pricing-hero';
import { PricingStats } from './pricing-stats';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricing' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function PricingPage() {
  const user = await getUser();
  const t = await getTranslations('pricing');

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative mx-auto px-4">
        <PricingHero />

        {/* Stripe Pricing Table */}
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 md:p-8 shadow-xl shadow-primary/5">
            <StripePricingTable userId={user?.id || ''} />
          </div>
        </div>

        {/* Money-back guarantee */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
            <Shield className="h-4 w-4" />
            {t('guarantee')}
          </div>
        </div>

        <PricingStats />

        {!user && (
          <p className="text-center text-sm text-muted-foreground mt-8">
            {t('noAccount')}
          </p>
        )}
      </div>
    </section>
  );
}
