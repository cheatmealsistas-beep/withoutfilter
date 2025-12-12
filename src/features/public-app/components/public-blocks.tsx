'use client';

import type { PageBlock, PageSettings } from '@/features/page-builder/types';
import {
  HeroBlock,
  ServicesBlock,
  TestimonialsBlock,
  PricingBlock,
  FaqsBlock,
  CtaBlock,
} from './blocks';

interface PublicBlocksProps {
  blocks: PageBlock[];
  settings: PageSettings;
}

export function PublicBlocks({ blocks, settings }: PublicBlocksProps) {
  const visibleBlocks = blocks.filter((block) => block.isVisible);

  return (
    <>
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
          default:
            return null;
        }
      })}
    </>
  );
}
