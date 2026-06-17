"use client";
import Image from "next/image"
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  BarChart3,
  Bell,
  CheckCircle2,
  DollarSign,
  Edit,
  Loader2,
  Plus,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Trash2,
  Users,
  Sun,
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5200';

interface Tour {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  duration: string;
  image: string;
}

interface Booking {
  id: string;
  tourId: string;
  tourTitle: string;
  tourImage: string;
  userId: string;
  userEmail: string;
  date: string;
  guests: number;
  total: number;
  status: string;
}

const sidebarItems = [
  { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
  { id: 'tours', label: 'Quản lý tour', icon: ShoppingBag },
  { id: 'orders', label: 'Đơn đặt chỗ', icon: CheckCircle2 },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'tours' | 'orders' | 'settings'>('overview');
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const toursResponse = await fetch(`${BACKEND_URL}/api/tours`);
      const bookingsResponse = await fetch(`${BACKEND_URL}/api/bookings`);
      const toursData = toursResponse.ok ? await toursResponse.json() : [];
      const bookingsData = bookingsResponse.ok ? await bookingsResponse.json() : [];
      setTours(toursData.length ? toursData : [
        { id: '1', title: 'Du ngoạn Vịnh Hạ Long', location: 'Quảng Ninh', price: 3500000, duration: '2 ngày 1 đêm', image: 'https://images.unsplash.com/photo-1643029891412-92f9a81a8c16', rating: 4.9, reviews: 1234 },
        { id: '2', title: 'Thiên đường Phú Quốc', location: 'Kiên Giang', price: 5200000, duration: '4 ngày 3 đêm', image: 'https://images.unsplash.com/photo-1732243395944-cb3ff9311091', rating: 4.8, reviews: 892 },
        { id: '3', title: 'Mù Cang Chải - Sa Pa', location: 'Lào Cai', price: 4800000, duration: '3 ngày 2 đêm', image: 'https://images.unsplash.com/photo-1649530928914-c2df337e3007', rating: 4.9, reviews: 756 },
        { id: '4', title: 'Biển xanh Đà Nẵng', location: 'Đà Nẵng', price: 3200000, duration: '3 ngày 2 đêm', image: 'https://images.unsplash.com/photo-1723142282970-1fd415eec1ad', rating: 4.7, reviews: 1089 },
        { id: '5', title: 'Phố cổ Hội An', location: 'Quảng Nam', price: 2800000, duration: '2 ngày 1 đêm', image: 'https://images.unsplash.com/photo-1664650440553-ab53804814b3', rating: 5.0, reviews: 1456 },
        { id: '6', title: 'Nha Trang - Vịnh xanh', location: 'Khánh Hòa', price: 3900000, duration: '3 ngày 2 đêm', image: 'https://images.unsplash.com/photo-1533002832-1721d16b4bb9', rating: 4.8, reviews: 967 },
      ]);
      setBookings(bookingsData.length ? bookingsData : [
        { id: 'ORD-1715234567890', tourId: '1', tourTitle: 'Du ngoạn Vịnh Hạ Long', tourImage: 'https://images.unsplash.com/photo-1643029891412-92f9a81a8c16', userId: '3', userEmail: 'user@travelhub.com', date: '2026-07-15', guests: 2, total: 7000000, status: 'confirmed' },
        { id: 'ORD-1714123456789', tourId: '2', tourTitle: 'Thiên đường Phú Quốc', tourImage: 'https://images.unsplash.com/photo-1732243395944-cb3ff9311091', userId: '3', userEmail: 'user@travelhub.com', date: '2026-08-20', guests: 3, total: 15600000, status: 'pending' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, router]);

  const filteredTours = useMemo(
    () =>
      tours.filter((tour) =>
        tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.location.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, tours]
  );

  const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.total), 0);
  const pendingBookings = bookings.filter((booking) => booking.status !== 'confirmed').length;
  const uniqueCustomers = new Set(bookings.map((booking) => booking.userEmail)).size;

  const handleConfirmBooking = (id: string) => {
    setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking, status: 'confirmed' } : booking)));
  };

  const handleDeleteBooking = (id: string) => {
    if (!confirm('Bạn có chắc muốn hủy đơn này?')) return;
    setBookings((prev) => prev.filter((booking) => booking.id !== id));
  };

  const handleDeleteTour = (id: string) => {
    if (!confirm('Bạn muốn xóa tour này?')) return;
    setTours((prev) => prev.filter((tour) => tour.id !== id));
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold">
        Đang chuyển hướng quyền truy cập...
      </div>
    );
  }

  const stats = [
    { label: 'Tổng doanh thu', value: `${totalRevenue.toLocaleString('vi-VN')}đ`, icon: DollarSign, accent: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30' },
    { label: 'Tổng lượt đặt', value: bookings.length.toString(), icon: ShoppingBag, accent: 'from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30' },
    { label: 'Khách hàng', value: uniqueCustomers.toString(), icon: Users, accent: 'from-violet-50 to-violet-100 dark:from-violet-950/50 dark:to-violet-900/30' },
    { label: 'Đang chờ xử lý', value: pendingBookings.toString(), icon: Shield, accent: 'from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30' },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex ${theme === 'dark' ? 'dark' : ''}`}>
      <aside className="hidden xl:flex w-70 flex-col border-r border-slate-200/70 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="p-8">
          <div className="text-left">
            <h1 className="text-3xl font-black text-blue-700 dark:text-blue-400 font-serif">CMC Travel</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Bảng quản trị</p>
          </div>
        </div>

        <nav className="px-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                aria-label={item.label}
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 rounded-2xl px-4 py-4 text-left font-semibold transition-colors ${
                  active
                    ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/70'
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-6 border-t border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div className="text-left">
              <p className="font-bold">{user.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Quản trị hệ thống</p>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <Link href="/" className="block text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600">
              Về trang chủ
            </Link>
            <button aria-label="Logout" onClick={logout} className="block text-sm font-semibold text-red-500 hover:text-red-600">
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <header className="sticky top-0 z-20 border-b border-slate-200/70 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-black font-serif">Tổng quan quản trị</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Chào mừng trở lại. Đây là những gì đang diễn ra hôm nay.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold"
              >
                <Sun className="size-4" />
                Giao diện
              </button>
              <button aria-label="Create new booking" className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-md">
                <Plus className="size-4" />
                Đặt chỗ mới
              </button>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className={`rounded-3xl p-6 bg-linear-to-br ${stat.accent} shadow-sm border border-white/60 dark:border-slate-800`}>
                      <div className="flex items-start justify-between">
                        <div className="size-12 rounded-2xl bg-white/70 dark:bg-slate-900/70 flex items-center justify-center text-blue-700 dark:text-blue-300">
                          <Icon className="size-5" />
                        </div>
                        <span className="rounded-full bg-white/70 dark:bg-slate-900/70 px-3 py-1 text-xs font-bold text-slate-500 dark:text-slate-300">Hôm nay</span>
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{stat.label}</p>
                      <p className="mt-2 text-2xl font-black">{stat.value}</p>
                    </div>
                  );
                })}
              </section>

              <section className="mt-8 grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6">
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black font-serif">Quản lý tour</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Danh sách tour hiện có trong hệ thống</p>
                    </div>
                    <div className="relative w-full max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm tour theo tên hoặc địa điểm..."
                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-11 py-3 text-sm font-semibold outline-none"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs">
                        <tr>
                          <th className="px-6 py-4 text-left">Tour</th>
                          <th className="px-6 py-4 text-left">Địa điểm</th>
                          <th className="px-6 py-4 text-left">Ngày đêm</th>
                          <th className="px-6 py-4 text-left">Giá</th>
                          <th className="px-6 py-4 text-left">Đánh giá</th>
                          <th className="px-6 py-4 text-left">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                        {filteredTours.map((tour) => (
                          <tr key={tour.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Image src={tour.image} alt={tour.title} className="size-12 rounded-xl object-cover" width={48} height={48} />
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white">{tour.title}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">ID: {tour.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{tour.location}</td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{tour.duration}</td>
                            <td className="px-6 py-4 font-black text-blue-700 dark:text-blue-400">{tour.price.toLocaleString('vi-VN')}đ</td>
                            <td className="px-6 py-4 text-amber-600 dark:text-amber-500 font-bold">★ {tour.rating} ({tour.reviews})</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <button aria-label="Edit tour" className="text-blue-600 hover:text-blue-700">
                                  <Edit className="size-4" />
                                </button>
                                <button aria-label="Delete tour" onClick={() => handleDeleteTour(tour.id)} className="text-red-500 hover:text-red-600">
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm p-6">
                    <h3 className="text-xl font-black font-serif mb-5">Thao tác nhanh</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Thêm đối tác', icon: Users },
                        { label: 'Chiến dịch', icon: Bell },
                        { label: 'Tuân thủ', icon: Shield },
                        { label: 'Báo cáo', icon: BarChart3 },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button key={item.label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-left hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                            <Icon className="size-5 text-blue-600 dark:text-blue-400" />
                            <p className="mt-3 text-sm font-semibold">{item.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm p-6">
                    <h3 className="text-xl font-black font-serif mb-5">Hoạt động gần đây</h3>
                    <div className="space-y-5 text-sm">
                      <div className="flex gap-3">
                        <div className="size-9 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">✓</div>
                        <div>
                          <p className="font-semibold">Việc xác minh Hotel Majestic đã hoàn tất bởi Sarah J.</p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">2 phút trước</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="size-9 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">i</div>
                        <div>
                          <p className="font-semibold">Lịch cập nhật hệ thống vào lúc 02:00 AM UTC.</p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">45 phút trước</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="size-9 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-600">!</div>
                        <div>
                          <p className="font-semibold">Thanh toán thất bại cho đơn đặt #89432.</p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">2 giờ trước</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black font-serif">Đơn đặt chỗ</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Phê duyệt hoặc hủy các đơn chờ xử lý</p>
                  </div>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{bookings.length} đơn</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs">
                      <tr>
                        <th className="px-6 py-4 text-left">Mã đơn</th>
                        <th className="px-6 py-4 text-left">Khách</th>
                        <th className="px-6 py-4 text-left">Tour</th>
                        <th className="px-6 py-4 text-left">Khởi hành</th>
                        <th className="px-6 py-4 text-left">Khách</th>
                        <th className="px-6 py-4 text-left">Tổng</th>
                        <th className="px-6 py-4 text-left">Trạng thái</th>
                        <th className="px-6 py-4 text-left">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                          <td className="px-6 py-4 font-bold">{booking.id}</td>
                          <td className="px-6 py-4">{booking.userEmail}</td>
                          <td className="px-6 py-4">{booking.tourTitle}</td>
                          <td className="px-6 py-4">{booking.date}</td>
                          <td className="px-6 py-4">{booking.guests} người</td>
                          <td className="px-6 py-4 font-black text-blue-700 dark:text-blue-400">{booking.total.toLocaleString('vi-VN')}đ</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              booking.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}>
                              {booking.status === 'confirmed' ? 'Đã duyệt' : 'Chờ duyệt'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {booking.status !== 'confirmed' && (
                                <button onClick={() => handleConfirmBooking(booking.id)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
                                  Duyệt
                                </button>
                              )}
                              <button onClick={() => handleDeleteBooking(booking.id)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
                                Hủy
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
