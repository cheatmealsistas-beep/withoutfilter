'use client';

import type { PlayerInGame } from '../types';

type PlayerScoresProps = {
  players: PlayerInGame[];
  currentPlayerId: string;
  hotSeatPlayerId?: string | null;
  compact?: boolean;
};

export function PlayerScores({
  players,
  currentPlayerId,
  hotSeatPlayerId,
  compact = false,
}: PlayerScoresProps) {
  // Sort by score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  if (compact) {
    return (
      <div className="flex flex-wrap justify-center gap-3">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
              player.id === currentPlayerId
                ? 'border-primary bg-primary/10'
                : player.id === hotSeatPlayerId
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-muted'
            }`}
          >
            {index === 0 && <span className="text-yellow-500">👑</span>}
            <span>{player.avatar_emoji}</span>
            <span className="font-medium text-sm">{player.display_name}</span>
            <span className="text-sm text-muted-foreground">{player.score}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-center">Puntuaciones</h3>

      <div className="space-y-2">
        {sortedPlayers.map((player, index) => {
          const isLeader = index === 0 && player.score > 0;
          const isCurrentPlayer = player.id === currentPlayerId;
          const isHotSeat = player.id === hotSeatPlayerId;

          return (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                isCurrentPlayer
                  ? 'border-primary bg-primary/10'
                  : isHotSeat
                  ? 'border-yellow-500/50 bg-yellow-500/10'
                  : 'border-muted'
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center font-bold text-muted-foreground">
                {isLeader ? '👑' : `#${index + 1}`}
              </div>

              {/* Avatar */}
              <div className="text-2xl">{player.avatar_emoji}</div>

              {/* Name */}
              <div className="flex-1">
                <div className="font-medium">
                  {player.display_name}
                  {isCurrentPlayer && (
                    <span className="text-xs text-primary ml-2">(tú)</span>
                  )}
                  {isHotSeat && (
                    <span className="text-xs text-yellow-500 ml-2">🎯</span>
                  )}
                </div>
                {!player.is_connected && (
                  <div className="text-xs text-muted-foreground">Desconectado</div>
                )}
              </div>

              {/* Score */}
              <div className="font-bold text-lg tabular-nums">
                {player.score}
                <span className="text-xs text-muted-foreground ml-1">pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
