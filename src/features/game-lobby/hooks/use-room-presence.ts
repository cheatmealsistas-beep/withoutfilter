'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/shared/database/supabase/client';
import type { PlayerPresence, Player } from '../types';

interface UseRoomPresenceOptions {
  roomCode: string;
  currentPlayer: {
    id: string;
    displayName: string;
    avatar: string;
    isHost: boolean;
  };
  onPlayerJoin?: (player: PlayerPresence) => void;
  onPlayerLeave?: (player: PlayerPresence) => void;
}

interface UseRoomPresenceReturn {
  players: PlayerPresence[];
  isConnected: boolean;
  error: string | null;
  updatePresence: (updates: Partial<PlayerPresence>) => Promise<void>;
}

export function useRoomPresence({
  roomCode,
  currentPlayer,
  onPlayerJoin,
  onPlayerLeave,
}: UseRoomPresenceOptions): UseRoomPresenceReturn {
  const [players, setPlayers] = useState<PlayerPresence[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<ReturnType<
    ReturnType<typeof createClient>['channel']
  > | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channelName = `room:${roomCode}`;

    const newChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: currentPlayer.id,
        },
      },
    });

    newChannel
      .on('presence', { event: 'sync' }, () => {
        const state = newChannel.presenceState<PlayerPresence>();
        const playerList: PlayerPresence[] = [];

        Object.keys(state).forEach((key) => {
          const presences = state[key];
          if (presences && presences.length > 0) {
            playerList.push(presences[0]);
          }
        });

        setPlayers(playerList);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        if (onPlayerJoin && newPresences.length > 0) {
          onPlayerJoin(newPresences[0] as unknown as PlayerPresence);
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        if (onPlayerLeave && leftPresences.length > 0) {
          onPlayerLeave(leftPresences[0] as unknown as PlayerPresence);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);

          // Track our presence
          await newChannel.track({
            id: currentPlayer.id,
            displayName: currentPlayer.displayName,
            avatar: currentPlayer.avatar,
            isHost: currentPlayer.isHost,
            isReady: currentPlayer.isHost, // Host is auto-ready
            isConnected: true,
            lastSeen: Date.now(),
          });
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setError('Conexión perdida');
        }
      });

    setChannel(newChannel);

    return () => {
      newChannel.unsubscribe();
    };
  }, [
    roomCode,
    currentPlayer.id,
    currentPlayer.displayName,
    currentPlayer.avatar,
    currentPlayer.isHost,
    onPlayerJoin,
    onPlayerLeave,
  ]);

  const updatePresence = useCallback(
    async (updates: Partial<PlayerPresence>) => {
      if (!channel) return;

      const currentState = players.find((p) => p.id === currentPlayer.id);
      if (!currentState) return;

      await channel.track({
        ...currentState,
        ...updates,
        lastSeen: Date.now(),
      });
    },
    [channel, players, currentPlayer.id]
  );

  return {
    players,
    isConnected,
    error,
    updatePresence,
  };
}

/**
 * Hook to subscribe to real-time player updates from database
 */
export function usePlayersRealtime(roomId: string) {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('game_players')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error fetching players:', error);
        return;
      }

      if (data) {
        setPlayers(data as Player[]);
      }
    };

    fetchPlayers();

    // Subscribe to changes
    const channel = supabase
      .channel(`players:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('[usePlayersRealtime] event:', payload.eventType, payload);
          if (payload.eventType === 'INSERT') {
            setPlayers((prev) => [...prev, payload.new as Player]);
          } else if (payload.eventType === 'UPDATE') {
            setPlayers((prev) =>
              prev.map((p) =>
                p.id === payload.new.id ? (payload.new as Player) : p
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setPlayers((prev) =>
              prev.filter((p) => p.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('[usePlayersRealtime] subscription status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, [roomId]);

  return players;
}

type RoomStatus = 'waiting' | 'playing' | 'paused' | 'finished' | 'abandoned';

interface UseLobbyRealtimeOptions {
  roomId: string;
  roomCode: string;
  locale: string;
  onGameStart?: () => void;
}

interface UseLobbyRealtimeReturn {
  players: Player[];
  roomStatus: RoomStatus;
  isConnected: boolean;
}

/**
 * Unified hook for lobby realtime - subscribes to both players AND room status
 * This prevents multiple subscriptions and ensures game start is detected
 */
export function useLobbyRealtime({
  roomId,
  roomCode,
  locale,
  onGameStart,
}: UseLobbyRealtimeOptions): UseLobbyRealtimeReturn {
  const [players, setPlayers] = useState<Player[]>([]);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('waiting');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch for players
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('game_players')
        .select('*')
        .eq('room_id', roomId)
        .order('joined_at', { ascending: true });

      if (!error && data) {
        setPlayers(data as Player[]);
      }
    };

    // Initial fetch for room status
    const fetchRoomStatus = async () => {
      const { data, error } = await supabase
        .from('game_rooms')
        .select('status')
        .eq('id', roomId)
        .single();

      if (!error && data) {
        setRoomStatus(data.status as RoomStatus);
      }
    };

    fetchPlayers();
    fetchRoomStatus();

    // Single channel for all lobby subscriptions
    const channel = supabase
      .channel(`lobby:${roomId}`)
      // Subscribe to player changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('[useLobbyRealtime] players event:', payload.eventType);
          if (payload.eventType === 'INSERT') {
            setPlayers((prev) => {
              // Avoid duplicates
              if (prev.some((p) => p.id === (payload.new as Player).id)) {
                return prev;
              }
              return [...prev, payload.new as Player];
            });
          } else if (payload.eventType === 'UPDATE') {
            setPlayers((prev) =>
              prev.map((p) =>
                p.id === payload.new.id ? (payload.new as Player) : p
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setPlayers((prev) =>
              prev.filter((p) => p.id !== payload.old.id)
            );
          }
        }
      )
      // Subscribe to room status changes (for game start detection)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          console.log('[useLobbyRealtime] room event:', payload);
          const newStatus = (payload.new as { status: RoomStatus }).status;
          setRoomStatus(newStatus);

          // Auto-redirect when game starts
          if (newStatus === 'playing' && onGameStart) {
            console.log('[useLobbyRealtime] Game started! Triggering redirect...');
            onGameStart();
          }
        }
      )
      .subscribe((status) => {
        console.log('[useLobbyRealtime] subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('[useLobbyRealtime] Cleaning up subscription');
      channel.unsubscribe();
    };
  }, [roomId, roomCode, locale, onGameStart]);

  return { players, roomStatus, isConnected };
}
