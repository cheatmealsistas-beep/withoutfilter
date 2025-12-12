'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { BlockList } from './block-list';
import { SaveIndicator } from './shared/save-indicator';
import { PublishButton } from './shared/publish-button';
import { PagePreview } from './preview/page-preview';
import { saveDraftAction } from '../page-builder.actions';
import { createDefaultBlock } from '../lib/block-defaults';
import type { PageBlock, PageSettings, BlockType, PageBuilderContent } from '../types';

interface PageBuilderEditorProps {
  organizationId: string;
  organizationSlug: string;
  initialContent: PageBuilderContent;
  locale: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function PageBuilderEditor({
  organizationId,
  organizationSlug,
  initialContent,
  locale,
}: PageBuilderEditorProps) {
  const [blocks, setBlocks] = useState<PageBlock[]>(initialContent.draft.blocks);
  const [settings, setSettings] = useState<PageSettings>(initialContent.settings);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | undefined>(undefined);
  const [hasChanges, setHasChanges] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save with debounce
  const scheduleSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      const result = await saveDraftAction(organizationSlug, blocks, settings);

      if (result.success) {
        setSaveStatus('saved');
        setLastSaved(new Date());
        setHasChanges(false);
      } else {
        setSaveStatus('error');
        toast.error(result.error ?? 'Error al guardar');
      }
    }, 1000);
  }, [organizationSlug, blocks, settings]);

  // Trigger save on changes
  useEffect(() => {
    if (hasChanges) {
      scheduleSave();
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasChanges, scheduleSave]);

  // Mark as changed when blocks or settings change
  useEffect(() => {
    setHasChanges(true);
  }, [blocks, settings]);

  // Block operations - all local, auto-save handles persistence
  const handleBlockChange = useCallback((blockId: string, content: PageBlock['content']) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, content } as PageBlock : block
      )
    );
  }, []);

  const handleBlockVisibilityChange = useCallback((blockId: string, isVisible: boolean) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === blockId ? { ...block, isVisible } : block
      )
    );
  }, []);

  const handleBlockMove = useCallback((blockId: string, direction: 'up' | 'down') => {
    setBlocks((prev) => {
      const currentIndex = prev.findIndex((b) => b.id === blockId);
      if (currentIndex === -1) return prev;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newBlocks = [...prev];
      [newBlocks[currentIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[currentIndex]];

      // Update order values
      return newBlocks.map((block, index) => ({ ...block, order: index }));
    });
  }, []);

  const handleBlockDelete = useCallback((blockId: string) => {
    setBlocks((prev) => {
      const newBlocks = prev.filter((b) => b.id !== blockId);
      return newBlocks.map((block, index) => ({ ...block, order: index }));
    });
    toast.success('Bloque eliminado');
  }, []);

  const handleBlockAdd = useCallback((type: BlockType) => {
    const newBlock = createDefaultBlock(type, blocks.length);
    setBlocks((prev) => [...prev, newBlock]);
  }, [blocks.length]);

  // Settings operations
  const handleSettingsChange = useCallback((newSettings: Partial<PageSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const handlePublishSuccess = useCallback(() => {
    toast.success('¡Página publicada!');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${locale}/app/${organizationSlug}/admin`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">Personalizar página</h1>
          </div>
          <div className="flex items-center gap-4">
            <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
            <PublishButton
              slug={organizationSlug}
              onSuccess={handlePublishSuccess}
            />
          </div>
        </div>
      </header>

      {/* Mobile: Tabs */}
      <div className="md:hidden">
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="edit" className="flex-1">
              Editar
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              Vista previa
            </TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="p-4 space-y-6">
            {/* Settings */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium">🎨 Colores</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="primary-color-mobile">Principal</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color-mobile"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => handleSettingsChange({ primaryColor: e.target.value })}
                      className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) => handleSettingsChange({ primaryColor: e.target.value })}
                      className="flex-1 font-mono text-sm"
                      maxLength={7}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color-mobile">Secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color-mobile"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => handleSettingsChange({ secondaryColor: e.target.value })}
                      className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) => handleSettingsChange({ secondaryColor: e.target.value })}
                      className="flex-1 font-mono text-sm"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Blocks */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium">📦 Bloques</h2>
              <BlockList
                blocks={blocks}
                onBlockChange={handleBlockChange}
                onBlockVisibilityChange={handleBlockVisibilityChange}
                onBlockMove={handleBlockMove}
                onBlockDelete={handleBlockDelete}
                onBlockAdd={handleBlockAdd}
              />
            </div>
          </TabsContent>
          <TabsContent value="preview" className="p-0">
            <PagePreview blocks={blocks} settings={settings} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Split View */}
      <div className="hidden md:grid md:grid-cols-[400px_1fr] lg:grid-cols-[450px_1fr] min-h-[calc(100vh-3.5rem)]">
        {/* Left Panel: Editor */}
        <div className="border-r overflow-y-auto p-6 space-y-6">
          {/* Settings */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium">🎨 Colores</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Principal</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => handleSettingsChange({ primaryColor: e.target.value })}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) => handleSettingsChange({ primaryColor: e.target.value })}
                    className="flex-1 font-mono text-sm"
                    maxLength={7}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secundario</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => handleSettingsChange({ secondaryColor: e.target.value })}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    value={settings.secondaryColor}
                    onChange={(e) => handleSettingsChange({ secondaryColor: e.target.value })}
                    className="flex-1 font-mono text-sm"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Blocks */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium">📦 Bloques</h2>
            <BlockList
              blocks={blocks}
              onBlockChange={handleBlockChange}
              onBlockVisibilityChange={handleBlockVisibilityChange}
              onBlockMove={handleBlockMove}
              onBlockDelete={handleBlockDelete}
              onBlockAdd={handleBlockAdd}
            />
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="bg-muted/30 overflow-y-auto">
          <PagePreview blocks={blocks} settings={settings} />
        </div>
      </div>
    </div>
  );
}
