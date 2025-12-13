import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Clock, Users, Play, Lock, CheckCircle2 } from 'lucide-react';
import { getUser } from '@/shared/auth';
import {
  getPublicAppBySlug,
  getEnabledModules,
  isAppOwner,
  PublicNavbar,
  PublicFooter,
} from '@/features/public-app';
import {
  getCourseBySlug,
  getCourseWithContent,
  getUserEnrollment,
  hasActiveEnrollment,
} from '@/features/courses';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { CourseEnrollButton } from '@/features/courses/components/course-enroll-button';

interface CourseDetailPageProps {
  params: Promise<{ locale: string; slug: string; courseSlug: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { locale, slug, courseSlug } = await params;

  // Get app data
  const { data: app } = await getPublicAppBySlug(slug);
  if (!app) {
    console.log('[CourseDetailPage] App not found for slug:', slug);
    notFound();
  }

  // Get course
  console.log('[CourseDetailPage] Fetching course with:', {
    orgId: app.id,
    orgSlug: slug,
    courseSlug,
  });

  const { data: courseBasic, error: courseError } = await getCourseBySlug(app.id, courseSlug);

  // Debug log
  console.log('[CourseDetailPage] Course query result:', {
    orgId: app.id,
    courseSlug,
    found: !!courseBasic,
    courseId: courseBasic?.id,
    courseTitle: courseBasic?.title,
    courseDbSlug: courseBasic?.slug,
    status: courseBasic?.status,
    visibility: courseBasic?.visibility,
    error: courseError,
  });

  // Course not found or not published
  console.log('[CourseDetailPage] Checking publish status:', {
    hasData: !!courseBasic,
    status: courseBasic?.status,
    isPublished: courseBasic?.status === 'published',
  });

  if (!courseBasic || courseBasic.status !== 'published') {
    console.log('[CourseDetailPage] REJECTING - Course not found or not published:', {
      courseSlug,
      status: courseBasic?.status,
      condition1: !courseBasic,
      condition2: courseBasic?.status !== 'published',
    });
    notFound();
  }

  console.log('[CourseDetailPage] PASSED publish check, continuing...');

  // Get user
  const user = await getUser();
  console.log('[CourseDetailPage] User:', { hasUser: !!user, userId: user?.id });

  const isOwner = user ? await isAppOwner(app.id, user.id) : false;
  console.log('[CourseDetailPage] Is owner:', isOwner);

  // Get enabled modules for navigation
  const { data: enabledModules } = await getEnabledModules(app.id);

  // Check if course is private and user doesn't have access
  console.log('[CourseDetailPage] Checking visibility:', {
    visibility: courseBasic.visibility,
    isPrivate: courseBasic.visibility === 'private',
  });

  if (courseBasic.visibility === 'private') {
    if (!user) {
      console.log('[CourseDetailPage] Private course, no user - redirecting to login');
      redirect(`/${locale}/login?redirect=/app/${slug}/courses/${courseSlug}`);
    }

    const { data: hasAccess } = await hasActiveEnrollment(courseBasic.id, user.id);
    console.log('[CourseDetailPage] Private course access check:', { hasAccess });
    if (!hasAccess) {
      console.log('[CourseDetailPage] REJECTING - No access to private course');
      notFound();
    }
  }

  // Get full course content
  console.log('[CourseDetailPage] Fetching full course content for id:', courseBasic.id);
  const { data: course, error: contentError } = await getCourseWithContent(courseBasic.id);
  console.log('[CourseDetailPage] Course content result:', {
    hasCourse: !!course,
    error: contentError,
  });

  if (!course) {
    console.log('[CourseDetailPage] REJECTING - No course content found');
    notFound();
  }

  console.log('[CourseDetailPage] SUCCESS - Rendering course page');

  // Check enrollment status
  let isEnrolled = false;
  let enrollment = null;
  if (user) {
    const { data } = await getUserEnrollment(course.id, user.id);
    enrollment = data;
    isEnrolled = enrollment?.status === 'active';
  }

  // Calculate course stats
  const publishedLessons = course.lessons.filter((l) => l.is_published);
  const totalDuration = publishedLessons.reduce(
    (acc, l) => acc + (l.duration_minutes || 0),
    0
  );

  // Group lessons by module
  const lessonsByModule: Record<string, typeof course.lessons> = {};
  const standaloneLessons: typeof course.lessons = [];

  publishedLessons.forEach((lesson) => {
    if (lesson.module_id) {
      if (!lessonsByModule[lesson.module_id]) {
        lessonsByModule[lesson.module_id] = [];
      }
      lessonsByModule[lesson.module_id].push(lesson);
    } else {
      standaloneLessons.push(lesson);
    }
  });

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
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Course Info */}
          <div className="lg:col-span-2 space-y-6">
            {course.thumbnail_url && (
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-2">
                {course.visibility === 'public' ? (
                  <Badge variant="outline">Gratis</Badge>
                ) : (
                  <Badge variant="secondary">Premium</Badge>
                )}
                {course.is_featured && <Badge>Destacado</Badge>}
              </div>
              <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
              {course.description && (
                <p className="text-lg text-muted-foreground">{course.description}</p>
              )}
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {publishedLessons.length} lecciones
              </span>
              {totalDuration > 0 && (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {totalDuration} min
                </span>
              )}
            </div>

            <Separator />

            {/* Course Content */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Contenido del curso</h2>

              <div className="space-y-4">
                {/* Modules */}
                {course.modules
                  .filter((m) => (lessonsByModule[m.id]?.length || 0) > 0)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((module) => (
                    <Card key={module.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{module.title}</CardTitle>
                        {module.description && (
                          <CardDescription>{module.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {(lessonsByModule[module.id] || [])
                            .sort((a, b) => a.display_order - b.display_order)
                            .map((lesson) => (
                              <LessonRow
                                key={lesson.id}
                                lesson={lesson}
                                isEnrolled={isEnrolled}
                                viewedLessons={enrollment?.viewed_lessons || []}
                                locale={locale}
                                orgSlug={slug}
                                courseSlug={courseSlug}
                              />
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                {/* Standalone Lessons */}
                {standaloneLessons.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Lecciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {standaloneLessons
                          .sort((a, b) => a.display_order - b.display_order)
                          .map((lesson) => (
                            <LessonRow
                              key={lesson.id}
                              lesson={lesson}
                              isEnrolled={isEnrolled}
                              viewedLessons={enrollment?.viewed_lessons || []}
                              locale={locale}
                              orgSlug={slug}
                              courseSlug={courseSlug}
                            />
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>
                  {isEnrolled ? 'Continua aprendiendo' : 'Empieza ahora'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEnrolled ? (
                  <Link href={`/${locale}/app/${slug}/learn/${courseSlug}`}>
                    <Button className="w-full" size="lg">
                      <Play className="h-4 w-4 mr-2" />
                      Ir al curso
                    </Button>
                  </Link>
                ) : (
                  <CourseEnrollButton
                    courseId={course.id}
                    visibility={course.visibility}
                    orgSlug={slug}
                    locale={locale}
                    isAuthenticated={!!user}
                    courseSlug={courseSlug}
                  />
                )}

                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {publishedLessons.length} lecciones
                  </p>
                  {totalDuration > 0 && (
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {totalDuration} minutos de contenido
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Acceso ilimitado
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <PublicFooter app={app} />
    </div>
  );
}

function LessonRow({
  lesson,
  isEnrolled,
  viewedLessons,
  locale,
  orgSlug,
  courseSlug,
}: {
  lesson: {
    id: string;
    title: string;
    slug: string;
    type: string;
    duration_minutes: number | null;
    is_free_preview: boolean;
  };
  isEnrolled: boolean;
  viewedLessons: string[];
  locale: string;
  orgSlug: string;
  courseSlug: string;
}) {
  const isViewed = viewedLessons.includes(lesson.id);
  const canAccess = isEnrolled || lesson.is_free_preview;

  const content = (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${
        canAccess ? 'hover:bg-muted cursor-pointer' : 'opacity-60'
      }`}
    >
      <div className="flex-shrink-0">
        {isViewed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : canAccess ? (
          <Play className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Lock className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{lesson.title}</p>
        <p className="text-xs text-muted-foreground">
          {lesson.duration_minutes && `${lesson.duration_minutes} min`}
        </p>
      </div>
      {lesson.is_free_preview && !isEnrolled && (
        <Badge variant="outline" className="text-xs">
          Preview
        </Badge>
      )}
    </div>
  );

  if (canAccess) {
    return (
      <Link
        href={`/${locale}/app/${orgSlug}/learn/${courseSlug}/${lesson.slug}`}
        key={lesson.id}
      >
        {content}
      </Link>
    );
  }

  return <div key={lesson.id}>{content}</div>;
}
