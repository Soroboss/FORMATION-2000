-- Demandes de retrait de contenu (créateurs / ayants droit)

CREATE TABLE IF NOT EXISTS takedown_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_name TEXT NOT NULL,
  creator_email TEXT NOT NULL,
  video_url TEXT NOT NULL,
  reason TEXT NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_review', 'accepted', 'rejected')),
  admin_note TEXT,
  handled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  handled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS takedown_requests_status_idx
  ON takedown_requests (status, created_at DESC);

CREATE TRIGGER takedown_requests_updated_at
  BEFORE UPDATE ON takedown_requests
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE takedown_requests ENABLE ROW LEVEL SECURITY;

-- Soumissions publiques via clé service côté serveur ; lecture/traitement staff.
CREATE POLICY takedown_requests_staff ON takedown_requests
  FOR ALL TO authenticated
  USING (
    public.has_role('admin')
    OR public.has_role('super_admin')
    OR public.has_role('support')
  )
  WITH CHECK (
    public.has_role('admin')
    OR public.has_role('super_admin')
    OR public.has_role('support')
  );
