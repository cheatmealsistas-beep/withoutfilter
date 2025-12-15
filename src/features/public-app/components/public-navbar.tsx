'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet';
import type { PublicApp, EnabledModule } from '../types';

// Default labels per module type (used when no custom_label is set)
const defaultLabels: Record<string, { en: string; es: string }> = {
  home: { en: 'Home', es: 'Inicio' },
  courses: { en: 'Courses', es: 'Cursos' },
  about: { en: 'About', es: 'Sobre mí' },
  services: { en: 'Services', es: 'Servicios' },
  testimonials: { en: 'Testimonials', es: 'Testimonios' },
  blog: { en: 'Blog', es: 'Blog' },
  contact: { en: 'Contact', es: 'Contacto' },
  resources: { en: 'Resources', es: 'Recursos' },
};

// Default paths per module type
const defaultPaths: Record<string, string> = {
  home: '',
  courses: '/courses',
  about: '/about',
  services: '/services',
  testimonials: '/testimonials',
  blog: '/blog',
  contact: '/contact',
  resources: '/resources',
};

interface PublicNavbarProps {
  app: PublicApp;
  enabledModules: EnabledModule[];
  locale: string;
  isOwner?: boolean;
  /** Whether the edit bar is visible (owner viewing their app) */
  hasEditBar?: boolean;
}

export function PublicNavbar({
  app,
  enabledModules,
  locale,
  isOwner = false,
  hasEditBar = false,
}: PublicNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get the path for a module (custom slug for custom pages, default path for standard modules)
  const getModulePath = (module: EnabledModule): string => {
    if (module.type === 'custom' && module.customSlug) {
      return `/${module.customSlug}`;
    }
    return defaultPaths[module.type] || '';
  };

  // Get the label for a module (custom label or default based on locale)
  const getModuleLabel = (module: EnabledModule): string => {
    if (module.customLabel) {
      return module.customLabel;
    }
    const labels = defaultLabels[module.type];
    if (!labels) return module.type;
    return locale === 'es' ? labels.es : labels.en;
  };

  // Filter to only public modules that should show in navbar (exclude home)
  const navItems = enabledModules
    .filter((m) => m.isPublic && m.showInNavbar && m.type !== 'home')
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((m) => ({
      id: m.id,
      type: m.type,
      path: getModulePath(m),
      label: getModuleLabel(m),
    }));

  const basePath = `/${locale}/app/${app.slug}`;
  const hasNavItems = navItems.length > 0;

  return (
    <header
      className={`sticky z-50 w-full border-b bg-background ${hasEditBar ? 'top-14' : 'top-0'}`}
    >
      <nav className="max-w-7xl mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo/Brand */}
          <Link href={basePath} className="flex items-center gap-2">
            {app.logoUrl ? (
              <img
                src={app.logoUrl}
                alt={app.name}
                className="h-8 w-8 object-contain rounded"
              />
            ) : (
              <div className="h-8 w-8 rounded flex items-center justify-center text-primary-foreground font-bold bg-primary">
                {app.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-semibold hidden sm:inline">{app.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={`${basePath}${item.path}`}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA / Owner indicator */}
          <div className="hidden md:flex items-center gap-2">
            {isOwner && (
              <Link href={`/${locale}/app/${app.slug}/admin`}>
                <Button variant="outline" size="sm">
                  Admin
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu - only show if there are nav items or owner actions */}
          {(hasNavItems || isOwner) && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`${basePath}${item.path}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}

                  {isOwner && (
                    <div className={hasNavItems ? 'pt-4 border-t mt-4' : ''}>
                      <Link
                        href={`/${locale}/app/${app.slug}/admin`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button className="w-full">Admin</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </nav>
    </header>
  );
}
