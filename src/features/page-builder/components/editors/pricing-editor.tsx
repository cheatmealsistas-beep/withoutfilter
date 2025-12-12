'use client';

import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Switch } from '@/shared/components/ui/switch';
import type { PricingContent, PricingTier } from '../../types';

interface PricingEditorProps {
  content: PricingContent;
  onChange: (content: PricingContent) => void;
}

export function PricingEditor({ content, onChange }: PricingEditorProps) {
  const updateField = <K extends keyof PricingContent>(field: K, value: PricingContent[K]) => {
    onChange({ ...content, [field]: value });
  };

  const updateTier = (index: number, updates: Partial<PricingTier>) => {
    const newTiers = [...content.tiers];
    newTiers[index] = { ...newTiers[index], ...updates };
    updateField('tiers', newTiers);
  };

  const addTier = () => {
    if (content.tiers.length >= 4) return;
    const newTier: PricingTier = {
      id: crypto.randomUUID(),
      name: 'Nuevo plan',
      price: '0€/mes',
      description: 'Descripción del plan',
      features: ['Característica 1'],
      ctaText: 'Elegir',
      isHighlighted: false,
    };
    updateField('tiers', [...content.tiers, newTier]);
  };

  const removeTier = (index: number) => {
    if (content.tiers.length <= 1) return;
    const newTiers = content.tiers.filter((_, i) => i !== index);
    updateField('tiers', newTiers);
  };

  const addFeature = (tierIndex: number) => {
    const tier = content.tiers[tierIndex];
    if (tier.features.length >= 10) return;
    updateTier(tierIndex, { features: [...tier.features, 'Nueva característica'] });
  };

  const updateFeature = (tierIndex: number, featureIndex: number, value: string) => {
    const tier = content.tiers[tierIndex];
    const newFeatures = [...tier.features];
    newFeatures[featureIndex] = value;
    updateTier(tierIndex, { features: newFeatures });
  };

  const removeFeature = (tierIndex: number, featureIndex: number) => {
    const tier = content.tiers[tierIndex];
    if (tier.features.length <= 1) return;
    const newFeatures = tier.features.filter((_, i) => i !== featureIndex);
    updateTier(tierIndex, { features: newFeatures });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pricing-headline">Título de la sección</Label>
        <Input
          id="pricing-headline"
          value={content.headline ?? ''}
          onChange={(e) => updateField('headline', e.target.value || undefined)}
          placeholder="Planes y Precios"
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pricing-subheadline">Subtítulo</Label>
        <Input
          id="pricing-subheadline"
          value={content.subheadline ?? ''}
          onChange={(e) => updateField('subheadline', e.target.value || undefined)}
          placeholder="Elige el plan que mejor se adapte a ti"
          maxLength={200}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Planes ({content.tiers.length}/4)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTier}
            disabled={content.tiers.length >= 4}
            className="gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Añadir plan
          </Button>
        </div>

        <div className="space-y-4">
          {content.tiers.map((tier, tierIndex) => (
            <Card key={tier.id} className="bg-muted/50">
              <CardContent className="p-3 space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={tier.name}
                        onChange={(e) => updateTier(tierIndex, { name: e.target.value })}
                        placeholder="Nombre del plan"
                        maxLength={30}
                      />
                      <Input
                        value={tier.price}
                        onChange={(e) => updateTier(tierIndex, { price: e.target.value })}
                        placeholder="29€/mes"
                        maxLength={20}
                      />
                    </div>

                    <Input
                      value={tier.description ?? ''}
                      onChange={(e) =>
                        updateTier(tierIndex, { description: e.target.value || undefined })
                      }
                      placeholder="Descripción breve"
                      maxLength={100}
                    />

                    {/* Features */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Características</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addFeature(tierIndex)}
                          disabled={tier.features.length >= 10}
                          className="h-6 px-2 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Añadir
                        </Button>
                      </div>
                      {tier.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-1">
                          <Input
                            value={feature}
                            onChange={(e) =>
                              updateFeature(tierIndex, featureIndex, e.target.value)
                            }
                            placeholder="Característica"
                            maxLength={100}
                            className="h-8 text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => removeFeature(tierIndex, featureIndex)}
                            disabled={tier.features.length <= 1}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={tier.ctaText}
                        onChange={(e) => updateTier(tierIndex, { ctaText: e.target.value })}
                        placeholder="Texto del botón"
                        maxLength={30}
                      />
                      <Input
                        value={tier.ctaUrl ?? ''}
                        onChange={(e) =>
                          updateTier(tierIndex, { ctaUrl: e.target.value || undefined })
                        }
                        placeholder="URL (opcional)"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={tier.isHighlighted}
                        onCheckedChange={(checked) =>
                          updateTier(tierIndex, { isHighlighted: checked })
                        }
                      />
                      <span className="text-sm text-muted-foreground">Destacar este plan</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeTier(tierIndex)}
                    disabled={content.tiers.length <= 1}
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
