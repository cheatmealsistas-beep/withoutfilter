import { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import { getAffiliateProgramSettings } from '@/features/admin/admin.query';
import { redirect } from 'next/navigation';
import {
  AffiliateHeroSection,
  HowItWorksSection,
  SimpleCalculatorSection,
  ApplicationSection,
  FAQSection,
  affiliateContent
} from '@/features/affiliates';
import { StickyCTA } from './components/sticky-cta';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('affiliates.metadata');

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
    },
  };
}

export default async function AffiliatesPage() {
  const locale = await getLocale();

  // Check if affiliate program is enabled
  const settings = await getAffiliateProgramSettings();

  if (!settings?.enabled) {
    // Redirect to home if affiliate program is disabled
    redirect('/');
  }

  // Extract values from settings
  const commissionRate = settings.commission_rate || '30%';
  const rewardfulFormUrl = settings.rewardful_form_url || '';
  const averageSalePrice = settings.average_sale_price || 297;
  const calculatorEnabled = settings.calculator_enabled ?? true;

  // For calculator - extract number from percentage string
  const commissionNumber = parseInt(commissionRate.replace('%', '')) || 30;

  // For future A/B testing
  const variant = 'A';

  return (
    <>
      {/* Hero Section */}
      {affiliateContent.hero.enabled && (
        <AffiliateHeroSection
          content={affiliateContent.hero.content}
          locale={locale}
          variant={variant}
          commissionRate={commissionRate}
        />
      )}

      {/* How It Works */}
      {affiliateContent.howItWorks.enabled && (
        <HowItWorksSection
          content={affiliateContent.howItWorks.content}
          locale={locale}
          variant={variant}
        />
      )}

      {/* Calculator */}
      {affiliateContent.calculator.enabled && calculatorEnabled && (
        <SimpleCalculatorSection
          content={affiliateContent.calculator.content}
          locale={locale}
          variant={variant}
          commissionRate={commissionNumber}
          averageSalePrice={averageSalePrice}
        />
      )}

      {/* Application Form */}
      {affiliateContent.application.enabled && (
        <ApplicationSection
          content={affiliateContent.application.content}
          locale={locale}
          variant={variant}
          rewardfulFormUrl={rewardfulFormUrl}
          id={affiliateContent.application.id}
        />
      )}

      {/* FAQ - Now at the bottom as in original */}
      {affiliateContent.faq.enabled && (
        <FAQSection
          content={affiliateContent.faq.content}
          locale={locale}
          variant={variant}
          commissionRate={commissionRate}
        />
      )}

      {/* Sticky CTA Button */}
      <StickyCTA />
    </>
  );
}