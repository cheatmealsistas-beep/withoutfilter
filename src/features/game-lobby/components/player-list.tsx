'use client';

import { usePlayersRealtime } from '../hooks/use-room-presence';
import type { Player } from '../types';

interface PlayerListProps {
  roomId: string;
  currentPlayerId: string;
  isHost: boolean;
  onKickPlayer?: (playerId: string) => void;
}

export function PlayerList({
  roomId,
  currentPlayerId,
  isHost,
  onKickPlayer,
}: PlayerListProps) {
  const players = usePlayersRealtime(roomId);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">
        Jugadores ({players.length})
      </h3>
      <div className="space-y-2">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isCurrentPlayer={player.id === currentPlayerId}
            canKick={isHost && !player.is_host && player.id !== currentPlayerId}
            onKick={() => onKickPlayer?.(player.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface PlayerCardProps {
  player: Player;
  isCurrentPlayer: boolean;
  canKick: boolean;
  onKick: () => void;
}

function PlayerCard({
  player,
  isCurrentPlayer,
  canKick,
  onKick,
}: PlayerCardProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        isCurrentPlayer
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card'
      } ${!player.is_connected ? 'opacity-50' : ''}`}
    >
      {/* Avatar */}
      <span className="text-3xl">{player.avatar_emoji}</span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{player.display_name}</span>
          {player.is_host && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Host
            </span>
          )}
          {isCurrentPlayer && (
            <span className="text-xs text-muted-foreground">(tú)</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          {player.is_connected ? (
            <span className="flex items-center gap-1 text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Conectado
            </span>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-muted-foreground" />
              Desconectado
            </span>
          )}
        </div>
      </div>

      {/* Ready Status */}
      <div className="flex items-center gap-2">
        {player.is_ready ? (
          <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
            Listo
          </span>
        ) : (
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            Esperando
          </span>
        )}

        {/* Kick Button */}
        {canKick && (
          <button
            onClick={onKick}
            className="text-sm text-destructive hover:text-destructive/80 p-1"
            title="Expulsar jugador"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

interface PlayerListSimpleProps {
  players: Player[];
  currentPlayerId?: string;
}

export function PlayerListSimple({
  players,
  currentPlayerId,
}: PlayerListSimpleProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {players.map((player) => (
        <div
          key={player.id}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            player.id === currentPlayerId
              ? 'bg-primary/10 border border-primary'
              : 'bg-muted'
          } ${!player.is_connected ? 'opacity-50' : ''}`}
        >
          <span className="text-lg">{player.avatar_emoji}</span>
          <span className="text-sm font-medium">{player.display_name}</span>
          {player.is_host && <span className="text-xs">👑</span>}
          {player.is_ready && (
            <span className="w-2 h-2 rounded-full bg-green-500" />
          )}
        </div>
      ))}
    </div>
  );
}
