"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Heart, MapPin, Calendar, Star, Trash2 } from 'lucide-react';
import { getFavorites, setFavorites, SavedTour } from '@/lib/tourStorage';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [favorites, setFavoriteState] = useState<SavedTour[]>([]);

  useEffect(() => {
    setFavoriteState(getFavorites());
  }, []);

  const removeFavorite = (id: string) => {
    const next = favorites.filter((tour) => tour.id !== id);
    setFavoriteState(next);
    setFavorites(next);
  };

  return (
    <div className={`min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans transition-colors duration-300 flex flex-col ${theme === 'dark' ? 'dark text-white' : 'text-slate-900'}`}>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-left mb-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-red-600 dark:bg-red-950/30 dark:text-red-300">
            <Heart className="size-3.5 fill-red-500 text-red-500" />
            Tour yêu thích
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 dark:text-white">Danh sách tour đã lưu</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Các tour bạn đã bấm tim sẽ xuất hiện ở đây.</p>
        </div>

        {favorites.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center shadow-sm">
            <Heart className="mx-auto size-12 text-slate-300 dark:text-slate-600" />
            <p className="mt-4 text-lg font-black text-slate-900 dark:text-white">Chưa có tour yêu thích</p>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">Bấm tim ở card tour hoặc trang chi tiết tour để lưu lại.</p>
            <button onClick={() => router.push('/tours')} className="mt-6 rounded-full bg-blue-900 px-6 py-3 text-sm font-bold text-white dark:bg-blue-600">
              Khám phá tour
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {favorites.map((tour) => (
              <article key={tour.id} className="overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="relative h-56">
                  <ImageWithFallback src={tour.image} alt={tour.title} className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeFavorite(tour.id)}
                    className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-black text-red-600 shadow-md backdrop-blur-sm"
                  >
                    <Trash2 className="size-4" />
                    Bỏ tim
                  </button>
                </div>
                <div className="p-6 text-left">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <MapPin className="size-3.5 text-blue-600" />
                    <span>{tour.location}</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">{tour.title}</h2>
                  <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {tour.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {tour.rating}
                    </span>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5">
                    <p className="text-lg font-black text-blue-900 dark:text-blue-400">{tour.price.toLocaleString('vi-VN')}đ</p>
                    <button
                      onClick={() => router.push(`/tour/${tour.id}`)}
                      className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white dark:bg-blue-600"
                    >
                      Xem tour
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
