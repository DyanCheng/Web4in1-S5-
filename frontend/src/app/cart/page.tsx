"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Trash2, Plus, Minus, ShoppingCart, Plane } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const navigate = (url: string) => router.push(url);
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const { isAuthenticated } = useAuth();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <Plane className="size-8 text-blue-600" />
                <span className="text-2xl text-gray-900 font-bold">TravelHub</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center justify-center size-24 bg-gray-100 rounded-full mb-6">
            <ShoppingCart className="size-12 text-gray-400" />
          </div>
          <h1 className="text-3xl text-gray-900 mb-4 font-bold">Giỏ hàng trống</h1>
          <p className="text-gray-600 mb-8">Bạn chưa có tour nào trong giỏ hàng</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
          >
            Khám phá các tour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <Plane className="size-8 text-blue-600" />
              <span className="text-2xl text-gray-900 font-bold">TravelHub</span>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">← Tiếp tục mua</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl text-gray-900 mb-8 font-bold text-left">Giỏ hàng của bạn</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-6 text-left">
                <div className="flex gap-4">
                  <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl text-gray-900 mb-2 font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 font-medium">Ngày: {item.date}</p>
                    <p className="text-sm text-gray-600 mb-4 font-medium">Số người: {item.guests}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="size-8 border rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                        >
                          <Minus className="size-4 text-gray-600" />
                        </button>
                        <span className="text-gray-900 w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="size-8 border rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                        >
                          <Plus className="size-4 text-gray-600" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-2xl text-blue-600 font-bold">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 cursor-pointer"
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

          {/* Summary */}
          <div className="lg:col-span-1 text-left">
            <div className="bg-white rounded-xl p-6 sticky top-8 shadow-sm border border-gray-100">
              <h2 className="text-xl text-gray-900 mb-6 font-bold">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm font-medium">Tạm tính</span>
                  <span className="text-gray-900 font-semibold">{total.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm font-medium">Phí dịch vụ</span>
                  <span className="text-gray-900 font-semibold">0đ</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Tổng cộng</span>
                  <span className="text-blue-600">{total.toLocaleString('vi-VN')}đ</span>
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
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4 font-semibold cursor-pointer"
              >
                {isAuthenticated ? 'Thanh toán' : 'Đăng nhập để thanh toán'}
              </button>

              <div className="text-center">
                <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                  ← Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
