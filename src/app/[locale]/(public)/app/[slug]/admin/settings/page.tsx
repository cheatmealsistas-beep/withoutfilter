import { notFound } from 'next/navigation';
import { Settings, Construction } from 'lucide-react';
import { getUser } from '@/shared/auth';
import {
  getOrganizationBySlug,
  OrganizationSettings,
} from '@/features/owner-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface SettingsPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { slug } = await params;
  const user = await getUser();

  // Layout already handles auth
  if (!user) {
    notFound();
  }

  const { data: org, error: orgError } = await getOrganizationBySlug(slug);
  if (orgError || !org) {
    notFound();
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Configuración</h1>
          <p className="text-sm text-muted-foreground">
            Personaliza tu sitio
          </p>
        </div>
      </div>

      {/* Logo Settings */}
      <OrganizationSettings
        organizationId={org.id}
        slug={slug}
        currentLogoUrl={org.logoUrl}
        organizationName={org.name}
      />

      {/* Coming Soon Section */}
      <Card className="mt-6">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Construction className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-base">
            Más opciones próximamente
          </CardTitle>
          <CardDescription>
            Dominio personalizado, SEO, integraciones y más.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Estamos trabajando en estas funcionalidades.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
