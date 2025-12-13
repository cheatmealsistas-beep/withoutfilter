'use client';

import {
  HeroBlock,
  ServicesBlock,
  TestimonialsBlock,
  PricingBlock,
  FaqsBlock,
  CtaBlock,
  ContentBlock,
} from '@/features/public-app/components/blocks';
import type { PageBlock, PageSettings } from '../../types';

interface PagePreviewProps {
  blocks: PageBlock[];
  settings: PageSettings;
}

export function PagePreview({ blocks, settings }: PagePreviewProps) {
  const visibleBlocks = blocks.filter((block) => block.isVisible);

  if (visibleBlocks.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">
        <p>Añade bloques para ver la vista previa</p>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {visibleBlocks.map((block) => {
        switch (block.type) {
          case 'hero':
            return (
              <HeroBlock
                key={block.id}
                content={block.content}
                primaryColor={settings.primaryColor}
              />
            );
          case 'services':
            return (
              <ServicesBlock
                key={block.id}
                content={block.content}
                primaryColor={settings.primaryColor}
              />
            );
          case 'testimonials':
            return (
              <TestimonialsBlock
                key={block.id}
                content={block.content}
                primaryColor={settings.primaryColor}
              />
            );
          case 'pricing':
            return (
              <PricingBlock
                key={block.id}
                content={block.content}
                primaryColor={settings.primaryColor}
              />
            );
          case 'faqs':
            return <FaqsBlock key={block.id} content={block.content} />;
          case 'cta':
            return (
              <CtaBlock
                key={block.id}
                content={block.content}
                primaryColor={settings.primaryColor}
                secondaryColor={settings.secondaryColor}
              />
            );
          case 'content':
            return (
              <ContentBlock
                key={block.id}
                content={block.content}
                primaryColor={settings.primaryColor}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
