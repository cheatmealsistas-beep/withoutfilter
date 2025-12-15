import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// ROUND PHASE
// ═══════════════════════════════════════════════════════════════════════════

export const roundPhaseEnum = z.enum([
  'showing_question', // Mostrando la pregunta/reto
  'answering',        // Esperando respuestas/votos
  'showing_results',  // Mostrando resultados de la ronda
  'between_rounds',   // Transición entre rondas
]);
export type RoundPhase = z.infer<typeof roundPhaseEnum>;

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT TYPE
// ═══════════════════════════════════════════════════════════════════════════

export const contentTypeEnum = z.enum([
  'question',    // Pregunta personal - jugador en turno responde
  'group_vote',  // Votación grupal - todos votan
  'challenge',   // Reto - jugador hace, grupo decide
  'confession',  // Confesión - respuesta libre
  'hot_seat',    // Pregunta sí/no rápida
]);
export type ContentType = z.infer<typeof contentTypeEnum>;

// ═══════════════════════════════════════════════════════════════════════════
// GAME CONTENT
// ═══════════════════════════════════════════════════════════════════════════

export const gameContentSchema = z.object({
  id: z.string().uuid(),
  type: contentTypeEnum,
  category: z.enum(['suave', 'atrevida', 'sin_filtro']),
  text_es: z.string(),
  text_en: z.string().nullable(),
  is_group_target: z.boolean(),
  requires_confession: z.boolean().optional(),
  is_yes_no: z.boolean().optional(),
  instructions: z.record(z.string(), z.unknown()).nullable(),
});
export type GameContent = z.infer<typeof gameContentSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// GAME SESSION
// ═══════════════════════════════════════════════════════════════════════════

export const gameSessionSchema = z.object({
  id: z.string().uuid(),
  room_id: z.string().uuid(),
  current_round: z.number().min(1),
  total_rounds: z.number().min(1),
  current_player_id: z.string().uuid().nullable(),
  current_player_index: z.number().min(0),
  round_type: contentTypeEnum.nullable(),
  current_content_id: z.string().uuid().nullable(),
  current_content: gameContentSchema.nullable(),
  used_content_ids: z.array(z.string().uuid()),
  player_order: z.array(z.string().uuid()),
  round_answers: z.record(z.string(), z.object({
    answer: z.string(),
    timestamp: z.string(),
  })),
  round_votes: z.record(z.string(), z.string()),
  round_started_at: z.string().nullable(),
  round_ends_at: z.string().nullable(),
  phase: roundPhaseEnum.default('showing_question'),
  created_at: z.string(),
  updated_at: z.string(),
});
export type GameSession = z.infer<typeof gameSessionSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// PLAYER IN GAME
// ═══════════════════════════════════════════════════════════════════════════

export const playerInGameSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string(),
  avatar_emoji: z.string(),
  score: z.number(),
  is_host: z.boolean(),
  is_connected: z.boolean(),
});
export type PlayerInGame = z.infer<typeof playerInGameSchema>;

// ═══════════════════════════════════════════════════════════════════════════
// GAME STATE (para el cliente)
// ═══════════════════════════════════════════════════════════════════════════

export type GameState = {
  sessionId: string;
  roomCode: string;
  currentRound: number;
  totalRounds: number;
  phase: RoundPhase;
  content: GameContent | null;
  hotSeatPlayer: PlayerInGame | null;
  players: PlayerInGame[];
  currentPlayerId: string;
  timeRemaining: number;
  answers: Record<string, string>;
  votes: Record<string, string>;
  hasAnswered: boolean;
  hasVoted: boolean;
};

// ═══════════════════════════════════════════════════════════════════════════
// ROUND RESULT
// ═══════════════════════════════════════════════════════════════════════════

export type RoundResult = {
  roundNumber: number;
  contentType: ContentType;
  hotSeatPlayer: PlayerInGame;
  answers: Record<string, string>;
  votes: Record<string, string>;
  pointsAwarded: Record<string, number>;
  winner?: PlayerInGame; // Para group_vote
};

// ═══════════════════════════════════════════════════════════════════════════
// GAME RESULT (final)
// ═══════════════════════════════════════════════════════════════════════════

export type GameResult = {
  winner: PlayerInGame;
  rankings: Array<{
    player: PlayerInGame;
    rank: number;
    totalPoints: number;
  }>;
  totalRounds: number;
  duration: number; // en segundos
};

// ═══════════════════════════════════════════════════════════════════════════
// ACTION STATES
// ═══════════════════════════════════════════════════════════════════════════

export type StartGameState = {
  success: boolean;
  error?: string;
  sessionId?: string;
};

export type SubmitAnswerState = {
  success: boolean;
  error?: string;
};

export type SubmitVoteState = {
  success: boolean;
  error?: string;
};

export type AdvanceRoundState = {
  success: boolean;
  error?: string;
  isGameOver?: boolean;
};

// ═══════════════════════════════════════════════════════════════════════════
// POINTS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const POINTS = {
  QUESTION_ANSWERED: 10,
  GROUP_VOTE_WINNER: 20,
  CHALLENGE_COMPLETED: 30,
  HOT_SEAT_ANSWERED: 10,
  CONFESSION_SHARED: 15,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TIMING CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const TIMING = {
  SHOWING_QUESTION: 5,    // 5 segundos para leer
  SHOWING_RESULTS: 5,     // 5 segundos para ver resultados
  BETWEEN_ROUNDS: 3,      // 3 segundos de transición
  DEFAULT_ANSWER_TIME: 30, // 30 segundos para responder
} as const;
