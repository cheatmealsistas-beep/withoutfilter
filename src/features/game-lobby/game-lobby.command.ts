import { createClientServer } from '@/shared/database/supabase';
import type { RoomConfig, Room, Player } from './types';
import { defaultRoomConfig } from './types';

/**
 * Create a new game room
 */
export async function createRoom(
  hostId: string | null,
  config?: Partial<RoomConfig>
): Promise<{ data: Room | null; error: string | null }> {
  const supabase = await createClientServer();

  const roomConfig = {
    ...defaultRoomConfig,
    ...config,
  };

  const { data, error } = await supabase
    .from('game_rooms')
    .insert({
      host_id: hostId,
      config: roomConfig,
      status: 'waiting',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating room:', error);
    return { data: null, error: 'No se pudo crear la sala' };
  }

  return { data: data as Room, error: null };
}

/**
 * Add a player to a room
 */
export async function addPlayerToRoom(input: {
  roomId: string;
  userId: string | null;
  displayName: string;
  avatarEmoji: string;
  isHost: boolean;
}): Promise<{ data: Player | null; error: string | null }> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('game_players')
    .insert({
      room_id: input.roomId,
      user_id: input.userId,
      display_name: input.displayName,
      avatar_emoji: input.avatarEmoji,
      is_host: input.isHost,
      is_ready: input.isHost, // Host is auto-ready
      is_connected: true,
      score: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding player:', error);
    if (error.code === '23505') {
      return { data: null, error: 'Ya estás en esta sala' };
    }
    return { data: null, error: 'No se pudo unir a la sala' };
  }

  return { data: data as Player, error: null };
}

/**
 * Remove a player from a room
 */
export async function removePlayerFromRoom(
  playerId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  const { error } = await supabase
    .from('game_players')
    .delete()
    .eq('id', playerId);

  if (error) {
    console.error('Error removing player:', error);
    return { success: false, error: 'No se pudo salir de la sala' };
  }

  return { success: true, error: null };
}

/**
 * Update player ready status
 */
export async function updatePlayerReady(
  playerId: string,
  isReady: boolean
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  const { error } = await supabase
    .from('game_players')
    .update({ is_ready: isReady })
    .eq('id', playerId);

  if (error) {
    console.error('Error updating player ready:', error);
    return { success: false, error: 'No se pudo actualizar el estado' };
  }

  return { success: true, error: null };
}

/**
 * Update player connection status
 */
export async function updatePlayerConnection(
  playerId: string,
  isConnected: boolean
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  const { error } = await supabase
    .from('game_players')
    .update({
      is_connected: isConnected,
      last_seen_at: new Date().toISOString(),
    })
    .eq('id', playerId);

  if (error) {
    console.error('Error updating player connection:', error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Update room configuration
 */
export async function updateRoomConfig(
  roomId: string,
  config: Partial<RoomConfig>
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  // First get current config
  const { data: room, error: fetchError } = await supabase
    .from('game_rooms')
    .select('config')
    .eq('id', roomId)
    .single();

  if (fetchError) {
    return { success: false, error: 'Sala no encontrada' };
  }

  // Merge configs
  const newConfig = {
    ...(room.config as RoomConfig),
    ...config,
  };

  const { error } = await supabase
    .from('game_rooms')
    .update({ config: newConfig })
    .eq('id', roomId);

  if (error) {
    console.error('Error updating room config:', error);
    return { success: false, error: 'No se pudo actualizar la configuración' };
  }

  return { success: true, error: null };
}

/**
 * Update room status
 */
export async function updateRoomStatus(
  roomId: string,
  status: 'waiting' | 'playing' | 'paused' | 'finished' | 'abandoned',
  additionalData?: { started_at?: string; finished_at?: string }
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  const updateData: Record<string, unknown> = { status };

  if (additionalData?.started_at) {
    updateData.started_at = additionalData.started_at;
  }
  if (additionalData?.finished_at) {
    updateData.finished_at = additionalData.finished_at;
  }

  const { error } = await supabase
    .from('game_rooms')
    .update(updateData)
    .eq('id', roomId);

  if (error) {
    console.error('Error updating room status:', error);
    return { success: false, error: 'No se pudo actualizar el estado de la sala' };
  }

  return { success: true, error: null };
}

/**
 * Kick a player from the room (host only)
 */
export async function kickPlayer(
  roomId: string,
  playerId: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClientServer();

  // Verify the player is in this room
  const { data: player, error: fetchError } = await supabase
    .from('game_players')
    .select('room_id, is_host')
    .eq('id', playerId)
    .single();

  if (fetchError || !player) {
    return { success: false, error: 'Jugador no encontrado' };
  }

  if (player.room_id !== roomId) {
    return { success: false, error: 'El jugador no está en esta sala' };
  }

  if (player.is_host) {
    return { success: false, error: 'No puedes expulsar al anfitrión' };
  }

  return removePlayerFromRoom(playerId);
}
