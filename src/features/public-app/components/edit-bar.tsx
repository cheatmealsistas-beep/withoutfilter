'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Pencil, Eye } from 'lucide-react';

interface EditBarProps {
  slug: string;
  locale: string;
}

export function EditBar({ slug, locale }: EditBarProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  if (isPreviewMode) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <Button
          onClick={() => setIsPreviewMode(false)}
          className="rounded-full shadow-lg px-6"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Salir de vista previa
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-background border-b h-14">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Editando:</span>
          <span className="text-sm text-muted-foreground">{slug}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreviewMode(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Vista previa
          </Button>

          <Button size="sm" asChild>
            <Link href={`/${locale}/app/${slug}/admin/customize`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar página
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
