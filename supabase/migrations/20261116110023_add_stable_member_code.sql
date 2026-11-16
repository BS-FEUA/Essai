ALTER TABLE public.members
  ADD COLUMN member_code text NOT NULL
    DEFAULT ('FEUA-' || upper(replace(gen_random_uuid()::text, '-', '')));

CREATE UNIQUE INDEX members_member_code_key
  ON public.members (member_code);
