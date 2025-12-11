import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import type { ModulesSectionContent } from '../../types/sections';

interface ModulesSectionProps {
  content: ModulesSectionContent;
  locale: string;
}

export function ModulesSectionModulary({
  content,
  locale
}: ModulesSectionProps) {
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const subheadline = content.subheadline
    ? getLocalizedText(content.subheadline)
    : null;
  const ctaText = content.cta ? getLocalizedText(content.cta.text) : null;

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {headline}
          </h2>
          {subheadline && (
            <p className="text-lg text-muted-foreground">{subheadline}</p>
          )}
        </div>

        {/* Modules Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {content.modules.map((module) => {
            const Icon = (Icons as any)[module.icon] as LucideIcon || Icons.Box;
            const moduleBadge = module.badge
              ? getLocalizedText(module.badge)
              : null;

            return (
              <div
                key={module.id}
                className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-sm group"
              >
                {/* Icon & Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  {moduleBadge && (
                    <Badge
                      variant="secondary"
                      className="text-xs rounded-full"
                    >
                      {moduleBadge}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-foreground mb-2">
                  {getLocalizedText(module.name)}
                </h3>

                {/* Description */}
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {getLocalizedText(module.description)}
                </p>

                {/* Category */}
                <p className="text-xs text-muted-foreground/70">
                  {getLocalizedText(module.category)}
                </p>
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
