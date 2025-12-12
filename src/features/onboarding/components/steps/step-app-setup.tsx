'use client';

import { useActionState, useEffect, useState, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { SlugInput } from '../slug-input';
import { saveStep2Action } from '../../onboarding.actions';
import { toast } from 'sonner';

interface StepAppSetupProps {
  onComplete: () => void;
}

export function StepAppSetup({ onComplete }: StepAppSetupProps) {
  const [state, action, pending] = useActionState(saveStep2Action, null);
  const [appName, setAppName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugValid, setIsSlugValid] = useState(false);

  // Auto-generate slug from app name
  const generateSlug = useCallback((name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
  }, []);

  const handleAppNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setAppName(name);

    // Only auto-generate slug if user hasn't manually edited it
    if (!slug || slug === generateSlug(appName)) {
      setSlug(generateSlug(name));
    }
  };

  useEffect(() => {
    if (state?.success) {
      onComplete();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onComplete]);

  const isFormValid = appName.length >= 2 && isSlugValid;

  return (
    <form action={action} className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Crea tu primera app</h1>
        <p className="text-muted-foreground">
          Tu app es el espacio donde tus clientes accederán a tu contenido.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="appName">Nombre de tu app</Label>
          <Input
            id="appName"
            name="appName"
            value={appName}
            onChange={handleAppNameChange}
            placeholder="Coaching con María"
            required
            minLength={2}
            autoFocus
          />
        </div>

        <SlugInput
          value={slug}
          onChange={setSlug}
          onValidChange={setIsSlugValid}
        />

        <p className="text-sm text-muted-foreground">
          Esta será tu URL única para compartir con tus clientes.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={pending || !isFormValid}
      >
        {pending ? 'Creando...' : 'Continuar'}
      </Button>
    </form>
  );
}
