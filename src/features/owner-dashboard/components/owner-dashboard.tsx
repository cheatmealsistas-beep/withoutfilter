'use client';

import Link from 'next/link';
import { ExternalLink, Eye, Clock, Layers, Settings, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import type { OwnerDashboardData } from '../types';

interface OwnerDashboardProps {
  data: OwnerDashboardData;
  locale: string;
}

export function OwnerDashboard({ data, locale }: OwnerDashboardProps) {
  const { organization, stats } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {organization.logoUrl ? (
              <img
                src={organization.logoUrl}
                alt={organization.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {organization.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="font-semibold">{organization.name}</h1>
              <p className="text-sm text-muted-foreground">Panel de administrador</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/${locale}/app/${organization.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Ver mi web
                <ExternalLink className="h-3 w-3 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Trial Banner */}
        {stats.trialDaysRemaining !== null && stats.trialDaysRemaining > 0 && (
          <div className="mb-8 p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">
                  Te quedan <span className="text-primary">{stats.trialDaysRemaining} dias</span> de prueba gratuita
                </p>
                <p className="text-sm text-muted-foreground">
                  Despues de eso, elige un plan para continuar
                </p>
              </div>
            </div>
            <Link href={`/${locale}/choose-plan`}>
              <Button size="sm">Ver planes</Button>
            </Link>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitas totales</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">Proximamente analytics</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modulos activos</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.modulesCount}</div>
              <p className="text-xs text-muted-foreground">Secciones de tu web</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {stats.trialDaysRemaining !== null ? 'Prueba' : 'Activo'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold mb-4">Acciones rapidas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href={`/${locale}/app/${organization.slug}/admin/customize`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Personalizar</CardTitle>
                    <CardDescription>Edita colores, logo y textos</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href={`/${locale}/app/${organization.slug}/admin/modules`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Modulos</CardTitle>
                    <CardDescription>Activa o desactiva secciones</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href={`/${locale}/app/${organization.slug}/admin/settings`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Configuracion</CardTitle>
                    <CardDescription>Dominio, SEO y mas</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}
