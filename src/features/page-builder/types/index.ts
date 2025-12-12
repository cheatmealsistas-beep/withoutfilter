import { z } from 'zod';

// =============================================================================
// Block Types
// =============================================================================

export const blockTypes = ['hero', 'services', 'testimonials', 'pricing', 'faqs', 'cta'] as const;
export type BlockType = (typeof blockTypes)[number];

// Block type labels for UI
export const blockTypeLabels: Record<BlockType, string> = {
  hero: 'Hero',
  services: 'Servicios',
  testimonials: 'Testimonios',
  pricing: 'Precios',
  faqs: 'FAQs',
  cta: 'CTA',
};

// Block type icons (Lucide icon names)
export const blockTypeIcons: Record<BlockType, string> = {
  hero: 'Sparkles',
  services: 'Briefcase',
  testimonials: 'MessageSquareQuote',
  pricing: 'CreditCard',
  faqs: 'HelpCircle',
  cta: 'Megaphone',
};

// =============================================================================
// Hero Block
// =============================================================================

export const heroContentSchema = z.object({
  headline: z.string().max(100),
  description: z.string().max(300).optional(),
  ctaText: z.string().max(30).optional(),
  ctaUrl: z.string().optional(),
});

export const heroBlockSchema = z.object({
  id: z.string(),
  type: z.literal('hero'),
  order: z.number().int().min(0),
  isVisible: z.boolean().default(true),
  content: heroContentSchema,
});

export type HeroContent = z.infer<typeof heroContentSchema>;
export type HeroBlock = z.infer<typeof heroBlockSchema>;

// =============================================================================
// Services Block
// =============================================================================

export const serviceItemSchema = z.object({
  id: z.string(),
  icon: z.string().default('Star'),
  title: z.string().max(50),
  description: z.string().max(200),
});

export const servicesContentSchema = z.object({
  headline: z.string().max(100).optional(),
  subheadline: z.string().max(200).optional(),
  services: z.array(serviceItemSchema).min(1).max(8),
});

export const servicesBlockSchema = z.object({
  id: z.string(),
  type: z.literal('services'),
  order: z.number().int().min(0),
  isVisible: z.boolean().default(true),
  content: servicesContentSchema,
});

export type ServiceItem = z.infer<typeof serviceItemSchema>;
export type ServicesContent = z.infer<typeof servicesContentSchema>;
export type ServicesBlock = z.infer<typeof servicesBlockSchema>;

// =============================================================================
// Testimonials Block
// =============================================================================

export const testimonialItemSchema = z.object({
  id: z.string(),
  quote: z.string().max(500),
  authorName: z.string().max(50),
  authorRole: z.string().max(50).optional(),
  authorAvatar: z.string().url().optional().or(z.literal('')),
  rating: z.number().min(1).max(5).optional(),
});

export const testimonialsContentSchema = z.object({
  headline: z.string().max(100).optional(),
  testimonials: z.array(testimonialItemSchema).min(1).max(6),
});

export const testimonialsBlockSchema = z.object({
  id: z.string(),
  type: z.literal('testimonials'),
  order: z.number().int().min(0),
  isVisible: z.boolean().default(true),
  content: testimonialsContentSchema,
});

export type TestimonialItem = z.infer<typeof testimonialItemSchema>;
export type TestimonialsContent = z.infer<typeof testimonialsContentSchema>;
export type TestimonialsBlock = z.infer<typeof testimonialsBlockSchema>;

// =============================================================================
// Pricing Block
// =============================================================================

export const pricingTierSchema = z.object({
  id: z.string(),
  name: z.string().max(30),
  price: z.string().max(20),
  description: z.string().max(100).optional(),
  features: z.array(z.string().max(100)).max(10),
  ctaText: z.string().max(30),
  ctaUrl: z.string().optional(),
  isHighlighted: z.boolean().default(false),
});

export const pricingContentSchema = z.object({
  headline: z.string().max(100).optional(),
  subheadline: z.string().max(200).optional(),
  tiers: z.array(pricingTierSchema).min(1).max(4),
});

export const pricingBlockSchema = z.object({
  id: z.string(),
  type: z.literal('pricing'),
  order: z.number().int().min(0),
  isVisible: z.boolean().default(true),
  content: pricingContentSchema,
});

export type PricingTier = z.infer<typeof pricingTierSchema>;
export type PricingContent = z.infer<typeof pricingContentSchema>;
export type PricingBlock = z.infer<typeof pricingBlockSchema>;

// =============================================================================
// FAQs Block
// =============================================================================

export const faqItemSchema = z.object({
  id: z.string(),
  question: z.string().max(200),
  answer: z.string().max(1000),
});

export const faqsContentSchema = z.object({
  headline: z.string().max(100).optional(),
  faqs: z.array(faqItemSchema).min(1).max(20),
});

export const faqsBlockSchema = z.object({
  id: z.string(),
  type: z.literal('faqs'),
  order: z.number().int().min(0),
  isVisible: z.boolean().default(true),
  content: faqsContentSchema,
});

export type FaqItem = z.infer<typeof faqItemSchema>;
export type FaqsContent = z.infer<typeof faqsContentSchema>;
export type FaqsBlock = z.infer<typeof faqsBlockSchema>;

// =============================================================================
// CTA Block
// =============================================================================

export const ctaContentSchema = z.object({
  headline: z.string().max(100),
  description: z.string().max(200).optional(),
  primaryCtaText: z.string().max(30),
  primaryCtaUrl: z.string().optional(),
  secondaryCtaText: z.string().max(30).optional(),
  secondaryCtaUrl: z.string().optional(),
  style: z.enum(['centered', 'split', 'minimal']).default('centered'),
});

export const ctaBlockSchema = z.object({
  id: z.string(),
  type: z.literal('cta'),
  order: z.number().int().min(0),
  isVisible: z.boolean().default(true),
  content: ctaContentSchema,
});

export type CtaContent = z.infer<typeof ctaContentSchema>;
export type CtaBlock = z.infer<typeof ctaBlockSchema>;

// =============================================================================
// Union of All Blocks
// =============================================================================

export const pageBlockSchema = z.discriminatedUnion('type', [
  heroBlockSchema,
  servicesBlockSchema,
  testimonialsBlockSchema,
  pricingBlockSchema,
  faqsBlockSchema,
  ctaBlockSchema,
]);

export type PageBlock = z.infer<typeof pageBlockSchema>;

// =============================================================================
// Page Settings
// =============================================================================

export const pageSettingsSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366f1'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#ffffff'),
});

export type PageSettings = z.infer<typeof pageSettingsSchema>;

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
