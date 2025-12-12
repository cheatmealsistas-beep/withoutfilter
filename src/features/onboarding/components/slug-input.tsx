'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { checkSlugAction } from '../onboarding.actions';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface SlugInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidChange?: (isValid: boolean) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export function SlugInput({
  value,
  onChange,
  onValidChange,
  label = 'Tu URL',
  placeholder = 'mi-espacio',
  disabled = false,
}: SlugInputProps) {
  const [status, setStatus] = useState<SlugStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Normalize slug: lowercase, replace spaces with hyphens, remove invalid chars
  const normalizeSlug = useCallback((input: string): string => {
    return input
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }, []);

  // Check slug availability with debounce
  useEffect(() => {
    if (!value || value.length < 3) {
      setStatus('idle');
      setError(null);
      onValidChange?.(false);
      return;
    }

    // Basic validation
    const slugRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;
    if (!slugRegex.test(value)) {
      setStatus('invalid');
      setError('Solo letras, números y guiones. No puede empezar ni terminar con guión.');
      onValidChange?.(false);
      return;
    }

    setStatus('checking');
    setError(null);

    const timeoutId = setTimeout(async () => {
      const result = await checkSlugAction(value);

      if (result.available) {
        setStatus('available');
        setError(null);
        onValidChange?.(true);
      } else {
        setStatus('taken');
        setError(result.error ?? 'Este slug ya está en uso');
        onValidChange?.(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [value, onValidChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeSlug(e.target.value);
    onChange(normalized);
  };

  const statusIcon = {
    idle: null,
    checking: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
    available: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    taken: <XCircle className="h-4 w-4 text-destructive" />,
    invalid: <XCircle className="h-4 w-4 text-destructive" />,
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="slug">{label}</Label>
      <div className="flex">
        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
          modulary.app/
        </span>
        <div className="relative flex-1">
          <Input
            id="slug"
            name="slug"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'rounded-l-none pr-10',
              status === 'available' && 'border-green-500 focus-visible:ring-green-500 bg-green-50',
              (status === 'taken' || status === 'invalid') &&
                'border-destructive focus-visible:ring-destructive bg-destructive/5'
            )}
            aria-describedby="slug-status"
            aria-invalid={status === 'taken' || status === 'invalid'}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {statusIcon[status]}
          </div>
        </div>
      </div>
      <div id="slug-status" className="min-h-[20px]">
        {error && (
          <p className="text-sm text-destructive font-medium flex items-center gap-1" role="alert">
            <XCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        {status === 'available' && (
          <p className="text-sm text-green-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            ¡Disponible!
          </p>
        )}
        {status === 'idle' && value.length > 0 && value.length < 3 && (
          <p className="text-sm text-muted-foreground">Mínimo 3 caracteres</p>
        )}
      </div>
    </div>
  );
}
