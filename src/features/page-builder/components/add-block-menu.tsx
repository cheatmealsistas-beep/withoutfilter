'use client';

import { Plus, Sparkles, Briefcase, MessageSquareQuote, CreditCard, HelpCircle, Megaphone, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import type { BlockType } from '../types';

interface AddBlockMenuProps {
  onSelect: (type: BlockType) => void;
  disabled?: boolean;
}

const blockOptions: { type: BlockType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    type: 'hero',
    label: 'Hero',
    description: 'Sección principal con título y CTA',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    type: 'services',
    label: 'Servicios',
    description: 'Grid de servicios que ofreces',
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    type: 'testimonials',
    label: 'Testimonios',
    description: 'Opiniones de tus clientes',
    icon: <MessageSquareQuote className="h-4 w-4" />,
  },
  {
    type: 'pricing',
    label: 'Precios',
    description: 'Tabla de tarifas',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    type: 'faqs',
    label: 'FAQs',
    description: 'Preguntas frecuentes',
    icon: <HelpCircle className="h-4 w-4" />,
  },
  {
    type: 'cta',
    label: 'CTA',
    description: 'Banner con llamada a la acción',
    icon: <Megaphone className="h-4 w-4" />,
  },
  {
    type: 'content',
    label: 'Contenido',
    description: 'Texto con imagen',
    icon: <FileText className="h-4 w-4" />,
  },
];

export function AddBlockMenu({ onSelect, disabled }: AddBlockMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full gap-2" disabled={disabled}>
          <Plus className="h-4 w-4" />
          Añadir bloque
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {blockOptions.map((option) => (
          <DropdownMenuItem
            key={option.type}
            onClick={() => onSelect(option.type)}
            className="flex items-start gap-3 py-2.5 cursor-pointer"
          >
            <div className="mt-0.5 text-muted-foreground">{option.icon}</div>
            <div>
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
