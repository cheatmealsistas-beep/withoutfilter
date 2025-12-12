'use client';

import { useState } from 'react';
import {
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Pencil,
  Video,
  FileText,
  FileAudio,
  FileQuestion,
  ClipboardList,
  File,
  Eye,
  EyeOff,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  createModuleAction,
  deleteModuleAction,
  createLessonAction,
  deleteLessonAction,
  publishLessonAction,
  unpublishLessonAction,
} from '../courses.actions';
import type { Course, CourseModule, Lesson, LessonType } from '../types';
import { LessonEditor } from './lesson-editor';

interface CourseContentEditorProps {
  course: Course;
  modules: CourseModule[];
  lessons: Lesson[];
  orgSlug: string;
}

const lessonTypeIcons: Record<LessonType, React.ReactNode> = {
  video: <Video className="h-4 w-4" />,
  text: <FileText className="h-4 w-4" />,
  pdf: <File className="h-4 w-4" />,
  audio: <FileAudio className="h-4 w-4" />,
  quiz: <FileQuestion className="h-4 w-4" />,
  assignment: <ClipboardList className="h-4 w-4" />,
};

const lessonTypeLabels: Record<LessonType, string> = {
  video: 'Video',
  text: 'Texto',
  pdf: 'PDF',
  audio: 'Audio',
  quiz: 'Quiz',
  assignment: 'Tarea',
};

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

export function CourseContentEditor({
  course,
  modules,
  lessons,
  orgSlug,
}: CourseContentEditorProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id))
  );
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [newModule, setNewModule] = useState({ title: '', description: '' });
  const [newLesson, setNewLesson] = useState({
    title: '',
    slug: '',
    type: 'video' as LessonType,
  });

  // Group lessons by module
  const lessonsByModule = lessons.reduce(
    (acc, lesson) => {
      const key = lesson.module_id || 'standalone';
      if (!acc[key]) acc[key] = [];
      acc[key].push(lesson);
      return acc;
    },
    {} as Record<string, Lesson[]>
  );

  const standaloneLessons = lessonsByModule['standalone'] || [];

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleAddModule = async () => {
    if (!newModule.title.trim()) {
      toast.error('El titulo es obligatorio');
      return;
    }

    setIsLoading(true);
    const result = await createModuleAction(
      course.id,
      {
        title: newModule.title.trim(),
        description: newModule.description.trim() || undefined,
        display_order: modules.length,
      },
      orgSlug,
      course.slug
    );
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Modulo creado');
    setIsAddModuleOpen(false);
    setNewModule({ title: '', description: '' });
  };

  const handleDeleteModule = async (moduleId: string) => {
    setIsLoading(true);
    const result = await deleteModuleAction(moduleId, orgSlug, course.slug);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Modulo eliminado. Las lecciones ahora son independientes.');
    }
  };

  const openAddLesson = (moduleId: string | null) => {
    setTargetModuleId(moduleId);
    setNewLesson({ title: '', slug: '', type: 'video' });
    setIsAddLessonOpen(true);
  };

  const handleAddLesson = async () => {
    if (!newLesson.title.trim()) {
      toast.error('El titulo es obligatorio');
      return;
    }

    const slug = newLesson.slug.trim() || generateSlug(newLesson.title);

    setIsLoading(true);
    const result = await createLessonAction(
      course.id,
      {
        title: newLesson.title.trim(),
        slug,
        type: newLesson.type,
        content: {},
        module_id: targetModuleId,
        display_order:
          targetModuleId && lessonsByModule[targetModuleId]
            ? lessonsByModule[targetModuleId].length
            : standaloneLessons.length,
        is_free_preview: false,
        is_published: false,
      },
      orgSlug,
      course.slug
    );
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Leccion creada');
    setIsAddLessonOpen(false);
    setNewLesson({ title: '', slug: '', type: 'video' });

    // Open lesson editor
    if (result.data) {
      setEditingLesson(result.data);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    setIsLoading(true);
    const result = await deleteLessonAction(lessonId, orgSlug, course.slug);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Leccion eliminada');
    }
  };

  const handleToggleLessonPublish = async (lesson: Lesson) => {
    setIsLoading(true);
    const result = lesson.is_published
      ? await unpublishLessonAction(lesson.id, orgSlug, course.slug)
      : await publishLessonAction(lesson.id, orgSlug, course.slug);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(lesson.is_published ? 'Leccion despublicada' : 'Leccion publicada');
    }
  };

  const renderLesson = (lesson: Lesson) => (
    <div
      key={lesson.id}
      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg group hover:bg-muted transition-colors"
    >
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
      <div className="flex items-center gap-2 text-muted-foreground">
        {lessonTypeIcons[lesson.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{lesson.title}</p>
        <p className="text-xs text-muted-foreground">
          {lessonTypeLabels[lesson.type]}
          {lesson.duration_minutes && ` · ${lesson.duration_minutes} min`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {lesson.is_free_preview && (
          <Badge variant="outline" className="text-xs">
            Preview
          </Badge>
        )}
        <Badge variant={lesson.is_published ? 'default' : 'secondary'} className="text-xs">
          {lesson.is_published ? 'Publicada' : 'Borrador'}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100"
              disabled={isLoading}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditingLesson(lesson)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar contenido
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleLessonPublish(lesson)}>
              {lesson.is_published ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Despublicar
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Publicar
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteLesson(lesson.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        {/* Modules */}
        {modules.map((module) => (
          <Card key={module.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto"
                  onClick={() => toggleModule(module.id)}
                >
                  {expandedModules.has(module.id) ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </Button>
                <div className="flex-1">
                  <CardTitle className="text-base">{module.title}</CardTitle>
                  {module.description && (
                    <CardDescription className="text-sm">
                      {module.description}
                    </CardDescription>
                  )}
                </div>
                <Badge variant="outline">
                  {(lessonsByModule[module.id] || []).length} lecciones
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={isLoading}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openAddLesson(module.id)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir leccion
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteModule(module.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar modulo
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            {expandedModules.has(module.id) && (
              <CardContent className="space-y-2">
                {(lessonsByModule[module.id] || [])
                  .sort((a, b) => a.display_order - b.display_order)
                  .map(renderLesson)}
                {(lessonsByModule[module.id] || []).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Este modulo aun no tiene lecciones
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => openAddLesson(module.id)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir leccion
                </Button>
              </CardContent>
            )}
          </Card>
        ))}

        {/* Standalone lessons */}
        {standaloneLessons.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Lecciones independientes</CardTitle>
              <CardDescription>
                Lecciones que no pertenecen a ningun modulo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {standaloneLessons
                .sort((a, b) => a.display_order - b.display_order)
                .map(renderLesson)}
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {modules.length === 0 && standaloneLessons.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Tu curso aun no tiene contenido. Empieza creando un modulo o una leccion.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => setIsAddModuleOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear modulo
                </Button>
                <Button onClick={() => openAddLesson(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear leccion
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action buttons */}
        {(modules.length > 0 || standaloneLessons.length > 0) && (
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setIsAddModuleOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo modulo
            </Button>
            <Button variant="outline" onClick={() => openAddLesson(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva leccion independiente
            </Button>
          </div>
        )}
      </div>

      {/* Add Module Dialog */}
      <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo modulo</DialogTitle>
            <DialogDescription>
              Los modulos te ayudan a organizar tus lecciones en secciones.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="module-title">Titulo *</Label>
              <Input
                id="module-title"
                placeholder="Ej: Introduccion"
                value={newModule.title}
                onChange={(e) =>
                  setNewModule((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-description">Descripcion</Label>
              <Textarea
                id="module-description"
                placeholder="Descripcion opcional del modulo..."
                value={newModule.description}
                onChange={(e) =>
                  setNewModule((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddModuleOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddModule} disabled={isLoading}>
              Crear modulo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva leccion</DialogTitle>
            <DialogDescription>
              Elige el tipo de contenido para tu leccion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Titulo *</Label>
              <Input
                id="lesson-title"
                placeholder="Ej: Bienvenida al curso"
                value={newLesson.title}
                onChange={(e) =>
                  setNewLesson((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de contenido</Label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(lessonTypeIcons) as LessonType[]).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={newLesson.type === type ? 'default' : 'outline'}
                    className="flex flex-col h-auto py-3 gap-1"
                    onClick={() => setNewLesson((prev) => ({ ...prev, type }))}
                  >
                    {lessonTypeIcons[type]}
                    <span className="text-xs">{lessonTypeLabels[type]}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddLessonOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddLesson} disabled={isLoading}>
              Crear leccion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Editor */}
      {editingLesson && (
        <LessonEditor
          lesson={editingLesson}
          courseId={course.id}
          orgSlug={orgSlug}
          courseSlug={course.slug}
          onClose={() => setEditingLesson(null)}
        />
      )}
    </>
  );
}
