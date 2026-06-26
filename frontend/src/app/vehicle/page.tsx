"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Armchair,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Car,
  ChevronDown,
  Clock,
  Coffee,
  Filter,
  Fuel,
  MapPin,
  Search,
  Settings,
  Shield,
  Users,
  Wifi,
  X,
  Zap,
} from 'lucide-react';

type RentalType = 'Xe tự lái' | 'Xe có tài xế' | 'Xe du lịch' | 'Xe limousine';
type SortMode = 'price' | 'seats' | 'name';
type FuelType = 'Xăng' | 'Điện' | 'Hybrid' | '';

type Vehicle = (typeof vehicles)[number];

const vehicles = [
  {
    id: 'toyota-camry',
    type: 'Xe có tài xế' as RentalType,
    provider: 'Toyota Camry 2024',
    brand: 'Toyota',
    seats: 5,
    fuel: 'Xăng' as FuelType,
    transmission: 'Tự động',
    from: 'Hà Nội',
    pricePerDay: 1200000,
    oldPricePerDay: 1500000,
    tag: 'Phổ biến nhất',
    amenities: ['Điều hòa', 'WiFi', 'GPS', 'Bảo hiểm'],
    imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c399b52c5?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    trips: 320,
  },
  {
    id: 'kia-morning',
    type: 'Xe tự lái' as RentalType,
    provider: 'Kia Morning 2023',
    brand: 'Kia',
    seats: 4,
    fuel: 'Xăng' as FuelType,
    transmission: 'Số sàn',
    from: 'Hà Nội',
    pricePerDay: 450000,
    tag: 'Tiết kiệm',
    amenities: ['Điều hòa', 'GPS', 'Bảo hiểm'],
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    trips: 180,
  },
  {
    id: 'vinfast-vf8',
    type: 'Xe tự lái' as RentalType,
    provider: 'VinFast VF8 2024',
    brand: 'VinFast',
    seats: 7,
    fuel: 'Điện' as FuelType,
    transmission: 'Tự động',
    from: 'Hồ Chí Minh',
    pricePerDay: 980000,
    oldPricePerDay: 1200000,
    tag: 'Xe điện',
    amenities: ['Điều hòa', 'WiFi', 'Sạc nhanh', 'GPS', 'Bảo hiểm'],
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    trips: 95,
  },
  {
    id: 'royal-limousine',
    type: 'Xe limousine' as RentalType,
    provider: 'Mercedes S500 Limousine',
    brand: 'Mercedes',
    seats: 4,
    fuel: 'Xăng' as FuelType,
    transmission: 'Tự động',
    from: 'Hà Nội',
    pricePerDay: 5500000,
    tag: 'VIP',
    amenities: ['Ghế massage', 'WiFi', 'Minibar', 'GPS', 'Bảo hiểm toàn diện'],
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    trips: 42,
  },
  {
    id: 'transit-van',
    type: 'Xe du lịch' as RentalType,
    provider: 'Ford Transit 16 chỗ',
    brand: 'Ford',
    seats: 16,
    fuel: 'Xăng' as FuelType,
    transmission: 'Tự động',
    from: 'Đà Nẵng',
    pricePerDay: 2800000,
    oldPricePerDay: 3200000,
    tag: 'Nhóm đông',
    amenities: ['Điều hòa', 'WiFi', 'Bảo hiểm', 'GPS'],
    imageUrl: 'https://images.unsplash.com/photo-1610403758362-e1d965e12ec6?auto=format&fit=crop&w=800&q=80',
    rating: 4.6,
    trips: 210,
  },
  {
    id: 'mazda-cx5',
    type: 'Xe tự lái' as RentalType,
    provider: 'Mazda CX-5 2024',
    brand: 'Mazda',
    seats: 5,
    fuel: 'Xăng' as FuelType,
    transmission: 'Tự động',
    from: 'Hồ Chí Minh',
    pricePerDay: 1100000,
    tag: 'SUV cao cấp',
    amenities: ['Điều hòa', 'WiFi', 'GPS', 'Camera 360', 'Bảo hiểm'],
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    trips: 156,
  },
];

const rentalTypes: RentalType[] = ['Xe tự lái', 'Xe có tài xế', 'Xe du lịch', 'Xe limousine'];
const fuelTypes: FuelType[] = ['Xăng', 'Điện', 'Hybrid'];

const timeOptions = Array.from({ length: 48 }).map((_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = (i % 2 === 0) ? '00' : '30';
  return `${hour}:${minute}`;
});
const durationOptions = ['Nửa ngày', '1 ngày', '2 ngày', '3 ngày', '4 ngày', '5 ngày', '6 ngày', '1 tuần', '2 tuần'];

const POPULAR_LOCATIONS = [
  'Hà Nội',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Nha Trang',
  'Đà Lạt',
  'Vũng Tàu',
  'Phú Quốc',
  'Huế',
  'Sân bay Nội Bài',
  'Sân bay Tân Sơn Nhất',
  'Sân bay Đà Nẵng',
];

function formatVnd(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function getAmenityIcon(amenity: string) {
  if (amenity.includes('WiFi')) return Wifi;
  if (amenity.includes('Bảo hiểm')) return Shield;
  if (amenity.includes('Sạc') || amenity.includes('điện') || amenity.includes('Điện')) return Zap;
  if (amenity.includes('Ghế') || amenity.includes('massage')) return Armchair;
  if (amenity.includes('GPS')) return MapPin;
  if (amenity.includes('Minibar') || amenity.includes('Nước')) return Coffee;
  if (amenity.includes('Camera') || amenity.includes('Hành lý')) return Briefcase;
  return BadgeCheck;
}

export default function VehiclePage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { addToCart } = useCart();
  const [location, setLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnTime, setReturnTime] = useState('09:00');
  const [rentalMode, setRentalMode] = useState<'Tự lái' | 'Có tài xế'>('Tự lái');
  const [rentalDuration, setRentalDuration] = useState('1 ngày');
  const [passengers, setPassengers] = useState('2 người');
  const [selectedTypes, setSelectedTypes] = useState<RentalType[]>([]);
  const [selectedFuel, setSelectedFuel] = useState<FuelType>('');
  const [maxPrice, setMaxPrice] = useState(6000000);
  const [sortMode, setSortMode] = useState<SortMode>('price');
  const [notice, setNotice] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSearched, setIsSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const locationSuggestions = useMemo(() => {
    if (!location.trim()) return POPULAR_LOCATIONS.slice(0, 6);
    const lowerVal = location.toLowerCase();
    return POPULAR_LOCATIONS.filter(loc => loc.toLowerCase().includes(lowerVal));
  }, [location]);

  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        const locationText = location.trim().toLowerCase();
        const matchesLocation = !locationText || v.from.toLowerCase().includes(locationText);
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(v.type);
        const matchesFuel = !selectedFuel || v.fuel === selectedFuel;
        const matchesPrice = v.pricePerDay <= maxPrice;
        return matchesLocation && matchesType && matchesFuel && matchesPrice;
      })
      .sort((a, b) => {
        if (sortMode === 'seats') return b.seats - a.seats;
        if (sortMode === 'name') return a.provider.localeCompare(b.provider);
        return a.pricePerDay - b.pricePerDay;
      });
  }, [location, selectedTypes, selectedFuel, maxPrice, sortMode]);

  const toggleType = (type: RentalType) => {
    setSelectedTypes((cur) =>
      cur.includes(type) ? cur.filter((t) => t !== type) : [...cur, type]
    );
  };

  const handleSearch = () => {
    setIsSearched(true);
    if (rentalMode === 'Tự lái') {
      setNotice(
        `Đang tìm xe tự lái tại ${location || 'mọi địa điểm'}, từ ${pickupTime} ${pickupDate || 'hôm nay'} đến ${returnTime} ${returnDate || 'sau'}.`
      );
    } else {
      setNotice(
        `Đang tìm xe có tài xế tại ${location || 'mọi địa điểm'}, đón lúc ${pickupTime} ${pickupDate || 'hôm nay'} trong ${rentalDuration}.`
      );
    }
  };

  const selectVehicle = (v: Vehicle) => {
    setSelectedVehicle(v);
    setNotice(`Đã chọn ${v.provider} – ${formatVnd(v.pricePerDay)}/ngày.`);
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedFuel('');
    setMaxPrice(6000000);
    setSortMode('price');
    setNotice('Đã đặt lại bộ lọc.');
  };

  return (
    <div
      className={`min-h-screen bg-slate-100 dark:bg-slate-950 font-sans transition-colors duration-300 flex flex-col ${
        theme === 'dark' ? 'dark text-white' : 'text-slate-900'
      }`}
    >
      <Header />

      <main className="flex-1">
        {/* ── Hero / Search ── */}
        <section className="relative px-4 py-16 sm:py-24 overflow-hidden">
          {/* Background Image & Overlay */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1920&q=80" 
              alt="Car rental background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/95 dark:from-slate-950/90 dark:via-slate-950/80 dark:to-slate-950/95" />
          </div>

          <div className="max-w-6xl mx-auto relative z-10 text-center sm:text-left">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-widest mb-6 border border-white/20">
              <Car className="size-3.5" /> Cho Thuê Phương Tiện
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
              Trải nghiệm hành trình <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">đẳng cấp</span>
            </h1>
            <p className="text-white/80 font-medium text-lg mb-10 max-w-2xl drop-shadow-md">
              Hàng trăm dòng xe cao cấp sẵn sàng phục vụ. Tự lái để khám phá hoặc chọn xe có tài xế để tận hưởng sự thư giãn tuyệt đối.
            </p>

            <div className="rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] text-slate-800 dark:text-slate-100 border border-white/20 dark:border-slate-700/50">
              {/* Row 1: Radio buttons */}
              <div className="flex items-center gap-6 mb-5">
                <span className="font-bold">Cho thuê xe</span>
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="rentalMode"
                    value="Tự lái"
                    checked={rentalMode === 'Tự lái'}
                    onChange={() => setRentalMode('Tự lái')}
                    className="size-5 accent-blue-600"
                  />
                  Tự lái
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-500 dark:text-slate-400">
                  <input
                    type="radio"
                    name="rentalMode"
                    value="Có tài xế"
                    checked={rentalMode === 'Có tài xế'}
                    onChange={() => setRentalMode('Có tài xế')}
                    className="size-5 accent-blue-600"
                  />
                  Có tài xế
                </label>
              </div>

              {/* Row 2: Location */}
              <div className="mb-5 relative">
                <label className="block text-sm font-bold mb-2">Địa điểm thuê xe của bạn</label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white/50 dark:bg-slate-900/50">
                  <MapPin className="size-5 text-slate-500" />
                  <input
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Điền thành phố, sân bay, hoặc khách sạn"
                    className="w-full bg-transparent outline-none text-sm font-medium"
                  />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
                    {locationSuggestions.map((loc) => (
                      <div
                        key={loc}
                        onClick={() => {
                          setLocation(loc);
                          setShowSuggestions(false);
                        }}
                        className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <MapPin className="size-4 text-slate-400" />
                        {loc}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 3: Dates, Times, Button */}
              {rentalMode === 'Tự lái' ? (
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Ngày bắt đầu</label>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                      <CalendarDays className="size-5 text-slate-500" />
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Giờ bắt đầu</label>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                      <Clock className="size-5 text-slate-500" />
                      <select
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm font-medium cursor-pointer"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time} className="text-slate-900 dark:text-slate-900">
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Ngày kết thúc</label>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                      <CalendarDays className="size-5 text-slate-500" />
                      <input
                        type="date"
                        min={pickupDate || new Date().toISOString().split('T')[0]}
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Giờ kết thúc</label>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                      <Clock className="size-5 text-slate-500" />
                      <select
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm font-medium cursor-pointer"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time} className="text-slate-900 dark:text-slate-900">
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleSearch}
                      className="w-full md:w-[140px] h-[46px] inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 shadow-lg shadow-blue-500/30 px-6 py-2 text-sm font-black text-white transition-all hover:scale-105 active:scale-95"
                    >
                      <Search className="size-5" />
                      Tìm xe
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Ngày bắt đầu</label>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                      <CalendarDays className="size-5 text-slate-500" />
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Thời gian thuê</label>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                      <Clock className="size-5 text-slate-500" />
                      <select
                        value={rentalDuration}
                        onChange={(e) => setRentalDuration(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm font-medium cursor-pointer"
                      >
                        {durationOptions.map(dur => (
                          <option key={dur} value={dur} className="text-slate-900 dark:text-slate-900">
                            {dur}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Giờ đón</label>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                      <Clock className="size-5 text-slate-500" />
                      <select
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full bg-transparent outline-none text-sm font-medium cursor-pointer"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time} className="text-slate-900 dark:text-slate-900">
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleSearch}
                      className="w-full md:w-[140px] h-[46px] inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 shadow-lg shadow-blue-500/30 px-6 py-2 text-sm font-black text-white transition-all hover:scale-105 active:scale-95"
                    >
                      <Search className="size-5" />
                      Tìm xe
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Content ── */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          {/* Notice */}
          {notice && (
            <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
              {notice}
            </div>
          )}

          {/* Selected vehicle panel */}
          {selectedVehicle && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-white p-5 shadow-md dark:border-blue-900 dark:bg-slate-900">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-300">Xe đang chọn</p>
                      <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                        {selectedVehicle.provider}
                      </h2>
                    </div>
                    <button
                      onClick={() => setSelectedVehicle(null)}
                      className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 lg:hidden"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm font-bold text-slate-600 dark:text-slate-300 sm:grid-cols-3">
                    <span>Loại: {selectedVehicle.type}</span>
                    <span>Số chỗ: {selectedVehicle.seats} người</span>
                    <span>Nhận xe: {pickupDate || 'Chưa chọn'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                  <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
                    {formatVnd(selectedVehicle.pricePerDay)}<span className="text-sm font-bold text-slate-400">/ngày</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!pickupDate) {
                          alert('Vui lòng chọn ngày nhận xe');
                          return;
                        }
                        addToCart({
                          tourId: selectedVehicle.id,
                          title: selectedVehicle.provider,
                          image: selectedVehicle.imageUrl,
                          price: selectedVehicle.pricePerDay,
                          quantity: 1,
                          date: pickupDate,
                          guests: selectedVehicle.seats,
                        });
                        router.push('/checkout');
                      }}
                      className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-black text-white hover:bg-blue-800"
                    >
                      Đặt xe ngay
                    </button>
                    <button
                      onClick={() => setSelectedVehicle(null)}
                      className="hidden rounded-lg border border-slate-200 px-4 py-3 text-sm font-black text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 lg:inline-flex"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isSearched && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Hiển thị <span className="font-black text-slate-900 dark:text-white">{filteredVehicles.length}</span> xe phù hợp
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-500">Sắp xếp:</span>
                  <button
                    onClick={() => setSortMode(sortMode === 'price' ? 'seats' : sortMode === 'seats' ? 'name' : 'price')}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-black text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
                  >
                    {sortMode === 'price' && 'Giá thấp nhất'}
                    {sortMode === 'seats' && 'Chỗ ngồi nhiều'}
                    {sortMode === 'name' && 'Tên A-Z'}
                    <ChevronDown className="size-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {filteredVehicles.length === 0 ? (
                  <div className="rounded-xl bg-white p-10 text-center font-black text-slate-500 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                    Không có xe phù hợp với bộ lọc hiện tại.
                  </div>
                ) : (
                  filteredVehicles.map((vehicle) => (
                    <article
                      key={vehicle.id}
                      className={`rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900 ${
                        selectedVehicle?.id === vehicle.id
                          ? 'border-blue-500 ring-2 ring-blue-100 dark:border-blue-400 dark:ring-blue-950'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-5 mb-5">
                            {/* Image */}
                            <div className="h-48 w-full sm:h-32 sm:w-48 rounded-xl overflow-hidden relative shrink-0 shadow-md">
                              <img src={vehicle.imageUrl} alt={vehicle.provider} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                              <div className="absolute top-2 left-2 flex gap-1">
                                <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black shadow-sm flex items-center gap-1 text-amber-500">
                                  ⭐ {vehicle.rating}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className="font-black text-slate-900 dark:text-white text-xl sm:text-2xl">{vehicle.provider}</h3>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{vehicle.type}</span>
                                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{vehicle.seats} chỗ</span>
                                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{vehicle.transmission}</span>
                                <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${vehicle.fuel === 'Điện' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'}`}>
                                  {vehicle.fuel}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stats row */}
                          <div className="flex items-center gap-4 mb-5 text-xs font-bold text-slate-500">
                            <span>⭐ {vehicle.rating}</span>
                            <span>🚗 {vehicle.trips} chuyến</span>
                            <span>📍 {vehicle.from}</span>
                          </div>

                          {/* Amenities */}
                          <div className="flex flex-wrap gap-2">
                            {vehicle.amenities.map((amenity) => {
                              const AmenityIcon = getAmenityIcon(amenity);
                              return (
                                <span
                                  key={amenity}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-sm transition-all hover:scale-105 cursor-default"
                                >
                                  <AmenityIcon className="size-3.5" />
                                  {amenity}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right: price + action */}
                        <div className="flex flex-col items-end justify-between border-slate-200 md:border-l md:pl-6 dark:border-slate-800">
                          <div className="text-right">
                            {vehicle.oldPricePerDay && (
                              <p className="text-xs font-bold text-slate-400 line-through">{formatVnd(vehicle.oldPricePerDay)}/ngày</p>
                            )}
                            <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
                              {formatVnd(vehicle.pricePerDay)}
                            </p>
                            <p className="text-xs font-bold text-slate-400">/ ngày</p>
                          </div>

                          <button
                            onClick={() => selectVehicle(vehicle)}
                            className={`mt-5 rounded-lg px-8 py-3 text-sm font-black text-white shadow-md transition-colors ${
                              selectedVehicle?.id === vehicle.id
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-blue-700 hover:bg-blue-800'
                            }`}
                          >
                            {selectedVehicle?.id === vehicle.id ? 'Đã chọn' : 'Đặt xe'}
                          </button>

                          <span className="mt-4 rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-slate-700 dark:bg-blue-950 dark:text-blue-200">
                            {vehicle.tag}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))
                )}

                {/* Promo banner */}
                <div className="rounded-xl bg-gradient-to-r from-blue-900 to-blue-950 p-8 text-white shadow-lg">
                  <div className="max-w-xl">
                    <h2 className="text-2xl font-black">Thẻ thành viên Drive Elite</h2>
                    <p className="mt-3 text-sm font-medium text-slate-200">
                      Đăng ký ngay để nhận ưu đãi hoàn tiền 10% và bảo hiểm mở rộng miễn phí cho mọi chuyến thuê xe.
                    </p>
                    <button
                      onClick={() => setNotice('Bạn đã đăng ký nhận thông tin thẻ Drive Elite.')}
                      className="mt-5 rounded-lg bg-white px-5 py-2.5 text-sm font-black text-blue-900"
                    >
                      Nhận ưu đãi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
        {/* ── Additional Info Section ── */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Đối tác */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="size-6 text-blue-700 dark:text-blue-400" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Đối tác uy tín</h3>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">
                Chúng tôi hợp tác với các đơn vị cho thuê xe hàng đầu để mang lại dịch vụ tốt nhất.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Avis', 'Hertz', 'Thrifty', 'Mai Linh', 'Vinasun', 'Enterprise'].map(partner => (
                  <span key={partner} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300">
                    {partner}
                  </span>
                ))}
              </div>
            </div>

            {/* Thông tin thuê */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Users className="size-6 text-blue-700 dark:text-blue-400" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Hình thức thuê</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Thuê tự lái</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Trải nghiệm tự do khám phá với đa dạng dòng xe. Yêu cầu bằng lái xe hợp lệ và đặt cọc.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Thuê có tài xế</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Tận hưởng chuyến đi thư giãn với đội ngũ tài xế chuyên nghiệp, thông thạo đường xá.</p>
                </div>
              </div>
            </div>

            {/* Điều khoản */}
            {/* Điều khoản */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Shield className="size-6 text-blue-700 dark:text-blue-400" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Điều khoản & Quy định</h3>
              </div>
              <div className="space-y-4">
                {/* Tự lái */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm uppercase tracking-wide">Đối với Xe tự lái</h4>
                  <ul className="space-y-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="size-4 mt-0.5 text-emerald-500 shrink-0" />
                      <span>Tuổi tối thiểu là 21 tuổi.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="size-4 mt-0.5 text-emerald-500 shrink-0" />
                      <span>Cần CCCD/CMND và Giấy phép lái xe bản gốc.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="size-4 mt-0.5 text-emerald-500 shrink-0" />
                      <span>Đặt cọc tối thiểu 15 triệu VNĐ hoặc xe máy có giá trị tương đương.</span>
                    </li>
                  </ul>
                </div>

                {/* Có tài xế */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2 text-sm uppercase tracking-wide">Đối với Xe có tài xế</h4>
                  <ul className="space-y-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="size-4 mt-0.5 text-emerald-500 shrink-0" />
                      <span>Giá thuê đã bao gồm lương tài xế và nhiên liệu.</span>
                    </li>
                    <li className="flex items-start gap v-2">
                      <BadgeCheck className="size-4 mt-0.5 text-emerald-500 shrink-0" />
                      <span>Chưa bao gồm chi phí cầu đường, bến bãi, VAT.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="size-4 mt-0.5 text-emerald-500 shrink-0" />
                      <span>Phụ thu ngoài giờ hoặc lưu đêm (tùy loại xe).</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
