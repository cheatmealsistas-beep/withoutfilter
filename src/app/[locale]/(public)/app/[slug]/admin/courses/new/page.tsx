import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getUser } from '@/shared/auth';
import { isOwnerOfOrganization } from '@/features/owner-dashboard';
import { Button } from '@/shared/components/ui/button';
import { CreateCourseWizard } from '@/features/courses/components/create-course-wizard';

interface NewCoursePageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function NewCoursePage({ params }: NewCoursePageProps) {
  const { locale, slug } = await params;
  const user = await getUser();

  if (!user) {
    redirect(`/${locale}/login?redirect=/app/${slug}/admin/courses/new`);
  }

  const isOwner = await isOwnerOfOrganization(user.id, slug);
  if (!isOwner) {
    notFound();
  }

  // Get organization ID from slug
  const { getOrganizationBySlug } = await import('@/features/owner-dashboard');
  const { data: org } = await getOrganizationBySlug(slug);

  if (!org) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/${locale}/app/${slug}/admin/courses`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold">Crear nuevo curso</h1>
            <p className="text-sm text-muted-foreground">
              Configura los detalles basicos de tu curso
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <CreateCourseWizard
          organizationId={org.id}
          orgSlug={slug}
          locale={locale}
        />
      </main>
    </div>
  );
}
