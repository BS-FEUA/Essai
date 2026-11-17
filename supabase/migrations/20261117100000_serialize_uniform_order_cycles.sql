CREATE OR REPLACE FUNCTION public.create_uniform_order(
  p_member_id UUID,
  p_taille TEXT,
  p_quantity INTEGER,
  p_total_amount INTEGER,
  p_notes TEXT,
  p_payment_method TEXT,
  p_payment_ref TEXT,
  p_payment_proof_path TEXT
)
RETURNS SETOF public.uniform_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  next_cycle INTEGER;
  created_order public.uniform_orders;
BEGIN
  IF p_member_id IS NULL OR p_quantity IS NULL OR p_quantity < 1 OR p_quantity > 10
    OR p_total_amount IS NULL OR p_total_amount <= 0 THEN
    RAISE EXCEPTION 'INVALID_UNIFORM_ORDER';
  END IF;

  -- Serialize cycle allocation per member so simultaneous requests cannot reuse a cycle.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_member_id::TEXT, 0));

  SELECT COALESCE(MAX(cycle), 0) + 1
  INTO next_cycle
  FROM public.uniform_orders
  WHERE member_id = p_member_id;

  INSERT INTO public.uniform_orders (
    member_id,
    cycle,
    taille,
    quantity,
    total_amount,
    notes,
    payment_method,
    payment_ref,
    payment_proof_path
  ) VALUES (
    p_member_id,
    next_cycle,
    p_taille,
    p_quantity,
    p_total_amount,
    p_notes,
    p_payment_method,
    p_payment_ref,
    p_payment_proof_path
  )
  RETURNING * INTO created_order;

  RETURN NEXT created_order;
END;
$$;

REVOKE ALL ON FUNCTION public.create_uniform_order(UUID, TEXT, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_uniform_order(UUID, TEXT, INTEGER, INTEGER, TEXT, TEXT, TEXT, TEXT)
  TO service_role;
