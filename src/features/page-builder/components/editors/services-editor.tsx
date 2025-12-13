'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { IconPicker } from './icon-picker';
import type { ServicesContent, ServiceItem } from '../../types';

interface ServicesEditorProps {
  content: ServicesContent;
  onChange: (content: ServicesContent) => void;
}

export function ServicesEditor({ content, onChange }: ServicesEditorProps) {
  const updateField = <K extends keyof ServicesContent>(field: K, value: ServicesContent[K]) => {
    onChange({ ...content, [field]: value });
  };

  const updateService = (index: number, updates: Partial<ServiceItem>) => {
    const newServices = [...content.services];
    newServices[index] = { ...newServices[index], ...updates };
    updateField('services', newServices);
  };

  const addService = () => {
    if (content.services.length >= 8) return;
    const newService: ServiceItem = {
      id: crypto.randomUUID(),
      icon: 'Star',
      title: 'Nuevo servicio',
      description: 'Descripción del servicio',
    };
    updateField('services', [...content.services, newService]);
  };

  const removeService = (index: number) => {
    if (content.services.length <= 1) return;
    const newServices = content.services.filter((_, i) => i !== index);
    updateField('services', newServices);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="services-headline">Título de la sección</Label>
        <Input
          id="services-headline"
          value={content.headline ?? ''}
          onChange={(e) => updateField('headline', e.target.value || undefined)}
          placeholder="Mis Servicios"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="services-subheadline">Subtítulo</Label>
        <Input
          id="services-subheadline"
          value={content.subheadline ?? ''}
          onChange={(e) => updateField('subheadline', e.target.value || undefined)}
          placeholder="Soluciones adaptadas a tus necesidades"
          maxLength={200}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Servicios ({content.services.length}/8)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addService}
            disabled={content.services.length >= 8}
            className="gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Añadir
          </Button>
        </div>

        <div className="space-y-3">
          {content.services.map((service, index) => (
            <Card key={service.id} className="bg-muted/50">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-start gap-3">
                  <IconPicker
                    value={service.icon}
                    onChange={(icon) => updateService(index, { icon })}
                  />
                  <div className="flex-1 space-y-2">
                    <Input
                      value={service.title}
                      onChange={(e) => updateService(index, { title: e.target.value })}
                      placeholder="Nombre del servicio"
                      maxLength={50}
                    />
                    <Textarea
                      value={service.description}
                      onChange={(e) => updateService(index, { description: e.target.value })}
                      placeholder="Descripción breve..."
                      maxLength={200}
                      rows={2}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeService(index)}
                    disabled={content.services.length <= 1}
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
