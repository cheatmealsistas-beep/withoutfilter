'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import type { FAQContent } from '../../types/sections';

interface FAQSectionProps {
  content: FAQContent;
  locale: string;
}

export function FAQSectionModulary({ content, locale }: FAQSectionProps) {
  const getLocalizedText = (field: Record<string, string> | undefined) => {
    if (!field) return '';
    return field[locale] || field.en || '';
  };

  const headline = getLocalizedText(content.headline);
  const subheadline = content.subheadline
    ? getLocalizedText(content.subheadline)
    : null;

  return (
    <section className="py-24 md:py-32 bg-muted/30" id="faq">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {headline}
          </h2>
          {subheadline && (
            <p className="text-lg text-muted-foreground">{subheadline}</p>
          )}
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {content.items.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border border-border bg-background rounded-2xl px-6 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-6">
                  {getLocalizedText(item.question)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {getLocalizedText(item.answer)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA (optional) */}
        {content.showContactCTA && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              {locale === 'es'
                ? '¿Todavía tienes preguntas? '
                : 'Still have questions? '}
              <a
                href="/contact"
                className="text-primary font-semibold hover:underline"
              >
                {locale === 'es' ? 'Contáctanos' : 'Contact us'}
              </a>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
