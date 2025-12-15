'use client';

import { useEffect, useRef } from 'react';
import {
  HeroBlock,
  ServicesBlock,
  TestimonialsBlock,
  PricingBlock,
  FaqsBlock,
  CtaBlock,
  ContentBlock,
} from '@/features/public-app/components/blocks';
import { cn } from '@/shared/lib/utils';
import type { PageBlock, PageSettings } from '../../types';

interface PagePreviewProps {
  blocks: PageBlock[];
  settings: PageSettings;
  activeBlockId?: string | null;
}

export function PagePreview({ blocks, settings, activeBlockId }: PagePreviewProps) {
  const visibleBlocks = blocks.filter((block) => block.isVisible);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll to active block when it changes
  useEffect(() => {
    if (activeBlockId) {
      const blockElement = blockRefs.current.get(activeBlockId);
      if (blockElement) {
        blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeBlockId]);

  if (visibleBlocks.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">
        <p>Añade bloques para ver la vista previa</p>
      </div>
    );
  }

  const renderBlock = (block: PageBlock) => {
    switch (block.type) {
      case 'hero':
        return <HeroBlock content={block.content} primaryColor={settings.primaryColor} />;
      case 'services':
        return <ServicesBlock content={block.content} primaryColor={settings.primaryColor} />;
      case 'testimonials':
        return <TestimonialsBlock content={block.content} primaryColor={settings.primaryColor} />;
      case 'pricing':
        return <PricingBlock content={block.content} primaryColor={settings.primaryColor} />;
      case 'faqs':
        return <FaqsBlock content={block.content} />;
      case 'cta':
        return (
          <CtaBlock
            content={block.content}
            primaryColor={settings.primaryColor}
            secondaryColor={settings.secondaryColor}
          />
        );
      case 'content':
        return <ContentBlock content={block.content} primaryColor={settings.primaryColor} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full">
      {visibleBlocks.map((block) => {
        const isActive = block.id === activeBlockId;
        return (
          <div
            key={block.id}
            ref={(el) => {
              if (el) blockRefs.current.set(block.id, el);
            }}
            className={cn(
              'relative transition-all duration-200',
              isActive && 'ring-2 ring-primary ring-offset-2'
            )}
          >
            {renderBlock(block)}
          </div>
        );
      })}
    </div>
  );
}
