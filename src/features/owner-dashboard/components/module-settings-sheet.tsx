'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Settings2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/shared/components/ui/sheet';
import { updateModuleSettingsAction } from '../owner-dashboard.actions';

interface ModuleSettingsSheetProps {
  slug: string;
  moduleType: string;
  moduleLabel: string;
  currentSettings: {
    customLabel: string | null;
    showInNavbar: boolean;
    showInFooter: boolean;
  };
}

export function ModuleSettingsSheet({
  slug,
  moduleType,
  moduleLabel,
  currentSettings,
}: ModuleSettingsSheetProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [customLabel, setCustomLabel] = useState(currentSettings.customLabel || '');
  const [showInNavbar, setShowInNavbar] = useState(currentSettings.showInNavbar);
  const [showInFooter, setShowInFooter] = useState(currentSettings.showInFooter);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateModuleSettingsAction(slug, moduleType, {
        customLabel: customLabel.trim() || null,
        showInNavbar,
        showInFooter,
      });

      if (result.success) {
        toast.success('Configuración guardada');
        setOpen(false);
      } else {
        toast.error(result.error || 'Error al guardar');
      }
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Reset to current values when opening
    if (isOpen) {
      setCustomLabel(currentSettings.customLabel || '');
      setShowInNavbar(currentSettings.showInNavbar);
      setShowInFooter(currentSettings.showInFooter);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Configurar {moduleLabel}</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Configurar {moduleLabel}</SheetTitle>
          <SheetDescription>
            Personaliza cómo aparece este módulo en tu web
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Custom Label */}
          <div className="space-y-2">
            <Label htmlFor="custom-label">Nombre personalizado</Label>
            <Input
              id="custom-label"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder={moduleLabel}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              Deja vacío para usar el nombre por defecto
            </p>
          </div>

          {/* Show in Navbar */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-navbar">Mostrar en navbar</Label>
              <p className="text-xs text-muted-foreground">
                Aparecerá en el menú de navegación
              </p>
            </div>
            <Switch
              id="show-navbar"
              checked={showInNavbar}
              onCheckedChange={setShowInNavbar}
            />
          </div>

          {/* Show in Footer */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-footer">Mostrar en footer</Label>
              <p className="text-xs text-muted-foreground">
                Aparecerá en los enlaces del pie de página
              </p>
            </div>
            <Switch
              id="show-footer"
              checked={showInFooter}
              onCheckedChange={setShowInFooter}
            />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
