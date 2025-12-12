'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { saveStep4Action, completeOnboardingAction } from '../../onboarding.actions';
import { toast } from 'sonner';
import { Eye, Pencil, Check } from 'lucide-react';
import type { HomeContent } from '../../types';
import { cn } from '@/shared/lib/utils';

interface StepPreviewEditorProps {
  defaultContent: HomeContent;
  appName: string;
  logoUrl?: string;
  onComplete: () => void;
}

export function StepPreviewEditor({
  defaultContent,
  appName,
  logoUrl,
  onComplete,
}: StepPreviewEditorProps) {
  const [content, setContent] = useState<HomeContent>(defaultContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Auto-save with debounce
  const autoSave = useCallback(async (newContent: HomeContent) => {
    setSaving(true);
    setSaved(false);

    try {
      const result = await saveStep4Action(newContent);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // Silent fail for auto-save
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (content !== defaultContent) {
        autoSave(content);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [content, defaultContent, autoSave]);

  const handleComplete = async () => {
    setCompleting(true);

    try {
      // Save final content
      await saveStep4Action(content);

      // Complete onboarding
      const result = await completeOnboardingAction();

      if (result.success) {
        onComplete();
      } else {
        toast.error(result.error ?? 'Error al completar');
      }
    } catch {
      toast.error('Error inesperado');
    } finally {
      setCompleting(false);
    }
  };

  const updateContent = (field: keyof HomeContent, value: string) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">¡Tu página está casi lista!</h1>
        <p className="text-muted-foreground">
          Personaliza el contenido de tu página de inicio.
        </p>
      </div>

      {/* Mobile: Tabs / Desktop: Split view */}
      <div className="md:hidden">
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Editar
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Vista previa
            </TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="mt-4">
            <EditorForm content={content} updateContent={updateContent} />
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            <HomePreview content={content} appName={appName} logoUrl={logoUrl} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Split view */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-6">
        <div className="space-y-4">
          <h2 className="font-medium flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Editar
          </h2>
          <EditorForm content={content} updateContent={updateContent} />
        </div>
        <div className="space-y-4">
          <h2 className="font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Vista previa
          </h2>
          <HomePreview content={content} appName={appName} logoUrl={logoUrl} />
        </div>
      </div>

      {/* Save status */}
      <div className="flex items-center justify-center h-6">
        {saving && (
          <span className="text-sm text-muted-foreground animate-pulse">
            Guardando...
          </span>
        )}
        {saved && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <Check className="h-4 w-4" />
            Guardado
          </span>
        )}
      </div>

      <Button
        onClick={handleComplete}
        className="w-full"
        size="lg"
        disabled={completing}
      >
        {completing ? 'Finalizando...' : '¡Mi página está lista!'}
      </Button>
    </div>
  );
}

// Editor form component
function EditorForm({
  content,
  updateContent,
}: {
  content: HomeContent;
  updateContent: (field: keyof HomeContent, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="headline">Título principal</Label>
        <Input
          id="headline"
          value={content.headline}
          onChange={(e) => updateContent('headline', e.target.value)}
          placeholder="Transforma tu vida..."
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground text-right">
          {content.headline.length}/100
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={content.description ?? ''}
          onChange={(e) => updateContent('description', e.target.value)}
          placeholder="Cuéntale a tus clientes qué ofreces..."
          maxLength={300}
          rows={3}
        />
        <p className="text-xs text-muted-foreground text-right">
          {(content.description ?? '').length}/300
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ctaText">Texto del botón</Label>
        <Input
          id="ctaText"
          value={content.ctaText ?? ''}
          onChange={(e) => updateContent('ctaText', e.target.value)}
          placeholder="Reservar ahora"
          maxLength={30}
        />
      </div>
    </div>
  );
}

// Preview component
function HomePreview({
  content,
  appName,
  logoUrl,
}: {
  content: HomeContent;
  appName: string;
  logoUrl?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-background p-6 min-h-[300px]',
        'flex flex-col items-center justify-center text-center space-y-4'
      )}
    >
      {/* Logo or placeholder */}
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={appName}
          className="w-16 h-16 rounded-lg object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">
            {appName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="space-y-2 max-w-md">
        <h2 className="text-xl font-bold">
          {content.headline || 'Tu título aquí'}
        </h2>
        <p className="text-muted-foreground text-sm">
          {content.description || 'Tu descripción aquí...'}
        </p>
      </div>

      {/* CTA Button */}
      <Button size="sm" className="mt-4">
        {content.ctaText || 'Contactar'}
      </Button>

      {/* Footer badge */}
      <p className="text-xs text-muted-foreground mt-8">
        Powered by Modulary
      </p>
    </div>
  );
}
