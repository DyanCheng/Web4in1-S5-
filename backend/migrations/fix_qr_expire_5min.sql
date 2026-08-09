-- Expire payment codes after 5 minutes; return UTC timestamptz for clients
CREATE OR REPLACE FUNCTION public.expire_order_payment(p_payment_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_row public.order_payments%ROWTYPE;
  v_created timestamptz;
  v_expires timestamptz;
BEGIN
  SELECT * INTO v_row
  FROM public.order_payments
  WHERE payment_code = trim(p_payment_code)
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Không tìm thấy đơn thanh toán';
  END IF;

  -- created_at is timestamp without time zone stored as UTC wall-clock
  v_created := v_row.created_at AT TIME ZONE 'UTC';
  v_expires := v_created + INTERVAL '5 minutes';

  IF v_row.payment_status = 'paid' THEN
    RETURN json_build_object(
      'payment_code', v_row.payment_code,
      'payment_status', v_row.payment_status,
      'amount', v_row.amount,
      'user_email', v_row.user_email,
      'user_name', v_row.user_name,
      'paid_at', CASE WHEN v_row.paid_at IS NULL THEN NULL ELSE (v_row.paid_at AT TIME ZONE 'UTC') END,
      'created_at', v_created,
      'order_items', v_row.order_items,
      'booking_refs', v_row.booking_refs,
      'expired', false,
      'expires_at', v_expires
    );
  END IF;

  IF v_row.payment_status = 'expired' THEN
    RETURN json_build_object(
      'payment_code', v_row.payment_code,
      'payment_status', 'expired',
      'amount', v_row.amount,
      'user_email', v_row.user_email,
      'user_name', v_row.user_name,
      'paid_at', CASE WHEN v_row.paid_at IS NULL THEN NULL ELSE (v_row.paid_at AT TIME ZONE 'UTC') END,
      'created_at', v_created,
      'order_items', v_row.order_items,
      'booking_refs', v_row.booking_refs,
      'expired', true,
      'expires_at', v_expires
    );
  END IF;

  IF v_row.payment_status IN ('pending', 'pending_approval')
     AND v_created <= (NOW() - INTERVAL '5 minutes') THEN
    UPDATE public.order_payments
    SET payment_status = 'expired',
        updated_at = CURRENT_TIMESTAMP
    WHERE payment_code = trim(p_payment_code)
      AND payment_status IN ('pending', 'pending_approval');

    SELECT * INTO v_row FROM public.order_payments WHERE payment_code = trim(p_payment_code);
  END IF;

  RETURN json_build_object(
    'payment_code', v_row.payment_code,
    'payment_status', v_row.payment_status,
    'amount', v_row.amount,
    'user_email', v_row.user_email,
    'user_name', v_row.user_name,
    'paid_at', CASE WHEN v_row.paid_at IS NULL THEN NULL ELSE (v_row.paid_at AT TIME ZONE 'UTC') END,
    'created_at', v_created,
    'order_items', v_row.order_items,
    'booking_refs', v_row.booking_refs,
    'expired', v_row.payment_status = 'expired',
    'expires_at', v_expires
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.expire_order_payment(text) TO anon, authenticated, service_role;
