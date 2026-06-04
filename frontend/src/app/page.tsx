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
  SlidersHorizontal
} from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';

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
    title: "Kỳ Nghỉ Trên Đỉnh Alps",
    location: "Zermatt, Thụy Sĩ",
    price: 45000000,
    duration: "2 Ngày",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 850,
    badge: "Verified",
    description: "Trải nghiệm tuyết trắng Thụy Sĩ và dịch vụ nghỉ dưỡng cao cấp tại Zermatt."
  },
  {
    id: 'santorini-2',
    title: "Hoàng Hôn Santorini",
    location: "Santorini, Hy Lạp",
    price: 38500000,
    duration: "5 Ngày",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
    rating: 5.0,
    reviews: 920,
    badge: "Bestseller",
    description: "Tận hưởng vẻ đẹp lãng mạn bậc nhất Hy Lạp tại những ngôi biệt thự trắng ven biển."
  },
  {
    id: 'india-3',
    title: "Huyền Thoại Ấn Độ",
    location: "Delhi - Agra - Jaipur",
    price: 29900000,
    duration: "10 Ngày",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 94,
    description: "Khám phá tam giác vàng Delhi - Agra - Jaipur với những công trình di sản kì vĩ."
  }
];

export default function HomePage() {
  const router = useRouter();
  const navigate = (url: string) => router.push(url);
  const { user, logout } = useAuth();
  const { items } = useCart();
  
  const [searchQuery, setSearchQuery] = useState({ 
    startLocation: 'Hà Nội', 
    destination: 'Hạ Long', 
    date: '2026-06-02' 
  });
  const [searchType, setSearchType] = useState<'domestic' | 'international'>('domestic');
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000000]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

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
                    className="w-full outline-none text-sm text-slate-800 dark:text-slate-100 font-bold bg-transparent placeholder-slate-400"
                    placeholder="Điểm đi"
                  />
                </div>
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
                    className="w-full outline-none text-sm text-slate-800 dark:text-slate-100 font-bold bg-transparent placeholder-slate-400"
                    placeholder="Bạn muốn đi đâu?"
                  />
                </div>
              </div>

              {/* Calendar Date */}
              <div className="relative flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl group focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Calendar className="size-5.5 text-blue-600 shrink-0" />
                <div className="flex-1 text-left">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 block font-bold">Ngày đi</label>
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
                Tìm kiếm
              </button>
            </div>

            {/* Quick Tag Recommendations */}
            <div className="mt-5 text-left flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1.5">Tìm kiếm nổi bật:</span>
              {[
                "TOUR XUYÊN VIỆT",
                "WORLD CUP 2026",
                "TOUR CAO CẤP",
                "TOUR CARAVAN",
                "TƯ VẤN DU HỌC"
              ].map((tag) => (
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
                    onValueChange={(val) => setPriceRange(val)}
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
                Tour Nổi Bật
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 font-serif leading-tight">
                Những Hành Trình Được Yêu Thích Nhất
              </h2>
              <p className="mt-3 text-base text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
                Được tuyển chọn kỹ lưỡng để mang lại cảm xúc trọn vẹn và trải nghiệm độc bản.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/tours')}
              className="group flex items-center gap-2 text-sm font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
            >
              Xem tất cả tour
              <ArrowRight className="size-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <Loader2 className="size-10 animate-spin text-blue-600" />
              <span className="ml-3 mt-3 text-slate-500 dark:text-slate-400 font-bold">Đang tải danh sách hành trình...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.slice(0, 3).map((tour) => (
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

                    <span className="absolute bottom-4 left-4 bg-slate-950/65 backdrop-blur-sm text-white px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
                      🕒 {tour.duration}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 text-left flex flex-col flex-1">
                    
                    {/* Rating row */}
                    <div className="flex items-center gap-1.5 mb-3 font-bold text-sm">
                      <Star className="size-4.5 fill-amber-400 text-amber-400" />
                      <span className="text-slate-800 dark:text-slate-200">{tour.rating}</span>
                      <span className="text-slate-400 dark:text-slate-500 font-medium">({tour.reviews} đánh giá)</span>
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
                        <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Giá từ</span>
                        <p className="text-xl font-black text-blue-900 dark:text-blue-400 leading-none mt-1">
                          {tour.price.toLocaleString('vi-VN')}đ
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

        </div>
      </section>

      {/* 4. Top Destinations Section */}
      <section id="destinations" className="py-24 bg-slate-100/50 dark:bg-slate-900/30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-serif leading-tight">
              Điểm Đến Hàng Đầu
            </h2>
            <p className="mt-4 text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Những vùng đất mới lạ đang chờ bước chân bạn đến khám phá. Bắt đầu hành trình của bạn ngay hôm nay.
            </p>
          </div>

          {/* Staggered Masonry-like Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[620px]">
            
            {/* Left tall card - Kyoto */}
            <div 
              onClick={() => handleQuickTagClick("Kyoto")}
              className="md:col-span-6 relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl group cursor-pointer h-[320px] md:h-full transition-all duration-300"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80"
                alt="Kyoto Bamboo Forest"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              
              {/* Bottom text */}
              <div className="absolute bottom-6 left-6 right-6 text-left text-white">
                <h3 className="text-2xl font-black font-serif tracking-wide">Kyoto, Nhật Bản</h3>
                <p className="text-white/80 text-sm mt-1 font-semibold">Vẻ đẹp tĩnh lặng của thời gian</p>
              </div>
            </div>

            {/* Right container */}
            <div className="md:col-span-6 flex flex-col gap-6 h-full">
              
              {/* Right-Top wide card - Paris */}
              <div 
                onClick={() => handleQuickTagClick("Paris")}
                className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl group cursor-pointer h-[220px] md:h-[290px] transition-all duration-300"
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
                  alt="Paris Eiffel Tower"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
                
                <div className="absolute bottom-6 left-6 right-6 text-left text-white">
                  <h3 className="text-2xl font-black font-serif tracking-wide">Paris, Pháp</h3>
                  <p className="text-white/80 text-sm mt-1 font-semibold">Thành phố ánh sáng và nghệ thuật</p>
                </div>
              </div>

              {/* Right-Bottom side-by-side grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                
                {/* Rome */}
                <div 
                  onClick={() => handleQuickTagClick("Rome")}
                  className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl group cursor-pointer h-[200px] sm:h-full transition-all duration-300"
                >
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80"
                    alt="Rome Colosseum"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
                  
                  <div className="absolute bottom-5 left-5 right-5 text-left text-white">
                    <h3 className="text-xl font-black font-serif tracking-wide">Rome</h3>
                    <p className="text-white/80 text-xs mt-1 font-semibold">Dấu ấn cổ xưa kì vĩ</p>
                  </div>
                </div>

                {/* Dubai */}
                <div 
                  onClick={() => handleQuickTagClick("Dubai")}
                  className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl group cursor-pointer h-[200px] sm:h-full transition-all duration-300"
                >
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80"
                    alt="Dubai Skyline"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"></div>
                  
                  <div className="absolute bottom-5 left-5 right-5 text-left text-white">
                    <h3 className="text-xl font-black font-serif tracking-wide">Dubai</h3>
                    <p className="text-white/80 text-xs mt-1 font-semibold">Sự xa hoa vượt thời đại</p>
                  </div>
                </div>

              </div>

            </div>

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
                Đánh giá
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-4 font-serif leading-tight">
                Những Câu Chuyện Từ Khách Hàng
              </h2>
              <p className="mt-4 text-base text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mb-8">
                Chúng tôi tự hào là người bạn đồng hành tin cậy trong mỗi chuyến đi của hàng ngàn du khách.
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
                  +1,200 khách hàng hài lòng
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
                    “Chuyến đi Thụy Sỹ vừa rồi thực sự là một giấc mơ. Từ khách sạn đến phương tiện di chuyển đều hoàn hảo. Đội ngũ VoyagerElite rất tận tâm!”
                  </p>
                </div>

                {/* Profile row */}
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center font-bold text-violet-600 dark:text-violet-400 text-sm tracking-wide shrink-0">
                    NT
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-950 dark:text-white">Nguyễn Thành</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Doanh nhân</p>
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
                    “Tôi đã đặt tour riêng đi Santorini qua VoyagerElite. Dịch vụ độc bản đúng như mô tả và chúng tôi không phải lo nghĩ bất cứ điều gì!”
                  </p>
                </div>

                {/* Profile row */}
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-sm tracking-wide shrink-0">
                    ML
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-950 dark:text-white">Minh Lan</h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Nhiếp ảnh gia</p>
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
