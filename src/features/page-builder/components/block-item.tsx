'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Sparkles,
  Briefcase,
  MessageSquareQuote,
  CreditCard,
  HelpCircle,
  Megaphone,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { cn } from '@/shared/lib/utils';
import type { PageBlock, BlockType } from '../types';

interface BlockItemProps {
  block: PageBlock;
  isFirst: boolean;
  isLast: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  children: React.ReactNode;
}

const blockIcons: Record<BlockType, React.ReactNode> = {
  hero: <Sparkles className="h-4 w-4" />,
  services: <Briefcase className="h-4 w-4" />,
  testimonials: <MessageSquareQuote className="h-4 w-4" />,
  pricing: <CreditCard className="h-4 w-4" />,
  faqs: <HelpCircle className="h-4 w-4" />,
  cta: <Megaphone className="h-4 w-4" />,
};

const blockLabels: Record<BlockType, string> = {
  hero: 'Hero',
  services: 'Servicios',
  testimonials: 'Testimonios',
  pricing: 'Precios',
  faqs: 'FAQs',
  cta: 'CTA',
};

export function BlockItem({
  block,
  isFirst,
  isLast,
  isExpanded,
  onToggleExpand,
  onMoveUp,
  onMoveDown,
  onDelete,
  onToggleVisibility,
  children,
}: BlockItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <Card className={cn('transition-all', !block.isVisible && 'opacity-60')}>
      <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
        <CardHeader className="p-3">
          <div className="flex items-center gap-2">
            {/* Drag handle placeholder */}
            <div className="text-muted-foreground/40 cursor-grab">
              <GripVertical className="h-4 w-4" />
            </div>

            {/* Block icon and label */}
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 flex-1 text-left hover:text-primary transition-colors">
                <span className="text-muted-foreground">{blockIcons[block.type]}</span>
                <span className="font-medium text-sm">{blockLabels[block.type]}</span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
                )}
              </button>
            </CollapsibleTrigger>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Visibility toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onToggleVisibility}
                title={block.isVisible ? 'Ocultar bloque' : 'Mostrar bloque'}
              >
                {block.isVisible ? (
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </Button>

              {/* Move up */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMoveUp}
                disabled={isFirst}
                title="Mover arriba"
              >
                <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>

              {/* Move down */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMoveDown}
                disabled={isLast}
                title="Mover abajo"
              >
                <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>

              {/* Delete */}
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:text-destructive"
                    title="Eliminar bloque"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar bloque?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. El bloque {blockLabels[block.type]} será
                      eliminado permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onDelete();
                        setShowDeleteDialog(false);
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 px-3 pb-3">{children}</CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
