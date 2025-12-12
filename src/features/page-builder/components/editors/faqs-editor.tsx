'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent } from '@/shared/components/ui/card';
import type { FaqsContent, FaqItem } from '../../types';

interface FaqsEditorProps {
  content: FaqsContent;
  onChange: (content: FaqsContent) => void;
}

export function FaqsEditor({ content, onChange }: FaqsEditorProps) {
  const updateField = <K extends keyof FaqsContent>(field: K, value: FaqsContent[K]) => {
    onChange({ ...content, [field]: value });
  };

  const updateFaq = (index: number, updates: Partial<FaqItem>) => {
    const newFaqs = [...content.faqs];
    newFaqs[index] = { ...newFaqs[index], ...updates };
    updateField('faqs', newFaqs);
  };

  const addFaq = () => {
    if (content.faqs.length >= 10) return;
    const newFaq: FaqItem = {
      id: crypto.randomUUID(),
      question: 'Nueva pregunta',
      answer: 'Respuesta a la pregunta.',
    };
    updateField('faqs', [...content.faqs, newFaq]);
  };

  const removeFaq = (index: number) => {
    if (content.faqs.length <= 1) return;
    const newFaqs = content.faqs.filter((_, i) => i !== index);
    updateField('faqs', newFaqs);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="faqs-headline">Título de la sección</Label>
        <Input
          id="faqs-headline"
          value={content.headline ?? ''}
          onChange={(e) => updateField('headline', e.target.value || undefined)}
          placeholder="Preguntas Frecuentes"
          maxLength={100}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Preguntas ({content.faqs.length}/10)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addFaq}
            disabled={content.faqs.length >= 10}
            className="gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Añadir pregunta
          </Button>
        </div>

        <div className="space-y-3">
          {content.faqs.map((faq, index) => (
            <Card key={faq.id} className="bg-muted/50">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-3">
                    <Input
                      value={faq.question}
                      onChange={(e) => updateFaq(index, { question: e.target.value })}
                      placeholder="¿Cuál es la pregunta?"
                      maxLength={200}
                    />
                    <Textarea
                      value={faq.answer}
                      onChange={(e) => updateFaq(index, { answer: e.target.value })}
                      placeholder="Respuesta a la pregunta..."
                      maxLength={1000}
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeFaq(index)}
                    disabled={content.faqs.length <= 1}
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
