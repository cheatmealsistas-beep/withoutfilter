import {
  pageBlockSchema,
  pageSettingsSchema,
  type PageBlock,
  type PageSettings,
  type BlockType,
  type ActionResult,
} from './types';
import { createDefaultBlock } from './lib/block-defaults';
import {
  getOrganizationBySlug,
  isOwnerOfOrganization,
  getPageBuilderContent,
} from './page-builder.query';
import { saveDraft, publishDraft } from './page-builder.command';

/**
 * Validate blocks array
 */
function validateBlocks(blocks: unknown[]): { valid: boolean; error?: string } {
  for (let i = 0; i < blocks.length; i++) {
    const result = pageBlockSchema.safeParse(blocks[i]);
    if (!result.success) {
      return {
        valid: false,
        error: `Block ${i + 1}: ${result.error.issues[0].message}`,
      };
    }
  }
  return { valid: true };
}

/**
 * Handle saving draft (auto-save)
 */
export async function handleSaveDraft(
  userId: string,
  slug: string,
  blocks: PageBlock[],
  settings: PageSettings
): Promise<ActionResult> {
  // Get organization
  const { data: org, error: orgError } = await getOrganizationBySlug(slug);
  if (orgError || !org) {
    return { success: false, error: orgError ?? 'Organization not found' };
  }

  // Check ownership
  const isOwner = await isOwnerOfOrganization(userId, org.id);
  if (!isOwner) {
    return { success: false, error: 'No tienes permiso para editar esta página' };
  }

  // Validate settings
  const settingsResult = pageSettingsSchema.safeParse(settings);
  if (!settingsResult.success) {
    return { success: false, error: settingsResult.error.issues[0].message };
  }

  // Validate blocks
  const blocksResult = validateBlocks(blocks);
  if (!blocksResult.valid) {
    return { success: false, error: blocksResult.error };
  }

  // Re-calculate order based on array position
  const orderedBlocks = blocks.map((block, index) => ({
    ...block,
    order: index,
  }));

  // Save draft
  const result = await saveDraft(org.id, orderedBlocks, settingsResult.data);

  return result;
}

/**
 * Handle publishing draft
 */
export async function handlePublish(
  userId: string,
  slug: string
): Promise<ActionResult> {
  // Get organization
  const { data: org, error: orgError } = await getOrganizationBySlug(slug);
  if (orgError || !org) {
    return { success: false, error: orgError ?? 'Organization not found' };
  }

  // Check ownership
  const isOwner = await isOwnerOfOrganization(userId, org.id);
  if (!isOwner) {
    return { success: false, error: 'No tienes permiso para publicar esta página' };
  }

  // Publish
  const result = await publishDraft(org.id);

  return result;
}

/**
 * Handle adding a new block (by organization ID)
 */
export async function handleAddBlockById(
  userId: string,
  organizationId: string,
  blockType: BlockType,
  currentBlocks: PageBlock[]
): Promise<ActionResult & { blocks?: PageBlock[] }> {
  // Check ownership
  const isOwner = await isOwnerOfOrganization(userId, organizationId);
  if (!isOwner) {
    return { success: false, error: 'No tienes permiso para editar esta página' };
  }

  // Create new block
  const newOrder = currentBlocks.length;
  const newBlock = createDefaultBlock(blockType, newOrder);

  // Add to blocks
  const newBlocks = [...currentBlocks, newBlock];

  return { success: true, blocks: newBlocks };
}

/**
 * Handle adding a new block (by slug - for backward compatibility)
 */
export async function handleAddBlock(
  userId: string,
  slug: string,
  blockType: BlockType
): Promise<ActionResult & { blockId?: string }> {
  // Get organization
  const { data: org, error: orgError } = await getOrganizationBySlug(slug);
  if (orgError || !org) {
    return { success: false, error: orgError ?? 'Organization not found' };
  }

  // Check ownership
  const isOwner = await isOwnerOfOrganization(userId, org.id);
  if (!isOwner) {
    return { success: false, error: 'No tienes permiso para editar esta página' };
  }

  // Get current content
  const { data: content, error: contentError } = await getPageBuilderContent(slug);
  if (contentError || !content) {
    return { success: false, error: contentError ?? 'Content not found' };
  }

  // Create new block
  const newOrder = content.draft.blocks.length;
  const newBlock = createDefaultBlock(blockType, newOrder);

  // Add to draft
  const newBlocks = [...content.draft.blocks, newBlock];

  // Save
  const result = await saveDraft(org.id, newBlocks, content.settings);

  if (result.success) {
    return { success: true, blockId: newBlock.id };
  }

  return result;
}

/**
 * Handle deleting a block
 */
export async function handleDeleteBlock(
  userId: string,
  slug: string,
  blockId: string
): Promise<ActionResult> {
  // Get organization
  const { data: org, error: orgError } = await getOrganizationBySlug(slug);
  if (orgError || !org) {
    return { success: false, error: orgError ?? 'Organization not found' };
  }

  // Check ownership
  const isOwner = await isOwnerOfOrganization(userId, org.id);
  if (!isOwner) {
    return { success: false, error: 'No tienes permiso para editar esta página' };
  }

  // Get current content
  const { data: content, error: contentError } = await getPageBuilderContent(slug);
  if (contentError || !content) {
    return { success: false, error: contentError ?? 'Content not found' };
  }

  // Filter out the block
  const newBlocks = content.draft.blocks
    .filter((block) => block.id !== blockId)
    .map((block, index) => ({ ...block, order: index }));

  // Save
  const result = await saveDraft(org.id, newBlocks, content.settings);

  return result;
}

/**
 * Handle reordering blocks (move up/down)
 */
export async function handleMoveBlock(
  userId: string,
  slug: string,
  blockId: string,
  direction: 'up' | 'down'
): Promise<ActionResult> {
  // Get organization
  const { data: org, error: orgError } = await getOrganizationBySlug(slug);
  if (orgError || !org) {
    return { success: false, error: orgError ?? 'Organization not found' };
  }

  // Check ownership
  const isOwner = await isOwnerOfOrganization(userId, org.id);
  if (!isOwner) {
    return { success: false, error: 'No tienes permiso para editar esta página' };
  }

  // Get current content
  const { data: content, error: contentError } = await getPageBuilderContent(slug);
  if (contentError || !content) {
    return { success: false, error: contentError ?? 'Content not found' };
  }

  // Find block index
  const blocks = [...content.draft.blocks];
  const currentIndex = blocks.findIndex((b) => b.id === blockId);

  if (currentIndex === -1) {
    return { success: false, error: 'Block not found' };
  }

  // Calculate new index
  const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  // Check bounds
  if (newIndex < 0 || newIndex >= blocks.length) {
    return { success: true }; // Nothing to do, already at boundary
  }

  // Swap blocks
  [blocks[currentIndex], blocks[newIndex]] = [blocks[newIndex], blocks[currentIndex]];

  // Re-order
  const orderedBlocks = blocks.map((block, index) => ({ ...block, order: index }));

  // Save
  const result = await saveDraft(org.id, orderedBlocks, content.settings);

  return result;
}
