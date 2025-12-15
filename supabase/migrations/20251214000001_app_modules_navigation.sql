-- Migration: Add navigation customization to app_modules
-- Description: Allow owners to customize labels, navbar/footer visibility, and create custom pages

-- Add new columns for navigation customization
ALTER TABLE app_modules
  ADD COLUMN IF NOT EXISTS custom_label TEXT,
  ADD COLUMN IF NOT EXISTS show_in_navbar BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_in_footer BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS custom_slug TEXT;

-- Add 'custom' type for free-form pages
-- First drop the old constraint, then add the new one
ALTER TABLE app_modules DROP CONSTRAINT IF EXISTS app_modules_type_check;
ALTER TABLE app_modules ADD CONSTRAINT app_modules_type_check CHECK (
  type IN ('home', 'about', 'services', 'testimonials', 'blog', 'contact', 'courses', 'resources', 'custom')
);

-- Index for custom_slug lookups (for custom pages routing)
CREATE INDEX IF NOT EXISTS idx_app_modules_custom_slug
  ON app_modules(organization_id, custom_slug)
  WHERE custom_slug IS NOT NULL;

-- Ensure custom_slug is unique per organization (for custom pages)
ALTER TABLE app_modules
  ADD CONSTRAINT app_modules_custom_slug_unique
  UNIQUE (organization_id, custom_slug);

-- Comments
COMMENT ON COLUMN app_modules.custom_label IS 'Custom label for this module (overrides default translated label)';
COMMENT ON COLUMN app_modules.show_in_navbar IS 'Whether to show this module in the public navbar';
COMMENT ON COLUMN app_modules.show_in_footer IS 'Whether to show this module in the public footer';
COMMENT ON COLUMN app_modules.custom_slug IS 'Custom URL slug for custom pages (e.g., "mi-pagina" for /app/slug/mi-pagina)';
