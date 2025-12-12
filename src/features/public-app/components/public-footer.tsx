import Link from 'next/link';
import type { PublicApp } from '../types';

interface PublicFooterProps {
  app: PublicApp;
}

export function PublicFooter({ app }: PublicFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
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
              Creado con Modulary
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
