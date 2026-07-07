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
  { value: 'hourly', label: 'Theo gi?' },
  { value: 'overnight', label: 'Qua ?�m' },
  { value: 'daily', label: 'Theo ng�y' },
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
    location: 'B�i B?c, B�n ??o S?n Tr�, ?� N?ng',
    area: '?� N?ng',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
    rating: 4.8,
    reviews: 2345,
    price: 3500000,
    oldPrice: 4100000,
    badge: 'B�n ch?y nh?t',
    stars: 5,
    features: ['WiFi mi?n ph�', 'H? b?i', 'Nh� h�ng', 'Spa'],
  },
  {
    id: 'duong-dong',
    name: 'D??ng ?�ng Boutique Hotel',
    location: 'D??ng ?�ng, Ph� Qu?c',
    area: 'Ph� Qu?c',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
    rating: 4.5,
    reviews: 998,
    price: 1850000,
    oldPrice: 2300000,
    stars: 4,
    features: ['WiFi mi?n ph�', 'G?n b�i bi?n', '??a ?�n s�n bay'],
  },
  {
    id: 'imperial-garden',
    name: 'Imperial Garden & Spa',
    location: 'Tr?n H?ng ??o, Ph� Qu?c',
    area: 'Ph� Qu?c',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791',
    rating: 5.0,
    reviews: 812,
    price: 5100000,
    oldPrice: 6500000,
    badge: 'Gi?m 25%',
    stars: 5,
    features: ['Nh� h�ng', 'Spa', 'H? b?i', 'Ph�ng gym'],
  },
  {
    id: 'nha-trang-bay',
    name: 'Nha Trang Bay Resort',
    location: '???ng Tr?n Ph�, Nha Trang',
    area: 'Nha Trang',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    rating: 4.7,
    reviews: 1650,
    price: 2450000,
    oldPrice: 3100000,
    badge: '?u ?�i h�',
    stars: 5,
    features: ['WiFi mi?n ph�', 'H? b?i', 'Nh� h�ng', 'G?n b�i bi?n'],
  },
  {
    id: 'da-nang-ocean',
    name: '?� N?ng Ocean Hotel',
    location: 'M? Kh�, ?� N?ng',
    area: '?� N?ng',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
    rating: 4.6,
    reviews: 1320,
    price: 2100000,
    oldPrice: 2700000,
    stars: 4,
    features: ['WiFi mi?n ph�', 'G?n b�i bi?n', 'B?a s�ng mi?n ph�'],
  },
  {
    id: 'hoi-an-lantern',
    name: 'H?i An Lantern Villa',
    location: 'Ph? c? H?i An, Qu?ng Nam',
    area: 'H?i An',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592',
    rating: 4.4,
    reviews: 760,
    price: 1350000,
    oldPrice: 1800000,
    stars: 4,
    features: ['WiFi mi?n ph�', 'B?a s�ng mi?n ph�', '??a ?�n s�n bay'],
  },
  {
    id: 'sapa-mountain',
    name: 'Sa Pa Mountain Lodge',
    location: 'Trung t�m Sa Pa, L�o Cai',
    area: 'Sa Pa',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd',
    rating: 4.3,
    reviews: 524,
    price: 1650000,
    oldPrice: 2100000,
    stars: 4,
    features: ['WiFi mi?n ph�', 'B?a s�ng mi?n ph�', 'Nh� h�ng'],
  },
  {
    id: 'ha-long-pearl',
    name: 'H? Long Pearl Hotel',
    location: 'B�i Ch�y, H? Long',
    area: 'H? Long',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    rating: 4.2,
    reviews: 690,
    price: 1750000,
    oldPrice: 2200000,
    stars: 4,
    features: ['WiFi mi?n ph�', 'H? b?i', 'Nh� h�ng'],
  },
  {
    id: 'da-lat-pine',
    name: '?� L?t Pine Garden',
    location: 'H? Tuy?n L�m, ?� L?t',
    area: '?� L?t',
    image: 'https://images.unsplash.com/photo-1501117716987-c8e1ecb21098',
    rating: 4.1,
    reviews: 430,
    price: 1250000,
    oldPrice: 1650000,
    stars: 3,
    features: ['WiFi mi?n ph�', 'B?a s�ng mi?n ph�', 'Nh� h�ng'],
  },
  {
    id: 'hanoi-heritage',
    name: 'H� N?i Heritage Hotel',
    location: 'Ho�n Ki?m, H� N?i',
    area: 'H� N?i',
    image: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c',
    rating: 4.5,
    reviews: 1180,
    price: 1950000,
    oldPrice: 2500000,
    stars: 4,
    features: ['WiFi mi?n ph�', 'Nh� h�ng', '??a ?�n s�n bay'],
  },
  {
    id: 'saigon-sky',
    name: 'S�i G�n Sky Suites',
    location: 'Qu?n 1, TP. H? Ch� Minh',
    area: 'TP. H? Ch� Minh',
    image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6',
    rating: 4.9,
    reviews: 2012,
    price: 3650000,
    oldPrice: 4550000,
    badge: '???c y�u th�ch',
    stars: 5,
    features: ['WiFi mi?n ph�', 'H? b?i', 'Spa', 'Ph�ng gym'],
  },
  {
    id: 'hue-riverside',
    name: 'Hu? Riverside Hotel',
    location: 'B? s�ng H??ng, Hu?',
    area: 'Hu?',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
    rating: 4.0,
    reviews: 355,
    price: 980000,
    oldPrice: 1350000,
    stars: 3,
    features: ['WiFi mi?n ph�', 'Nh� h�ng', 'B?a s�ng mi?n ph�'],
  },
];

type Hotel = (typeof hotels)[number];

const starOptions = [5, 4, 3];
const facilityOptions = ['WiFi mi?n ph�', 'H? b?i', 'B?a s�ng mi?n ph�', 'Ph�ng gym', 'Spa', 'Nh� h�ng', 'G?n b�i bi?n', '??a ?�n s�n bay'];
const areaOptions = ['Ph� Qu?c', 'Nha Trang', '?� N?ng', 'H?i An', 'Sa Pa', 'H? Long', '?� L?t', 'H� N?i', 'TP. H? Ch� Minh', 'Hu?'];
const hotelsPerPage = 5;

function formatVnd(value: number) {
  return `${value.toLocaleString('vi-VN')} ?`;
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
  if (rating >= 4.8) return 'Xu?t s?c';
  if (rating >= 4.5) return 'Tuy?t v?i';
  if (rating >= 4.0) return 'R?t t?t';
  return 'T?t';
}

function getFeatureIcon(feature: string) {
  switch (feature) {
    case 'WiFi mi?n ph�':
      return <Wifi className="size-3.5" />;
    case 'H? b?i':
      return <Waves className="size-3.5" />;
    case 'Nh� h�ng':
      return <Utensils className="size-3.5" />;
    case 'Spa':
      return <Sparkles className="size-3.5" />;
    case 'G?n b�i bi?n':
      return <Palmtree className="size-3.5" />;
    case '??a ?�n s�n bay':
      return <Plane className="size-3.5" />;
    case 'Ph�ng gym':
      return <Dumbbell className="size-3.5" />;
    case 'B?a s�ng mi?n ph�':
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
        name: 'Ph�ng Standard (Ti�u chu?n)',
        badge: 'B�n ch?y nh?t',
        badgeColor: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900',
        area: '35 m�',
        bed: '1 Gi??ng King',
        guests: '2 Ng??i l?n',
        features: ['WiFi Mi?n ph�', 'Bi?u h�a nhi?t ??', 'Bao g?m b?a s�ng', 'Mini Nar'],
        price: 3500000,
        taxAndFee: 280000,
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'deluxe',
        name: 'Ph�ng Deluxe View Bi?n',
        badge: 'L?a ch?n ph? bi?n',
        badgeColor: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900',
        area: '52 m�',
        bed: '1 Gi??ng King',
        guests: '2 Ng??i l?n, 1 Tr? em',
        features: ['WiFi T?c ?? cao', 'Ban c�ng ri�ng', 'Buffet S�ng Cao C?p', 'B?n t?m n?m'],
        price: 5200000,
        taxAndFee: 720000,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'vip',
        name: 'VIP Club Peninsula Suite',
        badge: '??ng c?p VIP',
        badgeColor: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
        area: '120 m�',
        bed: '1 Gi??ng Super King',
        guests: 'H? b?i ri�ng',
        features: ['Qu?n gia ri�ng 24/7', 'Quy?n l?i Lounge VIP', '??a ?�n s�n bay', 'R??u vang ch�o m?ng'],
        price: 12800000,
        taxAndFee: 3800000,
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'family',
        name: 'Ph�ng Family (2 Gi??ng l?n)',
        badge: 'D�nh cho gia ?�nh',
        badgeColor: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900',
        area: '68 m�',
        bed: '2 Gi??ng Queen',
        guests: '4 Ng??i l?n',
        features: ['Khu v?c ti?p kh�ch', '?? d�ng tr? em', '?n s�ng gia ?�nh', 'K?t n?i thi?t b? gi?i tr�'],
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
      if (!selectedDate) return 'Ch?a ch?n ng�y';
      return `${formatDateVi(selectedDate)} � ${startTime} - ${endTime}`;
    }

    if (!dateRange?.from) {
      return bookingMode === 'overnight' ? 'Ch?a ch?n ?�m nh?n - tr? ph�ng' : 'Ch?a ch?n ng�y nh?n - tr? ph�ng';
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
    setNotice('?� x�a t?t c? b? l?c.');
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
      `?ang t�m kh�ch s?n t?i ${searchDestination || 't?t c? ??a ?i?m'} � ${getBookingModeLabel(bookingMode)} � ${dateSummary}.`
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
                  Quay l?i danh s�ch kh�ch s?n
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
                        KH�CH S?N {selectedHotel.stars} SAO
                      </span>
                    </div>
                    <h1 className="text-xl md:text-3xl font-black text-[#1a1a1a] dark:text-white leading-tight">
                      Ch?n ph�ng t?i {selectedHotel.name}
                    </h1>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <MapPin className="size-3.5 text-blue-600 shrink-0" />
                      <span>{selectedHotel.location}, Vi?t Nam</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setNotice('Li�n k?t chia s? ?� ???c sao ch�p v�o b? nh? t?m.')}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                    >
                      <Share2 className="size-3.5 text-slate-500" />
                      Chia s?
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
                      {favorites.includes(selectedHotel.id) ? '?� l?u' : 'L?u l?i'}
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
                                <p className="text-[10px] font-bold text-slate-400">Gi� m?i ?�m t?</p>
                                <p className="text-lg font-black text-[#0b5cd5] dark:text-blue-400 leading-none mt-1">
                                  {room.price.toLocaleString('vi-VN')} <span className="underline underline-offset-1 decoration-[1.5px]">?</span>
                                </p>
                                <p className="text-[9px] font-medium text-slate-400 mt-1">
                                  + {room.taxAndFee.toLocaleString('vi-VN')} <span className="underline underline-offset-1 decoration-[1px]">?</span> thu? & ph�
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
                                {isSelected ? '?� ch?n' : 'Ch?n ph�ng'}
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
                      <h3 className="text-sm font-black tracking-wide text-white uppercase">T�m t?t ??t ph�ng</h3>
                    </div>

                    <div className="p-4 text-left space-y-3">
                      {/* Date Picker Section */}
                      <div className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 relative bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">NG�Y NH?N PH�NG</span>
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
                              <p className="mb-2 text-xs font-black text-slate-500">Thay ??i ng�y l?u tr�</p>
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
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">NG�Y TR? PH�NG</span>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5">
                            {format(displayToDate, "dd 'Th'MM, yyyy")}
                          </span>
                        </div>
                      </div>

                      {/* Guest Counter Section */}
                      <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">S? l??ng ph�ng</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setRoomQuantity(Math.max(1, roomQuantity - 1))} className="size-5 rounded bg-slate-100 dark:bg-slate-800 font-bold">-</button>
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 w-4 text-center">{roomQuantity}</span>
                          <button onClick={() => setRoomQuantity(roomQuantity + 1)} className="size-5 rounded bg-slate-100 dark:bg-slate-800 font-bold">+</button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-500">Kh�ch l?u tr�</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                            {adults} Ng??i l?n, {children} Tr? em
                          </span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="text-[10px] font-black text-blue-600 underline ml-1 cursor-pointer">S?a</button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-3">
                              <div className="space-y-2 text-xs">
                                <p className="font-bold text-slate-700 mb-2">S? l??ng kh�ch</p>
                                <div className="flex justify-between items-center">
                                  <span>Ng??i l?n:</span>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="size-5 rounded bg-slate-100 font-bold">-</button>
                                    <span className="w-4 text-center font-bold">{adults}</span>
                                    <button onClick={() => setAdults(adults + 1)} className="size-5 rounded bg-slate-100 font-bold">+</button>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <span>Tr? em:</span>
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
                        <span className="text-slate-500 font-semibold">S? ?�m</span>
                        <span className="font-black text-slate-800 dark:text-slate-100">{computedNights} ?�m</span>
                      </div>

                      {/* Selected Room Details */}
                      <div className="p-3 bg-[#eef2ff] dark:bg-blue-950/20 rounded-lg">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Ph�ng ?� ch?n:</p>
                        <p className={`text-xs font-black mt-0.5 ${selectedRoom ? 'text-[#0b5cd5] dark:text-blue-400' : 'text-slate-400'}`}>
                          {selectedRoom ? selectedRoom.name : 'Vui l�ng ch?n ph�ng'}
                        </p>
                      </div>

                      {/* Total Price & Submit Booking */}
                      <div className="pt-1">
                        <div className="flex justify-between items-baseline mb-3">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-200">T?ng c?ng</span>
                          <div className="text-right">
                            <span className="text-lg font-black text-[#0b5cd5] dark:text-blue-400 leading-none">
                              {((selectedRoom ? (selectedRoom.price + selectedRoom.taxAndFee) * computedNights * roomQuantity : 0)).toLocaleString('vi-VN')} <span className="underline underline-offset-1 decoration-[1.5px]">?</span>
                            </span>
                            <p className="text-[9px] font-medium text-slate-400 mt-0.5">?� bao g?m t?t c? thu? ph�</p>
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
                          {user && selectedRoom ? '??t ph�ng' : 'Ti?p t?c ??t ph�ng'}
                        </button>
                        <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">B?n s? kh�ng b? tr? ti?n ngay l�c n�y</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Confirmation Dialog */}
                  <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>X�c nh?n ??t ph�ng</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                          <div className="space-y-2 mt-2">
                            <p>B?n c� ch?c ch?n mu?n ??t ph�ng <strong>{selectedRoom?.name}</strong> t?i kh�ch s?n <strong>{selectedHotel?.name}</strong> kh�ng?</p>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                              <p>Ng�y nh?n ph�ng: <strong>{format(displayFromDate, "dd/MM/yyyy")}</strong></p>
                              <p>Ng�y tr? ph�ng: <strong>{format(displayToDate, "dd/MM/yyyy")}</strong></p>
                              <p>Kh�ch: <strong>{adults} Ng??i l?n, {children} Tr? em</strong></p>
                              <p>S? l??ng ph�ng: <strong>{roomQuantity}</strong></p>
                              <p className="mt-2 text-[#0b5cd5] font-black text-base">T?ng c?ng: {selectedRoom ? ((selectedRoom.price + selectedRoom.taxAndFee) * computedNights * roomQuantity).toLocaleString('vi-VN') : 0} ?</p>
                            </div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>H?y</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            setNotice(`??t ph�ng th�nh c�ng! CMC Travel ?ang chu?n b? ??n h�ng cho ${roomQuantity} ph�ng ${selectedRoom?.name} t?i ${selectedHotel?.name}.`);
                            setSelectedRoom(null);
                            setShowConfirmModal(false);
                          }}
                        >
                          X�c nh?n ??t
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
                      <p className="text-[10px] font-black text-slate-400 uppercase leading-none">C?n h? tr??</p>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1">G?i ngay: 1900 1234</p>
                    </div>
                  </div>
                      {/* Services Section */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider text-left">
                            Kh�m ph� c�c d?ch v? kh�c
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
                                    onClick={() => setNotice(`?ang m? th�ng tin chi ti?t d?ch v? ${svc.name}.`)}
                                    className="mt-2.5 w-full text-[9px] font-black text-white bg-[#e07a5f] hover:bg-[#c6654a] py-1.5 rounded-md transition-colors cursor-pointer"
                                  >
                                    Xem chi ti?t
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
                    ?i?m ??n
                    <span className="relative flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100">
                      <MapPin className="size-4 text-blue-600 shrink-0" />
                      <select
                        value={searchDestination}
                        onChange={(event) => handleDestinationChange(event.target.value)}
                        className="w-full appearance-none bg-transparent pr-6 outline-none font-bold cursor-pointer"
                      >
                        <option value="">Ch?n ??a ?i?m ??t ph�ng</option>
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
                    Lo?i ??t ph�ng
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
                      ? 'Ng�y v� khung gi?'
                      : bookingMode === 'overnight'
                        ? '?�m nh?n - tr? ph�ng'
                        : 'Ng�y nh?n - tr? ph�ng'}
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
                            <p className="mb-2 text-xs font-black text-slate-500">Ch?n ng�y tr�n l?ch</p>
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              disabled={{ before: startOfToday() }}
                              locale={vi}
                            />
                            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                              <label className="flex flex-col gap-1 text-xs font-bold text-slate-500">
                                Gi? nh?n ph�ng
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
                                Gi? tr? ph�ng
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
                                ? 'Ch?n ?�m nh?n v� tr? ph�ng tr�n l?ch'
                                : 'Ch?n ng�y nh?n v� tr? ph�ng tr�n l?ch'}
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
                    T�m ki?m
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
                      <h2 className="text-xl font-black text-blue-900 dark:text-blue-300">B? l?c</h2>
                      <button onClick={resetFilters} className="text-xs font-black text-blue-600 dark:text-blue-400">
                        X�a t?t c?
                      </button>
                    </div>

                    <div className="space-y-6 text-left">
                      <div>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 mb-3">
                          Kho?ng gi� m?i ?�m: {formatVnd(maxPrice)}
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
                          <span>0 ?</span>
                          <span>100.000.000 ?</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 mb-3">H?ng kh�ch s?n</p>
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
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 mb-3">Ti?n nghi</p>
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
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 mb-3">Khu v?c</p>
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
                    <p className="text-xs font-black uppercase opacity-80">?u ?�i ??c quy?n</p>
                    <h3 className="mt-2 text-2xl font-black leading-tight">Gi?m t?i 30% cho th�nh vi�n m?i</h3>
                    <button
                      onClick={() => setNotice('B?n ?� ??ng k� nh?n ?u ?�i th�nh vi�n m?i.')}
                      className="mt-5 rounded-md bg-white px-4 py-2 text-xs font-black text-blue-700"
                    >
                      Tham gia ngay
                    </button>
                  </div>
                </aside>

                <div className="space-y-5">
                  <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                      T�m th?y <span className="text-blue-600">{filteredHotels.length}</span> kh�ch s?n{searchDestination ? ` t?i ${searchDestination}` : ''}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'recommended' as SortMode, label: '?? xu?t' },
                        { id: 'price' as SortMode, label: 'Gi� th?p nh?t' },
                        { id: 'rating' as SortMode, label: '?�nh gi� cao nh?t' },
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
                        X�a l?c
                      </button>
                    </div>
                  </div>

                  {currentHotels.length === 0 ? (
                    <div className="rounded-lg bg-white p-10 text-center font-black text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                      Kh�ng c� kh�ch s?n ph� h?p v?i b? l?c hi?n t?i.
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
                              onClick={() => toggleFavorite(hotel)}
                              className={`absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-white shadow-md transition-colors ${
                                favorites.includes(hotel.id) ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                              }`}
                              aria-label="Y�u th�ch kh�ch s?n"
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
                                  {hotel.reviews.toLocaleString('vi-VN')} ng??i ?�nh gi�
                                </p>
                              </div>
                            </div>

                            <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                              <MapPin className="size-3.5 shrink-0 text-blue-600" />
                              <span>{hotel.location}</span>
                              <button
                                onClick={() => setNotice(`?ang m? b?n ?? cho ${hotel.name}.`)}
                                className="font-bold text-blue-600 underline underline-offset-2 dark:text-blue-400"
                              >
                                Xem tr�n b?n ??
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
                                  <span className="ml-1 text-sm font-semibold text-slate-400">/ ?�m</span>
                                </p>
                              </div>
                              <button
                                onClick={() => openRoomModal(hotel)}
                                className="shrink-0 rounded-lg bg-blue-700 px-8 py-3 text-sm font-black text-white hover:bg-blue-800 transition-colors"
                              >
                                Ch?n ph�ng
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
              setNotice(`B?n ?� ch?n ${room.label} cho ${selectedHotel.name}.`);
              closeRoomModal();
            }}
          />
        )}
      </div>
  );
}
