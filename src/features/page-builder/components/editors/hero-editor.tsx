'use client';

import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import type { HeroContent } from '../../types';

interface HeroEditorProps {
  content: HeroContent;
  onChange: (content: HeroContent) => void;
}

export function HeroEditor({ content, onChange }: HeroEditorProps) {
  const updateField = <K extends keyof HeroContent>(field: K, value: HeroContent[K]) => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="hero-headline">Título principal</Label>
        <Input
          id="hero-headline"
          value={content.headline}
          onChange={(e) => updateField('headline', e.target.value)}
          placeholder="Bienvenido a mi página"
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground text-right">
          {content.headline.length}/100
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="hero-description">Descripción</Label>
        <Textarea
          id="hero-description"
          value={content.description ?? ''}
          onChange={(e) => updateField('description', e.target.value || undefined)}
          placeholder="Describe brevemente lo que ofreces..."
          maxLength={300}
          rows={3}
        />
        <p className="text-xs text-muted-foreground text-right">
          {(content.description ?? '').length}/300
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hero-cta-text">Texto del botón</Label>
          <Input
            id="hero-cta-text"
            value={content.ctaText ?? ''}
            onChange={(e) => updateField('ctaText', e.target.value || undefined)}
            placeholder="Contactar"
            maxLength={30}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hero-cta-url">URL del botón</Label>
          <Input
            id="hero-cta-url"
            value={content.ctaUrl ?? ''}
            onChange={(e) => updateField('ctaUrl', e.target.value || undefined)}
            placeholder="#contacto"
          />
        </div>
      </div>
    </div>
  );
}
