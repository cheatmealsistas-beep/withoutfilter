import { z } from 'zod';

// Public app data schema
export const publicAppSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  tagline: z.string().nullable(),
  primaryColor: z.string(),
  ownerName: z.string().nullable(),
  ownerAvatar: z.string().nullable(),
  professionalType: z.string().nullable(),
});

export type PublicApp = z.infer<typeof publicAppSchema>;

// Module types
export const moduleTypeSchema = z.enum([
  'home',
  'about',
  'services',
  'testimonials',
  'blog',
  'contact',
  'courses',
  'resources',
  'custom',
]);

export type ModuleType = z.infer<typeof moduleTypeSchema>;

// Enabled module for navigation (type is string to allow flexibility from DB)
export interface EnabledModule {
  id: string;
  type: string;
  isEnabled: boolean;
  isPublic: boolean;
  displayOrder: number;
  customLabel: string | null;
  showInNavbar: boolean;
  showInFooter: boolean;
  customSlug: string | null;
}

// Home module content schema (matches onboarding)
export const homeContentSchema = z.object({
  headline: z.string(),
  description: z.string(),
  ctaText: z.string(),
  ctaUrl: z.string().optional(),
});

export type HomeContent = z.infer<typeof homeContentSchema>;

// Full public page data
export interface PublicPageData {
  app: PublicApp;
  homeContent: HomeContent | null;
  isOwner: boolean;
}
