import { notFound } from 'next/navigation';
import { getPublicAppBySlug } from '@/features/public-app/public-app.query';
import { StudentRegisterForm } from '@/features/student-auth';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function StudentRegisterPage({ params }: PageProps) {
  const { locale, slug } = await params;

  // Get app data for branding
  const { data: app } = await getPublicAppBySlug(slug);

  if (!app) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <StudentRegisterForm
        locale={locale}
        slug={slug}
        appName={app.name}
        logoUrl={app.logoUrl}
      />
    </div>
  );
}
