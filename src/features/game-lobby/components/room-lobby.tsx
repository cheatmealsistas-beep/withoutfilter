'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import { PlayerListWithPlayers } from './player-list';
import { RoomConfig } from './room-config';
import { ShareRoom } from './share-room';
import {
  toggleReadyAction,
  leaveRoomAction,
  kickPlayerAction,
  updateConfigAction,
} from '../game-lobby.actions';
import { startGameAction } from '@/features/game-session/game-session.actions';
import { useLobbyRealtime } from '../hooks/use-room-presence';
import type { Room, Player, RoomConfig as RoomConfigType } from '../types';
import { brand } from '@/shared/config/brand';

interface RoomLobbyProps {
  room: Room;
  currentPlayer: Player;
}

export function RoomLobby({ room, currentPlayer }: RoomLobbyProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  // Callback for when game starts (triggered by realtime)
  const handleGameStart = useCallback(() => {
    router.push(`/${locale}/game/${room.code}/play`);
  }, [router, locale, room.code]);

  // Unified realtime hook - subscribes to both players AND room status
  const { players, roomStatus } = useLobbyRealtime({
    roomId: room.id,
    roomCode: room.code,
    locale,
    onGameStart: handleGameStart,
  });

  const isHost = currentPlayer.is_host;
  const allReady = players.length > 0 && players.every((p) => p.is_ready);
  const enoughPlayers = players.length >= room.config.minPlayers;
  const canStart = isHost && allReady && enoughPlayers;

  // Handle ready toggle
  const handleToggleReady = async () => {
    setIsUpdating(true);
    const formData = new FormData();
    formData.append('playerId', currentPlayer.id);
    formData.append('roomCode', room.code);
    formData.append('locale', locale);
    await toggleReadyAction(formData);
    setIsUpdating(false);
  };

  // Handle leave room
  const handleLeave = async () => {
    const formData = new FormData();
    formData.append('playerId', currentPlayer.id);
    formData.append('roomCode', room.code);
    formData.append('locale', locale);
    await leaveRoomAction(formData);
  };

  // Handle kick player
  const handleKickPlayer = async (targetPlayerId: string) => {
    const formData = new FormData();
    formData.append('hostPlayerId', currentPlayer.id);
    formData.append('targetPlayerId', targetPlayerId);
    formData.append('roomCode', room.code);
    formData.append('locale', locale);
    await kickPlayerAction(formData);
  };

  // Handle config update
  const handleConfigUpdate = async (config: Partial<RoomConfigType>) => {
    const formData = new FormData();
    formData.append('playerId', currentPlayer.id);
    formData.append('roomCode', room.code);
    formData.append('locale', locale);

    if (config.categories) {
      config.categories.forEach((cat) => {
        formData.append('categories', cat);
      });
    }
    if (config.roundsPerGame) {
      formData.append('roundsPerGame', config.roundsPerGame.toString());
    }
    if (config.timePerRound) {
      formData.append('timePerRound', config.timePerRound.toString());
    }

    await updateConfigAction(formData);
  };

  // Handle start game
  const handleStartGame = async () => {
    setIsStarting(true);
    setStartError(null);

    const formData = new FormData();
    formData.append('roomId', room.id);
    formData.append('playerId', currentPlayer.id);
    formData.append('roomCode', room.code);
    formData.append('locale', locale);

    const result = await startGameAction(formData);

    if (!result.success) {
      setStartError(result.error || 'Error al iniciar la partida');
      setIsStarting(false);
      return;
    }

    // Redirect to play page
    router.push(`/${locale}/game/${room.code}/play`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{brand.name}</h1>
          <p className="text-muted-foreground">Sala de espera</p>
        </div>

        {/* Room Code + Share */}
        <ShareRoom code={room.code} />

        {/* Players */}
        <div className="bg-card rounded-xl p-4 border">
          <PlayerListWithPlayers
            players={players}
            currentPlayerId={currentPlayer.id}
            isHost={isHost}
            onKickPlayer={isHost ? handleKickPlayer : undefined}
          />
        </div>

        {/* Config (Host only) */}
        {isHost && (
          <div className="bg-card rounded-xl p-4 border">
            <RoomConfig
              config={room.config}
              onChange={handleConfigUpdate}
              disabled={room.status !== 'waiting'}
            />
          </div>
        )}

        {/* Status Messages */}
        <div className="text-center space-y-2">
          {!enoughPlayers && (
            <p className="text-sm text-muted-foreground">
              Necesitas al menos {room.config.minPlayers} jugadores para empezar
            </p>
          )}
          {enoughPlayers && !allReady && (
            <p className="text-sm text-muted-foreground">
              Esperando a que todos estén listos...
            </p>
          )}
          {canStart && (
            <p className="text-sm text-green-600 font-medium">
              ¡Todos listos! Puedes empezar la partida
            </p>
          )}
          {startError && (
            <p className="text-sm text-red-600 font-medium">
              {startError}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Ready / Start Button */}
          {isHost ? (
            <Button
              onClick={handleStartGame}
              size="lg"
              className="w-full text-lg"
              disabled={!canStart || isStarting}
            >
              {isStarting ? 'Iniciando...' : canStart ? 'Empezar Partida' : 'Esperando jugadores...'}
            </Button>
          ) : (
            <Button
              onClick={handleToggleReady}
              size="lg"
              className="w-full text-lg"
              variant={currentPlayer.is_ready ? 'outline' : 'default'}
              disabled={isUpdating}
            >
              {currentPlayer.is_ready ? 'Cancelar listo' : 'Estoy listo'}
            </Button>
          )}

          {/* Leave Button */}
          <Button
            onClick={handleLeave}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Salir de la sala
          </Button>
        </div>
      </div>
    </div>
  );
}
