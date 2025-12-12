'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Globe, Lock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Badge } from '@/shared/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import {
  updateCourseAction,
  publishCourseAction,
  unpublishCourseAction,
  deleteCourseAction,
} from '../courses.actions';
import type { Course, CourseVisibility } from '../types';

interface CourseSettingsFormProps {
  course: Course;
  organizationId: string;
  orgSlug: string;
  locale: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function CourseSettingsForm({
  course,
  organizationId,
  orgSlug,
  locale,
}: CourseSettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(true);

  const [formData, setFormData] = useState({
    title: course.title,
    slug: course.slug,
    description: course.description || '',
    visibility: course.visibility,
  });

  // Track if form has changes
  const hasChanges =
    formData.title !== course.title ||
    formData.slug !== course.slug ||
    formData.description !== (course.description || '') ||
    formData.visibility !== course.visibility;

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('El titulo es obligatorio');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('La URL es obligatoria');
      return;
    }

    setIsLoading(true);
    const result = await updateCourseAction(course.id, organizationId, {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim() || undefined,
      visibility: formData.visibility,
    });
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Configuracion guardada');

    // If slug changed, redirect to new URL
    if (result.data && result.data.slug !== course.slug) {
      router.replace(`/${locale}/app/${orgSlug}/admin/courses/${result.data.slug}`);
    }
  };

  const handlePublish = async () => {
    setIsLoading(true);
    const result = await publishCourseAction(course.id, orgSlug);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Curso publicado correctamente');
    }
  };

  const handleUnpublish = async () => {
    setIsLoading(true);
    const result = await unpublishCourseAction(course.id, orgSlug);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Curso despublicado');
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deleteCourseAction(course.id, orgSlug);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Curso eliminado');
    router.push(`/${locale}/app/${orgSlug}/admin/courses`);
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      slug: value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
    }));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Informacion del curso</CardTitle>
          <CardDescription>
            Configura los datos basicos de tu curso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL del curso *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                /app/{orgSlug}/courses/
              </span>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              disabled={isLoading}
              rows={3}
            />
          </div>

          <Button onClick={handleSave} disabled={isLoading || !hasChanges}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Guardar cambios
          </Button>
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Visibilidad</CardTitle>
          <CardDescription>
            Controla quien puede ver e inscribirse en tu curso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={formData.visibility}
            onValueChange={(value: CourseVisibility) =>
              setFormData((prev) => ({ ...prev, visibility: value }))
            }
            disabled={isLoading}
          >
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="private" id="private" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                  <Lock className="h-4 w-4" />
                  Privado
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Solo los estudiantes que invites podran acceder al curso.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="public" id="public" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                  <Globe className="h-4 w-4" />
                  Publico
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Cualquier persona podra ver e inscribirse en el curso.
                </p>
              </div>
            </div>
          </RadioGroup>

          {hasChanges && (
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar cambios
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Publication Status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de publicacion</CardTitle>
          <CardDescription>
            Un curso publicado es visible para los estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Estado actual</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    course.status === 'published'
                      ? 'default'
                      : course.status === 'draft'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {course.status === 'draft' && 'Borrador'}
                  {course.status === 'published' && 'Publicado'}
                  {course.status === 'archived' && 'Archivado'}
                </Badge>
                {course.published_at && (
                  <span className="text-sm text-muted-foreground">
                    desde {new Date(course.published_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            {course.status === 'draft' && (
              <Button onClick={handlePublish} disabled={isLoading}>
                Publicar curso
              </Button>
            )}
            {course.status === 'published' && (
              <Button variant="outline" onClick={handleUnpublish} disabled={isLoading}>
                Despublicar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de peligro</CardTitle>
          <CardDescription>
            Estas acciones son irreversibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isLoading || course.status === 'published'}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar curso
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Eliminar curso</AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Estas seguro de que quieres eliminar &quot;{course.title}&quot;?
                  Esta accion no se puede deshacer y se eliminaran todos los modulos,
                  lecciones e inscripciones.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Eliminar curso
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {course.status === 'published' && (
            <p className="text-sm text-muted-foreground mt-2">
              Debes despublicar el curso antes de eliminarlo.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
