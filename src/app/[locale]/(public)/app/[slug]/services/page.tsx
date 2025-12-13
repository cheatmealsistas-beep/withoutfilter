import { notFound } from 'next/navigation';
import { getUser } from '@/shared/auth';
import {
  getPublicAppBySlug,
  getEnabledModules,
  getPublishedModulePageContent,
  isAppOwner,
  PublicNavbar,
  PublicFooter,
  PublicBlocks,
} from '@/features/public-app';
import { EditBar } from '@/features/public-app/components/edit-bar';

interface ServicesPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ServicesPageProps) {
  const { slug } = await params;
  const { data: app } = await getPublicAppBySlug(slug);

  if (!app) {
    return { title: 'Not Found' };
  }

  return {
    title: `Servicios | ${app.name}`,
    description: `Conoce los servicios que ofrece ${app.ownerName || app.name}`,
  };
}

export default async function PublicServicesPage({ params }: ServicesPageProps) {
  const { locale, slug } = await params;

  const { data: app } = await getPublicAppBySlug(slug);
  if (!app) {
    notFound();
  }

  const user = await getUser();
  const isOwner = user ? await isAppOwner(app.id, user.id) : false;
  const { data: enabledModules } = await getEnabledModules(app.id);

  // Check if services module is enabled
  const servicesModule = enabledModules?.find((m) => m.type === 'services');
  if (!servicesModule?.isEnabled) {
    notFound();
  }

  // Get published content for services module
  const { data: pageContent } = await getPublishedModulePageContent(app.id, 'services');

  return (
    <div className="min-h-screen flex flex-col">
      {isOwner && <EditBar slug={slug} locale={locale} moduleType="services" />}

      <PublicNavbar
        app={app}
        enabledModules={enabledModules || []}
        locale={locale}
        isOwner={isOwner}
        hasEditBar={isOwner}
      />

      <main className="flex-1">
        {pageContent && pageContent.blocks.length > 0 ? (
          <PublicBlocks blocks={pageContent.blocks} settings={pageContent.settings} />
        ) : (
          // Fallback when no content has been created/published
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">Servicios</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Descubre lo que {app.ownerName || app.name} puede ofrecerte
              </p>
              {isOwner && (
                <p className="text-muted-foreground p-6 border-2 border-dashed rounded-lg">
                  Personaliza esta página desde el panel de administración.
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      <PublicFooter app={app} />
    </div>
  );
}
