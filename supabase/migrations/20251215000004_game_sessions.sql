-- Migration: Game Sessions for Without Filter
-- Description: Creates the game_sessions table for active game state management

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: game_sessions
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Room reference (one session per room)
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Round state
  current_round INTEGER DEFAULT 1 NOT NULL,
  total_rounds INTEGER NOT NULL,
  current_player_id UUID REFERENCES game_players(id) ON DELETE SET NULL,  -- Current "hot seat" player
  round_type VARCHAR(30) NOT NULL DEFAULT 'question',

  -- Current content being played
  current_content_id UUID REFERENCES game_content(id),
  current_content JSONB,  -- Cached copy for performance

  -- Used content IDs (to avoid repetition)
  used_content_ids UUID[] DEFAULT ARRAY[]::UUID[],

  -- Round responses
  round_answers JSONB DEFAULT '{}'::jsonb,  -- {player_id: {answer: string, timestamp: number}}
  round_votes JSONB DEFAULT '{}'::jsonb,    -- {voter_id: voted_player_id}

  -- Player order (for rotation)
  player_order UUID[] DEFAULT ARRAY[]::UUID[],
  current_player_index INTEGER DEFAULT 0 NOT NULL,

  -- Timing
  round_started_at TIMESTAMPTZ,
  round_ends_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT valid_round CHECK (current_round >= 1 AND current_round <= total_rounds),
  CONSTRAINT valid_player_index CHECK (current_player_index >= 0)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_game_sessions_room ON game_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_current_player ON game_sessions(current_player_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_round_ends ON game_sessions(round_ends_at)
  WHERE round_ends_at IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Players in the room can view the game session
CREATE POLICY "Players can view game session"
  ON game_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_players
      WHERE game_players.room_id = game_sessions.room_id
    )
  );

-- Host can create/update game session
CREATE POLICY "Host can manage game session"
  ON game_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM game_rooms
      WHERE game_rooms.id = room_id
        AND (game_rooms.host_id IS NULL OR game_rooms.host_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_rooms
      WHERE game_rooms.id = room_id
        AND (game_rooms.host_id IS NULL OR game_rooms.host_id = auth.uid())
    )
  );

-- Service role has full access
CREATE POLICY "Service role full access on game_sessions"
  ON game_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Function to get random content that hasn't been used
CREATE OR REPLACE FUNCTION get_random_content(
  p_room_id UUID,
  p_categories TEXT[],
  p_types TEXT[]
)
RETURNS game_content AS $$
DECLARE
  v_used_ids UUID[];
  v_content game_content;
BEGIN
  -- Get used content IDs for this session
  SELECT used_content_ids INTO v_used_ids
  FROM game_sessions
  WHERE room_id = p_room_id;

  -- Get random content that hasn't been used
  SELECT * INTO v_content
  FROM game_content
  WHERE is_active = true
    AND category = ANY(p_categories)
    AND type = ANY(p_types)
    AND (v_used_ids IS NULL OR NOT (id = ANY(v_used_ids)))
  ORDER BY random()
  LIMIT 1;

  -- If no unused content, reset and get any
  IF v_content IS NULL THEN
    SELECT * INTO v_content
    FROM game_content
    WHERE is_active = true
      AND category = ANY(p_categories)
      AND type = ANY(p_types)
    ORDER BY random()
    LIMIT 1;
  END IF;

  RETURN v_content;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE game_sessions IS 'Active game state for Without Filter sessions';
COMMENT ON COLUMN game_sessions.current_round IS 'Current round number (1 to total_rounds)';
COMMENT ON COLUMN game_sessions.current_player_id IS 'Player in the hot seat for current round';
COMMENT ON COLUMN game_sessions.round_type IS 'Type of current round (question, group_vote, etc.)';
COMMENT ON COLUMN game_sessions.current_content IS 'Cached content being played (for performance)';
COMMENT ON COLUMN game_sessions.used_content_ids IS 'Content IDs already used (to avoid repetition)';
COMMENT ON COLUMN game_sessions.round_answers IS 'Answers submitted in current round';
COMMENT ON COLUMN game_sessions.round_votes IS 'Votes cast in current round';
COMMENT ON COLUMN game_sessions.player_order IS 'Order of players for rotation';
COMMENT ON COLUMN game_sessions.current_player_index IS 'Index in player_order array';
