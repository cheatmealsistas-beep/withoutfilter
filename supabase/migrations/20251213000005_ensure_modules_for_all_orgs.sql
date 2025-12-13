-- Migration: Ensure all non-personal organizations have modules
-- Description: Force creates modules regardless of is_personal flag for debugging

-- First, let's see what organizations exist and their is_personal status
-- Then insert modules for ALL organizations that are missing them

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
WHERE NOT EXISTS (
    SELECT 1 FROM app_modules am
    WHERE am.organization_id = o.id AND am.type = m.type
  )
ON CONFLICT (organization_id, type) DO NOTHING;
