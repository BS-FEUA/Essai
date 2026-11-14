-- Harden trigger function privileges and search paths, and index foreign keys
-- reported by Supabase advisors.

ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.prevent_audit_log_modification() SET search_path = '';
ALTER FUNCTION public.update_cash_register_balance() SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON public.announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_cash_registers_created_by ON public.cash_registers(created_by);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_validated_by ON public.cash_transactions(validated_by);
CREATE INDEX IF NOT EXISTS idx_indiscipline_records_recorded_by ON public.indiscipline_records(recorded_by);
CREATE INDEX IF NOT EXISTS idx_invitation_codes_invited_by ON public.invitation_codes(invited_by);
CREATE INDEX IF NOT EXISTS idx_members_invited_by ON public.members(invited_by);
CREATE INDEX IF NOT EXISTS idx_members_validated_by ON public.members(validated_by);
CREATE INDEX IF NOT EXISTS idx_uniform_orders_validated1_by ON public.uniform_orders(validated1_by);
CREATE INDEX IF NOT EXISTS idx_uniform_orders_validated2_by ON public.uniform_orders(validated2_by);
