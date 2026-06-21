"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useIsMobile } from '@/components/ui/use-mobile';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Wifi,
  Waves,
  Utensils,
  Sparkles,
  Dumbbell,
  Palmtree,
  Plane,
  Coffee,
  ArrowLeft,
  Maximize2,
  Bed,
  Users,
  CheckCircle2,
  Share2,
  Bookmark,
  Sprout,
  Mountain,
  Headphones,
} from 'lucide-react';
import RoomTypeModal from '@/components/RoomTypeModal';
import { getHotelFavorites, toggleHotelFavorite } from '@/lib/hotelStorage';
import { useEffect } from 'react';

type SortMode = 'recommended' | 'price' | 'rating';
type BookingMode = 'hourly' | 'overnight' | 'daily';

const bookingModeOptions: { value: BookingMode; label: string }[] = [
  { value: 'hourly', label: 'Theo giờ' },
  { value: 'overnight', label: 'Qua đêm' },
  { value: 'daily', label: 'Theo ngày' },
];

const hourlyTimeOptions = [
  '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00',
];

const otherServices = [
  {
    id: 'spa',
    name: 'Spa & Wellness',
    desc: 'Spa & wellness, ainamytara haes.',
    icon: 'sprout',
    bgColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  {
    id: 'dining',
    name: 'Dining Experiences',
    desc: 'Trancotimalng dining aperience.',
    icon: 'utensils',
    bgColor: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
  },
  {
    id: 'activities',
    name: 'Activities Tours',
    desc: 'Cluoeroa hikin mountain tou.',
    icon: 'mountain',
    bgColor: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400',
  },
];

const hotels = [
  {
    id: 'ocean-view',
    name: 'Resort Sun Peninsula',
    location: 'Bãi Bắc, Bán đảo Sơn Trà, Đà Nẵng',
    area: 'Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
    rating: 4.8,
    reviews: 2345,
    price: 3500000,
    oldPrice: 4100000,
    badge: 'Bán chạy nhất',
    stars: 5,
    features: ['WiFi miễn phí', 'Hồ bơi', 'Nhà hàng', 'Spa'],
  },
  {
    id: 'duong-dong',
    name: 'Dương Đông Boutique Hotel',
    location: 'Dương Đông, Phú Quốc',
    area: 'Phú Quốc',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
    rating: 4.5,
    reviews: 998,
    price: 1850000,
    oldPrice: 2300000,
    stars: 4,
    features: ['WiFi miễn phí', 'Gần bãi biển', 'Đưa đón sân bay'],
  },
  {
    id: 'imperial-garden',
    name: 'Imperial Garden & Spa',
    location: 'Trần Hưng Đạo, Phú Quốc',
    area: 'Phú Quốc',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
    rating: 5.0,
    reviews: 812,
    price: 5100000,
    oldPrice: 6500000,
    badge: 'Giảm 25%',
    stars: 5,
    features: ['Nhà hàng', 'Spa', 'Hồ bơi', 'Phòng gym'],
  },
  {
    id: 'nha-trang-bay',
    name: 'Nha Trang Bay Resort',
    location: 'Đường Trần Phú, Nha Trang',
    area: 'Nha Trang',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    rating: 4.7,
    reviews: 1650,
    price: 2450000,
    oldPrice: 3100000,
    badge: 'Ưu đãi hè',
    stars: 5,
    features: ['WiFi miễn phí', 'Hồ bơi', 'Nhà hàng', 'Gần bãi biển'],
  },
  {
    id: 'da-nang-ocean',
    name: 'Đà Nẵng Ocean Hotel',
    location: 'Mỹ Khê, Đà Nẵng',
    area: 'Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
    rating: 4.6,
    reviews: 1320,
    price: 2100000,
    oldPrice: 2700000,
    stars: 4,
    features: ['WiFi miễn phí', 'Gần bãi biển', 'Bữa sáng miễn phí'],
  },
  {
    id: 'hoi-an-lantern',
    name: 'Hội An Lantern Villa',
    location: 'Phố cổ Hội An, Quảng Nam',
    area: 'Hội An',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592',
    rating: 4.4,
    reviews: 760,
    price: 1350000,
    oldPrice: 1800000,
    stars: 4,
    features: ['WiFi miễn phí', 'Bữa sáng miễn phí', 'Đưa đón sân bay'],
  },
  {
    id: 'sapa-mountain',
    name: 'Sa Pa Mountain Lodge',
    location: 'Trung tâm Sa Pa, Lào Cai',
    area: 'Sa Pa',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd',
    rating: 4.3,
    reviews: 524,
    price: 1650000,
    oldPrice: 2100000,
    stars: 4,
    features: ['WiFi miễn phí', 'Bữa sáng miễn phí', 'Nhà hàng'],
  },
  {
    id: 'ha-long-pearl',
    name: 'Hạ Long Pearl Hotel',
    location: 'Bãi Cháy, Hạ Long',
    area: 'Hạ Long',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    rating: 4.2,
    reviews: 690,
    price: 1750000,
    oldPrice: 2200000,
    stars: 4,
    features: ['WiFi miễn phí', 'Hồ bơi', 'Nhà hàng'],
  },
  {
    id: 'da-lat-pine',
    name: 'Đà Lạt Pine Garden',
    location: 'Hồ Tuyền Lâm, Đà Lạt',
    area: 'Đà Lạt',
    image: 'https://images.unsplash.com/photo-1501117716987-c8e1ecb21098',
    rating: 4.1,
    reviews: 430,
    price: 1250000,
    oldPrice: 1650000,
    stars: 3,
    features: ['WiFi miễn phí', 'Bữa sáng miễn phí', 'Nhà hàng'],
  },
  {
    id: 'hanoi-heritage',
    name: 'Hà Nội Heritage Hotel',
    location: 'Hoàn Kiếm, Hà Nội',
    area: 'Hà Nội',
    image: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c',
    rating: 4.5,
    reviews: 1180,
    price: 1950000,
    oldPrice: 2500000,
    stars: 4,
    features: ['WiFi miễn phí', 'Nhà hàng', 'Đưa đón sân bay'],
  },
  {
    id: 'saigon-sky',
    name: 'Sài Gòn Sky Suites',
    location: 'Quận 1, TP. Hồ Chí Minh',
    area: 'TP. Hồ Chí Minh',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6',
    rating: 4.9,
    reviews: 2012,
    price: 3650000,
    oldPrice: 4550000,
    badge: 'Được yêu thích',
    stars: 5,
    features: ['WiFi miễn phí', 'Hồ bơi', 'Spa', 'Phòng gym'],
  },
  {
    id: 'hue-riverside',
    name: 'Huế Riverside Hotel',
    location: 'Bờ sông Hương, Huế',
    area: 'Huế',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
    rating: 4.0,
    reviews: 355,
    price: 980000,
    oldPrice: 1350000,
    stars: 3,
    features: ['WiFi miễn phí', 'Nhà hàng', 'Bữa sáng miễn phí'],
  },
];

type Hotel = (typeof hotels)[number];

const starOptions = [5, 4, 3];
const facilityOptions = ['WiFi miễn phí', 'Hồ bơi', 'Bữa sáng miễn phí', 'Phòng gym', 'Spa', 'Nhà hàng', 'Gần bãi biển', 'Đưa đón sân bay'];
const areaOptions = ['Phú Quốc', 'Nha Trang', 'Đà Nẵng', 'Hội An', 'Sa Pa', 'Hạ Long', 'Đà Lạt', 'Hà Nội', 'TP. Hồ Chí Minh', 'Huế'];
const hotelsPerPage = 5;

function formatVnd(value: number) {
  return `${value.toLocaleString('vi-VN')} đ`;
}

function hotelImageUrl(url: string) {
  if (url.includes('?')) return url;
  return `${url}?auto=format&fit=crop&w=800&q=80`;
}

function formatDateVi(date: Date) {
  return format(date, 'dd/MM/yyyy', { locale: vi });
}

function getBookingModeLabel(mode: BookingMode) {
  return bookingModeOptions.find((item) => item.value === mode)?.label ?? mode;
}

function getScoreLabel(rating: number) {
  if (rating >= 4.8) return 'Xuất sắc';
  if (rating >= 4.5) return 'Tuyệt vời';
  if (rating >= 4.0) return 'Rất tốt';
  return 'Tốt';
}

function getFeatureIcon(feature: string) {
  switch (feature) {
    case 'WiFi miễn phí':
      return <Wifi className="size-3.5" />;
    case 'Hồ bơi':
      return <Waves className="size-3.5" />;
    case 'Nhà hàng':
      return <Utensils className="size-3.5" />;
    case 'Spa':
      return <Sparkles className="size-3.5" />;
    case 'Gần bãi biển':
      return <Palmtree className="size-3.5" />;
    case 'Đưa đón sân bay':
      return <Plane className="size-3.5" />;
    case 'Phòng gym':
      return <Dumbbell className="size-3.5" />;
    case 'Bữa sáng miễn phí':
      return <Coffee className="size-3.5" />;
    default:
      return <Wifi className="size-3.5" />;
  }
}

export default function HotelPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [searchDestination, setSearchDestination] = useState('');
  const [bookingMode, setBookingMode] = useState<BookingMode>('daily');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 7, 15),
    to: new Date(2024, 7, 18),
  });
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('18:00');
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [maxPrice, setMaxPrice] = useState(100000000);
  const [sortMode, setSortMode] = useState<SortMode>('recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    setFavorites(getHotelFavorites().map((h) => h.id));
  }, []);
  const [notice, setNotice] = useState('');
  // Modal state for room selection
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(1);
  const [roomQuantity, setRoomQuantity] = useState<number>(1);
  const [svcSlide, setSvcSlide] = useState<number>(0);

  const hotelRooms = useMemo(() => {
    if (!selectedHotel) return [];
    return [
      {
        id: 'standard',
        name: 'Phòng Standard (Tiêu chuẩn)',
        badge: 'Bán chạy nhất',
        badgeColor: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900',
        area: '35 m²',
        bed: '1 Giường King',
        guests: '2 Người lớn',
        features: ['WiFi Miễn phí', 'Biểu hòa nhiệt độ', 'Bao gồm bữa sáng', 'Mini Nar'],
        price: 3500000,
        taxAndFee: 280000,
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'deluxe',
        name: 'Phòng Deluxe View Biển',
        badge: 'Lựa chọn phổ biến',
        badgeColor: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900',
        area: '52 m²',
        bed: '1 Giường King',
        guests: '2 Người lớn, 1 Trẻ em',
        features: ['WiFi Tốc độ cao', 'Ban công riêng', 'Buffet Sáng Cao Cấp', 'Bồn tắm nằm'],
        price: 5200000,
        taxAndFee: 720000,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'vip',
        name: 'VIP Club Peninsula Suite',
        badge: 'Đẳng cấp VIP',
        badgeColor: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
        area: '120 m²',
        bed: '1 Giường Super King',
        guests: 'Hồ bơi riêng',
        features: ['Quản gia riêng 24/7', 'Quyền lợi Lounge VIP', 'Đưa đón sân bay', 'Rượu vang chào mừng'],
        price: 12800000,
        taxAndFee: 3800000,
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'family',
        name: 'Phòng Family (2 Giường lớn)',
        badge: 'Dành cho gia đình',
        badgeColor: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900',
        area: '68 m²',
        bed: '2 Giường Queen',
        guests: '4 Người lớn',
        features: ['Khu vực tiếp khách', 'Đồ dùng trẻ em', 'Ăn sáng gia đình', 'Kết nối thiết bị giải trí'],
        price: 7800000,
        taxAndFee: 400000,
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80',
      }
    ];
  }, [selectedHotel]);

  const displayFromDate = useMemo(() => {
    return dateRange?.from || selectedDate || new Date();
  }, [dateRange, selectedDate]);

  const displayToDate = useMemo(() => {
    if (dateRange?.to) return dateRange.to;
    return new Date(displayFromDate.getTime() + 86400000 * 3); // Default to 3 nights as in mockup
  }, [dateRange, displayFromDate]);

  const computedNights = useMemo(() => {
    const diffTime = Math.abs(displayToDate.getTime() - displayFromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  }, [displayFromDate, displayToDate]);

  const openRoomModal = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setSelectedRoom(null);
    setShowRoomModal(false);
  };

  const closeRoomModal = () => {
    setShowRoomModal(false);
    setSelectedHotel(null);
    setSelectedRoom(null);
  };

  const filteredHotels = useMemo(() => {
    return hotels
      .filter((hotel) => {
        const matchesDestination = !searchDestination || hotel.area === searchDestination;
        const matchesStars = selectedStars.length === 0 || selectedStars.includes(hotel.stars);
        const matchesFacilities =
          selectedFacilities.length === 0 ||
          selectedFacilities.every((facility) => hotel.features.includes(facility));
        const matchesArea = !selectedArea || hotel.area === selectedArea;
        const matchesPrice = hotel.price <= maxPrice;

        return matchesDestination && matchesStars && matchesFacilities && matchesArea && matchesPrice;
      })
      .sort((first, second) => {
        if (sortMode === 'price') return first.price - second.price;
        if (sortMode === 'rating') return second.rating - first.rating;
        return second.reviews - first.reviews;
      });
  }, [searchDestination, maxPrice, selectedArea, selectedFacilities, selectedStars, sortMode]);

  const dateSummary = useMemo(() => {
    if (bookingMode === 'hourly') {
      if (!selectedDate) return 'Chưa chọn ngày';
      return `${formatDateVi(selectedDate)} · ${startTime} - ${endTime}`;
    }

    if (!dateRange?.from) {
      return bookingMode === 'overnight' ? 'Chưa chọn đêm nhận - trả phòng' : 'Chưa chọn ngày nhận - trả phòng';
    }

    if (!dateRange.to) return formatDateVi(dateRange.from);
    return `${formatDateVi(dateRange.from)} - ${formatDateVi(dateRange.to)}`;
  }, [bookingMode, dateRange, endTime, selectedDate, startTime]);

  const handleBookingModeChange = (mode: BookingMode) => {
    setBookingMode(mode);
    setSelectedDate(undefined);
    setDateRange(undefined);
    setStartTime('14:00');
    setEndTime('18:00');
  };

  const handleDestinationChange = (value: string) => {
    setSearchDestination(value);
    setSelectedArea(value);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / hotelsPerPage));
  const currentHotels = filteredHotels.slice((currentPage - 1) * hotelsPerPage, currentPage * hotelsPerPage);

  const toggleStar = (star: number) => {
    setCurrentPage(1);
    setSelectedStars((current) =>
      current.includes(star) ? current.filter((item) => item !== star) : [...current, star]
    );
  };

  const toggleFacility = (facility: string) => {
    setCurrentPage(1);
    setSelectedFacilities((current) =>
      current.includes(facility) ? current.filter((item) => item !== facility) : [...current, facility]
    );
  };

  const resetFilters = () => {
    setSearchDestination('');
    setBookingMode('daily');
    setSelectedDate(undefined);
    setDateRange(undefined);
    setStartTime('14:00');
    setEndTime('18:00');
    setSelectedStars([]);
    setSelectedFacilities([]);
    setSelectedArea('');
    setMaxPrice(100000000);
    setSortMode('recommended');
    setCurrentPage(1);
    setNotice('Đã xóa tất cả bộ lọc.');
  };

  const toggleFavorite = (hotel: Hotel) => {
    const nextFavorites = toggleHotelFavorite({
      id: hotel.id,
      name: hotel.name,
      location: hotel.location,
      price: hotel.price,
      image: hotel.image,
      rating: hotel.rating,
      reviews: hotel.reviews,
      stars: hotel.stars
    });
    setFavorites(nextFavorites.map((h) => h.id));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setDatePopoverOpen(false);
    setNotice(
      `Đang tìm khách sạn tại ${searchDestination || 'tất cả địa điểm'} · ${getBookingModeLabel(bookingMode)} · ${dateSummary}.`
    );
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 font-sans transition-colors duration-300 flex flex-col ${
      theme === 'dark' ? 'dark text-white' : 'text-slate-900'
    }`}>
      <Header />

      <main className="flex-1">
        {selectedHotel ? (
          <div className="w-full bg-[#f4efe6] dark:bg-slate-950 min-h-full py-8 text-slate-800 dark:text-slate-100">
            <div className="max-w-5xl mx-auto px-4">
              {/* Back Navigation & Hotel Header Details */}
              <div className="mb-6">
                <button
                  onClick={closeRoomModal}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-[#0b5cd5] hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-3 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  Quay lại danh sách khách sạn
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="flex">
                        {Array.from({ length: selectedHotel.stars }).map((_, index) => (
                          <Star key={index} className="size-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </span>
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        KHÁCH SẠN {selectedHotel.stars} SAO
                      </span>
                    </div>
                    <h1 className="text-xl md:text-3xl font-black text-[#1a1a1a] dark:text-white leading-tight">
                      Chọn phòng tại {selectedHotel.name}
                    </h1>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <MapPin className="size-3.5 text-blue-600 shrink-0" />
                      <span>{selectedHotel.location}, Việt Nam</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setNotice('Liên kết chia sẻ đã được sao chép vào bộ nhớ tạm.')}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                    >
                      <Share2 className="size-3.5 text-slate-500" />
                      Chia sẻ
                    </button>
                    <button
                      onClick={() => toggleFavorite(selectedHotel)}
                      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-black transition-colors shadow-sm cursor-pointer ${
                        favorites.includes(selectedHotel.id)
                          ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-950 dark:bg-red-950/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Heart className={`size-3.5 ${favorites.includes(selectedHotel.id) ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
                      {favorites.includes(selectedHotel.id) ? 'Đã lưu' : 'Lưu lại'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Room Selection Grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
                {/* Left Column: Room Cards */}
                <div className="space-y-4">
                  {hotelRooms.map((room) => {
                    const isSelected = selectedRoom?.id === room.id;
                    return (
                      <div
                        key={room.id}
                        className={`bg-white dark:bg-slate-900 rounded-xl overflow-hidden border transition-all shadow-sm ${
                          isSelected
                            ? 'border-blue-600 dark:border-blue-500 ring-1 ring-blue-600 dark:ring-blue-500'
                            : 'border-slate-200 dark:border-slate-850 hover:shadow-md'
                        }`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] md:items-stretch">
                          <div className="relative h-44 w-full md:h-auto overflow-hidden shrink-0">
                            <ImageWithFallback
                              src={room.image}
                              alt={room.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="flex flex-col p-4 text-left justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-4">
                                <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                                  {room.name}
                                </h3>
                                {room.badge && (
                                  <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-black shrink-0 ${room.badgeColor}`}>
                                    {room.badge}
                                  </span>
                                )}
                              </div>

                              {/* Room spec tags */}
                              <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Maximize2 className="size-3" />
                                  {room.area}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Bed className="size-3" />
                                  {room.bed}
                                </span>
                                <span className="flex items-center gap-1">
                                  {room.id === 'vip' ? <Waves className="size-3" /> : <Users className="size-3" />}
                                  {room.guests}
                                </span>
                              </div>

                              {/* Amenities list */}
                              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                                {room.features.map((feature, i) => (
                                  <span key={i} className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                                    <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Price and Action Button */}
                            <div className="mt-4 flex flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                              <div>
                                <p className="text-[10px] font-bold text-slate-400">Giá mỗi đêm từ</p>
                                <p className="text-lg font-black text-[#0b5cd5] dark:text-blue-400 leading-none mt-1">
                                  {room.price.toLocaleString('vi-VN')} <span className="underline underline-offset-1 decoration-[1.5px]">đ</span>
                                </p>
                                <p className="text-[9px] font-medium text-slate-400 mt-1">
                                  + {room.taxAndFee.toLocaleString('vi-VN')} <span className="underline underline-offset-1 decoration-[1px]">đ</span> thuế & phí
                                </p>
                              </div>

                              <button
                                onClick={() => setSelectedRoom(room)}
                                className={`rounded-lg px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#0b5cd5] text-white hover:bg-blue-700'
                                    : 'bg-[#0b5cd5] text-white hover:bg-blue-700'
                                }`}
                              >
                                {isSelected ? 'Đã chọn' : 'Chọn phòng'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Column: Sticky Booking Sidebar */}
                <div className="space-y-4 lg:sticky lg:top-4">
                  {/* Booking Summary Box */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                    <div className="bg-[#0b5cd5] text-center py-3 text-white">
                      <h3 className="text-sm font-black tracking-wide text-white uppercase">Tóm tắt đặt phòng</h3>
                    </div>

                    <div className="p-4 text-left space-y-3">
                      {/* Date Picker Section */}
                      <div className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 relative bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">NGÀY NHẬN PHÒNG</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5">
                            {format(displayFromDate, "dd 'Th'MM, yyyy")}
                          </span>
                        </div>
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="rounded-full p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer shadow-sm flex items-center justify-center">
                              <CalendarDays className="size-3.5 text-slate-500" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <div className="p-3">
                              <p className="mb-2 text-xs font-black text-slate-500">Thay đổi ngày lưu trú</p>
                              <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={1}
                                disabled={{ before: startOfToday() }}
                                locale={vi}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>

                        <div className="flex flex-col text-right border-l border-slate-200 dark:border-slate-800 pl-3">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">NGÀY TRẢ PHÒNG</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5">
                            {format(displayToDate, "dd 'Th'MM, yyyy")}
                          </span>
                        </div>
                      </div>

                      {/* Guest Counter Section */}
                      <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Số lượng phòng</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setRoomQuantity(Math.max(1, roomQuantity - 1))} className="size-5 rounded bg-slate-100 dark:bg-slate-800 font-bold">-</button>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 w-4 text-center">{roomQuantity}</span>
                          <button onClick={() => setRoomQuantity(roomQuantity + 1)} className="size-5 rounded bg-slate-100 dark:bg-slate-800 font-bold">+</button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Khách lưu trú</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                            {adults} Người lớn, {children} Trẻ em
                          </span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="text-[10px] font-black text-blue-600 underline ml-1 cursor-pointer">Sửa</button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-3">
                              <div className="space-y-2 text-xs">
                                <p className="font-bold text-slate-700 mb-2">Số lượng khách</p>
                                <div className="flex justify-between items-center">
                                  <span>Người lớn:</span>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="size-5 rounded bg-slate-100 font-bold">-</button>
                                    <span className="w-4 text-center font-bold">{adults}</span>
                                    <button onClick={() => setAdults(adults + 1)} className="size-5 rounded bg-slate-100 font-bold">+</button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <span>Trẻ em:</span>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="size-5 rounded bg-slate-100 font-bold">-</button>
                                    <span className="w-4 text-center font-bold">{children}</span>
                                    <button onClick={() => setChildren(children + 1)} className="size-5 rounded bg-slate-100 font-bold">+</button>
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Nights info */}
                      <div className="flex justify-between items-center py-1.5 text-xs border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 font-semibold">Số đêm</span>
                        <span className="font-black text-slate-800 dark:text-slate-100">{computedNights} đêm</span>
                      </div>

                      {/* Selected Room Details */}
                      <div className="p-3 bg-[#eef2ff] dark:bg-blue-950/20 rounded-lg">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Phòng đã chọn:</p>
                        <p className={`text-xs font-black mt-0.5 ${selectedRoom ? 'text-[#0b5cd5] dark:text-blue-400' : 'text-slate-400'}`}>
                          {selectedRoom ? selectedRoom.name : 'Vui lòng chọn phòng'}
                        </p>
                      </div>

                      {/* Total Price & Submit Booking */}
                      <div className="pt-1">
                        <div className="flex justify-between items-baseline mb-3">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">Tổng cộng</span>
                          <div className="text-right">
                            <span className="text-lg font-black text-[#0b5cd5] dark:text-blue-400 leading-none">
                              {((selectedRoom ? (selectedRoom.price + selectedRoom.taxAndFee) * computedNights * roomQuantity : 0)).toLocaleString('vi-VN')} <span className="underline underline-offset-1 decoration-[1.5px]">đ</span>
                            </span>
                            <p className="text-[9px] font-medium text-slate-400 mt-0.5">Đã bao gồm tất cả thuế phí</p>
                          </div>
                        </div>

                        <button
                          disabled={!selectedRoom}
                          onClick={() => {
                            if (!user) {
                              router.push('/login');
                              return;
                            }
                            setShowConfirmModal(true);
                          }}
                          className={`w-full py-2.5 rounded-lg text-xs font-black shadow-md transition-all cursor-pointer ${
                            selectedRoom
                              ? 'bg-[#0b5cd5] text-white hover:bg-blue-700'
                              : 'bg-[#85a8e6] text-white cursor-not-allowed opacity-100'
                          }`}
                        >
                          {user && selectedRoom ? 'Đặt phòng' : 'Tiếp tục đặt phòng'}
                        </button>
                        <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">Bạn sẽ không bị trừ tiền ngay lúc này</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Confirmation Dialog */}
                  <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận đặt phòng</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                          <div className="space-y-2 mt-2">
                            <p>Bạn có chắc chắn muốn đặt phòng <strong>{selectedRoom?.name}</strong> tại khách sạn <strong>{selectedHotel?.name}</strong> không?</p>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                              <p>Ngày nhận phòng: <strong>{format(displayFromDate, "dd/MM/yyyy")}</strong></p>
                              <p>Ngày trả phòng: <strong>{format(displayToDate, "dd/MM/yyyy")}</strong></p>
                              <p>Khách: <strong>{adults} Người lớn, {children} Trẻ em</strong></p>
                              <p>Số lượng phòng: <strong>{roomQuantity}</strong></p>
                              <p className="mt-2 text-[#0b5cd5] font-black text-base">Tổng cộng: {selectedRoom ? ((selectedRoom.price + selectedRoom.taxAndFee) * computedNights * roomQuantity).toLocaleString('vi-VN') : 0} đ</p>
                            </div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            setNotice(`Đặt phòng thành công! CMC Travel đang chuẩn bị đơn hàng cho ${roomQuantity} phòng ${selectedRoom?.name} tại ${selectedHotel?.name}.`);
                            setSelectedRoom(null);
                            setShowConfirmModal(false);
                          }}
                        >
                          Xác nhận đặt
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Support Line */}
                  <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm text-left">
                    <div className="size-9 rounded-full border border-[#0b5cd5]/20 flex items-center justify-center text-[#0b5cd5] shrink-0 bg-blue-50 dark:bg-blue-950">
                      <Headphones className="size-4.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Cần hỗ trợ?</p>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1">Gọi ngay: 1900 1234</p>
                    </div>
                  </div>
                      {/* Services Section */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider text-left">
                            Khám phá các dịch vụ khác
                          </h4>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setSvcSlide((prev) => Math.max(0, prev - 1))}
                              disabled={svcSlide === 0}
                              className="rounded-full p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm flex items-center justify-center"
                            >
                              <ChevronLeft className="size-3.5" />
                            </button>
                            <button
                              onClick={() => setSvcSlide((prev) => Math.min(otherServices.length - 1, prev + 1))}
                              disabled={svcSlide === otherServices.length - 1}
                              className="rounded-full p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm flex items-center justify-center"
                            >
                              <ChevronRight className="size-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="overflow-hidden w-full py-1">
                          <div
                            className="flex gap-3 transition-transform duration-300 ease-in-out"
                            style={{ transform: `translateX(-${svcSlide * 140}px)` }}
                          >
                            {otherServices.map((svc) => (
                              <div
                                key={svc.id}
                                className="min-w-[130px] w-[130px] bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-150 dark:border-slate-800 shadow-sm flex flex-col items-center text-center justify-between shrink-0"
                              >
                                <div className={`size-12 rounded-xl flex items-center justify-center ${svc.bgColor} mb-2`}>
                                  {svc.icon === 'sprout' && <Sprout className="size-6" />}
                                  {svc.icon === 'utensils' && <Utensils className="size-6" />}
                                  {svc.icon === 'mountain' && <Mountain className="size-6" />}
                                </div>
                                <div className="flex-1 flex flex-col justify-between w-full">
                                  <div>
                                    <h5 className="text-[11px] font-black text-slate-850 dark:text-slate-100 leading-tight line-clamp-1">
                                      {svc.name}
                                    </h5>
                                    <p className="text-[9px] text-slate-400 line-clamp-2 mt-1 leading-snug font-medium">
                                      {svc.desc}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setNotice(`Đang mở thông tin chi tiết dịch vụ ${svc.name}.`)}
                                    className="mt-2.5 w-full text-[9px] font-black text-white bg-[#e07a5f] hover:bg-[#c6654a] py-1.5 rounded-md transition-colors cursor-pointer"
                                  >
                                    Xem chi tiết
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
        ) : (
          <>
            <section className="bg-blue-700 dark:bg-blue-950 px-4 py-4">
              <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 rounded-lg p-3 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr_1.2fr_auto] gap-3">
                  <label className="flex flex-col gap-1 text-xs font-black text-slate-500 dark:text-slate-400">
                    Điểm đến
                    <span className="relative flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100">
                      <MapPin className="size-4 text-blue-600 shrink-0" />
                      <select
                        value={searchDestination}
                        onChange={(event) => handleDestinationChange(event.target.value)}
                        className="w-full appearance-none bg-transparent pr-6 outline-none font-bold cursor-pointer"
                      >
                        <option value="">Chọn địa điểm đặt phòng</option>
                        {areaOptions.map((area) => (
                          <option key={area} value={area}>
                            {area}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-slate-400" />
                    </span>
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-black text-slate-500 dark:text-slate-400">
                    Loại đặt phòng
                    <span className="relative flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100">
                      <Clock className="size-4 text-blue-600 shrink-0" />
                      <select
                        value={bookingMode}
                        onChange={(event) => handleBookingModeChange(event.target.value as BookingMode)}
                        className="w-full appearance-none bg-transparent pr-6 outline-none font-bold cursor-pointer"
                      >
                        {bookingModeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-slate-400" />
                    </span>
                  </label>

                  <label className="flex flex-col gap-1 text-xs font-black text-slate-500 dark:text-slate-400">
                    {bookingMode === 'hourly'
                      ? 'Ngày và khung giờ'
                      : bookingMode === 'overnight'
                        ? 'Đêm nhận - trả phòng'
                        : 'Ngày nhận - trả phòng'}
                    <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-2 text-left text-sm font-bold text-slate-800 dark:text-slate-100"
                        >
                          <CalendarDays className="size-4 text-blue-600 shrink-0" />
                          <span className="truncate">{dateSummary}</span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        {bookingMode === 'hourly' ? (
                          <div className="p-3">
                            <p className="mb-2 text-xs font-black text-slate-500">Chọn ngày trên lịch</p>
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              disabled={{ before: startOfToday() }}
                              locale={vi}
                            />
                            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                              <label className="flex flex-col gap-1 text-xs font-bold text-slate-500">
                                Giờ nhận phòng
                                <select
                                  value={startTime}
                                  onChange={(event) => setStartTime(event.target.value)}
                                  className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                >
                                  {hourlyTimeOptions.map((time) => (
                                    <option key={`start-${time}`} value={time}>
                                      {time}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="flex flex-col gap-1 text-xs font-bold text-slate-500">
                                Giờ trả phòng
                                <select
                                  value={endTime}
                                  onChange={(event) => setEndTime(event.target.value)}
                                  className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                >
                                  {hourlyTimeOptions.map((time) => (
                                    <option key={`end-${time}`} value={time}>
                                      {time}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3">
                            <p className="mb-2 text-xs font-black text-slate-500">
                              {bookingMode === 'overnight'
                                ? 'Chọn đêm nhận và trả phòng trên lịch'
                                : 'Chọn ngày nhận và trả phòng trên lịch'}
                            </p>
                            <Calendar
                              mode="range"
                              selected={dateRange}
                              onSelect={setDateRange}
                              numberOfMonths={1}
                              disabled={{ before: startOfToday() }}
                              locale={vi}
                            />
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </label>

                  <button
                    onClick={handleSearch}
                    className="md:self-end inline-flex items-center justify-center gap-2 rounded-md bg-orange-500 px-6 py-3 text-sm font-black text-white hover:bg-orange-600 transition-colors"
                  >
                    <Search className="size-4" />
                    Tìm kiếm
                  </button>
                </div>
              </div>
            </section>

            <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
              {notice && (
                <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                  {notice}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                <aside className="space-y-5">
                  <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-black text-blue-900 dark:text-blue-300">Bộ lọc</h2>
                      <button onClick={resetFilters} className="text-xs font-black text-blue-600 dark:text-blue-400">
                        Xóa tất cả
                      </button>
                    </div>

                    <div className="space-y-6 text-left">
                      <div>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 mb-3">
                          Khoảng giá mỗi đêm: {formatVnd(maxPrice)}
                        </p>
                        <input
                          type="range"
                          min={0}
                          max={100000000}
                          step={1000000}
                          value={maxPrice}
                          onChange={(event) => {
                            setCurrentPage(1);
                            setMaxPrice(Number(event.target.value));
                          }}
                          className="w-full accent-blue-600"
                        />
                        <div className="flex justify-between mt-2 text-xxs font-bold text-slate-400">
                          <span>0 đ</span>
                          <span>100.000.000 đ</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 mb-3">Hạng khách sạn</p>
                        <div className="space-y-2">
                          {starOptions.map((count) => (
                            <label key={count} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={selectedStars.includes(count)}
                                onChange={() => toggleStar(count)}
                                className="size-4 accent-blue-600"
                              />
                              <span className="flex">
                                {Array.from({ length: count }).map((_, index) => (
                                  <Star key={index} className="size-3.5 fill-amber-400 text-amber-400" />
                                ))}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 mb-3">Tiện nghi</p>
                        <div className="space-y-2">
                          {facilityOptions.map((item) => (
                            <label key={item} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={selectedFacilities.includes(item)}
                                onChange={() => toggleFacility(item)}
                                className="size-4 accent-blue-600"
                              />
                              {item}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 mb-3">Khu vực</p>
                        <div className="space-y-2">
                          {areaOptions.map((item) => (
                            <label key={item} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                              <input
                                type="radio"
                                name="area"
                                checked={selectedArea === item}
                                onChange={() => {
                                  setCurrentPage(1);
                                  setSelectedArea(item);
                                  setSearchDestination(item);
                                }}
                                className="size-4 accent-blue-600"
                              />
                              {item}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-blue-700 p-5 text-white shadow-lg">
                    <p className="text-xs font-black uppercase opacity-80">Ưu đãi độc quyền</p>
                    <h3 className="mt-2 text-2xl font-black leading-tight">Giảm tới 30% cho thành viên mới</h3>
                    <button
                      onClick={() => setNotice('Bạn đã đăng ký nhận ưu đãi thành viên mới.')}
                      className="mt-5 rounded-md bg-white px-4 py-2 text-xs font-black text-blue-700"
                    >
                      Tham gia ngay
                    </button>
                  </div>
                </aside>

                <div className="space-y-5">
                  <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                      Tìm thấy <span className="text-blue-600">{filteredHotels.length}</span> khách sạn{searchDestination ? ` tại ${searchDestination}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'recommended' as SortMode, label: 'Đề xuất' },
                        { id: 'price' as SortMode, label: 'Giá thấp nhất' },
                        { id: 'rating' as SortMode, label: 'Đánh giá cao nhất' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSortMode(item.id);
                            setCurrentPage(1);
                          }}
                          className={`rounded-md px-3 py-2 text-xs font-black transition-colors ${
                            sortMode === item.id
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                              : 'bg-slate-50 text-slate-500 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                      <button
                        onClick={resetFilters}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-3 py-2 text-xs font-black text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <SlidersHorizontal className="size-3.5" />
                        Xóa lọc
                      </button>
                    </div>
                  </div>

                  {currentHotels.length === 0 ? (
                    <div className="rounded-lg bg-white p-10 text-center font-black text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                      Không có khách sạn phù hợp với bộ lọc hiện tại.
                    </div>
                  ) : (
                    currentHotels.map((hotel) => (
                      <article
                        key={hotel.id}
                        className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-[minmax(260px,35%)_1fr] md:items-stretch">
                          <div className="relative h-56 w-full shrink-0 overflow-hidden md:h-full md:min-h-[220px]">
                            <ImageWithFallback
                              src={hotelImageUrl(hotel.image)}
                              alt={hotel.name}
                              className="h-full w-full object-cover"
                            />
                            {hotel.badge && (
                              <span className="absolute top-3 left-3 rounded-full bg-teal-600 px-3 py-1 text-[11px] font-black text-white shadow-sm">
                                {hotel.badge}
                              </span>
                            )}
                            <button
                              onClick={() => toggleFavorite(hotel.id)}
                              className={`absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-white shadow-md transition-colors ${
                                favorites.includes(hotel.id) ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                              }`}
                              aria-label="Yêu thích khách sạn"
                            >
                              <Heart className={`size-4 ${favorites.includes(hotel.id) ? 'fill-red-500' : ''}`} />
                            </button>
                          </div>

                          <div className="flex min-h-[220px] flex-col p-5 md:p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <h2 className="text-lg font-black leading-snug text-slate-900 dark:text-white md:text-xl">
                                  {hotel.name}
                                </h2>
                                <div className="mt-1.5 flex items-center gap-0.5">
                                  {Array.from({ length: hotel.stars }).map((_, index) => (
                                    <Star key={index} className="size-3.5 fill-amber-400 text-amber-400" />
                                  ))}
                                </div>
                              </div>

                              <div className="shrink-0 text-center">
                                <div className="inline-flex min-w-[40px] items-center justify-center rounded-md bg-blue-700 px-2 py-1 text-sm font-black leading-none text-white">
                                  {hotel.rating.toFixed(1)}
                                </div>
                                <p className="mt-1 text-[11px] font-black text-blue-700 dark:text-blue-300">{getScoreLabel(hotel.rating)}</p>
                                <p className="text-[9px] font-semibold leading-tight text-slate-400">
                                  {hotel.reviews.toLocaleString('vi-VN')} người đánh giá
                                </p>
                              </div>
                            </div>

                            <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                              <MapPin className="size-3.5 shrink-0 text-blue-600" />
                              <span>{hotel.location}</span>
                              <button
                                onClick={() => setNotice(`Đang mở bản đồ cho ${hotel.name}.`)}
                                className="font-bold text-blue-600 underline underline-offset-2 dark:text-blue-400"
                              >
                                Xem trên bản đồ
                              </button>
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              {hotel.features.map((feature) => (
                                <span
                                  key={feature}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-bold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                                >
                                  {getFeatureIcon(feature)}
                                  {feature}
                                </span>
                              ))}
                            </div>

                            <div className="mt-auto flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between">
                              <div>
                                <p className="text-xs font-semibold text-slate-400 line-through">{formatVnd(hotel.oldPrice)}</p>
                                <p className="mt-0.5 text-2xl font-black text-orange-600 dark:text-orange-500">
                                  {formatVnd(hotel.price)}
                                  <span className="ml-1 text-sm font-semibold text-slate-400">/ đêm</span>
                                </p>
                              </div>
                              <button
                                onClick={() => openRoomModal(hotel)}
                                className="shrink-0 rounded-lg bg-blue-700 px-8 py-3 text-sm font-black text-white hover:bg-blue-800 transition-colors"
                              >
                                Chọn phòng
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))
                  )}

                  <div className="flex items-center justify-center gap-2 pt-5">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-500 disabled:text-slate-300 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const page = index + 1;

                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`size-9 rounded-md text-sm font-black ${
                            page === currentPage ? 'bg-blue-700 text-white' : 'bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-300'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-500 disabled:text-slate-300 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

        <Footer />
        {showRoomModal && selectedHotel && (
          <RoomTypeModal
            open={showRoomModal}
            onClose={closeRoomModal}
            hotel={selectedHotel}
            onConfirm={(room) => {
              setNotice(`Bạn đã chọn ${room.label} cho ${selectedHotel.name}.`);
              closeRoomModal();
            }}
          />
        )}
      </div>
  );
}
