// Re-export shared page block types
export * from '@/shared/types/page-blocks';

import { z } from 'zod';
import { pageBlockSchema, pageSettingsSchema } from '@/shared/types/page-blocks';

// =============================================================================
// Page Builder Content (stored in app_modules.content)
// =============================================================================

export const pageBuilderContentSchema = z.object({
  version: z.literal(2),
  settings: pageSettingsSchema,
  draft: z.object({
    blocks: z.array(pageBlockSchema),
    lastModified: z.string(),
  }),
  published: z
    .object({
      blocks: z.array(pageBlockSchema),
      publishedAt: z.string(),
    })
    .nullable(),
});

export type PageBuilderContent = z.infer<typeof pageBuilderContentSchema>;

// =============================================================================
// Legacy Content (for migration)
// =============================================================================

export interface LegacyHomeContent {
  headline?: string;
  description?: string;
  ctaText?: string;
  ctaUrl?: string;
  heroImage?: string;
}

// =============================================================================
// Action Results
// =============================================================================

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface ActionResultWithData<T> extends ActionResult {
  data?: T;
}
