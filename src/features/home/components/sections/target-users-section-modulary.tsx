import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TargetUsersSectionContent } from '../../types/sections';

interface TargetUsersSectionProps {
  content: TargetUsersSectionContent;
  locale: string;
}

export function TargetUsersSectionModulary({
  content,
  locale
}: TargetUsersSectionProps) {
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const subheadline = content.subheadline
    ? getLocalizedText(content.subheadline)
    : null;

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

        {/* User Types Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {content.users.map((user) => {
            const Icon = (Icons as any)[user.icon] as LucideIcon || Icons.User;

            return (
              <div
                key={user.id}
                className="text-center p-8 rounded-3xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-md"
              >
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {getLocalizedText(user.title)}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {getLocalizedText(user.description)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
