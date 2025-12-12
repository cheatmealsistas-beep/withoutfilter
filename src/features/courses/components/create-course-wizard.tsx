'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Lock, Loader2 } from 'lucide-react';
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
import { createCourseAction } from '../courses.actions';
import type { CourseVisibility } from '../types';

interface CreateCourseWizardProps {
  organizationId: string;
  orgSlug: string;
  locale: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .replace(/^-|-$/g, ''); // Remove leading/trailing -
}

export function CreateCourseWizard({
  organizationId,
  orgSlug,
  locale,
}: CreateCourseWizardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    visibility: 'private' as CourseVisibility,
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(prev.title),
      }));
    }
  }, [formData.title, slugManuallyEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('El titulo es obligatorio');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('La URL es obligatoria');
      return;
    }

    setIsLoading(true);

    const result = await createCourseAction(organizationId, {
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

    toast.success('Curso creado correctamente');
    router.push(`/${locale}/app/${orgSlug}/admin/courses/${result.data?.slug}`);
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      slug: value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Informacion basica</CardTitle>
          <CardDescription>
            Define el titulo y la URL de tu curso. Podras cambiar estos datos mas adelante.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo del curso *</Label>
            <Input
              id="title"
              placeholder="Ej: Introduccion al Marketing Digital"
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
              <span className="text-sm text-muted-foreground">
                /app/{orgSlug}/courses/
              </span>
              <Input
                id="slug"
                placeholder="mi-curso"
                value={formData.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Solo letras minusculas, numeros y guiones
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              placeholder="Describe de que trata tu curso..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Visibilidad</Label>
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
                    Ideal para cursos de pago o contenido exclusivo.
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
                    Ideal para cursos gratuitos o de captacion.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Crear curso
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
