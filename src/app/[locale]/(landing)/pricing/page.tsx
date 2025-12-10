import { getTranslations } from 'next-intl/server';
import { getUser } from '@/shared/auth';
import { StripePricingTable } from '@/features/billing';
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

  return (
    <div className="container mx-auto px-4 py-16">
      <PricingHero />

      <div className="max-w-5xl mx-auto relative">
        <StripePricingTable userId={user?.id || ''} />
      </div>

      <PricingStats />

      {!user && (
        <p className="text-center text-sm text-muted-foreground mt-8">
          You&apos;ll need to create an account or sign in during checkout.
        </p>
      )}
    </div>
  );
}
