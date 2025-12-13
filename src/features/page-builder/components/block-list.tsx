'use client';

import { useState, useCallback } from 'react';
import { BlockItem } from './block-item';
import { AddBlockMenu } from './add-block-menu';
import {
  HeroEditor,
  ServicesEditor,
  TestimonialsEditor,
  PricingEditor,
  FaqsEditor,
  CtaEditor,
  ContentEditor,
} from './editors';
import type { PageBlock, BlockType } from '../types';

interface BlockListProps {
  blocks: PageBlock[];
  onBlockChange: (blockId: string, content: PageBlock['content']) => void;
  onBlockVisibilityChange: (blockId: string, isVisible: boolean) => void;
  onBlockMove: (blockId: string, direction: 'up' | 'down') => void;
  onBlockDelete: (blockId: string) => void;
  onBlockAdd: (type: BlockType) => void;
}

export function BlockList({
  blocks,
  onBlockChange,
  onBlockVisibilityChange,
  onBlockMove,
  onBlockDelete,
  onBlockAdd,
}: BlockListProps) {
  // Track which block is expanded (only one at a time)
  const [expandedId, setExpandedId] = useState<string | null>(
    blocks.length > 0 ? blocks[0].id : null
  );

  const renderBlockEditor = useCallback(
    (block: PageBlock) => {
      const handleChange = (content: PageBlock['content']) => {
        onBlockChange(block.id, content);
      };

      switch (block.type) {
        case 'hero':
          return <HeroEditor content={block.content} onChange={handleChange} />;
        case 'services':
          return <ServicesEditor content={block.content} onChange={handleChange} />;
        case 'testimonials':
          return <TestimonialsEditor content={block.content} onChange={handleChange} />;
        case 'pricing':
          return <PricingEditor content={block.content} onChange={handleChange} />;
        case 'faqs':
          return <FaqsEditor content={block.content} onChange={handleChange} />;
        case 'cta':
          return <CtaEditor content={block.content} onChange={handleChange} />;
        case 'content':
          return <ContentEditor content={block.content} onChange={handleChange} />;
        default:
          return null;
      }
    },
    [onBlockChange]
  );

  const handleToggleExpand = useCallback((blockId: string) => {
    setExpandedId((prev) => (prev === blockId ? null : blockId));
  }, []);

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <BlockItem
          key={block.id}
          block={block}
          isFirst={index === 0}
          isLast={index === blocks.length - 1}
          isExpanded={expandedId === block.id}
          onToggleExpand={() => handleToggleExpand(block.id)}
          onToggleVisibility={() => onBlockVisibilityChange(block.id, !block.isVisible)}
          onMoveUp={() => onBlockMove(block.id, 'up')}
          onMoveDown={() => onBlockMove(block.id, 'down')}
          onDelete={() => onBlockDelete(block.id)}
        >
          {renderBlockEditor(block)}
        </BlockItem>
      ))}

      <AddBlockMenu onSelect={onBlockAdd} />
    </div>
  );
}
