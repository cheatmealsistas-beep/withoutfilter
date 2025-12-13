import { getLocale } from 'next-intl/server';
import {
  HeroSectionModulary,
  ProblemSectionModulary,
  TargetUsersSectionModulary,
  SolutionSectionModulary,
  AISectionModulary,
  UseCasesSectionModulary,
  ModulesSectionModulary,
  HowItWorksSectionModulary,
  TestimonialsSectionModulary,
  PricingSectionModulary,
  FAQSectionModulary,
  CTASectionModulary,
  modularityContent
} from '@/features/home/index-modulary';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const title = locale === 'es'
    ? 'Modulary - Crea Aplicaciones Sin Código'
    : 'Modulary - Build Apps Without Code';

  const description = locale === 'es'
    ? 'Plataforma para coaches, trainers, creadores y terapeutas. Crea aplicaciones profesionales sin necesidad de código.'
    : 'Platform for coaches, trainers, creators, and therapists. Build professional apps without writing code.';

  return {
    title,
    description,
  };
}

export default async function ModularyHomePage() {
  const locale = await getLocale();

  return (
    <>
      {/* Hero Section */}
      {modularityContent.hero.enabled && (
        <HeroSectionModulary
          content={modularityContent.hero.content}
          locale={locale}
        />
      )}

      {/* Problem Section */}
      {modularityContent.problem.enabled && (
        <ProblemSectionModulary
          content={modularityContent.problem.content}
          locale={locale}
        />
      )}

      {/* Target Users Section */}
      {modularityContent.targetUsers.enabled && (
        <TargetUsersSectionModulary
          content={modularityContent.targetUsers.content}
          locale={locale}
        />
      )}

      {/* Solution Section */}
      {modularityContent.solution.enabled && (
        <SolutionSectionModulary
          content={modularityContent.solution.content}
          locale={locale}
        />
      )}

      {/* AI Capabilities Section */}
      {modularityContent.ai.enabled && (
        <AISectionModulary
          content={modularityContent.ai.content}
          locale={locale}
        />
      )}

      {/* Use Cases Section */}
      {modularityContent.useCases.enabled && (
        <UseCasesSectionModulary
          content={modularityContent.useCases.content}
          locale={locale}
        />
      )}

      {/* Modules Section */}
      {modularityContent.modules.enabled && (
        <ModulesSectionModulary
          content={modularityContent.modules.content}
          locale={locale}
        />
      )}

      {/* How It Works Section */}
      {modularityContent.howItWorks.enabled && (
        <HowItWorksSectionModulary
          content={modularityContent.howItWorks.content}
          locale={locale}
        />
      )}

      {/* Testimonials Section */}
      <TestimonialsSectionModulary locale={locale} />

      {/* Pricing Section */}
      {modularityContent.pricing.enabled && (
        <PricingSectionModulary
          content={modularityContent.pricing.content}
          locale={locale}
        />
      )}

      {/* FAQ Section */}
      {modularityContent.faq.enabled && (
        <FAQSectionModulary
          content={modularityContent.faq.content}
          locale={locale}
        />
      )}

      {/* Final CTA Section */}
      <CTASectionModulary locale={locale} />
    </>
  );
}