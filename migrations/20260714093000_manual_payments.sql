-- Manual Mobile Money payment requests (WhatsApp screenshot confirmation)

CREATE TABLE IF NOT EXISTS manual_payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  amount INT NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'XOF',
  payer_phone TEXT NOT NULL,
  payer_name TEXT,
  network TEXT,
  transaction_ref TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS manual_payment_requests_user_idx
  ON manual_payment_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS manual_payment_requests_status_idx
  ON manual_payment_requests (status, created_at DESC);

CREATE TRIGGER manual_payment_requests_updated_at
  BEFORE UPDATE ON manual_payment_requests
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE manual_payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY manual_payment_requests_own ON manual_payment_requests
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role('admin')
    OR public.has_role('super_admin')
    OR public.has_role('support')
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.has_role('admin')
    OR public.has_role('super_admin')
    OR public.has_role('support')
  );

INSERT INTO app_settings (key, value, is_public) VALUES
  (
    'manual_payment.config',
    '{
      "enabled": true,
      "whatsapp": "",
      "whatsappMessage": "Bonjour, j''ai payé mon abonnement Académie 2000 (2 000 FCFA). Voici la capture d''écran.",
      "contacts": [],
      "instructions": "1) Payez 2 000 FCFA via Mobile Money aux numéros ci-dessous.\\n2) Envoyez la capture WhatsApp.\\n3) Remplissez le formulaire.\\n4) Un admin confirme et active votre accès."
    }'::jsonb,
    TRUE
  )
ON CONFLICT (key) DO NOTHING;
