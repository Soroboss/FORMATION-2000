-- Phase 11: support_messages, reminder idempotency for expiration cron

CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_messages_ticket_id_idx
  ON support_messages (ticket_id, created_at);

ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY support_messages_access ON support_messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = support_messages.ticket_id
        AND (
          t.user_id = auth.uid()
          OR public.has_role('admin')
          OR public.has_role('super_admin')
          OR public.has_role('support')
        )
    )
  )
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = support_messages.ticket_id
        AND (
          t.user_id = auth.uid()
          OR public.has_role('admin')
          OR public.has_role('super_admin')
          OR public.has_role('support')
        )
    )
  );

-- Backfill first message from legacy support_tickets.message
INSERT INTO support_messages (ticket_id, sender_id, message, is_internal, created_at)
SELECT t.id, t.user_id, t.message, FALSE, t.created_at
FROM support_tickets t
WHERE t.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM support_messages m WHERE m.ticket_id = t.id
  );

CREATE TABLE IF NOT EXISTS subscription_reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN (
    'expires_in_7d',
    'expires_in_3d',
    'expires_in_1d',
    'expired'
  )),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (subscription_id, reminder_type)
);

CREATE INDEX IF NOT EXISTS subscription_reminder_logs_type_idx
  ON subscription_reminder_logs (reminder_type, sent_at);

ALTER TABLE subscription_reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscription_reminder_logs_staff ON subscription_reminder_logs
  FOR ALL TO authenticated
  USING (
    public.has_role('admin')
    OR public.has_role('super_admin')
  )
  WITH CHECK (
    public.has_role('admin')
    OR public.has_role('super_admin')
  );
