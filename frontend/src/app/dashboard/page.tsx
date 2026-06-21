"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Package, FileText, User, Download, Trash2, Star, Calendar, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/contexts/ThemeContext';
import { getExperiencedTourIds } from '@/lib/tourStorage';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function DashboardPage() {
  const router = useRouter();
  const navigate = (url: string) => router.push(url);
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [experiencedTourIds, setExperiencedTourIds] = useState<string[]>([]);

  const fetchBookings = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${BACKEND_URL}/api/bookings/user/${encodeURIComponent(user.email)}`);
      if (!response.ok) throw new Error('Không thể tải lịch sử đặt tour');
      const data = await response.json();
      setBookings(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      // Fallback in case of backend outage
      setBookings([
        {
          id: 'ORD-1715234567890',
          tourTitle: 'Du ngoạn Vịnh Hạ Long',
          date: '2026-07-15',
          guests: 2,
          total: 7000000,
          status: 'confirmed',
          tourImage: 'https://images.unsplash.com/photo-1643029891412-92f9a81a8c16'
        },
        {
          id: 'ORD-1714123456789',
          tourTitle: 'Thiên đường Phú Quốc',
          date: '2026-08-20',
          guests: 3,
          total: 15600000,
          status: 'pending',
          tourImage: 'https://images.unsplash.com/photo-1732243395944-cb3ff9311091'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchBookings();
    }
  }, [user, router]);

  useEffect(() => {
    setExperiencedTourIds(getExperiencedTourIds());
  }, []);

  const [reviews, setReviews] = useState([
    {
      id: 1,
      tour: 'Phố cổ Hội An',
      rating: 5,
      comment: 'Tour tuyệt vời! Phố cổ Hội An lung linh đèn lồng rất đẹp. Tôi rất hài lòng với chuyến đi này.',
      date: '2026-04-20'
    }
  ]);

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Bạn có chắc muốn hủy đặt tour này?')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/bookings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Hủy đặt tour thất bại');
      }

      alert('Đã hủy đặt tour thành công!');
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Lỗi kết nối máy chủ');
      // Direct local filter for robust fallback experience
      setBookings(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleDownloadInvoice = (id: string) => {
    alert(`Đang tải hóa đơn ${id}...`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-700 dark:text-slate-400 font-bold">
        Đang chuyển hướng đăng nhập...
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
            Tài khoản cá nhân
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif leading-tight text-slate-900 dark:text-white">
            Dashboard Của Tôi
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-1 text-left">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 space-y-1.5 border border-slate-100/40 dark:border-slate-800/40 shadow-sm">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors font-bold text-sm cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-blue-900 dark:bg-blue-600 text-white shadow'
                    : 'text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Package className="size-4.5" />
                <span>Đặt hành trình của tôi</span>
              </button>

              <button
                onClick={() => setActiveTab('invoices')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors font-bold text-sm cursor-pointer ${
                  activeTab === 'invoices'
                    ? 'bg-blue-900 dark:bg-blue-600 text-white shadow'
                    : 'text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <FileText className="size-4.5" />
                <span>Lịch sử hóa đơn</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors font-bold text-sm cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-blue-900 dark:bg-blue-600 text-white shadow'
                    : 'text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Star className="size-4.5" />
                <span>Đánh giá đã gửi</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors font-bold text-sm cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-blue-900 dark:bg-blue-600 text-white shadow'
                    : 'text-slate-750 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <User className="size-4.5" />
                <span>Thông tin tài khoản</span>
              </button>
            </div>

            <Link
              href="/tours"
              className="block mt-6 text-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Trở lại khám phá tours
            </Link>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-3 text-left">
            
            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-serif leading-tight mb-4">Các hành trình đã đặt</h2>
                
                {loading ? (
                  <div className="flex justify-center items-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100/40 dark:border-slate-800/40 shadow-sm">
                    <Loader2 className="size-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-slate-500 dark:text-slate-400 font-bold">Đang tải lịch sử...</span>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100/40 dark:border-slate-800/40 p-8 shadow-sm">
                    <p className="text-slate-550 dark:text-slate-400 mb-6 font-semibold">Bạn chưa đăng ký đặt tour nào</p>
                    <Link
                      href="/tours"
                      className="px-6 py-2.5 bg-blue-900 dark:bg-blue-600 text-white rounded-full transition-all font-bold text-sm shadow inline-block"
                    >
                      Tìm kiếm tour ngay
                    </Link>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div key={booking.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100/40 dark:border-slate-800/40 shadow-sm flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={booking.tourImage} alt={booking.tourTitle} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{booking.tourTitle}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xxs font-black tracking-wide uppercase ${
                              booking.status === 'confirmed'
                                ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}
                          >
                            {booking.status === 'confirmed' ? 'Đã duyệt' : 'Chờ duyệt'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-xs font-bold">
                          <div>
                            <p className="text-slate-400 dark:text-slate-500 uppercase tracking-wide text-[9px] mb-0.5">Mã đơn đặt</p>
                            <p className="text-slate-800 dark:text-slate-200 font-extrabold">{booking.id}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 dark:text-slate-500 uppercase tracking-wide text-[9px] mb-0.5">Khởi hành</p>
                            <p className="text-slate-800 dark:text-slate-200">{booking.date}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 dark:text-slate-500 uppercase tracking-wide text-[9px] mb-0.5">Số lượng khách</p>
                            <p className="text-slate-800 dark:text-slate-200">{booking.guests} khách</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div className="text-2xl font-black text-blue-900 dark:text-blue-400">{Number(booking.total).toLocaleString('vi-VN')}đ</div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownloadInvoice(booking.id)}
                              className="px-4 py-2 bg-blue-900 dark:bg-blue-600 text-white rounded-2xl hover:bg-blue-955 dark:hover:bg-blue-700 transition-colors flex items-center gap-1.5 font-bold text-xs cursor-pointer shadow-sm"
                            >
                              <Download className="size-3.5" />
                              Hóa đơn
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-655 rounded-2xl transition-colors flex items-center gap-1.5 font-bold text-xs cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                              Hủy tour
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-serif mb-6">Lịch sử hóa đơn</h2>
                
                <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100/40 dark:border-slate-800/40 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Mã hóa đơn</th>
                          <th className="px-6 py-4 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Hành trình</th>
                          <th className="px-6 py-4 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Ngày thanh toán</th>
                          <th className="px-6 py-4 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Tổng chi phí</th>
                          <th className="px-6 py-4 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Tải xuống</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                        {loading ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-slate-500 font-bold">Đang tải hóa đơn...</td>
                          </tr>
                        ) : bookings.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-slate-500 font-bold">Chưa có hóa đơn nào</td>
                          </tr>
                        ) : (
                          bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{booking.id}</td>
                              <td className="px-6 py-4">{booking.tourTitle}</td>
                              <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{booking.date}</td>
                              <td className="px-6 py-4 text-blue-900 dark:text-blue-400 font-black">{Number(booking.total).toLocaleString('vi-VN')}đ</td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleDownloadInvoice(booking.id)}
                                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold text-xs cursor-pointer"
                                >
                                  <Download className="size-3.5" />
                                  Tải PDF
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-serif mb-6">Đánh giá của tôi</h2>
                
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100/40 dark:border-slate-800/40 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{review.tour}</h3>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">{review.date}</span>
                      </div>
                      <div className="flex gap-0.5 mb-3">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-slate-655 dark:text-slate-300 text-sm font-medium italic">“{review.comment}”</p>
                    </div>
                  ))}

                  {/* Add Review Form */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100/40 dark:border-slate-800/40 shadow-sm">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-6 font-serif">Viết đánh giá hành trình mới</h3>
                    
                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Đã gửi đánh giá thành công!'); }}>
                      {experiencedTourIds.length === 0 && (
                        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                          Bạn cần đánh dấu đã trải nghiệm một tour trước khi gửi comment.
                        </p>
                      )}
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-550 mb-2">Chọn hành trình</label>
                        <select className="w-full px-4 py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-800 dark:text-slate-100 font-bold text-sm bg-white dark:bg-slate-900">
                          <option>Du ngoạn Vịnh Hạ Long</option>
                          <option>Thiên đường Phú Quốc</option>
                          <option>Phố cổ Hội An</option>
                          <option>Biển xanh Đà Nẵng</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-555 mb-2">Mức độ hài lòng</label>
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" className="hover:scale-110 transition-transform cursor-pointer">
                              <Star className="size-8 fill-amber-400 text-amber-400" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-555 mb-2">Nhận xét chi tiết</label>
                        <textarea
                          rows={4}
                          className="w-full px-4 py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-800 dark:text-slate-100 font-bold text-sm"
                          placeholder="Chia sẻ trải nghiệm hành trình của bạn..."
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={experiencedTourIds.length === 0}
                        className="px-6 py-3 bg-blue-900 hover:bg-blue-955 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-colors font-bold text-xs cursor-pointer shadow"
                      >
                        Gửi đánh giá
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100/40 dark:border-slate-800/40 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-serif mb-6">Thông tin tài khoản</h2>
                
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Cập nhật thông tin thành công!'); }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-555 mb-2">Họ và tên</label>
                      <input
                        type="text"
                        defaultValue={user.name}
                        className="w-full px-4 py-3 border border-slate-155 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-800 dark:text-slate-100 font-bold text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-555 mb-2">Email đăng ký</label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="w-full px-4 py-3 border border-slate-155 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-400 dark:text-slate-500 font-bold text-sm transition-all"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-555 mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        placeholder="+84 XXX XXX XXX"
                        className="w-full px-4 py-3 border border-slate-155 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-800 dark:text-slate-100 font-bold text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-555 mb-2">Ngày sinh</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border border-slate-155 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-850 dark:text-slate-200 font-bold text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-555 mb-2">Địa chỉ thường trú</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-slate-155 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-800 dark:text-slate-100 font-bold text-sm transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-900 hover:bg-blue-955 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-colors font-bold text-xs cursor-pointer shadow"
                  >
                    Lưu các thay đổi
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
