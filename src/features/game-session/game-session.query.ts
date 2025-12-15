import { createClientServer } from '@/shared/database/supabase';
import type { GameSession, GameContent, PlayerInGame } from './types';

/**
 * Get game session by room ID
 */
export async function getGameSessionByRoomId(
  roomId: string
): Promise<{ data: GameSession | null; error: string | null }> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('room_id', roomId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { data: null, error: null }; // No existe, no es error
    }
    console.error('Error fetching game session:', error);
    return { data: null, error: 'No se pudo obtener la sesión' };
  }

  return { data: data as GameSession, error: null };
}

/**
 * Get game session by ID
 */
export async function getGameSessionById(
  sessionId: string
): Promise<{ data: GameSession | null; error: string | null }> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    console.error('Error fetching game session:', error);
    return { data: null, error: 'No se pudo obtener la sesión' };
  }

  return { data: data as GameSession, error: null };
}

/**
 * Get random content for a round
 */
export async function getRandomContent(
  roomId: string,
  categories: string[],
  excludeIds: string[] = []
): Promise<{ data: GameContent | null; error: string | null }> {
  const supabase = await createClientServer();

  // Build query
  let query = supabase
    .from('game_content')
    .select('*')
    .eq('is_active', true)
    .in('category', categories);

  // Exclude already used content
  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching content:', error);
    return { data: null, error: 'No se pudo obtener contenido' };
  }

  if (!data || data.length === 0) {
    // Si no hay contenido nuevo, obtener cualquiera
    const { data: anyData, error: anyError } = await supabase
      .from('game_content')
      .select('*')
      .eq('is_active', true)
      .in('category', categories);

    if (anyError || !anyData || anyData.length === 0) {
      return { data: null, error: 'No hay contenido disponible' };
    }

    // Seleccionar uno aleatorio
    const randomIndex = Math.floor(Math.random() * anyData.length);
    return { data: anyData[randomIndex] as GameContent, error: null };
  }

  // Seleccionar uno aleatorio
  const randomIndex = Math.floor(Math.random() * data.length);
  return { data: data[randomIndex] as GameContent, error: null };
}

/**
 * Get all players in a room with their scores
 */
export async function getPlayersInGame(
  roomId: string
): Promise<{ data: PlayerInGame[]; error: string | null }> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('game_players')
    .select('id, display_name, avatar_emoji, score, is_host, is_connected')
    .eq('room_id', roomId)
    .order('score', { ascending: false });

  if (error) {
    console.error('Error fetching players:', error);
    return { data: [], error: 'No se pudieron obtener los jugadores' };
  }

  return { data: data as PlayerInGame[], error: null };
}

/**
 * Get a single player by ID
 */
export async function getPlayerInGame(
  playerId: string
): Promise<{ data: PlayerInGame | null; error: string | null }> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('game_players')
    .select('id, display_name, avatar_emoji, score, is_host, is_connected')
    .eq('id', playerId)
    .single();

  if (error) {
    console.error('Error fetching player:', error);
    return { data: null, error: 'No se pudo obtener el jugador' };
  }

  return { data: data as PlayerInGame, error: null };
}

/**
 * Get room configuration
 */
export async function getRoomConfig(
  roomId: string
): Promise<{
  data: {
    categories: string[];
    roundsPerGame: number;
    timePerRound: number;
  } | null;
  error: string | null
}> {
  const supabase = await createClientServer();

  const { data, error } = await supabase
    .from('game_rooms')
    .select('config')
    .eq('id', roomId)
    .single();

  if (error) {
    console.error('Error fetching room config:', error);
    return { data: null, error: 'No se pudo obtener la configuración' };
  }

  const config = data.config as {
    categories?: string[];
    roundsPerGame?: number;
    timePerRound?: number;
  };

  return {
    data: {
      categories: config.categories || ['suave'],
      roundsPerGame: config.roundsPerGame || 10,
      timePerRound: config.timePerRound || 30,
    },
    error: null,
  };
}

/**
 * Check if game session exists and is active
 */
export async function isGameActive(
  roomId: string
): Promise<{ active: boolean; sessionId: string | null }> {
  const supabase = await createClientServer();

  const { data } = await supabase
    .from('game_sessions')
    .select('id')
    .eq('room_id', roomId)
    .single();

  if (!data) {
    return { active: false, sessionId: null };
  }

  // Check if room is still playing
  const { data: room } = await supabase
    .from('game_rooms')
    .select('status')
    .eq('id', roomId)
    .single();

  return {
    active: room?.status === 'playing',
    sessionId: data.id,
  };
}
