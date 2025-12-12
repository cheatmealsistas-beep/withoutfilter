-- Migration: Onboarding fields in profiles
-- Description: Add fields to track onboarding progress and user professional type

-- Añadir campos de onboarding a profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS professional_type TEXT CHECK (
    professional_type IN ('coach', 'therapist', 'trainer', 'content_creator', 'mentor', 'other')
  ),
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_skipped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- Índice para queries de onboarding (usuarios que no han completado)
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding
  ON profiles(onboarding_completed_at)
  WHERE onboarding_completed_at IS NULL;

-- Comentarios
COMMENT ON COLUMN profiles.professional_type IS 'Type of professional: coach, therapist, trainer, content_creator, mentor, other';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'Timestamp when user completed the onboarding wizard';
COMMENT ON COLUMN profiles.onboarding_skipped_at IS 'Timestamp when user skipped the onboarding wizard';
COMMENT ON COLUMN profiles.onboarding_step IS 'Current step in onboarding wizard (0-4)';
