-- 1. Create hotel_bookings table
CREATE TABLE IF NOT EXISTS public.hotel_bookings (
  booking_id varchar PRIMARY KEY,
  hotel_id varchar NOT NULL,
  hotel_name varchar NOT NULL,
  hotel_image varchar,
  room_id varchar NOT NULL,
  room_name varchar NOT NULL,
  user_id varchar NOT NULL,
  user_email varchar NOT NULL,
  check_in_date varchar NOT NULL,
  check_out_date varchar NOT NULL,
  room_quantity int NOT NULL DEFAULT 1,
  adults int NOT NULL DEFAULT 2,
  children int NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL,
  status varchar NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Create RPC to insert hotel_booking
CREATE OR REPLACE FUNCTION public.create_hotel_booking(
  p_booking_id varchar,
  p_hotel_id varchar,
  p_hotel_name varchar,
  p_hotel_image varchar,
  p_room_id varchar,
  p_room_name varchar,
  p_user_id varchar,
  p_user_email varchar,
  p_check_in_date varchar,
  p_check_out_date varchar,
  p_room_quantity int,
  p_adults int,
  p_children int,
  p_total_amount numeric,
  p_status varchar
) RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_result json;
BEGIN
  INSERT INTO public.hotel_bookings (
    booking_id, hotel_id, hotel_name, hotel_image, room_id, room_name,
    user_id, user_email, check_in_date, check_out_date,
    room_quantity, adults, children, total_amount, status
  ) VALUES (
    p_booking_id, p_hotel_id, p_hotel_name, p_hotel_image, p_room_id, p_room_name,
    p_user_id, p_user_email, p_check_in_date, p_check_out_date,
    p_room_quantity, p_adults, p_children, p_total_amount, p_status
  )
  RETURNING row_to_json(hotel_bookings.*) INTO v_result;

  RETURN v_result;
END;
$$;

-- 3. Create RPC to get user hotel bookings
CREATE OR REPLACE FUNCTION public.get_user_hotel_bookings(p_user_id varchar)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_agg(b) INTO v_result
  FROM (
    SELECT *
    FROM public.hotel_bookings
    WHERE user_id = p_user_id OR user_email = p_user_id
    ORDER BY created_at DESC
  ) b;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- 4. Create RPC to confirm hotel booking
CREATE OR REPLACE FUNCTION public.confirm_hotel_booking(p_booking_id varchar)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_result json;
BEGIN
  UPDATE public.hotel_bookings
  SET status = 'paid'
  WHERE booking_id = p_booking_id
  RETURNING row_to_json(hotel_bookings.*) INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.create_hotel_booking TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_hotel_bookings TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.confirm_hotel_booking TO anon, authenticated, service_role;
