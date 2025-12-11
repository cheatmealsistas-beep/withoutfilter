import { Badge } from '@/shared/components/ui/badge';
import type { PricingContent } from '../../types/sections';

interface PricingSectionProps {
  content: PricingContent;
  locale: string;
}

export function PricingSectionModulary({
  content,
  locale
}: PricingSectionProps) {
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const subheadline = content.subheadline
    ? getLocalizedText(content.subheadline)
    : null;
  const badgeText = content.badge
    ? getLocalizedText(content.badge.text)
    : null;

  return (
    <section className="py-24 md:py-32 bg-background" id="pricing">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {badgeText && (
            <Badge
              variant={content.badge?.variant || 'secondary'}
              className="mb-4 rounded-full px-4 py-1"
            >
              {badgeText}
            </Badge>
          )}
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {headline}
          </h2>
          {subheadline && (
            <p className="text-lg text-muted-foreground">{subheadline}</p>
          )}
        </div>

        {/* Stripe Pricing Table */}
        {content.stripePricingTableId && content.stripePricingTablePublishableKey && (
          <div className="max-w-5xl mx-auto">
            {/* @ts-expect-error - Stripe custom element */}
            <stripe-pricing-table
              pricing-table-id={content.stripePricingTableId}
              publishable-key={content.stripePricingTablePublishableKey}
            />
          </div>
        )}

        {/* Custom Message */}
        {content.customMessage && (
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              {getLocalizedText(content.customMessage)}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
