import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { HeroContent } from '../../types/sections';
import { ToolsToUnifiedIllustration } from '../illustrations/tools-to-unified';

interface HeroSectionProps {
  content: HeroContent;
  locale: string;
}

/**
 * Hero Section - Modulary Style
 * Minimalist, warm, with custom illustration
 */
export function HeroSectionModulary({
  content,
  locale
}: HeroSectionProps) {
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const headlineHighlight = content.headlineHighlight
    ? getLocalizedText(content.headlineHighlight)
    : null;
  const subheadline = getLocalizedText(content.subheadline);
  const primaryText = getLocalizedText(content.ctaPrimary.text);
  const secondaryText = content.ctaSecondary
    ? getLocalizedText(content.ctaSecondary.text)
    : null;
  const socialProofText = content.socialProofText
    ? getLocalizedText(content.socialProofText)
    : null;

  // Quick benefits for social proof
  const quickBenefits = locale === 'es'
    ? ['Sin código', 'Listo en minutos', 'Tu marca']
    : ['No code needed', 'Ready in minutes', 'Your brand'];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-24 md:py-32">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Container */}
      <div className="container relative mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="flex flex-col space-y-8">
            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-foreground tracking-tight">
                {headline}
                {headlineHighlight && (
                  <>
                    <br className="hidden sm:block" />
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {headlineHighlight}
                    </span>
                  </>
                )}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                {subheadline}
              </p>
            </div>

            {/* Quick benefits */}
            <div className="flex flex-wrap gap-4">
              {quickBenefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <Link href={content.ctaPrimary.href}>
                  {primaryText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              {content.ctaSecondary && secondaryText && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base rounded-xl border-2 hover:bg-accent/10"
                >
                  <Link href={content.ctaSecondary.href}>{secondaryText}</Link>
                </Button>
              )}
            </div>

            {/* Social Proof */}
            {socialProofText && (
              <div className="flex items-center gap-3 pt-4">
                {/* Avatar stack placeholder */}
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center text-xs font-medium text-primary"
                    >
                      {['M', 'C', 'A', 'J'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {socialProofText}
                </p>
              </div>
            )}
          </div>

          {/* Right: Illustration */}
          <div className="lg:order-last order-first">
            <div className="relative">
              {/* Glow effect behind illustration */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl scale-95" />
              <ToolsToUnifiedIllustration className="relative w-full drop-shadow-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
