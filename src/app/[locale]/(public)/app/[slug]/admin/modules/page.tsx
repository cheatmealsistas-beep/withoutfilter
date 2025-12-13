import { notFound } from 'next/navigation';
import { Layers } from 'lucide-react';
import { getUser } from '@/shared/auth';
import { getOwnerDashboardData } from '@/features/owner-dashboard';
import { ModulesList } from '@/features/owner-dashboard/components/modules-list';

interface ModulesPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function ModulesPage({ params }: ModulesPageProps) {
  const { slug } = await params;
  const user = await getUser();

  // Layout already handles auth, but we need user for the query
  if (!user) {
    notFound();
  }

  const { data, error } = await getOwnerDashboardData(user.id, slug);

  if (error || !data) {
    notFound();
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Layers className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Páginas</h1>
          <p className="text-sm text-muted-foreground">
            Activa y edita las secciones de tu web
          </p>
        </div>
      </div>

      <ModulesList modules={data.modules} slug={slug} />

      <p className="text-center text-sm text-muted-foreground mt-6">
        Las páginas activadas aparecerán en la navegación de tu sitio
      </p>
    </div>
  );
}
