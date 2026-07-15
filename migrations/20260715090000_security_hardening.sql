-- Security hardening: FORCE RLS on sensitive tables, tighten audit_logs insert

ALTER TABLE payments FORCE ROW LEVEL SECURITY;
ALTER TABLE payment_events FORCE ROW LEVEL SECURITY;
ALTER TABLE subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE user_roles FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE app_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE courses FORCE ROW LEVEL SECURITY;
ALTER TABLE lessons FORCE ROW LEVEL SECURITY;
ALTER TABLE manual_payment_requests FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_insert_authenticated ON audit_logs;

CREATE POLICY audit_logs_insert_staff ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    actor_user_id = auth.uid()
    AND public.is_staff()
  );
