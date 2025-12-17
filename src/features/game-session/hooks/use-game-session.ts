'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
  const [isConnected, setIsConnected] = useState(false);

  // Use ref to track subscription state
  const channelRef = useRef<ReturnType<ReturnType<typeof createClientBrowser>['channel']> | null>(null);
  const lastEventTimeRef = useRef<number>(Date.now());
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Polling fallback for poor connections
  const pollGameState = useCallback(async () => {
    const supabase = createClientBrowser();
    const { data: session } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('room_id', roomId)
      .single();

    if (session) {
      setGameState((prev) => {
        if (!prev) return prev;

        const answers = session.round_answers as Record<string, { answer: string }> | null;
        const votes = session.round_votes as Record<string, string> | null;

        let timeRemaining = 0;
        if (session.round_ends_at) {
          const endsAt = new Date(session.round_ends_at).getTime();
          timeRemaining = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
        }

        const hotSeatPlayer = prev.players.find(
          (p) => p.id === session.current_player_id
        ) || prev.hotSeatPlayer;

        const parsedAnswers: Record<string, string> = {};
        if (answers) {
          for (const [k, v] of Object.entries(answers)) {
            if (typeof v === 'string') {
              parsedAnswers[k] = v;
            } else if (v && typeof v === 'object' && 'answer' in v) {
              parsedAnswers[k] = v.answer;
            }
          }
        }

        return {
          ...prev,
          currentRound: session.current_round,
          phase: session.phase || 'showing_question',
          content: session.current_content,
          hotSeatPlayer,
          timeRemaining,
          answers: parsedAnswers,
          votes: votes || {},
          hasAnswered: !!(answers && answers[playerId]),
          hasVoted: !!(votes && votes[playerId]),
        };
      });
    }
  }, [roomId, playerId]);

  // Subscribe to game session changes
  useEffect(() => {
    const supabase = createClientBrowser();
    console.log('[useGameSession] Setting up realtime for room:', roomId);

    // Clean up any existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Polling interval as fallback (every 5s if no realtime events)
    pollIntervalRef.current = setInterval(() => {
      const timeSinceLastEvent = Date.now() - lastEventTimeRef.current;
      // If no event in 5 seconds and not connected, poll
      if (timeSinceLastEvent > 5000 && !isConnected) {
        console.log('[useGameSession] No events, polling...');
        pollGameState();
      }
    }, 5000);

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
          console.log('[useGameSession] game_sessions event:', payload.eventType);
          lastEventTimeRef.current = Date.now(); // Track last event time
          if (payload.new) {
            const session = payload.new as GameSession;

            setGameState((prev) => {
              if (!prev) return prev;

              const answers = session.round_answers as Record<string, { answer: string }> | null;
              const votes = session.round_votes as Record<string, string> | null;

              // Calculate time remaining
              let timeRemaining = 0;
              if (session.round_ends_at) {
                const endsAt = new Date(session.round_ends_at).getTime();
                const now = Date.now();
                timeRemaining = Math.max(0, Math.floor((endsAt - now) / 1000));
              }

              // Find hot seat player from current players
              const hotSeatPlayer = prev.players.find(
                (p) => p.id === session.current_player_id
              ) || prev.hotSeatPlayer;

              // Parse answers correctly - handle both formats
              const parsedAnswers: Record<string, string> = {};
              if (answers) {
                for (const [k, v] of Object.entries(answers)) {
                  if (typeof v === 'string') {
                    parsedAnswers[k] = v;
                  } else if (v && typeof v === 'object' && 'answer' in v) {
                    parsedAnswers[k] = v.answer;
                  }
                }
              }

              const newState: GameState = {
                ...prev,
                currentRound: session.current_round,
                phase: session.phase || 'showing_question',
                content: session.current_content,
                hotSeatPlayer,
                timeRemaining,
                answers: parsedAnswers,
                votes: votes || {},
                hasAnswered: !!(answers && answers[playerId]),
                hasVoted: !!(votes && votes[playerId]),
              };

              console.log('[useGameSession] Updated state:', {
                phase: newState.phase,
                currentRound: newState.currentRound,
                answersCount: Object.keys(newState.answers).length,
                votesCount: Object.keys(newState.votes).length,
              });

              return newState;
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
        (payload) => {
          console.log('[useGameSession] game_players event:', payload.eventType);
          // Update specific player instead of full refresh
          if (payload.new) {
            const updatedPlayer = payload.new as {
              id: string;
              display_name: string;
              avatar_emoji: string;
              score: number;
              is_host: boolean;
              is_connected: boolean;
            };

            setGameState((prev) => {
              if (!prev) return prev;

              const updatedPlayers = prev.players.map((p) =>
                p.id === updatedPlayer.id ? { ...p, ...updatedPlayer } : p
              );

              // Sort by score descending
              updatedPlayers.sort((a, b) => (b.score || 0) - (a.score || 0));

              const hotSeatPlayer = updatedPlayers.find(
                (p) => p.id === prev.hotSeatPlayer?.id
              ) || prev.hotSeatPlayer;

              return {
                ...prev,
                players: updatedPlayers,
                hotSeatPlayer,
              };
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('[useGameSession] Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      console.log('[useGameSession] Cleaning up realtime');
      supabase.removeChannel(channel);
      channelRef.current = null;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [roomId, playerId, isConnected, pollGameState]);

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
    isConnected,
    refreshGameState,
    refreshPlayers,
  };
}
