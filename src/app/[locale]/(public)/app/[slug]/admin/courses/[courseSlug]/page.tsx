import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
import { getUser } from '@/shared/auth';
import { isOwnerOfOrganization } from '@/features/owner-dashboard';
import { getCourseBySlug, getCourseWithContent } from '@/features/courses';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { CourseContentEditor } from '@/features/courses/components/course-content-editor';
import { CourseSettingsForm } from '@/features/courses/components/course-settings-form';
import { CourseEnrollmentsManager } from '@/features/courses/components/course-enrollments-manager';

interface EditCoursePageProps {
  params: Promise<{ locale: string; slug: string; courseSlug: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { locale, slug, courseSlug } = await params;
  const user = await getUser();

  if (!user) {
    redirect(`/${locale}/login?redirect=/app/${slug}/admin/courses/${courseSlug}`);
  }

  const isOwner = await isOwnerOfOrganization(user.id, slug);
  if (!isOwner) {
    notFound();
  }

  // Get organization
  const { getOrganizationBySlug } = await import('@/features/owner-dashboard');
  const { data: org } = await getOrganizationBySlug(slug);

  if (!org) {
    notFound();
  }

  // Get course with content
  const { data: courseBasic } = await getCourseBySlug(org.id, courseSlug);

  if (!courseBasic) {
    notFound();
  }

  const { data: course, error } = await getCourseWithContent(courseBasic.id);

  if (error || !course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/app/${slug}/admin/courses`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">{course.title}</h1>
              <p className="text-sm text-muted-foreground">
                {course.status === 'draft' && 'Borrador'}
                {course.status === 'published' && 'Publicado'}
                {course.status === 'archived' && 'Archivado'}
                {' · '}
                {course.visibility === 'public' ? 'Publico' : 'Privado'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {course.status === 'published' && (
              <Link href={`/${locale}/app/${slug}/courses/${courseSlug}`} target="_blank">
                <Button variant="outline" size="sm">
                  Ver curso
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList>
            <TabsTrigger value="content">Contenido</TabsTrigger>
            <TabsTrigger value="students">Estudiantes</TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Configuracion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <CourseContentEditor
              course={course}
              modules={course.modules}
              lessons={course.lessons}
              orgSlug={slug}
            />
          </TabsContent>

          <TabsContent value="students">
            <CourseEnrollmentsManager
              courseId={course.id}
              orgSlug={slug}
              courseSlug={courseSlug}
              locale={locale}
            />
          </TabsContent>

          <TabsContent value="settings">
            <CourseSettingsForm
              course={course}
              organizationId={org.id}
              orgSlug={slug}
              locale={locale}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
