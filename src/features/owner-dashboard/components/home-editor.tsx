'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { saveHomeContentAction } from '../owner-dashboard.actions';
import { toast } from 'sonner';
import { Eye, Pencil, Check, ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';

interface HomeContent {
  headline: string;
  description: string | null;
  ctaText: string | null;
}

interface HomeEditorProps {
  slug: string;
  initialContent: HomeContent;
  appName: string;
  logoUrl?: string | null;
  locale: string;
}

export function HomeEditor({
  slug,
  initialContent,
  appName,
  logoUrl,
  locale,
}: HomeEditorProps) {
  const [content, setContent] = useState<HomeContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Auto-save with debounce
  const autoSave = useCallback(async (newContent: HomeContent) => {
    setSaving(true);
    setSaved(false);

    try {
      // Convert null to undefined for the action
      const contentForAction = {
        headline: newContent.headline,
        description: newContent.description ?? undefined,
        ctaText: newContent.ctaText ?? undefined,
      };
      const result = await saveHomeContentAction(slug, contentForAction);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        toast.error(result.error || 'Error al guardar');
      }
    } catch {
      toast.error('Error inesperado');
    } finally {
      setSaving(false);
    }
  }, [slug]);

  useEffect(() => {
    const hasChanged = JSON.stringify(content) !== JSON.stringify(initialContent);
    if (!hasChanged) return;

    const timeoutId = setTimeout(() => {
      autoSave(content);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [content, initialContent, autoSave]);

  const updateContent = (field: keyof HomeContent, value: string) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/app/${slug}/admin`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">Personalizar contenido</h1>
              <p className="text-sm text-muted-foreground">Edita los textos de tu pagina de inicio</p>
            </div>
          </div>

          {/* Save status */}
          <div className="flex items-center gap-2">
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
        <div className="hidden md:grid md:grid-cols-2 md:gap-8">
          <div className="space-y-4">
            <h2 className="font-medium flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Editar contenido
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
      </main>
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
    <div className="space-y-6 p-6 border rounded-lg bg-background">
      <div className="space-y-2">
        <Label htmlFor="headline">Titulo principal</Label>
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
        <Label htmlFor="description">Descripcion</Label>
        <Textarea
          id="description"
          value={content.description ?? ''}
          onChange={(e) => updateContent('description', e.target.value)}
          placeholder="Cuentale a tus clientes que ofreces..."
          maxLength={300}
          rows={4}
        />
        <p className="text-xs text-muted-foreground text-right">
          {(content.description ?? '').length}/300
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ctaText">Texto del boton</Label>
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
  logoUrl?: string | null;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-background p-8 min-h-[400px]',
        'flex flex-col items-center justify-center text-center space-y-6'
      )}
    >
      {/* Logo or placeholder */}
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={appName}
          className="w-20 h-20 rounded-lg object-cover"
        />
      ) : (
        <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-3xl font-bold text-primary">
            {appName.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="space-y-3 max-w-md">
        <h2 className="text-2xl font-bold">
          {content.headline || 'Tu titulo aqui'}
        </h2>
        <p className="text-muted-foreground">
          {content.description || 'Tu descripcion aqui...'}
        </p>
      </div>

      {/* CTA Button */}
      <Button size="lg" className="mt-4">
        {content.ctaText || 'Contactar'}
      </Button>

      {/* Footer badge */}
      <p className="text-xs text-muted-foreground mt-8">
        Powered by Modulary
      </p>
    </div>
  );
}
