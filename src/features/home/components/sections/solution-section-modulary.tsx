import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import type { SolutionSectionContent } from '../../types/sections';

interface SolutionSectionProps {
  content: SolutionSectionContent;
  locale: string;
}

export function SolutionSectionModulary({
  content,
  locale
}: SolutionSectionProps) {
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const subheadline = getLocalizedText(content.subheadline);
  const ctaText = content.cta ? getLocalizedText(content.cta.text) : null;

  return (
    <section className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {headline}
          </h2>
          <p className="text-lg text-muted-foreground">{subheadline}</p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {content.benefits.map((benefit) => {
            const Icon = (Icons as any)[benefit.icon] as LucideIcon || Icons.Check;

            return (
              <div
                key={benefit.id}
                className="flex items-start gap-4 p-6 rounded-2xl bg-background border border-border"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {getLocalizedText(benefit.title)}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {getLocalizedText(benefit.description)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        {content.cta && ctaText && (
          <div className="text-center">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-2xl"
            >
              <Link href={content.cta.href}>{ctaText}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
