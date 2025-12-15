import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Play, CheckCircle, Clock } from 'lucide-react';
import { getUser } from '@/shared/auth';
import { getPublicAppBySlug, getEnabledModules } from '@/features/public-app/public-app.query';
import { getStudentEnrollmentsForOrg } from '@/features/courses/courses.query';
import { PublicNavbar } from '@/features/public-app/components/public-navbar';
import { PublicFooter } from '@/features/public-app/components/public-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function StudentCoursesPage({ params }: PageProps) {
  const { locale, slug } = await params;

  // Get user - redirect to login if not authenticated
  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/app/${slug}/login?redirect=/mis-cursos`);
  }

  // Get app data
  const { data: app } = await getPublicAppBySlug(slug);
  if (!app) {
    notFound();
  }

  // Get enabled modules for navigation
  const { data: enabledModules } = await getEnabledModules(app.id);

  // Get student's enrollments for this organization
  const { data: enrollments } = await getStudentEnrollmentsForOrg(user.id, app.id);

  // Calculate progress for each enrollment
  const enrollmentsWithProgress = (enrollments || []).map((enrollment) => {
    const totalLessons = enrollment.course?.lesson_count || 0;
    const viewedLessons = enrollment.viewed_lessons?.length || 0;
    const progress = totalLessons > 0 ? Math.round((viewedLessons / totalLessons) * 100) : 0;
    const isCompleted = progress === 100;

    return {
      ...enrollment,
      progress,
      viewedLessons,
      totalLessons,
      isCompleted,
    };
  });

  const inProgressCourses = enrollmentsWithProgress.filter((e) => !e.isCompleted);
  const completedCourses = enrollmentsWithProgress.filter((e) => e.isCompleted);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar app={app} enabledModules={enabledModules || []} locale={locale} />

      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mis cursos</h1>
          <p className="text-muted-foreground">
            Aquí puedes ver todos los cursos en los que estás inscrito
          </p>
        </div>

        {enrollmentsWithProgress.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Aún no tienes cursos</h2>
              <p className="text-muted-foreground mb-6">
                Explora el catálogo y encuentra cursos que te interesen
              </p>
              <Button asChild>
                <Link href={`/${locale}/app/${slug}/courses`}>
                  Ver cursos disponibles
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* In Progress Courses */}
            {inProgressCourses.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  En progreso ({inProgressCourses.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {inProgressCourses.map((enrollment) => (
                    <CourseCard
                      key={enrollment.id}
                      enrollment={enrollment}
                      locale={locale}
                      slug={slug}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Completed Courses */}
            {completedCourses.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Completados ({completedCourses.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedCourses.map((enrollment) => (
                    <CourseCard
                      key={enrollment.id}
                      enrollment={enrollment}
                      locale={locale}
                      slug={slug}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <PublicFooter app={app} enabledModules={enabledModules || []} locale={locale} />
    </div>
  );
}

interface CourseCardProps {
  enrollment: {
    id: string;
    course: {
      id: string;
      title: string;
      description: string | null;
      slug: string;
      thumbnail_url: string | null;
    } | null;
    progress: number;
    viewedLessons: number;
    totalLessons: number;
    isCompleted: boolean;
    last_viewed_lesson_id: string | null;
  };
  locale: string;
  slug: string;
}

function CourseCard({ enrollment, locale, slug }: CourseCardProps) {
  const course = enrollment.course;
  if (!course) return null;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {course.thumbnail_url && (
        <div className="aspect-video relative">
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="object-cover w-full h-full"
          />
          {enrollment.isCompleted && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completado
              </Badge>
            </div>
          )}
        </div>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
        {course.description && (
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{enrollment.progress}%</span>
            </div>
            <Progress value={enrollment.progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {enrollment.viewedLessons} de {enrollment.totalLessons} lecciones
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href={`/${locale}/app/${slug}/learn/${course.slug}`}>
              <Play className="h-4 w-4 mr-2" />
              {enrollment.isCompleted ? 'Revisar' : 'Continuar'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
