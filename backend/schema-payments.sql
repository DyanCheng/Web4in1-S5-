-- Unified payment flow (order_payments + booking_refs)
-- Each checkout creates:
--   1) pending booking(s) per service
--   2) one order_payments row with matching amount and booking_refs
--
-- order_items JSON shape (stored in order_payments.order_items):
-- {
--   "serviceType": "tour|bus|flight|insurance|vehicle",
--   "referenceId": "product id in source service",
--   "bookingRef": "ORD-* | BB-* | FLI-* | INS-* | VEH-*",
--   "title": "...",
--   "image": "...",
--   "price": unit price shown at checkout,
--   "quantity": 1,
--   "guests": 2,
--   "date": "2026-07-18",
--   "lineTotal": amount used for payment subtotal,
--   "extra": { optional metadata }
-- }
--
-- booking_refs array links payment confirmation to service bookings:
--   ORD-*  -> public.bookings (tours) via confirm_booking RPC
--   BB-*   -> in-memory bus bookings via backend CheckoutService
--   FLI/INS/VEH-* -> virtual refs stored in order_items (paid = confirmed)

-- Ensure confirm_order_payment keeps booking_refs and order_items intact.
-- No DDL required for unified flow; existing order_payments table is the ledger.

GRANT EXECUTE ON FUNCTION public.create_order_payment TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_order_payment_by_code TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.confirm_order_payment TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.list_order_payments_admin TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_payment_admin_summary TO anon, authenticated, service_role;
