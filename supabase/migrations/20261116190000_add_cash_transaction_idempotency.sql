ALTER TABLE public.cash_transactions
  ADD COLUMN IF NOT EXISTS idempotency_key UUID,
  ADD COLUMN IF NOT EXISTS idempotency_actor_id UUID REFERENCES public.members(id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cash_transactions_idempotency_key
  ON public.cash_transactions(idempotency_key)
  WHERE idempotency_key IS NOT NULL;
