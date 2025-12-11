import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ProblemSectionContent } from '../../types/sections';

interface ProblemSectionProps {
  content: ProblemSectionContent;
  locale: string;
}

export function ProblemSectionModulary({
  content,
  locale
}: ProblemSectionProps) {
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

        {/* Problem Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {content.problems.map((problem) => {
            const Icon = (Icons as any)[problem.icon] as LucideIcon || Icons.AlertCircle;

            return (
              <div
                key={problem.id}
                className="p-8 md:p-12 bg-background rounded-3xl border border-border shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {getLocalizedText(problem.title)}
                    </h3>
                    <p className="text-muted-foreground">
                      {getLocalizedText(problem.description)}
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
