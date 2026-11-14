ALTER TABLE public.members
  ADD COLUMN badge_status text NOT NULL DEFAULT 'NOT_REQUESTED'
    CHECK (badge_status IN ('NOT_REQUESTED', 'PENDING', 'APPROVED', 'REJECTED')),
  ADD COLUMN badge_authorized_by uuid REFERENCES public.members(id) ON DELETE SET NULL,
  ADD COLUMN badge_authorized_at timestamptz,
  ADD COLUMN badge_rejection_reason text,
  ADD COLUMN badge_verification_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX members_badge_verification_token_key
  ON public.members (badge_verification_token);
