-- Shared atomic rate limits for server-side API routes.
-- The key is HMACed by the application, so this table never stores raw IPs/emails.
BEGIN;

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  key_hash text PRIMARY KEY CHECK (key_hash ~ '^[0-9a-f]{64}$'),
  hits integer NOT NULL CHECK (hits > 0),
  reset_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_buckets_reset_at
  ON public.rate_limit_buckets (reset_at);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.rate_limit_buckets FROM PUBLIC, anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.rate_limit_buckets TO service_role;

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_allowed boolean;
BEGIN
  IF p_key_hash IS NULL
     OR p_key_hash !~ '^[0-9a-f]{64}$'
     OR p_limit IS NULL OR p_limit < 1 OR p_limit > 10000
     OR p_window_seconds IS NULL OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RAISE EXCEPTION 'Invalid rate limit parameters';
  END IF;

  INSERT INTO public.rate_limit_buckets AS bucket (key_hash, hits, reset_at, updated_at)
  VALUES (
    p_key_hash,
    1,
    v_now + pg_catalog.make_interval(secs => p_window_seconds),
    v_now
  )
  ON CONFLICT (key_hash) DO UPDATE
  SET hits = CASE WHEN bucket.reset_at <= v_now THEN 1 ELSE bucket.hits + 1 END,
      reset_at = CASE
        WHEN bucket.reset_at <= v_now THEN v_now + pg_catalog.make_interval(secs => p_window_seconds)
        ELSE bucket.reset_at
      END,
      updated_at = v_now
  RETURNING hits <= p_limit INTO v_allowed;

  -- Keep the table bounded without making every request perform an unbounded cleanup.
  WITH expired AS (
    SELECT key_hash
    FROM public.rate_limit_buckets
    WHERE reset_at < v_now - interval '24 hours'
    ORDER BY reset_at
    LIMIT 200
  )
  DELETE FROM public.rate_limit_buckets AS buckets
  USING expired
  WHERE buckets.key_hash = expired.key_hash;

  RETURN v_allowed;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(text, integer, integer) TO service_role;

NOTIFY pgrst, 'reload schema';
COMMIT;
