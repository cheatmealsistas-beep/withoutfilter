import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Plus, BookOpen } from 'lucide-react';
import { getUser } from '@/shared/auth';
import { getOrganizationBySlug } from '@/features/owner-dashboard';
import { getOrganizationCourses } from '@/features/courses';
import { Button } from '@/shared/components/ui/button';
import { CourseList } from '@/features/courses/components/course-list';

interface CoursesPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function CoursesPage({ params }: CoursesPageProps) {
  const { locale, slug } = await params;
  const user = await getUser();

  // Layout already handles auth
  if (!user) {
    notFound();
  }

  const { data: org } = await getOrganizationBySlug(slug);
  if (!org) {
    notFound();
  }

  const { data: courses, error } = await getOrganizationCourses(org.id);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Cursos</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona tus cursos y contenido educativo
            </p>
          </div>
        </div>
        <Link href={`/${locale}/app/${slug}/admin/courses/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo curso
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      ) : (
        <CourseList
          courses={courses ?? []}
          locale={locale}
          orgSlug={slug}
          organizationId={org.id}
        />
      )}
    </div>
  );
}
