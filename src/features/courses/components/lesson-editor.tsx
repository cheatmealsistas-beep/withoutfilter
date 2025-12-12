'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { updateLessonAction } from '../courses.actions';
import type { Lesson, LessonType, VideoContent, TextContent, PdfContent, AudioContent } from '../types';

interface LessonEditorProps {
  lesson: Lesson;
  courseId: string;
  orgSlug: string;
  courseSlug: string;
  onClose: () => void;
}

const lessonTypeLabels: Record<LessonType, string> = {
  video: 'Video',
  text: 'Texto/Articulo',
  pdf: 'PDF Descargable',
  audio: 'Audio',
  quiz: 'Quiz/Evaluacion',
  assignment: 'Tarea/Ejercicio',
};

export function LessonEditor({
  lesson,
  courseId,
  orgSlug,
  courseSlug,
  onClose,
}: LessonEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: lesson.title,
    description: lesson.description || '',
    type: lesson.type,
    content: lesson.content as Record<string, unknown>,
    duration_minutes: lesson.duration_minutes || undefined,
    is_free_preview: lesson.is_free_preview,
    is_published: lesson.is_published,
  });

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('El titulo es obligatorio');
      return;
    }

    setIsLoading(true);
    const result = await updateLessonAction(
      lesson.id,
      courseId,
      {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        content: formData.content,
        duration_minutes: formData.duration_minutes,
        is_free_preview: formData.is_free_preview,
        is_published: formData.is_published,
      },
      orgSlug,
      courseSlug
    );
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Leccion actualizada');
    onClose();
  };

  const updateContent = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [key]: value,
      },
    }));
  };

  const renderContentEditor = () => {
    switch (formData.type) {
      case 'video':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="embed_url">URL del video *</Label>
              <Input
                id="embed_url"
                placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
                value={(formData.content as VideoContent).embed_url || ''}
                onChange={(e) => updateContent('embed_url', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Soporta YouTube, Vimeo, Wistia y otros embeds
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Proveedor</Label>
              <Select
                value={(formData.content as VideoContent).provider || 'youtube'}
                onValueChange={(value) => updateContent('provider', value)}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="vimeo">Vimeo</SelectItem>
                  <SelectItem value="wistia">Wistia</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor="html">Contenido del articulo *</Label>
            <Textarea
              id="html"
              placeholder="Escribe el contenido de tu leccion aqui..."
              value={(formData.content as TextContent).html || ''}
              onChange={(e) => updateContent('html', e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Puedes usar HTML basico para formatear el texto
            </p>
          </div>
        );

      case 'pdf':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file_url">URL del PDF *</Label>
              <Input
                id="file_url"
                placeholder="https://ejemplo.com/archivo.pdf"
                value={(formData.content as PdfContent).file_url || ''}
                onChange={(e) => updateContent('file_url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file_name">Nombre del archivo</Label>
              <Input
                id="file_name"
                placeholder="Mi documento.pdf"
                value={(formData.content as PdfContent).file_name || ''}
                onChange={(e) => updateContent('file_name', e.target.value)}
              />
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="audio_url">URL del audio *</Label>
              <Input
                id="audio_url"
                placeholder="https://ejemplo.com/audio.mp3 o embed de Spotify/SoundCloud"
                value={
                  (formData.content as AudioContent).file_url ||
                  (formData.content as AudioContent).embed_url ||
                  ''
                }
                onChange={(e) => {
                  const url = e.target.value;
                  if (url.includes('spotify') || url.includes('soundcloud')) {
                    updateContent('embed_url', url);
                  } else {
                    updateContent('file_url', url);
                  }
                }}
              />
            </div>
          </div>
        );

      case 'quiz':
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              El editor de quizzes estara disponible proximamente.
              Por ahora, puedes configurar las preguntas manualmente en formato JSON.
            </p>
            <Textarea
              placeholder='{"questions": [{"question": "...", "options": ["A", "B", "C"], "correct_index": 0}]}'
              value={JSON.stringify(formData.content, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData((prev) => ({ ...prev, content: parsed }));
                } catch {
                  // Ignore parse errors while typing
                }
              }}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        );

      case 'assignment':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instructions">Instrucciones de la tarea *</Label>
              <Textarea
                id="instructions"
                placeholder="Describe lo que el estudiante debe hacer..."
                value={
                  (formData.content as { instructions_html?: string }).instructions_html || ''
                }
                onChange={(e) => updateContent('instructions_html', e.target.value)}
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="submission_type">Tipo de entrega</Label>
              <Select
                value={
                  (formData.content as { submission_type?: string }).submission_type || 'text'
                }
                onValueChange={(value) => updateContent('submission_type', value)}
              >
                <SelectTrigger id="submission_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="file">Archivo</SelectItem>
                  <SelectItem value="link">Enlace</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar leccion</SheetTitle>
          <SheetDescription>
            Configura el contenido y opciones de esta leccion
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Basic info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                placeholder="Breve descripcion de esta leccion..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de contenido</Label>
              <Select
                value={formData.type}
                onValueChange={(value: LessonType) =>
                  setFormData((prev) => ({ ...prev, type: value, content: {} }))
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(lessonTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duracion (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min={0}
                placeholder="Ej: 15"
                value={formData.duration_minutes || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration_minutes: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
              />
            </div>
          </div>

          {/* Content editor */}
          <div className="border-t pt-6">
            <h3 className="font-medium mb-4">Contenido</h3>
            {renderContentEditor()}
          </div>

          {/* Options */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-medium">Opciones</h3>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="free-preview">Preview gratuito</Label>
                <p className="text-xs text-muted-foreground">
                  Permite que usuarios no inscritos vean esta leccion
                </p>
              </div>
              <Switch
                id="free-preview"
                checked={formData.is_free_preview}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_free_preview: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="published">Publicada</Label>
                <p className="text-xs text-muted-foreground">
                  Los estudiantes podran ver esta leccion
                </p>
              </div>
              <Switch
                id="published"
                checked={formData.is_published}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_published: checked }))
                }
              />
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar cambios
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
