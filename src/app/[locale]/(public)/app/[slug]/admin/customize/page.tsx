import { redirect, notFound } from 'next/navigation';
import { getUser } from '@/shared/auth';
import {
  isOwnerOfOrganization,
  getOrganizationBySlug,
  getHomeContent,
} from '@/features/owner-dashboard';
import { HomeEditor } from '@/features/owner-dashboard/components/home-editor';

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

  // Must be owner of this organization
  const isOwner = await isOwnerOfOrganization(user.id, slug);
  if (!isOwner) {
    notFound();
  }

  // Get organization data
  const { data: org, error: orgError } = await getOrganizationBySlug(slug);
  if (orgError || !org) {
    notFound();
  }

  // Get current home content
  const { data: homeContent } = await getHomeContent(slug);

  const initialContent = {
    headline: homeContent?.headline || '',
    description: homeContent?.description || null,
    ctaText: homeContent?.ctaText || null,
  };

  return (
    <HomeEditor
      slug={slug}
      initialContent={initialContent}
      appName={org.name}
      logoUrl={org.logoUrl}
      locale={locale}
    />
  );
}
