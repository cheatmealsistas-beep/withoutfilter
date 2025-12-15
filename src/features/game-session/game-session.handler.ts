import type {
  StartGameState,
  SubmitAnswerState,
  SubmitVoteState,
  AdvanceRoundState,
  GameState,
  RoundResult,
  GameResult,
  POINTS,
} from './types';
import {
  getGameSessionByRoomId,
  getPlayersInGame,
  getRandomContent,
  getRoomConfig,
  getPlayerInGame,
} from './game-session.query';
import {
  createGameSession,
  updateRoomStatus,
  setRoundContent,
  updateSessionPhase,
  submitAnswer as submitAnswerCommand,
  submitVote as submitVoteCommand,
  awardPoints,
  advanceToNextRound,
  endGameSession,
  resetPlayerScores,
} from './game-session.command';

/**
 * Handle starting a new game
 */
export async function handleStartGame(
  roomId: string,
  hostPlayerId: string
): Promise<StartGameState> {
  // Get room config
  const configResult = await getRoomConfig(roomId);
  if (configResult.error || !configResult.data) {
    return { success: false, error: 'No se pudo obtener la configuración' };
  }

  // Get players
  const playersResult = await getPlayersInGame(roomId);
  if (playersResult.error || playersResult.data.length < 2) {
    return { success: false, error: 'Se necesitan al menos 2 jugadores' };
  }

  // Verify host
  const hostPlayer = playersResult.data.find((p) => p.id === hostPlayerId);
  if (!hostPlayer?.is_host) {
    return { success: false, error: 'Solo el anfitrión puede iniciar' };
  }

  // Reset scores for new game
  await resetPlayerScores(roomId);

  // Create player order (shuffle)
  const playerIds = playersResult.data.map((p) => p.id);
  const shuffledOrder = [...playerIds].sort(() => Math.random() - 0.5);

  // Create game session
  const sessionResult = await createGameSession(
    roomId,
    configResult.data.roundsPerGame,
    shuffledOrder
  );

  if (sessionResult.error || !sessionResult.data) {
    return { success: false, error: sessionResult.error || 'No se pudo crear la sesión' };
  }

  // Get first content
  const contentResult = await getRandomContent(
    roomId,
    configResult.data.categories,
    []
  );

  if (contentResult.error || !contentResult.data) {
    return { success: false, error: 'No hay contenido disponible' };
  }

  // Set first round content
  await setRoundContent(
    sessionResult.data.id,
    contentResult.data,
    configResult.data.timePerRound
  );

  // Update room status to playing
  await updateRoomStatus(roomId, 'playing');

  return {
    success: true,
    sessionId: sessionResult.data.id,
  };
}

/**
 * Handle submitting an answer
 */
export async function handleSubmitAnswer(
  sessionId: string,
  playerId: string,
  answer: string
): Promise<SubmitAnswerState> {
  if (!answer.trim()) {
    return { success: false, error: 'La respuesta no puede estar vacía' };
  }

  const result = await submitAnswerCommand(sessionId, playerId, answer.trim());
  return result;
}

/**
 * Handle submitting a vote
 */
export async function handleSubmitVote(
  sessionId: string,
  voterId: string,
  targetPlayerId: string
): Promise<SubmitVoteState> {
  if (voterId === targetPlayerId) {
    return { success: false, error: 'No puedes votarte a ti mismo' };
  }

  const result = await submitVoteCommand(sessionId, voterId, targetPlayerId);
  return result;
}

/**
 * Handle advancing to next round (called by host or automatically)
 */
export async function handleAdvanceRound(
  roomId: string,
  sessionId: string
): Promise<AdvanceRoundState> {
  // First, calculate and award points for current round
  const session = await getGameSessionByRoomId(roomId);
  if (!session.data) {
    return { success: false, error: 'Sesión no encontrada' };
  }

  const currentContent = session.data.current_content;
  const answers = session.data.round_answers as Record<string, { answer: string }>;
  const votes = session.data.round_votes as Record<string, string>;

  // Award points based on content type
  if (currentContent) {
    const POINTS_CONFIG = {
      QUESTION_ANSWERED: 10,
      GROUP_VOTE_WINNER: 20,
      CHALLENGE_COMPLETED: 30,
      HOT_SEAT_ANSWERED: 10,
    };

    switch (currentContent.type) {
      case 'question':
      case 'confession':
      case 'hot_seat':
        // Award points to players who answered
        for (const playerId of Object.keys(answers)) {
          await awardPoints(playerId, POINTS_CONFIG.QUESTION_ANSWERED);
        }
        break;

      case 'group_vote':
        // Count votes and award to winner
        const voteCounts: Record<string, number> = {};
        for (const targetId of Object.values(votes)) {
          voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
        }

        // Find winner(s)
        let maxVotes = 0;
        let winners: string[] = [];
        for (const [playerId, count] of Object.entries(voteCounts)) {
          if (count > maxVotes) {
            maxVotes = count;
            winners = [playerId];
          } else if (count === maxVotes) {
            winners.push(playerId);
          }
        }

        // Award points to winner(s)
        for (const winnerId of winners) {
          await awardPoints(winnerId, POINTS_CONFIG.GROUP_VOTE_WINNER);
        }
        break;

      case 'challenge':
        // For challenges, check if majority voted "completed"
        const completedVotes = Object.values(votes).filter((v) => v === 'completed').length;
        const totalVotes = Object.keys(votes).length;

        if (totalVotes > 0 && completedVotes > totalVotes / 2) {
          // Award points to the hot seat player
          if (session.data.current_player_id) {
            await awardPoints(session.data.current_player_id, POINTS_CONFIG.CHALLENGE_COMPLETED);
          }
        }
        break;
    }
  }

  // Show results phase
  await updateSessionPhase(sessionId, 'showing_results');

  // Advance to next round
  const advanceResult = await advanceToNextRound(sessionId);

  if (advanceResult.isGameOver) {
    // End the game
    await endGameSession(sessionId, roomId);
    return { success: true, isGameOver: true };
  }

  if (!advanceResult.success) {
    return advanceResult;
  }

  // Get config for next round
  const configResult = await getRoomConfig(roomId);
  if (!configResult.data) {
    return { success: false, error: 'No se pudo obtener la configuración' };
  }

  // Get new content for next round
  const usedIds = session.data.used_content_ids || [];
  const contentResult = await getRandomContent(
    roomId,
    configResult.data.categories,
    usedIds
  );

  if (contentResult.error || !contentResult.data) {
    return { success: false, error: 'No hay más contenido' };
  }

  // Set new round content
  await setRoundContent(
    sessionId,
    contentResult.data,
    configResult.data.timePerRound
  );

  return { success: true, isGameOver: false };
}

/**
 * Get current game state for a player
 */
export async function getGameState(
  roomId: string,
  playerId: string
): Promise<GameState | null> {
  const sessionResult = await getGameSessionByRoomId(roomId);
  if (!sessionResult.data) {
    return null;
  }

  const session = sessionResult.data;
  const playersResult = await getPlayersInGame(roomId);
  const players = playersResult.data;

  // Find hot seat player
  const hotSeatPlayer = players.find((p) => p.id === session.current_player_id) || null;

  // Get room code
  const { createClientServer } = await import('@/shared/database/supabase');
  const supabase = await createClientServer();
  const { data: room } = await supabase
    .from('game_rooms')
    .select('code')
    .eq('id', roomId)
    .single();

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
    sessionId: session.id,
    roomCode: room?.code || '',
    currentRound: session.current_round,
    totalRounds: session.total_rounds,
    phase: session.phase || 'showing_question',
    content: session.current_content,
    hotSeatPlayer,
    players,
    currentPlayerId: playerId,
    timeRemaining,
    answers: Object.fromEntries(
      Object.entries(answers).map(([k, v]) => [k, v.answer])
    ),
    votes,
    hasAnswered: !!answers[playerId],
    hasVoted: !!votes[playerId],
  };
}

/**
 * Get final game results
 */
export async function getGameResults(
  roomId: string
): Promise<GameResult | null> {
  const playersResult = await getPlayersInGame(roomId);
  if (playersResult.data.length === 0) {
    return null;
  }

  const players = playersResult.data.sort((a, b) => b.score - a.score);

  // Get room for duration calculation
  const { createClientServer } = await import('@/shared/database/supabase');
  const supabase = await createClientServer();
  const { data: room } = await supabase
    .from('game_rooms')
    .select('started_at, finished_at, config')
    .eq('id', roomId)
    .single();

  let duration = 0;
  if (room?.started_at && room?.finished_at) {
    const start = new Date(room.started_at).getTime();
    const end = new Date(room.finished_at).getTime();
    duration = Math.floor((end - start) / 1000);
  }

  const config = room?.config as { roundsPerGame?: number } | null;

  return {
    winner: players[0],
    rankings: players.map((player, index) => ({
      player,
      rank: index + 1,
      totalPoints: player.score,
    })),
    totalRounds: config?.roundsPerGame || 10,
    duration,
  };
}
