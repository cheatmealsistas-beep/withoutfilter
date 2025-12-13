'use client';

import { useState, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { saveStep3Action, getCurrentOrganizationIdAction } from '../../onboarding.actions';
import { uploadOrganizationLogo } from '@/shared/lib/storage';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface StepLogoProps {
  onComplete: () => void;
}

export function StepLogo({ onComplete }: StepLogoProps) {
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Store file reference for later upload
    fileRef.current = file;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setUploading(true);
    try {
      const { organizationId, error: orgError } = await getCurrentOrganizationIdAction();
      if (orgError || !organizationId) {
        toast.error('Error al obtener la organización');
        setUploading(false);
        return;
      }

      const { url, error } = await uploadOrganizationLogo(organizationId, file);
      if (error) {
        toast.error(`Error al subir: ${error}`);
        setLogoPreview(null);
        fileRef.current = null;
      } else if (url) {
        setLogoUrl(url);
        toast.success('Logo subido correctamente');
      }
    } catch {
      toast.error('Error al subir el logo');
      setLogoPreview(null);
      fileRef.current = null;
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoUrl(null);
    fileRef.current = null;
  };

  const handleContinue = async () => {
    setPending(true);

    try {
      const result = await saveStep3Action(logoUrl ?? undefined);

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
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            {!uploading && (
              <button
                onClick={handleRemoveLogo}
                className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                aria-label="Eliminar logo"
              >
                <X className="h-4 w-4" />
              </button>
            )}
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

      <Button
        onClick={handleContinue}
        className="w-full"
        disabled={pending || uploading}
      >
        {pending ? 'Guardando...' : uploading ? 'Subiendo...' : logoPreview ? 'Continuar' : 'Saltar por ahora'}
      </Button>
    </div>
  );
}
