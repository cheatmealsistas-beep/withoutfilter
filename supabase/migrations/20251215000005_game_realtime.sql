-- Migration: Enable Realtime for Without Filter
-- Description: Configures Supabase Realtime for game tables

-- ═══════════════════════════════════════════════════════════════════════════
-- ENABLE REALTIME PUBLICATION
-- ═══════════════════════════════════════════════════════════════════════════

-- Add tables to the Supabase Realtime publication
-- This allows clients to subscribe to changes via postgres_changes

ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;

-- Note: game_content is NOT added to realtime (static data, no need for subscriptions)

-- ═══════════════════════════════════════════════════════════════════════════
-- BROADCAST RLS POLICIES
-- Supabase Realtime uses RLS for broadcast authorization
-- ═══════════════════════════════════════════════════════════════════════════

-- Players can broadcast to rooms they're in
-- This is handled by the existing RLS policies on game_players and game_rooms

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON PUBLICATION supabase_realtime IS 'Supabase Realtime publication for live updates';
