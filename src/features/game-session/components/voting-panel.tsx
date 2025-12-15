'use client';

import { useState } from 'react';
import type { PlayerInGame } from '../types';

type VotingPanelProps = {
  players: PlayerInGame[];
  currentPlayerId: string;
  onVote: (targetPlayerId: string) => void;
  hasVoted: boolean;
  votes: Record<string, string>;
  showResults?: boolean;
  isChallenge?: boolean;
};

export function VotingPanel({
  players,
  currentPlayerId,
  onVote,
  hasVoted,
  votes,
  showResults = false,
  isChallenge = false,
}: VotingPanelProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For challenges, show "Completed" / "Not completed" options
  if (isChallenge) {
    const completedVotes = Object.values(votes).filter((v) => v === 'completed').length;
    const notCompletedVotes = Object.values(votes).filter((v) => v === 'not_completed').length;
    const totalVotes = completedVotes + notCompletedVotes;

    return (
      <div className="w-full max-w-md mx-auto space-y-4">
        <p className="text-center text-muted-foreground mb-4">
          ¿El jugador completó el reto?
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              if (!hasVoted) {
                setIsSubmitting(true);
                onVote('completed');
              }
            }}
            disabled={hasVoted || isSubmitting}
            className={`p-6 rounded-xl border-2 transition-all ${
              hasVoted && votes[currentPlayerId] === 'completed'
                ? 'border-green-500 bg-green-500/20'
                : hasVoted
                ? 'border-muted opacity-50'
                : 'border-muted hover:border-green-500 hover:bg-green-500/10'
            }`}
          >
            <div className="text-4xl mb-2">✅</div>
            <div className="font-medium">Completado</div>
            {showResults && (
              <div className="text-sm text-muted-foreground mt-1">
                {completedVotes} votos
              </div>
            )}
          </button>

          <button
            onClick={() => {
              if (!hasVoted) {
                setIsSubmitting(true);
                onVote('not_completed');
              }
            }}
            disabled={hasVoted || isSubmitting}
            className={`p-6 rounded-xl border-2 transition-all ${
              hasVoted && votes[currentPlayerId] === 'not_completed'
                ? 'border-red-500 bg-red-500/20'
                : hasVoted
                ? 'border-muted opacity-50'
                : 'border-muted hover:border-red-500 hover:bg-red-500/10'
            }`}
          >
            <div className="text-4xl mb-2">❌</div>
            <div className="font-medium">No completado</div>
            {showResults && (
              <div className="text-sm text-muted-foreground mt-1">
                {notCompletedVotes} votos
              </div>
            )}
          </button>
        </div>

        {hasVoted && (
          <p className="text-center text-sm text-muted-foreground">
            ¡Voto registrado! Esperando a los demás...
          </p>
        )}
      </div>
    );
  }

  // Regular group vote - select a player
  const votablePlayers = players.filter((p) => p.id !== currentPlayerId);

  // Count votes per player for results
  const voteCount: Record<string, number> = {};
  for (const targetId of Object.values(votes)) {
    voteCount[targetId] = (voteCount[targetId] || 0) + 1;
  }

  const handleSubmit = () => {
    if (selectedPlayer && !hasVoted) {
      setIsSubmitting(true);
      onVote(selectedPlayer);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <p className="text-center text-muted-foreground mb-4">
        Selecciona a un jugador
      </p>

      <div className="grid grid-cols-2 gap-3">
        {votablePlayers.map((player) => (
          <button
            key={player.id}
            onClick={() => !hasVoted && setSelectedPlayer(player.id)}
            disabled={hasVoted || isSubmitting}
            className={`p-4 rounded-xl border-2 transition-all ${
              hasVoted && votes[currentPlayerId] === player.id
                ? 'border-primary bg-primary/20'
                : selectedPlayer === player.id
                ? 'border-primary bg-primary/10'
                : hasVoted
                ? 'border-muted opacity-50'
                : 'border-muted hover:border-primary/50'
            }`}
          >
            <div className="text-3xl mb-1">{player.avatar_emoji}</div>
            <div className="font-medium text-sm truncate">{player.display_name}</div>
            {showResults && voteCount[player.id] && (
              <div className="text-xs text-primary mt-1">
                {voteCount[player.id]} voto{voteCount[player.id] > 1 ? 's' : ''}
              </div>
            )}
          </button>
        ))}
      </div>

      {!hasVoted && selectedPlayer && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Enviando...' : 'Confirmar voto'}
        </button>
      )}

      {hasVoted && (
        <p className="text-center text-sm text-muted-foreground">
          ¡Voto registrado! Esperando a los demás...
        </p>
      )}
    </div>
  );
}
