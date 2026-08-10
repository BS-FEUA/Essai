-- ============ TRIGGERS ============

-- 1. Trigger to automatically create a member profile when a Supabase Auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- We assume that the application will insert the member details via API shortly after,
  -- or we can just initialize a basic stub.
  -- But since the Next.js API uses supabaseAdmin to create the user and insert member,
  -- we might not need this trigger if the API does both.
  -- To be safe, we'll only insert if it doesn't exist, using basic metadata.
  IF NOT EXISTS (SELECT 1 FROM public.members WHERE id = NEW.id) THEN
    INSERT INTO public.members (id, email, matricule, first_name, last_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'matricule', 'FEUA-' || floor(random() * 900000 + 100000)::text),
      COALESCE(NEW.raw_user_meta_data->>'firstName', 'Utilisateur'),
      COALESCE(NEW.raw_user_meta_data->>'lastName', 'Nouveau')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Trigger to prevent UPDATE or DELETE on audit_logs (Mémoire H immuable)
CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Les journaux d''audit (Mémoire H) sont immuables et ne peuvent pas être modifiés ou supprimés.';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER prevent_audit_log_update_delete
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE PROCEDURE public.prevent_audit_log_modification();


-- 3. Trigger to update cash_register balance automatically
CREATE OR REPLACE FUNCTION public.update_cash_register_balance()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'COMPLETED' THEN
      IF NEW.type IN ('DEPOSIT', 'REFUND') THEN
        UPDATE public.cash_registers SET balance = balance + NEW.amount WHERE id = NEW.register_id;
      ELSIF NEW.type IN ('WITHDRAWAL', 'PAYMENT', 'TRANSFER') THEN
        UPDATE public.cash_registers SET balance = balance - NEW.amount WHERE id = NEW.register_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If status changed to COMPLETED
    IF OLD.status != 'COMPLETED' AND NEW.status = 'COMPLETED' THEN
      IF NEW.type IN ('DEPOSIT', 'REFUND') THEN
        UPDATE public.cash_registers SET balance = balance + NEW.amount WHERE id = NEW.register_id;
      ELSIF NEW.type IN ('WITHDRAWAL', 'PAYMENT', 'TRANSFER') THEN
        UPDATE public.cash_registers SET balance = balance - NEW.amount WHERE id = NEW.register_id;
      END IF;
    -- If status changed from COMPLETED to something else (e.g. CANCELLED)
    ELSIF OLD.status = 'COMPLETED' AND NEW.status != 'COMPLETED' THEN
      IF OLD.type IN ('DEPOSIT', 'REFUND') THEN
        UPDATE public.cash_registers SET balance = balance - OLD.amount WHERE id = OLD.register_id;
      ELSIF OLD.type IN ('WITHDRAWAL', 'PAYMENT', 'TRANSFER') THEN
        UPDATE public.cash_registers SET balance = balance + OLD.amount WHERE id = OLD.register_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'COMPLETED' THEN
      IF OLD.type IN ('DEPOSIT', 'REFUND') THEN
        UPDATE public.cash_registers SET balance = balance - OLD.amount WHERE id = OLD.register_id;
      ELSIF OLD.type IN ('WITHDRAWAL', 'PAYMENT', 'TRANSFER') THEN
        UPDATE public.cash_registers SET balance = balance + OLD.amount WHERE id = OLD.register_id;
      END IF;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_cash_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.cash_transactions
  FOR EACH ROW EXECUTE PROCEDURE public.update_cash_register_balance();
