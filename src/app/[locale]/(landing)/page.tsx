import { getTranslations, getLocale } from 'next-intl/server';
import {
  HeroSection,
  ProblemSolutionSection,
  FeaturesSection,
  HowItWorksSection,
  TechStackSection,
  SocialProofSection,
  PricingSection,
  AffiliateModuleSection,
  UrgencySection,
  FAQSection,
  CTASection,
  homeContent
} from '@/features/home';
import { getSetting } from '@/features/admin/admin.query';
import type { AffiliateProgramSettings } from '@/features/admin/types';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo.landing' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function HomePage() {
  const locale = await getLocale();

  // Get affiliate settings to check if home module should be displayed
  const affiliateSettings = await getSetting<AffiliateProgramSettings>('affiliate_program');
  const showAffiliateModule = affiliateSettings?.enabled && affiliateSettings?.display_in_home;

  return (
    <>
      {/* Hero Section */}
      {homeContent.hero.enabled && (
        <HeroSection
          content={homeContent.hero.content}
          locale={locale}
          variant="A"
        />
      )}

      {/* Problem/Solution Comparison */}
      {homeContent.problemSolution?.enabled && (
        <ProblemSolutionSection
          content={homeContent.problemSolution.content}
          locale={locale}
          variant="A"
        />
      )}

      {/* Features Grid */}
      {homeContent.features.enabled && (
        <FeaturesSection
          content={homeContent.features.content}
          locale={locale}
          variant="A"
        />
      )}

      {/* How It Works */}
      {homeContent.howItWorks?.enabled && (
        <HowItWorksSection
          content={homeContent.howItWorks.content}
          locale={locale}
          variant="A"
        />
      )}

      {/* Tech Stack */}
      {homeContent.techStack?.enabled && (
        <TechStackSection
          content={homeContent.techStack.content}
          locale={locale}
          variant="A"
        />
      )}

      {/* Social Proof */}
      {homeContent.socialProof.enabled && (
        <SocialProofSection
          content={homeContent.socialProof.content}
          locale={locale}
          variant="A"
        />
      )}

      {/* Pricing */}
      {homeContent.pricing.enabled && (
        <PricingSection
          content={homeContent.pricing.content}
          locale={locale}
          variant="A"
        />
      )}

      {/* Affiliate Module - Dynamic from Database */}
      {showAffiliateModule && homeContent.affiliateModule && (
        <AffiliateModuleSection
          content={homeContent.affiliateModule.content}
          locale={locale}
          variant="A"
        />
      )}

      {/* Urgency/FOMO */}
      {homeContent.urgency?.enabled && (
        <UrgencySection
          content={homeContent.urgency.content as any}
          locale={locale}
          variant="A"
        />
      )}

      {/* FAQ */}
      {homeContent.faq?.enabled && (
        <FAQSection
          content={homeContent.faq.content as any}
          locale={locale}
          variant="A"
        />
      )}

      {/* Final CTA */}
      {homeContent.cta.enabled && (
        <CTASection
          content={homeContent.cta.content}
          locale={locale}
          variant="A"
        />
      )}
    </>
  );
}