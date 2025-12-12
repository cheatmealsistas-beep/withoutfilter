-- Migration: Organization branding fields
-- Description: Add logo, tagline, and theme color for app customization

-- Añadir campos de branding a organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#000000';

-- Comentarios
COMMENT ON COLUMN organizations.logo_url IS 'URL of the organization logo (stored in Supabase Storage)';
COMMENT ON COLUMN organizations.tagline IS 'Short tagline/description for the public app page';
COMMENT ON COLUMN organizations.primary_color IS 'Primary brand color in hex format';
