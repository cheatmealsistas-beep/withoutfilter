'use client';

import { Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { PricingContent } from '@/shared/types/page-blocks';

interface PricingBlockProps {
  content: PricingContent;
  primaryColor: string;
}

export function PricingBlock({ content, primaryColor }: PricingBlockProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {(content.headline || content.subheadline) && (
          <div className="text-center mb-16">
            {content.headline && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.headline}</h2>
            )}
            {content.subheadline && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {content.subheadline}
              </p>
            )}
          </div>
        )}

        <div
          className={cn(
            'grid gap-8',
            content.tiers.length === 1 && 'max-w-md mx-auto',
            content.tiers.length === 2 && 'md:grid-cols-2 max-w-3xl mx-auto',
            content.tiers.length >= 3 && 'md:grid-cols-2 lg:grid-cols-3',
            content.tiers.length === 4 && 'lg:grid-cols-4'
          )}
        >
          {content.tiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                'relative p-6 rounded-2xl border bg-card',
                tier.isHighlighted && 'border-2 shadow-lg scale-105'
              )}
              style={{
                borderColor: tier.isHighlighted ? primaryColor : undefined,
              }}
            >
              {tier.isHighlighted && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold mb-2">{tier.price}</div>
                {tier.description && (
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check
                      className="h-5 w-5 shrink-0 mt-0.5"
                      style={{ color: primaryColor }}
                    />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={tier.isHighlighted ? 'default' : 'outline'}
                style={{
                  backgroundColor: tier.isHighlighted ? primaryColor : undefined,
                }}
                asChild
              >
                <a href={tier.ctaUrl || '#'}>{tier.ctaText}</a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
