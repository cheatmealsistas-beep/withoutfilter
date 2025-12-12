-- Migration: App modules table
-- Description: Create modules for each app (home, about, services, etc.) with default content

-- Tabla app_modules (módulos de cada app/organization)
CREATE TABLE app_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN ('home', 'about', 'services', 'testimonials', 'blog', 'contact', 'courses', 'resources')
  ),
  is_enabled BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  content JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, type)
);

-- Índices
CREATE INDEX idx_app_modules_org ON app_modules(organization_id);
CREATE INDEX idx_app_modules_type ON app_modules(type);
CREATE INDEX idx_app_modules_enabled ON app_modules(organization_id, is_enabled) WHERE is_enabled = true;

-- Enable RLS
ALTER TABLE app_modules ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Members can view their org modules" ON app_modules
  FOR SELECT USING (organization_id IN (SELECT user_organizations()));

CREATE POLICY "Owners and admins can manage modules" ON app_modules
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Public can view enabled public modules" ON app_modules
  FOR SELECT USING (is_enabled = true AND is_public = true);

CREATE POLICY "Service role full access app_modules" ON app_modules
  FOR ALL USING (auth.role() = 'service_role');

-- Trigger updated_at
CREATE TRIGGER update_app_modules_updated_at
  BEFORE UPDATE ON app_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para crear módulos default al crear una app (organization no personal)
CREATE OR REPLACE FUNCTION create_default_app_modules()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo para apps no personales (apps públicas, no workspace interno)
  IF NEW.is_personal = false THEN
    INSERT INTO app_modules (organization_id, type, is_enabled, is_public, display_order) VALUES
      (NEW.id, 'home', true, true, 0),        -- Home siempre activo
      (NEW.id, 'about', false, true, 1),
      (NEW.id, 'services', false, true, 2),
      (NEW.id, 'testimonials', false, true, 3),
      (NEW.id, 'blog', false, true, 4),
      (NEW.id, 'contact', false, true, 5),
      (NEW.id, 'courses', false, false, 6),   -- Privado por defecto
      (NEW.id, 'resources', false, false, 7); -- Privado por defecto
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta al crear organization
CREATE TRIGGER on_organization_created_modules
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_default_app_modules();

-- Comentarios
COMMENT ON TABLE app_modules IS 'Modules for each public app (home, about, services, courses, etc.)';
COMMENT ON COLUMN app_modules.type IS 'Module type: home, about, services, testimonials, blog, contact, courses, resources';
COMMENT ON COLUMN app_modules.is_enabled IS 'Whether this module is active and visible';
COMMENT ON COLUMN app_modules.is_public IS 'Whether this module is publicly accessible or requires login';
COMMENT ON COLUMN app_modules.content IS 'JSON content for the module (headline, description, blocks, etc.)';
COMMENT ON FUNCTION create_default_app_modules() IS 'Creates 8 default modules when a non-personal organization is created';
