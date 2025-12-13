import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Layers } from 'lucide-react';
import { getUser } from '@/shared/auth';
import { getOwnerDashboardData } from '@/features/owner-dashboard';
import { Button } from '@/shared/components/ui/button';
import { ModulesList } from '@/features/owner-dashboard/components/modules-list';

interface ModulesPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ModulesPage({ params }: ModulesPageProps) {
  const { locale, slug } = await params;
  const user = await getUser();

  if (!user) {
    redirect(`/${locale}/login?redirect=/app/${slug}/admin/modules`);
  }

  // Get dashboard data which includes modules
  const { data, error } = await getOwnerDashboardData(user.id, slug);

  if (error || !data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/${locale}/app/${slug}/admin`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <div>
              <h1 className="font-semibold">Módulos</h1>
              <p className="text-sm text-muted-foreground">
                Activa las secciones que quieres mostrar en tu web
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <ModulesList modules={data.modules} slug={slug} />

        <p className="text-center text-sm text-muted-foreground mt-6">
          Los módulos activados aparecerán en la navegación de tu web pública
        </p>
      </main>
    </div>
  );
}
