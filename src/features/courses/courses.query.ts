import { createClient } from '@supabase/supabase-js';
import { createClientServer } from '@/shared/database/supabase';
import type {
  Course,
  CourseWithModules,
  CourseWithStats,
  CourseModule,
  Lesson,
  CourseEnrollment,
  EnrollmentWithUser,
  EnrollmentWithCourse,
} from './types';

// Admin client for public queries (bypasses RLS)
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// ============================================
// COURSE QUERIES
// ============================================

/**
 * Get all courses for an organization (admin view)
 */
export async function getOrganizationCourses(organizationId: string): Promise<{
  data: CourseWithStats[] | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('courses')
    .select(
      `
      *,
      lessons:lessons(count),
      modules:course_modules(count),
      enrollments:course_enrollments(count)
    `
    )
    .eq('organization_id', organizationId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  // Transform count aggregations
  const coursesWithStats = data?.map((course) => ({
    ...course,
    lesson_count: course.lessons?.[0]?.count ?? 0,
    module_count: course.modules?.[0]?.count ?? 0,
    enrollment_count: course.enrollments?.[0]?.count ?? 0,
    published_lesson_count: 0, // TODO: Add filtered count
  })) as CourseWithStats[];

  return { data: coursesWithStats, error: null };
}

/**
 * Get published courses for an organization (public catalog)
 */
export async function getPublishedCourses(organizationId: string): Promise<{
  data: Course[] | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true });

  return { data, error: error?.message ?? null };
}

/**
 * Get ALL published courses for an organization (public + private)
 * Used by owners to see all their published content
 */
export async function getAllPublishedCourses(organizationId: string): Promise<{
  data: Course[] | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true });

  return { data, error: error?.message ?? null };
}

/**
 * Get ALL courses for an organization (including drafts)
 * Used by owners to preview their content page
 */
export async function getOwnerCourses(organizationId: string): Promise<{
  data: Course[] | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('organization_id', organizationId)
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true });

  return { data, error: error?.message ?? null };
}

/**
 * Get courses accessible to a user (enrolled + public)
 */
export async function getUserAccessibleCourses(
  organizationId: string,
  userId: string
): Promise<{
  data: (Course & { is_enrolled: boolean })[] | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  // Get user's enrollments for this org's courses
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select('course_id')
    .eq('user_id', userId)
    .eq('status', 'active');

  const enrolledCourseIds = new Set(enrollments?.map((e) => e.course_id) ?? []);

  // Get all accessible courses (public + enrolled private)
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'published')
    .order('display_order', { ascending: true });

  if (error) {
    return { data: null, error: error.message };
  }

  // Filter: public OR enrolled
  const accessibleCourses = courses
    ?.filter((course) => course.visibility === 'public' || enrolledCourseIds.has(course.id))
    .map((course) => ({
      ...course,
      is_enrolled: enrolledCourseIds.has(course.id),
    }));

  return { data: accessibleCourses ?? null, error: null };
}

/**
 * Get a single course by slug (uses admin client for public pages)
 */
export async function getCourseBySlug(
  organizationId: string,
  slug: string
): Promise<{
  data: Course | null;
  error: string | null;
}> {
  // Use admin client to bypass RLS for public page access
  const supabase = createAdminClient();

  console.log('[getCourseBySlug] Query params:', { organizationId, slug });

  // Debug: list all courses for this org to see what slugs exist
  const { data: allCourses } = await supabase
    .from('courses')
    .select('id, slug, title, status, organization_id')
    .eq('organization_id', organizationId);

  console.log('[getCourseBySlug] All courses for org:', allCourses?.map(c => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    status: c.status,
  })));

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('slug', slug)
    .single();

  console.log('[getCourseBySlug] Query result:', {
    found: !!data,
    error: error?.message,
    errorCode: error?.code,
  });

  return { data, error: error?.message ?? null };
}

/**
 * Get a single course by ID
 */
export async function getCourseById(courseId: string): Promise<{
  data: Course | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single();

  return { data, error: error?.message ?? null };
}

/**
 * Get course with all modules and lessons (uses admin client for public pages)
 */
export async function getCourseWithContent(courseId: string): Promise<{
  data: CourseWithModules | null;
  error: string | null;
}> {
  // Use admin client to bypass RLS for public page access
  const supabase = createAdminClient();

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (courseError) {
    return { data: null, error: courseError.message };
  }

  const { data: modules, error: modulesError } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', courseId)
    .order('display_order', { ascending: true });

  if (modulesError) {
    return { data: null, error: modulesError.message };
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('display_order', { ascending: true });

  if (lessonsError) {
    return { data: null, error: lessonsError.message };
  }

  return {
    data: {
      ...course,
      modules: modules ?? [],
      lessons: lessons ?? [],
    },
    error: null,
  };
}

// ============================================
// MODULE QUERIES
// ============================================

/**
 * Get all modules for a course
 */
export async function getCourseModules(courseId: string): Promise<{
  data: CourseModule[] | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', courseId)
    .order('display_order', { ascending: true });

  return { data, error: error?.message ?? null };
}

/**
 * Get a single module by ID
 */
export async function getModuleById(moduleId: string): Promise<{
  data: CourseModule | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('course_modules')
    .select('*')
    .eq('id', moduleId)
    .single();

  return { data, error: error?.message ?? null };
}

// ============================================
// LESSON QUERIES
// ============================================

/**
 * Get all lessons for a course
 */
export async function getCourseLessons(courseId: string): Promise<{
  data: Lesson[] | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('module_id', { ascending: true, nullsFirst: true })
    .order('display_order', { ascending: true });

  return { data, error: error?.message ?? null };
}

/**
 * Get lessons for a specific module
 */
export async function getModuleLessons(moduleId: string): Promise<{
  data: Lesson[] | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('display_order', { ascending: true });

  return { data, error: error?.message ?? null };
}

/**
 * Get standalone lessons (not in any module)
 */
export async function getStandaloneLessons(courseId: string): Promise<{
  data: Lesson[] | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .is('module_id', null)
    .order('display_order', { ascending: true });

  return { data, error: error?.message ?? null };
}

/**
 * Get a single lesson by slug
 */
export async function getLessonBySlug(
  courseId: string,
  slug: string
): Promise<{
  data: Lesson | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .eq('slug', slug)
    .single();

  return { data, error: error?.message ?? null };
}

/**
 * Get a single lesson by ID
 */
export async function getLessonById(lessonId: string): Promise<{
  data: Lesson | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase.from('lessons').select('*').eq('id', lessonId).single();

  return { data, error: error?.message ?? null };
}

// ============================================
// ENROLLMENT QUERIES
// ============================================

/**
 * Get all enrollments for a course (admin view)
 */
export async function getCourseEnrollments(courseId: string): Promise<{
  data: EnrollmentWithUser[] | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('course_enrollments')
    .select(
      `
      *,
      user:profiles!course_enrollments_user_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `
    )
    .eq('course_id', courseId)
    .order('enrolled_at', { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  // Get emails from auth.users (need service role or separate query)
  // For now, return without email - will add in handler if needed
  const enrollmentsWithUser = data?.map((enrollment) => ({
    ...enrollment,
    user: {
      id: enrollment.user?.id ?? enrollment.user_id,
      email: '', // TODO: Get from auth.users
      full_name: enrollment.user?.full_name ?? null,
      avatar_url: enrollment.user?.avatar_url ?? null,
    },
  })) as EnrollmentWithUser[];

  return { data: enrollmentsWithUser, error: null };
}

/**
 * Get user's enrollment for a specific course
 */
export async function getUserEnrollment(
  courseId: string,
  userId: string
): Promise<{
  data: CourseEnrollment | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .single();

  // Not found is not an error in this context
  if (error?.code === 'PGRST116') {
    return { data: null, error: null };
  }

  return { data, error: error?.message ?? null };
}

/**
 * Get all courses a user is enrolled in
 */
export async function getUserEnrollments(userId: string): Promise<{
  data: EnrollmentWithCourse[] | null;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('course_enrollments')
    .select(
      `
      *,
      course:courses(*)
    `
    )
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('enrolled_at', { ascending: false });

  return { data: data as EnrollmentWithCourse[] | null, error: error?.message ?? null };
}

/**
 * Check if a user has active enrollment
 */
export async function hasActiveEnrollment(
  courseId: string,
  userId: string
): Promise<{
  data: boolean;
  error: string | null;
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('course_enrollments')
    .select('id, expires_at')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error?.code === 'PGRST116') {
    return { data: false, error: null };
  }

  if (error) {
    return { data: false, error: error.message };
  }

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { data: false, error: null };
  }

  return { data: true, error: null };
}

/**
 * Check if slug is available for a course in an organization
 */
export async function isCourseSlugAvailable(
  organizationId: string,
  slug: string,
  excludeCourseId?: string
): Promise<{
  data: boolean;
  error: string | null;
}> {
  const supabase = await createClientServer();

  let query = supabase
    .from('courses')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('slug', slug);

  if (excludeCourseId) {
    query = query.neq('id', excludeCourseId);
  }

  const { data, error } = await query;

  if (error) {
    return { data: false, error: error.message };
  }

  return { data: (data?.length ?? 0) === 0, error: null };
}

/**
 * Check if slug is available for a lesson in a course
 */
export async function isLessonSlugAvailable(
  courseId: string,
  slug: string,
  excludeLessonId?: string
): Promise<{
  data: boolean;
  error: string | null;
}> {
  const supabase = await createClientServer();

  let query = supabase.from('lessons').select('id').eq('course_id', courseId).eq('slug', slug);

  if (excludeLessonId) {
    query = query.neq('id', excludeLessonId);
  }

  const { data, error } = await query;

  if (error) {
    return { data: false, error: error.message };
  }

  return { data: (data?.length ?? 0) === 0, error: null };
}
