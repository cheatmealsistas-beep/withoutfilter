import { notFound } from 'next/navigation';
import { getPublicAppBySlug, getPublishedPageContent } from '@/features/public-app';
import { BrandColorProvider } from '@/features/public-app/components/brand-color-provider';

interface PublicAppLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}

export default async function PublicAppLayout({
  children,
  params,
}: PublicAppLayoutProps) {
  const { slug } = await params;

  // Get app data
  const { data: app } = await getPublicAppBySlug(slug);

  if (!app) {
    notFound();
  }

  // Get page builder settings for the brand color
  const { data: pageContent } = await getPublishedPageContent(app.id);
  const primaryColor = pageContent?.settings.primaryColor || '#6366f1';

  return (
    <BrandColorProvider primaryColor={primaryColor}>
      {children}
    </BrandColorProvider>
  );
}
