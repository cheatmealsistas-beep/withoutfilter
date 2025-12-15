import { createClientServer } from '@/shared/database/supabase';
import type { Room, Player, RoomWithPlayers } from './types';

/**
 * Get a room by its unique code
 */
export async function getRoomByCode(
  code: string
): Promise<{ data: Room | null; error: string | null }> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('game_rooms')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { data: null, error: 'Sala no encontrada' };
    }
    return { data: null, error: error.message };
  }

  return { data: data as Room, error: null };
}

/**
 * Get a room by its ID
 */
export async function getRoomById(
  roomId: string
): Promise<{ data: Room | null; error: string | null }> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('game_rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Room, error: null };
}

/**
 * Get all players in a room
 */
export async function getPlayersByRoomId(
  roomId: string
): Promise<{ data: Player[]; error: string | null }> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('game_players')
    .select('*')
    .eq('room_id', roomId)
    .order('joined_at', { ascending: true });

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data as Player[], error: null };
}

/**
 * Get a room with all its players
 */
export async function getRoomWithPlayers(
  code: string
): Promise<{ data: RoomWithPlayers | null; error: string | null }> {
  const roomResult = await getRoomByCode(code);

  if (roomResult.error || !roomResult.data) {
    return { data: null, error: roomResult.error };
  }

  const playersResult = await getPlayersByRoomId(roomResult.data.id);

  if (playersResult.error) {
    return { data: null, error: playersResult.error };
  }

  return {
    data: {
      ...roomResult.data,
      players: playersResult.data,
    },
    error: null,
  };
}

/**
 * Get a player by ID
 */
export async function getPlayerById(
  playerId: string
): Promise<{ data: Player | null; error: string | null }> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('game_players')
    .select('*')
    .eq('id', playerId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as Player, error: null };
}

/**
 * Check if a room code exists and is joinable
 */
export async function isRoomJoinable(
  code: string
): Promise<{ joinable: boolean; reason?: string }> {
  const roomResult = await getRoomByCode(code);

  if (!roomResult.data) {
    return { joinable: false, reason: 'Sala no encontrada' };
  }

  const room = roomResult.data;

  if (room.status === 'finished' || room.status === 'abandoned') {
    return { joinable: false, reason: 'La sala ya ha terminado' };
  }

  if (room.status === 'playing' && !room.config.allowLateJoin) {
    return { joinable: false, reason: 'La partida ya ha comenzado' };
  }

  const playersResult = await getPlayersByRoomId(room.id);
  const currentPlayers = playersResult.data.length;

  if (currentPlayers >= room.config.maxPlayers) {
    return { joinable: false, reason: 'La sala está llena' };
  }

  return { joinable: true };
}

/**
 * Get the count of connected players in a room
 */
export async function getConnectedPlayerCount(
  roomId: string
): Promise<number> {
  const supabase = await createClientServer();

  const { count, error } = await supabase
    .from('game_players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId)
    .eq('is_connected', true);

  if (error) {
    return 0;
  }

  return count || 0;
}
