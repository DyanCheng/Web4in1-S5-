-- Thứ tự chạy migration: schema.sql → schema-payments.sql → update_rpcs.sql
-- → seed_hotels.sql → setup_hotel_bookings.sql → insert_more_rooms.sql → setup_realtime_chat.sql → setup_chat_messages_room.sql → setup_support_chat.sql → setup_auth_logs.sql
-- 1. Alter Tours Table to support frontend properties
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS duration text;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS highlights text[];
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS included text[];
ALTER TABLE public.tours ADD COLUMN IF NOT EXISTS excluded text[];

-- 2. Seed default detailed values for the top 5 tours
UPDATE public.tours
SET 
  location = 'Quảng Ninh',
  duration = '2 ngày 1 đêm',
  image_url = 'https://images.unsplash.com/photo-1643029891412-92f9a81a8c16',
  highlights = ARRAY[
    'Du thuyền 5 sao ngủ đêm trên vịnh',
    'Thăm hang Sửng Sốt, động Thiên Cung',
    'Chèo kayak khám phá làng chài',
    'Câu mực đêm trên biển',
    'Buffet hải sản tươi sống',
    'Tập Thái Cực Quyền trên boong tàu'
  ],
  included = ARRAY[
    'Xe đưa đón từ Hà Nội',
    'Du thuyền 5 sao',
    '2 bữa ăn chính + bữa sáng',
    'Vé thăm quan',
    'Hướng dẫn viên tiếng Việt',
    'Bảo hiểm du lịch'
  ],
  excluded = ARRAY[
    'Chi phí cá nhân',
    'Đồ uống có cồn',
    'Tip hướng dẫn viên'
  ]
WHERE tour_id = 1;

UPDATE public.tours
SET 
  location = 'Lào Cai',
  duration = '3 ngày 2 đêm',
  image_url = 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3',
  highlights = ARRAY[
    'Cáp treo Fansipan 3 dây',
    'Bản Cát Cát mộc mạc',
    'Thung lũng Mường Hoa',
    'Khách sạn trung tâm Sapa',
    'Thịt trâu gác bếp & rượu ngô'
  ],
  included = ARRAY[
    'Xe giường nằm Hà Nội - Sapa',
    'Khách sạn 3 sao',
    'Các bữa ăn theo chương trình',
    'Vé tham quan Cát Cát'
  ],
  excluded = ARRAY[
    'Vé cáp treo Fansipan (800k)',
    'Chi phí cá nhân',
    'Đồ uống'
  ]
WHERE tour_id = 2;

UPDATE public.tours
SET 
  location = 'Lâm Đồng',
  duration = '3 ngày 2 đêm',
  image_url = 'https://images.unsplash.com/photo-1599576838688-8aab534cabb1',
  highlights = ARRAY[
    'Hồ Xuân Hương lãng mạn',
    'Vườn hoa thành phố rực rỡ',
    'Thung lũng Tình Yêu xanh mát',
    'Đồi chè Cầu Đất mênh mông',
    'Chợ đêm Đà Lạt nhộn nhịp',
    'Cưỡi ngựa ngắm thành phố'
  ],
  included = ARRAY[
    'Xe limousine đưa đón',
    'Khách sạn 4 sao view đồi',
    'Ăn sáng buffet',
    'Vé tham quan các điểm',
    'Hướng dẫn viên nhiệt tình'
  ],
  excluded = ARRAY[
    'Vé cáp treo',
    'Trải nghiệm thú vị lẻ',
    'Chi phí cá nhân'
  ]
WHERE tour_id = 3;

UPDATE public.tours
SET 
  location = 'Kiên Giang',
  duration = '3 ngày 2 đêm',
  image_url = 'https://images.unsplash.com/photo-1732243395944-cb3ff9311091',
  highlights = ARRAY[
    'Resort 5 sao view biển',
    'Lặn ngắm san hô tại Hòn Thơm',
    'Câu cá & BBQ hải sản',
    'Tham quan vườn tiêu, làng chài',
    'VinWonders & Safari Phú Quốc',
    'Sunset Sanato Beach Club'
  ],
  included = ARRAY[
    'Vé máy bay khứ hồi',
    'Resort 5 sao',
    'Ăn sáng buffet',
    'Tour 4 đảo',
    'Xe đưa đón sân bay'
  ],
  excluded = ARRAY[
    'Chi phí tham quan riêng',
    'Bữa trưa, tối',
    'Vé VinWonders'
  ]
WHERE tour_id = 4;

UPDATE public.tours
SET 
  location = 'Thừa Thiên Huế',
  duration = '4 ngày 3 đêm',
  image_url = 'https://images.unsplash.com/photo-1723142282970-1fd415eec1ad',
  highlights = ARRAY[
    'Biển Mỹ Khê, Non Nước',
    'Cầu Vàng - Bà Nà Hills',
    'Chùa Linh Ứng, Ngũ Hành Sơn',
    'Phố cổ Hội An về đêm',
    'Ăn tối trên du thuyền sông Hàn',
    'Chợ Hàn, Cồn market'
  ],
  included = ARRAY[
    'Vé máy bay',
    'Khách sạn 4 sao',
    'Ăn sáng',
    'Xe đưa đón',
    'Vé Bà Nà Hills'
  ],
  excluded = ARRAY[
    'Bữa trưa, tối',
    'Cáp treo Ngũ Hành Sơn'
  ]
WHERE tour_id = 5;

-- 3. Create PL/pgSQL database functions (RPC endpoints)

-- GET TOURS
CREATE OR REPLACE FUNCTION public.get_tours(p_destination text DEFAULT NULL)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_agg(t) INTO v_result
  FROM (
    SELECT 
      t.tour_id::text AS id,
      t.destination_city_id::text AS city_id,
      t.title,
      COALESCE(t.location, c.city_name) AS location,
      t.base_price AS price,
      COALESCE(t.duration, (t.duration_days::text || ' ngày ' || COALESCE(t.duration_nights, t.duration_days - 1)::text || ' đêm')) AS duration,
      COALESCE(t.image_url, 'https://images.unsplash.com/photo-1643029891412-92f9a81a8c16') AS image,
      COALESCE(t.rating_avg, 5.0) AS rating,
      COALESCE(t.total_reviews, 0) AS reviews,
      t.description,
      COALESCE(t.highlights, ARRAY[]::text[]) AS highlights,
      COALESCE(t.included, ARRAY[]::text[]) AS included,
      COALESCE(t.excluded, ARRAY[]::text[]) AS excluded
    FROM public.tours t
    LEFT JOIN public.cities c ON t.destination_city_id = c.city_id
    WHERE t.status = true
      AND (p_destination IS NULL OR p_destination = '' OR LOWER(t.title) LIKE '%' || LOWER(p_destination) || '%' OR LOWER(c.city_name) LIKE '%' || LOWER(p_destination) || '%')
    ORDER BY t.tour_id DESC
  ) t;
  
  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- GET TOUR BY ID (fallback to tour Hạ Long - tour_id = 1)
CREATE OR REPLACE FUNCTION public.get_tour_by_id(p_id bigint)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_result json;
  v_fallback_id bigint := 1;
BEGIN
  SELECT row_to_json(t) INTO v_result
  FROM (
    SELECT 
      t.tour_id::text AS id,
      t.destination_city_id::text AS city_id,
      t.title,
      COALESCE(t.location, c.city_name) AS location,
      t.base_price AS price,
      COALESCE(t.duration, (t.duration_days::text || ' ngày ' || COALESCE(t.duration_nights, t.duration_days - 1)::text || ' đêm')) AS duration,
      COALESCE(t.image_url, 'https://images.unsplash.com/photo-1643029891412-92f9a81a8c16') AS image,
      COALESCE(t.rating_avg, 5.0) AS rating,
      COALESCE(t.total_reviews, 0) AS reviews,
      t.description,
      COALESCE(t.highlights, ARRAY[]::text[]) AS highlights,
      COALESCE(t.included, ARRAY[]::text[]) AS included,
      COALESCE(t.excluded, ARRAY[]::text[]) AS excluded
    FROM public.tours t
    LEFT JOIN public.cities c ON t.destination_city_id = c.city_id
    WHERE t.tour_id = p_id AND t.status = true
  ) t;

  IF v_result IS NULL AND p_id IS DISTINCT FROM v_fallback_id THEN
    SELECT row_to_json(t) INTO v_result
    FROM (
      SELECT 
        t.tour_id::text AS id,
        t.title,
        COALESCE(t.location, c.city_name) AS location,
        t.base_price AS price,
        COALESCE(t.duration, (t.duration_days::text || ' ngày ' || COALESCE(t.duration_nights, t.duration_days - 1)::text || ' đêm')) AS duration,
        COALESCE(t.image_url, 'https://images.unsplash.com/photo-1643029891412-92f9a81a8c16') AS image,
        COALESCE(t.rating_avg, 5.0) AS rating,
        COALESCE(t.total_reviews, 0) AS reviews,
        t.description,
        COALESCE(t.highlights, ARRAY[]::text[]) AS highlights,
        COALESCE(t.included, ARRAY[]::text[]) AS included,
        COALESCE(t.excluded, ARRAY[]::text[]) AS excluded
      FROM public.tours t
      LEFT JOIN public.cities c ON t.destination_city_id = c.city_id
      WHERE t.tour_id = v_fallback_id AND t.status = true
    ) t;
  END IF;
  
  RETURN v_result;
END;
$$;

-- CREATE TOUR
CREATE OR REPLACE FUNCTION public.create_tour(
  p_title text,
  p_location text,
  p_price numeric,
  p_duration text,
  p_image text,
  p_description text,
  p_highlights text[],
  p_included text[],
  p_excluded text[]
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_city_id int;
  v_tour_id bigint;
  v_result json;
BEGIN
  -- Find or insert city
  SELECT city_id INTO v_city_id FROM public.cities WHERE LOWER(city_name) = LOWER(p_location) LIMIT 1;
  IF v_city_id IS NULL THEN
    INSERT INTO public.cities (country_id, city_name) VALUES (1, p_location) RETURNING city_id INTO v_city_id;
  END IF;

  -- Insert tour
  INSERT INTO public.tours 
    (provider_id, category_id, policy_id, title, slug, description, departure_city_id, destination_city_id, duration_days, base_price, status, location, duration, image_url, highlights, included, excluded, rating_avg, total_reviews)
  VALUES 
    (1, 1, 1, p_title, regexp_replace(lower(p_title), '[^a-z0-9]+', '-', 'g'), p_description, v_city_id, v_city_id, 3, p_price, true, p_location, p_duration, p_image, p_highlights, p_included, p_excluded, 5.0, 0)
  RETURNING tour_id INTO v_tour_id;

  SELECT row_to_json(t) INTO v_result
  FROM (
    SELECT 
      tour_id::text AS id,
      title,
      location,
      base_price AS price,
      duration,
      image_url AS image,
      rating_avg AS rating,
      total_reviews AS reviews,
      description,
      highlights,
      included,
      excluded
    FROM public.tours
    WHERE tour_id = v_tour_id
  ) t;

  RETURN v_result;
END;
$$;

-- UPDATE TOUR
CREATE OR REPLACE FUNCTION public.update_tour(
  p_id bigint,
  p_title text,
  p_location text,
  p_price numeric,
  p_duration text,
  p_image text,
  p_description text,
  p_highlights text[],
  p_included text[],
  p_excluded text[]
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_city_id int;
  v_result json;
BEGIN
  -- Find or insert city
  SELECT city_id INTO v_city_id FROM public.cities WHERE LOWER(city_name) = LOWER(p_location) LIMIT 1;
  IF v_city_id IS NULL THEN
    INSERT INTO public.cities (country_id, city_name) VALUES (1, p_location) RETURNING city_id INTO v_city_id;
  END IF;

  -- Update tour
  UPDATE public.tours
  SET
    title = p_title,
    location = p_location,
    base_price = p_price,
    duration = p_duration,
    image_url = p_image,
    description = p_description,
    highlights = p_highlights,
    included = p_included,
    excluded = p_excluded,
    destination_city_id = v_city_id,
    updated_at = CURRENT_TIMESTAMP
  WHERE tour_id = p_id;

  SELECT row_to_json(t) INTO v_result
  FROM (
    SELECT 
      tour_id::text AS id,
      title,
      location,
      base_price AS price,
      duration,
      image_url AS image,
      rating_avg AS rating,
      total_reviews AS reviews,
      description,
      highlights,
      included,
      excluded
    FROM public.tours
    WHERE tour_id = p_id
  ) t;

  RETURN v_result;
END;
$$;

-- DELETE TOUR
CREATE OR REPLACE FUNCTION public.delete_tour(p_id bigint)
RETURNS json
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.tours SET status = false WHERE tour_id = p_id;
  RETURN json_build_object('success', true);
END;
$$;

-- GET BOOKINGS (ADMIN)
CREATE OR REPLACE FUNCTION public.get_bookings()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_agg(t) INTO v_result
  FROM (
    SELECT 
      b.booking_code AS id,
      s.tour_id::text AS tourId,
      t.title AS tourTitle,
      COALESCE(t.image_url, 'https://images.unsplash.com/photo-1643029891412-92f9a81a8c16') AS tourImage,
      u.user_id::text AS userId,
      u.email AS userEmail,
      s.start_date::text AS date,
      b.total_people AS guests,
      b.total_price AS total,
      b.booking_status AS status
    FROM public.bookings b
    JOIN public.tour_schedules s ON b.schedule_id = s.schedule_id
    JOIN public.tours t ON s.tour_id = t.tour_id
    JOIN public.users u ON b.user_id = u.user_id
    ORDER BY b.created_at DESC
  ) t;
  
  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- GET USER BOOKINGS
CREATE OR REPLACE FUNCTION public.get_user_bookings(p_email text)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_agg(t) INTO v_result
  FROM (
    SELECT 
      b.booking_code AS id,
      s.tour_id::text AS tourId,
      t.title AS tourTitle,
      COALESCE(t.image_url, 'https://images.unsplash.com/photo-1643029891412-92f9a81a8c16') AS tourImage,
      u.user_id::text AS userId,
      u.email AS userEmail,
      s.start_date::text AS date,
      b.total_people AS guests,
      b.total_price AS total,
      b.booking_status AS status
    FROM public.bookings b
    JOIN public.tour_schedules s ON b.schedule_id = s.schedule_id
    JOIN public.tours t ON s.tour_id = t.tour_id
    JOIN public.users u ON b.user_id = u.user_id
    WHERE LOWER(u.email) = LOWER(trim(p_email))
    ORDER BY b.created_at DESC
  ) t;
  
  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- CREATE BOOKING
CREATE OR REPLACE FUNCTION public.create_booking(
  p_tour_id bigint,
  p_user_id text,
  p_user_email text,
  p_date text,
  p_guests int,
  p_quantity int
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id bigint;
  v_schedule_id bigint;
  v_tour_price numeric;
  v_total numeric;
  v_booking_code varchar;
  v_booking_id bigint;
  v_result json;
BEGIN
  -- 1. Find or create user
  IF p_user_id ~ '^[0-9]+$' THEN
    v_user_id := p_user_id::bigint;
  ELSE
    SELECT user_id INTO v_user_id FROM public.users WHERE LOWER(email) = LOWER(trim(p_user_email)) LIMIT 1;
    IF v_user_id IS NULL THEN
      INSERT INTO public.users (full_name, email, status) 
      VALUES (split_part(p_user_email, '@', 1), trim(p_user_email), 'active')
      RETURNING user_id INTO v_user_id;
    END IF;
  END IF;

  -- 2. Find or create schedule for the date
  SELECT schedule_id INTO v_schedule_id 
  FROM public.tour_schedules 
  WHERE tour_id = p_tour_id AND start_date = p_date::date LIMIT 1;
  
  IF v_schedule_id IS NULL THEN
    SELECT base_price INTO v_tour_price FROM public.tours WHERE tour_id = p_tour_id;
    IF v_tour_price IS NULL THEN
      v_tour_price := 1000000; -- Default fallback
    END IF;
    
    INSERT INTO public.tour_schedules 
      (tour_id, start_date, end_date, adult_price, total_slots, available_slots, status)
    VALUES 
      (p_tour_id, p_date::date, p_date::date + interval '2 days', v_tour_price, 100, 100, 'available')
    RETURNING schedule_id INTO v_schedule_id;
  ELSE
    SELECT adult_price INTO v_tour_price FROM public.tour_schedules WHERE schedule_id = v_schedule_id;
  END IF;

  -- 3. Calculate total
  v_total := v_tour_price * p_guests * p_quantity;

  -- 4. Generate booking code
  v_booking_code := 'ORD-' || upper(substring(md5(random()::text), 1, 8));

  -- 5. Insert booking
  INSERT INTO public.bookings 
    (booking_code, user_id, schedule_id, total_people, total_price, booking_status, adult_count, child_count, infant_count)
  VALUES 
    (v_booking_code, v_user_id, v_schedule_id, p_guests, v_total, 'pending', p_guests, 0, 0)
  RETURNING booking_id INTO v_booking_id;

  SELECT row_to_json(t) INTO v_result
  FROM (
    SELECT 
      b.booking_code AS id,
      s.tour_id::text AS tourId,
      t.title AS tourTitle,
      COALESCE(t.image_url, 'https://images.unsplash.com/photo-1643029891412-92f9a81a8c16') AS tourImage,
      u.user_id::text AS userId,
      u.email AS userEmail,
      s.start_date::text AS date,
      b.total_people AS guests,
      b.total_price AS total,
      b.booking_status AS status
    FROM public.bookings b
    JOIN public.tour_schedules s ON b.schedule_id = s.schedule_id
    JOIN public.tours t ON s.tour_id = t.tour_id
    JOIN public.users u ON b.user_id = u.user_id
    WHERE b.booking_id = v_booking_id
  ) t;

  RETURN v_result;
END;
$$;

-- DELETE BOOKING
CREATE OR REPLACE FUNCTION public.delete_booking(p_booking_code text)
RETURNS json
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.bookings WHERE booking_code = p_booking_code;
  RETURN json_build_object('success', true);
END;
$$;

-- CONFIRM BOOKING
CREATE OR REPLACE FUNCTION public.confirm_booking(p_booking_code text)
RETURNS json
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.bookings 
  SET booking_status = 'confirmed', updated_at = CURRENT_TIMESTAMP
  WHERE booking_code = p_booking_code;
  RETURN json_build_object('success', true);
END;
$$;

-- 4. Grants for PostgREST RPC calls from backend (anon / service_role key)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE ON public.users TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.tours TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.tour_schedules TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.cities TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.notifications TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.get_tours(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_tour_by_id(bigint) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_tour(text, text, numeric, text, text, text, text[], text[], text[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_tour(bigint, text, text, numeric, text, text, text, text[], text[], text[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delete_tour(bigint) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_bookings() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_bookings(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_booking(bigint, text, text, text, int, int) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.delete_booking(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.confirm_booking(text) TO anon, authenticated, service_role;

-- 5. Chat System Tables
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  session_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  message_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.chat_sessions(session_id) ON DELETE CASCADE,
  sender_type text NOT NULL,
  sender_id text,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all insert to chat_sessions" ON public.chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all select to chat_sessions" ON public.chat_sessions FOR SELECT USING (true);
CREATE POLICY "Allow all update to chat_sessions" ON public.chat_sessions FOR UPDATE USING (true);

CREATE POLICY "Allow all insert to chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all select to chat_messages" ON public.chat_messages FOR SELECT USING (true);

GRANT ALL ON public.chat_sessions TO anon, authenticated, service_role;
GRANT ALL ON public.chat_messages TO anon, authenticated, service_role;
