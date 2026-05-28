"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { MapPin, Calendar, Star, Plane, SlidersHorizontal, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <Plane className="size-8 text-blue-600" />
              <span className="text-2xl text-gray-900 font-bold">TravelHub</span>
            </div>
            <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
              ← Quay lại
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="text-left">
            <h1 className="text-3xl text-gray-900 mb-2 font-bold">
              {destination ? `Kết quả tìm kiếm: "${destination}"` : 'Tất cả các tour'}
            </h1>
            <p className="text-gray-600">{toursToShow.length} tour được tìm thấy</p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 bg-white">
            <SlidersHorizontal className="size-5" />
            Bộ lọc
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="size-10 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600 text-lg">Đang tải danh sách tour...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {toursToShow.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow group cursor-pointer"
                  onClick={() => navigate(`/tour/${tour.id}`)}
                >
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      src={tour.image}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full">
                      <span className="text-sm font-semibold">⭐ {tour.rating}</span>
                    </div>
                  </div>

                  <div className="p-6 text-left">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <MapPin className="size-4" />
                      <span className="text-sm">{tour.location}</span>
                    </div>

                    <h3 className="text-xl text-gray-900 mb-3 font-semibold">{tour.title}</h3>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="size-4" />
                        <span className="text-sm">{tour.duration}</span>
                      </div>
                      <span className="text-xs text-gray-500">{tour.reviews} đánh giá</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-left">
                        <span className="text-xs text-gray-500">Từ</span>
                        <p className="text-2xl text-blue-600 font-bold">{tour.price.toLocaleString('vi-VN')}đ</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tour/${tour.id}`);
                        }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {toursToShow.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-4">Không tìm thấy tour nào phù hợp</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Về trang chủ
                </button>
              </div>
            )}
          </>
        )}
      </div>
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
