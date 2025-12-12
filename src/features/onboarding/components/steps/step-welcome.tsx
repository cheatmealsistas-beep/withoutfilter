'use client';

import { useActionState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { saveStep0Action } from '../../onboarding.actions';
import { toast } from 'sonner';

interface StepWelcomeProps {
  defaultName?: string;
  onComplete: () => void;
}

export function StepWelcome({ defaultName, onComplete }: StepWelcomeProps) {
  const [state, action, pending] = useActionState(saveStep0Action, null);

  useEffect(() => {
    if (state?.success) {
      onComplete();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onComplete]);

  return (
    <form action={action} className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">¡Bienvenido a Modulary!</h1>
        <p className="text-muted-foreground">
          Vamos a crear tu espacio digital en menos de 2 minutos.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">¿Cómo te llamas?</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={defaultName}
          placeholder="María García"
          autoFocus
          required
          minLength={2}
          aria-describedby="fullName-help"
        />
        <p id="fullName-help" className="text-sm text-muted-foreground">
          Este nombre aparecerá en tu perfil público.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Guardando...' : 'Continuar'}
      </Button>
    </form>
  );
}
