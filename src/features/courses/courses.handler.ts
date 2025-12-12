import {
  createCourseSchema,
  updateCourseSchema,
  createModuleSchema,
  updateModuleSchema,
  createLessonSchema,
  updateLessonSchema,
  reorderLessonsSchema,
  enrollUserSchema,
  markLessonViewedSchema,
  type CreateCourseInput,
  type UpdateCourseInput,
  type CreateModuleInput,
  type UpdateModuleInput,
  type CreateLessonInput,
  type UpdateLessonInput,
  type ReorderLessonsInput,
  type EnrollUserInput,
  type MarkLessonViewedInput,
} from './types';
import {
  createCourse,
  updateCourse,
  publishCourse,
  unpublishCourse,
  archiveCourse,
  deleteCourse,
  reorderCourses,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  createLesson,
  updateLesson,
  publishLesson,
  unpublishLesson,
  deleteLesson,
  reorderLessons,
  enrollUser,
  selfEnroll,
  revokeEnrollment,
  deleteEnrollment,
  markLessonViewed,
} from './courses.command';
import {
  getCourseById,
  getCourseBySlug,
  getModuleById,
  getLessonById,
  getUserEnrollment,
  hasActiveEnrollment,
  isCourseSlugAvailable,
  isLessonSlugAvailable,
} from './courses.query';

// ============================================
// COURSE HANDLERS
// ============================================

export async function handleCreateCourse(
  organizationId: string,
  userId: string,
  input: CreateCourseInput
) {
  // Validate input
  const validation = createCourseSchema.safeParse(input);
  if (!validation.success) {
    return { data: null, error: validation.error.issues[0].message };
  }

  // Check slug availability
  const { data: isAvailable } = await isCourseSlugAvailable(organizationId, input.slug);
  if (!isAvailable) {
    return { data: null, error: 'This URL slug is already in use' };
  }

  return createCourse(organizationId, userId, validation.data);
}

export async function handleUpdateCourse(
  courseId: string,
  organizationId: string,
  input: UpdateCourseInput
) {
  // Validate input
  const validation = updateCourseSchema.safeParse(input);
  if (!validation.success) {
    return { data: null, error: validation.error.issues[0].message };
  }

  // If slug is being changed, check availability
  if (input.slug) {
    const { data: isAvailable } = await isCourseSlugAvailable(
      organizationId,
      input.slug,
      courseId
    );
    if (!isAvailable) {
      return { data: null, error: 'This URL slug is already in use' };
    }
  }

  return updateCourse(courseId, validation.data);
}

export async function handlePublishCourse(courseId: string) {
  // Check course exists
  const { data: course, error } = await getCourseById(courseId);
  if (error || !course) {
    return { data: null, error: error ?? 'Course not found' };
  }

  // Optionally: check if course has at least one published lesson
  // For now, allow publishing empty courses

  return publishCourse(courseId);
}

export async function handleUnpublishCourse(courseId: string) {
  const { data: course, error } = await getCourseById(courseId);
  if (error || !course) {
    return { data: null, error: error ?? 'Course not found' };
  }

  return unpublishCourse(courseId);
}

export async function handleArchiveCourse(courseId: string) {
  const { data: course, error } = await getCourseById(courseId);
  if (error || !course) {
    return { data: null, error: error ?? 'Course not found' };
  }

  return archiveCourse(courseId);
}

export async function handleDeleteCourse(courseId: string) {
  const { data: course, error } = await getCourseById(courseId);
  if (error || !course) {
    return { success: false, error: error ?? 'Course not found' };
  }

  // Only allow deleting draft or archived courses
  if (course.status === 'published') {
    return { success: false, error: 'Cannot delete a published course. Archive it first.' };
  }

  return deleteCourse(courseId);
}

export async function handleReorderCourses(
  courses: { id: string; display_order: number }[]
) {
  if (courses.length === 0) {
    return { success: true, error: null };
  }

  return reorderCourses(courses);
}

// ============================================
// MODULE HANDLERS
// ============================================

export async function handleCreateModule(courseId: string, input: CreateModuleInput) {
  const validation = createModuleSchema.safeParse(input);
  if (!validation.success) {
    return { data: null, error: validation.error.issues[0].message };
  }

  // Verify course exists
  const { data: course, error } = await getCourseById(courseId);
  if (error || !course) {
    return { data: null, error: error ?? 'Course not found' };
  }

  return createModule(courseId, validation.data);
}

export async function handleUpdateModule(moduleId: string, input: UpdateModuleInput) {
  const validation = updateModuleSchema.safeParse(input);
  if (!validation.success) {
    return { data: null, error: validation.error.issues[0].message };
  }

  // Verify module exists
  const { data: module, error } = await getModuleById(moduleId);
  if (error || !module) {
    return { data: null, error: error ?? 'Module not found' };
  }

  return updateModule(moduleId, validation.data);
}

export async function handleDeleteModule(moduleId: string) {
  const { data: module, error } = await getModuleById(moduleId);
  if (error || !module) {
    return { success: false, error: error ?? 'Module not found' };
  }

  return deleteModule(moduleId);
}

export async function handleReorderModules(
  modules: { id: string; display_order: number }[]
) {
  if (modules.length === 0) {
    return { success: true, error: null };
  }

  return reorderModules(modules);
}

// ============================================
// LESSON HANDLERS
// ============================================

export async function handleCreateLesson(courseId: string, input: CreateLessonInput) {
  const validation = createLessonSchema.safeParse(input);
  if (!validation.success) {
    return { data: null, error: validation.error.issues[0].message };
  }

  // Verify course exists
  const { data: course, error: courseError } = await getCourseById(courseId);
  if (courseError || !course) {
    return { data: null, error: courseError ?? 'Course not found' };
  }

  // Check slug availability
  const { data: isAvailable } = await isLessonSlugAvailable(courseId, input.slug);
  if (!isAvailable) {
    return { data: null, error: 'This lesson URL is already in use in this course' };
  }

  // If module_id provided, verify it exists and belongs to this course
  if (input.module_id) {
    const { data: module, error: moduleError } = await getModuleById(input.module_id);
    if (moduleError || !module) {
      return { data: null, error: 'Module not found' };
    }
    if (module.course_id !== courseId) {
      return { data: null, error: 'Module does not belong to this course' };
    }
  }

  return createLesson(courseId, validation.data);
}

export async function handleUpdateLesson(
  lessonId: string,
  courseId: string,
  input: UpdateLessonInput
) {
  const validation = updateLessonSchema.safeParse(input);
  if (!validation.success) {
    return { data: null, error: validation.error.issues[0].message };
  }

  // Verify lesson exists
  const { data: lesson, error } = await getLessonById(lessonId);
  if (error || !lesson) {
    return { data: null, error: error ?? 'Lesson not found' };
  }

  // If slug is being changed, check availability
  if (input.slug && input.slug !== lesson.slug) {
    const { data: isAvailable } = await isLessonSlugAvailable(courseId, input.slug, lessonId);
    if (!isAvailable) {
      return { data: null, error: 'This lesson URL is already in use in this course' };
    }
  }

  // If moving to a different module, verify it belongs to the same course
  if (input.module_id && input.module_id !== lesson.module_id) {
    const { data: module, error: moduleError } = await getModuleById(input.module_id);
    if (moduleError || !module) {
      return { data: null, error: 'Module not found' };
    }
    if (module.course_id !== lesson.course_id) {
      return { data: null, error: 'Module does not belong to this course' };
    }
  }

  return updateLesson(lessonId, validation.data);
}

export async function handlePublishLesson(lessonId: string) {
  const { data: lesson, error } = await getLessonById(lessonId);
  if (error || !lesson) {
    return { data: null, error: error ?? 'Lesson not found' };
  }

  return publishLesson(lessonId);
}

export async function handleUnpublishLesson(lessonId: string) {
  const { data: lesson, error } = await getLessonById(lessonId);
  if (error || !lesson) {
    return { data: null, error: error ?? 'Lesson not found' };
  }

  return unpublishLesson(lessonId);
}

export async function handleDeleteLesson(lessonId: string) {
  const { data: lesson, error } = await getLessonById(lessonId);
  if (error || !lesson) {
    return { success: false, error: error ?? 'Lesson not found' };
  }

  return deleteLesson(lessonId);
}

export async function handleReorderLessons(input: ReorderLessonsInput) {
  const validation = reorderLessonsSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  if (input.lessons.length === 0) {
    return { success: true, error: null };
  }

  return reorderLessons(input.lessons);
}

// ============================================
// ENROLLMENT HANDLERS
// ============================================

export async function handleEnrollUser(enrolledByUserId: string, input: EnrollUserInput) {
  const validation = enrollUserSchema.safeParse(input);
  if (!validation.success) {
    return { data: null, error: validation.error.issues[0].message };
  }

  // Check if already enrolled
  const { data: existingEnrollment } = await getUserEnrollment(input.course_id, input.user_id);
  if (existingEnrollment) {
    if (existingEnrollment.status === 'active') {
      return { data: null, error: 'User is already enrolled in this course' };
    }
    // Could reactivate a revoked/expired enrollment here
    // For now, return error
    return { data: null, error: 'User has a previous enrollment. Remove it first to re-enroll.' };
  }

  return enrollUser(input.course_id, input.user_id, enrolledByUserId, input.expires_at);
}

export async function handleSelfEnroll(courseId: string, userId: string) {
  // Check course is public
  const { data: course, error: courseError } = await getCourseById(courseId);
  if (courseError || !course) {
    return { data: null, error: courseError ?? 'Course not found' };
  }

  if (course.status !== 'published') {
    return { data: null, error: 'Course is not available' };
  }

  if (course.visibility !== 'public') {
    return { data: null, error: 'This course requires an invitation to enroll' };
  }

  // Check if already enrolled
  const { data: existingEnrollment } = await getUserEnrollment(courseId, userId);
  if (existingEnrollment?.status === 'active') {
    return { data: null, error: 'You are already enrolled in this course' };
  }

  return selfEnroll(courseId, userId);
}

export async function handleRevokeEnrollment(enrollmentId: string) {
  return revokeEnrollment(enrollmentId);
}

export async function handleDeleteEnrollment(enrollmentId: string) {
  return deleteEnrollment(enrollmentId);
}

export async function handleMarkLessonViewed(userId: string, input: MarkLessonViewedInput) {
  const validation = markLessonViewedSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  // Verify user has access to the course
  const { data: hasAccess } = await hasActiveEnrollment(input.course_id, userId);
  if (!hasAccess) {
    // Check if it's a public course
    const { data: course } = await getCourseById(input.course_id);
    if (!course || course.visibility !== 'public') {
      return { success: false, error: 'You do not have access to this course' };
    }
  }

  return markLessonViewed(input.course_id, userId, input.lesson_id);
}

// ============================================
// ACCESS CHECK HANDLERS
// ============================================

export async function handleCheckCourseAccess(
  courseSlug: string,
  organizationId: string,
  userId?: string
): Promise<{
  hasAccess: boolean;
  course: Awaited<ReturnType<typeof getCourseBySlug>>['data'];
  error: string | null;
}> {
  const { data: course, error } = await getCourseBySlug(organizationId, courseSlug);

  if (error || !course) {
    return { hasAccess: false, course: null, error: error ?? 'Course not found' };
  }

  // Not published = no access (unless org member, handled by RLS)
  if (course.status !== 'published') {
    return { hasAccess: false, course: null, error: 'Course not found' };
  }

  // Public course = everyone has access
  if (course.visibility === 'public') {
    return { hasAccess: true, course, error: null };
  }

  // Private course = need to check enrollment
  if (!userId) {
    return { hasAccess: false, course: null, error: 'Course not found' };
  }

  const { data: hasActiveAccess } = await hasActiveEnrollment(course.id, userId);
  if (!hasActiveAccess) {
    return { hasAccess: false, course: null, error: 'Course not found' };
  }

  return { hasAccess: true, course, error: null };
}
