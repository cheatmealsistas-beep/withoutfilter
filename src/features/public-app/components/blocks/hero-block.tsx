'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { HeroContent } from '@/shared/types/page-blocks';

interface HeroBlockProps {
  content: HeroContent;
  primaryColor: string;
}

export function HeroBlock({ content, primaryColor }: HeroBlockProps) {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div
        className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/50"
        style={{
          '--primary-color': primaryColor,
        } as React.CSSProperties}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          {content.headline}
        </h1>

        {content.description && (
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {content.description}
          </p>
        )}

        {content.ctaText && (
          <div className="pt-4">
            <Button
              size="lg"
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: primaryColor }}
              asChild
            >
              <a href={content.ctaUrl || '#'}>
                {content.ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
