'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Palette,
  Layers,
  BookOpen,
  Settings,
  Eye,
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const sidebarContent = (
    <>
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
              onClick={closeMobileMenu}
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
    </>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-4 bg-background border-b md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-sm truncate max-w-[200px]">
          {currentOrg.name}
        </span>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-50 bg-black/50 md:hidden cursor-default"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-background flex flex-col transform transition-transform duration-200 ease-in-out md:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button */}
        <div className="flex items-center justify-end h-14 px-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobileMenu}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r bg-background flex-col">
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
