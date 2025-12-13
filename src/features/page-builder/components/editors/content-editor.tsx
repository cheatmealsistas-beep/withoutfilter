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
import type { ContentContent } from '../../types';

interface ContentEditorProps {
  content: ContentContent;
  onChange: (content: ContentContent) => void;
}

const POSITION_OPTIONS = [
  { value: 'left', label: 'Imagen a la izquierda' },
  { value: 'right', label: 'Imagen a la derecha' },
] as const;

const STYLE_OPTIONS = [
  { value: 'default', label: 'Por defecto' },
  { value: 'boxed', label: 'Con fondo' },
  { value: 'fullwidth', label: 'Ancho completo' },
] as const;

export function ContentEditor({ content, onChange }: ContentEditorProps) {
  const updateField = <K extends keyof ContentContent>(field: K, value: ContentContent[K]) => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content-headline">Título</Label>
        <Input
          id="content-headline"
          value={content.headline}
          onChange={(e) => updateField('headline', e.target.value)}
          placeholder="Sobre nosotros"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content-subheadline">Subtítulo (opcional)</Label>
        <Input
          id="content-subheadline"
          value={content.subheadline ?? ''}
          onChange={(e) => updateField('subheadline', e.target.value || undefined)}
          placeholder="Conoce nuestra historia"
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content-body">Contenido</Label>
        <Textarea
          id="content-body"
          value={content.body}
          onChange={(e) => updateField('body', e.target.value)}
          placeholder="Escribe aquí el contenido de esta sección..."
          maxLength={2000}
          rows={6}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {content.body.length}/2000 caracteres
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content-image-url">URL de imagen (opcional)</Label>
        <Input
          id="content-image-url"
          value={content.imageUrl ?? ''}
          onChange={(e) => updateField('imageUrl', e.target.value || undefined)}
          placeholder="https://ejemplo.com/imagen.jpg"
          type="url"
        />
      </div>

      {content.imageUrl && (
        <div className="space-y-2">
          <Label htmlFor="content-image-alt">Texto alternativo de imagen</Label>
          <Input
            id="content-image-alt"
            value={content.imageAlt ?? ''}
            onChange={(e) => updateField('imageAlt', e.target.value || undefined)}
            placeholder="Descripción de la imagen"
            maxLength={100}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="content-position">Posición de imagen</Label>
          <Select
            value={content.imagePosition}
            onValueChange={(value) => updateField('imagePosition', value as ContentContent['imagePosition'])}
          >
            <SelectTrigger id="content-position">
              <SelectValue placeholder="Selecciona posición" />
            </SelectTrigger>
            <SelectContent>
              {POSITION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content-style">Estilo</Label>
          <Select
            value={content.style}
            onValueChange={(value) => updateField('style', value as ContentContent['style'])}
          >
            <SelectTrigger id="content-style">
              <SelectValue placeholder="Selecciona estilo" />
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
    </div>
  );
}
