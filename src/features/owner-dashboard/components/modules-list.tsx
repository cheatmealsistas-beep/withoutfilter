'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  Home,
  User,
  Briefcase,
  MessageSquareQuote,
  FileText,
  Mail,
  FolderOpen,
  GripVertical,
  Globe,
  Lock,
  Pencil,
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { toggleModuleAction } from '../owner-dashboard.actions';
import { isEditableModule } from '@/features/page-builder';

// Module configuration with icons and labels
const moduleConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    description: string;
    canDisable: boolean;
  }
> = {
  home: {
    icon: Home,
    label: 'Inicio',
    description: 'Página principal con hero y bloques',
    canDisable: false, // Home cannot be disabled
  },
  about: {
    icon: User,
    label: 'Sobre mí',
    description: 'Información personal o de tu negocio',
    canDisable: true,
  },
  services: {
    icon: Briefcase,
    label: 'Servicios',
    description: 'Lista de servicios que ofreces',
    canDisable: true,
  },
  testimonials: {
    icon: MessageSquareQuote,
    label: 'Testimonios',
    description: 'Opiniones de tus clientes',
    canDisable: true,
  },
  blog: {
    icon: FileText,
    label: 'Blog',
    description: 'Artículos y publicaciones',
    canDisable: true,
  },
  contact: {
    icon: Mail,
    label: 'Contacto',
    description: 'Formulario de contacto',
    canDisable: true,
  },
  // courses: Se gestiona en su propia sección del menú
  resources: {
    icon: FolderOpen,
    label: 'Recursos',
    description: 'Descargas y materiales',
    canDisable: true,
  },
};

interface Module {
  id: string;
  type: string;
  isEnabled: boolean;
  isPublic?: boolean;
  displayOrder: number;
}

interface ModulesListProps {
  modules: Module[];
  slug: string;
}

export function ModulesList({ modules, slug }: ModulesListProps) {
  const params = useParams();
  const locale = params.locale as string;
  const [isPending, startTransition] = useTransition();
  const [optimisticModules, setOptimisticModules] = useState(modules);

  // Sort modules by display order and filter out courses (has its own section)
  const sortedModules = [...optimisticModules]
    .filter((m) => m.type !== 'courses')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const handleToggle = (moduleType: string, currentEnabled: boolean) => {
    const config = moduleConfig[moduleType];
    if (!config?.canDisable && currentEnabled) {
      toast.error('El módulo de inicio no se puede desactivar');
      return;
    }

    const newEnabled = !currentEnabled;

    // Optimistic update
    setOptimisticModules((prev) =>
      prev.map((m) => (m.type === moduleType ? { ...m, isEnabled: newEnabled } : m))
    );

    startTransition(async () => {
      const result = await toggleModuleAction(slug, moduleType, newEnabled);

      if (!result.success) {
        // Revert optimistic update
        setOptimisticModules((prev) =>
          prev.map((m) =>
            m.type === moduleType ? { ...m, isEnabled: currentEnabled } : m
          )
        );
        toast.error(result.error || 'Error al actualizar el módulo');
      } else {
        toast.success(
          newEnabled
            ? `${config?.label || moduleType} activado`
            : `${config?.label || moduleType} desactivado`
        );
      }
    });
  };

  return (
    <div className="space-y-3">
      {sortedModules.map((module) => {
        const config = moduleConfig[module.type];
        if (!config) return null;

        const Icon = config.icon;
        const isDisabled = isPending || (!config.canDisable && module.isEnabled);

        return (
          <Card
            key={module.id}
            className={`transition-all ${
              module.isEnabled
                ? 'border-primary/50 bg-primary/5'
                : 'border-muted bg-muted/30 opacity-60'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Drag handle (future: implement drag-to-reorder) */}
                <div className="text-muted-foreground/50 cursor-grab">
                  <GripVertical className="h-5 w-5" />
                </div>

                {/* Icon */}
                <div
                  className={`p-2 rounded-lg ${
                    module.isEnabled ? 'bg-primary/10' : 'bg-muted'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      module.isEnabled ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{config.label}</h3>
                    {module.isEnabled && (
                      <Badge
                        variant="outline"
                        className="text-xs gap-1"
                      >
                        {module.isPublic !== false ? (
                          <>
                            <Globe className="h-3 w-3" />
                            Público
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3" />
                            Privado
                          </>
                        )}
                      </Badge>
                    )}
                    {!config.canDisable && (
                      <Badge variant="secondary" className="text-xs">
                        Requerido
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {config.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Edit button - only for editable modules when enabled */}
                  {module.isEnabled && isEditableModule(module.type) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 px-2"
                    >
                      <Link href={`/${locale}/app/${slug}/admin/edit/${module.type}`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar {config.label}</span>
                      </Link>
                    </Button>
                  )}

                  {/* Toggle switch */}
                  <Switch
                    checked={module.isEnabled}
                    onCheckedChange={() => handleToggle(module.type, module.isEnabled)}
                    disabled={isDisabled}
                    aria-label={`${module.isEnabled ? 'Desactivar' : 'Activar'} ${config.label}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
