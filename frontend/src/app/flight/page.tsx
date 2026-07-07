"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Armchair,
  ArrowLeftRight,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Copy,
  Gift,
  Globe,
  Info,
  Luggage,
  Minus,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  Tag,
  TrendingDown,
  Users,
  Utensils,
  Wifi,
  X,
  Zap,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
type FlightClass = 'Phổ thông' | 'Thương gia' | 'Hạng nhất';
type SortMode = 'price' | 'duration' | 'departure';
type TimeSlot = 'Sáng' | 'Chiều' | 'Tối' | 'Đêm';
type TripType = 'one-way' | 'round-trip';
type PassengerCounts = { adults: number; children: number; infants: number };
type FlightInfoTab = 'detail' | 'refund' | 'promo';
type Flight = (typeof flights)[number];

/* ─────────────────────────────────────────────────────────────────────────────
   FLIGHT DATA
───────────────────────────────────────────────────────────────────────────── */
const flights = [
  {
    id: 'vn-254', airline: 'Vietnam Airlines', logo: 'VN', code: 'VN-254',
    from: 'Hà Nội', fromCode: 'HAN', to: 'Hồ Chí Minh', toCode: 'SGN',
    departure: '06:00', arrival: '08:10', duration: 130, stop: 'Bay thẳng',
    price: 1250000, oldPrice: 1650000, flightClass: 'Phổ thông' as FlightClass,
    tag: 'Rẻ nhất', tagColor: '#059669',
    amenities: ['WiFi', 'Bữa ăn', '20kg Hành lý'],
    slot: 'Sáng' as TimeSlot, seats: 42, totalSeats: 120, rating: 4.8,
    logoColor: '#1a56db',
  },
  {
    id: 'vn-bc1', airline: 'Vietnam Airlines', logo: 'VN', code: 'VN-254 BC',
    from: 'Hà Nội', fromCode: 'HAN', to: 'Hồ Chí Minh', toCode: 'SGN',
    departure: '09:30', arrival: '11:40', duration: 130, stop: 'Bay thẳng',
    price: 3800000, oldPrice: undefined, flightClass: 'Thương gia' as FlightClass,
    tag: 'Business', tagColor: '#7c3aed',
    amenities: ['WiFi', 'Bữa ăn cao cấp', '30kg Hành lý', 'Phòng chờ VIP'],
    slot: 'Sáng' as TimeSlot, seats: 8, totalSeats: 24, rating: 5.0,
    logoColor: '#1a56db',
  },
  {
    id: 'vj-177', airline: 'VietJet Air', logo: 'VJ', code: 'VJ-177',
    from: 'Hồ Chí Minh', fromCode: 'SGN', to: 'Đà Nẵng', toCode: 'DAD',
    departure: '14:20', arrival: '15:35', duration: 75, stop: 'Bay thẳng',
    price: 890000, oldPrice: 1200000, flightClass: 'Phổ thông' as FlightClass,
    tag: 'Tiết kiệm', tagColor: '#d97706',
    amenities: ['7kg Hành lý', 'Đổi vé linh hoạt'],
    slot: 'Chiều' as TimeSlot, seats: 120, totalSeats: 180, rating: 4.3,
    logoColor: '#dc2626',
  },
  {
    id: 'bav-101', airline: 'Bamboo Airways', logo: 'QH', code: 'QH-101',
    from: 'Hà Nội', fromCode: 'HAN', to: 'Phú Quốc', toCode: 'PQC',
    departure: '07:15', arrival: '09:10', duration: 115, stop: 'Bay thẳng',
    price: 1100000, oldPrice: 1400000, flightClass: 'Phổ thông' as FlightClass,
    tag: 'Phổ biến', tagColor: '#0891b2',
    amenities: ['WiFi', 'Bữa ăn', '23kg Hành lý'],
    slot: 'Sáng' as TimeSlot, seats: 55, totalSeats: 150, rating: 4.6,
    logoColor: '#059669',
  },
  {
    id: 'vj-night', airline: 'VietJet Air', logo: 'VJ', code: 'VJ-302',
    from: 'Hà Nội', fromCode: 'HAN', to: 'Đà Nẵng', toCode: 'DAD',
    departure: '22:10', arrival: '23:25', duration: 75, stop: 'Bay thẳng',
    price: 650000, oldPrice: undefined, flightClass: 'Phổ thông' as FlightClass,
    tag: 'Bay đêm', tagColor: '#4f46e5',
    amenities: ['7kg Hành lý'],
    slot: 'Đêm' as TimeSlot, seats: 88, totalSeats: 180, rating: 4.1,
    logoColor: '#dc2626',
  },
  {
    id: 'vn-fn1', airline: 'Vietnam Airlines', logo: 'VN', code: 'VN-555',
    from: 'Hồ Chí Minh', fromCode: 'SGN', to: 'Hà Nội', toCode: 'HAN',
    departure: '19:45', arrival: '21:55', duration: 130, stop: 'Bay thẳng',
    price: 1450000, oldPrice: undefined, flightClass: 'Phổ thông' as FlightClass,
    tag: 'Bay tối', tagColor: '#7c3aed',
    amenities: ['WiFi', 'Bữa ăn', '20kg Hành lý'],
    slot: 'Tối' as TimeSlot, seats: 30, totalSeats: 120, rating: 4.7,
    logoColor: '#1a56db',
  },
  {
    id: 'vn-bkk', airline: 'Vietnam Airlines', logo: 'VN', code: 'VN-605',
    from: 'Hồ Chí Minh', fromCode: 'SGN', to: 'Bangkok', toCode: 'BKK',
    departure: '08:30', arrival: '10:15', duration: 105, stop: 'Bay thẳng',
    price: 2100000, oldPrice: 2600000, flightClass: 'Phổ thông' as FlightClass,
    tag: 'Quốc tế', tagColor: '#0891b2',
    amenities: ['WiFi', 'Bữa ăn', '23kg Hành lý'],
    slot: 'Sáng' as TimeSlot, seats: 64, totalSeats: 160, rating: 4.5,
    logoColor: '#1a56db',
  },
  {
    id: 'vj-bkk', airline: 'VietJet Air', logo: 'VJ', code: 'VJ-812',
    from: 'Hồ Chí Minh', fromCode: 'SGN', to: 'Bangkok', toCode: 'BKK',
    departure: '12:40', arrival: '14:25', duration: 105, stop: 'Bay thẳng',
    price: 1750000, oldPrice: 2100000, flightClass: 'Phổ thông' as FlightClass,
    tag: 'Giá tốt', tagColor: '#059669',
    amenities: ['7kg Hành lý', 'Mua thêm hành lý'],
    slot: 'Chiều' as TimeSlot, seats: 95, totalSeats: 180, rating: 4.2,
    logoColor: '#dc2626',
  },
  {
    id: 'tg-sgn-bkk', airline: 'Thai Airways', logo: 'TG', code: 'TG-408',
    from: 'Hồ Chí Minh', fromCode: 'SGN', to: 'Bangkok', toCode: 'BKK',
    departure: '16:15', arrival: '18:00', duration: 105, stop: 'Bay thẳng',
    price: 2450000, oldPrice: undefined, flightClass: 'Phổ thông' as FlightClass,
    tag: 'Hãng 5★', tagColor: '#d97706',
    amenities: ['WiFi', 'Bữa ăn', '30kg Hành lý'],
    slot: 'Chiều' as TimeSlot, seats: 40, totalSeats: 100, rating: 4.8,
    logoColor: '#7c3aed',
  },
  {
    id: 'tg-bkk', airline: 'Thai Airways', logo: 'TG', code: 'TG-556',
    from: 'Bangkok', fromCode: 'BKK', to: 'Hồ Chí Minh', toCode: 'SGN',
    departure: '13:00', arrival: '14:30', duration: 90, stop: 'Bay thẳng',
    price: 2350000, oldPrice: undefined, flightClass: 'Phổ thông' as FlightClass,
    tag: 'Quốc tế', tagColor: '#0891b2',
    amenities: ['WiFi', 'Bữa ăn', '30kg Hành lý'],
    slot: 'Chiều' as TimeSlot, seats: 48, totalSeats: 100, rating: 4.6,
    logoColor: '#7c3aed',
  },
];

const flightClasses: FlightClass[] = ['Phổ thông', 'Thương gia', 'Hạng nhất'];

const flightInfoMeta: Record<string, { refundPolicy: string; promotion: string }> = {
  'vn-bkk': {
    refundPolicy: 'Hoàn 80% phí vé nếu hủy trước 24 giờ. Phí hủy 350.000đ nếu hủy trong vòng 24h.',
    promotion: 'Giảm 15% cho thành viên Sky Elite. Tặng thêm 5kg hành lý ký gửi.',
  },
  'vj-bkk': {
    refundPolicy: 'Hoàn 50% phí vé nếu hủy trước 72 giờ. Không hoàn vé trong vòng 72h.',
    promotion: 'Mã VJSUMMER giảm 200.000đ cho đơn từ 2 khách.',
  },
  'tg-sgn-bkk': {
    refundPolicy: 'Hoàn 100% phí vé nếu hủy trước 48 giờ. Phí đổi vé linh hoạt.',
    promotion: 'Tích 2x dặm Royal Orchid Plus. Ưu đãi combo khách sạn Bangkok.',
  },
  'vn-254': {
    refundPolicy: 'Hoàn 70% phí vé nếu hủy trước 12 giờ.',
    promotion: 'Giảm 10% khi thanh toán qua thẻ ngân hàng đối tác.',
  },
};

/* ─────────────────────────────────────────────────────────────────────────────
   COUPON DATA
───────────────────────────────────────────────────────────────────────────── */
const coupons = [
  {
    id: 'SUMMER26', title: 'Ngày Hội Hè 2026', subtitle: 'Festival Season',
    description: 'Áp dụng cho tất cả vé nội địa mùa hè',
    discount: '25%', code: 'SUMMER26', expiry: '30/06/2026', minSpend: '500.000đ',
    from: '#f97316', to: '#ef4444', icon: '🎉', tag: 'NGÀY HỘI',
  },
  {
    id: 'NEWUSER200', title: 'Chào Người Dùng Mới', subtitle: 'Welcome Offer',
    description: 'Ưu đãi đặc biệt cho lần đặt vé đầu tiên',
    discount: '200K', code: 'NEWUSER200', expiry: 'Không giới hạn', minSpend: '800.000đ',
    from: '#2563eb', to: '#4f46e5', icon: '🎁', tag: 'NGƯỜI MỚI',
  },
  {
    id: 'FLASH50', title: 'Flash Sale Quốc Tế', subtitle: 'International Deals',
    description: 'Siêu sale: Bangkok, Singapore, Tokyo',
    discount: '50%', code: 'FLASH50', expiry: '20/06/2026', minSpend: '1.500.000đ',
    from: '#f43f5e', to: '#ec4899', icon: '⚡', tag: 'FLASH SALE',
  },
  {
    id: 'WEEKEND15', title: 'Cuối Tuần Bay Vui', subtitle: 'Weekend Getaway',
    description: 'Giảm cho tất cả vé bay Thứ 7 & Chủ Nhật',
    discount: '15%', code: 'WEEKEND15', expiry: '31/07/2026', minSpend: '600.000đ',
    from: '#8b5cf6', to: '#a855f7', icon: '🌴', tag: 'CUỐI TUẦN',
  },
  {
    id: 'FAMILY500', title: 'Gia Đình Vi Vu', subtitle: 'Family Package',
    description: 'Giảm 500K cho nhóm từ 4 khách',
    discount: '500K', code: 'FAMILY500', expiry: '31/08/2026', minSpend: '4.000.000đ',
    from: '#10b981', to: '#059669', icon: '👨‍👩‍👧‍👦', tag: 'GIA ĐÌNH',
  },
  {
    id: 'NIGHTOWL', title: 'Cú Đêm Săn Vé', subtitle: 'Midnight Sale',
    description: 'Giảm thêm 10% khi đặt từ 22h - 02h',
    discount: '10%', code: 'NIGHTOWL', expiry: '30/06/2026', minSpend: '0đ',
    from: '#6366f1', to: '#4338ca', icon: '🦉', tag: 'GIỜ VÀNG',
  },
  {
    id: 'APPONLY', title: 'Ưu Đãi App', subtitle: 'App Exclusive',
    description: 'Giảm 100K khi đặt qua ứng dụng di động',
    discount: '100K', code: 'APPONLY', expiry: 'Không giới hạn', minSpend: '500.000đ',
    from: '#f59e0b', to: '#d97706', icon: '📱', tag: 'APP ONLY',
  },
  {
    id: 'VIPLOUNGE', title: 'Trải Nghiệm VIP', subtitle: 'Business Class',
    description: 'Tặng kèm voucher phòng chờ thương gia',
    discount: 'VIP', code: 'VIPLOUNGE', expiry: '31/12/2026', minSpend: '3.000.000đ',
    from: '#8b5cf6', to: '#6d28d9', icon: '👑', tag: 'THƯƠNG GIA',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   HOT DEALS
───────────────────────────────────────────────────────────────────────────── */
const hotDeals = [
  { from: 'HAN', fromCity: 'Hà Nội', to: 'SGN', toCity: 'TP HCM', price: 650000, airline: 'VietJet Air', date: 'T6, 20/06', bg: 'linear-gradient(135deg,#1e3a5f,#0ea5e9)', emoji: '🏙️', discount: 25, type: 'domestic' },
  { from: 'SGN', fromCity: 'TP HCM', to: 'DAD', toCity: 'Đà Nẵng', price: 490000, airline: 'VietJet Air', date: 'T7, 21/06', bg: 'linear-gradient(135deg,#134e4a,#06b6d4)', emoji: '🌊', discount: 30, type: 'domestic' },
  { from: 'HAN', fromCity: 'Hà Nội', to: 'PQC', toCity: 'Phú Quốc', price: 890000, airline: 'Bamboo Airways', date: 'CN, 22/06', bg: 'linear-gradient(135deg,#1e1b4b,#a21caf)', emoji: '🏝️', discount: 20, type: 'domestic' },
  { from: 'HAN', fromCity: 'Hà Nội', to: 'CXR', toCity: 'Nha Trang', price: 750000, airline: 'VietJet Air', date: 'T5, 19/06', bg: 'linear-gradient(135deg,#0f766e,#059669)', emoji: '🏖️', discount: 15, type: 'domestic' },
  { from: 'SGN', fromCity: 'TP HCM', to: 'PQC', toCity: 'Phú Quốc', price: 680000, airline: 'Bamboo Airways', date: 'T4, 18/06', bg: 'linear-gradient(135deg,#c2410c,#ea580c)', emoji: '🌅', discount: 22, type: 'domestic' },
  { from: 'DAD', fromCity: 'Đà Nẵng', to: 'HAN', toCity: 'Hà Nội', price: 550000, airline: 'Vietnam Airlines', date: 'T3, 17/06', bg: 'linear-gradient(135deg,#4338ca,#6366f1)', emoji: '🏛️', discount: 10, type: 'domestic' },
  { from: 'SGN', fromCity: 'TP HCM', to: 'BKK', toCity: 'Bangkok', price: 1250000, airline: 'Vietnam Airlines', date: 'T2, 23/06', bg: 'linear-gradient(135deg,#7c2d12,#f97316)', emoji: '🌏', discount: 18, type: 'international' },
  { from: 'SGN', fromCity: 'TP HCM', to: 'SIN', toCity: 'Singapore', price: 1800000, airline: 'VietJet Air', date: 'T6, 27/06', bg: 'linear-gradient(135deg,#b91c1c,#ef4444)', emoji: '🦁', discount: 35, type: 'international' },
  { from: 'HAN', fromCity: 'Hà Nội', to: 'NRT', toCity: 'Tokyo', price: 4500000, airline: 'Vietnam Airlines', date: 'T7, 10/07', bg: 'linear-gradient(135deg,#be123c,#fb7185)', emoji: '🗼', discount: 15, type: 'international' },
  { from: 'SGN', fromCity: 'TP HCM', to: 'ICN', toCity: 'Seoul', price: 3200000, airline: 'VietJet Air', date: 'T4, 05/07', bg: 'linear-gradient(135deg,#4c1d95,#8b5cf6)', emoji: '🎎', discount: 20, type: 'international' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   AIRPORT DATA
───────────────────────────────────────────────────────────────────────────── */
type AirportLocation = { city: string; code: string; airport: string; aliases?: string[] };

const airportLocations: AirportLocation[] = [
  { city: 'TP HCM', code: 'SGN', airport: 'Sân bay Tân Sơn Nhất', aliases: ['Hồ Chí Minh', 'Sài Gòn', 'Ho Chi Minh', 'Saigon'] },
  { city: 'Hà Nội', code: 'HAN', airport: 'Sân bay Nội Bài', aliases: ['Ha Noi', 'Hanoi'] },
  { city: 'Đà Nẵng', code: 'DAD', airport: 'Sân bay Đà Nẵng', aliases: ['Da Nang'] },
  { city: 'Phú Quốc', code: 'PQC', airport: 'Sân bay Phú Quốc', aliases: ['Phu Quoc'] },
  { city: 'Nha Trang', code: 'CXR', airport: 'Sân bay Cam Ranh', aliases: ['Cam Ranh'] },
  { city: 'Huế', code: 'HUI', airport: 'Sân bay Phú Bài', aliases: ['Hue'] },
  { city: 'Cần Thơ', code: 'VCA', airport: 'Sân bay Cần Thơ', aliases: ['Can Tho'] },
  { city: 'Bangkok', code: 'BKK', airport: 'Tất cả sân bay BKK', aliases: ['Thái Lan', 'Thailand'] },
  { city: 'Singapore', code: 'SIN', airport: 'Sân bay Changi', aliases: ['Singapo'] },
  { city: 'Tokyo', code: 'NRT', airport: 'Sân bay Narita', aliases: ['Nhật Bản', 'Japan'] },
  { city: 'Seoul', code: 'ICN', airport: 'Sân bay Incheon', aliases: ['Hàn Quốc', 'Korea'] },
];

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
function getDiscountPercent(price: number, oldPrice?: number) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function getFlightMeta(flight: Flight) {
  return flightInfoMeta[flight.id] ?? {
    refundPolicy: 'Hoàn vé theo điều kiện hạng vé đã chọn. Liên hệ hỗ trợ để biết chi tiết.',
    promotion: flight.oldPrice ? `Tiết kiệm ${getDiscountPercent(flight.price, flight.oldPrice)}% so với giá gốc.` : 'Không có khuyến mãi thêm.',
  };
}

function formatVnd(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}g` : `${h}g ${m}p`;
}

function getAmenityIcon(amenity: string) {
  if (amenity.includes('WiFi')) return Wifi;
  if (amenity.includes('Bữa ăn')) return Utensils;
  if (amenity.includes('Hành lý')) return Luggage;
  if (amenity.includes('Phòng chờ') || amenity.includes('VIP')) return Star;
  if (amenity.includes('Ghế')) return Armchair;
  if (amenity.includes('Nước')) return Coffee;
  return BadgeCheck;
}

function formatDateVi(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatPassengerSummary(counts: PassengerCounts) {
  const total = counts.adults + counts.children + counts.infants;
  return `${total} hành khách`;
}

function locationSearchText(loc: AirportLocation) {
  return `${loc.city} (${loc.code})`;
}

function filterAirportLocations(query: string, excludeCode?: string) {
  const n = query.trim().toLowerCase();
  return airportLocations.filter((loc) => {
    if (excludeCode && loc.code === excludeCode) return false;
    if (!n) return true;
    return [loc.city, loc.code, loc.airport, ...(loc.aliases ?? [])].join(' ').toLowerCase().includes(n);
  }).slice(0, 6);
}

function matchesFlightLocation(flightCity: string, flightCode: string, loc: AirportLocation | null) {
  if (!loc) return true;
  const city = flightCity.toLowerCase();
  const code = flightCode.toLowerCase();
  const selCode = loc.code.toLowerCase();
  const selCity = loc.city.toLowerCase();
  const aliases = (loc.aliases ?? []).map(a => a.toLowerCase());
  return code === selCode || city.includes(selCity) || selCity.includes(city) ||
    aliases.some(a => city.includes(a) || a.includes(city));
}

const passengerTypes = [
  { key: 'adults' as const, label: 'Người lớn', hint: 'từ 12 tuổi', min: 1 },
  { key: 'children' as const, label: 'Trẻ em', hint: '2 – 12 tuổi', min: 0 },
  { key: 'infants' as const, label: 'Em bé', hint: 'dưới 2 tuổi', min: 0 },
];

/* ─────────────────────────────────────────────────────────────────────────────
   LOCATION FIELD
───────────────────────────────────────────────────────────────────────────── */
type LocationFieldProps = {
  label: string; icon: typeof PlaneTakeoff; value: AirportLocation | null;
  onChange: (l: AirportLocation) => void; excludeCode?: string;
  containerRef?: RefObject<HTMLDivElement>;
  isOpen: boolean; onOpen: () => void; onClose: () => void;
};

function LocationField({ label, icon: Icon, value, onChange, excludeCode, containerRef, isOpen, onOpen, onClose }: LocationFieldProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestions = useMemo(() => filterAirportLocations(query, excludeCode), [query, excludeCode]);

  useEffect(() => {
    if (isOpen) {
      setQuery(value ? locationSearchText(value) : '');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen, value]);

  const handleSelect = (loc: AirportLocation) => { onChange(loc); onClose(); setQuery(''); };

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-1 rounded-2xl border-2 px-4 py-3 transition-all cursor-pointer ${isOpen ? 'border-blue-500 bg-white shadow-lg shadow-blue-100 dark:shadow-blue-950/30' : 'border-transparent bg-slate-50 dark:bg-slate-800/60 hover:bg-white hover:border-slate-200 dark:hover:bg-slate-800'}`}>
      <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <Icon className="size-3" />{label}
      </span>
      {isOpen ? (
        <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') onClose(); if (e.key === 'Enter' && suggestions[0]) handleSelect(suggestions[0]); }}
          placeholder="Thành phố hoặc mã sân bay…"
          className="bg-transparent text-base font-black text-slate-900 outline-none placeholder:text-slate-300 dark:text-white w-full" />
      ) : (
        <button type="button" onClick={onOpen} className="text-left">
          <span className="block text-base font-black text-slate-900 dark:text-white leading-tight">
            {value ? locationSearchText(value) : <span className="text-slate-400 font-medium">Chọn địa điểm</span>}
          </span>
          {value && <span className="text-xs text-slate-400 font-medium">{value.airport}</span>}
        </button>
      )}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          {suggestions.length === 0
            ? <p className="px-4 py-4 text-sm text-slate-400">Không tìm thấy địa điểm.</p>
            : suggestions.map(loc => (
              <button key={loc.code} type="button" onMouseDown={e => e.preventDefault()} onClick={() => handleSelect(loc)}
                className="flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3 text-left last:border-0 hover:bg-blue-50 dark:border-slate-800 dark:hover:bg-blue-950/40">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40">
                  <Globe className="size-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{locationSearchText(loc)}</p>
                  <p className="text-xs text-slate-400">{loc.airport}</p>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   FLIGHT CARD
───────────────────────────────────────────────────────────────────────────── */
function FlightCard({ flight, selected, activeTab, onSelect, onTabChange }: {
  flight: Flight; selected: boolean; activeTab: FlightInfoTab | null;
  onSelect: () => void; onTabChange: (t: FlightInfoTab) => void;
}) {
  const meta = getFlightMeta(flight);
  const discount = getDiscountPercent(flight.price, flight.oldPrice);
  const seatsLeft = flight.seats;
  const seatsPercent = Math.round((seatsLeft / flight.totalSeats) * 100);
  const isLow = seatsLeft <= 20;

  const tabs: Array<{ id: FlightInfoTab; label: string; icon: typeof Info }> = [
    { id: 'detail', label: 'Chi tiết', icon: Info },
    { id: 'refund', label: 'Hoàn vé', icon: RotateCcw },
    { id: 'promo', label: 'Ưu đãi', icon: Gift },
  ];

  return (
    <article className={`overflow-hidden rounded-2xl bg-white transition-all duration-200 dark:bg-slate-900 ${selected ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-100/50 dark:shadow-blue-950/30' : 'shadow-md hover:shadow-xl border border-slate-100 dark:border-slate-800'}`}>
      <div className="p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

          {/* Airline logo */}
          <div className="flex items-center gap-3 lg:w-52 flex-shrink-0">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-white text-sm font-black shadow-md"
              style={{ background: `linear-gradient(135deg, ${flight.logoColor}, ${flight.logoColor}cc)` }}>
              {flight.logo}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{flight.airline}</p>
              <p className="text-[11px] text-slate-400 font-medium">{flight.code}</p>
              <div className="mt-1 inline-flex items-center gap-1">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{flight.rating}</span>
              </div>
            </div>
          </div>

          {/* Route + time */}
          <div className="flex flex-1 items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{flight.departure}</p>
              <p className="text-xs font-black text-blue-600 dark:text-blue-400">{flight.fromCode}</p>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[70px]">{flight.from}</p>
            </div>

            <div className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {formatDuration(flight.duration)}
              </span>
              <div className="flex w-full items-center gap-1">
                <div className="h-[1.5px] flex-1 bg-slate-200 dark:bg-slate-700" />
                <div className="flex size-6 items-center justify-center rounded-full bg-blue-600 shadow-sm shadow-blue-300">
                  <Plane className="size-3 text-white" />
                </div>
                <div className="h-[1.5px] flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{flight.stop}</span>
            </div>

            <div className="text-center">
              <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{flight.arrival}</p>
              <p className="text-xs font-black text-blue-600 dark:text-blue-400">{flight.toCode}</p>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[70px]">{flight.to}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-16 bg-slate-100 dark:bg-slate-800 flex-shrink-0" />

          {/* Price + action */}
          <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end lg:w-48 flex-shrink-0">
            <div className="text-right">
              {flight.oldPrice && (
                <div className="flex items-center justify-end gap-2 mb-1">
                  <span className="text-[11px] text-slate-400 line-through">{formatVnd(flight.oldPrice)}</span>
                  <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-black text-rose-600">-{discount}%</span>
                </div>
              )}
              <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{formatVnd(flight.price)}</p>
              <p className="text-[11px] text-slate-400 font-medium">/ 1 khách</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button type="button" onClick={onSelect}
                className={`rounded-xl px-5 py-2.5 text-sm font-black text-white transition-all ${selected ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-emerald-950' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg hover:shadow-blue-200 dark:shadow-blue-950'}`}>
                {selected ? <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4" /> Đã chọn</span> : 'Chọn vé'}
              </button>

              {/* Seat availability */}
              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${isLow ? 'bg-rose-500' : 'bg-emerald-400'}`} style={{ width: `${seatsPercent}%` }} />
                </div>
                <span className={`text-[10px] font-bold ${isLow ? 'text-rose-500' : 'text-slate-400'}`}>
                  {seatsLeft} chỗ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tags row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black text-white"
            style={{ background: flight.tagColor }}>
            {flight.tag}
          </span>
          {flight.amenities.slice(0, 3).map(a => {
            const AIcon = getAmenityIcon(a);
            return (
              <span key={a} className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                <AIcon className="size-3" />{a}
              </span>
            );
          })}
          {flight.amenities.length > 3 && (
            <span className="text-[10px] font-bold text-slate-400">+{flight.amenities.length - 3} tiện ích</span>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-t border-slate-100 dark:border-slate-800 flex overflow-x-auto">
        {tabs.map(tab => {
          const TIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-5 py-3 text-xs font-black transition-colors ${isActive ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>
              <TIcon className="size-3.5" />{tab.label}
            </button>
          );
        })}
      </div>

      {activeTab && (
        <div className="bg-slate-50 dark:bg-slate-950/50 px-5 py-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {activeTab === 'detail' && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p><span className="font-black text-slate-900 dark:text-white">Tuyến bay: </span>{flight.from} → {flight.to}</p>
                <p><span className="font-black text-slate-900 dark:text-white">Thời gian: </span>{flight.departure} – {flight.arrival} ({formatDuration(flight.duration)})</p>
                <p><span className="font-black text-slate-900 dark:text-white">Hạng ghế: </span>{flight.flightClass}</p>
              </div>
              <div className="flex flex-wrap gap-2 content-start">
                {flight.amenities.map(a => {
                  const AI = getAmenityIcon(a);
                  return (
                    <span key={a} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white">
                      <AI className="size-3.5" />{a}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          {activeTab === 'refund' && (
            <div className="flex items-start gap-3">
              <RotateCcw className="size-4 text-slate-400 shrink-0 mt-0.5" />
              <p>{meta.refundPolicy}</p>
            </div>
          )}
          {activeTab === 'promo' && (
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Gift className="size-4 text-orange-400 shrink-0 mt-0.5" />
                <p>{meta.promotion}</p>
              </div>
              {flight.oldPrice && (
                <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 px-3 py-2">
                  <TrendingDown className="size-4 text-orange-500" />
                  <span className="text-xs font-black text-orange-700 dark:text-orange-400">
                    Tiết kiệm {formatVnd(flight.oldPrice - flight.price)} ({discount}%) so với giá gốc
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   COUPON CARD — Boarding Pass Style
───────────────────────────────────────────────────────────────────────────── */
function CouponCard({ coupon }: { coupon: typeof coupons[number] }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(coupon.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 dark:border-slate-800">
      {/* Top colored section */}
      <div className="px-5 pt-5 pb-4" style={{ background: `linear-gradient(135deg, ${coupon.from}18, ${coupon.to}0c)` }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black text-white mb-2"
              style={{ background: `linear-gradient(135deg, ${coupon.from}, ${coupon.to})` }}>
              {coupon.tag}
            </span>
            <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{coupon.title}</h3>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">{coupon.subtitle}</p>
          </div>
          {/* Discount circle */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center size-16 rounded-2xl text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${coupon.from}, ${coupon.to})` }}>
            <span className="text-xl font-black leading-none">{coupon.discount}</span>
            <span className="text-[9px] font-bold opacity-90">GIẢM</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{coupon.description}</p>
      </div>

      {/* Perforated divider */}
      <div className="relative h-0 flex items-center">
        <div className="absolute -left-3 size-6 rounded-full bg-slate-100 dark:bg-slate-950" />
        <div className="absolute -right-3 size-6 rounded-full bg-slate-100 dark:bg-slate-950" />
        <div className="w-full border-t-2 border-dashed border-slate-200 dark:border-slate-700 mx-6" />
      </div>

      {/* Bottom coupon section */}
      <div className="px-5 pt-4 pb-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-1">Mã giảm giá</p>
            <code className="text-sm font-black tracking-[0.2em] text-slate-900 dark:text-white">
              {coupon.code}
            </code>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-1">Hết hạn</p>
            <p className="text-xs font-black text-slate-700 dark:text-slate-300">{coupon.expiry}</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mb-3">Đơn tối thiểu: <strong className="text-slate-600 dark:text-slate-300">{coupon.minSpend}</strong></p>
        <button type="button" onClick={copy}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-black transition-all ${copied ? 'bg-emerald-500 text-white' : 'border-2 border-dashed text-slate-500 hover:text-white hover:border-transparent'}`}
          style={copied ? {} : { borderColor: coupon.from + '80' }}
          onMouseEnter={e => { if (!copied) { (e.currentTarget as HTMLButtonElement).style.background = `linear-gradient(135deg, ${coupon.from}, ${coupon.to})`; } }}
          onMouseLeave={e => { if (!copied) { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.color = ''; } }}>
          {copied ? <><CheckCircle2 className="size-3.5" /> Đã sao chép!</> : <><Copy className="size-3.5" /> Sao chép mã</>}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────────────── */
export default function FlightPage() {
  const { theme } = useTheme();
  const router = useRouter();

  const defaultFrom = airportLocations.find(l => l.code === 'SGN')!;
  const defaultTo = airportLocations.find(l => l.code === 'BKK')!;

  const [fromLocation, setFromLocation] = useState<AirportLocation>(defaultFrom);
  const [toLocation, setToLocation] = useState<AirportLocation>(defaultTo);
  const [activeLocationField, setActiveLocationField] = useState<'from' | 'to' | null>(null);
  const [date, setDate] = useState('2026-06-20');
  const [returnDate, setReturnDate] = useState('2026-06-25');
  const [tripType, setTripType] = useState<TripType>('round-trip');
  const [directFlight, setDirectFlight] = useState(false);
  const [passengerCounts, setPassengerCounts] = useState<PassengerCounts>({ adults: 1, children: 0, infants: 0 });
  const [cabinClass, setCabinClass] = useState<FlightClass>('Phổ thông');
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showCabinDropdown, setShowCabinDropdown] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('price');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [ticketTab, setTicketTab] = useState<'economy' | 'premium'>('economy');
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedFlightTab, setExpandedFlightTab] = useState<{ flightId: string; tab: FlightInfoTab } | null>(null);
  const [notice, setNotice] = useState('');
  const [showAllDeals, setShowAllDeals] = useState(false);
  const [showAllCoupons, setShowAllCoupons] = useState(false);
  const [activeDealTab, setActiveDealTab] = useState<'domestic' | 'international'>('domestic');

  const passengerDropdownRef = useRef<HTMLDivElement>(null);
  const cabinDropdownRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const departureDateRef = useRef<HTMLInputElement>(null);
  const returnDateRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const totalPassengers = passengerCounts.adults + passengerCounts.children + passengerCounts.infants;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (passengerDropdownRef.current && !passengerDropdownRef.current.contains(e.target as Node)) setShowPassengerDropdown(false);
      if (cabinDropdownRef.current && !cabinDropdownRef.current.contains(e.target as Node)) setShowCabinDropdown(false);
      if (fromRef.current && !fromRef.current.contains(e.target as Node) && toRef.current && !toRef.current.contains(e.target as Node))
        setActiveLocationField(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const updateCount = (key: keyof PassengerCounts, delta: number) => {
    setPassengerCounts(c => {
      const next = c[key] + delta;
      const min = passengerTypes.find(t => t.key === key)?.min ?? 0;
      const max = key === 'infants' ? c.adults : 9;
      if (next < min || next > max) return c;
      return { ...c, [key]: next };
    });
  };

  const filteredFlights = useMemo(() => {
    if (!hasSearched) return [];
    return flights
      .filter(f => {
        const mFrom = matchesFlightLocation(f.from, f.fromCode, fromLocation);
        const mTo = matchesFlightLocation(f.to, f.toCode, toLocation);
        const mDirect = !directFlight || f.stop === 'Bay thẳng';
        const mCabin = f.flightClass === cabinClass;
        return mFrom && mTo && mDirect && mCabin;
      })
      .sort((a, b) => {
        if (sortMode === 'duration') return a.duration - b.duration;
        if (sortMode === 'departure') return a.departure.localeCompare(b.departure);
        return a.price - b.price;
      });
  }, [hasSearched, fromLocation, toLocation, sortMode, directFlight, cabinClass]);

  const handleSearch = () => {
    setHasSearched(true);
    setActiveLocationField(null);
    setSelectedFlight(null);
    setExpandedFlightTab(null);
    setNotice('');
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleBack = () => {
    setHasSearched(false);
    setSelectedFlight(null);
    setExpandedFlightTab(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Search form JSX */
  const searchForm = (
    <div className="rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 shadow-2xl border border-white/50 dark:border-slate-700/50">
      {/* Trip type + options row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        {/* Trip type pills */}
        <div className="flex items-center gap-1 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1">
          {[{ id: 'one-way' as const, label: 'Một chiều' }, { id: 'round-trip' as const, label: 'Khứ hồi' }].map(opt => (
            <button key={opt.id} onClick={() => setTripType(opt.id)}
              className={`rounded-xl px-5 py-2 text-xs font-black transition-all ${tripType === opt.id ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Direct flight toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`relative size-9 rounded-xl border-2 transition-all flex items-center justify-center ${directFlight ? 'border-blue-500 bg-blue-500' : 'border-slate-200 dark:border-slate-700'}`}
              onClick={() => setDirectFlight(v => !v)}>
              {directFlight && <Plane className="size-4 text-white" />}
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Bay thẳng</span>
          </label>

          {/* Passengers dropdown */}
          <div ref={passengerDropdownRef} className="relative">
            <button type="button"
              onClick={() => { setShowPassengerDropdown(o => !o); setShowCabinDropdown(false); }}
              className="flex items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-blue-300 transition-colors">
              <Users className="size-3.5 text-slate-400" />
              {totalPassengers} khách
              <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${showPassengerDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showPassengerDropdown && (
              <div className="absolute top-full right-0 mt-2 z-30 w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-2xl">
                {passengerTypes.map(type => (
                  <div key={type.key} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{type.label}</p>
                      <p className="text-xs text-slate-400">{type.hint}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => updateCount(type.key, -1)} disabled={passengerCounts[type.key] <= type.min}
                        className="flex size-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 disabled:opacity-30 transition-colors">
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-black text-slate-900 dark:text-white">{passengerCounts[type.key]}</span>
                      <button type="button" onClick={() => updateCount(type.key, 1)}
                        disabled={type.key === 'infants' ? passengerCounts.infants >= passengerCounts.adults : passengerCounts[type.key] >= 9}
                        className="flex size-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-600 disabled:opacity-30 transition-colors">
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cabin class */}
          <div ref={cabinDropdownRef} className="relative">
            <button type="button"
              onClick={() => { setShowCabinDropdown(o => !o); setShowPassengerDropdown(false); }}
              className="flex items-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-blue-300 transition-colors">
              <Armchair className="size-3.5 text-slate-400" />
              {cabinClass}
              <ChevronDown className={`size-3.5 text-slate-400 transition-transform ${showCabinDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showCabinDropdown && (
              <div className="absolute top-full right-0 mt-2 z-30 w-44 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-2xl">
                {flightClasses.map(cls => (
                  <button key={cls} type="button" onClick={() => { setCabinClass(cls); setShowCabinDropdown(false); }}
                    className={`flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-bold transition-colors text-left ${cabinClass === cls ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    {cabinClass === cls && <CheckCircle2 className="size-3.5 mr-2 text-blue-600" />}
                    {cls}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main search fields */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_48px_1fr_1fr_1fr_auto] xl:items-stretch">
        <LocationField label="Điểm khởi hành" icon={PlaneTakeoff} value={fromLocation}
          onChange={l => { setFromLocation(l); setSelectedFlight(null); }} excludeCode={toLocation.code}
          containerRef={fromRef} isOpen={activeLocationField === 'from'}
          onOpen={() => { setActiveLocationField('from'); setShowPassengerDropdown(false); setShowCabinDropdown(false); }}
          onClose={() => setActiveLocationField(null)} />

        {/* Swap button */}
        <button type="button" onClick={() => { setFromLocation(toLocation); setToLocation(fromLocation); setActiveLocationField(null); }}
          className="mx-auto flex size-12 items-center justify-center self-center rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all">
          <ArrowLeftRight className="size-4" />
        </button>

        <LocationField label="Điểm đến" icon={PlaneLanding} value={toLocation}
          onChange={l => { setToLocation(l); setSelectedFlight(null); }} excludeCode={fromLocation.code}
          containerRef={toRef} isOpen={activeLocationField === 'to'}
          onOpen={() => { setActiveLocationField('to'); setShowPassengerDropdown(false); setShowCabinDropdown(false); }}
          onClose={() => setActiveLocationField(null)} />

        {/* Departure date */}
        <button type="button" onClick={() => departureDateRef.current?.showPicker?.()}
          className="flex flex-col gap-1 rounded-2xl border-2 border-transparent bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-left hover:bg-white hover:border-slate-200 dark:hover:bg-slate-800 dark:hover:border-slate-600 transition-all">
          <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <CalendarDays className="size-3" /> Khởi hành
          </span>
          <span className="text-base font-black text-slate-900 dark:text-white leading-tight">{formatDateVi(date) || 'Chọn ngày'}</span>
          <input ref={departureDateRef} type="date" min={new Date().toISOString().split('T')[0]} value={date} onChange={e => setDate(e.target.value)} className="sr-only" />
        </button>

        {/* Return date */}
        {tripType === 'round-trip' ? (
          <button type="button" onClick={() => returnDateRef.current?.showPicker?.()}
            className="flex flex-col gap-1 rounded-2xl border-2 border-transparent bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-left hover:bg-white hover:border-slate-200 dark:hover:bg-slate-800 dark:hover:border-slate-600 transition-all">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <CalendarDays className="size-3" /> Khứ hồi
            </span>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-900 dark:text-white leading-tight flex-1">{formatDateVi(returnDate) || 'Chọn ngày'}</span>
              {returnDate && (
                <span role="button" tabIndex={0} onClick={e => { e.stopPropagation(); setReturnDate(''); }}
                  className="rounded-full p-0.5 text-slate-400 hover:text-slate-600">
                  <X className="size-3.5" />
                </span>
              )}
            </div>
            <input ref={returnDateRef} type="date" min={date || new Date().toISOString().split('T')[0]} value={returnDate} onChange={e => setReturnDate(e.target.value)} className="sr-only" />
          </button>
        ) : <div className="hidden xl:block" />}

        {/* Search button */}
        <button onClick={handleSearch}
          className="relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 text-sm font-black text-white transition-all hover:from-blue-500 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-300/40 dark:hover:shadow-blue-900/40 xl:min-w-[150px] group">
          <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Plane className="size-4" />
          Tìm kiếm
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-12deg); }
          50%       { transform: translateY(-20px) rotate(-12deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .anim-slide-up { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-fade-in  { animation: fadeIn 0.35s ease both; }
        .float-plane   { animation: float 6s ease-in-out infinite; }
        .float-plane-2 { animation: float 8s ease-in-out 1.5s infinite; }
        .shimmer-btn {
          background: linear-gradient(90deg, #2563eb 0%, #60a5fa 50%, #2563eb 100%);
          background-size: 200% 100%;
        }
        .shimmer-btn:hover { animation: shimmer 1.5s linear infinite; }
      `}</style>

      <Header />

      <main className="flex-1 bg-slate-100 dark:bg-slate-950 min-h-screen">

        {/* ══════════════ VIEW: Search Home ══════════════ */}
        {!hasSearched && (
          <>
            {/* HERO */}
            <section className="relative overflow-hidden bg-slate-100 dark:bg-slate-900">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
              />
              
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-slate-100 dark:to-slate-950" />

              {/* Floating planes */}
              <div className="absolute top-10 right-12 opacity-10 float-plane text-8xl select-none pointer-events-none">✈</div>
              <div className="absolute top-32 right-48 opacity-5 float-plane-2 text-5xl select-none pointer-events-none">✈</div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 backdrop-blur-sm px-4 py-1.5 mb-6">
                  <span className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-blue-200 text-xs font-bold tracking-widest uppercase">Tìm vé máy bay tốt nhất</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight">
                  Bay Thông Minh,{' '}
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg,#60a5fa,#a78bfa)' }}>
                    Tiết Kiệm Hơn
                  </span>
                </h1>
                <p className="text-blue-200/80 text-base font-medium mb-10 max-w-xl">
                  So sánh hàng ngàn chuyến bay từ các hãng hàng đầu, đặt vé trong vài giây với giá tốt nhất.
                </p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-10">
                  {[
                    { label: 'Hãng bay', value: '50+', icon: Plane },
                    { label: 'Điểm đến', value: '200+', icon: Globe },
                    { label: 'Chuyến/ngày', value: '5.000+', icon: Clock },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-xl bg-white/10">
                        <s.icon className="size-4 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-white font-black text-sm leading-none">{s.value}</p>
                        <p className="text-blue-300/70 text-[11px]">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Search form */}
                {searchForm}
              </div>
            </section>

            {/* ── Popular routes bar ── */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-6 overflow-x-auto">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest shrink-0">Phổ biến</span>
                {[
                  { label: 'HAN → SGN', sub: 'Hà Nội - TP HCM' },
                  { label: 'SGN → DAD', sub: 'TP HCM - Đà Nẵng' },
                  { label: 'HAN → PQC', sub: 'Hà Nội - Phú Quốc' },
                  { label: 'SGN → BKK', sub: 'TP HCM - Bangkok' },
                ].map(r => (
                  <button key={r.label}
                    onClick={() => {
                      const [fc, tc] = r.label.split(' → ');
                      const from = airportLocations.find(l => l.code === fc);
                      const to = airportLocations.find(l => l.code === tc);
                      if (from) setFromLocation(from);
                      if (to) setToLocation(to);
                      handleSearch();
                    }}
                    className="shrink-0 flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:border-blue-600 dark:hover:bg-blue-950/20 px-3 py-2 transition-all">
                    <Plane className="size-3 text-blue-500" />
                    <div className="text-left">
                      <p className="text-xs font-black text-slate-900 dark:text-white">{r.label}</p>
                      <p className="text-[10px] text-slate-400">{r.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Deals & Coupons ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

              {/* Hot Deals */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="size-4 text-amber-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-amber-500">Ưu đãi hôm nay</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Vé Máy Bay Giá Tốt 🔥</h2>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  {/* Tabs */}
                  <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                    <button
                      onClick={() => { setActiveDealTab('domestic'); setShowAllDeals(false); }}
                      className={`rounded-lg px-4 py-1.5 text-xs font-black transition-all ${activeDealTab === 'domestic' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      Nội địa
                    </button>
                    <button
                      onClick={() => { setActiveDealTab('international'); setShowAllDeals(false); }}
                      className={`rounded-lg px-4 py-1.5 text-xs font-black transition-all ${activeDealTab === 'international' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      Nước ngoài
                    </button>
                  </div>

                  <button
                    onClick={() => setShowAllDeals(!showAllDeals)}
                    className="flex items-center gap-1 text-xs font-black text-blue-600 hover:underline shrink-0"
                  >
                    {showAllDeals ? 'Thu gọn' : 'Xem tất cả'}
                    <ChevronRight className={`size-4 transition-transform ${showAllDeals ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
                {(showAllDeals 
                  ? hotDeals.filter(d => d.type === activeDealTab) 
                  : hotDeals.filter(d => d.type === activeDealTab).slice(0, 4)
                ).map(deal => (
                  <div key={`${deal.from}-${deal.to}`}
                    onClick={() => {
                      const from = airportLocations.find(l => l.code === deal.from);
                      const to = airportLocations.find(l => l.code === deal.to);
                      if (from) setFromLocation(from);
                      if (to) setToLocation(to);
                      handleSearch();
                    }}
                    className="group relative overflow-hidden rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-2xl"
                    style={{ background: deal.bg }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-8">
                        <span className="text-3xl">{deal.emoji}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-2 py-1 text-[10px] font-black text-white">
                          -{deal.discount}%
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-white font-black text-lg">{deal.from}</span>
                          <Plane className="size-3.5 text-white/70" />
                          <span className="text-white font-black text-lg">{deal.to}</span>
                        </div>
                        <p className="text-white/60 text-xs font-medium mb-3">{deal.fromCity} → {deal.toCity}</p>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-white/60 text-[10px]">{deal.airline}</p>
                            <p className="text-white/60 text-[10px]">{deal.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white/70 text-[10px]">Chỉ từ</p>
                            <p className="text-white font-black text-base">{formatVnd(deal.price)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupons */}
              <div className="flex items-end justify-between mb-7">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="size-4 text-rose-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-rose-500">Tiết kiệm ngay</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Phiếu Giảm Giá 🎟️</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 px-3 py-1.5">
                    <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400">{coupons.length} mã đang hoạt động</span>
                  </div>
                  <button
                    onClick={() => setShowAllCoupons(!showAllCoupons)}
                    className="flex items-center gap-1 text-xs font-black text-rose-600 hover:underline"
                  >
                    {showAllCoupons ? 'Thu gọn' : 'Xem tất cả'}
                    <ChevronRight className={`size-4 transition-transform ${showAllCoupons ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {(showAllCoupons ? coupons : coupons.slice(0, 4)).map(c => <CouponCard key={c.id} coupon={c} />)}
              </div>

              {/* Trust badges */}
              <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: '🔒', title: 'Thanh toán bảo mật', sub: 'Mã hóa SSL 256-bit' },
                  { icon: '✅', title: 'Đặt vé xác nhận ngay', sub: 'Không chờ đợi' },
                  { icon: '💸', title: 'Giá tốt đảm bảo', sub: 'Cam kết giá thấp nhất' },
                  { icon: '🎧', title: 'Hỗ trợ 24/7', sub: 'Luôn sẵn sàng hỗ trợ' },
                ].map(b => (
                  <div key={b.title} className="flex items-center gap-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
                    <span className="text-2xl">{b.icon}</span>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white">{b.title}</p>
                      <p className="text-[10px] text-slate-400">{b.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ══════════════ VIEW: Results ══════════════ */}
        {hasSearched && (
          <div ref={resultsRef} className="anim-fade-in">
            {/* Compact top bar */}
            <div className="sticky top-0 z-30 border-b border-white/10 shadow-xl" style={{ background: 'linear-gradient(90deg, #0a1f52, #0d2f7a)' }}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4 flex-wrap">
                <button type="button" onClick={handleBack}
                  className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 text-white text-xs font-black transition-colors flex-shrink-0">
                  <ChevronLeft className="size-4" /> Quay lại
                </button>

                <div className="flex flex-1 items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                    <span className="text-sm font-black text-white">{fromLocation.code}</span>
                    <ArrowLeftRight className="size-3.5 text-blue-300" />
                    <span className="text-sm font-black text-white">{toLocation.code}</span>
                  </div>
                  <span className="text-white/50 text-xs">·</span>
                  <span className="text-xs text-white/80 font-medium">{formatDateVi(date)}</span>
                  {tripType === 'round-trip' && returnDate && (
                    <><span className="text-white/50 text-xs">→</span>
                    <span className="text-xs text-white/80 font-medium">{formatDateVi(returnDate)}</span></>
                  )}
                  <span className="text-white/50 text-xs">·</span>
                  <span className="text-xs text-white/80 font-medium">{totalPassengers} khách · {cabinClass}</span>
                </div>

                <button type="button" onClick={handleBack}
                  className="flex items-center gap-2 rounded-xl bg-white text-blue-700 px-4 py-2 text-xs font-black hover:bg-blue-50 transition-colors flex-shrink-0">
                  Sửa tìm kiếm
                </button>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Results header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {filteredFlights.length > 0
                      ? <>{filteredFlights.length} chuyến bay · <span className="text-blue-600">{locationSearchText(fromLocation)} → {locationSearchText(toLocation)}</span></>
                      : 'Không có chuyến bay phù hợp'
                    }
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">{formatDateVi(date)} · {totalPassengers} hành khách · {cabinClass}</p>
                </div>

                {/* Sort tabs */}
                <div className="flex items-center gap-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 shadow-sm">
                  {[
                    { id: 'price' as SortMode, label: 'Giá thấp nhất' },
                    { id: 'duration' as SortMode, label: 'Nhanh nhất' },
                    { id: 'departure' as SortMode, label: 'Sớm nhất' },
                  ].map(s => (
                    <button key={s.id} type="button" onClick={() => setSortMode(s.id)}
                      className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${sortMode === s.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter bar */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 cursor-pointer hover:border-blue-400 transition-colors">
                  <input type="checkbox" checked={directFlight} onChange={e => setDirectFlight(e.target.checked)} className="accent-blue-600 size-3.5" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Bay thẳng</span>
                </label>
                {(['Phổ thông', 'Thương gia', 'Hạng nhất'] as FlightClass[]).map(cls => (
                  <button key={cls} type="button" onClick={() => setCabinClass(cls)}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition-all ${cabinClass === cls ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-blue-300'}`}>
                    {cls}
                  </button>
                ))}
              </div>

              {/* Flight list */}
              {filteredFlights.length === 0 ? (
                <div className="anim-slide-up rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-16 text-center shadow-sm">
                  <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Plane className="size-9 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Không tìm thấy chuyến bay</h3>
                  <p className="text-sm text-slate-400 mb-6">Hãy thử đổi ngày, hạng ghế hoặc bỏ lọc bay thẳng.</p>
                  <button type="button" onClick={handleBack}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white hover:bg-blue-700">
                    <ChevronLeft className="size-4" /> Tìm lại
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFlights.map((flight, i) => (
                    <div key={flight.id} className="anim-slide-up" style={{ animationDelay: `${i * 70}ms` }}>
                      <FlightCard
                        flight={flight}
                        selected={selectedFlight?.id === flight.id}
                        activeTab={expandedFlightTab?.flightId === flight.id ? expandedFlightTab.tab : null}
                        onSelect={() => { setSelectedFlight(flight); setNotice(`Đã chọn ${flight.airline} ${flight.code}`); }}
                        onTabChange={tab => setExpandedFlightTab(c => c?.flightId === flight.id && c.tab === tab ? null : { flightId: flight.id, tab })}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Select Ticket Modal */}
              {selectedFlight && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm anim-fade-in">
                  <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl flex flex-col relative">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">Chọn loại vé</h2>
                      <button onClick={() => setSelectedFlight(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="size-5 text-slate-500" />
                      </button>
                    </div>
                    
                    {/* Flight Summary */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex size-12 items-center justify-center rounded-xl text-white font-black shadow-sm" style={{ background: selectedFlight.logoColor }}>
                          {selectedFlight.logo}
                        </div>
                        <div className="flex-1 w-full sm:w-auto">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-black text-slate-900 dark:text-white">{selectedFlight.airline}</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">Phổ thông</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400 w-full">
                            <span className="font-bold">{selectedFlight.departure}</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">{selectedFlight.fromCode}</span>
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700 relative flex items-center justify-center min-w-[50px]">
                              <span className="absolute -top-3 text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-1">{selectedFlight.duration}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">{selectedFlight.toCode}</span>
                            <span className="font-bold">{selectedFlight.arrival}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ticket Types */}
                    <div className="p-6 flex-1 bg-white dark:bg-slate-900">
                      <div className="flex overflow-x-auto items-center gap-6 mb-6 border-b border-slate-100 dark:border-slate-800">
                        <button onClick={() => setTicketTab('economy')} className={`pb-3 border-b-2 text-sm font-black shrink-0 ${ticketTab === 'economy' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Phổ thông</button>
                        <button onClick={() => setTicketTab('premium')} className={`pb-3 border-b-2 text-sm font-bold shrink-0 ${ticketTab === 'premium' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                          Phổ thông đặc biệt <span className="text-xs font-normal opacity-70">(Từ {formatVnd(selectedFlight.price + 500000)})</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(ticketTab === 'economy' ? [
                          {
                            name: 'Economy',
                            price: selectedFlight.price,
                            perks: [
                              { i: true, t: 'Hành lý xách tay 7 kg' },
                              { i: false, t: 'Hành lý ký gửi 0 kg' },
                              { i: false, t: 'Không áp dụng thay đổi vé' },
                              { i: false, t: 'Không áp dụng hoàn vé' },
                              { i: false, t: 'Không cung cấp hóa đơn VAT' },
                            ]
                          },
                          {
                            name: 'Economy Eco',
                            price: selectedFlight.price + 41500,
                            perks: [
                              { i: true, t: 'Hành lý xách tay 7 kg' },
                              { i: false, t: 'Hành lý ký gửi 0 kg' },
                              { i: true, t: 'Phí đổi lịch từ 885.000 VND' },
                              { i: true, t: 'Phí hoàn tiền từ 850.000 VND' },
                              { i: true, t: 'Cung cấp hóa đơn VAT' },
                            ]
                          },
                          {
                            name: 'Economy Deluxe',
                            price: selectedFlight.price + 444000,
                            perks: [
                              { i: true, t: 'Hành lý xách tay 7 kg' },
                              { i: true, t: 'Hành lý ký gửi 20 kg' },
                              { i: true, t: 'Phí đổi lịch từ 150.000 VND' },
                              { i: true, t: 'Phí hoàn tiền từ 300.000 VND' },
                              { i: true, t: 'Cung cấp hóa đơn VAT' },
                            ]
                          }
                        ] : [
                          {
                            name: 'Premium Economy',
                            price: selectedFlight.price + 500000,
                            perks: [
                              { i: true, t: 'Ghế ngồi khoang Thương gia' },
                              { i: true, t: 'Hành lý xách tay 10 kg' },
                              { i: true, t: 'Hành lý ký gửi 30 kg' },
                              { i: true, t: 'Suất ăn đặc biệt miễn phí' },
                              { i: true, t: 'Phòng chờ hạng Thương gia VIP' },
                            ]
                          }
                        ]).map(ticket => (
                          <div key={ticket.name} className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:border-blue-400 transition-colors bg-white dark:bg-slate-800">
                            <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{ticket.name}</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-slate-900 dark:text-white">{formatVnd(ticket.price)}</span>
                                <span className="text-xs text-slate-500">/khách</span>
                              </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col gap-3">
                              {ticket.perks.map((p, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  {p.i ? <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" /> : <X className="size-4 shrink-0 text-slate-300 mt-0.5" />}
                                  <span className={`text-xs leading-relaxed ${p.i ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>{p.t}</span>
                                </div>
                              ))}
                            </div>
                            <div className="p-5 pt-0 mt-auto">
                              <button 
                                onClick={() => {
                                  const query = new URLSearchParams({
                                    flightId: selectedFlight.id,
                                    ticketName: ticket.name,
                                    price: ticket.price.toString()
                                  });
                                  router.push(`/flight/booking?${query.toString()}`);
                                }}
                                className="w-full py-3 rounded-xl bg-blue-600 text-white font-black text-sm hover:bg-blue-700 transition-colors"
                              >
                                Chọn
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
