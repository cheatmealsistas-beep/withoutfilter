import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { HowItWorksContent } from '../../types/sections';

interface HowItWorksSectionProps {
  content: HowItWorksContent;
  locale: string;
}

export function HowItWorksSectionModulary({
  content,
  locale
}: HowItWorksSectionProps) {
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

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-12">
            {content.steps.map((step, index) => {
              const Icon = step.icon
                ? (Icons as any)[step.icon] as LucideIcon || Icons.Circle
                : Icons.Circle;

              return (
                <div
                  key={step.id}
                  className="flex items-start gap-8"
                >
                  {/* Number & Icon */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {/* Large number in background */}
                      <div className="text-7xl font-bold text-primary/10 absolute -top-4 -left-2">
                        {step.number || index + 1}
                      </div>
                      {/* Icon in foreground */}
                      <div className="relative z-10 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mt-4">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-4">
                    <h3 className="text-2xl font-semibold text-foreground mb-3">
                      {getLocalizedText(step.title)}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {getLocalizedText(step.description)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
