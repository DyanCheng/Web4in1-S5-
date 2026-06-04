"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { MapPin, Calendar, Star, SlidersHorizontal, Loader2 } from 'lucide-react';
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
}

function ToursPageInner() {
  const router = useRouter();
  const navigate = (url: string) => router.push(url);
  const searchParams = useSearchParams();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { theme } = useTheme();

  const destination = searchParams.get('destination') || '';

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const url = destination
          ? `${BACKEND_URL}/api/tours?search=${encodeURIComponent(destination)}`
          : `${BACKEND_URL}/api/tours`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Không thể tải danh sách tour');
        const data = await response.json();
        setTours(data);
      } catch (err: any) {
        setError(err.message);
        // Fallback to static data if backend is unavailable
        setTours([
          { id: '1', title: "Du ngoạn Vịnh Hạ Long", location: "Quảng Ninh", price: 3500000, duration: "2 ngày 1 đêm", image: "https://images.unsplash.com/photo-1643029891412-92f9a81a8c16", rating: 4.9, reviews: 1234 },
          { id: '2', title: "Thiên đường Phú Quốc", location: "Kiên Giang", price: 5200000, duration: "4 ngày 3 đêm", image: "https://images.unsplash.com/photo-1732243395944-cb3ff9311091", rating: 4.8, reviews: 892 },
          { id: '3', title: "Mù Cang Chải - Sa Pa", location: "Lào Cai", price: 4800000, duration: "3 ngày 2 đêm", image: "https://images.unsplash.com/photo-1649530928914-c2df337e3007", rating: 4.9, reviews: 756 },
          { id: '4', title: "Biển xanh Đà Nẵng", location: "Đà Nẵng", price: 3200000, duration: "3 ngày 2 đêm", image: "https://images.unsplash.com/photo-1723142282970-1fd415eec1ad", rating: 4.7, reviews: 1089 },
          { id: '5', title: "Phố cổ Hội An", location: "Quảng Nam", price: 2800000, duration: "2 ngày 1 đêm", image: "https://images.unsplash.com/photo-1664650440553-ab53804814b3", rating: 5.0, reviews: 1456 },
          { id: '6', title: "Nha Trang - Vịnh xanh", location: "Khánh Hòa", price: 3900000, duration: "3 ngày 2 đêm", image: "https://images.unsplash.com/photo-1533002832-1721d16b4bb9", rating: 4.8, reviews: 967 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [destination]);

  const toursToShow = destination
    ? tours.filter(t =>
        t.location.toLowerCase().includes(destination.toLowerCase()) ||
        t.title.toLowerCase().includes(destination.toLowerCase())
      )
    : tours;

  return (
    <div className={`min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans transition-colors duration-300 flex flex-col ${
      theme === 'dark' ? 'dark text-white' : 'text-slate-900'
    }`}>
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4 text-left">
          <div>
            <span className="inline-block px-4 py-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-full border border-blue-100/30 uppercase tracking-widest mb-3">
              Travel Booking Tours
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif leading-tight text-slate-900 dark:text-white">
              {destination ? `Kết quả tìm kiếm: "${destination}"` : 'Hành Trình Khám Phá'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-semibold">
              Tìm thấy {toursToShow.length} hành trình độc bản dành cho bạn
            </p>
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-55 dark:hover:bg-slate-800 transition-all font-bold text-sm text-slate-700 dark:text-slate-200 cursor-pointer shadow-sm">
            <SlidersHorizontal className="size-4" />
            Bộ lọc nâng cao
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="size-10 text-blue-600 animate-spin" />
            <span className="mt-4 text-slate-500 dark:text-slate-400 font-bold">Đang tải danh sách hành trình...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {toursToShow.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100/40 dark:border-slate-800/40 hover:-translate-y-1 cursor-pointer group flex flex-col h-full"
                  onClick={() => navigate(`/tour/${tour.id}`)}
                >
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      src={tour.image}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-slate-950/65 backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-md text-white font-bold text-xs flex items-center gap-1">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      <span>{tour.rating}</span>
                    </div>
                  </div>

                  <div className="p-6 text-left flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 mb-2 font-bold text-xs uppercase tracking-wider">
                      <MapPin className="size-3.5 text-blue-600" />
                      <span>{tour.location}</span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tour.title}
                    </h3>

                    <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 text-xs font-semibold mb-6">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3.5" />
                        <span>{tour.duration}</span>
                      </div>
                      <span>•</span>
                      <span>{tour.reviews} đánh giá</span>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800 mt-auto">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">Giá từ</span>
                        <p className="text-2xl font-black text-blue-900 dark:text-blue-400 leading-none mt-1">
                          {tour.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tour/${tour.id}`);
                        }}
                        className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-colors font-bold text-xs cursor-pointer shadow-md"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {toursToShow.length === 0 && (
              <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100/40 dark:border-slate-800/40 p-8 shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 mb-6 font-semibold">Không tìm thấy tour nào phù hợp với yêu cầu của bạn</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-3 bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full transition-all font-bold text-sm shadow-md cursor-pointer"
                >
                  Quay lại trang chủ
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function ToursPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-700">Đang tải danh sách tour...</div>}>
      <ToursPageInner />
    </Suspense>
  );
}
