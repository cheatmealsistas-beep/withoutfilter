import Link from 'next/link';
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

  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-32">
      {/* Container */}
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="flex flex-col space-y-8">
            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-foreground">
                {headline}
                {headlineHighlight && (
                  <>
                    {' '}
                    <span className="text-primary">{headlineHighlight}</span>
                  </>
                )}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                {subheadline}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <Link href={content.ctaPrimary.href}>{primaryText}</Link>
              </Button>

              {content.ctaSecondary && secondaryText && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-2xl border-border hover:bg-muted"
                >
                  <Link href={content.ctaSecondary.href}>{secondaryText}</Link>
                </Button>
              )}
            </div>

            {/* Social Proof */}
            {socialProofText && (
              <p className="text-sm text-muted-foreground">
                {socialProofText}
              </p>
            )}
          </div>

          {/* Right: Illustration */}
          <div className="lg:order-last order-first">
            <ToolsToUnifiedIllustration className="w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
