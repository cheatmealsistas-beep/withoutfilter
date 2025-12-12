import type {
  PageBuilderContent,
  LegacyHomeContent,
  HeroBlock,
  PageSettings,
} from '../types';

/**
 * Generate a simple unique ID (crypto.randomUUID compatible)
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Check if content is already in the new format (version 2)
 */
export function isPageBuilderContent(content: unknown): content is PageBuilderContent {
  return (
    content !== null &&
    typeof content === 'object' &&
    'version' in content &&
    (content as { version: unknown }).version === 2
  );
}

/**
 * Migrate legacy home content to the new page builder format
 * Legacy content is a flat object with headline, description, ctaText
 */
export function migrateContent(
  content: unknown,
  defaultSettings?: Partial<PageSettings>
): PageBuilderContent {
  // If already migrated, return as-is
  if (isPageBuilderContent(content)) {
    return content;
  }

  const legacy = content as LegacyHomeContent | null | undefined;
  const now = new Date().toISOString();

  // Create a Hero block from legacy content
  const heroBlock: HeroBlock = {
    id: generateId(),
    type: 'hero',
    order: 0,
    isVisible: true,
    content: {
      headline: legacy?.headline || '',
      description: legacy?.description || undefined,
      ctaText: legacy?.ctaText || undefined,
      ctaUrl: legacy?.ctaUrl || undefined,
    },
  };

  // Check if there's actual content to publish
  const hasContent = !!(legacy?.headline || legacy?.description || legacy?.ctaText);

  return {
    version: 2,
    settings: {
      primaryColor: defaultSettings?.primaryColor || '#6366f1',
      secondaryColor: defaultSettings?.secondaryColor || '#ffffff',
    },
    draft: {
      blocks: [heroBlock],
      lastModified: now,
    },
    // If there was existing content, mark it as published too
    published: hasContent
      ? {
          blocks: [heroBlock],
          publishedAt: now,
        }
      : null,
  };
}

/**
 * Create empty page builder content for new pages
 */
export function createEmptyContent(
  defaultSettings?: Partial<PageSettings>
): PageBuilderContent {
  const now = new Date().toISOString();

  const heroBlock: HeroBlock = {
    id: generateId(),
    type: 'hero',
    order: 0,
    isVisible: true,
    content: {
      headline: '',
      description: undefined,
      ctaText: undefined,
      ctaUrl: undefined,
    },
  };

  return {
    version: 2,
    settings: {
      primaryColor: defaultSettings?.primaryColor || '#6366f1',
      secondaryColor: defaultSettings?.secondaryColor || '#ffffff',
    },
    draft: {
      blocks: [heroBlock],
      lastModified: now,
    },
    published: null,
  };
}
