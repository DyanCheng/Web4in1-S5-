"use client";

import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Plane, 
  Mountain, 
  Ship, 
  Building2, 
  Award, 
  Shield, 
  Headphones, 
  TrendingUp, 
  Loader2, 
  ArrowRight, 
  ChevronDown, 
  Sparkles, 
  SlidersHorizontal,
  Heart,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import { getFavorites, toggleFavorite } from '@/lib/tourStorage';

import { fetchAllTours } from '@/lib/tourApi';

interface Tour {
  id: string;
  cityId?: string;
  title: string;
  location: string;
  price: number;
  duration: string;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  badge?: string;
}


function isDomesticTour(tour: Tour): boolean {
  const idNum = parseInt(tour.cityId || tour.id, 10);
  
  // Nước ngoài: Từ ID 35 đến 100
  if (idNum >= 35 && idNum <= 100) {
    return false;
  }
  
  // Trong nước: Từ ID 1 đến 34, và 101 đến 110
  if ((idNum >= 1 && idNum <= 34) || (idNum >= 101 && idNum <= 110)) {
    return true;
  }
  
  // Dự phòng: Dựa vào địa điểm nếu ID nằm ngoài các khoảng trên
  const locationLower = (tour.location || '').toLowerCase();
  if (!locationLower) return true; 
  
  const hasVietnameseAccents = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i.test(locationLower);
  if (hasVietnameseAccents) return true;

  return false;
}

const destinationImages: Record<string, string> = {
  'Vịnh Hạ Long': 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
  'Quảng Ninh': 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
  'Phú Quốc': 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=800&q=80',
  'Kiên Giang': 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=800&q=80',
  'Đà Lạt': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
  'Lâm Đồng': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
  'Sapa': 'https://images.unsplash.com/photo-1504457047772-27faf1c005b7?auto=format&fit=crop&w=800&q=80',
  'Lào Cai': 'https://images.unsplash.com/photo-1504457047772-27faf1c005b7?auto=format&fit=crop&w=800&q=80',
  'Huế': 'https://images.unsplash.com/photo-1570158268183-d296b289020b?auto=format&fit=crop&w=800&q=80',
  'Thừa Thiên Huế': 'https://images.unsplash.com/photo-1570158268183-d296b289020b?auto=format&fit=crop&w=800&q=80',
  'Đà Nẵng': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
  'Nha Trang': 'https://images.unsplash.com/photo-1533002832-1721d16b4bb9?auto=format&fit=crop&w=800&q=80',
  'Khánh Hòa': 'https://images.unsplash.com/photo-1533002832-1721d16b4bb9?auto=format&fit=crop&w=800&q=80',
  'Hà Nội': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
  'Bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
  'Bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
  'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
  'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
  'Melbourne': 'https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&w=800&q=80',
  'Vũng Tàu': 'https://images.unsplash.com/photo-1579710313175-103328e14652?auto=format&fit=crop&w=800&q=80',
  'Phan Thiết': 'https://images.unsplash.com/photo-1596422846543-75c6fc18a523?auto=format&fit=crop&w=800&q=80',
  'Mũi Né': 'https://images.unsplash.com/photo-1596422846543-75c6fc18a523?auto=format&fit=crop&w=800&q=80',
};


export default function HomePage() {
  const router = useRouter();
  const navigate = (url: string) => router.push(url);
  const { theme } = useTheme();
  
  // Get today's date
  const getTodayDate = () => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState({ 
    startLocation: 'Hà Nội', 
    destination: '', 
    date: getTodayDate()
  }); 
  const [searchType, setSearchType] = useState<'domestic' | 'international'>('domestic');
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000000]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [durationFilter, setDurationFilter] = useState('');
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);

  // Tours state
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Search suggestions
  const destinationSuggestions = useMemo(() => {
    const keyword = searchQuery.destination.trim().toLowerCase();
    if (!keyword || tours.length === 0) return [];
    return tours.filter((tour) => tour.title.toLowerCase().includes(keyword) || tour.location.toLowerCase().includes(keyword)).slice(0, 6);
  }, [searchQuery.destination, tours]);

  const startLocationSuggestions = useMemo(() => {
    const keyword = searchQuery.startLocation.trim().toLowerCase();
    if (!keyword || tours.length === 0) return [];
    return tours.filter((tour) => tour.title.toLowerCase().includes(keyword) || tour.location.toLowerCase().includes(keyword)).slice(0, 6);
  }, [searchQuery.startLocation, tours]);

  useEffect(() => {
    setFavoriteIds(getFavorites().map((tour) => tour.id));
  }, [tours]);

  useEffect(() => {

    const loadTours = async () => {
      const data = await fetchAllTours();
      setTours(
        data.map((t: Tour, index: number) => ({
          ...t,
          badge: t.badge || (index === 0 ? 'Verified' : index === 1 ? 'Bestseller' : undefined),
        }))
      );
      setLoading(false);
    };
    loadTours();
  }, []);

  const handleSearch = () => {
    const toursSection = document.getElementById('tours');
    if (toursSection) {
      const y = toursSection.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(prev => ({ ...prev, destination: tag }));
    setIsFilterExpanded(true);
  };

  const filteredTours = tours.filter((tour) => {
    const matchesDuration = !durationFilter || tour.duration.toLowerCase().includes(durationFilter.toLowerCase());
    const matchesPrice = tour.price >= priceRange[0] && tour.price <= priceRange[1];
    const keyword = searchQuery.destination.trim().toLowerCase();
    const matchesDestination = !keyword || tour.title.toLowerCase().includes(keyword) || tour.location.toLowerCase().includes(keyword);
    
    const domestic = isDomesticTour(tour);
    const matchesSearchType = (searchType === 'domestic' && domestic) || (searchType === 'international' && !domestic);

    return matchesDuration && matchesPrice && matchesDestination && matchesSearchType;
  });

  // Top tours for Hero Slider
  const heroTours = useMemo(() => {
    return [...filteredTours].sort((a, b) => b.rating * b.reviews - a.rating * a.reviews).slice(0, 3);
  }, [filteredTours]);

  // Auto slide
  useEffect(() => {
    if (heroTours.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroTours.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroTours]);

  // Group tours by location
  const groupedTours = useMemo(() => {
    const groups: Record<string, Tour[]> = {};
    filteredTours.forEach(tour => {
      const loc = tour.location || 'Khác';
      if (!groups[loc]) groups[loc] = [];
      groups[loc].push(tour);
    });
    return groups;
  }, [filteredTours]);

  const handleToggleFavorite = (e: React.MouseEvent, tour: Tour) => {
    e.stopPropagation();
    const next = toggleFavorite(tour);
    setFavoriteIds(next.map((item) => item.id));
  };

  return (
    <div className={`min-h-screen bg-white font-sans transition-colors duration-300 ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'text-slate-900'}`}>
      <Header />

      {/* Hero Section with Search Panel */}
      <section className="relative min-h-[640px] flex items-center justify-center py-20 overflow-hidden bg-slate-900">
        
        {/* Background Sunset Sea Image */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
            alt="Premium Sunset Coast"
            className="w-full h-full object-cover opacity-85"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-slate-50/50 dark:to-slate-950/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-left max-w-3xl mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-md font-serif">
              Khám Phá Thế Giới <br />
              Với Trải Nghiệm Thượng Lưu
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl font-medium leading-relaxed drop-shadow-sm">
              Hành trình cá nhân hóa, dịch vụ đẳng cấp 5 sao và những điểm đến ngoạn mục đang chờ đón bạn.
            </p>
          </div>

          {/* Elegant Search Panel */}
          <div className="w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/40 dark:border-slate-800 transition-all duration-300">
            
            {/* Domestic / International Radio Tabs */}
            <div className="flex items-center gap-6 mb-6">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="radio"
                  name="searchType"
                  checked={searchType === 'domestic'}
                  onChange={() => setSearchType('domestic')}
                  className="size-5 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className={`text-sm font-bold tracking-wide ${searchType === 'domestic' ? 'text-blue-900 dark:text-blue-400 font-extrabold' : 'text-slate-500'}`}>
                  Trong nước
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="radio"
                  name="searchType"
                  checked={searchType === 'international'}
                  onChange={() => setSearchType('international')}
                  className="size-5 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className={`text-sm font-bold tracking-wide ${searchType === 'international' ? 'text-blue-900 dark:text-blue-400 font-extrabold' : 'text-slate-500'}`}>
                  Nước ngoài
                </span>
              </label>
            </div>

            {/* Primary Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              
              {/* Start Point */}
              <div className="relative flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl group focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <MapPin className="size-5.5 text-blue-600 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block font-bold">Điểm khởi hành</label>
                  <input
                    type="text"
                    value={searchQuery.startLocation}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, startLocation: e.target.value }))}
                    onFocus={() => setShowStartSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowStartSuggestions(false), 200)}
                    className="w-full outline-none text-sm text-slate-800 dark:text-slate-100 font-bold bg-transparent placeholder-slate-400"
                    placeholder="Điểm đi"
                  />
                </div>
                {showStartSuggestions && searchQuery.startLocation.trim() && startLocationSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    {startLocationSuggestions.map((tour) => (
                      <button
                        key={`start-${tour.id}`}
                        onClick={() => {
                          setSearchQuery(prev => ({ ...prev, startLocation: tour.location }));
                          setShowStartSuggestions(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <img src={tour.image} alt={tour.title} className="size-11 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{tour.title}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{tour.location}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* End Point */}
              <div className="relative flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl group focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <MapPin className="size-5.5 text-blue-600 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block font-bold">Đến</label>
                  <input
                    type="text"
                    value={searchQuery.destination}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, destination: e.target.value }))}
                    onFocus={() => setShowDestinationSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                    className="w-full outline-none text-sm text-slate-800 dark:text-slate-100 font-bold bg-transparent placeholder-slate-400"
                    placeholder="Bạn muốn đi đâu?"
                  />
                </div>
                {showDestinationSuggestions && searchQuery.destination.trim() && destinationSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    {destinationSuggestions.map((tour) => (
                      <button
                        key={tour.id}
                        onClick={() => {
                          setSearchQuery(prev => ({ ...prev, destination: tour.location }));
                          setShowDestinationSuggestions(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <img src={tour.image} alt={tour.title} className="size-11 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{tour.title}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{tour.location}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Calendar Date */}
              <div className="relative flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-105 dark:border-slate-800 rounded-2xl group focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Calendar className="size-5.5 text-blue-600 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block font-bold">Ngày đi</label>
                  <input
                    placeholder="Chọn ngày"
                    type="date"
                    min={getTodayDate()}
                    value={searchQuery.date}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full outline-none text-sm text-slate-800 dark:text-slate-100 font-bold bg-transparent focus:ring-0"
                    onPaste={(e) => e.preventDefault()} // Prevent pasting
                    onKeyDown={(e) => e.preventDefault()} // Prevent typing
                  />
                </div>
              </div>

              {/* Search Submit Button */}
              <button
                onClick={handleSearch}
                className="bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl p-4 transition-all duration-200 flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-900/10 cursor-pointer w-full"
              >
                <Search className="size-5" />
                Tìm kiếm
              </button>
            </div>

            <div className="mt-5 text-left flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1.5">Gợi ý nhanh:</span>
              {['Hà Nội', 'Hạ Long', 'Paris', 'Dubai', 'Kyoto'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleQuickTagClick(tag)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-extrabold text-blue-900 dark:text-blue-300 bg-blue-50/50 hover:bg-blue-100/60 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 rounded-full border border-blue-100/30 transition-all cursor-pointer"
                >
                  <Star className="size-3 fill-blue-900 dark:fill-blue-400 text-blue-900 dark:text-blue-400" />
                  {tag}
                </button>
              ))}
            </div>

            {/* Advanced Filters Expandable Header */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-blue-900 dark:hover:text-blue-400 transition-colors uppercase tracking-wider cursor-pointer"
              >
                <SlidersHorizontal className="size-4" />
                Bộ lọc nâng cao
                <ChevronDown className={`size-4 transition-transform duration-200 ${isFilterExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Price Range Slider Container */}
              {isFilterExpanded && (
                <div className="mt-6 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 text-left animate-in fade-in slide-in-from-top-3 duration-250">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Khoảng giá</span>
                    <span className="text-xs font-bold bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-200/20">
                      {priceRange[0].toLocaleString('vi-VN')}đ - {priceRange[1].toLocaleString('vi-VN')}đ+
                    </span>
                  </div>
                  
                  {/* Radix UI Premium Slider */}
                  <Slider
                    defaultValue={[0, 100000000]}
                    value={priceRange}
                    onValueChange={(val) => {
                      if (Array.isArray(val)) {
                        setPriceRange([...val]);
                      }
                    }}
                    min={0}
                    max={100000000}
                    step={1000000}
                    className="py-4"
                  />
                  
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1.5">
                    <span>0đ</span>
                    <span>50.000.000đ</span>
                    <span>100.000.000đ+</span>
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Chuyến đi bao nhiêu ngày đêm</p>
                    <div className="flex flex-wrap gap-2">
                      {['1 ngày', '2 ngày 1 đêm', '3 ngày 2 đêm', '4 ngày 3 đêm', '5 ngày 4 đêm'].map((option) => (
                        <button
                          key={option}
                          onClick={() => setDurationFilter(option === durationFilter ? '' : option)}
                          className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                            durationFilter === option
                              ? 'bg-blue-900 text-white dark:bg-blue-600'
                              : 'bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      <main id="tours" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20">
        
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="size-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* 1. Hero Slider (Best Sellers) */}
            {heroTours.length > 0 && (
              <section className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
                {heroTours.map((tour, idx) => (
                  <div 
                    key={tour.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  >
                    <ImageWithFallback src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    <div className="absolute top-8 right-8 md:top-12 md:right-12 z-20">
                      <button onClick={(e) => handleToggleFavorite(e, tour)} className="bg-white/90 p-2.5 rounded-full hover:bg-white text-slate-400 shadow-lg transition-colors">
                        <Heart className={`size-6 ${favoriteIds.includes(tour.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    </div>
                    <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center max-w-2xl text-left">
                      <span className="inline-block px-3 py-1 bg-[#fef08a] text-amber-900 text-xs font-black uppercase tracking-wider rounded-full self-start mb-4">
                        Bán chạy nhất
                      </span>
                      <h2 className="text-3xl md:text-5xl font-black text-white leading-tight font-serif mb-4 drop-shadow-lg">
                        {tour.title}
                      </h2>
                      <p className="text-white/90 text-sm md:text-base font-medium mb-8 leading-relaxed">
                        {tour.description}
                      </p>
                      <button 
                        onClick={() => navigate(`/tour/${tour.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl self-start transition-colors"
                      >
                        Đặt ngay
                      </button>
                    </div>
                  </div>
                ))}
                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {heroTours.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all ${idx === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-white/50'}`}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Location Grid Cards / Details Selection */}
            {selectedLocation === null ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {Object.entries(groupedTours).map(([location, locTours]) => {
                    const repImage = destinationImages[location] || locTours[0]?.image || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";
                    return (
                      <div
                        key={location}
                        onClick={() => {
                          setSelectedLocation(location);
                          const toursSection = document.getElementById('tours');
                          if (toursSection) {
                            const y = toursSection.getBoundingClientRect().top + window.scrollY - 100;
                            window.scrollTo({ top: y, behavior: 'smooth' });
                          }
                        }}
                        className="relative h-[160px] rounded-xl overflow-hidden cursor-pointer group"
                      >
                        <ImageWithFallback
                          src={repImage}
                          alt={location}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div className="absolute top-4 left-4 text-left z-10">
                          <h4 className="text-white text-[15px] font-bold">
                            Tour ở {location}
                          </h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Back Button and Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 text-left">
                  <div>
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors mb-2 cursor-pointer bg-transparent border-none"
                    >
                      <ArrowLeft className="size-4" />
                      <span>Quay lại chọn địa điểm</span>
                    </button>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-serif">
                      Tour tại {selectedLocation}
                    </h3>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                      Tìm thấy {groupedTours[selectedLocation]?.length || 0} tour du lịch
                    </span>
                  </div>
                </div>

                {/* Render the tours of selected location */}
                {(() => {
                  const locTours = groupedTours[selectedLocation];
                  if (!locTours || locTours.length === 0) return <p className="text-slate-550 dark:text-slate-450">Không có tour nào ở địa điểm này.</p>;
                  
                  const index = Object.keys(groupedTours).indexOf(selectedLocation);
                  const layoutType = index % 3;

                  return (
                    <section className="w-full">
                      {/* STYLE 0: Vịnh Hạ Long (1 Big Left, 2 Small Right) */}
                      {layoutType === 0 && (
                        <div className="flex flex-col gap-6">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Big Card */}
                            <div 
                              onClick={() => navigate(`/tour/${locTours[0].id}`)}
                              className="w-full lg:w-2/3 h-[400px] md:h-[500px] relative rounded-2xl overflow-hidden cursor-pointer group shadow-md"
                            >
                              <ImageWithFallback src={locTours[0].image} alt={locTours[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                              
                              {/* Badges */}
                              <div className="absolute top-4 left-4 flex gap-2">
                                {locTours[0].badge && (
                                  <span className="bg-[#fef08a] text-amber-950 px-3 py-1 rounded-sm text-xs font-bold uppercase">
                                    {locTours[0].badge}
                                  </span>
                                )}
                                <button onClick={(e) => handleToggleFavorite(e, locTours[0])} className="bg-white/90 p-1.5 rounded-full hover:bg-white text-slate-400">
                                  <Heart className={`size-4 ${favoriteIds.includes(locTours[0].id) ? 'fill-red-500 text-red-500' : ''}`} />
                                </button>
                              </div>
                              
                              <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-white/30">
                                <Clock className="size-3" /> {locTours[0].duration}
                              </div>

                              <div className="absolute bottom-0 left-0 w-full p-6 bg-white transform translate-y-2 group-hover:translate-y-0 transition-transform text-left">
                                <div className="flex items-center gap-1 mb-2">
                                  <Star className="size-4 fill-amber-400 text-amber-400" />
                                  <span className="font-bold text-sm text-slate-800">{locTours[0].rating}</span>
                                  <span className="text-slate-400 text-xs">({locTours[0].reviews} đánh giá)</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 line-clamp-1">{locTours[0].title}</h4>
                                <div className="flex justify-between items-end mt-4">
                                  <div>
                                    <p className="text-xs text-slate-500">Giá từ</p>
                                    <p className="text-xl font-black text-blue-700">{locTours[0].price.toLocaleString('vi-VN')}đ</p>
                                  </div>
                                  <button className="bg-blue-100 text-blue-700 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <ArrowRight className="size-5" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* 2 Small Cards */}
                            <div className="w-full lg:w-1/3 flex flex-col gap-6">
                              {locTours.slice(1, 3).map(tour => (
                                <div 
                                  key={tour.id} 
                                  onClick={() => navigate(`/tour/${tour.id}`)}
                                  className="relative flex-1 rounded-2xl overflow-hidden group cursor-pointer shadow-md min-h-[200px]"
                                >
                                  <ImageWithFallback src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                  <div className="absolute top-3 right-3 z-10">
                                    <button onClick={(e) => handleToggleFavorite(e, tour)} className="bg-white/90 p-1.5 rounded-full hover:bg-white text-slate-400 shadow-sm transition-colors">
                                      <Heart className={`size-4 ${favoriteIds.includes(tour.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                    </button>
                                  </div>
                                  <div className="absolute bottom-4 left-4 right-4 text-left text-white">
                                    <h4 className="text-base font-bold line-clamp-2 mb-1">{tour.title}</h4>
                                    <p className="font-black text-[#fef08a]">{tour.price.toLocaleString('vi-VN')}đ</p>
                                  </div>
                                </div>
                              ))}
                              {locTours.length <= 1 && (
                                <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
                                  <MapPin className="size-8 mb-2" />
                                  <p className="text-xs font-semibold">Khám phá các điểm đến thú vị</p>
                                </div>
                              )}
                              {locTours.length <= 2 && (
                                <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
                                  <MapPin className="size-8 mb-2" />
                                  <p className="text-xs font-semibold">Trải nghiệm du lịch cao cấp</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STYLE 1: Phú Quốc (Blue bg, Horizontal grid) */}
                      {layoutType === 1 && (
                        <div className="bg-[#f4f7fb] dark:bg-slate-900/60 rounded-[2rem] p-6 md:p-10 text-left">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {locTours.map(tour => (
                              <div key={tour.id} onClick={() => navigate(`/tour/${tour.id}`)} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group flex flex-col">
                                <div className="relative h-48 overflow-hidden">
                                  <ImageWithFallback src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  {tour.badge && <span className="absolute bottom-2 left-2 bg-white text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">{tour.badge}</span>}
                                  <div className="absolute top-2 right-2 z-10">
                                    <button onClick={(e) => handleToggleFavorite(e, tour)} className="bg-white/90 p-1.5 rounded-full hover:bg-white text-slate-400 shadow-sm transition-colors">
                                      <Heart className={`size-3.5 ${favoriteIds.includes(tour.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                    </button>
                                  </div>
                                </div>
                                <div className="p-4 flex flex-col flex-1 text-left">
                                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{tour.title}</h4>
                                  <div className="flex items-center gap-1 mb-3">
                                    <Star className="size-3 fill-amber-400 text-amber-400" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{tour.rating}</span>
                                  </div>
                                  <div className="mt-auto flex justify-between items-end">
                                    <span className="text-blue-700 dark:text-blue-400 font-black text-lg">{tour.price.toLocaleString('vi-VN')}đ</span>
                                    <span className="text-slate-400 text-[10px] uppercase">/Khách</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* STYLE 2: Đà Lạt (Vertical Bar Title, 1 Big Left, 4 Small Right) */}
                      {layoutType === 2 && (
                        <div className="text-left">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Big Feature Card */}
                            <div 
                              onClick={() => navigate(`/tour/${locTours[0].id}`)}
                              className="w-full lg:w-1/2 h-[500px] relative rounded-3xl overflow-hidden cursor-pointer group shadow-lg"
                            >
                              <ImageWithFallback src={locTours[0].image} alt={locTours[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                              
                              <div className="absolute top-4 right-4 z-10">
                                <button onClick={(e) => handleToggleFavorite(e, locTours[0])} className="bg-white/90 p-2 rounded-full hover:bg-white text-slate-400 shadow-sm transition-colors">
                                  <Heart className={`size-5 ${favoriteIds.includes(locTours[0].id) ? 'fill-red-500 text-red-500' : ''}`} />
                                </button>
                              </div>
                              
                              <div className="absolute bottom-0 left-0 p-8 w-full">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-sm text-xs font-bold uppercase mb-3 inline-block">Được yêu thích nhất</span>
                                <div className="flex items-center gap-1 mb-2 text-white">
                                  <Star className="size-4 fill-amber-400 text-amber-400" />
                                  <span className="font-bold text-sm">{locTours[0].rating}</span>
                                </div>
                                <h4 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">{locTours[0].title}</h4>
                                <div className="flex justify-between items-end border-t border-white/20 pt-4">
                                  <div className="flex gap-4 text-white/80 text-sm font-medium">
                                    <span className="flex items-center gap-1"><Clock className="size-4"/> {locTours[0].duration}</span>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-white/70 uppercase">Giá từ</p>
                                    <p className="text-2xl font-black text-white">{locTours[0].price.toLocaleString('vi-VN')}đ</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 4 Small Mini Cards Grid */}
                            <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {locTours.slice(1, 5).map(tour => (
                                <div key={tour.id} onClick={() => navigate(`/tour/${tour.id}`)} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-850 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-full min-h-[200px]">
                                  <div>
                                    <div className="h-32 rounded-xl overflow-hidden mb-3 relative">
                                      <ImageWithFallback src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                                      <div className="absolute top-2 right-2 z-10">
                                        <button onClick={(e) => handleToggleFavorite(e, tour)} className="bg-white/90 p-1.5 rounded-full hover:bg-white text-slate-400 shadow-sm transition-colors">
                                          <Heart className={`size-3.5 ${favoriteIds.includes(tour.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                        </button>
                                      </div>
                                    </div>
                                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-2">{tour.title}</h5>
                                  </div>
                                  <p className="font-black text-blue-700 dark:text-blue-400 text-right mt-2">{tour.price.toLocaleString('vi-VN')}đ</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </section>
                  );
                })()}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
