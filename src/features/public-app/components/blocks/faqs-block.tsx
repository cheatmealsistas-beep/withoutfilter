'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import type { FaqsContent } from '@/features/page-builder/types';

interface FaqsBlockProps {
  content: FaqsContent;
}

export function FaqsBlock({ content }: FaqsBlockProps) {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        {content.headline && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">{content.headline}</h2>
          </div>
        )}

        <Accordion type="single" collapsible className="space-y-4">
          {content.faqs.map((faq, index) => (
            <AccordionItem
              key={faq.id}
              value={`faq-${index}`}
              className="bg-background border rounded-xl px-6"
            >
              <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
