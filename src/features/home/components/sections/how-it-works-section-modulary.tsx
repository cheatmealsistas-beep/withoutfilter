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
    <section className="py-24 md:py-32 bg-gradient-to-b from-background to-muted/30" id="how-it-works">
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
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-8 top-20 bottom-20 w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-accent/50 hidden md:block" />

            <div className="grid gap-16">
              {content.steps.map((step, index) => {
                const Icon = step.icon
                  ? (Icons as any)[step.icon] as LucideIcon || Icons.Circle
                  : Icons.Circle;

                const isLast = index === content.steps.length - 1;

                return (
                  <div
                    key={step.id}
                    className="flex items-start gap-8 relative"
                  >
                    {/* Number & Icon */}
                    <div className="flex-shrink-0 relative z-10">
                      <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 w-16 h-16 bg-primary/20 rounded-2xl blur-xl" />
                        {/* Icon container */}
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center shadow-lg">
                          <Icon className="w-7 h-7 text-primary" />
                        </div>
                        {/* Step number badge */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-md">
                          {step.number || index + 1}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2">
                      <h3 className="text-2xl font-semibold text-foreground mb-3">
                        {getLocalizedText(step.title)}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        {getLocalizedText(step.description)}
                      </p>

                      {/* Arrow to next step (hidden on last) */}
                      {!isLast && (
                        <div className="mt-4 text-primary/50 md:hidden">
                          <Icons.ArrowDown className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
