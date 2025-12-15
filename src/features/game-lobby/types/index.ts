import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════

export const roomStatusEnum = z.enum([
  'waiting',
  'playing',
  'paused',
  'finished',
  'abandoned',
]);
export type RoomStatus = z.infer<typeof roomStatusEnum>;

export const categoryEnum = z.enum(['suave', 'atrevida', 'sin_filtro']);
export type Category = z.infer<typeof categoryEnum>;

// ═══════════════════════════════════════════════════════════════════════════
// ROOM CONFIG SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

export const roomConfigSchema = z.object({
  categories: z.array(categoryEnum).min(1, 'Selecciona al menos una categoría'),
  intensity: z.number().min(1).max(3).default(1),
  maxPlayers: z.number().min(3).max(12).default(12),
  minPlayers: z.number().min(3).max(12).default(3),
  roundsPerGame: z.number().min(5).max(30).default(10),
  timePerRound: z.number().min(15).max(120).default(30),
  allowLateJoin: z.boolean().default(false),
});
export type RoomConfig = z.infer<typeof roomConfigSchema>;

export const defaultRoomConfig: RoomConfig = {
  categories: ['suave'],
  intensity: 1,
  maxPlayers: 12,
  minPlayers: 3,
  roundsPerGame: 10,
  timePerRound: 30,
  allowLateJoin: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// ROOM SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const roomSchema = z.object({
  id: z.string().uuid(),
  code: z.string().length(6).regex(/^[A-Z0-9]+$/),
  host_id: z.string().uuid().nullable(),
  status: roomStatusEnum,
  config: roomConfigSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  started_at: z.string().datetime().nullable(),
  finished_at: z.string().datetime().nullable(),
});
export type Room = z.infer<typeof roomSchema>;

export const createRoomSchema = z.object({
  hostName: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(30, 'Máximo 30 caracteres'),
  hostAvatar: z.string().max(10).default('😀'),
  config: roomConfigSchema.partial().optional(),
});
export type CreateRoomInput = z.infer<typeof createRoomSchema>;

export const joinRoomSchema = z.object({
  code: z
    .string()
    .length(6, 'El código debe tener 6 caracteres')
    .regex(/^[A-Z0-9]+$/, 'Código inválido')
    .transform((val) => val.toUpperCase()),
  playerName: z
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(30, 'Máximo 30 caracteres'),
  playerAvatar: z.string().max(10).default('😀'),
});
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;

export const updateRoomConfigSchema = z.object({
  roomId: z.string().uuid(),
  config: roomConfigSchema.partial(),
});
export type UpdateRoomConfigInput = z.infer<typeof updateRoomConfigSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// PLAYER SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

export const playerSchema = z.object({
  id: z.string().uuid(),
  room_id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  display_name: z.string().min(2).max(30),
  avatar_emoji: z.string().max(10),
  is_host: z.boolean(),
  is_ready: z.boolean(),
  is_connected: z.boolean(),
  score: z.number().min(0),
  joined_at: z.string().datetime(),
  last_seen_at: z.string().datetime(),
});
export type Player = z.infer<typeof playerSchema>;

export const playerPresenceSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  avatar: z.string(),
  isHost: z.boolean(),
  isReady: z.boolean(),
  isConnected: z.boolean(),
  lastSeen: z.number(),
});
export type PlayerPresence = z.infer<typeof playerPresenceSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// ACTION STATES
// ═══════════════════════════════════════════════════════════════════════════

export type CreateRoomState = {
  success: boolean;
  error?: string;
  roomCode?: string;
  playerId?: string;
};

export type JoinRoomState = {
  success: boolean;
  error?: string;
  roomCode?: string;
  playerId?: string;
};

export type UpdateRoomState = {
  success: boolean;
  error?: string;
};

export type LeaveRoomState = {
  success: boolean;
  error?: string;
};

// ═══════════════════════════════════════════════════════════════════════════
// ROOM WITH PLAYERS (Extended Type)
// ═══════════════════════════════════════════════════════════════════════════

export type RoomWithPlayers = Room & {
  players: Player[];
};

// ═══════════════════════════════════════════════════════════════════════════
// EMOJI AVATARS
// ═══════════════════════════════════════════════════════════════════════════

export const avatarEmojis = [
  '😀', '😎', '🤪', '😈', '👻', '🔥', '💀', '🎃',
  '🦄', '🐙', '🦊', '🐺', '🦁', '🐯', '🐻', '🐼',
  '🍕', '🌶️', '🍺', '🍸', '🎲', '🎯', '🎪', '🎭',
] as const;
