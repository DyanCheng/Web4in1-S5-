-- Fix checkout: hotel permissions, tour slots, payment RPC overload.
-- Applied remotely via Supabase MCP (fix_hotel_tour_booking_permissions_and_slots,
-- drop_ambiguous_create_order_payment_overload).

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.hotel_rooms TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.hotel_room_inventories TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.hotel_bookings TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.hotel_booking_details TO anon, authenticated, service_role;

-- Recalculate tour schedule slots from active bookings
UPDATE public.tour_schedules s
SET available_slots = GREATEST(
  COALESCE(s.total_slots, 100) - COALESCE((
    SELECT SUM(b.total_people)::int
    FROM public.bookings b
    WHERE b.schedule_id = s.schedule_id
      AND b.booking_status IN ('pending', 'confirmed', 'cancel_pending')
  ), 0),
  0
),
updated_at = NOW();

-- Keep only the idempotent create_order_payment overload (PostgREST ambiguity fix)
DROP FUNCTION IF EXISTS public.create_order_payment(text, bigint, text, text, numeric, jsonb, jsonb);

GRANT EXECUTE ON FUNCTION public.create_order_payment(text, bigint, text, text, numeric, jsonb, jsonb, text)
  TO anon, authenticated, service_role;
