"use client";

import { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useTheme } from '@/contexts/ThemeContext';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  Users,
  Wifi,
} from 'lucide-react';

type SortMode = 'recommended' | 'price' | 'rating';

const hotels = [
  {
    id: 'ocean-view',
    name: 'Ocean View Premium Resort',
    location: 'Bãi Dài, Phú Quốc',
    area: 'Phú Quốc',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
    rating: 4.8,
    reviews: 2345,
    price: 3200000,
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

const starOptions = [5, 4, 3];
const facilityOptions = ['WiFi miễn phí', 'Hồ bơi', 'Bữa sáng miễn phí', 'Phòng gym', 'Spa', 'Nhà hàng', 'Gần bãi biển', 'Đưa đón sân bay'];
const areaOptions = ['Phú Quốc', 'Nha Trang', 'Đà Nẵng', 'Hội An', 'Sa Pa', 'Hạ Long', 'Đà Lạt', 'Hà Nội', 'TP. Hồ Chí Minh', 'Huế'];
const hotelsPerPage = 5;

function formatVnd(value: number) {
  return `${value.toLocaleString('vi-VN')} đ`;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function getScoreLabel(rating: number) {
  if (rating >= 4.8) return 'Xuất sắc';
  if (rating >= 4.5) return 'Tuyệt vời';
  if (rating >= 4.0) return 'Rất tốt';
  return 'Tốt';
}

export default function HotelPage() {
  const { theme } = useTheme();
  const [destination, setDestination] = useState('');
  const [dateRange, setDateRange] = useState('15 Th05 - 20 Th05');
  const [guestInfo, setGuestInfo] = useState('2 người lớn, 1 phòng');
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [maxPrice, setMaxPrice] = useState(6500000);
  const [sortMode, setSortMode] = useState<SortMode>('recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notice, setNotice] = useState('');

  const filteredHotels = useMemo(() => {
    const keyword = normalizeText(destination.trim());

    return hotels
      .filter((hotel) => {
        const searchableText = normalizeText(`${hotel.name} ${hotel.location} ${hotel.area}`);
        const matchesDestination = !keyword || searchableText.includes(keyword);
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
  }, [destination, maxPrice, selectedArea, selectedFacilities, selectedStars, sortMode]);

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
    setDestination('');
    setSelectedStars([]);
    setSelectedFacilities([]);
    setSelectedArea('');
    setMaxPrice(6500000);
    setSortMode('recommended');
    setCurrentPage(1);
    setNotice('Đã xóa tất cả bộ lọc.');
  };

  const toggleFavorite = (hotelId: string) => {
    setFavorites((current) =>
      current.includes(hotelId) ? current.filter((item) => item !== hotelId) : [...current, hotelId]
    );
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setNotice(`Đang tìm khách sạn cho ${destination || 'tất cả điểm đến'} - ${dateRange} - ${guestInfo}.`);
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
        <section className="bg-blue-700 dark:bg-blue-950 px-4 py-4">
          <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 rounded-lg p-3 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr_auto] gap-3">
              <label className="flex flex-col gap-1 text-xs font-black text-slate-500 dark:text-slate-400">
                Điểm đến
                <span className="flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100">
                  <MapPin className="size-4 text-blue-600 shrink-0" />
                  <input
                    value={destination}
                    onChange={(event) => {
                      setDestination(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Nhập thành phố, khu vực hoặc tên khách sạn"
                    className="w-full bg-transparent outline-none font-bold"
                  />
                </span>
              </label>
              <label className="flex flex-col gap-1 text-xs font-black text-slate-500 dark:text-slate-400">
                Ngày nhận - trả phòng
                <span className="flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100">
                  <CalendarDays className="size-4 text-blue-600 shrink-0" />
                  <input
                    value={dateRange}
                    onChange={(event) => setDateRange(event.target.value)}
                    className="w-full bg-transparent outline-none font-bold"
                  />
                </span>
              </label>
              <label className="flex flex-col gap-1 text-xs font-black text-slate-500 dark:text-slate-400">
                Khách & phòng
                <span className="flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100">
                  <Users className="size-4 text-blue-600 shrink-0" />
                  <input
                    value={guestInfo}
                    onChange={(event) => setGuestInfo(event.target.value)}
                    className="w-full bg-transparent outline-none font-bold"
                  />
                </span>
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
                      min={900000}
                      max={6500000}
                      step={250000}
                      value={maxPrice}
                      onChange={(event) => {
                        setCurrentPage(1);
                        setMaxPrice(Number(event.target.value));
                      }}
                      className="w-full accent-blue-600"
                    />
                    <div className="flex justify-between mt-2 text-xxs font-bold text-slate-400">
                      <span>900.000 đ</span>
                      <span>6.500.000 đ</span>
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
                  Tìm thấy <span className="text-blue-600">{filteredHotels.length}</span> khách sạn{destination ? ` phù hợp với "${destination}"` : ''}
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
                    className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
                      <div className="relative min-h-64 md:min-h-full">
                        <ImageWithFallback src={hotel.image} alt={hotel.name} className="absolute inset-0 h-full w-full object-cover" />
                        <button
                          onClick={() => toggleFavorite(hotel.id)}
                          className={`absolute top-3 right-3 rounded-full bg-white/90 p-2 transition-colors ${
                            favorites.includes(hotel.id) ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
                          }`}
                          aria-label="Yêu thích khách sạn"
                        >
                          <Heart className={`size-4 ${favorites.includes(hotel.id) ? 'fill-red-500' : ''}`} />
                        </button>
                        {hotel.badge && (
                          <span className="absolute top-3 left-3 rounded-full bg-teal-600 px-3 py-1 text-xxs font-black text-white">
                            {hotel.badge}
                          </span>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">{hotel.name}</h2>
                            <div className="mt-1 flex items-center gap-1">
                              {Array.from({ length: hotel.stars }).map((_, index) => (
                                <Star key={index} className="size-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                              <MapPin className="size-3.5 text-blue-600" />
                              {hotel.location}
                              <button
                                onClick={() => setNotice(`Đang mở bản đồ cho ${hotel.name}.`)}
                                className="text-blue-600 dark:text-blue-400"
                              >
                                Xem trên bản đồ
                              </button>
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="ml-auto rounded-md bg-blue-700 px-3 py-2 text-lg font-black text-white">
                              {hotel.rating.toFixed(1)}
                            </div>
                            <p className="mt-1 text-xs font-black text-blue-700 dark:text-blue-300">{getScoreLabel(hotel.rating)}</p>
                            <p className="text-xxs font-bold text-slate-400">{hotel.reviews.toLocaleString('vi-VN')} người đánh giá</p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-3">
                          {hotel.features.map((feature) => (
                            <span key={feature} className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                              <Wifi className="size-3.5 text-blue-600" />
                              {feature}
                            </span>
                          ))}
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold text-slate-400 line-through">{formatVnd(hotel.oldPrice)}</p>
                            <p className="text-xl font-black text-orange-500">{formatVnd(hotel.price)} <span className="text-xs text-slate-400">/ đêm</span></p>
                          </div>
                          <button
                            onClick={() => setNotice(`Bạn đã chọn đặt phòng tại ${hotel.name}.`)}
                            className="rounded-md bg-blue-700 px-7 py-3 text-sm font-black text-white hover:bg-blue-800 transition-colors"
                          >
                            Đặt phòng
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
      </main>

      <Footer />
    </div>
  );
}
