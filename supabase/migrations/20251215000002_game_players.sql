-- Migration: Game Players for Without Filter
-- Description: Creates the game_players table for tracking players in rooms

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: game_players
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS game_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Room reference
  room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE NOT NULL,

  -- User reference (NULL for anonymous/guest players)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Player identity
  display_name VARCHAR(30) NOT NULL,
  avatar_emoji VARCHAR(10) DEFAULT '😀' NOT NULL,

  -- Player state
  is_host BOOLEAN DEFAULT false NOT NULL,
  is_ready BOOLEAN DEFAULT false NOT NULL,
  is_connected BOOLEAN DEFAULT true NOT NULL,

  -- Game stats
  score INTEGER DEFAULT 0 NOT NULL,

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_seen_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT valid_display_name CHECK (char_length(display_name) >= 2),
  CONSTRAINT valid_score CHECK (score >= 0),
  -- A user can only be in one room at a time (if authenticated)
  CONSTRAINT unique_user_per_room UNIQUE NULLS NOT DISTINCT (room_id, user_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_game_players_room ON game_players(room_id);
CREATE INDEX IF NOT EXISTS idx_game_players_user ON game_players(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_game_players_connected ON game_players(room_id, is_connected)
  WHERE is_connected = true;
CREATE INDEX IF NOT EXISTS idx_game_players_host ON game_players(room_id)
  WHERE is_host = true;

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Update last_seen_at when player state changes
CREATE OR REPLACE FUNCTION update_player_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_update_game_players_last_seen
  BEFORE UPDATE ON game_players
  FOR EACH ROW
  EXECUTE FUNCTION update_player_last_seen();

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

-- Anyone can view players in any room
CREATE POLICY "Anyone can view players"
  ON game_players
  FOR SELECT
  USING (true);

-- Anyone can join a room (insert themselves as player)
CREATE POLICY "Anyone can join rooms"
  ON game_players
  FOR INSERT
  WITH CHECK (true);

-- Players can update their own record, or host can update any player in their room
CREATE POLICY "Players can update own record or host can update"
  ON game_players
  FOR UPDATE
  USING (
    -- Player updating themselves (anonymous or authenticated)
    (user_id IS NULL OR auth.uid() = user_id) OR
    -- Host of the room can update any player
    EXISTS (
      SELECT 1 FROM game_rooms
      WHERE game_rooms.id = game_players.room_id
        AND game_rooms.host_id = auth.uid()
    )
  );

-- Players can leave (delete themselves), or host can kick players
CREATE POLICY "Players can leave or host can kick"
  ON game_players
  FOR DELETE
  USING (
    -- Player leaving (anonymous or authenticated)
    (user_id IS NULL OR auth.uid() = user_id) OR
    -- Host of the room can kick any player
    EXISTS (
      SELECT 1 FROM game_rooms
      WHERE game_rooms.id = game_players.room_id
        AND game_rooms.host_id = auth.uid()
    )
  );

-- Service role has full access
CREATE POLICY "Service role full access on game_players"
  ON game_players
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE game_players IS 'Players participating in game rooms';
COMMENT ON COLUMN game_players.user_id IS 'Authenticated user ID (NULL for guests)';
COMMENT ON COLUMN game_players.display_name IS 'Name shown in game (2-30 chars)';
COMMENT ON COLUMN game_players.avatar_emoji IS 'Emoji avatar for quick identification';
COMMENT ON COLUMN game_players.is_host IS 'True if this player created the room';
COMMENT ON COLUMN game_players.is_ready IS 'True if player is ready to start';
COMMENT ON COLUMN game_players.is_connected IS 'True if player is currently connected';
COMMENT ON COLUMN game_players.score IS 'Current game score';
