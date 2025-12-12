import { redirect, notFound } from 'next/navigation';
import { getUser } from '@/shared/auth';
import {
  getPageBuilderContent,
  getOrganizationBySlug,
  isOwnerOfOrganization,
  PageBuilderEditor,
} from '@/features/page-builder';

interface CustomizePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function CustomizePage({ params }: CustomizePageProps) {
  const { locale, slug } = await params;
  const user = await getUser();

  // Must be authenticated
  if (!user) {
    redirect(`/${locale}/login?redirect=/app/${slug}/admin/customize`);
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

  // Get page builder content (auto-migrates legacy content)
  const { data: content, error: contentError } = await getPageBuilderContent(slug);
  if (contentError || !content) {
    notFound();
  }

  return (
    <PageBuilderEditor
      organizationId={org.id}
      organizationSlug={slug}
      initialContent={content}
      locale={locale}
    />
  );
}
