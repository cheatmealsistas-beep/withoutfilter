import { redirect, notFound } from 'next/navigation';
import { getUser } from '@/shared/auth';
import {
  getModuleContent,
  getOrganizationBySlug,
  isOwnerOfOrganization,
  isEditableModule,
  getModuleConfig,
  getDefaultModuleContent,
  PageBuilderEditor,
} from '@/features/page-builder';

interface EditModulePageProps {
  params: Promise<{ locale: string; slug: string; moduleType: string }>;
}

export default async function EditModulePage({ params }: EditModulePageProps) {
  const { locale, slug, moduleType } = await params;
  const user = await getUser();

  // Must be authenticated
  if (!user) {
    redirect(`/${locale}/login?redirect=/app/${slug}/admin/edit/${moduleType}`);
  }

  // Validate module type
  if (!isEditableModule(moduleType)) {
    notFound();
  }

  // Get organization data
  const { data: org, error: orgError } = await getOrganizationBySlug(slug);
  if (orgError || !org) {
    notFound();
  }

  // Must be owner of this organization
  const isOwner = await isOwnerOfOrganization(user.id, org.id);
  if (!isOwner) {
    notFound();
  }

  // Get module config for label
  const moduleConfig = getModuleConfig(moduleType);

  // Get module content (or default if none exists)
  const { data: content, error: contentError } = await getModuleContent(slug, moduleType);

  // If no content exists, use defaults
  const initialContent = content ?? getDefaultModuleContent(moduleType);

  if (contentError && !content) {
    // Only error if we have an error AND no content (some error but no defaults)
    console.error('Error loading module content:', contentError);
  }

  return (
    <PageBuilderEditor
      organizationId={org.id}
      organizationSlug={slug}
      initialContent={initialContent}
      locale={locale}
      moduleType={moduleType}
      moduleLabel={moduleConfig.label}
    />
  );
}
