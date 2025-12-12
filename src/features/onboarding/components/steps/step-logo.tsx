'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { saveStep3Action } from '../../onboarding.actions';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface StepLogoProps {
  onComplete: () => void;
}

export function StepLogo({ onComplete }: StepLogoProps) {
  const [pending, setPending] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona una imagen');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede superar 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // TODO: In production, upload to Supabase Storage and get URL
    // For now, we just show the preview
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
  };

  const handleContinue = async () => {
    setPending(true);

    try {
      // TODO: If logoPreview exists, upload to Supabase Storage first
      const result = await saveStep3Action(logoPreview ?? undefined);

      if (result.success) {
        onComplete();
      } else {
        toast.error(result.error ?? 'Error al guardar');
      }
    } catch {
      toast.error('Error inesperado');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Añade tu logo</h1>
        <p className="text-muted-foreground">
          Dale personalidad a tu espacio. Puedes añadirlo después.
        </p>
      </div>

      <div className="flex flex-col items-center">
        {logoPreview ? (
          <div className="relative">
            <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-primary">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleRemoveLogo}
              className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
              aria-label="Eliminar logo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            className={cn(
              'w-32 h-32 rounded-lg border-2 border-dashed cursor-pointer',
              'flex flex-col items-center justify-center gap-2',
              'border-muted-foreground/25 hover:border-primary hover:bg-primary/5',
              'transition-colors'
            )}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Subir logo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          PNG, JPG o SVG. Máximo 2MB.
        </p>
      </div>

      <Button onClick={handleContinue} className="w-full" disabled={pending}>
        {pending ? 'Guardando...' : logoPreview ? 'Continuar' : 'Saltar por ahora'}
      </Button>
    </div>
  );
}
