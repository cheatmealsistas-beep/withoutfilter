import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import type { AISectionContent } from '../../types/sections';

interface AISectionProps {
  content: AISectionContent;
  locale: string;
}

export function AISectionModulary({ content, locale }: AISectionProps) {
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const subheadline = getLocalizedText(content.subheadline);
  const badgeText = content.badge ? getLocalizedText(content.badge.text) : null;

  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {badgeText && (
            <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">
              {badgeText}
            </Badge>
          )}
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {headline}
          </h2>
          <p className="text-lg text-muted-foreground">{subheadline}</p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {content.capabilities.map((capability) => {
            const Icon = (Icons as any)[capability.icon] as LucideIcon || Icons.Sparkles;
            const capabilityBadge = capability.badge
              ? getLocalizedText(capability.badge)
              : null;

            return (
              <div
                key={capability.id}
                className="p-8 rounded-3xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-md"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {getLocalizedText(capability.title)}
                      </h3>
                      {capabilityBadge && (
                        <Badge
                          variant="outline"
                          className="text-xs rounded-full"
                        >
                          {capabilityBadge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {getLocalizedText(capability.description)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
