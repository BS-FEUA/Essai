-- Keep sensitive member and audit data behind the authenticated Next.js API.
-- API routes use the server-only service role and perform role checks before access.
BEGIN;

-- RLS policies are row-based; they do not prevent a member from changing
-- protected columns in their own row. Remove direct Data API access entirely.
REVOKE ALL PRIVILEGES ON TABLE public.members FROM anon, authenticated;
DROP POLICY IF EXISTS "Members are viewable by all authenticated users" ON public.members;
DROP POLICY IF EXISTS "Members can update their own profile" ON public.members;

-- Audit entries are written and read only by server routes. Prevent clients
-- from reading private logs or inserting forged entries with another actor id.
REVOKE ALL PRIVILEGES ON TABLE public.audit_logs FROM anon, authenticated;
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "CEO and MAST_IN can view audit logs" ON public.audit_logs;

COMMIT;
