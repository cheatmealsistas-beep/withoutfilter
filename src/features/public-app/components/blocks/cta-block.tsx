'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import type { CtaContent } from '@/shared/types/page-blocks';

interface CtaBlockProps {
  content: CtaContent;
  primaryColor: string;
  secondaryColor: string;
}

export function CtaBlock({ content, primaryColor, secondaryColor }: CtaBlockProps) {
  const isSplit = content.style === 'split';
  const isMinimal = content.style === 'minimal';

  return (
    <section
      className={cn(
        'py-20 px-4',
        !isMinimal && 'bg-gradient-to-r',
        isMinimal && 'border-t'
      )}
      style={{
        background: !isMinimal
          ? `linear-gradient(135deg, ${primaryColor}10, ${secondaryColor}10)`
          : undefined,
      }}
    >
      <div
        className={cn(
          'max-w-4xl mx-auto',
          isSplit ? 'flex flex-col md:flex-row items-center justify-between gap-8' : 'text-center'
        )}
      >
        <div className={isSplit ? 'flex-1' : ''}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.headline}</h2>
          {content.description && (
            <p className="text-lg text-muted-foreground max-w-xl">
              {content.description}
            </p>
          )}
        </div>

        <div
          className={cn(
            'flex gap-4',
            isSplit ? 'shrink-0' : 'justify-center mt-8',
            'flex-col sm:flex-row'
          )}
        >
          <Button
            size="lg"
            className="text-lg px-8 py-6 rounded-full shadow-lg"
            style={{ backgroundColor: primaryColor }}
            asChild
          >
            <a href={content.primaryCtaUrl || '#'}>
              {content.primaryCtaText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>

          {content.secondaryCtaText && (
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-full"
              asChild
            >
              <a href={content.secondaryCtaUrl || '#'}>{content.secondaryCtaText}</a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
