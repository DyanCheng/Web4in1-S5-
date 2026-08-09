-- Tour itinerary activities, adult/child pricing, structured duration
-- Applied via Supabase MCP: tour_itinerary_pricing_and_duration
-- Keep in sync with remote RPCs used by TourDbService.

ALTER TABLE public.tour_itineraries
  ADD COLUMN IF NOT EXISTS activities jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.tour_itineraries
SET activities = jsonb_build_array(
  jsonb_build_object(
    'time', COALESCE(to_char(start_time, 'HH24:MI'), ''),
    'desc', COALESCE(description, '')
  )
)
WHERE (activities IS NULL OR activities = '[]'::jsonb)
  AND (description IS NOT NULL OR start_time IS NOT NULL);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tour_itineraries TO anon, authenticated, service_role;

-- See remote migration for full function bodies:
-- tour_to_json, replace_tour_itinerary, format_tour_duration,
-- get_tours, get_tours_admin, get_tour_by_id, create_tour, update_tour, create_booking
