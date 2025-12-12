'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/components/ui/sheet';
import type { PublicApp } from '../types';

// Module type to route and label mapping
const moduleConfig: Record<
  string,
  { path: string; label: string; labelEs: string }
> = {
  home: { path: '', label: 'Home', labelEs: 'Inicio' },
  courses: { path: '/courses', label: 'Courses', labelEs: 'Cursos' },
  about: { path: '/about', label: 'About', labelEs: 'Sobre mi' },
  services: { path: '/services', label: 'Services', labelEs: 'Servicios' },
  testimonials: { path: '/testimonials', label: 'Testimonials', labelEs: 'Testimonios' },
  blog: { path: '/blog', label: 'Blog', labelEs: 'Blog' },
  contact: { path: '/contact', label: 'Contact', labelEs: 'Contacto' },
  resources: { path: '/resources', label: 'Resources', labelEs: 'Recursos' },
};

interface PublicNavbarProps {
  app: PublicApp;
  enabledModules: Array<{
    type: string;
    isEnabled: boolean;
    isPublic: boolean;
    displayOrder: number;
  }>;
  locale: string;
  isOwner?: boolean;
}

export function PublicNavbar({
  app,
  enabledModules,
  locale,
  isOwner = false,
}: PublicNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter to only public modules that have routes configured
  const navItems = enabledModules
    .filter((m) => m.isPublic && moduleConfig[m.type])
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((m) => ({
      type: m.type,
      path: moduleConfig[m.type].path,
      label: locale === 'es' ? moduleConfig[m.type].labelEs : moduleConfig[m.type].label,
    }));

  // Don't render if only home is enabled (no navigation needed)
  if (navItems.length <= 1) {
    return null;
  }

  const basePath = `/${locale}/app/${app.slug}`;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
              <div
                className="h-8 w-8 rounded flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: app.primaryColor || '#000' }}
              >
                {app.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-semibold hidden sm:inline">{app.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.type}
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

          {/* Mobile Menu */}
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
                    key={item.type}
                    href={`${basePath}${item.path}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-lg font-medium hover:bg-muted rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}

                {isOwner && (
                  <div className="pt-4 border-t mt-4">
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
        </div>
      </nav>
    </header>
  );
}
