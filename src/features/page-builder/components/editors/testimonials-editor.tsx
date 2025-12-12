'use client';

import { Plus, Trash2, Star } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { TestimonialsContent, TestimonialItem } from '../../types';

interface TestimonialsEditorProps {
  content: TestimonialsContent;
  onChange: (content: TestimonialsContent) => void;
}

export function TestimonialsEditor({ content, onChange }: TestimonialsEditorProps) {
  const updateField = <K extends keyof TestimonialsContent>(
    field: K,
    value: TestimonialsContent[K]
  ) => {
    onChange({ ...content, [field]: value });
  };

  const updateTestimonial = (index: number, updates: Partial<TestimonialItem>) => {
    const newTestimonials = [...content.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], ...updates };
    updateField('testimonials', newTestimonials);
  };

  const addTestimonial = () => {
    if (content.testimonials.length >= 6) return;
    const newTestimonial: TestimonialItem = {
      id: crypto.randomUUID(),
      quote: 'Una experiencia increíble.',
      authorName: 'Nombre',
      authorRole: 'Cargo',
      rating: 5,
    };
    updateField('testimonials', [...content.testimonials, newTestimonial]);
  };

  const removeTestimonial = (index: number) => {
    if (content.testimonials.length <= 1) return;
    const newTestimonials = content.testimonials.filter((_, i) => i !== index);
    updateField('testimonials', newTestimonials);
  };

  const setRating = (index: number, rating: number) => {
    updateTestimonial(index, { rating });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="testimonials-headline">Título de la sección</Label>
        <Input
          id="testimonials-headline"
          value={content.headline ?? ''}
          onChange={(e) => updateField('headline', e.target.value || undefined)}
          placeholder="Lo que dicen mis clientes"
          maxLength={100}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Testimonios ({content.testimonials.length}/6)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTestimonial}
            disabled={content.testimonials.length >= 6}
            className="gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Añadir
          </Button>
        </div>

        <div className="space-y-3">
          {content.testimonials.map((testimonial, index) => (
            <Card key={testimonial.id} className="bg-muted/50">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-3">
                    <Textarea
                      value={testimonial.quote}
                      onChange={(e) => updateTestimonial(index, { quote: e.target.value })}
                      placeholder="Texto del testimonio..."
                      maxLength={500}
                      rows={2}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={testimonial.authorName}
                        onChange={(e) => updateTestimonial(index, { authorName: e.target.value })}
                        placeholder="Nombre"
                        maxLength={50}
                      />
                      <Input
                        value={testimonial.authorRole ?? ''}
                        onChange={(e) =>
                          updateTestimonial(index, { authorRole: e.target.value || undefined })
                        }
                        placeholder="Cargo (opcional)"
                        maxLength={50}
                      />
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground mr-2">Valoración:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(index, star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              star <= (testimonial.rating ?? 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeTestimonial(index)}
                    disabled={content.testimonials.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
