const fs = require('fs');

let content = fs.readFileSync('src/app/hotel/page.tsx', 'utf8');

const mojibakeDict = {
  'Ä‘iá»ƒm Ä‘áº¿n': 'điểm đến',
  'Bá»™ lá»\x8dc': 'Bộ lọc', // This one might be tricky because of hidden characters, let's just use string replace.
  'Bá»™ lá» c': 'Bộ lọc',
  'KhÃ´ng cÃ³ khÃ¡ch sáº¡n': 'Không có khách sạn',
  'Loáº¡i phÃ²ng': 'Loại phòng',
  'NgÃ y nhÃ¢n - trÃ£ phÃ²ng': 'Ngày nhận - trả phòng',
  'TÃ¬m kiáº¿m': 'Tìm kiếm',
  'Tiá»‡n nghi': 'Tiện nghi',
  'Má»©c giÃ¡': 'Mức giá',
  'Háº¡ng sao': 'Hạng sao',
  'YÃªu thÃ\xADch': 'Yêu thích',
  'YÃªu thÃ­ch': 'Yêu thích',
  'Theo giá»\x20': 'Theo giờ',
  'Theo giá» ': 'Theo giờ',
  'Qua Ä‘Ãªm': 'Qua đêm',
  'Theo ngÃ y': 'Theo ngày',
  'PhÃº Quá»‘c': 'Phú Quốc',
  'Ä\x90Ã  Náºµng': 'Đà Nẵng',
  'Há»™i An': 'Hội An',
  'Háº¡ Long': 'Hạ Long',
  'Ä\x90Ã  Láº¡t': 'Đà Lạt',
  'HÃ  Ná»™i': 'Hà Nội',
  'HÃºe': 'Huế',
  'HuÃ©': 'Huế',
  'TP. Há»“ ChÃ\xAD Minh': 'TP. Hồ Chí Minh',
  'WiFi miá»…n phÃ\xAD': 'WiFi miễn phí',
  'HÃ´ bá»\x9Fi': 'Hồ bơi',
  'HÃ´ bá» i': 'Hồ bơi',
  'Bá»¯a sÃ¡ng miá»…n phÃ\xAD': 'Bữa sáng miễn phí',
  'PhÃ²ng gym': 'Phòng gym',
  'NhÃ  hÃ ng': 'Nhà hàng',
  'Gáº§n bÃ£i biá»ƒn': 'Gần bãi biển',
  'Ä\x90Æ°a Ä‘Ã³n sÃ¢n bay': 'Đưa đón sân bay',
  'Xuáº¥t sáº¯c': 'Xuất sắc',
  'Tuyá»‡t vá»\x9Di': 'Tuyệt vời',
  'Tuyá»‡t vá» i': 'Tuyệt vời',
  'Ráº¥t tá»‘t': 'Rất tốt',
  'Tá»‘t': 'Tốt',
  'Ä\x90Æ°á»£c yÃªu thÃ\xADch': 'Được yêu thích',
  'BÃ¡n cháº¡y nháº¥t': 'Bán chạy nhất',
  'Lá»±a chá»\x8Dn phá»• biáº¿n': 'Lựa chọn phổ biến',
  'Lá»±a chá» n phá»• biáº¿n': 'Lựa chọn phổ biến',
  'Ä\x90áº³ng cáº¥p VIP': 'Đẳng cấp VIP',
  'DÃ nh cho gia Ä‘Ã¬nh': 'Dành cho gia đình',
  'Ä\x90áº·t phÃ²ng': 'Đặt phòng',
  'HÃºy': 'Hủy',
  'XÃ¡c nhÃ¢n': 'Xác nhận',
  'ChÆ°a chá»\x8Dn ngÃ y': 'Chưa chọn ngày',
  'ChÆ°a chá» n ngÃ y': 'Chưa chọn ngày',
  'ChÆ°a chá»\x8Dn Ä‘Ãªm nháºn - trÃ£ phÃ²ng': 'Chưa chọn đêm nhận - trả phòng',
  'ChÆ°a chá» n Ä‘Ãªm nháºn - trÃ£ phÃ²ng': 'Chưa chọn đêm nhận - trả phòng',
  'ChÆ°a chá»\x8Dn ngÃ y nháºn - trÃ£ phÃ²ng': 'Chưa chọn ngày nhận - trả phòng',
  'ChÆ°a chá» n ngÃ y nháºn - trÃ£ phÃ²ng': 'Chưa chọn ngày nhận - trả phòng',
  'Ä\x90ang tÃ¬m khÃ¡ch sáº¡n táº¡i': 'Đang tìm khách sạn tại',
  'táº¥t cáº£ Ä‘á»\x8Ba Ä‘iá»ƒm': 'tất cả địa điểm',
  'táº¥t cáº£ Ä‘á» a Ä‘iá»ƒm': 'tất cả địa điểm',
  'Quay láº¡i danh sÃ¡ch khÃ¡ch sáº¡n': 'Quay lại danh sách khách sạn',
  'KhÃ¡ch lÆ°u trÃº': 'Khách lưu trú',
  'Sá»‘ lÆ°á»£ng khÃ¡ch': 'Số lượng khách',
  'NgÆ°á»\x9Di lá»›n': 'Người lớn',
  'NgÆ°á» i lá»›n': 'Người lớn',
  'Tráº» em': 'Trẻ em',
  'Báº¡n sáº½ khÃ´ng bá»‹ trá»« tiá»\x81n ngay lÃºc nÃ y': 'Bạn sẽ không bị trừ tiền ngay lúc này',
  'Báº¡n sáº½ khÃ´ng bá»‹ trá»« tiá» n ngay lÃºc nÃ y': 'Bạn sẽ không bị trừ tiền ngay lúc này',
  'Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n Ä‘áº·t phÃ²ng': 'Bạn có chắc chắn muốn đặt phòng',
  'NgÃ y nháºn phÃ²ng': 'Ngày nhận phòng',
  'Sá»‘ lÆ°á»£ng phÃ²ng': 'Số lượng phòng',
  'Tá»•ng cá»™ng': 'Tổng cộng',
  'Giáº£m': 'Giảm',
  'giÃ¡ Gá»‘c': 'giá Gốc',
  'Ä‘Ã¡nh giÃ¡': 'đánh giá',
  'KhÃ¡ch sáº¡n tÆ°Æ¡ng tá»±': 'Khách sạn tương tự',
  'GiÃ¡ tháº¥p nháº¥t': 'Giá thấp nhất',
  'Ä\x90Ã¡nh giÃ¡ cao nháº¥t': 'Đánh giá cao nhất',
  'XÃ³a bá»™ lá»\x8dc': 'Xóa bộ lọc',
  'XÃ³a bá»™ lá» c': 'Xóa bộ lọc',
  'KhÃ´ng cÃ³ khÃ¡ch sáº¡n phÃ¹ há»£p vá»›i bá»™ lá»\x8dc hiá»‡n táº¡i.': 'Không có khách sạn phù hợp với bộ lọc hiện tại.',
  'KhÃ´ng cÃ³ khÃ¡ch sáº¡n phÃ¹ há»£p vá»›i bá»™ lá» c hiá»‡n táº¡i.': 'Không có khách sạn phù hợp với bộ lọc hiện tại.',
  'phÃ¹ há»£p vá»›i': 'phù hợp với',
  'hiá»‡n táº¡i.': 'hiện tại.',
  '1 GiÆ°á»\x9Dng King': '1 Giường King',
  '1 GiÆ°á» ng King': '1 Giường King',
  '2 NgÆ°á»\x9Di lá»›n': '2 Người lớn',
  '2 NgÆ°á» i lá»›n': '2 Người lớn',
  'Bao gá»“m bá»¯a sÃ¡ng': 'Bao gồm bữa sáng',
  'Ban cÃ´ng riÃªng': 'Ban công riêng',
  'Bá»“n táº¯m náº±m': 'Bồn tắm nằm',
  'Há»“ bá»\x9Fi riÃªng': 'Hồ bơi riêng',
  'Há»“ bá» i riÃªng': 'Hồ bơi riêng',
  'Quáº£n gia riÃªng 24/7': 'Quản gia riêng 24/7',
  'Quyá»\x81n lá»£i Lounge VIP': 'Quyền lợi Lounge VIP',
  'Quyá» n lá»£i Lounge VIP': 'Quyền lợi Lounge VIP',
  'RÆ°á»£u vang chÃ o má»«ng': 'Rượu vang chào mừng',
  'Khu vá»±c tiáº¿p khÃ¡ch': 'Khu vực tiếp khách',
  'Ä\x90á»“ dÃ¹ng tráº» em': 'Đồ dùng trẻ em',
  'Ä\x82n sÃ¡ng gia Ä‘Ã¬nh': 'Ăn sáng gia đình',
  'Káº¿t ná»‘i thiáº¿t bá»‹ giáº£i trÃ\xAD': 'Kết nối thiết bị giải trí',
  '2 GiÆ°á»\x9Dng Queen': '2 Giường Queen',
  '2 GiÆ°á» ng Queen': '2 Giường Queen',
  '4 NgÆ°á»\x9Di lá»›n': '4 Người lớn',
  '4 NgÆ°á» i lá»›n': '4 Người lớn',
  'PhÃ²ng Standard (TiÃªu chuáº©n)': 'Phòng Standard (Tiêu chuẩn)',
  'PhÃ²ng Deluxe View Biá»ƒn': 'Phòng Deluxe View Biển',
  'PhÃ²ng Family (2 GiÆ°á»\x9Dng lá»›n)': 'Phòng Family (2 Giường lớn)',
  'PhÃ²ng Family (2 GiÆ°á» ng lá»›n)': 'Phòng Family (2 Giường lớn)',
  'KHÃ\x81CH Sáº\xBAN': 'KHÁCH SẠN',
  'SAO': 'SAO',
  'Biá»ƒu hÃ²a nhiá»‡t Ä‘á»™': 'Điều hòa nhiệt độ', // Guess
};

for (const [bad, good] of Object.entries(mojibakeDict)) {
  content = content.split(bad).join(good);
}

// 1. apply fix_hotel.js logic
content = content.replace(/const hotels = \[\s*\{.*?\];\s*type Hotel = \(typeof hotels\)\[number\];/s, `export interface Hotel { id: string; name: string; location: string; area: string; image: string; rating: number; reviews: number; price: number; oldPrice?: number; badge?: string; stars: number; features: string[]; }
export interface HotelRoom { id: string; hotelId: string; name: string; image: string; maxAdults: number; maxChildren: number; beds: string; sizeSqm: number; price: number; taxAndFee: number; facilities: string[]; }`);

content = content.replace(/const hotelRooms = useMemo\(\(\) => \{.*?\}, \[selectedHotel\]\);/s, `const [hotelRooms, setHotelRooms] = useState<HotelRoom[]>([]);
  useEffect(() => {
    async function fetchHotelRooms() {
      if (!selectedHotel) {
        setHotelRooms([]);
        return;
      }
      try {
        const res = await fetch(apiUrl(\`/api/hotels/\${selectedHotel.id}/rooms\`));
        if (res.ok) {
          const data = await res.json();
          setHotelRooms(data);
        }
      } catch (error) {
        console.error("Error fetching rooms", error);
      }
    }
    fetchHotelRooms();
  }, [selectedHotel]);`);

content = content.replace(/export default function HotelPage\(\) \{/, `export default function HotelPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);

  useEffect(() => {
    async function fetchHotels() {
      try {
        const res = await fetch(apiUrl('/api/hotels'));
        if (res.ok) {
          const data = await res.json();
          setHotels(data);
        }
      } catch (error) {
        console.error("Error fetching hotels", error);
      } finally {
        setLoadingHotels(false);
      }
    }
    fetchHotels();
  }, []);`);

// 2. Add import apiUrl
content = content.replace("import { useEffect } from 'react';", "import { useEffect } from 'react';\nimport { apiUrl } from '@/lib/backendUrl';");

// 3. Fix filteredHotels dependency
content = content.replace("}, [searchDestination, maxPrice, selectedArea, selectedFacilities, selectedStars, sortMode]);", "}, [hotels, searchDestination, maxPrice, selectedArea, selectedFacilities, selectedStars, sortMode]);");

fs.writeFileSync('src/app/hotel/page.tsx', content, 'utf8');
