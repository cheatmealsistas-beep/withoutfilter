import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Lock, Globe } from 'lucide-react';
import { getUser } from '@/shared/auth';
import {
  getPublicAppBySlug,
  getEnabledModules,
  isAppOwner,
  PublicNavbar,
  PublicFooter,
} from '@/features/public-app';
import { getPublishedCourses, getUserAccessibleCourses } from '@/features/courses';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

interface CoursesPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function PublicCoursesPage({ params }: CoursesPageProps) {
  const { locale, slug } = await params;

  // Get app data
  const { data: app } = await getPublicAppBySlug(slug);
  if (!app) {
    notFound();
  }

  // Get user and check ownership
  const user = await getUser();
  const isOwner = user ? await isAppOwner(app.id, user.id) : false;

  // Get enabled modules for navigation
  const { data: enabledModules } = await getEnabledModules(app.id);

  // Get courses based on user authentication
  let courses;
  if (user) {
    const { data } = await getUserAccessibleCourses(app.id, user.id);
    courses = data;
  } else {
    const { data } = await getPublishedCourses(app.id);
    courses = data?.map((c) => ({ ...c, is_enrolled: false }));
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <PublicNavbar
        app={app}
        enabledModules={enabledModules || []}
        locale={locale}
        isOwner={isOwner}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cursos</h1>
          <p className="text-muted-foreground">
            Explora nuestro catalogo de cursos
          </p>
        </div>

        {!courses || courses.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Proximamente</CardTitle>
              <CardDescription>
                Aun no hay cursos disponibles. Vuelve pronto para ver las novedades.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/${locale}/app/${slug}/courses/${course.slug}`}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  {course.thumbnail_url && (
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {course.title}
                      </CardTitle>
                      {course.visibility === 'public' ? (
                        <Badge variant="outline" className="shrink-0">
                          <Globe className="h-3 w-3 mr-1" />
                          Gratis
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0">
                          <Lock className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    {course.description && (
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          Curso
                        </span>
                      </div>
                      {course.is_enrolled && (
                        <Badge variant="default">Inscrito</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <PublicFooter app={app} />
    </div>
  );
}
