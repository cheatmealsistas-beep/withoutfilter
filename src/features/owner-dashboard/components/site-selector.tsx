'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Check, ChevronDown, Copy, Plus, ExternalLink } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

interface SiteSelectorProps {
  currentOrg: Organization;
  organizations: Organization[];
}

export function SiteSelector({ currentOrg, organizations }: SiteSelectorProps) {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [open, setOpen] = useState(false);

  const publicUrl = `modulary.app/${currentOrg.slug}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`https://${publicUrl}`);
    toast.success('URL copiada');
  };

  const handleSwitchOrg = (slug: string) => {
    setOpen(false);
    router.push(`/${locale}/app/${slug}/admin`);
  };

  return (
    <div className="px-3 py-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-auto py-2 px-3 hover:bg-primary/10"
          >
            <div className="flex items-center gap-3 min-w-0">
              {currentOrg.logoUrl ? (
                <img
                  src={currentOrg.logoUrl}
                  alt={currentOrg.name}
                  className="h-8 w-8 rounded-md object-cover shrink-0"
                />
              ) : (
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {currentOrg.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="text-left min-w-0">
                <p className="font-medium text-sm truncate">{currentOrg.name}</p>
                <p className="text-xs text-muted-foreground truncate">{publicUrl}</p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-[280px]">
          {/* Current site actions */}
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Sitio actual
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={handleCopyUrl}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar URL
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                asChild
              >
                <Link
                  href={`/${locale}/app/${currentOrg.slug}`}
                  target="_blank"
                >
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Site list */}
          <div className="max-h-[200px] overflow-y-auto">
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                className={cn(
                  'flex items-center gap-3 py-2 cursor-pointer',
                  org.slug === currentOrg.slug && 'bg-primary/5'
                )}
                onClick={() => handleSwitchOrg(org.slug)}
              >
                {org.logoUrl ? (
                  <img
                    src={org.logoUrl}
                    alt={org.name}
                    className="h-7 w-7 rounded-md object-cover shrink-0"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium">
                      {org.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{org.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    modulary.app/{org.slug}
                  </p>
                </div>
                {org.slug === currentOrg.slug && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator />

          {/* Create new site */}
          <DropdownMenuItem asChild>
            <Link
              href={`/${locale}/onboarding`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Crear nuevo sitio</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
