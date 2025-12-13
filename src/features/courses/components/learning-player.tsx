'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Play,
  Menu,
  FileText,
  Video,
  File,
  FileAudio,
  FileQuestion,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet';
import { markLessonViewedAction } from '../courses.actions';
import type { Course, CourseModule, Lesson, CourseEnrollment, LessonType, VideoContent, TextContent, PdfContent, AudioContent } from '../types';

interface LearningPlayerProps {
  course: Course;
  modules: CourseModule[];
  lessons: Lesson[];
  currentLesson: Lesson;
  enrollment: CourseEnrollment | null;
  locale: string;
  orgSlug: string;
  isAuthenticated: boolean;
}

const lessonTypeIcons: Record<LessonType, React.ReactNode> = {
  video: <Video className="h-4 w-4" />,
  text: <FileText className="h-4 w-4" />,
  pdf: <File className="h-4 w-4" />,
  audio: <FileAudio className="h-4 w-4" />,
  quiz: <FileQuestion className="h-4 w-4" />,
  assignment: <ClipboardList className="h-4 w-4" />,
};

export function LearningPlayer({
  course,
  modules,
  lessons,
  currentLesson,
  enrollment,
  locale,
  orgSlug,
}: LearningPlayerProps) {
  const [viewedLessons, setViewedLessons] = useState<Set<string>>(
    new Set(enrollment?.viewed_lessons || [])
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mark lesson as viewed when component mounts
  useEffect(() => {
    if (enrollment && !viewedLessons.has(currentLesson.id)) {
      markLessonViewedAction(course.id, currentLesson.id);
      setViewedLessons((prev) => new Set([...prev, currentLesson.id]));
    }
  }, [currentLesson.id, course.id, enrollment, viewedLessons]);

  // Find previous and next lessons
  const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
  const previousLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  // Group lessons by module
  const lessonsByModule: Record<string, Lesson[]> = {};
  const standaloneLessons: Lesson[] = [];

  lessons.forEach((lesson) => {
    if (lesson.module_id) {
      if (!lessonsByModule[lesson.module_id]) {
        lessonsByModule[lesson.module_id] = [];
      }
      lessonsByModule[lesson.module_id].push(lesson);
    } else {
      standaloneLessons.push(lesson);
    }
  });

  const renderLessonContent = () => {
    const content = currentLesson.content;

    switch (currentLesson.type) {
      case 'video':
        const videoContent = content as VideoContent;
        if (!videoContent.embed_url) {
          return (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Video no disponible</p>
            </div>
          );
        }

        // Convert YouTube watch URL to embed URL
        let embedUrl = videoContent.embed_url;
        if (embedUrl.includes('youtube.com/watch')) {
          const videoId = new URL(embedUrl).searchParams.get('v');
          if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
          }
        } else if (embedUrl.includes('youtu.be/')) {
          const videoId = embedUrl.split('youtu.be/')[1]?.split('?')[0];
          if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
          }
        }

        return (
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <iframe
              src={embedUrl}
              title={currentLesson.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );

      case 'text':
        const textContent = content as TextContent;
        return (
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: textContent.html || '' }}
          />
        );

      case 'pdf':
        const pdfContent = content as PdfContent;
        return (
          <div className="space-y-4">
            {pdfContent.file_url && (
              <>
                <iframe
                  src={pdfContent.file_url}
                  title={`PDF: ${currentLesson.title}`}
                  className="w-full h-[600px] rounded-lg border"
                />
                <div className="flex justify-center">
                  <a
                    href={pdfContent.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={pdfContent.file_name}
                  >
                    <Button variant="outline">
                      <File className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                  </a>
                </div>
              </>
            )}
          </div>
        );

      case 'audio':
        const audioContent = content as AudioContent;
        const audioUrl = audioContent.file_url || audioContent.embed_url;
        if (!audioUrl) {
          return (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Audio no disponible</p>
            </div>
          );
        }

        if (audioContent.embed_url) {
          return (
            <iframe
              src={audioContent.embed_url}
              title={`Audio: ${currentLesson.title}`}
              className="w-full h-[152px] rounded-lg"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          );
        }

        return (
          <div className="bg-muted rounded-lg p-8 text-center">
            <FileAudio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
{/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio controls className="w-full max-w-md mx-auto">
              <source src={audioContent.file_url} />
              Tu navegador no soporta audio
            </audio>
          </div>
        );

      case 'quiz':
        return (
          <div className="text-center py-12">
            <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Quiz</p>
            <p className="text-muted-foreground">
              La funcionalidad de quizzes estara disponible proximamente.
            </p>
          </div>
        );

      case 'assignment':
        const assignmentContent = content as { instructions_html?: string };
        return (
          <div className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Instrucciones
              </h3>
              {assignmentContent.instructions_html ? (
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: assignmentContent.instructions_html }}
                />
              ) : (
                <p className="text-muted-foreground">No hay instrucciones disponibles.</p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Tipo de contenido no soportado
            </p>
          </div>
        );
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <Link href={`/${locale}/app/${orgSlug}/courses/${course.slug}`}>
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al curso
          </Button>
        </Link>
        <h2 className="font-semibold truncate">{course.title}</h2>
        <p className="text-sm text-muted-foreground">
          {viewedLessons.size} / {lessons.length} completadas
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Modules */}
          {modules
            .filter((m) => (lessonsByModule[m.id]?.length || 0) > 0)
            .sort((a, b) => a.display_order - b.display_order)
            .map((mod) => (
              <div key={mod.id}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {mod.title}
                </h3>
                <div className="space-y-1">
                  {(lessonsByModule[mod.id] || [])
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((lesson) => (
                      <LessonNavItem
                        key={lesson.id}
                        lesson={lesson}
                        isCurrent={lesson.id === currentLesson.id}
                        isViewed={viewedLessons.has(lesson.id)}
                        locale={locale}
                        orgSlug={orgSlug}
                        courseSlug={course.slug}
                        onNavigate={() => setSidebarOpen(false)}
                      />
                    ))}
                </div>
              </div>
            ))}

          {/* Standalone lessons */}
          {standaloneLessons.length > 0 && (
            <div>
              {modules.length > 0 && (
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Otras lecciones
                </h3>
              )}
              <div className="space-y-1">
                {standaloneLessons
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((lesson) => (
                    <LessonNavItem
                      key={lesson.id}
                      lesson={lesson}
                      isCurrent={lesson.id === currentLesson.id}
                      isViewed={viewedLessons.has(lesson.id)}
                      locale={locale}
                      orgSlug={orgSlug}
                      courseSlug={course.slug}
                      onNavigate={() => setSidebarOpen(false)}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 border-r bg-background">
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Mobile menu */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  {sidebarContent}
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2 text-muted-foreground">
                {lessonTypeIcons[currentLesson.type]}
              </div>
              <div>
                <h1 className="font-medium">{currentLesson.title}</h1>
                {currentLesson.duration_minutes && (
                  <p className="text-xs text-muted-foreground">
                    {currentLesson.duration_minutes} min
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {viewedLessons.has(currentLesson.id) && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Completada
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Lesson content */}
        <div className="flex-1 overflow-auto">
          <div className="container max-w-4xl mx-auto px-4 py-8">
            {renderLessonContent()}

            {/* Description */}
            {currentLesson.description && (
              <div className="mt-8 pt-8 border-t">
                <h2 className="font-semibold mb-2">Descripcion</h2>
                <p className="text-muted-foreground">{currentLesson.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation footer */}
        <footer className="border-t bg-background px-4 py-3">
          <div className="container max-w-4xl mx-auto flex items-center justify-between">
            {previousLesson ? (
              <Link href={`/${locale}/app/${orgSlug}/learn/${course.slug}/${previousLesson.slug}`}>
                <Button variant="ghost">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link href={`/${locale}/app/${orgSlug}/learn/${course.slug}/${nextLesson.slug}`}>
                <Button>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button disabled>
                Curso completado
                <CheckCircle2 className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}

function LessonNavItem({
  lesson,
  isCurrent,
  isViewed,
  locale,
  orgSlug,
  courseSlug,
  onNavigate,
}: {
  lesson: Lesson;
  isCurrent: boolean;
  isViewed: boolean;
  locale: string;
  orgSlug: string;
  courseSlug: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={`/${locale}/app/${orgSlug}/learn/${courseSlug}/${lesson.slug}`}
      onClick={onNavigate}
    >
      <div
        className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
          isCurrent
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted'
        }`}
      >
        <div className="flex-shrink-0">
          {isViewed ? (
            <CheckCircle2
              className={`h-4 w-4 ${isCurrent ? 'text-primary-foreground' : 'text-green-500'}`}
            />
          ) : (
            <Play
              className={`h-4 w-4 ${isCurrent ? 'text-primary-foreground' : 'text-muted-foreground'}`}
            />
          )}
        </div>
        <span className="truncate">{lesson.title}</span>
      </div>
    </Link>
  );
}
