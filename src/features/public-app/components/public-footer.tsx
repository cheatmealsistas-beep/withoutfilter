import Link from 'next/link';
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

interface PublicFooterProps {
  app: PublicApp;
  enabledModules?: EnabledModule[];
  locale?: string;
}

export function PublicFooter({ app, enabledModules = [], locale = 'es' }: PublicFooterProps) {
  const currentYear = new Date().getFullYear();
  const basePath = `/${locale}/app/${app.slug}`;

  // Get the path for a module
  const getModulePath = (module: EnabledModule): string => {
    if (module.type === 'custom' && module.customSlug) {
      return `/${module.customSlug}`;
    }
    return defaultPaths[module.type] || '';
  };

  // Get the label for a module
  const getModuleLabel = (module: EnabledModule): string => {
    if (module.customLabel) {
      return module.customLabel;
    }
    const labels = defaultLabels[module.type];
    if (!labels) return module.type;
    return locale === 'es' ? labels.es : labels.en;
  };

  // Filter to only public modules that should show in footer
  const footerLinks = enabledModules
    .filter((m) => m.isPublic && m.showInFooter)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((m) => ({
      id: m.id,
      path: getModulePath(m),
      label: getModuleLabel(m),
    }));

  const hasFooterLinks = footerLinks.length > 0;

  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {hasFooterLinks ? (
          // Enhanced footer with links
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand column */}
            <div className="space-y-2">
              <span className="font-medium text-lg">{app.name}</span>
              {app.tagline && (
                <p className="text-sm text-muted-foreground">{app.tagline}</p>
              )}
            </div>

            {/* Links column */}
            <div className="space-y-2">
              <span className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                {locale === 'es' ? 'Enlaces' : 'Links'}
              </span>
              <nav className="flex flex-col gap-1">
                {footerLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={`${basePath}${link.path}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Legal/Credit column */}
            <div className="space-y-2 md:text-right">
              <span className="text-sm text-muted-foreground">
                © {currentYear} {app.ownerName || app.name}
              </span>
              <p>
                <Link
                  href="https://modulary.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'es' ? 'Creado con Modulary' : 'Built with Modulary'}
                </Link>
              </p>
            </div>
          </div>
        ) : (
          // Simple footer (no links)
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">{app.name}</span>
              {app.tagline && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">{app.tagline}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© {currentYear} {app.ownerName || app.name}</span>
              <span>·</span>
              <Link
                href="https://modulary.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {locale === 'es' ? 'Creado con Modulary' : 'Built with Modulary'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
