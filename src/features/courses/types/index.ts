import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const courseStatusEnum = z.enum(['draft', 'published', 'archived']);
export const courseVisibilityEnum = z.enum(['public', 'private']);
export const lessonTypeEnum = z.enum(['video', 'text', 'pdf', 'audio', 'quiz', 'assignment']);
export const enrollmentStatusEnum = z.enum(['active', 'expired', 'revoked']);
export const enrollmentSourceEnum = z.enum(['manual', 'self_enrolled']);

export type CourseStatus = z.infer<typeof courseStatusEnum>;
export type CourseVisibility = z.infer<typeof courseVisibilityEnum>;
export type LessonType = z.infer<typeof lessonTypeEnum>;
export type EnrollmentStatus = z.infer<typeof enrollmentStatusEnum>;
export type EnrollmentSource = z.infer<typeof enrollmentSourceEnum>;

// ============================================
// COURSE SCHEMAS
// ============================================

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().max(2000).optional(),
  thumbnail_url: z.string().url().optional().nullable(),
  visibility: courseVisibilityEnum.default('private'),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  status: courseStatusEnum.optional(),
  is_featured: z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
});

export const publishCourseSchema = z.object({
  courseId: z.string().uuid(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

// ============================================
// COURSE MODULE SCHEMAS
// ============================================

export const createModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  display_order: z.number().int().min(0).default(0),
});

export const updateModuleSchema = createModuleSchema.partial();

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;

// ============================================
// LESSON CONTENT SCHEMAS (by type)
// ============================================

export const videoContentSchema = z.object({
  embed_url: z.string().url(),
  provider: z.enum(['youtube', 'vimeo', 'wistia', 'other']).optional(),
});

export const textContentSchema = z.object({
  html: z.string(),
});

export const pdfContentSchema = z.object({
  file_url: z.string().url(),
  file_name: z.string(),
  file_size: z.number().optional(),
});

export const audioContentSchema = z.object({
  file_url: z.string().url().optional(),
  embed_url: z.string().url().optional(),
  duration_seconds: z.number().optional(),
});

export const quizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2).max(6),
  correct_index: z.number().int().min(0),
});

export const quizContentSchema = z.object({
  questions: z.array(quizQuestionSchema),
  passing_score: z.number().min(0).max(100).default(70),
});

export const assignmentContentSchema = z.object({
  instructions_html: z.string(),
  submission_type: z.enum(['text', 'file', 'link']).default('text'),
});

export type VideoContent = z.infer<typeof videoContentSchema>;
export type TextContent = z.infer<typeof textContentSchema>;
export type PdfContent = z.infer<typeof pdfContentSchema>;
export type AudioContent = z.infer<typeof audioContentSchema>;
export type QuizContent = z.infer<typeof quizContentSchema>;
export type AssignmentContent = z.infer<typeof assignmentContentSchema>;

export type LessonContent =
  | VideoContent
  | TextContent
  | PdfContent
  | AudioContent
  | QuizContent
  | AssignmentContent;

// ============================================
// LESSON SCHEMAS
// ============================================

export const createLessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().max(1000).optional(),
  type: lessonTypeEnum.default('video'),
  content: z.record(z.string(), z.unknown()).default({}),
  module_id: z.string().uuid().optional().nullable(),
  duration_minutes: z.number().int().min(0).optional(),
  display_order: z.number().int().min(0).default(0),
  is_free_preview: z.boolean().default(false),
  is_published: z.boolean().default(false),
});

export const updateLessonSchema = createLessonSchema.partial();

export const reorderLessonsSchema = z.object({
  lessons: z.array(
    z.object({
      id: z.string().uuid(),
      display_order: z.number().int().min(0),
      module_id: z.string().uuid().optional().nullable(),
    })
  ),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type ReorderLessonsInput = z.infer<typeof reorderLessonsSchema>;

// ============================================
// ENROLLMENT SCHEMAS
// ============================================

export const enrollUserSchema = z.object({
  user_id: z.string().uuid(),
  course_id: z.string().uuid(),
  expires_at: z.string().datetime().optional().nullable(),
});

export const enrollUsersByEmailSchema = z.object({
  emails: z.array(z.string().email()),
  course_id: z.string().uuid(),
  expires_at: z.string().datetime().optional().nullable(),
});

export const updateEnrollmentSchema = z.object({
  status: enrollmentStatusEnum.optional(),
  expires_at: z.string().datetime().optional().nullable(),
});

export const markLessonViewedSchema = z.object({
  course_id: z.string().uuid(),
  lesson_id: z.string().uuid(),
});

export type EnrollUserInput = z.infer<typeof enrollUserSchema>;
export type EnrollUsersByEmailInput = z.infer<typeof enrollUsersByEmailSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
export type MarkLessonViewedInput = z.infer<typeof markLessonViewedSchema>;

// ============================================
// DATABASE TYPES (from Supabase)
// ============================================

export interface Course {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  status: CourseStatus;
  visibility: CourseVisibility;
  is_featured: boolean;
  display_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  module_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  type: LessonType;
  content: LessonContent;
  duration_minutes: number | null;
  display_order: number;
  is_free_preview: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  status: EnrollmentStatus;
  source: EnrollmentSource;
  enrolled_by: string | null;
  enrolled_at: string;
  expires_at: string | null;
  viewed_lessons: string[];
  last_viewed_lesson_id: string | null;
  last_viewed_at: string | null;
  completed_at: string | null;
}

// ============================================
// EXTENDED TYPES (with relations)
// ============================================

export interface CourseWithModules extends Course {
  modules: CourseModule[];
  lessons: Lesson[];
}

export interface CourseWithStats extends Course {
  lesson_count: number;
  module_count: number;
  enrollment_count: number;
  published_lesson_count: number;
}

export interface EnrollmentWithUser extends CourseEnrollment {
  user: {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface EnrollmentWithCourse extends CourseEnrollment {
  course: Course;
}

export interface LessonWithModule extends Lesson {
  module: CourseModule | null;
}
