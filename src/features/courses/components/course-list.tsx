'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  MoreHorizontal,
  Eye,
  EyeOff,
  Trash2,
  Archive,
  Users,
  GraduationCap,
  Globe,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import {
  publishCourseAction,
  unpublishCourseAction,
  archiveCourseAction,
  deleteCourseAction,
} from '../courses.actions';
import type { CourseWithStats } from '../types';

interface CourseListProps {
  courses: CourseWithStats[];
  locale: string;
  orgSlug: string;
  organizationId: string;
}

export function CourseList({ courses, locale, orgSlug }: CourseListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<CourseWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePublish = async (course: CourseWithStats) => {
    setIsLoading(true);
    const result = await publishCourseAction(course.id, orgSlug);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Curso publicado correctamente');
    }
  };

  const handleUnpublish = async (course: CourseWithStats) => {
    setIsLoading(true);
    const result = await unpublishCourseAction(course.id, orgSlug);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Curso despublicado');
    }
  };

  const handleArchive = async (course: CourseWithStats) => {
    setIsLoading(true);
    const result = await archiveCourseAction(course.id, orgSlug);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Curso archivado');
    }
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;

    setIsLoading(true);
    const result = await deleteCourseAction(courseToDelete.id, orgSlug);
    setIsLoading(false);
    setDeleteDialogOpen(false);
    setCourseToDelete(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Curso eliminado');
    }
  };

  const confirmDelete = (course: CourseWithStats) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  if (courses.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Aun no tienes cursos</CardTitle>
          <CardDescription>
            Crea tu primer curso para empezar a compartir conocimiento con tus estudiantes.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href={`/${locale}/app/${orgSlug}/admin/courses/new`}>
            <Button>Crear mi primer curso</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id} className="group relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1 min-w-0">
                  <Link
                    href={`/${locale}/app/${orgSlug}/admin/courses/${course.slug}`}
                    className="hover:underline"
                  >
                    <CardTitle className="text-lg truncate">{course.title}</CardTitle>
                  </Link>
                  <div className="flex items-center gap-2">
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
                    <Badge variant="outline" className="gap-1">
                      {course.visibility === 'public' ? (
                        <>
                          <Globe className="h-3 w-3" />
                          Publico
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" />
                          Privado
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isLoading}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/app/${orgSlug}/admin/courses/${course.slug}`}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Editar contenido
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {course.status === 'draft' && (
                      <DropdownMenuItem onClick={() => handlePublish(course)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Publicar
                      </DropdownMenuItem>
                    )}
                    {course.status === 'published' && (
                      <DropdownMenuItem onClick={() => handleUnpublish(course)}>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Despublicar
                      </DropdownMenuItem>
                    )}
                    {course.status !== 'archived' && (
                      <DropdownMenuItem onClick={() => handleArchive(course)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archivar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => confirmDelete(course)}
                      className="text-destructive focus:text-destructive"
                      disabled={course.status === 'published'}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {course.description && (
                <CardDescription className="line-clamp-2 mb-4">
                  {course.description}
                </CardDescription>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {course.lesson_count} lecciones
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.enrollment_count} estudiantes
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar curso</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estas seguro de que quieres eliminar &quot;{courseToDelete?.title}&quot;?
              Esta accion no se puede deshacer y se eliminaran todos los modulos, lecciones
              e inscripciones asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Eliminando...' : 'Eliminar curso'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
