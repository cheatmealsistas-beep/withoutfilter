import { notFound, redirect } from 'next/navigation';
import { getUser } from '@/shared/auth';
import { getOrganizationBySlug } from '@/features/owner-dashboard';
import {
  getCourseBySlug,
  getCourseWithContent,
  getUserEnrollment,
  hasActiveEnrollment,
} from '@/features/courses';
import { LearningPlayer } from '@/features/courses/components/learning-player';

interface LearnCoursePageProps {
  params: Promise<{ locale: string; slug: string; courseSlug: string }>;
}

export default async function LearnCoursePage({ params }: LearnCoursePageProps) {
  const { locale, slug, courseSlug } = await params;

  // Must be authenticated
  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login?redirect=/app/${slug}/learn/${courseSlug}`);
  }

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

  // Check access
  if (courseBasic.visibility === 'private') {
    const { data: hasAccess } = await hasActiveEnrollment(courseBasic.id, user.id);
    if (!hasAccess) {
      notFound();
    }
  }

  // Get full course
  const { data: course } = await getCourseWithContent(courseBasic.id);
  if (!course) {
    notFound();
  }

  // Get enrollment for progress
  const { data: enrollment } = await getUserEnrollment(course.id, user.id);

  // Filter to published lessons
  const publishedLessons = course.lessons.filter((l) => l.is_published);

  // Find first lesson or last viewed
  let currentLesson = publishedLessons[0];
  if (enrollment?.last_viewed_lesson_id) {
    const lastViewed = publishedLessons.find(
      (l) => l.id === enrollment.last_viewed_lesson_id
    );
    if (lastViewed) {
      currentLesson = lastViewed;
    }
  }

  // If no lessons, show empty state
  if (!currentLesson) {
    notFound();
  }

  // Redirect to first/last lesson
  redirect(`/${locale}/app/${slug}/learn/${courseSlug}/${currentLesson.slug}`);
}
