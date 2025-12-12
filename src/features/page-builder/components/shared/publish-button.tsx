'use client';

import { useState } from 'react';
import { Loader2, Globe } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { publishAction } from '../../page-builder.actions';
import { toast } from 'sonner';

interface PublishButtonProps {
  slug: string;
  onSuccess?: () => void;
}

export function PublishButton({ slug, onSuccess }: PublishButtonProps) {
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    setPublishing(true);

    try {
      const result = await publishAction(slug);

      if (result.success) {
        toast.success('Página publicada correctamente');
        onSuccess?.();
      } else {
        toast.error(result.error ?? 'Error al publicar');
      }
    } catch {
      toast.error('Error inesperado');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Button
      onClick={handlePublish}
      disabled={publishing}
      size="sm"
      className="gap-2"
    >
      {publishing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Publicando...
        </>
      ) : (
        <>
          <Globe className="h-4 w-4" />
          Publicar
        </>
      )}
    </Button>
  );
}
