import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Settings, Construction } from 'lucide-react';
import { getUser } from '@/shared/auth';
import { isOwnerOfOrganization } from '@/features/owner-dashboard';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface SettingsPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { locale, slug } = await params;
  const user = await getUser();

  if (!user) {
    redirect(`/${locale}/login?redirect=/app/${slug}/admin/settings`);
  }

  const isOwner = await isOwnerOfOrganization(user.id, slug);
  if (!isOwner) {
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
          <div>
            <h1 className="font-semibold">Configuracion</h1>
            <p className="text-sm text-muted-foreground">Dominio, SEO y mas</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Construction className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <Settings className="h-5 w-5" />
              Proximamente
            </CardTitle>
            <CardDescription>
              Aqui podras configurar tu dominio personalizado, SEO, integraciones y mas.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Estamos trabajando en esta funcionalidad. Te avisaremos cuando este disponible.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
