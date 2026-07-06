CREATE OR REPLACE FUNCTION get_real_user_hotel_bookings(p_auth_user_id text)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id bigint;
    v_result json;
BEGIN
    SELECT user_id INTO v_user_id FROM public.users WHERE email = p_auth_user_id;

    IF v_user_id IS NULL AND p_auth_user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        SELECT user_id INTO v_user_id
        FROM public.users
        WHERE email = (SELECT email FROM auth.users WHERE id = p_auth_user_id::uuid);
    END IF;
    
    IF v_user_id IS NULL THEN
        RETURN '[]'::json;
    END IF;

    SELECT json_agg(json_build_object(
        'hotel_booking_id', hb.hotel_booking_id,
        'user_id', hb.user_id,
        'booking_code', hb.booking_code,
        'booking_status', hb.booking_status,
        'payment_status', hb.payment_status,
        'total_price', hb.total_price,
        'total_nights', hb.total_nights,
        'check_in_date', hb.check_in_date,
        'check_out_date', hb.check_out_date,
        'details', (
            SELECT json_agg(json_build_object(
                'detail_id', hbd.detail_id,
                'hotel_booking_id', hbd.hotel_booking_id,
                'room_id', hbd.room_id,
                'quantity', hbd.quantity,
                'price', hbd.price,
                'hotel', (
                    SELECT json_build_object(
                        'id', h.hotel_id::text,
                        'name', h.hotel_name,
                        'location', h.address,
                        'image', (SELECT image_url FROM public.hotel_images hi WHERE hi.hotel_id = h.hotel_id LIMIT 1)
                    )
                    FROM public.hotels h WHERE h.hotel_id = hb.hotel_id
                ),
                'room', (
                    SELECT json_build_object(
                        'id', hr.room_id::text,
                        'name', hr.room_type,
                        'image', hr.image_url
                    )
                    FROM public.hotel_rooms hr WHERE hr.room_id = hbd.room_id
                )
            ))
            FROM public.hotel_booking_details hbd
            WHERE hbd.hotel_booking_id = hb.hotel_booking_id
        )
    )) INTO v_result
    FROM public.hotel_bookings hb
    WHERE hb.user_id = v_user_id;

    RETURN COALESCE(v_result, '[]'::json);
END;
$$;

CREATE OR REPLACE FUNCTION create_real_hotel_booking(
    p_booking_code text,
    p_auth_user_id text,
    p_hotel_id bigint,
    p_room_id bigint,
    p_check_in_date date,
    p_check_out_date date,
    p_total_nights integer,
    p_total_price numeric,
    p_quantity integer,
    p_room_price numeric,
    p_payment_status text
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id bigint;
    v_booking_id bigint;
    v_result json;
BEGIN
    SELECT user_id INTO v_user_id FROM public.users WHERE email = p_auth_user_id;

    IF v_user_id IS NULL AND p_auth_user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        SELECT user_id INTO v_user_id
        FROM public.users
        WHERE email = (SELECT email FROM auth.users WHERE id = p_auth_user_id::uuid);
    END IF;
    
    IF v_user_id IS NULL THEN
        SELECT user_id INTO v_user_id FROM public.users LIMIT 1;
    END IF;

    INSERT INTO public.hotel_bookings (
        user_id, hotel_id, booking_code, booking_status, payment_status, total_price, total_nights, check_in_date, check_out_date, created_at, updated_at
    ) VALUES (
        v_user_id, p_hotel_id, p_booking_code, 'pending', p_payment_status, p_total_price, p_total_nights, p_check_in_date, p_check_out_date, NOW(), NOW()
    ) RETURNING hotel_booking_id INTO v_booking_id;

    INSERT INTO public.hotel_booking_details (
        hotel_booking_id, room_id, quantity, price
    ) VALUES (
        v_booking_id, p_room_id, p_quantity, p_room_price
    );

    SELECT json_build_object(
        'hotel_booking_id', hb.hotel_booking_id,
        'user_id', hb.user_id,
        'hotel_id', hb.hotel_id,
        'booking_code', hb.booking_code,
        'booking_status', hb.booking_status,
        'payment_status', hb.payment_status,
        'total_price', hb.total_price,
        'total_nights', hb.total_nights,
        'check_in_date', hb.check_in_date,
        'check_out_date', hb.check_out_date,
        'details', (
            SELECT json_agg(json_build_object(
                'detail_id', hbd.detail_id,
                'hotel_booking_id', hbd.hotel_booking_id,
                'room_id', hbd.room_id,
                'quantity', hbd.quantity,
                'price', hbd.price
            ))
            FROM public.hotel_booking_details hbd
            WHERE hbd.hotel_booking_id = hb.hotel_booking_id
        )
    ) INTO v_result
    FROM public.hotel_bookings hb
    WHERE hb.hotel_booking_id = v_booking_id;

    RETURN v_result;
END;
$$;
