'use client';

import { Star } from 'lucide-react';
import type { TestimonialsContent } from '@/features/page-builder/types';

interface TestimonialsBlockProps {
  content: TestimonialsContent;
  primaryColor: string;
}

export function TestimonialsBlock({ content, primaryColor }: TestimonialsBlockProps) {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {content.headline && (
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">{content.headline}</h2>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {content.testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="p-6 rounded-2xl bg-background border shadow-sm"
            >
              {testimonial.rating && testimonial.rating > 0 && (
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-current"
                      style={{ color: primaryColor }}
                    />
                  ))}
                </div>
              )}

              <blockquote className="text-lg mb-6 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {testimonial.authorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.authorName}</p>
                  {testimonial.authorRole && (
                    <p className="text-sm text-muted-foreground">{testimonial.authorRole}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
