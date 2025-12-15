'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type {
  StartGameState,
  SubmitAnswerState,
  SubmitVoteState,
  AdvanceRoundState,
} from './types';
import {
  handleStartGame,
  handleSubmitAnswer,
  handleSubmitVote,
  handleShowResults,
  handleAdvanceRound,
  getGameState,
  getGameResults,
} from './game-session.handler';
import { updateSessionPhase } from './game-session.command';

/**
 * Server Action: Start a new game
 */
export async function startGameAction(
  formData: FormData
): Promise<StartGameState> {
  const roomId = formData.get('roomId') as string;
  const playerId = formData.get('playerId') as string;
  const locale = (formData.get('locale') as string) || 'es';
  const roomCode = formData.get('roomCode') as string;

  const result = await handleStartGame(roomId, playerId);

  if (result.success) {
    revalidatePath(`/${locale}/game/${roomCode}`);
    redirect(`/${locale}/game/${roomCode}/play`);
  }

  return result;
}

/**
 * Server Action: Submit an answer
 */
export async function submitAnswerAction(
  formData: FormData
): Promise<SubmitAnswerState> {
  const sessionId = formData.get('sessionId') as string;
  const playerId = formData.get('playerId') as string;
  const answer = formData.get('answer') as string;
  const locale = (formData.get('locale') as string) || 'es';
  const roomCode = formData.get('roomCode') as string;

  const result = await handleSubmitAnswer(sessionId, playerId, answer);

  if (result.success) {
    revalidatePath(`/${locale}/game/${roomCode}/play`);
  }

  return result;
}

/**
 * Server Action: Submit a vote
 */
export async function submitVoteAction(
  formData: FormData
): Promise<SubmitVoteState> {
  const sessionId = formData.get('sessionId') as string;
  const voterId = formData.get('voterId') as string;
  const targetPlayerId = formData.get('targetPlayerId') as string;
  const locale = (formData.get('locale') as string) || 'es';
  const roomCode = formData.get('roomCode') as string;

  const result = await handleSubmitVote(sessionId, voterId, targetPlayerId);

  if (result.success) {
    revalidatePath(`/${locale}/game/${roomCode}/play`);
  }

  return result;
}

/**
 * Server Action: Show results (calculate points, change phase)
 * Called when host clicks "Ver Resultados"
 */
export async function showResultsAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const roomId = formData.get('roomId') as string;
  const sessionId = formData.get('sessionId') as string;
  const locale = (formData.get('locale') as string) || 'es';
  const roomCode = formData.get('roomCode') as string;

  const result = await handleShowResults(roomId, sessionId);

  if (result.success) {
    revalidatePath(`/${locale}/game/${roomCode}/play`);
  }

  return result;
}

/**
 * Server Action: Advance to next round
 * Called when host clicks "Siguiente ronda" from results screen
 */
export async function advanceRoundAction(
  formData: FormData
): Promise<AdvanceRoundState> {
  const roomId = formData.get('roomId') as string;
  const sessionId = formData.get('sessionId') as string;
  const locale = (formData.get('locale') as string) || 'es';
  const roomCode = formData.get('roomCode') as string;

  const result = await handleAdvanceRound(roomId, sessionId);

  if (result.success) {
    if (result.isGameOver) {
      redirect(`/${locale}/game/${roomCode}/results`);
    }
    revalidatePath(`/${locale}/game/${roomCode}/play`);
  }

  return result;
}

/**
 * Server Action: Set phase to answering
 */
export async function setAnsweringPhaseAction(
  formData: FormData
): Promise<{ success: boolean }> {
  const sessionId = formData.get('sessionId') as string;
  const locale = (formData.get('locale') as string) || 'es';
  const roomCode = formData.get('roomCode') as string;

  await updateSessionPhase(sessionId, 'answering');
  revalidatePath(`/${locale}/game/${roomCode}/play`);

  return { success: true };
}

/**
 * Server Action: Get current game state
 */
export async function getGameStateAction(
  roomId: string,
  playerId: string
) {
  return await getGameState(roomId, playerId);
}

/**
 * Server Action: Get final results
 */
export async function getGameResultsAction(roomId: string) {
  return await getGameResults(roomId);
}
