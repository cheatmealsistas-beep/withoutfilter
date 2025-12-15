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

interface ContactPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ContactPageProps) {
  const { slug } = await params;
  const { data: app } = await getPublicAppBySlug(slug);

  if (!app) {
    return { title: 'Not Found' };
  }

  return {
    title: `Contacto | ${app.name}`,
    description: `Contacta con ${app.ownerName || app.name}`,
  };
}

export default async function PublicContactPage({ params }: ContactPageProps) {
  const { locale, slug } = await params;

  const { data: app } = await getPublicAppBySlug(slug);
  if (!app) {
    notFound();
  }

  const user = await getUser();
  const isOwner = user ? await isAppOwner(app.id, user.id) : false;
  const { data: enabledModules } = await getEnabledModules(app.id);

  // Check if contact module is enabled
  const contactModule = enabledModules?.find((m) => m.type === 'contact');
  if (!contactModule?.isEnabled) {
    notFound();
  }

  // Get published content for contact module
  const { data: pageContent } = await getPublishedModulePageContent(app.id, 'contact');

  return (
    <div className="min-h-screen flex flex-col">
      {isOwner && <EditBar slug={slug} locale={locale} moduleType="contact" />}

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
              <h1 className="text-4xl font-bold mb-4">Contacto</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Ponte en contacto con {app.ownerName || app.name}
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

      <PublicFooter app={app} enabledModules={enabledModules || []} locale={locale} />
    </div>
  );
}
