import { getUser } from '@/shared/auth';
import {
  createRoomSchema,
  joinRoomSchema,
  roomConfigSchema,
  type CreateRoomInput,
  type JoinRoomInput,
  type CreateRoomState,
  type JoinRoomState,
  type UpdateRoomState,
  type LeaveRoomState,
  type RoomConfig,
} from './types';
import {
  createRoom,
  addPlayerToRoom,
  removePlayerFromRoom,
  updatePlayerReady,
  updateRoomConfig,
  updateRoomStatus,
  kickPlayer,
} from './game-lobby.command';
import {
  getRoomByCode,
  getPlayersByRoomId,
  isRoomJoinable,
  getPlayerById,
  getRoomById,
} from './game-lobby.query';

/**
 * Handle creating a new game room
 */
export async function handleCreateRoom(
  input: CreateRoomInput
): Promise<CreateRoomState> {
  // Validate input
  const validation = createRoomSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { hostName, hostAvatar, config } = validation.data;

  // Get authenticated user (optional for this game)
  const user = await getUser();
  const userId = user?.id || null;

  // Create the room
  const roomResult = await createRoom(userId, config);
  if (roomResult.error || !roomResult.data) {
    return {
      success: false,
      error: roomResult.error || 'No se pudo crear la sala',
    };
  }

  // Add host as first player
  const playerResult = await addPlayerToRoom({
    roomId: roomResult.data.id,
    userId,
    displayName: hostName,
    avatarEmoji: hostAvatar,
    isHost: true,
  });

  if (playerResult.error || !playerResult.data) {
    return {
      success: false,
      error: playerResult.error || 'No se pudo unir a la sala',
    };
  }

  return {
    success: true,
    roomCode: roomResult.data.code,
    playerId: playerResult.data.id,
  };
}

/**
 * Handle joining an existing room
 */
export async function handleJoinRoom(
  input: JoinRoomInput
): Promise<JoinRoomState> {
  // Validate input
  const validation = joinRoomSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  const { code, playerName, playerAvatar } = validation.data;

  // Check if room is joinable
  const joinableResult = await isRoomJoinable(code);
  if (!joinableResult.joinable) {
    return {
      success: false,
      error: joinableResult.reason || 'No se puede unir a esta sala',
    };
  }

  // Get room
  const roomResult = await getRoomByCode(code);
  if (roomResult.error || !roomResult.data) {
    return {
      success: false,
      error: 'Sala no encontrada',
    };
  }

  // Get authenticated user (optional)
  const user = await getUser();
  const userId = user?.id || null;

  // Check if user is already in this room
  if (userId) {
    const players = await getPlayersByRoomId(roomResult.data.id);
    const existingPlayer = players.data.find((p) => p.user_id === userId);
    if (existingPlayer) {
      // Return existing player info
      return {
        success: true,
        roomCode: code,
        playerId: existingPlayer.id,
      };
    }
  }

  // Add player to room
  const playerResult = await addPlayerToRoom({
    roomId: roomResult.data.id,
    userId,
    displayName: playerName,
    avatarEmoji: playerAvatar,
    isHost: false,
  });

  if (playerResult.error || !playerResult.data) {
    return {
      success: false,
      error: playerResult.error || 'No se pudo unir a la sala',
    };
  }

  return {
    success: true,
    roomCode: code,
    playerId: playerResult.data.id,
  };
}

/**
 * Handle leaving a room
 */
export async function handleLeaveRoom(
  playerId: string
): Promise<LeaveRoomState> {
  // Get player info first
  const playerResult = await getPlayerById(playerId);
  if (playerResult.error || !playerResult.data) {
    return {
      success: false,
      error: 'Jugador no encontrado',
    };
  }

  const player = playerResult.data;

  // If host is leaving, check if there are other players
  if (player.is_host) {
    const playersResult = await getPlayersByRoomId(player.room_id);
    const otherPlayers = playersResult.data.filter((p) => p.id !== playerId);

    if (otherPlayers.length > 0) {
      // TODO: Transfer host to another player
      // For now, just leave and let the room become abandoned
    } else {
      // No other players, mark room as abandoned
      await updateRoomStatus(player.room_id, 'abandoned');
    }
  }

  // Remove player
  const result = await removePlayerFromRoom(playerId);
  return {
    success: result.success,
    error: result.error || undefined,
  };
}

/**
 * Handle toggling player ready status
 */
export async function handleToggleReady(
  playerId: string
): Promise<UpdateRoomState> {
  // Get current player state
  const playerResult = await getPlayerById(playerId);
  if (playerResult.error || !playerResult.data) {
    return {
      success: false,
      error: 'Jugador no encontrado',
    };
  }

  // Toggle ready status
  const result = await updatePlayerReady(
    playerId,
    !playerResult.data.is_ready
  );

  return {
    success: result.success,
    error: result.error || undefined,
  };
}

/**
 * Handle updating room configuration (host only)
 */
export async function handleUpdateConfig(
  playerId: string,
  config: Partial<RoomConfig>
): Promise<UpdateRoomState> {
  // Get player to verify they're host
  const playerResult = await getPlayerById(playerId);
  if (playerResult.error || !playerResult.data) {
    return {
      success: false,
      error: 'Jugador no encontrado',
    };
  }

  if (!playerResult.data.is_host) {
    return {
      success: false,
      error: 'Solo el anfitrión puede cambiar la configuración',
    };
  }

  // Validate config
  const validation = roomConfigSchema.partial().safeParse(config);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0].message,
    };
  }

  // Update config
  const result = await updateRoomConfig(
    playerResult.data.room_id,
    validation.data
  );

  return {
    success: result.success,
    error: result.error || undefined,
  };
}

/**
 * Handle kicking a player (host only)
 */
export async function handleKickPlayer(
  hostPlayerId: string,
  targetPlayerId: string
): Promise<UpdateRoomState> {
  // Get host player
  const hostResult = await getPlayerById(hostPlayerId);
  if (hostResult.error || !hostResult.data) {
    return {
      success: false,
      error: 'Jugador no encontrado',
    };
  }

  if (!hostResult.data.is_host) {
    return {
      success: false,
      error: 'Solo el anfitrión puede expulsar jugadores',
    };
  }

  // Kick the player
  const result = await kickPlayer(hostResult.data.room_id, targetPlayerId);

  return {
    success: result.success,
    error: result.error || undefined,
  };
}

/**
 * Check if all players are ready and game can start
 */
export async function canStartGame(
  roomId: string
): Promise<{ canStart: boolean; reason?: string }> {
  const roomResult = await getRoomById(roomId);
  if (roomResult.error || !roomResult.data) {
    return { canStart: false, reason: 'Sala no encontrada' };
  }

  const room = roomResult.data;

  if (room.status !== 'waiting') {
    return { canStart: false, reason: 'La sala no está en espera' };
  }

  const playersResult = await getPlayersByRoomId(roomId);
  const players = playersResult.data;

  if (players.length < room.config.minPlayers) {
    return {
      canStart: false,
      reason: `Necesitas al menos ${room.config.minPlayers} jugadores`,
    };
  }

  const allReady = players.every((p) => p.is_ready);
  if (!allReady) {
    return { canStart: false, reason: 'No todos los jugadores están listos' };
  }

  return { canStart: true };
}
