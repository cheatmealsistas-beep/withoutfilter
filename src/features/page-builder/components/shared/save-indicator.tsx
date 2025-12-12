'use client';

import { Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date;
  className?: string;
}

export function SaveIndicator({ status, lastSaved, className }: SaveIndicatorProps) {
  if (status === 'saving') {
    return (
      <span className={cn('text-sm text-muted-foreground flex items-center gap-1.5', className)}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Guardando...
      </span>
    );
  }

  if (status === 'saved') {
    return (
      <span className={cn('text-sm text-green-600 flex items-center gap-1.5', className)}>
        <Check className="h-3.5 w-3.5" />
        Guardado
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span className={cn('text-sm text-destructive flex items-center gap-1.5', className)}>
        <AlertCircle className="h-3.5 w-3.5" />
        Error
      </span>
    );
  }

  if (lastSaved) {
    const timeAgo = getTimeAgo(lastSaved);
    return (
      <span className={cn('text-sm text-muted-foreground', className)}>
        Guardado {timeAgo}
      </span>
    );
  }

  return null;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'hace un momento';
  if (diffMins === 1) return 'hace 1 min';
  if (diffMins < 60) return `hace ${diffMins} min`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return 'hace 1 hora';
  return `hace ${diffHours} horas`;
}
