import { Badge } from '@/shared/components/ui/badge';
import { Shield, Clock, CreditCard, Zap } from 'lucide-react';
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

  // Trust indicators
  const trustIndicators = locale === 'es'
    ? [
        { icon: Shield, text: 'Pago seguro con Stripe' },
        { icon: Clock, text: 'Cancela cuando quieras' },
        { icon: CreditCard, text: 'Sin compromisos' },
        { icon: Zap, text: 'Acceso inmediato' }
      ]
    : [
        { icon: Shield, text: 'Secure payment with Stripe' },
        { icon: Clock, text: 'Cancel anytime' },
        { icon: CreditCard, text: 'No commitments' },
        { icon: Zap, text: 'Instant access' }
      ];

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-muted/30 via-background to-background overflow-hidden" id="pricing">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {badgeText && (
            <Badge
              variant={content.badge?.variant || 'secondary'}
              className="mb-4 rounded-full px-4 py-1.5 bg-primary/10 text-primary border-0"
            >
              {badgeText}
            </Badge>
          )}
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {headline}
          </h2>
          {subheadline && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subheadline}</p>
          )}
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {trustIndicators.map((indicator, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <indicator.icon className="h-4 w-4 text-primary" />
              <span>{indicator.text}</span>
            </div>
          ))}
        </div>

        {/* Stripe Pricing Table */}
        {content.stripePricingTableId && content.stripePricingTablePublishableKey && (
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 p-4 md:p-8 shadow-xl shadow-primary/5">
              {/* @ts-expect-error - Stripe custom element */}
              <stripe-pricing-table
                pricing-table-id={content.stripePricingTableId}
                publishable-key={content.stripePricingTablePublishableKey}
              />
            </div>
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

        {/* Money-back guarantee */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium">
            <Shield className="h-4 w-4" />
            {locale === 'es'
              ? 'Garantía de devolución de 30 días'
              : '30-day money-back guarantee'}
          </div>
        </div>
      </div>
    </section>
  );
}
