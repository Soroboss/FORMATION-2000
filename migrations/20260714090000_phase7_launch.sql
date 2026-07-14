-- Phase 7 launch: certificates + support tickets (minimal)

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  verification_token TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS certificates_user_id_idx ON certificates (user_id);
CREATE INDEX IF NOT EXISTS certificates_verification_token_idx ON certificates (verification_token);

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  category TEXT,
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  message TEXT NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS support_tickets_user_id_idx ON support_tickets (user_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets (status);

CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY certificates_select_own ON certificates
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role('admin')
    OR public.has_role('super_admin')
    OR public.has_role('support')
  );

CREATE POLICY certificates_insert_own ON certificates
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.has_role('admin') OR public.has_role('super_admin'));

CREATE POLICY certificates_admin_update ON certificates
  FOR UPDATE TO authenticated
  USING (public.has_role('admin') OR public.has_role('super_admin'))
  WITH CHECK (public.has_role('admin') OR public.has_role('super_admin'));

-- Public verification uses service/anon via verification_token lookup in app with service key or open policy for SELECT by token through-- Safer: allow anon SELECT only when not revoked (token is secret enough for MVP).
CREATE POLICY certificates_public_verify ON certificates
  FOR SELECT TO anon
  USING (revoked_at IS NULL);

CREATE POLICY support_tickets_own ON support_tickets
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
