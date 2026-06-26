"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';

export default function CartPage() {
  const router = useRouter();
  const navigate = (url: string) => router.push(url);
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  if (items.length === 0) {
    return (
      <div className={`min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans transition-colors duration-300 flex flex-col ${
        theme === 'dark' ? 'dark text-white' : 'text-slate-900'
      }`}>
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center flex-1 flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center size-20 bg-slate-100 dark:bg-slate-900 rounded-full mb-6 text-slate-400">
            <ShoppingCart className="size-10" />
          </div>
          <h1 className="text-3xl font-black font-serif text-slate-900 dark:text-white mb-3">Giỏ hàng trống</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-semibold text-sm">Bạn chưa chọn hành trình nào cho mình</p>
          <button
            onClick={() => navigate('/tours')}
            className="px-8 py-3.5 bg-blue-900 hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full transition-all font-bold text-sm shadow-md cursor-pointer"
          >
            Khám phá các tour
          </button>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50/50 dark:bg-slate-955 font-sans transition-colors duration-300 flex flex-col ${
      theme === 'dark' ? 'dark text-white' : 'text-slate-900'
    }`}>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="text-left mb-10">
          <span className="inline-block px-4 py-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-full border border-blue-100/30 uppercase tracking-widest mb-3">
            Giỏ hàng của bạn
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif leading-tight text-slate-900 dark:text-white">
            Danh Sách Đã Chọn
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100/40 dark:border-slate-800/40 shadow-sm text-left">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-36 h-36 rounded-2xl overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                        {item.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 dark:text-slate-500 mb-4">
                        <span>Ngày khởi hành: {item.date}</span>
                        <span>•</span>
                        <span>Số lượng khách: {item.guests} người</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      
                      {/* Quantity controllers */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="size-8 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <Minus className="size-3.5 text-slate-655 dark:text-slate-350" />
                        </button>
                        <span className="text-slate-900 dark:text-white w-6 text-center font-bold text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="size-8 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <Plus className="size-3.5 text-slate-655 dark:text-slate-355" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-black text-blue-900 dark:text-blue-400">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-655 cursor-pointer p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors"
                        >
                          <Trash2 className="size-5" />
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-1 text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sticky top-24 shadow-sm border border-slate-100/40 dark:border-slate-800/40">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 font-serif">Tóm tắt đơn hàng</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">Tạm tính</span>
                  <span className="text-slate-900 dark:text-slate-200">{total.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">Phí dịch vụ</span>
                  <span className="text-slate-900 dark:text-slate-200">0đ</span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between text-lg font-bold">
                  <span className="text-slate-900 dark:text-white">Tổng cộng</span>
                  <span className="text-blue-900 dark:text-blue-400 font-black">{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    navigate('/checkout');
                  }
                }}
                className="w-full py-3.5 bg-blue-900 hover:bg-blue-955 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-all mb-4 font-bold text-sm shadow-md cursor-pointer text-center"
              >
                {isAuthenticated ? 'Thanh toán' : 'Đăng nhập để thanh toán'}
              </button>

              <div className="text-center">
                <Link href="/tours" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold">
                  ← Tiếp tục tìm kiếm tour
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
