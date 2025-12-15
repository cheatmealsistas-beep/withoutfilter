'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import type {
  CreateRoomState,
  JoinRoomState,
  UpdateRoomState,
  LeaveRoomState,
  RoomConfig,
} from './types';
import {
  handleCreateRoom,
  handleJoinRoom,
  handleLeaveRoom,
  handleToggleReady,
  handleUpdateConfig,
  handleKickPlayer,
} from './game-lobby.handler';

/**
 * Server Action: Create a new game room
 */
export async function createRoomAction(
  _prevState: CreateRoomState | null,
  formData: FormData
): Promise<CreateRoomState> {
  const hostName = formData.get('hostName') as string;
  const hostAvatar = (formData.get('hostAvatar') as string) || '😀';
  const locale = (formData.get('locale') as string) || 'es';

  // Parse categories from form
  const categoriesRaw = formData.getAll('categories') as string[];
  const categories = categoriesRaw.length > 0 ? categoriesRaw : ['suave'];

  // Build config (only if categories are provided)
  const config = categories.length > 0 ? {
    categories: categories as RoomConfig['categories'],
    roundsPerGame: parseInt(
      (formData.get('roundsPerGame') as string) || '10',
      10
    ),
    timePerRound: parseInt(
      (formData.get('timePerRound') as string) || '30',
      10
    ),
  } : undefined;

  const result = await handleCreateRoom({
    hostName,
    hostAvatar,
    config,
  });

  if (result.success && result.roomCode && result.playerId) {
    // Store player ID in cookie for reconnection
    const cookieStore = await cookies();
    cookieStore.set(`player_${result.roomCode}`, result.playerId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    redirect(`/${locale}/game/${result.roomCode}`);
  }

  return result;
}

/**
 * Server Action: Join an existing room
 */
export async function joinRoomAction(
  _prevState: JoinRoomState | null,
  formData: FormData
): Promise<JoinRoomState> {
  const code = (formData.get('code') as string)?.toUpperCase();
  const playerName = formData.get('playerName') as string;
  const playerAvatar = (formData.get('playerAvatar') as string) || '😀';
  const locale = (formData.get('locale') as string) || 'es';

  const result = await handleJoinRoom({
    code,
    playerName,
    playerAvatar,
  });

  if (result.success && result.roomCode && result.playerId) {
    // Store player ID in cookie for reconnection
    const cookieStore = await cookies();
    cookieStore.set(`player_${result.roomCode}`, result.playerId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    redirect(`/${locale}/game/${result.roomCode}`);
  }

  return result;
}

/**
 * Server Action: Leave current room
 */
export async function leaveRoomAction(
  formData: FormData
): Promise<LeaveRoomState> {
  const playerId = formData.get('playerId') as string;
  const roomCode = formData.get('roomCode') as string;
  const locale = (formData.get('locale') as string) || 'es';

  const result = await handleLeaveRoom(playerId);

  if (result.success) {
    revalidatePath(`/${locale}/game/${roomCode}`);
    redirect(`/${locale}`);
  }

  return result;
}

/**
 * Server Action: Toggle player ready status
 */
export async function toggleReadyAction(
  formData: FormData
): Promise<UpdateRoomState> {
  const playerId = formData.get('playerId') as string;
  const roomCode = formData.get('roomCode') as string;
  const locale = (formData.get('locale') as string) || 'es';

  const result = await handleToggleReady(playerId);

  if (result.success) {
    revalidatePath(`/${locale}/game/${roomCode}`);
  }

  return result;
}

/**
 * Server Action: Update room configuration (host only)
 */
export async function updateConfigAction(
  formData: FormData
): Promise<UpdateRoomState> {
  const playerId = formData.get('playerId') as string;
  const roomCode = formData.get('roomCode') as string;
  const locale = (formData.get('locale') as string) || 'es';

  // Parse config from form
  const categoriesRaw = formData.getAll('categories') as string[];
  const config: Partial<RoomConfig> = {};

  if (categoriesRaw.length > 0) {
    config.categories = categoriesRaw as RoomConfig['categories'];
  }

  const roundsPerGame = formData.get('roundsPerGame');
  if (roundsPerGame) {
    config.roundsPerGame = parseInt(roundsPerGame as string, 10);
  }

  const timePerRound = formData.get('timePerRound');
  if (timePerRound) {
    config.timePerRound = parseInt(timePerRound as string, 10);
  }

  const result = await handleUpdateConfig(playerId, config);

  if (result.success) {
    revalidatePath(`/${locale}/game/${roomCode}`);
  }

  return result;
}

/**
 * Server Action: Kick a player (host only)
 */
export async function kickPlayerAction(
  formData: FormData
): Promise<UpdateRoomState> {
  const hostPlayerId = formData.get('hostPlayerId') as string;
  const targetPlayerId = formData.get('targetPlayerId') as string;
  const roomCode = formData.get('roomCode') as string;
  const locale = (formData.get('locale') as string) || 'es';

  const result = await handleKickPlayer(hostPlayerId, targetPlayerId);

  if (result.success) {
    revalidatePath(`/${locale}/game/${roomCode}`);
  }

  return result;
}
