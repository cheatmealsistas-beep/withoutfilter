import { createClientServer } from '@/shared/database/supabase';
import type { GameSession, GameContent, RoundPhase } from './types';
import { TIMING } from './types';

/**
 * Create a new game session
 */
export async function createGameSession(
  roomId: string,
  totalRounds: number,
  playerOrder: string[]
): Promise<{ data: GameSession | null; error: string | null }> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('game_sessions')
    .insert({
      room_id: roomId,
      current_round: 1,
      total_rounds: totalRounds,
      current_player_index: 0,
      current_player_id: playerOrder[0],
      player_order: playerOrder,
      round_answers: {},
      round_votes: {},
      used_content_ids: [],
      phase: 'showing_question',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating game session:', error);
    return { data: null, error: 'No se pudo crear la sesión de juego' };
  }

  return { data: data as GameSession, error: null };
}

/**
 * Update room status
 */
export async function updateRoomStatus(
  roomId: string,
  status: 'waiting' | 'playing' | 'finished'
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  const updateData: Record<string, unknown> = { status };

  if (status === 'playing') {
    updateData.started_at = new Date().toISOString();
  } else if (status === 'finished') {
    updateData.finished_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('game_rooms')
    .update(updateData)
    .eq('id', roomId);

  if (error) {
    console.error('Error updating room status:', error);
    return { success: false, error: 'No se pudo actualizar el estado' };
  }

  return { success: true, error: null };
}

/**
 * Set current content for the round
 */
export async function setRoundContent(
  sessionId: string,
  content: GameContent,
  timePerRound: number
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  const now = new Date();
  const endsAt = new Date(now.getTime() + (TIMING.SHOWING_QUESTION + timePerRound) * 1000);

  const { error } = await supabase
    .from('game_sessions')
    .update({
      current_content_id: content.id,
      current_content: content,
      round_type: content.type,
      round_started_at: now.toISOString(),
      round_ends_at: endsAt.toISOString(),
      round_answers: {},
      round_votes: {},
      phase: 'showing_question',
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error setting round content:', error);
    return { success: false, error: 'No se pudo establecer el contenido' };
  }

  // Add to used content IDs manually
  try {
    const { data } = await supabase
      .from('game_sessions')
      .select('used_content_ids')
      .eq('id', sessionId)
      .single();

    if (data) {
      const usedIds = [...(data.used_content_ids || []), content.id];
      await supabase
        .from('game_sessions')
        .update({ used_content_ids: usedIds })
        .eq('id', sessionId);
    }
  } catch (e) {
    console.error('Error updating used_content_ids:', e);
  }

  return { success: true, error: null };
}

/**
 * Update session phase
 */
export async function updateSessionPhase(
  sessionId: string,
  phase: RoundPhase
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  const { error } = await supabase
    .from('game_sessions')
    .update({ phase })
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating phase:', error);
    return { success: false, error: 'No se pudo actualizar la fase' };
  }

  return { success: true, error: null };
}

/**
 * Submit an answer
 */
export async function submitAnswer(
  sessionId: string,
  playerId: string,
  answer: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClientServer();

  // Get current answers
  const { data: session, error: fetchError } = await supabase
    .from('game_sessions')
    .select('round_answers')
    .eq('id', sessionId)
    .single();

  if (fetchError) {
    return { success: false, error: 'No se pudo obtener la sesión' };
  }

  const currentAnswers = (session.round_answers as Record<string, { answer: string; timestamp: string }>) || {};

  // Add new answer
  currentAnswers[playerId] = {
    answer,
    timestamp: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('game_sessions')
    .update({ round_answers: currentAnswers })
    .eq('id', sessionId);

  if (error) {
    console.error('Error submitting answer:', error);
    return { success: false, error: 'No se pudo enviar la respuesta' };
  }

  return { success: true };
}

/**
 * Submit a vote
 */
export async function submitVote(
  sessionId: string,
  voterId: string,
  targetPlayerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClientServer();

  // Get current votes
  const { data: session, error: fetchError } = await supabase
    .from('game_sessions')
    .select('round_votes')
    .eq('id', sessionId)
    .single();

  if (fetchError) {
    return { success: false, error: 'No se pudo obtener la sesión' };
  }

  const currentVotes = (session.round_votes as Record<string, string>) || {};

  // Add new vote
  currentVotes[voterId] = targetPlayerId;

  const { error } = await supabase
    .from('game_sessions')
    .update({ round_votes: currentVotes })
    .eq('id', sessionId);

  if (error) {
    console.error('Error submitting vote:', error);
    return { success: false, error: 'No se pudo enviar el voto' };
  }

  return { success: true };
}

/**
 * Award points to a player
 */
export async function awardPoints(
  playerId: string,
  points: number
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  // Get current score
  const { data: player, error: fetchError } = await supabase
    .from('game_players')
    .select('score')
    .eq('id', playerId)
    .single();

  if (fetchError) {
    return { success: false, error: 'No se pudo obtener el jugador' };
  }

  const newScore = (player.score || 0) + points;

  const { error } = await supabase
    .from('game_players')
    .update({ score: newScore })
    .eq('id', playerId);

  if (error) {
    console.error('Error awarding points:', error);
    return { success: false, error: 'No se pudo actualizar la puntuación' };
  }

  return { success: true, error: null };
}

/**
 * Advance to next round
 */
export async function advanceToNextRound(
  sessionId: string
): Promise<{ success: boolean; isGameOver: boolean; error?: string }> {
  const supabase = await createClientServer();

  // Get current session state
  const { data: session, error: fetchError } = await supabase
    .from('game_sessions')
    .select('current_round, total_rounds, current_player_index, player_order')
    .eq('id', sessionId)
    .single();

  if (fetchError || !session) {
    return { success: false, isGameOver: false, error: 'No se pudo obtener la sesión' };
  }

  const nextRound = session.current_round + 1;
  const playerOrder = session.player_order as string[];
  const nextPlayerIndex = (session.current_player_index + 1) % playerOrder.length;

  // Check if game is over
  if (nextRound > session.total_rounds) {
    return { success: true, isGameOver: true };
  }

  // Update to next round
  const { error } = await supabase
    .from('game_sessions')
    .update({
      current_round: nextRound,
      current_player_index: nextPlayerIndex,
      current_player_id: playerOrder[nextPlayerIndex],
      round_answers: {},
      round_votes: {},
      current_content: null,
      current_content_id: null,
      phase: 'between_rounds',
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error advancing round:', error);
    return { success: false, isGameOver: false, error: 'No se pudo avanzar la ronda' };
  }

  return { success: true, isGameOver: false };
}

/**
 * End the game session
 */
export async function endGameSession(
  sessionId: string,
  roomId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  // Update room status to finished
  const { error: roomError } = await supabase
    .from('game_rooms')
    .update({
      status: 'finished',
      finished_at: new Date().toISOString(),
    })
    .eq('id', roomId);

  if (roomError) {
    console.error('Error ending game:', roomError);
    return { success: false, error: 'No se pudo finalizar el juego' };
  }

  return { success: true, error: null };
}

/**
 * Reset player scores (for new game)
 */
export async function resetPlayerScores(
  roomId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  const { error } = await supabase
    .from('game_players')
    .update({ score: 0 })
    .eq('room_id', roomId);

  if (error) {
    console.error('Error resetting scores:', error);
    return { success: false, error: 'No se pudieron resetear las puntuaciones' };
  }

  return { success: true, error: null };
}

/**
 * Delete game session (for cleanup or restart)
 */
export async function deleteGameSession(
  sessionId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  const { error } = await supabase
    .from('game_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting session:', error);
    return { success: false, error: 'No se pudo eliminar la sesión' };
  }

  return { success: true, error: null };
}
