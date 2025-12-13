'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Palette,
  Layers,
  BookOpen,
  Settings,
  Eye,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { SiteSelector } from './site-selector';
import { UserMenu } from './user-menu';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

interface OwnerAdminLayoutProps {
  children: ReactNode;
  currentOrg: Organization;
  organizations: Organization[];
  user: {
    id: string;
    email?: string;
    avatar?: string;
  };
}

export function OwnerAdminLayout({
  children,
  currentOrg,
  organizations,
  user,
}: OwnerAdminLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const slug = currentOrg.slug;

  const basePath = `/${locale}/app/${slug}/admin`;

  const navigation = [
    {
      name: 'Dashboard',
      href: basePath,
      icon: LayoutDashboard,
      matchPaths: [basePath],
    },
    {
      name: 'Páginas',
      href: `${basePath}/modules`,
      icon: Layers,
      matchPaths: [`${basePath}/modules`, `${basePath}/edit`],
    },
    {
      name: 'Apariencia',
      href: `${basePath}/customize`,
      icon: Palette,
      matchPaths: [`${basePath}/customize`],
    },
    {
      name: 'Cursos',
      href: `${basePath}/courses`,
      icon: BookOpen,
      matchPaths: [`${basePath}/courses`],
    },
    {
      name: 'Configuración',
      href: `${basePath}/settings`,
      icon: Settings,
      matchPaths: [`${basePath}/settings`],
    },
  ];

  const isActive = (matchPaths: string[]) => {
    if (!pathname) return false;
    // Exact match for dashboard
    if (matchPaths.includes(basePath) && pathname === basePath) return true;
    // Prefix match for others
    return matchPaths.some(path => path !== basePath && pathname.startsWith(path));
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background flex flex-col">
        {/* Site Selector */}
        <SiteSelector currentOrg={currentOrg} organizations={organizations} />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.matchPaths);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* View Site Button */}
        <div className="px-3 py-2">
          <Button variant="outline" className="w-full" asChild>
            <Link
              href={`/${locale}/app/${slug}`}
              target="_blank"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver sitio
            </Link>
          </Button>
        </div>

        {/* User Menu */}
        <UserMenu user={user} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
