import { notFound } from 'next/navigation';
import { getUser } from '@/shared/auth';
import {
  getPublicAppBySlug,
  getPublicHomeContent,
  getPublishedPageContent,
  getEnabledModules,
  isAppOwner,
  PublicHero,
  PublicFooter,
  PublicNavbar,
  EditBar,
  PublicBlocks,
} from '@/features/public-app';

interface PublicAppPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PublicAppPageProps) {
  const { slug } = await params;
  const { data: app } = await getPublicAppBySlug(slug);

  if (!app) {
    return { title: 'Not Found' };
  }

  return {
    title: `${app.name} | ${app.ownerName || 'Modulary'}`,
    description: app.tagline || `${app.name} - Creado con Modulary`,
    openGraph: {
      title: app.name,
      description: app.tagline || undefined,
      images: app.logoUrl ? [{ url: app.logoUrl }] : undefined,
    },
  };
}

export default async function PublicAppPage({ params }: PublicAppPageProps) {
  const { locale, slug } = await params;

  // Get app data
  const { data: app, error } = await getPublicAppBySlug(slug);

  if (error || !app) {
    notFound();
  }

  // Check if current user is owner
  const user = await getUser();
  const isOwner = user ? await isAppOwner(app.id, user.id) : false;

  // Get enabled modules for navigation
  const { data: enabledModules } = await getEnabledModules(app.id);

  // Try to get new page builder content first
  const { data: pageContent } = await getPublishedPageContent(app.id);

  // If we have page builder content (v2), render blocks
  if (pageContent && pageContent.blocks.length > 0) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Edit bar for owners */}
        {isOwner && <EditBar slug={slug} locale={locale} />}

        {/* Navigation */}
        <PublicNavbar
          app={app}
          enabledModules={enabledModules || []}
          locale={locale}
          isOwner={isOwner}
        />

        {/* Main content - render blocks */}
        <main className={`flex-1 ${isOwner ? 'pt-14' : ''}`}>
          <PublicBlocks blocks={pageContent.blocks} settings={pageContent.settings} />
        </main>

        {/* Footer */}
        <PublicFooter app={app} />
      </div>
    );
  }

  // Fall back to legacy content (for users who haven't migrated)
  const { data: homeContent } = await getPublicHomeContent(app.id);

  // Default content if none exists
  const content = homeContent || {
    headline: `Bienvenido a ${app.name}`,
    description: app.tagline || 'Tu espacio digital profesional',
    ctaText: 'Contactar',
    ctaUrl: '#contact',
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Edit bar for owners */}
      {isOwner && <EditBar slug={slug} locale={locale} />}

      {/* Navigation */}
      <PublicNavbar
        app={app}
        enabledModules={enabledModules || []}
        locale={locale}
        isOwner={isOwner}
      />

      {/* Main content */}
      <main className={`flex-1 ${isOwner ? 'pt-14' : ''}`}>
        <PublicHero app={app} content={content} />
      </main>

      {/* Footer */}
      <PublicFooter app={app} />
    </div>
  );
}
