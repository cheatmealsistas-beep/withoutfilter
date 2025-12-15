'use client';

import { useActionState, useState } from 'react';
import { useLocale } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { createRoomAction } from '../game-lobby.actions';
import { avatarEmojis, type CreateRoomState } from '../types';
import { brand } from '@/shared/config/brand';

export function CreateRoomForm() {
  const locale = useLocale();
  const [state, action, pending] = useActionState<CreateRoomState | null, FormData>(
    createRoomAction,
    null
  );
  const [selectedAvatar, setSelectedAvatar] = useState('😀');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['suave']);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="hostAvatar" value={selectedAvatar} />
      {selectedCategories.map((cat) => (
        <input key={cat} type="hidden" name="categories" value={cat} />
      ))}

      {/* Player Name */}
      <div className="space-y-2">
        <Label htmlFor="hostName">Tu nombre</Label>
        <Input
          id="hostName"
          name="hostName"
          placeholder="Ej: Carlos"
          required
          minLength={2}
          maxLength={30}
          className="text-lg"
        />
      </div>

      {/* Avatar Selection */}
      <div className="space-y-2">
        <Label>Tu avatar</Label>
        <div className="grid grid-cols-8 gap-2">
          {avatarEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setSelectedAvatar(emoji)}
              className={`text-2xl p-2 rounded-lg transition-all ${
                selectedAvatar === emoji
                  ? 'bg-primary text-primary-foreground scale-110'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <Label>Categorías</Label>
        <div className="space-y-2">
          {brand.game.categories.map((category) => (
            <label
              key={category}
              htmlFor={`category-${category}`}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                selectedCategories.includes(category)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <div className="flex-1">
                <span className="font-medium cursor-pointer">
                  {brand.game.categoryNames[category]}
                </span>
                <p className="text-sm text-muted-foreground">
                  {brand.game.categoryDescriptions[category]}
                </p>
              </div>
            </label>
          ))}
        </div>
        {selectedCategories.length === 0 && (
          <p className="text-sm text-destructive">
            Selecciona al menos una categoría
          </p>
        )}
      </div>

      {/* Error Message */}
      {state?.error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {state.error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full text-lg"
        disabled={pending || selectedCategories.length === 0}
      >
        {pending ? 'Creando sala...' : 'Crear Sala'}
      </Button>
    </form>
  );
}
