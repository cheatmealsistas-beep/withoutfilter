'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Clock, Layers, Palette, BookOpen, Settings, CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import type { OwnerDashboardData } from '../types';

interface OwnerDashboardProps {
  data: OwnerDashboardData;
  locale: string;
}

export function OwnerDashboard({ data, locale }: OwnerDashboardProps) {
  const t = useTranslations('app-[slug]-admin');
  const { organization, stats, modules } = data;

  // Calculate setup progress
  const setupSteps = [
    { id: 'logo', label: 'Subir logo', completed: !!organization.logoUrl },
    { id: 'home', label: 'Personalizar inicio', completed: modules.some(m => m.type === 'home' && m.isEnabled) },
    { id: 'contact', label: 'Configurar contacto', completed: modules.some(m => m.type === 'contact' && m.isEnabled) },
    { id: 'services', label: 'Añadir servicios', completed: modules.some(m => m.type === 'services' && m.isEnabled) },
  ];

  const completedSteps = setupSteps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedSteps / setupSteps.length) * 100);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Trial Banner */}
      {stats.trialDaysRemaining !== null && stats.trialDaysRemaining > 0 && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">
                {t('trial.daysRemaining', { days: stats.trialDaysRemaining })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('trial.afterTrial')}
              </p>
            </div>
          </div>
          <Link href={`/${locale}/choose-plan`}>
            <Button size="sm">{t('trial.viewPlans')}</Button>
          </Link>
        </div>
      )}

      {/* Setup Progress */}
      {progressPercent < 100 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Completa tu sitio</CardTitle>
              <Badge variant="secondary">{progressPercent}%</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progressPercent} className="h-2" />
            <div className="grid gap-2">
              {setupSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-2 text-sm">
                  {step.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={step.completed ? 'text-muted-foreground line-through' : ''}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.activeModules')}</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {modules.filter(m => m.isEnabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              de {modules.length} secciones disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('stats.status')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {stats.trialDaysRemaining !== null ? t('stats.trial') : t('stats.active')}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('quickActions.title')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href={`/${locale}/app/${organization.slug}/admin/modules`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Páginas</CardTitle>
                    <CardDescription>Activa y edita las secciones de tu web</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href={`/${locale}/app/${organization.slug}/admin/customize`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Apariencia</CardTitle>
                    <CardDescription>Colores, tipografía y estilo global</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href={`/${locale}/app/${organization.slug}/admin/courses`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Cursos</CardTitle>
                    <CardDescription>Gestiona tus cursos y contenido educativo</CardDescription>
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
                    <CardTitle className="text-base">Configuración</CardTitle>
                    <CardDescription>Logo, branding y ajustes del sitio</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
