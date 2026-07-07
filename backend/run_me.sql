-- Tá»± Ä‘á»™ng thÃªm cá»™t vÃ o báº£ng náº¿u thiáº¿u
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS badge varchar,
ADD COLUMN IF NOT EXISTS old_price numeric,
ADD COLUMN IF NOT EXISTS base_price numeric;

-- XÃ³a dá»¯ liá»‡u cÅ© náº¿u cÃ³ Ä‘á»ƒ trÃ¡nh trÃ¹ng láº·p khi cháº¡y láº¡i
DELETE FROM public.hotel_facility_mappings;
DELETE FROM public.hotel_facilities;
DELETE FROM public.hotel_images;
DELETE FROM public.hotel_rooms;
DELETE FROM public.hotels;

-- 1. Insert Cities if not exists
INSERT INTO public.cities (city_id, country_id, city_name)
VALUES 
  (101, 1, 'ÄÃ  Náºµng'),
  (102, 1, 'PhÃº Quá»‘c'),
  (103, 1, 'Nha Trang'),
  (104, 1, 'Há»™i An'),
  (105, 1, 'Sa Pa'),
  (106, 1, 'Háº¡ Long'),
  (107, 1, 'ÄÃ  Láº¡t'),
  (108, 1, 'HÃ  Ná»™i'),
  (109, 1, 'TP. Há»“ ChÃ­ Minh'),
  (110, 1, 'Huáº¿')
ON CONFLICT (city_id) DO UPDATE SET city_name = EXCLUDED.city_name;

-- 2. Insert Hotels
INSERT INTO public.hotels (hotel_id, provider_id, city_id, hotel_name, address, star_rating, rating_avg, total_reviews, base_price, old_price, badge, status)
VALUES 
  (1, 1, 101, 'Resort Sun Peninsula', 'BÃ£i Báº¯c, BÃ¡n Ä‘áº£o SÆ¡n TrÃ , ÄÃ  Náºµng', 5, 4.8, 2345, 3500000, 4100000, 'BÃ¡n cháº¡y nháº¥t', true),
  (2, 1, 102, 'DÆ°Æ¡ng ÄÃ´ng Boutique Hotel', 'DÆ°Æ¡ng ÄÃ´ng, PhÃº Quá»‘c', 4, 4.5, 998, 1850000, 2300000, null, true),
  (3, 1, 102, 'Imperial Garden & Spa', 'Tráº§n HÆ°ng Äáº¡o, PhÃº Quá»‘c', 5, 5.0, 812, 5100000, 6500000, 'Giáº£m 25%', true),
  (4, 1, 103, 'Nha Trang Bay Resort', 'ÄÆ°á»ng Tráº§n PhÃº, Nha Trang', 5, 4.7, 1650, 2450000, 3100000, 'Æ¯u Ä‘Ã£i hÃ¨', true),
  (5, 1, 101, 'ÄÃ  Náºµng Ocean Hotel', 'Má»¹ KhÃª, ÄÃ  Náºµng', 4, 4.6, 1320, 2100000, 2700000, null, true),
  (6, 1, 104, 'Há»™i An Lantern Villa', 'Phá»‘ cá»• Há»™i An, Quáº£ng Nam', 4, 4.4, 760, 1350000, 1800000, null, true),
  (7, 1, 105, 'Sa Pa Mountain Lodge', 'Trung tÃ¢m Sa Pa, LÃ o Cai', 4, 4.3, 524, 1650000, 2100000, null, true),
  (8, 1, 106, 'Háº¡ Long Pearl Hotel', 'BÃ£i ChÃ¡y, Háº¡ Long', 4, 4.2, 690, 1750000, 2200000, null, true),
  (9, 1, 107, 'ÄÃ  Láº¡t Pine Garden', 'Há»“ Tuyá»n LÃ¢m, ÄÃ  Láº¡t', 3, 4.1, 430, 1250000, 1650000, null, true),
  (10, 1, 108, 'HÃ  Ná»™i Heritage Hotel', 'HoÃ n Kiáº¿m, HÃ  Ná»™i', 4, 4.5, 1180, 1950000, 2500000, null, true),
  (11, 1, 109, 'SÃ i GÃ²n Sky Suites', 'Quáº­n 1, TP. Há»“ ChÃ­ Minh', 5, 4.9, 2012, 3650000, 4550000, 'ÄÆ°á»£c yÃªu thÃ­ch', true),
  (12, 1, 110, 'Huáº¿ Riverside Hotel', 'Bá» sÃ´ng HÆ°Æ¡ng, Huáº¿', 4, 4.6, 850, 1550000, 2000000, null, true);

-- 3. Insert Hotel Images
INSERT INTO public.hotel_images (hotel_id, image_url, is_thumbnail)
VALUES 
  (1, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d', true),
  (2, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b', true),
  (3, 'https://images.unsplash.com/photo-1564501049412-61c2a3083791', true),
  (4, 'https://images.unsplash.com/photo-1566073771259-6a8506099945', true),
  (5, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa', true),
  (6, 'https://images.unsplash.com/photo-1528127269322-539801943592', true),
  (7, 'https://images.unsplash.com/photo-1582719508461-905c673771fd', true),
  (8, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', true),
  (9, 'https://images.unsplash.com/photo-1501117716987-c8e1ecb21098', true),
  (10, 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c', true),
  (11, 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6', true),
  (12, 'https://images.unsplash.com/photo-1542314831-c6a4d142104d', true);

-- 4. Insert Hotel Facilities
INSERT INTO public.hotel_facilities (facility_id, facility_name)
VALUES 
  (1, 'WiFi miá»…n phÃ­'),
  (2, 'Há»“ bÆ¡i'),
  (3, 'NhÃ  hÃ ng'),
  (4, 'Spa'),
  (5, 'Gáº§n bÃ£i biá»ƒn'),
  (6, 'ÄÆ°a Ä‘Ã³n sÃ¢n bay'),
  (7, 'PhÃ²ng gym'),
  (8, 'Bá»¯a sÃ¡ng miá»…n phÃ­');

-- 5. Map Facilities to Hotels
INSERT INTO public.hotel_facility_mappings (hotel_id, facility_id) VALUES 
  (1, 1), (1, 2), (1, 3), (1, 4),
  (2, 1), (2, 5), (2, 6),
  (3, 3), (3, 4), (3, 2), (3, 7),
  (4, 1), (4, 2), (4, 3), (4, 5),
  (5, 1), (5, 5), (5, 8),
  (6, 1), (6, 8), (6, 6),
  (7, 1), (7, 8), (7, 3),
  (8, 1), (8, 2), (8, 3),
  (9, 1), (9, 8), (9, 3),
  (10, 1), (10, 3), (10, 6),
  (11, 1), (11, 2), (11, 4), (11, 7),
  (12, 1), (12, 8), (12, 3);

-- 6. Insert Hotel Rooms (with custom columns added if necessary)
ALTER TABLE public.hotel_rooms 
ADD COLUMN IF NOT EXISTS tax_and_fee numeric,
ADD COLUMN IF NOT EXISTS image_url varchar;

INSERT INTO public.hotel_rooms (room_id, hotel_id, room_type, base_price, tax_and_fee, capacity, bed_type, room_size, image_url)
VALUES 
  (1, 1, 'PhÃ²ng Superior HÆ°á»›ng Biá»ƒn', 3500000, 350000, 2, '1 GiÆ°á»ng Ä‘Ã´i', 42, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32'),
  (2, 1, 'PhÃ²ng Deluxe Gia ÄÃ¬nh', 4800000, 480000, 4, '2 GiÆ°á»ng Ä‘Ã´i', 65, 'https://images.unsplash.com/photo-1590490360182-c33d57733427'),
  (3, 1, 'Suite ToÃ n Cáº£nh', 7500000, 750000, 2, '1 GiÆ°á»ng King', 85, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461'),
  (4, 2, 'PhÃ²ng TiÃªu Chuáº©n', 1850000, 185000, 2, '1 GiÆ°á»ng Ä‘Ã´i', 30, 'https://images.unsplash.com/photo-1598928506311-c55dd713b41d'),
  (5, 2, 'PhÃ²ng HÆ°á»›ng VÆ°á»n', 2200000, 220000, 2, '2 GiÆ°á»ng Ä‘Æ¡n', 35, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304'),
  (6, 3, 'Suite VÆ°á»n Ngá»± Uyá»ƒn', 5100000, 510000, 2, '1 GiÆ°á»ng King', 70, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39'),
  (7, 3, 'Biá»‡t Thá»± Há»“ BÆ¡i RiÃªng', 12500000, 1250000, 6, '3 GiÆ°á»ng King', 250, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'),
  (8, 4, 'PhÃ²ng Deluxe HÆ°á»›ng Biá»ƒn', 2450000, 245000, 2, '1 GiÆ°á»ng Ä‘Ã´i', 45, 'https://images.unsplash.com/photo-1590490359683-658d34c8f0d8'),
  (9, 4, 'Biá»‡t Thá»± TrÃªn NÆ°á»›c', 8900000, 890000, 4, '2 GiÆ°á»ng King', 120, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d');

-- 7. Create RPC to Get Hotels
CREATE OR REPLACE FUNCTION public.get_hotels()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_agg(h) INTO v_result
  FROM (
    SELECT 
      h.hotel_id::text AS id,
      h.hotel_name AS name,
      h.address AS location,
      c.city_name AS area,
      (SELECT image_url FROM public.hotel_images hi WHERE hi.hotel_id = h.hotel_id AND hi.is_thumbnail = true LIMIT 1) AS image,
      h.rating_avg AS rating,
      h.total_reviews AS reviews,
      h.base_price AS price,
      h.old_price AS "oldPrice",
      h.badge,
      h.star_rating AS stars,
      ARRAY(
        SELECT f.facility_name 
        FROM public.hotel_facility_mappings m
        JOIN public.hotel_facilities f ON m.facility_id = f.facility_id
        WHERE m.hotel_id = h.hotel_id
      ) AS features
    FROM public.hotels h
    LEFT JOIN public.cities c ON h.city_id = c.city_id
    WHERE h.status = true
    ORDER BY h.hotel_id ASC
  ) h;
  
  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- 8. Create RPC to Get Hotel Rooms
CREATE OR REPLACE FUNCTION public.get_hotel_rooms(p_hotel_id text)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_hotel_id bigint;
  v_result json;
BEGIN
  v_hotel_id := p_hotel_id::bigint;

  SELECT json_agg(r) INTO v_result
  FROM (
    SELECT 
      room_id::text AS id,
      hotel_id::text AS hotelId,
      room_type AS name,
      COALESCE(image_url, 'https://images.unsplash.com/photo-1611892440504-42a792e24d32') AS image,
      capacity AS maxAdults,
      0 AS maxChildren,
      bed_type AS beds,
      room_size AS sizeSqm,
      base_price AS price,
      COALESCE(tax_and_fee, base_price * 0.1) AS taxAndFee,
      ARRAY['Äiá»u hoÃ ', 'Tivi', 'Minibar'] AS facilities
    FROM public.hotel_rooms
    WHERE hotel_id = v_hotel_id
  ) r;
  
  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- Cáº¥p quyá»n cho PostgREST
GRANT EXECUTE ON FUNCTION public.get_hotels() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_hotel_rooms(text) TO anon, authenticated, service_role;

