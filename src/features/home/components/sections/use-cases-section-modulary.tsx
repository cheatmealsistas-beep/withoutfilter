import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import type { UseCasesSectionContent } from '../../types/sections';

interface UseCasesSectionProps {
  content: UseCasesSectionContent;
  locale: string;
}

export function UseCasesSectionModulary({
  content,
  locale
}: UseCasesSectionProps) {
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const subheadline = content.subheadline
    ? getLocalizedText(content.subheadline)
    : null;

  return (
    <section className="py-24 md:py-32 bg-muted/30">
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

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {content.useCases.map((useCase) => {
            const Icon = useCase.icon
              ? (Icons as any)[useCase.icon] as LucideIcon || Icons.Box
              : Icons.Box;

            return (
              <div
                key={useCase.id}
                className="p-8 rounded-3xl border border-border bg-background hover:border-primary/50 transition-all hover:shadow-md"
              >
                {/* Icon */}
                <div className="w-12 h-12 mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {getLocalizedText(useCase.title)}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {getLocalizedText(useCase.description)}
                </p>

                {/* Tags */}
                {useCase.tags && useCase.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {useCase.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs rounded-full"
                      >
                        {getLocalizedText(tag)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
