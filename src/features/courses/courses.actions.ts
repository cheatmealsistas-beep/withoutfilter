'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/shared/auth';
import {
  handleCreateCourse,
  handleUpdateCourse,
  handlePublishCourse,
  handleUnpublishCourse,
  handleArchiveCourse,
  handleDeleteCourse,
  handleReorderCourses,
  handleCreateModule,
  handleUpdateModule,
  handleDeleteModule,
  handleReorderModules,
  handleCreateLesson,
  handleUpdateLesson,
  handlePublishLesson,
  handleUnpublishLesson,
  handleDeleteLesson,
  handleReorderLessons,
  handleEnrollUser,
  handleSelfEnroll,
  handleRevokeEnrollment,
  handleDeleteEnrollment,
  handleMarkLessonViewed,
} from './courses.handler';
import { getCourseEnrollments as getCourseEnrollmentsQuery } from './courses.query';
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CreateModuleInput,
  UpdateModuleInput,
  CreateLessonInput,
  UpdateLessonInput,
  ReorderLessonsInput,
  EnrollmentWithUser,
} from './types';

// ============================================
// COURSE ACTIONS
// ============================================

export async function createCourseAction(
  organizationId: string,
  input: CreateCourseInput
) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const result = await handleCreateCourse(organizationId, user.id, input);

  if (result.data) {
    revalidatePath(`/app/[slug]/admin/courses`, 'page');
  }

  return result;
}

export async function updateCourseAction(
  courseId: string,
  organizationId: string,
  input: UpdateCourseInput
) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const result = await handleUpdateCourse(courseId, organizationId, input);

  if (result.data) {
    revalidatePath(`/app/[slug]/admin/courses`, 'page');
    revalidatePath(`/app/[slug]/admin/courses/${result.data.slug}`, 'page');
    revalidatePath(`/app/[slug]/courses`, 'page');
  }

  return result;
}

export async function publishCourseAction(courseId: string, orgSlug: string) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const result = await handlePublishCourse(courseId);

  if (result.data) {
    revalidatePath(`/app/${orgSlug}/admin/courses`, 'page');
    revalidatePath(`/app/${orgSlug}/courses`, 'page');
  }

  return result;
}

export async function unpublishCourseAction(courseId: string, orgSlug: string) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const result = await handleUnpublishCourse(courseId);

  if (result.data) {
    revalidatePath(`/app/${orgSlug}/admin/courses`, 'page');
    revalidatePath(`/app/${orgSlug}/courses`, 'page');
  }

  return result;
}

export async function archiveCourseAction(courseId: string, orgSlug: string) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const result = await handleArchiveCourse(courseId);

  if (result.data) {
    revalidatePath(`/app/${orgSlug}/admin/courses`, 'page');
    revalidatePath(`/app/${orgSlug}/courses`, 'page');
  }

  return result;
}

export async function deleteCourseAction(courseId: string, orgSlug: string) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const result = await handleDeleteCourse(courseId);

  if (result.success) {
    revalidatePath(`/app/${orgSlug}/admin/courses`, 'page');
  }

  return result;
}

export async function reorderCoursesAction(
  courses: { id: string; display_order: number }[],
  orgSlug: string
) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const result = await handleReorderCourses(courses);

  if (result.success) {
    revalidatePath(`/app/${orgSlug}/admin/courses`, 'page');
    revalidatePath(`/app/${orgSlug}/courses`, 'page');
  }

  return result;
}

// ============================================
// MODULE ACTIONS
// ============================================

export async function createModuleAction(
  courseId: string,
  input: CreateModuleInput,
  orgSlug: string,
  courseSlug: string
) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const result = await handleCreateModule(courseId, input);

  if (result.data) {
    revalidatePath(`/app/${orgSlug}/admin/courses/${courseSlug}`, 'page');
  }

  return result;
}

export async function updateModuleAction(
  moduleId: string,
  input: UpdateModuleInput,
  orgSlug: string,
  courseSlug: string
) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const result = await handleUpdateModule(moduleId, input);

  if (result.data) {
    revalidatePath(`/app/${orgSlug}/admin/courses/${courseSlug}`, 'page');
  }

  return result;
}

export async function deleteModuleAction(
  moduleId: string,
  orgSlug: string,
  courseSlug: string
) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const result = await handleDeleteModule(moduleId);

  if (result.success) {
    revalidatePath(`/app/${orgSlug}/admin/courses/${courseSlug}`, 'page');
  }

  return result;
}

export async function reorderModulesAction(
  modules: { id: string; display_order: number }[],
  orgSlug: string,
  courseSlug: string
) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const result = await handleReorderModules(modules);

  if (result.success) {
    revalidatePath(`/app/${orgSlug}/admin/courses/${courseSlug}`, 'page');
  }

  return result;
}

// ============================================
// LESSON ACTIONS
// ============================================

export async function createLessonAction(
  courseId: string,
  input: CreateLessonInput,
  orgSlug: string,
  courseSlug: string
) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const result = await handleCreateLesson(courseId, input);

  if (result.data) {
    revalidatePath(`/app/${orgSlug}/admin/courses/${courseSlug}`, 'page');
  }

  return result;
}

export async function updateLessonAction(
  lessonId: string,
  courseId: string,
  input: UpdateLessonInput,
  orgSlug: string,
  courseSlug: string
) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const result = await handleUpdateLesson(lessonId, courseId, input);

  if (result.data) {
    revalidatePath(`/app/${orgSlug}/admin/courses/${courseSlug}`, 'page');
    revalidatePath(`/app/${orgSlug}/learn/${courseSlug}`, 'page');
  }

  return result;
}

export async function publishLessonAction(
  lessonId: string,
  orgSlug: string,
  courseSlug: string
) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const result = await handlePublishLesson(lessonId);

  if (result.data) {
    revalidatePath(`/app/${orgSlug}/admin/courses/${courseSlug}`, 'page');
    revalidatePath(`/app/${orgSlug}/learn/${courseSlug}`, 'page');
  }

  return result;
}

export async function unpublishLessonAction(
  lessonId: string,
  orgSlug: string,
  courseSlug: string
) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const result = await handleUnpublishLesson(lessonId);

  if (result.data) {
    revalidatePath(`/app/${orgSlug}/admin/courses/${courseSlug}`, 'page');
    revalidatePath(`/app/${orgSlug}/learn/${courseSlug}`, 'page');
  }

  return result;
}

export async function deleteLessonAction(
  lessonId: string,
  orgSlug: string,
  courseSlug: string
) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const result = await handleDeleteLesson(lessonId);

  if (result.success) {
    revalidatePath(`/app/${orgSlug}/admin/courses/${courseSlug}`, 'page');
  }

  return result;
}

export async function reorderLessonsAction(
  input: ReorderLessonsInput,
  orgSlug: string,
  courseSlug: string
) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const result = await handleReorderLessons(input);

  if (result.success) {
    revalidatePath(`/app/${orgSlug}/admin/courses/${courseSlug}`, 'page');
  }

  return result;
}

// ============================================
// ENROLLMENT ACTIONS
// ============================================

export async function enrollUserAction(
  courseId: string,
  userId: string,
  expiresAt: string | null,
  orgSlug: string,
  courseSlug: string
) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const result = await handleEnrollUser(user.id, {
    course_id: courseId,
    user_id: userId,
    expires_at: expiresAt,
  });

  if (result.data) {
    revalidatePath(`/app/${orgSlug}/admin/courses/${courseSlug}`, 'page');
  }

  return result;
}

export async function selfEnrollAction(courseId: string, orgSlug: string) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const result = await handleSelfEnroll(courseId, user.id);

  if (result.data) {
    revalidatePath(`/app/${orgSlug}/courses`, 'page');
  }

  return result;
}

export async function revokeEnrollmentAction(
  enrollmentId: string,
  orgSlug: string,
  courseSlug: string
) {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const result = await handleRevokeEnrollment(enrollmentId);

  if (result.data) {
    revalidatePath(`/app/${orgSlug}/admin/courses/${courseSlug}`, 'page');
  }

  return result;
}

export async function deleteEnrollmentAction(
  enrollmentId: string,
  orgSlug: string,
  courseSlug: string
) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const result = await handleDeleteEnrollment(enrollmentId);

  if (result.success) {
    revalidatePath(`/app/${orgSlug}/admin/courses/${courseSlug}`, 'page');
  }

  return result;
}

export async function markLessonViewedAction(courseId: string, lessonId: string) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  return handleMarkLessonViewed(user.id, { course_id: courseId, lesson_id: lessonId });
}

// ============================================
// QUERY ACTIONS (for client components)
// ============================================

export async function getCourseEnrollmentsAction(
  courseId: string
): Promise<{ data: EnrollmentWithUser[] | null; error: string | null }> {
  const user = await getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  return getCourseEnrollmentsQuery(courseId);
}
