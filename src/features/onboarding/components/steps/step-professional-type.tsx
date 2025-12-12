'use client';

import { useState } from 'react';
import { saveStep1Action } from '../../onboarding.actions';
import { toast } from 'sonner';
import type { ProfessionalType } from '../../types';
import { cn } from '@/shared/lib/utils';

interface StepProfessionalTypeProps {
  onComplete: () => void;
}

const professionalTypes: Array<{
  id: ProfessionalType;
  label: string;
  icon: string;
  description: string;
}> = [
  {
    id: 'coach',
    label: 'Coach',
    icon: '🎯',
    description: 'Coaching personal o profesional',
  },
  {
    id: 'therapist',
    label: 'Terapeuta',
    icon: '💆',
    description: 'Terapia y bienestar emocional',
  },
  {
    id: 'trainer',
    label: 'Formador',
    icon: '📚',
    description: 'Cursos y formación online',
  },
  {
    id: 'content_creator',
    label: 'Creador',
    icon: '🎬',
    description: 'Contenido digital y cursos',
  },
  {
    id: 'mentor',
    label: 'Mentor',
    icon: '🧭',
    description: 'Mentoría y asesoramiento',
  },
  {
    id: 'other',
    label: 'Otro',
    icon: '✨',
    description: 'Otro tipo de profesional',
  },
];

export function StepProfessionalType({ onComplete }: StepProfessionalTypeProps) {
  const [pending, setPending] = useState(false);
  const [selected, setSelected] = useState<ProfessionalType | null>(null);

  const handleSelect = async (type: ProfessionalType) => {
    setSelected(type);
    setPending(true);

    try {
      const result = await saveStep1Action(type);

      if (result.success) {
        onComplete();
      } else {
        toast.error(result.error ?? 'Error al guardar');
        setSelected(null);
      }
    } catch {
      toast.error('Error inesperado');
      setSelected(null);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">¿A qué te dedicas?</h1>
        <p className="text-muted-foreground">
          Esto nos ayuda a personalizar tu experiencia.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {professionalTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => handleSelect(type.id)}
            disabled={pending}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
              'hover:border-primary hover:bg-primary/5',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              selected === type.id
                ? 'border-primary bg-primary/10'
                : 'border-muted'
            )}
            aria-pressed={selected === type.id}
          >
            <span className="text-3xl" aria-hidden="true">
              {type.icon}
            </span>
            <span className="font-medium">{type.label}</span>
            <span className="text-xs text-muted-foreground text-center">
              {type.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
