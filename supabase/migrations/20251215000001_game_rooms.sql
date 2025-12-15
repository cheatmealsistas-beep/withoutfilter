-- Migration: Game Rooms for Without Filter
-- Description: Creates the game_rooms table for multiplayer game sessions

-- ═══════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- Function to generate unique room code (6 characters, no confusing chars)
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(6) AS $$
DECLARE
  chars VARCHAR := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- Sin I,O,0,1 para evitar confusion
  result VARCHAR(6) := '';
  i INT;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: game_rooms
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS game_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Room identification
  code VARCHAR(6) UNIQUE NOT NULL,

  -- Host (creator) of the room - can be null for anonymous games
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Room status
  status VARCHAR(20) NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'playing', 'paused', 'finished', 'abandoned')),

  -- Game configuration (JSON for flexibility)
  config JSONB NOT NULL DEFAULT '{
    "categories": ["suave"],
    "intensity": 1,
    "maxPlayers": 12,
    "minPlayers": 3,
    "roundsPerGame": 10,
    "timePerRound": 30,
    "allowLateJoin": false
  }'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_room_code CHECK (code ~ '^[A-Z0-9]{6}$'),
  CONSTRAINT valid_timestamps CHECK (
    (started_at IS NULL OR started_at >= created_at) AND
    (finished_at IS NULL OR finished_at >= started_at)
  )
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_game_rooms_code ON game_rooms(code);
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_rooms_host ON game_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_game_rooms_active ON game_rooms(status)
  WHERE status IN ('waiting', 'playing', 'paused');
CREATE INDEX IF NOT EXISTS idx_game_rooms_created ON game_rooms(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Auto-generate unique room code before insert
CREATE OR REPLACE FUNCTION set_room_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code VARCHAR(6);
  code_exists BOOLEAN;
  max_attempts INT := 100;
  attempt INT := 0;
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    LOOP
      attempt := attempt + 1;
      new_code := generate_room_code();
      SELECT EXISTS(SELECT 1 FROM game_rooms WHERE code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists OR attempt >= max_attempts;
    END LOOP;

    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique room code after % attempts', max_attempts;
    END IF;

    NEW.code := new_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_game_rooms
  BEFORE INSERT ON game_rooms
  FOR EACH ROW
  EXECUTE FUNCTION set_room_code();

-- Auto-update updated_at timestamp
CREATE TRIGGER update_game_rooms_updated_at
  BEFORE UPDATE ON game_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;

-- Anyone can view active rooms (for joining by code)
CREATE POLICY "Anyone can view rooms"
  ON game_rooms
  FOR SELECT
  USING (true);

-- Anyone can create rooms (including anonymous users via anon key)
CREATE POLICY "Anyone can create rooms"
  ON game_rooms
  FOR INSERT
  WITH CHECK (true);

-- Host can update their own room
CREATE POLICY "Host can update own room"
  ON game_rooms
  FOR UPDATE
  USING (
    host_id IS NULL OR  -- Anonymous rooms can be updated by anyone in the room (handled at app level)
    auth.uid() = host_id
  );

-- Host can delete their own room
CREATE POLICY "Host can delete own room"
  ON game_rooms
  FOR DELETE
  USING (
    host_id IS NULL OR
    auth.uid() = host_id
  );

-- Service role has full access (for cleanup jobs)
CREATE POLICY "Service role full access on game_rooms"
  ON game_rooms
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE game_rooms IS 'Game rooms for Without Filter multiplayer sessions';
COMMENT ON COLUMN game_rooms.code IS 'Unique 6-character code for joining (e.g., ABC123)';
COMMENT ON COLUMN game_rooms.host_id IS 'User who created the room (NULL for anonymous)';
COMMENT ON COLUMN game_rooms.status IS 'Current room state: waiting, playing, paused, finished, abandoned';
COMMENT ON COLUMN game_rooms.config IS 'Game configuration (categories, intensity, player limits, etc.)';
