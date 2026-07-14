-- Phase 3: plans, subscriptions, payments, payment_events

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_amount BIGINT NOT NULL CHECK (price_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'XOF',
  duration_days INT NOT NULL DEFAULT 30 CHECK (duration_days > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL CHECK (status IN (
    'pending', 'active', 'grace_period', 'expired', 'cancelled', 'suspended', 'refunded'
  )),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  grace_ends_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at >= starts_at)
);

CREATE INDEX IF NOT EXISTS subscriptions_user_status_idx ON subscriptions (user_id, status);
CREATE INDEX IF NOT EXISTS subscriptions_ends_at_idx ON subscriptions (ends_at);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES plans(id),
  provider TEXT NOT NULL,
  provider_reference TEXT UNIQUE,
  internal_reference TEXT UNIQUE NOT NULL,
  amount BIGINT NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'XOF',
  status TEXT NOT NULL CHECK (status IN (
    'initiated', 'pending', 'successful', 'failed', 'cancelled', 'expired',
    'refunded', 'partially_refunded'
  )),
  payment_method TEXT,
  provider_fee BIGINT,
  net_amount BIGINT,
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments (user_id);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments (status);
CREATE INDEX IF NOT EXISTS payments_provider_reference_idx ON payments (provider_reference);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  event_id TEXT,
  event_type TEXT,
  payload_hash TEXT,
  payload JSONB,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, event_id)
);

CREATE INDEX IF NOT EXISTS payment_events_payment_id_idx ON payment_events (payment_id);
CREATE INDEX IF NOT EXISTS payment_events_processed_idx ON payment_events (processed);

-- Seed monthly plan
INSERT INTO plans (id, name, slug, description, price_amount, currency, duration_days, is_active, features)
VALUES (
  '66666666-6666-4666-8666-666666666601',
  'Accès mensuel',
  'acces-mensuel',
  'Accès à toutes les formations incluses pendant 30 jours.',
  2000,
  'XOF',
  30,
  TRUE,
  '["Toutes les formations", "Lecteur YouTube intégré", "Progression", "Support"]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- Helpers
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id
      AND (
        (s.status = 'active' AND s.ends_at > NOW())
        OR (s.status = 'grace_period' AND COALESCE(s.grace_ends_at, s.ends_at) > NOW())
      )
  );
$$;

-- RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY plans_public_read ON plans
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE OR public.has_role('admin') OR public.has_role('super_admin'));

CREATE POLICY plans_admin_write ON plans
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin'));

CREATE POLICY subscriptions_select_own ON subscriptions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role('support')
    OR public.has_role('admin')
    OR public.has_role('super_admin')
  );

-- Learners must never insert/update subscriptions directly (server/service only).
CREATE POLICY subscriptions_admin_write ON subscriptions
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('support'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin') OR public.has_role('support'));

CREATE POLICY payments_select_own ON payments
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role('support')
    OR public.has_role('admin')
    OR public.has_role('super_admin')
  );

-- No INSERT/UPDATE for ordinary authenticated users on payments.
CREATE POLICY payments_admin_write ON payments
  FOR ALL TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin'));

-- payment_events: staff read only; writes via service key
CREATE POLICY payment_events_staff_read ON payment_events
  FOR SELECT TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin'));
