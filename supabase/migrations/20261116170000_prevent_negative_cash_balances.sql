CREATE OR REPLACE FUNCTION public.update_cash_register_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'COMPLETED' THEN
      IF NEW.type IN ('DEPOSIT', 'REFUND') THEN
        UPDATE public.cash_registers SET balance = balance + NEW.amount WHERE id = NEW.register_id;
      ELSIF NEW.type IN ('WITHDRAWAL', 'PAYMENT', 'TRANSFER') THEN
        UPDATE public.cash_registers
        SET balance = balance - NEW.amount
        WHERE id = NEW.register_id AND balance >= NEW.amount;
        IF NOT FOUND THEN
          RAISE EXCEPTION 'INSUFFICIENT_CASH_BALANCE' USING ERRCODE = 'P0001';
        END IF;
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'COMPLETED' AND NEW.status = 'COMPLETED' THEN
      IF NEW.type IN ('DEPOSIT', 'REFUND') THEN
        UPDATE public.cash_registers SET balance = balance + NEW.amount WHERE id = NEW.register_id;
      ELSIF NEW.type IN ('WITHDRAWAL', 'PAYMENT', 'TRANSFER') THEN
        UPDATE public.cash_registers
        SET balance = balance - NEW.amount
        WHERE id = NEW.register_id AND balance >= NEW.amount;
        IF NOT FOUND THEN
          RAISE EXCEPTION 'INSUFFICIENT_CASH_BALANCE' USING ERRCODE = 'P0001';
        END IF;
      END IF;
    ELSIF OLD.status = 'COMPLETED' AND NEW.status != 'COMPLETED' THEN
      IF OLD.type IN ('DEPOSIT', 'REFUND') THEN
        UPDATE public.cash_registers
        SET balance = balance - OLD.amount
        WHERE id = OLD.register_id AND balance >= OLD.amount;
        IF NOT FOUND THEN
          RAISE EXCEPTION 'INSUFFICIENT_CASH_BALANCE' USING ERRCODE = 'P0001';
        END IF;
      ELSIF OLD.type IN ('WITHDRAWAL', 'PAYMENT', 'TRANSFER') THEN
        UPDATE public.cash_registers SET balance = balance + OLD.amount WHERE id = OLD.register_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'COMPLETED' THEN
    IF OLD.type IN ('DEPOSIT', 'REFUND') THEN
      UPDATE public.cash_registers
      SET balance = balance - OLD.amount
      WHERE id = OLD.register_id AND balance >= OLD.amount;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'INSUFFICIENT_CASH_BALANCE' USING ERRCODE = 'P0001';
      END IF;
    ELSIF OLD.type IN ('WITHDRAWAL', 'PAYMENT', 'TRANSFER') THEN
      UPDATE public.cash_registers SET balance = balance + OLD.amount WHERE id = OLD.register_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;
