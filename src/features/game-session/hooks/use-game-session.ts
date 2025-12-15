'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient as createClientBrowser } from '@/shared/database/supabase/client';
import type { GameState, GameSession } from '../types';

type UseGameSessionOptions = {
  roomId: string;
  playerId: string;
  initialState: GameState | null;
};

export function useGameSession({
  roomId,
  playerId,
  initialState,
}: UseGameSessionOptions) {
  const [gameState, setGameState] = useState<GameState | null>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to game session changes
  useEffect(() => {
    const supabase = createClientBrowser();

    const channel = supabase
      .channel(`game-session:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_sessions',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.new) {
            const session = payload.new as GameSession;

            setGameState((prev) => {
              if (!prev) return prev;

              const answers = session.round_answers as Record<string, { answer: string }>;
              const votes = session.round_votes as Record<string, string>;

              // Calculate time remaining
              let timeRemaining = 0;
              if (session.round_ends_at) {
                const endsAt = new Date(session.round_ends_at).getTime();
                const now = Date.now();
                timeRemaining = Math.max(0, Math.floor((endsAt - now) / 1000));
              }

              return {
                ...prev,
                currentRound: session.current_round,
                phase: session.phase || 'showing_question',
                content: session.current_content,
                timeRemaining,
                answers: Object.fromEntries(
                  Object.entries(answers || {}).map(([k, v]) => [k, v.answer])
                ),
                votes: votes || {},
                hasAnswered: !!(answers && answers[playerId]),
                hasVoted: !!(votes && votes[playerId]),
              };
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_players',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          // Refresh players on score updates
          refreshPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, playerId]);

  // Refresh player scores
  const refreshPlayers = useCallback(async () => {
    const supabase = createClientBrowser();

    const { data } = await supabase
      .from('game_players')
      .select('id, display_name, avatar_emoji, score, is_host, is_connected')
      .eq('room_id', roomId)
      .order('score', { ascending: false });

    if (data) {
      setGameState((prev) => {
        if (!prev) return prev;

        const hotSeatPlayer = data.find(
          (p) => p.id === prev.hotSeatPlayer?.id
        ) || prev.hotSeatPlayer;

        return {
          ...prev,
          players: data,
          hotSeatPlayer,
        };
      });
    }
  }, [roomId]);

  // Refresh full game state
  const refreshGameState = useCallback(async () => {
    setIsLoading(true);

    try {
      const { getGameStateAction } = await import('../game-session.actions');
      const newState = await getGameStateAction(roomId, playerId);

      if (newState) {
        setGameState(newState);
      }
    } catch (error) {
      console.error('Error refreshing game state:', error);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, playerId]);

  return {
    gameState,
    isLoading,
    refreshGameState,
    refreshPlayers,
  };
}
