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
  Heart
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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5200';

interface Tour {
  id: string;
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

const staticFeaturedTours: Tour[] = [
  {
    id: 'alps-1',
    title: "Kß╗│ Nghß╗ë Tr├¬n ─Éß╗ënh Alps",
    location: "Zermatt, Thß╗Ñy S─⌐",
    price: 45000000,
    duration: "2 Ng├áy",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 850,
    badge: "Verified",
    description: "Trß║úi nghiß╗çm tuyß║┐t trß║»ng Thß╗Ñy S─⌐ v├á dß╗ïch vß╗Ñ nghß╗ë d╞░ß╗íng cao cß║Ñp tß║íi Zermatt."
  },
  {
    id: 'santorini-2',
    title: "Ho├áng H├┤n Santorini",
    location: "Santorini, Hy Lß║íp",
    price: 38500000,
    duration: "5 Ng├áy",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
    rating: 5.0,
    reviews: 920,
    badge: "Bestseller",
    description: "Tß║¡n h╞░ß╗ƒng vß║╗ ─æß║╣p l├úng mß║ín bß║¡c nhß║Ñt Hy Lß║íp tß║íi nhß╗»ng ng├┤i biß╗çt thß╗▒ trß║»ng ven biß╗ân."
  },
  {
    id: 'india-3',
    title: "Huyß╗ün Thoß║íi ß║ñn ─Éß╗Ö",
    location: "Delhi - Agra - Jaipur",
    price: 29900000,
    duration: "10 Ng├áy",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 94,
    description: "Kh├ím ph├í tam gi├íc v├áng Delhi - Agra - Jaipur vß╗¢i nhß╗»ng c├┤ng tr├¼nh di sß║ún k├¼ v─⌐."
  }
];

export default function HomePage() {
  const router = useRouter();
  const navigate = (url: string) => router.push(url);
  const { user, logout } = useAuth();
  const { items } = useCart();
  
  const [searchQuery, setSearchQuery] = useState({ 
    startLocation: 'H├á Nß╗Öi', 
    destination: 'Hß║í Long', 
    date: '2026-06-02' 
  });
  const [searchType, setSearchType] = useState<'domestic' | 'international'>('domestic');
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000000]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [durationFilter, setDurationFilter] = useState('');
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const { theme } = useTheme();
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
    const fetchTours = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/tours`);
        if (response.ok) {
          const data = await response.json();
          // Filter or combine with our premium cards to keep the premium layout
          const combined = data.length > 0 ? data.map((t: any, index: number) => ({
            ...t,
            badge: index === 0 ? "Verified" : index === 1 ? "Bestseller" : undefined
          })) : staticFeaturedTours;
          setTours(combined);
        } else {
          setTours(staticFeaturedTours);
        }
      } catch {
        setTours(staticFeaturedTours);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  const handleSearch = () => {
    navigate(`/tours?destination=${searchQuery.destination}&startLocation=${searchQuery.startLocation}&date=${searchQuery.date}&type=${searchType}&minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}`);
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
    return matchesDuration && matchesPrice && matchesDestination;
  });

  return (
    <div className={`min-h-screen bg-slate-50/50 font-sans transition-colors duration-300 ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'text-slate-900'}`}>
      
      {/* 1. Header/Navbar */}
      <Header />

      {/* 2. Hero Section */}
      <section className="relative min-h-[640px] flex items-center justify-center py-20 overflow-hidden bg-slate-900">
        
        {/* Background Sunset Sea Image */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
            alt="Premium Sunset Coast"
            className="w-full h-full object-cover opacity-85"
          />
          {/* Subtle gradient overlay to darken top and blend with bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-slate-50/50 dark:to-slate-950/50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-left max-w-3xl mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-md font-serif">
              Kh├ím Ph├í Thß║┐ Giß╗¢i <br />
              Vß╗¢i Trß║úi Nghiß╗çm Th╞░ß╗úng L╞░u
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/95 max-w-2xl font-medium leading-relaxed drop-shadow-sm">
              H├ánh tr├¼nh c├í nh├ón h├│a, dß╗ïch vß╗Ñ ─æß║│ng cß║Ñp 5 sao v├á nhß╗»ng ─æiß╗âm ─æß║┐n ngoß║ín mß╗Ñc ─æang chß╗¥ ─æ├│n bß║ín.
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
                  Trong n╞░ß╗¢c
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
                  N╞░ß╗¢c ngo├ái
                </span>
              </label>
            </div>

            {/* Primary Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              
              {/* Start Point */}
              <div className="relative flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl group focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <MapPin className="size-5.5 text-blue-600 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block font-bold">─Éiß╗âm khß╗ƒi h├ánh</label>
                  <input
                    type="text"
                    value={searchQuery.startLocation}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, startLocation: e.target.value }))}
                    onFocus={() => setShowStartSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowStartSuggestions(false), 200)}
                    className="w-full outline-none text-sm text-slate-800 dark:text-slate-100 font-bold bg-transparent placeholder-slate-400"
                    placeholder="─Éiß╗âm ─æi"
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
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block font-bold">─Éß║┐n</label>
                  <input
                    type="text"
                    value={searchQuery.destination}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, destination: e.target.value }))}
                    onFocus={() => setShowDestinationSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                    className="w-full outline-none text-sm text-slate-800 dark:text-slate-100 font-bold bg-transparent placeholder-slate-400"
                    placeholder="Bß║ín muß╗æn ─æi ─æ├óu?"
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
              <div className="relative flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl group focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Calendar className="size-5.5 text-blue-600 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block font-bold">Ng├áy ─æi</label>
                  <input
                    type="date"
                    value={searchQuery.date}
                    onChange={(e) => setSearchQuery(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full outline-none text-sm text-slate-800 dark:text-slate-100 font-bold bg-transparent focus:ring-0"
                  />
                </div>
              </div>

              {/* Search Submit Button */}
              <button
                onClick={handleSearch}
                className="bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl p-4 transition-all duration-200 flex items-center justify-center gap-2 font-bold shadow-lg shadow-blue-900/10 cursor-pointer w-full"
              >
                <Search className="size-5" />
                T├¼m kiß║┐m
              </button>
            </div>

            <div className="mt-5 text-left flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1.5">Gß╗úi ├╜ nhanh:</span>
              {['H├á Nß╗Öi', 'Hß║í Long', 'Paris', 'Dubai', 'Kyoto'].map((tag) => (
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
                Bß╗Ö lß╗ìc n├óng cao
                <ChevronDown className={`size-4 transition-transform duration-200 ${isFilterExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Price Range Slider Container */}
              {isFilterExpanded && (
                <div className="mt-6 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 text-left animate-in fade-in slide-in-from-top-3 duration-250">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Khoß║úng gi├í</span>
                    <span className="text-xs font-bold bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-200/20">
                      {priceRange[0].toLocaleString('vi-VN')}─æ - {priceRange[1].toLocaleString('vi-VN')}─æ+
                    </span>
                  </div>
                  
                  {/* Radix UI Premium Slider */}
                  <Slider
                    defaultValue={[0, 100000000]}
                    value={priceRange}
                    onValueChange={(val) => setPriceRange(val)}
                    min={0}
                    max={100000000}
                    step={1000000}
                    className="py-4"
                  />
                  
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1.5">
                    <span>0─æ</span>
                    <span>50.000.000─æ</span>
                    <span>100.000.000─æ+</span>
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Chuyß║┐n ─æi bao nhi├¬u ng├áy ─æ├¬m</p>
                    <div className="flex flex-wrap gap-2">
                      {['1 ng├áy', '2 ng├áy 1 ─æ├¬m', '3 ng├áy 2 ─æ├¬m', '4 ng├áy 3 ─æ├¬m', '5 ng├áy 4 ─æ├¬m'].map((option) => (
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

      {/* 3. Featured Tours Section */}
      <section id="tours" className="py-24 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div className="text-left">
              <span className="inline-block px-4 py-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-full border border-blue-100/30 uppercase tracking-widest">
                Tour Nß╗òi Bß║¡t
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 font-serif leading-tight">
                Nhß╗»ng H├ánh Tr├¼nh ─É╞░ß╗úc Y├¬u Th├¡ch Nhß║Ñt
              </h2>
              <p className="mt-3 text-base text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
                ─É╞░ß╗úc tuyß╗ân chß╗ìn kß╗╣ l╞░ß╗íng ─æß╗â mang lß║íi cß║úm x├║c trß╗ìn vß║╣n v├á trß║úi nghiß╗çm ─æß╗Öc bß║ún.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/#tours')}
              className="group flex items-center gap-2 text-sm font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
            >
              Xem tß║Ñt cß║ú tour
              <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <Loader2 className="size-10 animate-spin text-blue-600" />
              <span className="ml-3 mt-3 text-slate-500 dark:text-slate-400 font-bold">─Éang tß║úi danh s├ích h├ánh tr├¼nh...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTours.map((tour) => (
                <div
                  key={tour.id}
                  onClick={() => navigate(`/tour/${tour.id}`)}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-100/40 dark:border-slate-800/40 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col h-full"
                >
                  {/* Photo Container */}
                  <div className="relative h-72 w-full overflow-hidden">
                    <ImageWithFallback
                      src={tour.image}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Floating Badges */}
                    {tour.badge && (
                      <span className={`absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide shadow-md ${
                        tour.badge === 'Verified' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {tour.badge}
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const next = toggleFavorite(tour);
                        setFavoriteIds(next.map((item) => item.id));
                      }}
                      className="absolute top-4 right-4 size-11 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-md cursor-pointer border border-white/20"
                      aria-label={favoriteIds.includes(tour.id) ? 'Bß╗Å y├¬u th├¡ch' : 'Th├¬m v├áo y├¬u th├¡ch'}
                    >
                      <Heart className={`size-5 ${favoriteIds.includes(tour.id) ? 'fill-red-500 text-red-500' : 'text-slate-700 dark:text-slate-300'}`} />
                    </button>

                    <span className="absolute bottom-4 left-4 bg-slate-950/65 backdrop-blur-sm text-white px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
                      ≡ƒòÆ {tour.duration}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 text-left flex flex-col flex-1">
                    
                    {/* Rating row */}
                    <div className="flex items-center gap-1.5 mb-3 font-bold text-sm">
                      <Star className="size-4.5 fill-amber-400 text-amber-400" />
                      <span className="text-slate-800 dark:text-slate-200">{tour.rating}</span>
                      <span className="text-slate-400 dark:text-slate-500 font-medium">({tour.reviews} ─æ├ính gi├í)</span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tour.title}
                    </h3>
                    
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium line-clamp-2">
                      {tour.description}
                    </p>

                    {/* Bottom Pricing & Action */}
                    <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800 mt-auto">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Gi├í tß╗½</span>
                        <p className="text-xl font-black text-blue-900 dark:text-blue-400 leading-none mt-1">
                          {tour.price.toLocaleString('vi-VN')}─æ
                        </p>
                      </div>
                      
                      {/* Round Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tour/${tour.id}`);
                        }}
                        className="size-11 bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all shadow-md group-hover:scale-105 cursor-pointer shrink-0"
                      >
                        <ArrowRight className="size-5.5" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredTours.length > 3 && (
            <div className="mt-16">
              <div className="flex items-end justify-between gap-4 mb-8">
                <div className="text-left">
                  <span className="inline-block px-4 py-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-full border border-blue-100/30 uppercase tracking-widest">
                    Tß║Ñt cß║ú tour
                  </span>
                  <h3 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-serif leading-tight">
                    Danh s├ích tour ─æß║ºy ─æß╗º
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTours.slice(3).map((tour) => (
                  <div
                    key={`all-${tour.id}`}
                    onClick={() => navigate(`/tour/${tour.id}`)}
                    className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-100/40 dark:border-slate-800/40 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col h-full"
                  >
                    <div className="relative h-72 w-full overflow-hidden">
                      <ImageWithFallback
                        src={tour.image}
                        alt={tour.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = toggleFavorite(tour);
                          setFavoriteIds(next.map((item) => item.id));
                        }}
                        className="absolute top-4 right-4 size-11 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-md cursor-pointer border border-white/20"
                        aria-label={favoriteIds.includes(tour.id) ? 'Bß╗Å y├¬u th├¡ch' : 'Th├¬m v├áo y├¬u th├¡ch'}
                      >
                        <Heart className={`size-5 ${favoriteIds.includes(tour.id) ? 'fill-red-500 text-red-500' : 'text-slate-700 dark:text-slate-300'}`} />
                      </button>
                    </div>

                    <div className="p-6 text-left flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 mb-3 font-bold text-sm">
                        <Star className="size-4.5 fill-amber-400 text-amber-400" />
                        <span className="text-slate-800 dark:text-slate-200">{tour.rating}</span>
                        <span className="text-slate-400 dark:text-slate-500 font-medium">({tour.reviews} ─æ├ính gi├í)</span>
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tour.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium line-clamp-2">
                        {tour.description}
                      </p>
                      <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800 mt-auto">
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Gi├í tß╗½</span>
                          <p className="text-xl font-black text-blue-900 dark:text-blue-400 leading-none mt-1">
                            {tour.price.toLocaleString('vi-VN')}─æ
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tour/${tour.id}`);
                          }}
                          className="size-11 bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all shadow-md group-hover:scale-105 cursor-pointer shrink-0"
                        >
                          <ArrowRight className="size-5.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 4. All Tours Section */}
      <section id="all-tours" className="py-24 bg-slate-100/50 dark:bg-slate-900/30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-serif leading-tight">
              Tß║Ñt Cß║ú Tour
            </h2>
            <p className="mt-4 text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Danh s├ích tour ─æß║ºy ─æß╗º ─æß╗â bß║ín xem v├á chß╗ìn ngay tr├¬n mß╗Öt trang duy nhß║Ñt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour) => (
              <div
                key={`all-tour-${tour.id}`}
                onClick={() => navigate(`/tour/${tour.id}`)}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-100/40 dark:border-slate-800/40 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col h-full"
              >
                <div className="relative h-72 w-full overflow-hidden">
                  <ImageWithFallback
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = toggleFavorite(tour);
                      setFavoriteIds(next.map((item) => item.id));
                    }}
                    className="absolute top-4 right-4 size-11 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-md cursor-pointer border border-white/20"
                    aria-label={favoriteIds.includes(tour.id) ? 'Bß╗Å y├¬u th├¡ch' : 'Th├¬m v├áo y├¬u th├¡ch'}
                  >
                    <Heart className={`size-5 ${favoriteIds.includes(tour.id) ? 'fill-red-500 text-red-500' : 'text-slate-700 dark:text-slate-300'}`} />
                  </button>
                  <span className="absolute bottom-4 left-4 bg-slate-950/65 backdrop-blur-sm text-white px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
                    ≡ƒòÆ {tour.duration}
                  </span>
                </div>
                <div className="p-6 text-left flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 mb-3 font-bold text-sm">
                    <Star className="size-4.5 fill-amber-400 text-amber-400" />
                    <span className="text-slate-800 dark:text-slate-200">{tour.rating}</span>
                    <span className="text-slate-400 dark:text-slate-500 font-medium">({tour.reviews} ─æ├ính gi├í)</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tour.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium line-clamp-2">
                    {tour.description}
                  </p>
                  <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <div>
                      <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Gi├í tß╗½</span>
                      <p className="text-xl font-black text-blue-900 dark:text-blue-400 leading-none mt-1">
                        {tour.price.toLocaleString('vi-VN')}─æ
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tour/${tour.id}`);
                      }}
                      className="size-11 bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all shadow-md group-hover:scale-105 cursor-pointer shrink-0"
                    >
                      <ArrowRight className="size-5.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section className="py-24 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side info */}
            <div className="lg:col-span-4 text-left">
              <span className="inline-block px-4 py-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-full border border-blue-100/30 uppercase tracking-widest">
                ─É├ính gi├í
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 font-serif leading-tight">
                Nhß╗»ng C├óu Chuyß╗çn Tß╗½ Kh├ích H├áng
              </h2>
              <p className="mt-4 text-base text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mb-8">
                Ch├║ng t├┤i tß╗▒ h├áo l├á ng╞░ß╗¥i bß║ín ─æß╗ông h├ánh tin cß║¡y trong mß╗ùi chuyß║┐n ─æi cß╗ºa h├áng ng├án du kh├ích.
              </p>

              {/* Avatar circle group */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3.5">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                  ].map((src, i) => (
                    <img 
                      key={i} 
                      src={src} 
                      alt="Customer face" 
                      className="size-10 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-sm"
                    />
                  ))}
                </div>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-300">
                  +1,200 kh├ích h├áng h├ái l├▓ng
                </span>
              </div>
            </div>

            {/* Right side testimonials list */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Testimonial card 1 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100/60 dark:border-slate-800/40 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow text-left flex flex-col justify-between relative group">
                <div>
                  <div className="flex justify-between items-start mb-5">
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-4.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {/* Big beautiful quotation */}
                    <span className="text-4xl font-extrabold text-blue-100 dark:text-blue-900 leading-none select-none font-serif">
                      99
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-semibold italic mb-8">
                    ΓÇ£Chuyß║┐n ─æi Thß╗Ñy Sß╗╣ vß╗½a rß╗ôi thß╗▒c sß╗▒ l├á mß╗Öt giß║Ñc m╞í. Tß╗½ kh├ích sß║ín ─æß║┐n ph╞░╞íng tiß╗çn di chuyß╗ân ─æß╗üu ho├án hß║úo. ─Éß╗Öi ng┼⌐ CMC Travel rß║Ñt tß║¡n t├óm!ΓÇ¥
                  </p>
                </div>

                {/* Profile row */}
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center font-bold text-violet-600 dark:text-violet-400 text-sm tracking-wide shrink-0">
                    NT
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-950 dark:text-white">Nguyß╗àn Th├ánh</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Doanh nh├ón</p>
                  </div>
                </div>
              </div>

              {/* Testimonial card 2 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100/60 dark:border-slate-800/40 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow text-left flex flex-col justify-between relative group">
                <div>
                  <div className="flex justify-between items-start mb-5">
                    {/* Stars */}
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="size-4.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-4xl font-extrabold text-blue-100 dark:text-blue-900 leading-none select-none font-serif">
                      99
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-semibold italic mb-8">
                    ΓÇ£T├┤i ─æ├ú ─æß║╖t tour ri├¬ng ─æi Santorini qua CMC Travel. Dß╗ïch vß╗Ñ ─æß╗Öc bß║ún ─æ├║ng nh╞░ m├┤ tß║ú v├á ch├║ng t├┤i kh├┤ng phß║úi lo ngh─⌐ bß║Ñt cß╗⌐ ─æiß╗üu g├¼!ΓÇ¥
                  </p>
                </div>

                {/* Profile row */}
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-sm tracking-wide shrink-0">
                    ML
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-950 dark:text-white">Minh Lan</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Nhiß║┐p ß║únh gia</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 6. Footer */}
      <Footer />
    </div>
  );
}
