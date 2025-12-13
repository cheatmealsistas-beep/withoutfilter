'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { uploadOrganizationLogo } from '@/shared/lib/storage';
import { updateLogoAction } from '../owner-dashboard.actions';
import { toast } from 'sonner';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface OrganizationSettingsProps {
  organizationId: string;
  slug: string;
  currentLogoUrl: string | null;
  organizationName: string;
}

export function OrganizationSettings({
  organizationId,
  slug,
  currentLogoUrl,
  organizationName,
}: OrganizationSettingsProps) {
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(currentLogoUrl);
  const inputRef = useRef<HTMLInputElement>(null);

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

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setUploading(true);
    try {
      const { url, error } = await uploadOrganizationLogo(organizationId, file);
      if (error) {
        toast.error(`Error al subir: ${error}`);
        setLogoPreview(currentLogoUrl);
      } else if (url) {
        // Save URL to database
        const result = await updateLogoAction(slug, url);
        if (result.success) {
          setLogoPreview(url);
          toast.success('Logo actualizado correctamente');
        } else {
          toast.error(result.error ?? 'Error al guardar el logo');
          setLogoPreview(currentLogoUrl);
        }
      }
    } catch {
      toast.error('Error al subir el logo');
      setLogoPreview(currentLogoUrl);
    } finally {
      setUploading(false);
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemoveLogo = async () => {
    setUploading(true);
    try {
      const result = await updateLogoAction(slug, '');
      if (result.success) {
        setLogoPreview(null);
        toast.success('Logo eliminado');
      } else {
        toast.error(result.error ?? 'Error al eliminar el logo');
      }
    } catch {
      toast.error('Error al eliminar el logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Logo
          </CardTitle>
          <CardDescription>
            El logo aparece en el navbar de tu sitio publico y en tu dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Logo preview/upload */}
            <div className="relative">
              {logoPreview ? (
                <div className="relative">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-muted">
                    <img
                      src={logoPreview}
                      alt={organizationName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <span className="text-3xl font-bold text-muted-foreground">
                    {organizationName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <label
                className={cn(
                  'cursor-pointer inline-flex items-center justify-center gap-2',
                  'px-4 py-2 rounded-md text-sm font-medium',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                  'transition-colors',
                  uploading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Upload className="h-4 w-4" />
                {logoPreview ? 'Cambiar logo' : 'Subir logo'}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="sr-only"
                />
              </label>

              {logoPreview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveLogo}
                  disabled={uploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG o SVG. Maximo 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
