-- Migration: Fix Game Issues for Without Filter
-- Description: Fixes RLS policies and adds missing phase column
-- SAFE TO RUN MULTIPLE TIMES

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. ADD MISSING PHASE COLUMN TO game_sessions
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS phase VARCHAR(30) DEFAULT 'showing_question' NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. FIX RLS POLICIES FOR game_sessions
-- Since users are NOT authenticated (using cookies), we need permissive policies
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Players can view game session" ON game_sessions;
DROP POLICY IF EXISTS "Host can manage game session" ON game_sessions;
DROP POLICY IF EXISTS "Anyone can view game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Anyone can insert game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Anyone can update game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Anyone can delete game sessions" ON game_sessions;
DROP POLICY IF EXISTS "Anyone can manage game sessions" ON game_sessions;

-- Create permissive policies for anonymous game play
CREATE POLICY "Anyone can view game sessions"
  ON game_sessions FOR SELECT USING (true);

CREATE POLICY "Anyone can insert game sessions"
  ON game_sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update game sessions"
  ON game_sessions FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete game sessions"
  ON game_sessions FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. FIX RLS POLICIES FOR game_rooms
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Authenticated users can create rooms" ON game_rooms;
DROP POLICY IF EXISTS "Host can update room" ON game_rooms;
DROP POLICY IF EXISTS "Host can delete room" ON game_rooms;
DROP POLICY IF EXISTS "Anyone can create rooms" ON game_rooms;
DROP POLICY IF EXISTS "Anyone can update rooms" ON game_rooms;
DROP POLICY IF EXISTS "Anyone can delete rooms" ON game_rooms;
DROP POLICY IF EXISTS "Anyone can view rooms" ON game_rooms;

-- Create permissive policies for anonymous game play
CREATE POLICY "Anyone can view rooms"
  ON game_rooms FOR SELECT USING (true);

CREATE POLICY "Anyone can create rooms"
  ON game_rooms FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update rooms"
  ON game_rooms FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete rooms"
  ON game_rooms FOR DELETE USING (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. ENSURE REPLICA IDENTITY FOR REALTIME
-- Required for DELETE events to work properly with filters
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE game_rooms REPLICA IDENTITY FULL;
ALTER TABLE game_players REPLICA IDENTITY FULL;
ALTER TABLE game_sessions REPLICA IDENTITY FULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON COLUMN game_sessions.phase IS 'Current phase of the round: showing_question, answering, showing_results, between_rounds';
