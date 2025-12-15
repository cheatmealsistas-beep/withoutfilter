'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Slider } from '@/shared/components/ui/slider';
import { brand } from '@/shared/config/brand';
import type { RoomConfig as RoomConfigType } from '../types';

interface RoomConfigProps {
  config: RoomConfigType;
  onChange: (config: Partial<RoomConfigType>) => void;
  disabled?: boolean;
}

export function RoomConfig({ config, onChange, disabled }: RoomConfigProps) {
  const [localConfig, setLocalConfig] = useState(config);

  // Debounced update to avoid too many server calls
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (
        localConfig.roundsPerGame !== config.roundsPerGame ||
        localConfig.timePerRound !== config.timePerRound ||
        JSON.stringify(localConfig.categories) !==
          JSON.stringify(config.categories)
      ) {
        onChange(localConfig);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [localConfig, config, onChange]);

  const toggleCategory = (category: string) => {
    const newCategories = localConfig.categories.includes(
      category as RoomConfigType['categories'][number]
    )
      ? localConfig.categories.filter((c) => c !== category)
      : [
          ...localConfig.categories,
          category as RoomConfigType['categories'][number],
        ];

    if (newCategories.length > 0) {
      setLocalConfig({ ...localConfig, categories: newCategories });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg">Configuración</h3>

      {/* Categories */}
      <div className="space-y-3">
        <Label>Categorías</Label>
        <div className="space-y-2">
          {brand.game.categories.map((category) => (
            <div
              key={category}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                localConfig.categories.includes(category)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => !disabled && toggleCategory(category)}
            >
              <Checkbox
                id={`config-category-${category}`}
                checked={localConfig.categories.includes(category)}
                disabled={disabled}
                onCheckedChange={() => toggleCategory(category)}
              />
              <div className="flex-1">
                <label
                  htmlFor={`config-category-${category}`}
                  className="font-medium cursor-pointer"
                >
                  {brand.game.categoryNames[category]}
                </label>
                <p className="text-sm text-muted-foreground">
                  {brand.game.categoryDescriptions[category]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rounds */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Número de rondas</Label>
          <span className="text-sm font-medium">
            {localConfig.roundsPerGame}
          </span>
        </div>
        <Slider
          value={[localConfig.roundsPerGame]}
          onValueChange={(values: number[]) =>
            setLocalConfig({ ...localConfig, roundsPerGame: values[0] })
          }
          min={5}
          max={20}
          step={1}
          disabled={disabled}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5 rondas</span>
          <span>20 rondas</span>
        </div>
      </div>

      {/* Time per round */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Tiempo por ronda</Label>
          <span className="text-sm font-medium">
            {localConfig.timePerRound}s
          </span>
        </div>
        <Slider
          value={[localConfig.timePerRound]}
          onValueChange={(values: number[]) =>
            setLocalConfig({ ...localConfig, timePerRound: values[0] })
          }
          min={15}
          max={60}
          step={5}
          disabled={disabled}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>15 segundos</span>
          <span>60 segundos</span>
        </div>
      </div>
    </div>
  );
}
