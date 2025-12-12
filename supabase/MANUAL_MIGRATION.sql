-- =============================================
-- MANUAL MIGRATION - Execute in Supabase SQL Editor
-- =============================================
-- This file combines all migrations in the correct order.
-- Execute this SQL in: Supabase Dashboard > SQL Editor > New Query
-- Then click "Run" to execute.
-- =============================================

-- =============================================
-- 1. BILLING TABLES (20251119000000)
-- =============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabla customers (mapeo usuario ↔ Stripe)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla subscriptions (estado del plan)
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_start_at TIMESTAMPTZ,
  trial_end_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  ended_at TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  cancellation_details JSONB,
  metadata JSONB DEFAULT '{}',
  attribution_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer_id ON customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end_at ON subscriptions(trial_end_at) WHERE trial_end_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_canceled_at ON subscriptions(canceled_at) WHERE canceled_at IS NOT NULL;

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Users can view own customer" ON customers;
CREATE POLICY "Users can view own customer" ON customers FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access customers" ON customers;
CREATE POLICY "Service role full access customers" ON customers FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access subscriptions" ON subscriptions;
CREATE POLICY "Service role full access subscriptions" ON subscriptions FOR ALL USING (auth.role() = 'service_role');

-- Trigger
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 2. PROFILES (20251119000001)
-- =============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es')),
  timezone TEXT DEFAULT 'UTC',
  user_flags TEXT[] DEFAULT '{}',
  current_organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_language ON profiles(language);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;
CREATE POLICY "Service role full access profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, attribution_data)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->'attribution_data', '{}'::jsonb)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- 3. ORGANIZATIONS (20251119000002)
-- =============================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  is_personal BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_members (
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

-- Añadir FK de current_organization_id en profiles (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_profiles_current_org'
  ) THEN
    ALTER TABLE profiles
      ADD CONSTRAINT fk_profiles_current_org
      FOREIGN KEY (current_organization_id)
      REFERENCES organizations(id)
      ON DELETE SET NULL;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Función helper para obtener organizaciones del usuario actual
CREATE OR REPLACE FUNCTION user_organizations()
RETURNS SETOF UUID AS $$
  SELECT organization_id
  FROM organization_members
  WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Políticas RLS para organizations
DROP POLICY IF EXISTS "Members can view their organizations" ON organizations;
CREATE POLICY "Members can view their organizations" ON organizations
  FOR SELECT USING (id IN (SELECT user_organizations()));

DROP POLICY IF EXISTS "Owners can update their organizations" ON organizations;
CREATE POLICY "Owners can update their organizations" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Owners can delete non-personal organizations" ON organizations;
CREATE POLICY "Owners can delete non-personal organizations" ON organizations
  FOR DELETE USING (
    is_personal = false AND
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Políticas RLS para organization_members
DROP POLICY IF EXISTS "Members can view org members" ON organization_members;
CREATE POLICY "Members can view org members" ON organization_members
  FOR SELECT USING (organization_id IN (SELECT user_organizations()));

DROP POLICY IF EXISTS "Admins can manage members" ON organization_members;
CREATE POLICY "Admins can manage members" ON organization_members
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Service role full access organizations" ON organizations;
CREATE POLICY "Service role full access organizations" ON organizations
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access org_members" ON organization_members;
CREATE POLICY "Service role full access org_members" ON organization_members
  FOR ALL USING (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para crear organización personal al registrar usuario
CREATE OR REPLACE FUNCTION handle_new_user_organization()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  user_attribution JSONB;
BEGIN
  SELECT attribution_data INTO user_attribution
  FROM public.profiles
  WHERE id = NEW.id;

  INSERT INTO public.organizations (name, slug, is_personal, created_by, attribution_data)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.id::TEXT,
    true,
    NEW.id,
    COALESCE(user_attribution, '{}'::jsonb)
  )
  RETURNING id INTO org_id;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (org_id, NEW.id, 'owner');

  UPDATE public.profiles
  SET current_organization_id = org_id
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_organization ON auth.users;
CREATE TRIGGER on_auth_user_created_organization
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_organization();

-- =============================================
-- 4. BILLING ORG (20251119000003)
-- =============================================

-- Añadir columna organization_id a customers
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_customers_organization_id ON customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_organization_id ON subscriptions(organization_id);

-- Añadir constraint UNIQUE para organization_id (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customers_organization_id_key'
  ) THEN
    ALTER TABLE customers ADD CONSTRAINT customers_organization_id_key UNIQUE (organization_id);
  END IF;
END$$;

-- Actualizar políticas
DROP POLICY IF EXISTS "Users can view own customer" ON customers;
CREATE POLICY "Users can view own customer" ON customers
  FOR SELECT USING (
    auth.uid() = user_id
    OR organization_id IN (SELECT user_organizations())
  );

DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (
    auth.uid() = user_id
    OR organization_id IN (SELECT user_organizations())
  );

-- =============================================
-- 5. ATTRIBUTION (20251119000004)
-- =============================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS attribution_data JSONB DEFAULT '{}';

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS attribution_data JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_profiles_attribution ON profiles USING GIN (attribution_data);
CREATE INDEX IF NOT EXISTS idx_organizations_attribution ON organizations USING GIN (attribution_data);
CREATE INDEX IF NOT EXISTS idx_subscriptions_attribution ON subscriptions USING GIN (attribution_data);
CREATE INDEX IF NOT EXISTS idx_profiles_utm_source ON profiles ((attribution_data->>'utm_source'));
CREATE INDEX IF NOT EXISTS idx_subscriptions_utm_source ON subscriptions ((attribution_data->>'utm_source'));

-- =============================================
-- 6. APP SETTINGS (20251119000005)
-- =============================================

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('info_bar', 'email', 'features', 'cross_sell', 'general', 'support')
  ),
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);
CREATE INDEX IF NOT EXISTS idx_app_settings_updated_at ON app_settings(updated_at DESC);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage app settings" ON app_settings;
CREATE POLICY "Admins can manage app settings"
  ON app_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND 'admin' = ANY(user_flags)
    )
  );

DROP POLICY IF EXISTS "Service role full access to settings" ON app_settings;
CREATE POLICY "Service role full access to settings"
  ON app_settings
  FOR ALL
  TO service_role
  USING (true);

DROP POLICY IF EXISTS "Public can read info_bar settings" ON app_settings;
CREATE POLICY "Public can read info_bar settings"
  ON app_settings
  FOR SELECT
  USING (category = 'info_bar');

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper function
CREATE OR REPLACE FUNCTION get_app_setting(setting_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  setting_value JSONB;
BEGIN
  SELECT value INTO setting_value
  FROM app_settings
  WHERE key = setting_key;
  RETURN setting_value;
END;
$$;

-- Default settings
INSERT INTO app_settings (key, value, category, description) VALUES
(
  'info_bar',
  '{"enabled": false, "scope": "all", "mode": "info", "messages": {"en": "Important announcement", "es": "Anuncio importante"}, "dismissible": true}'::jsonb,
  'info_bar',
  'Global information bar shown across the application'
) ON CONFLICT (key) DO NOTHING;

INSERT INTO app_settings (key, value, category, description) VALUES
(
  'email_journeys',
  '{"welcome_series": {"enabled": true, "name": "Welcome Series", "description": "Onboarding emails for new users"}, "trial_ending": {"enabled": true, "name": "Trial Ending", "description": "Reminder emails before trial expires"}, "payment_failed": {"enabled": true, "name": "Payment Failed", "description": "Notifications for failed payments"}, "feature_announcements": {"enabled": true, "name": "Feature Announcements", "description": "Updates about new features"}, "monthly_digest": {"enabled": false, "name": "Monthly Digest", "description": "Monthly summary of activity"}}'::jsonb,
  'email',
  'Email journey configurations'
) ON CONFLICT (key) DO NOTHING;

INSERT INTO app_settings (key, value, category, description) VALUES
(
  'feature_flags',
  '{"organizations": true, "api_access": false, "advanced_analytics": false, "white_label": false}'::jsonb,
  'features',
  'Feature flags for gradual rollout'
) ON CONFLICT (key) DO NOTHING;

INSERT INTO app_settings (key, value, category, description) VALUES
(
  'cross_sell_products',
  '{"products": [{"id": "premium_support", "name": "Premium Support", "description": "24/7 priority support with dedicated account manager", "price": "$299/mo", "cta": "Learn More", "url": "/pricing#premium-support", "badge": "Popular"}, {"id": "api_access", "name": "API Access", "description": "Full REST API access with 10,000 requests/day", "price": "$99/mo", "cta": "Enable API", "url": "/settings/api", "badge": null}, {"id": "white_label", "name": "White Label", "description": "Remove branding and use your own domain", "price": "$499/mo", "cta": "Contact Sales", "url": "/contact-sales", "badge": "Enterprise"}]}'::jsonb,
  'cross_sell',
  'Cross-selling product recommendations for admin dashboard'
) ON CONFLICT (key) DO NOTHING;

INSERT INTO app_settings (key, value, category, description) VALUES
(
  'crisp_settings',
  '{"enabled": false, "scope": "all", "hideOnMobile": false, "position": "right", "locale": "auto"}'::jsonb,
  'support',
  'Crisp customer support chat configuration'
) ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 7. SUBSCRIPTIONS EXTRA FIELDS (20251120000000)
-- =============================================

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS price_amount INTEGER,
ADD COLUMN IF NOT EXISTS price_currency TEXT DEFAULT 'USD';

-- =============================================
-- 8. PAGE VIEWS (20251120000001)
-- =============================================

CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_hash TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  path TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  referrer TEXT,
  locale TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_user ON page_views(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_utm_source ON page_views(utm_source) WHERE utm_source IS NOT NULL;

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role has full access to page_views" ON page_views;
CREATE POLICY "Service role has full access to page_views"
  ON page_views
  FOR ALL
  TO service_role
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert own page views" ON page_views;
CREATE POLICY "Authenticated users can insert own page views"
  ON page_views
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admins can view all page views" ON page_views;
CREATE POLICY "Admins can view all page views"
  ON page_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND ('admin' = ANY(profiles.user_flags) OR 'super_admin' = ANY(profiles.user_flags))
    )
  );

-- =============================================
-- 9. ANALYTICS CLEANUP (20251120000002)
-- =============================================

CREATE OR REPLACE FUNCTION cleanup_old_page_views()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM page_views
  WHERE created_at < NOW() - INTERVAL '90 days';
  RAISE NOTICE 'Cleaned up page views older than 90 days at %', NOW();
END;
$$;

-- =============================================
-- 10. AFFILIATE PROGRAM (20251120000003)
-- =============================================

INSERT INTO app_settings (key, value, category, description)
VALUES (
  'affiliate_program',
  '{"enabled": false, "display_in_header": false, "display_in_footer": true, "display_in_home": false, "rewardful_form_url": "", "commission_rate": "30%", "webhook_endpoint": "/api/webhooks/rewardful", "average_sale_price": 297, "calculator_enabled": true}'::jsonb,
  'general',
  'Affiliate program configuration including Rewardful integration and calculator settings'
) ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_id TEXT NOT NULL UNIQUE,
  affiliate_id TEXT NOT NULL,
  affiliate_code TEXT,
  customer_email TEXT NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'converted', 'cancelled', 'paid')),
  commission_amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_affiliate_id ON affiliate_referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_customer_email ON affiliate_referrals(customer_email);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_status ON affiliate_referrals(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_created_at ON affiliate_referrals(created_at DESC);

ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage affiliate referrals" ON affiliate_referrals;
CREATE POLICY "Admins can manage affiliate referrals"
  ON affiliate_referrals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND 'admin' = ANY(profiles.user_flags)
    )
  );

DROP POLICY IF EXISTS "Service role has full access to affiliate referrals" ON affiliate_referrals;
CREATE POLICY "Service role has full access to affiliate referrals"
  ON affiliate_referrals FOR ALL
  TO service_role
  USING (true);

DROP TRIGGER IF EXISTS update_affiliate_referrals_updated_at ON affiliate_referrals;
CREATE TRIGGER update_affiliate_referrals_updated_at
  BEFORE UPDATE ON affiliate_referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 11. ONBOARDING FIELDS (20251212000001)
-- =============================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS professional_type TEXT CHECK (
    professional_type IN ('coach', 'therapist', 'trainer', 'content_creator', 'mentor', 'other')
  ),
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_skipped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding
  ON profiles(onboarding_completed_at)
  WHERE onboarding_completed_at IS NULL;

-- =============================================
-- 12. ORGANIZATION BRANDING (20251212000002)
-- =============================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#000000';

-- =============================================
-- 13. APP MODULES (20251212000003)
-- =============================================

CREATE TABLE IF NOT EXISTS app_modules (
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

CREATE INDEX IF NOT EXISTS idx_app_modules_org ON app_modules(organization_id);
CREATE INDEX IF NOT EXISTS idx_app_modules_type ON app_modules(type);
CREATE INDEX IF NOT EXISTS idx_app_modules_enabled ON app_modules(organization_id, is_enabled) WHERE is_enabled = true;

ALTER TABLE app_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their org modules" ON app_modules;
CREATE POLICY "Members can view their org modules" ON app_modules
  FOR SELECT USING (organization_id IN (SELECT user_organizations()));

DROP POLICY IF EXISTS "Owners and admins can manage modules" ON app_modules;
CREATE POLICY "Owners and admins can manage modules" ON app_modules
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Public can view enabled public modules" ON app_modules;
CREATE POLICY "Public can view enabled public modules" ON app_modules
  FOR SELECT USING (is_enabled = true AND is_public = true);

DROP POLICY IF EXISTS "Service role full access app_modules" ON app_modules;
CREATE POLICY "Service role full access app_modules" ON app_modules
  FOR ALL USING (auth.role() = 'service_role');

DROP TRIGGER IF EXISTS update_app_modules_updated_at ON app_modules;
CREATE TRIGGER update_app_modules_updated_at
  BEFORE UPDATE ON app_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para crear módulos default al crear una app
CREATE OR REPLACE FUNCTION create_default_app_modules()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_personal = false THEN
    INSERT INTO app_modules (organization_id, type, is_enabled, is_public, display_order) VALUES
      (NEW.id, 'home', true, true, 0),
      (NEW.id, 'about', false, true, 1),
      (NEW.id, 'services', false, true, 2),
      (NEW.id, 'testimonials', false, true, 3),
      (NEW.id, 'blog', false, true, 4),
      (NEW.id, 'contact', false, true, 5),
      (NEW.id, 'courses', false, false, 6),
      (NEW.id, 'resources', false, false, 7)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_organization_created_modules ON organizations;
CREATE TRIGGER on_organization_created_modules
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_default_app_modules();

-- =============================================
-- DONE!
-- =============================================
-- All tables created successfully.
-- You can now register users and test the onboarding.
