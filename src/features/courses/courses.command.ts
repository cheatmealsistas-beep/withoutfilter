import { createClientServer } from '@/shared/database/supabase';
import type {
  CreateCourseInput,
  UpdateCourseInput,
  CreateModuleInput,
  UpdateModuleInput,
  CreateLessonInput,
  UpdateLessonInput,
  Course,
  CourseModule,
  Lesson,
  CourseEnrollment,
} from './types';

// ============================================
// COURSE COMMANDS
// ============================================

/**
 * Create a new course
 */
export async function createCourse(
  organizationId: string,
  userId: string,
  input: CreateCourseInput
): Promise<{
  data: Course | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('courses')
    .insert({
      organization_id: organizationId,
      created_by: userId,
      title: input.title,
      slug: input.slug,
      description: input.description ?? null,
      thumbnail_url: input.thumbnail_url ?? null,
      visibility: input.visibility,
      status: 'draft',
    })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Update a course
 */
export async function updateCourse(
  courseId: string,
  input: UpdateCourseInput
): Promise<{
  data: Course | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('courses')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Publish a course
 */
export async function publishCourse(courseId: string): Promise<{
  data: Course | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('courses')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Unpublish a course (set to draft)
 */
export async function unpublishCourse(courseId: string): Promise<{
  data: Course | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('courses')
    .update({
      status: 'draft',
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Archive a course
 */
export async function archiveCourse(courseId: string): Promise<{
  data: Course | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('courses')
    .update({
      status: 'archived',
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { error } = await supabase.from('courses').delete().eq('id', courseId);

  return { success: !error, error: error?.message ?? null };
}

/**
 * Reorder courses
 */
export async function reorderCourses(
  courses: { id: string; display_order: number }[]
): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClientServer();

  // Update each course's display_order
  for (const course of courses) {
    const { error } = await supabase
      .from('courses')
      .update({ display_order: course.display_order })
      .eq('id', course.id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true, error: null };
}

// ============================================
// MODULE COMMANDS
// ============================================

/**
 * Create a new module
 */
export async function createModule(
  courseId: string,
  input: CreateModuleInput
): Promise<{
  data: CourseModule | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('course_modules')
    .insert({
      course_id: courseId,
      title: input.title,
      description: input.description ?? null,
      display_order: input.display_order,
    })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Update a module
 */
export async function updateModule(
  moduleId: string,
  input: UpdateModuleInput
): Promise<{
  data: CourseModule | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('course_modules')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', moduleId)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Delete a module (lessons become standalone)
 */
export async function deleteModule(moduleId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClientServer();

  // ON DELETE SET NULL will make lessons standalone
  const { error } = await supabase.from('course_modules').delete().eq('id', moduleId);

  return { success: !error, error: error?.message ?? null };
}

/**
 * Reorder modules
 */
export async function reorderModules(
  modules: { id: string; display_order: number }[]
): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClientServer();

  for (const module of modules) {
    const { error } = await supabase
      .from('course_modules')
      .update({ display_order: module.display_order })
      .eq('id', module.id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true, error: null };
}

// ============================================
// LESSON COMMANDS
// ============================================

/**
 * Create a new lesson
 */
export async function createLesson(
  courseId: string,
  input: CreateLessonInput
): Promise<{
  data: Lesson | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      course_id: courseId,
      module_id: input.module_id ?? null,
      title: input.title,
      slug: input.slug,
      description: input.description ?? null,
      type: input.type,
      content: input.content,
      duration_minutes: input.duration_minutes ?? null,
      display_order: input.display_order,
      is_free_preview: input.is_free_preview,
      is_published: input.is_published,
    })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Update a lesson
 */
export async function updateLesson(
  lessonId: string,
  input: UpdateLessonInput
): Promise<{
  data: Lesson | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('lessons')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', lessonId)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Publish a lesson
 */
export async function publishLesson(lessonId: string): Promise<{
  data: Lesson | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('lessons')
    .update({
      is_published: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', lessonId)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Unpublish a lesson
 */
export async function unpublishLesson(lessonId: string): Promise<{
  data: Lesson | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('lessons')
    .update({
      is_published: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', lessonId)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Delete a lesson
 */
export async function deleteLesson(lessonId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { error } = await supabase.from('lessons').delete().eq('id', lessonId);

  return { success: !error, error: error?.message ?? null };
}

/**
 * Reorder lessons (can also move between modules)
 */
export async function reorderLessons(
  lessons: { id: string; display_order: number; module_id?: string | null }[]
): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClientServer();

  for (const lesson of lessons) {
    const updateData: { display_order: number; module_id?: string | null } = {
      display_order: lesson.display_order,
    };

    // Only update module_id if explicitly provided
    if (lesson.module_id !== undefined) {
      updateData.module_id = lesson.module_id;
    }

    const { error } = await supabase.from('lessons').update(updateData).eq('id', lesson.id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true, error: null };
}

// ============================================
// ENROLLMENT COMMANDS
// ============================================

/**
 * Enroll a user in a course (manual by owner/admin)
 */
export async function enrollUser(
  courseId: string,
  userId: string,
  enrolledBy: string,
  expiresAt?: string | null
): Promise<{
  data: CourseEnrollment | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('course_enrollments')
    .insert({
      course_id: courseId,
      user_id: userId,
      enrolled_by: enrolledBy,
      source: 'manual',
      status: 'active',
      expires_at: expiresAt ?? null,
    })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Self-enroll in a public course
 */
export async function selfEnroll(
  courseId: string,
  userId: string
): Promise<{
  data: CourseEnrollment | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('course_enrollments')
    .insert({
      course_id: courseId,
      user_id: userId,
      source: 'self_enrolled',
      status: 'active',
    })
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Update an enrollment
 */
export async function updateEnrollment(
  enrollmentId: string,
  input: { status?: string; expires_at?: string | null }
): Promise<{
  data: CourseEnrollment | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('course_enrollments')
    .update(input)
    .eq('id', enrollmentId)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Revoke an enrollment
 */
export async function revokeEnrollment(enrollmentId: string): Promise<{
  data: CourseEnrollment | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('course_enrollments')
    .update({ status: 'revoked' })
    .eq('id', enrollmentId)
    .select()
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Delete an enrollment
 */
export async function deleteEnrollment(enrollmentId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { error } = await supabase.from('course_enrollments').delete().eq('id', enrollmentId);

  return { success: !error, error: error?.message ?? null };
}

/**
 * Mark a lesson as viewed by user
 */
export async function markLessonViewed(
  courseId: string,
  userId: string,
  lessonId: string
): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClientServer();

  // Get current enrollment
  const { data: enrollment, error: fetchError } = await supabase
    .from('course_enrollments')
    .select('id, viewed_lessons')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  // Add lesson to viewed_lessons if not already there
  const viewedLessons = enrollment.viewed_lessons || [];
  if (!viewedLessons.includes(lessonId)) {
    viewedLessons.push(lessonId);
  }

  const { error: updateError } = await supabase
    .from('course_enrollments')
    .update({
      viewed_lessons: viewedLessons,
      last_viewed_lesson_id: lessonId,
      last_viewed_at: new Date().toISOString(),
    })
    .eq('id', enrollment.id);

  return { success: !updateError, error: updateError?.message ?? null };
}

/**
 * Mark course as completed
 */
export async function markCourseCompleted(
  courseId: string,
  userId: string
): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { error } = await supabase
    .from('course_enrollments')
    .update({
      completed_at: new Date().toISOString(),
    })
    .eq('course_id', courseId)
    .eq('user_id', userId);

  return { success: !error, error: error?.message ?? null };
}
