import { notFound, redirect } from 'next/navigation';
import { getUser } from '@/shared/auth';
import { getOrganizationBySlug } from '@/features/owner-dashboard';
import {
  getCourseBySlug,
  getCourseWithContent,
  getLessonBySlug,
  getUserEnrollment,
  hasActiveEnrollment,
} from '@/features/courses';
import { LearningPlayer } from '@/features/courses/components/learning-player';

interface LessonPageProps {
  params: Promise<{ locale: string; slug: string; courseSlug: string; lessonSlug: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { locale, slug, courseSlug, lessonSlug } = await params;

  // Get organization
  const { data: org } = await getOrganizationBySlug(slug);
  if (!org) {
    notFound();
  }

  // Get course
  const { data: courseBasic } = await getCourseBySlug(org.id, courseSlug);
  if (!courseBasic || courseBasic.status !== 'published') {
    notFound();
  }

  // Get lesson
  const { data: lesson } = await getLessonBySlug(courseBasic.id, lessonSlug);
  if (!lesson || !lesson.is_published) {
    notFound();
  }

  // Get user
  const user = await getUser();

  // Check access
  const canAccessFreePreview = lesson.is_free_preview && courseBasic.visibility === 'public';

  if (!canAccessFreePreview) {
    // Must be authenticated
    if (!user) {
      redirect(`/${locale}/login?redirect=/app/${slug}/learn/${courseSlug}/${lessonSlug}`);
    }

    // Must have enrollment for private courses
    if (courseBasic.visibility === 'private') {
      const { data: hasAccess } = await hasActiveEnrollment(courseBasic.id, user.id);
      if (!hasAccess) {
        notFound();
      }
    }
  }

  // Get full course for sidebar navigation
  const { data: course } = await getCourseWithContent(courseBasic.id);
  if (!course) {
    notFound();
  }

  // Get enrollment for progress
  let enrollment = null;
  if (user) {
    const { data } = await getUserEnrollment(course.id, user.id);
    enrollment = data;
  }

  // Filter published lessons
  const publishedLessons = course.lessons.filter((l) => l.is_published);

  return (
    <LearningPlayer
      course={course}
      modules={course.modules}
      lessons={publishedLessons}
      currentLesson={lesson}
      enrollment={enrollment}
      locale={locale}
      orgSlug={slug}
      isAuthenticated={!!user}
    />
  );
}
