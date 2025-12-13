-- Migration: Fix courses modules to be public when enabled
-- Description: Existing courses modules that are enabled should be public

UPDATE app_modules
SET is_public = true, updated_at = now()
WHERE type = 'courses' AND is_enabled = true AND is_public = false;

-- Also update the default for future courses
COMMENT ON COLUMN app_modules.is_public IS 'Whether this module is publicly accessible. Courses are auto-set to public when enabled.';
