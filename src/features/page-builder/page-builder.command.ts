import { createClient } from '@supabase/supabase-js';
import type { PageBuilderContent, PageBlock, PageSettings } from './types';

// Admin client for bypassing RLS
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

/**
 * Save draft content (auto-save)
 */
export async function saveDraft(
  organizationId: string,
  blocks: PageBlock[],
  settings: PageSettings
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // Get current content to preserve published state
  const { data: module } = await supabase
    .from('app_modules')
    .select('content')
    .eq('organization_id', organizationId)
    .eq('type', 'home')
    .maybeSingle();

  const currentContent = module?.content as PageBuilderContent | null;
  const now = new Date().toISOString();

  const newContent: PageBuilderContent = {
    version: 2,
    settings,
    draft: {
      blocks,
      lastModified: now,
    },
    // Preserve existing published content
    published: currentContent?.published ?? null,
  };

  const { error } = await supabase
    .from('app_modules')
    .update({ content: newContent })
    .eq('organization_id', organizationId)
    .eq('type', 'home');

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Publish current draft
 */
export async function publishDraft(
  organizationId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // Get current draft
  const { data: module, error: fetchError } = await supabase
    .from('app_modules')
    .select('content')
    .eq('organization_id', organizationId)
    .eq('type', 'home')
    .single();

  if (fetchError || !module) {
    return { success: false, error: fetchError?.message ?? 'Module not found' };
  }

  const currentContent = module.content as PageBuilderContent;

  if (!currentContent?.draft) {
    return { success: false, error: 'No draft to publish' };
  }

  const now = new Date().toISOString();

  const newContent: PageBuilderContent = {
    ...currentContent,
    published: {
      blocks: [...currentContent.draft.blocks],
      publishedAt: now,
    },
  };

  const { error } = await supabase
    .from('app_modules')
    .update({ content: newContent })
    .eq('organization_id', organizationId)
    .eq('type', 'home');

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Save entire page builder content (draft + settings)
 */
export async function savePageBuilderContent(
  organizationId: string,
  content: PageBuilderContent
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('app_modules')
    .update({ content })
    .eq('organization_id', organizationId)
    .eq('type', 'home');

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
