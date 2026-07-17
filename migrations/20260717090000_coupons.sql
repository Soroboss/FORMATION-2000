-- Coupons & promotions (réductions à l'abonnement)

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value INT NOT NULL CHECK (discount_value > 0),
  currency TEXT NOT NULL DEFAULT 'XOF',
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  min_amount INT,
  max_redemptions INT,
  redeemed_count INT NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coupons_active_idx ON coupons (is_active, code);

CREATE TRIGGER coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Seuls les membres du staff manipulent les coupons ; la validation au paiement
-- passe par la clé service côté serveur.
CREATE POLICY coupons_staff ON coupons
  FOR ALL TO authenticated
  USING (
    public.has_role('admin')
    OR public.has_role('super_admin')
  )
  WITH CHECK (
    public.has_role('admin')
    OR public.has_role('super_admin')
  );

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  amount_discounted INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (coupon_id, user_id)
);

CREATE INDEX IF NOT EXISTS coupon_redemptions_coupon_idx
  ON coupon_redemptions (coupon_id, created_at DESC);

ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY coupon_redemptions_staff ON coupon_redemptions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role('admin')
    OR public.has_role('super_admin')
  );

-- Traçabilité de la réduction appliquée sur un paiement.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS discount_amount BIGINT NOT NULL DEFAULT 0;
