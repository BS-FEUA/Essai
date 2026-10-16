-- Keep payment receipts private; the application server provides short-lived
-- signed links only to the order owner and authorized administrators.
ALTER TABLE public.uniform_orders
  ADD COLUMN IF NOT EXISTS payment_proof_path TEXT;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uniform-payment-proofs',
  'uniform-payment-proofs',
  FALSE,
  4194304,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = FALSE,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Keep existing student profiles aligned with the current institution name.
UPDATE public.members
SET institution = regexp_replace(institution, 'IUT', 'INSTI', 'gi')
WHERE institution ~* 'IUT';

UPDATE public.members
SET filiere = regexp_replace(filiere, 'IUT', 'INSTI', 'gi')
WHERE filiere ~* 'IUT';
