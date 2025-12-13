-- Migration: Backfill app_modules for existing organizations
-- Description: Creates default modules for organizations that don't have them yet

-- Insert default modules for organizations that are missing them
INSERT INTO app_modules (organization_id, type, is_enabled, is_public, display_order)
SELECT o.id, m.type, m.is_enabled, m.is_public, m.display_order
FROM organizations o
CROSS JOIN (
  VALUES
    ('home', true, true, 0),
    ('about', false, true, 1),
    ('services', false, true, 2),
    ('testimonials', false, true, 3),
    ('blog', false, true, 4),
    ('contact', false, true, 5),
    ('courses', false, false, 6),
    ('resources', false, false, 7)
) AS m(type, is_enabled, is_public, display_order)
WHERE (o.is_personal = false OR o.is_personal IS NULL)
  AND NOT EXISTS (
    SELECT 1 FROM app_modules am
    WHERE am.organization_id = o.id AND am.type = m.type
  );

-- Log how many were inserted
DO $$
DECLARE
  inserted_count INTEGER;
BEGIN
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RAISE NOTICE 'Backfilled % module records for existing organizations', inserted_count;
END $$;
