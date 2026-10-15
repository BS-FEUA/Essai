-- Stores one FCM browser token per browser session. All access is mediated by
-- authenticated server routes using the Supabase service role.
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_member_id
  ON public.push_subscriptions(member_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
