-- Phase 1 foundations: profiles, roles, permissions, audit logs, app settings
-- FK to auth.users(id). Do NOT wrap in BEGIN/COMMIT (InsForge manages transactions).

-- Profiles (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  email TEXT,
  phone TEXT,
  country_code TEXT DEFAULT 'CI',
  city TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);
CREATE INDEX IF NOT EXISTS profiles_status_idx ON profiles (status);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);

-- User roles
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON user_roles (user_id);

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Audit logs (append-only for ordinary roles)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs_actor_created_idx
  ON audit_logs (actor_user_id, created_at DESC);

-- App settings
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed roles
INSERT INTO roles (key, name, description) VALUES
  ('learner', 'Apprenant', 'Membre standard de la plateforme'),
  ('curator', 'Curateur', 'Crée et structure des contenus'),
  ('instructor', 'Formateur', 'Anime et enrichit des formations'),
  ('support', 'Support', 'Assistance membres et abonnements'),
  ('admin', 'Administrateur', 'Gestion opérationnelle de la plateforme'),
  ('super_admin', 'Super administrateur', 'Tous les droits critiques')
ON CONFLICT (key) DO NOTHING;

-- Seed permissions
INSERT INTO permissions (key, name, description) VALUES
  ('profile:read_own', 'Lire son profil', NULL),
  ('profile:update_own', 'Modifier son profil', NULL),
  ('admin:access', 'Accéder au back-office', NULL),
  ('admin:members', 'Gérer les membres', NULL),
  ('admin:roles', 'Gérer les rôles', NULL),
  ('admin:settings', 'Gérer les paramètres', NULL),
  ('admin:finances', 'Voir les finances', NULL),
  ('admin:audit', 'Voir les journaux d''audit', NULL),
  ('content:create', 'Créer du contenu', NULL),
  ('content:publish', 'Publier du contenu', NULL),
  ('support:tickets', 'Gérer le support', NULL)
ON CONFLICT (key) DO NOTHING;

-- Map permissions to roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.key = 'learner'
  AND p.key IN ('profile:read_own', 'profile:update_own')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.key IN ('curator', 'instructor')
  AND p.key IN ('profile:read_own', 'profile:update_own', 'content:create')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.key = 'support'
  AND p.key IN ('profile:read_own', 'profile:update_own', 'admin:access', 'support:tickets', 'admin:members')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.key = 'admin'
  AND p.key IN (
    'profile:read_own', 'profile:update_own', 'admin:access', 'admin:members',
    'admin:settings', 'admin:finances', 'admin:audit', 'content:create',
    'content:publish', 'support:tickets'
  )
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.key = 'super_admin'
ON CONFLICT DO NOTHING;

-- Public settings seed
INSERT INTO app_settings (key, value, is_public) VALUES
  ('app.name', '"Académie 2000"', TRUE),
  ('app.locale', '"fr"', TRUE),
  ('app.currency', '"XOF"', TRUE),
  ('subscription.price_amount', '2000', FALSE),
  ('subscription.duration_days', '30', FALSE),
  ('subscription.grace_days', '0', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Auto-create profile + learner role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  learner_role_id UUID;
BEGIN
  -- Profile enrichment (first/last name) is handled by the app after signup.
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1))
  ON CONFLICT (id) DO NOTHING;

  SELECT id INTO learner_role_id FROM public.roles WHERE key = 'learner' LIMIT 1;

  IF learner_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, learner_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Helper to check roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(role_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.key = role_key
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('curator')
      OR public.has_role('instructor')
      OR public.has_role('support')
      OR public.has_role('admin')
      OR public.has_role('super_admin');
$$;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role('support') OR public.has_role('admin') OR public.has_role('super_admin'));

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin'))
  WITH CHECK (id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin'));

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- Roles / permissions readable by authenticated users
CREATE POLICY roles_select_authenticated ON roles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY permissions_select_authenticated ON permissions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY role_permissions_select_authenticated ON role_permissions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY user_roles_select_own ON user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('support'));

-- Audit logs: staff can read, only service role should insert via elevated client
CREATE POLICY audit_logs_select_staff ON audit_logs
  FOR SELECT TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin'));

CREATE POLICY audit_logs_insert_authenticated ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (actor_user_id = auth.uid());

-- Settings: public keys readable by anyone authenticated; writes admin-only
CREATE POLICY app_settings_select_public ON app_settings
  FOR SELECT TO authenticated
  USING (is_public = TRUE OR public.has_role('admin') OR public.has_role('super_admin'));

CREATE POLICY app_settings_select_anon_public ON app_settings
  FOR SELECT TO anon
  USING (is_public = TRUE);

CREATE POLICY app_settings_write_admin ON app_settings
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin'));
