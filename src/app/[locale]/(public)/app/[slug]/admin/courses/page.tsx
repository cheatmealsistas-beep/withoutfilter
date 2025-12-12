import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { getUser } from '@/shared/auth';
import { isOwnerOfOrganization } from '@/features/owner-dashboard';
import { getOrganizationCourses } from '@/features/courses';
import { Button } from '@/shared/components/ui/button';
import { CourseList } from '@/features/courses/components/course-list';

interface CoursesPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function CoursesPage({ params }: CoursesPageProps) {
  const { locale, slug } = await params;
  const user = await getUser();

  if (!user) {
    redirect(`/${locale}/login?redirect=/app/${slug}/admin/courses`);
  }

  const isOwner = await isOwnerOfOrganization(user.id, slug);
  if (!isOwner) {
    notFound();
  }

  // Get organization ID from slug
  const { getOrganizationBySlug } = await import('@/features/owner-dashboard');
  const { data: org } = await getOrganizationBySlug(slug);

  if (!org) {
    notFound();
  }

  const { data: courses, error } = await getOrganizationCourses(org.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
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
              <h1 className="font-semibold">Cursos</h1>
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
      </header>

      <main className="container mx-auto px-4 py-8">
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
      </main>
    </div>
  );
}
