'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { ContentContent } from '@/shared/types/page-blocks';

interface ContentBlockProps {
  content: ContentContent;
  primaryColor: string;
}

export function ContentBlock({ content, primaryColor }: ContentBlockProps) {
  const [imageError, setImageError] = useState(false);
  const isImageLeft = content.imagePosition === 'left';
  const isBoxed = content.style === 'boxed';
  const isFullwidth = content.style === 'fullwidth';

  // Split body into paragraphs
  const paragraphs = content.body.split('\n').filter((p) => p.trim());

  // Check if we should show the image container
  const showImageContainer = content.imageUrl && !imageError;

  return (
    <section
      className={cn(
        'py-16 md:py-24 px-4',
        isBoxed && 'bg-muted/30',
        isFullwidth && 'bg-gradient-to-b from-background to-muted/20'
      )}
    >
      <div
        className={cn(
          'max-w-6xl mx-auto',
          isFullwidth && 'max-w-7xl'
        )}
      >
        <div
          className={cn(
            'grid gap-8 md:gap-12 items-center',
            content.imageUrl ? 'md:grid-cols-2' : 'md:grid-cols-1 max-w-3xl mx-auto'
          )}
        >
          {/* Image - conditionally ordered */}
          {showImageContainer && (
            <div
              className={cn(
                'relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-muted',
                isImageLeft ? 'md:order-1' : 'md:order-2'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.imageUrl}
                alt={content.imageAlt || content.headline}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          )}

          {/* Fallback when image fails to load */}
          {content.imageUrl && imageError && (
            <div
              className={cn(
                'relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted flex items-center justify-center',
                isImageLeft ? 'md:order-1' : 'md:order-2'
              )}
            >
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Imagen no disponible</p>
              </div>
            </div>
          )}

          {/* Text content */}
          <div
            className={cn(
              'space-y-4',
              isImageLeft ? 'md:order-2' : 'md:order-1',
              !content.imageUrl && !imageError && 'text-center'
            )}
          >
            {content.subheadline && (
              <p
                className="text-sm font-medium uppercase tracking-wider"
                style={{ color: primaryColor }}
              >
                {content.subheadline}
              </p>
            )}

            <h2 className="text-3xl md:text-4xl font-bold">{content.headline}</h2>

            <div className="space-y-4 text-muted-foreground">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
