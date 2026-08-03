"use client";

import { 
  Search, 
  MapPin, 
  Calendar, 
  Star, 
  ArrowRight, 
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  SlidersHorizontal,
  Heart,
  Clock,
  Globe2,
  Waves,
  Landmark,
  Trees,
  Compass,
  type LucideIcon,
} from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import Header from '@/components/Header';
import { PageSkeleton } from '@/components/ux/PageSkeleton';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import { getFavorites, toggleFavorite } from '@/lib/tourStorage';

import { fetchAllTours } from '@/lib/tourApi';
import { Popover } from '@/components/ui/popover';

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
  isDomestic?: boolean;
  category_id?: number;
  category_name?: string;
  city_id?: string;
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

function TourCard({
  tour,
  isFavorite,
  onToggleFavorite,
  onOpen,
}: {
  tour: Tour;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, tour: Tour) => void;
  onOpen: (id: string) => void;
}) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(tour.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(tour.id);
        }
      }}
      className="interactive-press group flex w-[260px] shrink-0 snap-start cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm outline-none transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800 md:w-[300px]"
    >
      <div className="relative h-[190px] overflow-hidden md:h-[210px]">
        <ImageWithFallback
          src={tour.image}
          alt={tour.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
        {tour.badge && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold tracking-wide text-blue-700 shadow-sm dark:bg-slate-900/95 dark:text-blue-300">
            {tour.badge}
          </span>
        )}
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
          <Clock className="size-3" />
          {tour.duration}
        </div>
        <button
          type="button"
          aria-label={isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
          onClick={(e) => onToggleFavorite(e, tour)}
          className="interactive-press absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-slate-400 shadow-sm transition-colors hover:bg-white hover:text-red-500 dark:bg-slate-900/90"
        >
          <Heart className={`size-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>
      <div className="flex flex-1 flex-col bg-white p-4 dark:bg-slate-900">
        <p className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
          <MapPin className="size-3 shrink-0 text-blue-500" />
          <span className="truncate">{tour.location}</span>
        </p>
        <h4 className="mb-3 line-clamp-2 text-[15px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
          {tour.title}
        </h4>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">{tour.rating}</span>
            <span className="text-[11px] font-medium text-slate-400">({tour.reviews})</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Từ</p>
            <p className="text-lg font-extrabold tracking-tight text-blue-700 dark:text-blue-400">
              {tour.price.toLocaleString('vi-VN')}₫
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

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
    setSelectedLocation(null);
    setSearchQuery(prev => ({ ...prev, destination: '' }));
  }, []);

  useEffect(() => {
    const loadTours = async () => {
      try {
        const data = await fetchAllTours();
        const mapped = data.map((t: any, index: number) => ({
          ...t,
          badge: t.badge || (index === 0 ? "Verified" : index === 1 ? "Bestseller" : undefined)
        }));
        setTours(mapped);
      } catch {
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    loadTours();
  }, []);

  const handleSearch = () => {
    if (searchQuery.destination.trim() !== '' || durationFilter !== '' || priceRange[0] > 0 || priceRange[1] < 100000000) {
      setSelectedLocation('Kết quả tìm kiếm');
    } else {
      setSelectedLocation(null);
    }
    const toursSection = document.getElementById('tours');
    if (toursSection) {
      const y = toursSection.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleQuickTagClick = (tag: string) => {
    let startLoc = searchQuery.startLocation;
    let dest = tag;
    if (tag.includes('-')) {
      const parts = tag.split('-');
      startLoc = parts[0].trim();
      dest = parts.slice(1).join('-').trim();
    } else {
      startLoc = 'Hà Nội';
      dest = tag.trim();
    }
    setSearchQuery(prev => ({ ...prev, destination: dest, startLocation: startLoc }));
    setSelectedLocation('Kết quả tìm kiếm');
    setIsFilterExpanded(true);
  };

  const filteredTours = tours.filter((tour) => {
    const matchesDuration = !durationFilter || tour.duration.toLowerCase().includes(durationFilter.toLowerCase());
    const matchesPrice = tour.price >= priceRange[0] && tour.price <= priceRange[1];
    const keyword = searchQuery.destination.trim().toLowerCase();
    const matchesDestination = !keyword || tour.title.toLowerCase().includes(keyword) || tour.location.toLowerCase().includes(keyword);

    return matchesDuration && matchesPrice && matchesDestination;
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

  // Group tours by location or show search results
  const groupedTours = useMemo(() => {
    const groups: Record<string, Tour[]> = {};
    if (selectedLocation === 'Kết quả tìm kiếm') {
      groups['Kết quả tìm kiếm'] = filteredTours;
      return groups;
    }
    filteredTours.forEach(tour => {
      const loc = tour.location || 'Khác';
      if (!groups[loc]) groups[loc] = [];
      groups[loc].push(tour);
    });
    return groups;
  }, [filteredTours, selectedLocation]);

  const tourSections = useMemo(() => {
    const domestic: Tour[] = [];
    const international: Tour[] = [];
    const beach: Tour[] = [];
    const culture: Tour[] = [];
    const resort: Tour[] = [];
    const adventure: Tour[] = [];

    filteredTours.forEach(tour => {
      const cityId = parseInt(tour.city_id || '0');
      if (cityId >= 1 && cityId <= 34) {
        domestic.push(tour);
      } else if (cityId > 34) {
        international.push(tour);
      }

      if (tour.category_id === 1) beach.push(tour);
      else if (tour.category_id === 2) culture.push(tour);
      else if (tour.category_id === 3) resort.push(tour);
      else if (tour.category_id === 4) adventure.push(tour);
    });

    return [
      { id: 'domestic', title: 'Tour Trong Nước', icon: MapPin, tours: domestic },
      { id: 'international', title: 'Tour Nước Ngoài', icon: Globe2, tours: international },
      { id: 'beach', title: 'Tour Biển Đảo', icon: Waves, tours: beach },
      { id: 'culture', title: 'Tour Văn Hóa - Lịch Sử', icon: Landmark, tours: culture },
      { id: 'resort', title: 'Tour Nghỉ Dưỡng Cao Cấp', icon: Trees, tours: resort },
      { id: 'adventure', title: 'Tour Phượt & Khám Phá', icon: Compass, tours: adventure },
    ] as { id: string; title: string; icon: LucideIcon; tours: Tour[] }[];
  }, [filteredTours]);

  const handleToggleFavorite = (e: React.MouseEvent, tour: Tour) => {
    e.stopPropagation();
    const next = toggleFavorite(tour);
    setFavoriteIds(next.map((item) => item.id));
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300 ${theme === 'dark' ? 'dark text-white' : 'text-slate-900 dark:text-slate-50'}`}>
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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-md tracking-tight font-serif">
              CMC Travel
            </h1>
            <p className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-white/95 tracking-tight">
              Khám phá thế giới, trải nghiệm thượng lưu
            </p>
            <p className="mt-5 text-base sm:text-lg text-white/90 max-w-2xl font-medium leading-relaxed drop-shadow-sm">
              Hành trình cá nhân hóa, dịch vụ đẳng cấp và những điểm đến ngoạn mục đang chờ đón bạn.
            </p>
          </div>

          {/* Elegant Search Panel */}
          <div className="w-full max-w-4xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/40 dark:border-slate-800 transition-all duration-300">
            
            {/* Primary Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              
              {/* Start Point */}
              <div className="relative flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl group focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <MapPin className="size-5.5 text-blue-600 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-400 block font-bold">Điểm khởi hành</label>
                  <input
                    type="text"
                    value={searchQuery.startLocation}
                    readOnly
                    className="w-full outline-none text-sm text-slate-800 dark:text-slate-100 font-bold bg-transparent placeholder-slate-400 cursor-not-allowed opacity-80"
                    placeholder="Điểm đi (Tự động)"
                  />
                </div>
              </div>

              {/* End Point */}
              <div className="relative flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl group focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <MapPin className="size-5.5 text-blue-600 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-400 block font-bold">Đến</label>
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
                  <div className="absolute left-0 right-0 top-full mt-2 z-20 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                    {destinationSuggestions.map((tour) => (
                      <button
                        key={tour.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          let newStartLocation = searchQuery.startLocation;
                          let newDestination = tour.title;

                          if (tour.title.includes('-')) {
                            const parts = tour.title.split('-');
                            newStartLocation = parts[0].trim();
                            newDestination = parts.slice(1).join('-').trim();
                          } else {
                            newStartLocation = 'Hà Nội';
                            newDestination = tour.title.trim();
                          }

                          setSearchQuery(prev => ({ 
                            ...prev, 
                            destination: newDestination,
                            startLocation: newStartLocation 
                          }));
                          setShowDestinationSuggestions(false);
                          setSelectedLocation('Kết quả tìm kiếm');
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
              <div className="relative flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl group focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Calendar className="size-5.5 text-blue-600 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-400 block font-bold">Ngày đi</label>
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
                className="interactive-press bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl p-4 transition-all duration-200 flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-900/10 cursor-pointer w-full"
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
                className="flex items-center gap-2 text-xs font-extrabold text-slate-500 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-400 transition-colors uppercase tracking-wider cursor-pointer"
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
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 dark:bg-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
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

      <main id="tours" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16 md:space-y-20">
        
        {loading ? (
          <PageSkeleton variant="list" hideChrome className="min-h-0 bg-transparent dark:bg-transparent" />
        ) : (
          <>
            {/* 1. Hero Slider (Best Sellers) */}
            {heroTours.length > 0 && (
              <section className="relative w-full h-[420px] md:h-[520px] rounded-[1.75rem] overflow-hidden shadow-2xl group ring-1 ring-black/5 dark:ring-white/10">
                {heroTours.map((tour, idx) => (
                  <div 
                    key={tour.id}
                    className={`absolute inset-0 transition-all duration-700 ease-out ${idx === currentSlide ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-[1.02] pointer-events-none'}`}
                    aria-hidden={idx !== currentSlide}
                  >
                    <ImageWithFallback src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />
                    <div className="absolute top-6 right-6 md:top-10 md:right-10 z-20">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFavorite(e, tour)}
                        className="interactive-press bg-white/90 p-2.5 rounded-full hover:bg-white dark:bg-slate-900 text-slate-400 shadow-lg transition-colors"
                      >
                        <Heart className={`size-5 ${favoriteIds.includes(tour.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </button>
                    </div>
                    <div className="absolute inset-0 p-8 md:p-14 flex flex-col justify-end md:justify-center max-w-2xl text-left">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-300 text-amber-950 text-[11px] font-black uppercase tracking-wider rounded-full self-start mb-4 shadow-sm">
                        <Star className="size-3 fill-current" />
                        Bán chạy nhất
                      </span>
                      <h2 className="text-3xl md:text-5xl font-black font-serif text-white leading-tight mb-3 drop-shadow-lg tracking-tight">
                        {tour.title}
                      </h2>
                      <p className="text-white/85 text-sm md:text-base font-medium mb-6 leading-relaxed line-clamp-2 md:line-clamp-3">
                        {tour.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <button 
                          type="button"
                          onClick={() => navigate(`/tour/${tour.id}`)}
                          className="interactive-press bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-7 rounded-xl self-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shadow-lg shadow-blue-900/30"
                        >
                          Đặt ngay
                        </button>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                          <Clock className="size-3.5" />
                          {tour.duration}
                        </span>
                        <span className="text-lg font-black text-white">
                          {tour.price.toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-3 md:px-4 pointer-events-none">
                  <button
                    type="button"
                    aria-label="Tour trước"
                    onClick={() => setCurrentSlide((prev) => (prev - 1 + heroTours.length) % heroTours.length)}
                    className="interactive-press pointer-events-auto size-10 md:size-11 rounded-full bg-white/90 dark:bg-slate-900/90 border border-white/40 shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Tour tiếp"
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % heroTours.length)}
                    className="interactive-press pointer-events-auto size-10 md:size-11 rounded-full bg-white/90 dark:bg-slate-900/90 border border-white/40 shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight className="size-5" />
                  </button>
                </div>

                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {heroTours.map((_, idx) => (
                    <button 
                      key={idx}
                      type="button"
                      aria-label={`Chuyển tới slide ${idx + 1}`}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-white/45 hover:bg-white/70'}`}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Tour Sections (Domestic, International, Categories) */}
            {selectedLocation === null ? (
              <div className="space-y-14">
                {tourSections.map((section) => {
                  if (section.tours.length === 0) return null;
                  const SectionIcon = section.icon;
                  return (
                    <div key={section.id} className="relative group/section text-left">
                      <div className="mb-6 flex items-end justify-between gap-4">
                        <div>
                          <h3 className="flex items-center gap-3 text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-serif">
                            <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                              <SectionIcon className="size-5" />
                            </span>
                            {section.title}
                          </h3>
                          <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            {section.tours.length} hành trình đang mở bán
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <div 
                          id={`carousel-${section.id}`}
                          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                          {section.tours.map((tour) => (
                            <TourCard
                              key={tour.id}
                              tour={tour}
                              isFavorite={favoriteIds.includes(tour.id)}
                              onToggleFavorite={handleToggleFavorite}
                              onOpen={(id) => navigate(`/tour/${id}`)}
                            />
                          ))}
                        </div>
                        <button 
                          type="button"
                          aria-label="Cuộn trái"
                          className="interactive-press absolute top-[105px] md:top-[115px] -left-3 -translate-y-1/2 bg-white/95 backdrop-blur-md dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 shadow-xl p-2.5 rounded-full hidden md:group-hover/section:flex hover:bg-slate-50 dark:hover:bg-slate-700 z-10 cursor-pointer text-blue-600"
                          onClick={(e) => {
                            e.preventDefault();
                            const container = document.getElementById(`carousel-${section.id}`);
                            if (container) container.scrollBy({ left: -320, behavior: 'smooth' });
                          }}
                        >
                          <ChevronLeft className="size-5" />
                        </button>
                        <button 
                          type="button"
                          aria-label="Cuộn phải"
                          className="interactive-press absolute top-[105px] md:top-[115px] -right-3 -translate-y-1/2 bg-white/95 backdrop-blur-md dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 shadow-xl p-2.5 rounded-full hidden md:group-hover/section:flex hover:bg-slate-50 dark:hover:bg-slate-700 z-10 cursor-pointer text-blue-600"
                          onClick={(e) => {
                            e.preventDefault();
                            const container = document.getElementById(`carousel-${section.id}`);
                            if (container) container.scrollBy({ left: 320, behavior: 'smooth' });
                          }}
                        >
                          <ArrowRight className="size-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Back Button and Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 text-left">
                  <div>
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="interactive-press inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors mb-2 cursor-pointer bg-transparent border-none"
                    >
                      <ArrowLeft className="size-4" />
                      <span>Quay lại chọn địa điểm</span>
                    </button>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      {selectedLocation === 'Kết quả tìm kiếm' ? 'Kết quả tìm kiếm' : `Tour tại ${selectedLocation}`}
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
                      {/* STYLE 0: 1 Big Left, 2 Small Right */}
                      {layoutType === 0 && (
                        <div className="flex flex-col lg:flex-row gap-6">
                          <div
                            onClick={() => navigate(`/tour/${locTours[0].id}`)}
                            className="w-full lg:w-2/3 h-[400px] md:h-[500px] relative rounded-2xl overflow-hidden cursor-pointer group shadow-md"
                          >
                            <ImageWithFallback src={locTours[0].image} alt={locTours[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute top-4 left-4 flex gap-2">
                              {locTours[0].badge && (
                                <span className="bg-[#fef08a] text-amber-900 px-3 py-1 rounded-sm text-xs font-bold uppercase">
                                  {locTours[0].badge}
                                </span>
                              )}
                              <button onClick={(e) => handleToggleFavorite(e, locTours[0])} className="bg-white/90 p-1.5 rounded-full hover:bg-white dark:bg-slate-900 text-slate-400">
                                <Heart className={`size-4 ${favoriteIds.includes(locTours[0].id) ? 'fill-red-500 text-red-500' : ''}`} />
                              </button>
                            </div>

                            <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-white/30">
                              <Clock className="size-3" /> {locTours[0].duration}
                            </div>

                            <div className="absolute bottom-0 left-0 w-full p-6 bg-white dark:bg-slate-900 transform translate-y-2 group-hover:translate-y-0 transition-transform text-left">
                              <div className="flex items-center gap-1 mb-2">
                                <Star className="size-4 fill-amber-400 text-amber-400" />
                                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{locTours[0].rating}</span>
                                <span className="text-slate-400 text-xs">({locTours[0].reviews} đánh giá)</span>
                              </div>
                              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-50 line-clamp-1">{locTours[0].title}</h4>
                              <div className="flex justify-between items-end mt-4">
                                <div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Giá từ</p>
                                  <p className="text-xl font-black text-blue-700">{locTours[0].price.toLocaleString('vi-VN')}đ</p>
                                </div>
                                <button className="bg-blue-100 text-blue-700 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                  <ArrowRight className="size-5" />
                                </button>
                              </div>
                            </div>
                          </div>

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
                                  <button onClick={(e) => handleToggleFavorite(e, tour)} className="bg-white/90 p-1.5 rounded-full hover:bg-white dark:bg-slate-900 text-slate-400 shadow-sm transition-colors">
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
                      )}

                      {/* STYLE 1: Horizontal grid */}
                      {layoutType === 1 && (
                        <div className="bg-[#f4f7fb] dark:bg-slate-900/50 rounded-[2rem] p-6 md:p-10 text-left">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {locTours.slice(0, 3).map(tour => (
                              <div key={tour.id} onClick={() => navigate(`/tour/${tour.id}`)} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group flex flex-col">
                                <div className="relative h-48 overflow-hidden">
                                  <ImageWithFallback src={tour.image} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  {tour.badge && <span className="absolute bottom-2 left-2 bg-white dark:bg-slate-900 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">{tour.badge}</span>}
                                  <div className="absolute top-2 right-2 z-10">
                                    <button onClick={(e) => handleToggleFavorite(e, tour)} className="bg-white/90 p-1.5 rounded-full hover:bg-white dark:bg-slate-900 text-slate-400 shadow-sm transition-colors">
                                      <Heart className={`size-3.5 ${favoriteIds.includes(tour.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                    </button>
                                  </div>
                                </div>
                                <div className="p-4 flex flex-col flex-1">
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
                            <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-300 transition-colors">
                              <div className="size-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                <MapPin className="size-5" />
                              </div>
                              <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                                Khám phá thêm {locTours.length > 3 ? locTours.length - 3 : 'nhiều'} tour tại {selectedLocation}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STYLE 2: 1 Big Left, 4 Small Right */}
                      {layoutType === 2 && (
                        <div className="text-left">
                          <div className="flex flex-col lg:flex-row gap-6">
                            <div
                              onClick={() => navigate(`/tour/${locTours[0].id}`)}
                              className="w-full lg:w-1/2 h-[500px] relative rounded-3xl overflow-hidden cursor-pointer group shadow-lg"
                            >
                              <ImageWithFallback src={locTours[0].image} alt={locTours[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                              <div className="absolute top-4 right-4 z-10">
                                <button onClick={(e) => handleToggleFavorite(e, locTours[0])} className="bg-white/90 p-2 rounded-full hover:bg-white dark:bg-slate-900 text-slate-400 shadow-sm transition-colors">
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

                            <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {locTours.slice(1, 5).map(tour => (
                                <div key={tour.id} onClick={() => navigate(`/tour/${tour.id}`)} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between h-full min-h-[200px]">
                                  <div>
                                    <div className="h-32 rounded-xl overflow-hidden mb-3 relative">
                                      <ImageWithFallback src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                                      <div className="absolute top-2 right-2 z-10">
                                        <button onClick={(e) => handleToggleFavorite(e, tour)} className="bg-white/90 p-1.5 rounded-full hover:bg-white dark:bg-slate-900 text-slate-400 shadow-sm transition-colors">
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
