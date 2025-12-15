'use client';

import type { GameContent, PlayerInGame } from '../types';

type QuestionCardProps = {
  content: GameContent;
  hotSeatPlayer?: PlayerInGame | null;
};

export function QuestionCard({ content, hotSeatPlayer }: QuestionCardProps) {
  const typeLabels = {
    question: 'Pregunta',
    group_vote: 'Votación',
    challenge: 'Reto',
    confession: 'Confesión',
    hot_seat: 'Hot Seat',
  };

  const typeColors = {
    question: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    group_vote: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    challenge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    confession: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    hot_seat: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const categoryColors = {
    suave: 'text-green-400',
    atrevida: 'text-yellow-400',
    sin_filtro: 'text-red-400',
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Hot seat player indicator */}
      {hotSeatPlayer && content.type !== 'group_vote' && (
        <div className="text-center mb-4">
          <span className="text-muted-foreground">Turno de</span>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-4xl">{hotSeatPlayer.avatar_emoji}</span>
            <span className="text-2xl font-bold">{hotSeatPlayer.display_name}</span>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl border bg-card p-8 shadow-xl">
        {/* Type badge */}
        <div className="flex items-center justify-between mb-6">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${
              typeColors[content.type]
            }`}
          >
            {typeLabels[content.type]}
          </span>
          <span className={`text-sm font-medium ${categoryColors[content.category]}`}>
            {content.category === 'suave'
              ? 'Suave'
              : content.category === 'atrevida'
              ? 'Atrevida'
              : 'Sin Filtro'}
          </span>
        </div>

        {/* Question text */}
        <p className="text-2xl md:text-3xl font-medium text-center leading-relaxed">
          {content.text_es}
        </p>

        {/* Instructions for challenges */}
        {content.type === 'challenge' && content.instructions && (
          <div className="mt-6 p-4 rounded-lg bg-muted/50 text-center">
            <p className="text-sm text-muted-foreground">
              {(content.instructions as { es?: string }).es || 'Completa el reto'}
            </p>
          </div>
        )}

        {/* Group vote indicator */}
        {content.type === 'group_vote' && (
          <p className="mt-6 text-center text-muted-foreground">
            Todos votan - ¿Quién del grupo?
          </p>
        )}

        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
