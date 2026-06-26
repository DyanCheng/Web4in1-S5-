"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Heart, MapPin, Calendar, Star, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { getFavorites, setFavorites, SavedTour } from '@/lib/tourStorage';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [favorites, setFavoriteState] = useState<SavedTour[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    setFavoriteState(getFavorites());
  }, []);

  const removeFavorite = (id: string) => {
    setRemoving(id);
    setTimeout(() => {
      const next = favorites.filter((tour) => tour.id !== id);
      setFavoriteState(next);
      setFavorites(next);
      setRemoving(null);
    }, 350);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 flex flex-col ${theme === 'dark' ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Header />

      {/* Hero banner */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 py-14 overflow-hidden">
        <div className="absolute inset-0 opacity-10 select-none pointer-events-none">
          <div className="absolute top-4 right-20 text-8xl">❤️</div>
          <div className="absolute bottom-4 left-10 text-7xl">✨</div>
          <div className="absolute top-1/2 left-1/3 text-6xl -translate-y-1/2 rotate-12">💝</div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Heart className="size-3.5 fill-white" />
            Tour Yêu Thích
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight drop-shadow-md">
            Hành Trình <span className="text-blue-200">Đã Lưu</span>
          </h1>
          <p className="mt-3 text-white/75 text-lg font-medium">
            {favorites.length > 0
              ? `Bạn đang lưu ${favorites.length} tour yêu thích`
              : 'Bấm tim vào tour bất kỳ để lưu lại tại đây'}
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14">
        {favorites.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <div className="size-28 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
                <Heart className="size-12 text-blue-400 dark:text-blue-500" />
              </div>
              <div className="absolute -top-1 -right-1 size-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="size-4 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Chưa có tour yêu thích</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mb-8">
              Hãy khám phá những tour tuyệt vời và bấm tim để lưu lại. Danh sách yêu thích của bạn sẽ hiện ra ở đây!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/tours')}
                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-extrabold shadow-lg shadow-blue-500/20 transition-all"
              >
                <Sparkles className="size-4" />
                Khám phá tour ngay
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-6 py-3.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl font-bold transition-all"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Danh sách yêu thích</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{favorites.length} tour đã lưu</p>
              </div>
              <button
                onClick={() => router.push('/tours')}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl font-bold text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800"
              >
                <Heart className="size-4 fill-blue-500 text-blue-500" />
                Thêm tour mới
              </button>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {favorites.map((tour) => (
                <article
                  key={tour.id}
                  className={`group overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-350 flex flex-col ${
                    removing === tour.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}
                  style={{ transition: 'opacity 0.35s, transform 0.35s' }}
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <ImageWithFallback
                      src={tour.image}
                      alt={tour.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Remove button */}
                    <button
                      onClick={() => removeFavorite(tour.id)}
                      className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-2 text-xs font-bold text-blue-600 shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                      Bỏ lưu
                    </button>

                    {/* Heart badge */}
                    <div className="absolute top-4 left-4 size-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-md">
                      <Heart className="size-4 fill-white text-white" />
                    </div>

                    {/* Location on image */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-white/90" />
                      <span className="text-white text-xs font-bold drop-shadow">{tour.location}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 text-left flex flex-col flex-1">
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tour.title}
                    </h2>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-blue-400" />
                        {tour.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Star className="size-3.5 fill-blue-400 text-blue-400" />
                        {tour.rating}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Giá từ</p>
                        <p className="text-xl font-black text-blue-600 dark:text-blue-400 leading-none mt-1">
                          {tour.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/tour/${tour.id}`)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl font-bold text-sm transition-all shadow-md group-hover:shadow-blue-500/30"
                      >
                        Xem tour <ArrowRight className="size-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-14 text-center">
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-4">Muốn tìm thêm tour phù hợp?</p>
              <button
                onClick={() => router.push('/tours')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-extrabold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
              >
                <Sparkles className="size-5" />
                Khám phá thêm tour
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
