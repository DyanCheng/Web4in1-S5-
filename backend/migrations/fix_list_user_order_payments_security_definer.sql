-- Fix dashboard invoices: list_user_order_payments needs SECURITY DEFINER
-- because order_payments has no table grants for API roles.
CREATE OR REPLACE FUNCTION public.list_user_order_payments(
  p_user_email text DEFAULT NULL,
  p_user_id bigint DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT COALESCE(json_agg(t ORDER BY t.paid_at DESC NULLS LAST, t.created_at DESC), '[]'::json)
  INTO v_result
  FROM (
    SELECT
      op.order_payment_id,
      op.payment_code,
      op.amount,
      op.payment_status,
      CASE WHEN op.paid_at IS NULL THEN NULL ELSE (op.paid_at AT TIME ZONE 'UTC') END AS paid_at,
      (op.created_at AT TIME ZONE 'UTC') AS created_at,
      op.order_items,
      op.booking_refs,
      op.user_email,
      op.user_name
    FROM public.order_payments op
    WHERE op.payment_status = 'paid'
      AND (
        (p_user_id IS NOT NULL AND op.user_id = p_user_id)
        OR (p_user_email IS NOT NULL AND LOWER(op.user_email) = LOWER(trim(p_user_email)))
      )
  ) t;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_user_order_payments(text, bigint) TO anon, authenticated, service_role;
