import { z } from 'zod';
import { isOwnerOfOrganization, getOrganizationBySlug } from './owner-dashboard.query';
import { toggleModule, setModulePublic, reorderModules } from './owner-dashboard.command';

// Valid module types
const moduleTypes = [
  'home',
  'about',
  'services',
  'testimonials',
  'blog',
  'contact',
  'courses',
  'resources',
] as const;

// Validation schemas
const toggleModuleSchema = z.object({
  type: z.enum(moduleTypes),
  isEnabled: z.boolean(),
});

const setModulePublicSchema = z.object({
  type: z.enum(moduleTypes),
  isPublic: z.boolean(),
});

const reorderModulesSchema = z.array(
  z.object({
    type: z.enum(moduleTypes),
    displayOrder: z.number().min(0).max(10),
  })
);

/**
 * Handle toggle module enabled/disabled
 */
export async function handleToggleModule(
  userId: string,
  slug: string,
  input: { type: string; isEnabled: boolean }
): Promise<{ success: boolean; error: string | null }> {
  // Validate input
  const validation = toggleModuleSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  // Check ownership
  const isOwner = await isOwnerOfOrganization(userId, slug);
  if (!isOwner) {
    return { success: false, error: 'No tienes permisos para modificar este módulo' };
  }

  // Get organization ID
  const { data: org } = await getOrganizationBySlug(slug);
  if (!org) {
    return { success: false, error: 'Organización no encontrada' };
  }

  // Prevent disabling home module
  if (validation.data.type === 'home' && !validation.data.isEnabled) {
    return { success: false, error: 'No puedes desactivar el módulo de inicio' };
  }

  // Toggle the module
  return toggleModule(org.id, validation.data.type, validation.data.isEnabled);
}

/**
 * Handle set module public/private
 */
export async function handleSetModulePublic(
  userId: string,
  slug: string,
  input: { type: string; isPublic: boolean }
): Promise<{ success: boolean; error: string | null }> {
  // Validate input
  const validation = setModulePublicSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  // Check ownership
  const isOwner = await isOwnerOfOrganization(userId, slug);
  if (!isOwner) {
    return { success: false, error: 'No tienes permisos para modificar este módulo' };
  }

  // Get organization ID
  const { data: org } = await getOrganizationBySlug(slug);
  if (!org) {
    return { success: false, error: 'Organización no encontrada' };
  }

  // Update public state
  return setModulePublic(org.id, validation.data.type, validation.data.isPublic);
}

/**
 * Handle reorder modules
 */
export async function handleReorderModules(
  userId: string,
  slug: string,
  modules: Array<{ type: string; displayOrder: number }>
): Promise<{ success: boolean; error: string | null }> {
  // Validate input
  const validation = reorderModulesSchema.safeParse(modules);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  // Check ownership
  const isOwner = await isOwnerOfOrganization(userId, slug);
  if (!isOwner) {
    return { success: false, error: 'No tienes permisos para modificar los módulos' };
  }

  // Get organization ID
  const { data: org } = await getOrganizationBySlug(slug);
  if (!org) {
    return { success: false, error: 'Organización no encontrada' };
  }

  // Reorder modules
  return reorderModules(org.id, validation.data);
}
