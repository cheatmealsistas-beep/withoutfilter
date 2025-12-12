import { z } from 'zod';

// Professional types enum
export const professionalTypes = [
  'coach',
  'therapist',
  'trainer',
  'content_creator',
  'mentor',
  'other',
] as const;

export type ProfessionalType = (typeof professionalTypes)[number];

// Module types enum
export const moduleTypes = [
  'home',
  'about',
  'services',
  'testimonials',
  'blog',
  'contact',
  'courses',
  'resources',
] as const;

export type ModuleType = (typeof moduleTypes)[number];

// Step 0: Welcome - User's name
export const step0Schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

export type Step0Input = z.infer<typeof step0Schema>;

// Step 1: Professional type
export const step1Schema = z.object({
  professionalType: z.enum(professionalTypes),
});

export type Step1Input = z.infer<typeof step1Schema>;

// Step 2: App setup - name and slug
export const step2Schema = z.object({
  appName: z.string().min(2, 'App name must be at least 2 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(30, 'Slug must be at most 30 characters')
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/,
      'Slug can only contain lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.'
    ),
});

export type Step2Input = z.infer<typeof step2Schema>;

// Step 3: Logo (optional)
export const step3Schema = z.object({
  logoUrl: z.string().url().optional().or(z.literal('')),
});

export type Step3Input = z.infer<typeof step3Schema>;

// Step 4: Home content (preview editor)
export const homeContentSchema = z.object({
  headline: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  ctaText: z.string().max(30).optional(),
  heroImage: z.string().url().optional().or(z.literal('')),
});

export type HomeContent = z.infer<typeof homeContentSchema>;

export const step4Schema = z.object({
  content: homeContentSchema,
});

export type Step4Input = z.infer<typeof step4Schema>;

// Complete onboarding data
export const onboardingDataSchema = z.object({
  fullName: z.string().min(2),
  professionalType: z.enum(professionalTypes),
  appName: z.string().min(2),
  slug: z.string().min(3).max(30),
  logoUrl: z.string().url().optional().or(z.literal('')),
  homeContent: homeContentSchema.optional(),
});

export type OnboardingData = z.infer<typeof onboardingDataSchema>;

// Onboarding state (from DB)
export interface OnboardingState {
  currentStep: number;
  isCompleted: boolean;
  isSkipped: boolean;
  data: Partial<OnboardingData>;
}

// Default home content based on professional type
export const defaultHomeContent: Record<ProfessionalType, HomeContent> = {
  coach: {
    headline: 'Transforma tu vida con coaching personalizado',
    description:
      'Te acompaño en tu proceso de cambio para alcanzar tus metas personales y profesionales.',
    ctaText: 'Reservar sesión',
  },
  therapist: {
    headline: 'Tu bienestar emocional es mi prioridad',
    description:
      'Un espacio seguro para trabajar tu salud mental y encontrar equilibrio.',
    ctaText: 'Pedir cita',
  },
  trainer: {
    headline: 'Aprende con metodología práctica y efectiva',
    description:
      'Formación diseñada para que apliques lo aprendido desde el primer día.',
    ctaText: 'Ver cursos',
  },
  content_creator: {
    headline: 'Contenido que inspira y transforma',
    description:
      'Recursos exclusivos para tu crecimiento personal y profesional.',
    ctaText: 'Explorar contenido',
  },
  mentor: {
    headline: 'Guía experta para alcanzar tus metas',
    description:
      'Mentoring personalizado basado en experiencia real y resultados probados.',
    ctaText: 'Empezar ahora',
  },
  other: {
    headline: 'Bienvenido a mi espacio',
    description: 'Descubre todo lo que tengo preparado para ti.',
    ctaText: 'Comenzar',
  },
};
