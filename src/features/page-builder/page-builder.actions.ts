'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/shared/auth';
import type { PageBlock, PageSettings, BlockType, ActionResult } from './types';
import {
  handleSaveDraft,
  handlePublish,
  handleAddBlock,
  handleDeleteBlock,
  handleMoveBlock,
} from './page-builder.handler';

/**
 * Save draft action (auto-save)
 */
export async function saveDraftAction(
  slug: string,
  blocks: PageBlock[],
  settings: PageSettings,
  moduleType: string = 'home'
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const result = await handleSaveDraft(user.id, slug, blocks, settings, moduleType);

  // Don't revalidate on auto-save to avoid flicker
  return result;
}

/**
 * Publish draft action
 */
export async function publishAction(
  slug: string,
  moduleType: string = 'home'
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const result = await handlePublish(user.id, slug, moduleType);

  if (result.success) {
    // Revalidate the public pages - need to invalidate all locale variants
    // Next.js with next-intl requires explicit paths per locale
    const locales = ['en', 'es'];

    for (const locale of locales) {
      if (moduleType === 'home') {
        revalidatePath(`/${locale}/app/${slug}`);
      } else {
        revalidatePath(`/${locale}/app/${slug}/${moduleType}`);
      }
    }
  }

  return result;
}

/**
 * Add block action
 */
export async function addBlockAction(
  slug: string,
  blockType: BlockType
): Promise<ActionResult & { blockId?: string }> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const result = await handleAddBlock(user.id, slug, blockType);

  if (result.success) {
    revalidatePath(`/app/${slug}/admin/customize`);
  }

  return result;
}

/**
 * Delete block action
 */
export async function deleteBlockAction(
  slug: string,
  blockId: string
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const result = await handleDeleteBlock(user.id, slug, blockId);

  if (result.success) {
    revalidatePath(`/app/${slug}/admin/customize`);
  }

  return result;
}

/**
 * Move block action (up/down)
 */
export async function moveBlockAction(
  slug: string,
  blockId: string,
  direction: 'up' | 'down'
): Promise<ActionResult> {
  const user = await getUser();
  if (!user) {
    return { success: false, error: 'No autenticado' };
  }

  const result = await handleMoveBlock(user.id, slug, blockId, direction);

  if (result.success) {
    revalidatePath(`/app/${slug}/admin/customize`);
  }

  return result;
}
