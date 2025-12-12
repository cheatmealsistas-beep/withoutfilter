-- Migration: Trial fields in profiles
-- Description: Add fields to track 90-day trial period

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Index for finding expiring trials
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends
  ON profiles(trial_ends_at)
  WHERE trial_ends_at IS NOT NULL;

-- Comments
COMMENT ON COLUMN profiles.trial_started_at IS 'When the 90-day trial started';
COMMENT ON COLUMN profiles.trial_ends_at IS 'When the 90-day trial expires';
