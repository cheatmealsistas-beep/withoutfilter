'use client';

import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import type { CtaContent } from '../../types';

interface CtaEditorProps {
  content: CtaContent;
  onChange: (content: CtaContent) => void;
}

const STYLE_OPTIONS = [
  { value: 'centered', label: 'Centrado' },
  { value: 'split', label: 'Dividido' },
  { value: 'minimal', label: 'Minimalista' },
] as const;

export function CtaEditor({ content, onChange }: CtaEditorProps) {
  const updateField = <K extends keyof CtaContent>(field: K, value: CtaContent[K]) => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cta-headline">Título</Label>
        <Input
          id="cta-headline"
          value={content.headline}
          onChange={(e) => updateField('headline', e.target.value)}
          placeholder="¿Listo para empezar?"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cta-description">Descripción</Label>
        <Textarea
          id="cta-description"
          value={content.description ?? ''}
          onChange={(e) => updateField('description', e.target.value || undefined)}
          placeholder="Da el primer paso hacia tus objetivos"
          maxLength={300}
          rows={2}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="cta-primary-text">Botón principal</Label>
          <Input
            id="cta-primary-text"
            value={content.primaryCtaText}
            onChange={(e) => updateField('primaryCtaText', e.target.value)}
            placeholder="Contactar ahora"
            maxLength={30}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cta-primary-url">URL principal</Label>
          <Input
            id="cta-primary-url"
            value={content.primaryCtaUrl ?? ''}
            onChange={(e) => updateField('primaryCtaUrl', e.target.value || undefined)}
            placeholder="#contacto"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="cta-secondary-text">Botón secundario (opcional)</Label>
          <Input
            id="cta-secondary-text"
            value={content.secondaryCtaText ?? ''}
            onChange={(e) => updateField('secondaryCtaText', e.target.value || undefined)}
            placeholder="Saber más"
            maxLength={30}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cta-secondary-url">URL secundario</Label>
          <Input
            id="cta-secondary-url"
            value={content.secondaryCtaUrl ?? ''}
            onChange={(e) => updateField('secondaryCtaUrl', e.target.value || undefined)}
            placeholder="#servicios"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cta-style">Estilo</Label>
        <Select
          value={content.style}
          onValueChange={(value) => updateField('style', value as CtaContent['style'])}
        >
          <SelectTrigger id="cta-style">
            <SelectValue placeholder="Selecciona un estilo" />
          </SelectTrigger>
          <SelectContent>
            {STYLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
