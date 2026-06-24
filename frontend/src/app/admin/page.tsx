"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import TourFormDialog, { type TourRecord } from '@/components/admin/TourFormDialog';
import RoomFormDialog, { type RoomRecord } from '@/components/admin/RoomFormDialog';
import {
  BarChart3,
  Bell,
  CheckCircle2,
  CreditCard,
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
  Building2,
} from 'lucide-react';
import { apiUrl, getBackendUrl, normalizeBackendUrl } from '@/lib/backendUrl';


const WEBHOOK_PUBLIC_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : normalizeBackendUrl(process.env.NEXT_PUBLIC_SEPAY_WEBHOOK_URL, getBackendUrl());


type Tour = TourRecord;

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

interface PaymentSummary {
  total_revenue: number;
  pending_count: number;
  paid_count: number;
  today_revenue: number;
}

interface PaymentTransaction {
  order_payment_id: number;
  payment_code: string;
  user_id: number | null;
  user_email: string;
  user_name: string | null;
  amount: number;
  payment_status: string;
  order_items: Array<{ title?: string; price?: number; quantity?: number; guests?: number; date?: string }>;
  booking_refs: string[];
  sepay_transaction_id: number | null;
  paid_at: string | null;
  created_at: string;
}


interface Room {
  id: number;
  name: string;
  type: string;
  price: number;
  beds: number;
  guests: number;
  status: string;
}

type AdminTab = 'overview' | 'tours' | 'orders' | 'payments' | 'hotels' | 'settings';


const sidebarItems = [
  { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
  { id: 'tours', label: 'Quản lý tour', icon: ShoppingBag },
  { id: 'orders', label: 'Đơn đặt chỗ', icon: CheckCircle2 },
  { id: 'payments', label: 'Thanh toán', icon: CreditCard },

  { id: 'hotels', label: 'Quản lý khách sạn', icon: Building2 },


  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [tourDialogOpen, setTourDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [tourActionLoading, setTourActionLoading] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomActionLoading, setRoomActionLoading] = useState(false);

  const adminHeaders = () => ({
    'Content-Type': 'application/json',
    'X-User-Role': user?.role ?? '',
  });
  const fetchData = async () => {
    try {
      setLoading(true);
      const [toursResponse, bookingsResponse, summaryResponse, transactionsResponse] = await Promise.all([
        fetch(apiUrl('/api/tours')),
        fetch(apiUrl('/api/bookings')),
        fetch(apiUrl('/api/payments/admin/summary')),
        fetch(apiUrl('/api/payments/admin/transactions')),
      ]);
      const toursData = toursResponse.ok ? await toursResponse.json() : [];
      const bookingsData = bookingsResponse.ok ? await bookingsResponse.json() : [];

      if (summaryResponse.ok) {
        setPaymentSummary(await summaryResponse.json());
      }
      if (transactionsResponse.ok) {
        setPaymentTransactions(await transactionsResponse.json());
      }

      setTours(toursData.length ? toursData : [
        { id: '1', title: 'Du ngoạn Vịnh Hạ Long', location: 'Quảng Ninh', price: 3500000, duration: '2 ngày 1 đêm', image: '#', rating: 4.9, reviews: 1234 },
        { id: '2', title: 'Thiên đường Phú Quốc', location: 'Kiên Giang', price: 5200000, duration: '4 ngày 3 đêm', image: '#', rating: 4.8, reviews: 892 },
        { id: '3', title: 'Mù Cang Chải - Sa Pa', location: 'Lào Cai', price: 4800000, duration: '3 ngày 2 đêm', image: '#', rating: 4.9, reviews: 756 },
        { id: '4', title: 'Biển xanh Đà Nẵng', location: 'Đà Nẵng', price: 3200000, duration: '3 ngày 2 đêm', image: '#', rating: 4.7, reviews: 1089 },
        { id: '5', title: 'Phố cổ Hội An', location: 'Quảng Nam', price: 2800000, duration: '2 ngày 1 đêm', image: '#', rating: 5.0, reviews: 1456 },
        { id: '6', title: 'Nha Trang - Vịnh xanh', location: 'Khánh Hòa', price: 3900000, duration: '3 ngày 2 đêm', image: '#', rating: 4.8, reviews: 967 },
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
    if (!user || user?.role !== 'admin') {
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

  const totalRevenue = paymentSummary?.total_revenue ?? bookings.reduce((sum, booking) => sum + Number(booking.total), 0);
  const pendingBookings = paymentSummary?.pending_count ?? bookings.filter((booking) => booking.status !== 'confirmed').length;
  const paidCount = paymentSummary?.paid_count ?? bookings.filter((booking) => booking.status === 'confirmed').length;
  const todayRevenue = paymentSummary?.today_revenue ?? 0;
  const uniqueCustomers = new Set([
    ...bookings.map((booking) => booking.userEmail),
    ...paymentTransactions.map((tx) => tx.user_email),
  ]).size;

  const filteredPayments = useMemo(
    () =>
      paymentTransactions.filter((tx) => {
        const query = paymentSearch.toLowerCase();
        const itemTitles = (tx.order_items || []).map((item) => item.title || '').join(' ').toLowerCase();
        return (
          tx.payment_code.toLowerCase().includes(query) ||
          tx.user_email.toLowerCase().includes(query) ||
          (tx.user_name || '').toLowerCase().includes(query) ||
          itemTitles.includes(query)
        );
      }),
    [paymentSearch, paymentTransactions]
  );

  const handleConfirmBooking = (id: string) => {
    setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking, status: 'confirmed' } : booking)));
  };

  const handleDeleteBooking = (id: string) => {
    if (!confirm('Bạn có chắc muốn hủy đơn này?')) return;
    setBookings((prev) => prev.filter((booking) => booking.id !== id));
  };

  const handleDeleteTour = async (id: string) => {
    if (!confirm('Bạn muốn xóa tour này?')) return;
    setTourActionLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/tours/${id}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Xóa tour thất bại');
      }
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa tour thất bại');
    } finally {
      setTourActionLoading(false);
    }
  };

  const handleSaveTour = async (payload: Record<string, unknown>) => {
    const url = editingTour
      ? `${BACKEND_URL}/api/tours/${editingTour.id}`
      : `${BACKEND_URL}/api/tours`;
    const response = await fetch(url, {
      method: editingTour ? 'PUT' : 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Lưu tour thất bại');
    }
    await fetchData();
  };

  const openCreateTour = () => {
    setEditingTour(null);
    setTourDialogOpen(true);
  };

  const openEditTour = (tour: Tour) => {
    setEditingTour(tour);
    setTourDialogOpen(true);
  };

  const handleDeleteRoom = async (id: number) => {
    if (!confirm('Bạn muốn xóa phòng này?')) return;
    setRoomActionLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms/${id}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Xóa phòng thất bại');
      }
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa phòng thất bại');
    } finally {
      setRoomActionLoading(false);
    }
  };

  const handleSaveRoom = async (payload: Record<string, unknown>) => {
    const url = editingRoom
      ? `${BACKEND_URL}/api/rooms/${editingRoom.id}`
      : `${BACKEND_URL}/api/rooms`;
    const response = await fetch(url, {
      method: editingRoom ? 'PUT' : 'POST',
      headers: adminHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Lưu phòng thất bại');
    }
    await fetchData();
  };

  const openCreateRoom = () => {
    setEditingRoom(null);
    setRoomDialogOpen(true);
  };

  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomDialogOpen(true);
  };

  if (!user || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-955 text-slate-600 dark:text-slate-400 font-bold">
        Đang chuyển hướng quyền truy cập...
      </div>
    );
  }

  const stats = [
    { label: 'Tổng doanh thu', value: `${Number(totalRevenue).toLocaleString('vi-VN')}đ`, icon: DollarSign, accent: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30' },
    { label: 'Doanh thu hôm nay', value: `${Number(todayRevenue).toLocaleString('vi-VN')}đ`, icon: BarChart3, accent: 'from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30' },
    { label: 'Đã thanh toán', value: paidCount.toString(), icon: CheckCircle2, accent: 'from-violet-50 to-violet-100 dark:from-violet-950/50 dark:to-violet-900/30' },
    { label: 'Chờ thanh toán', value: pendingBookings.toString(), icon: Shield, accent: 'from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/30' },
  ];

  const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
    overview: { title: 'Tổng quan quản trị', subtitle: 'Chào mừng trở lại. Đây là những gì đang diễn ra hôm nay.' },
    tours: { title: 'Quản lý tour', subtitle: 'Danh sách tour hiện có trong hệ thống.' },
    orders: { title: 'Đơn đặt chỗ', subtitle: 'Phê duyệt hoặc hủy các đơn chờ xử lý.' },
    payments: { title: 'Giao dịch thanh toán', subtitle: 'Theo dõi đơn SePay, trạng thái và chi tiết sản phẩm.' },

    hotels: { title: 'Quản lý khách sạn', subtitle: 'Quản lý phòng và trạng thái phòng.' },

    settings: { title: 'Cài đặt hệ thống', subtitle: 'Cấu hình chung cho nền tảng CMC Travel.' },
  };

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
                onClick={() => setActiveTab(item.id as AdminTab)}
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
              <h2 className="text-2xl sm:text-3xl font-black font-serif">{tabTitles[activeTab].title}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{tabTitles[activeTab].subtitle}</p>
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
              <button aria-label="Create new tour" onClick={openCreateTour} className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-md">
                <Plus className="size-4" />
                Thêm tour
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
              {(activeTab === 'overview' || activeTab === 'payments') && (
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
              )}

              {activeTab === 'overview' && (
              <section className="mt-8 grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6">
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200/70 dark:border-slate-800">
                    <h3 className="text-xl font-black font-serif">Giao dịch gần đây</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Các đơn thanh toán SePay mới nhất</p>
                  </div>
                  <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs">
                        <tr>
                          <th className="px-6 py-4 text-left">Mã thanh toán</th>
                          <th className="px-6 py-4 text-left">Khách</th>
                          <th className="px-6 py-4 text-left">Số tiền</th>
                          <th className="px-6 py-4 text-left">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                        {paymentTransactions.slice(0, 5).map((tx) => (
                          <tr key={tx.order_payment_id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                            <td className="px-6 py-4 font-bold">{tx.payment_code}</td>
                            <td className="px-6 py-4">{tx.user_email}</td>
                            <td className="px-6 py-4 font-black text-blue-700 dark:text-blue-400">{Number(tx.amount).toLocaleString('vi-VN')}đ</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                tx.payment_status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              }`}>
                                {tx.payment_status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {paymentTransactions.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">Chưa có giao dịch nào</td>
                          </tr>
                        )}
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
              )}

              {(activeTab === 'overview' || activeTab === 'tours') && (
              <section className={`${activeTab === 'tours' ? 'mt-0' : 'mt-8'} rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden`}>
                <div className="p-6 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-xl font-black font-serif">Quản lý tour</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Danh sách tour hiện có trong hệ thống</p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={openCreateTour}
                      className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white"
                    >
                      <Plus className="size-4" />
                      Thêm tour mới
                    </button>
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
                </div>
                <div className="overflow-x-auto overflow-y-auto max-h-[500px]">


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

                              {tour.image ? (
                                <img src={tour.image} alt={tour.title} className="size-12 rounded-xl object-cover" />
                              ) : (
                                <div className="size-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
                              )}


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

                              <button aria-label="Edit tour" onClick={() => openEditTour(tour)} disabled={tourActionLoading} className="text-blue-600 hover:text-blue-700 disabled:opacity-50">
                                <Edit className="size-4" />
                              </button>
                              <button aria-label="Delete tour" onClick={() => handleDeleteTour(tour.id)} disabled={tourActionLoading} className="text-red-500 hover:text-red-600 disabled:opacity-50">

                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredTours.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                            Chưa có tour nào. Bấm &quot;Thêm tour mới&quot; để tạo tour đầu tiên.
                          </td>
                        </tr>
                      )}

                    </tbody>
                  </table>
                </div>
              </section>
              )}

              {(activeTab === 'overview' || activeTab === 'orders') && (
              <section className="mt-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black font-serif">Đơn đặt chỗ</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Phê duyệt hoặc hủy các đơn chờ xử lý</p>
                  </div>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{bookings.length} đơn</span>
                </div>
                <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
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
              )}

              {activeTab === 'payments' && (
              <section className="mt-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-xl font-black font-serif">Lịch sử giao dịch SePay</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{filteredPayments.length} giao dịch · {uniqueCustomers} khách hàng</p>
                  </div>
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                      placeholder="Tìm theo mã, email, sản phẩm..."
                      className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-11 py-3 text-sm font-semibold outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[500px]">

                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs">
                      <tr>
                        <th className="px-6 py-4 text-left">Mã thanh toán</th>
                        <th className="px-6 py-4 text-left">Khách hàng</th>
                        <th className="px-6 py-4 text-left">Sản phẩm</th>
                        <th className="px-6 py-4 text-left">Số tiền</th>
                        <th className="px-6 py-4 text-left">Trạng thái</th>
                        <th className="px-6 py-4 text-left">SePay ID</th>
                        <th className="px-6 py-4 text-left">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                      {filteredPayments.map((tx) => (
                        <tr key={tx.order_payment_id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 align-top">
                          <td className="px-6 py-4 font-bold">{tx.payment_code}</td>
                          <td className="px-6 py-4">
                            <p className="font-semibold">{tx.user_name || '—'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{tx.user_email}</p>
                          </td>
                          <td className="px-6 py-4 max-w-xs">
                            <div className="space-y-1">
                              {(tx.order_items || []).map((item, index) => (
                                <p key={index} className="text-xs">
                                  {item.title || 'Tour'} × {item.quantity || 1}
                                  {item.guests ? ` · ${item.guests} khách` : ''}
                                </p>
                              ))}
                              {(tx.booking_refs || []).length > 0 && (
                                <p className="text-[10px] text-slate-400">Booking: {(tx.booking_refs || []).join(', ')}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-black text-blue-700 dark:text-blue-400">{Number(tx.amount).toLocaleString('vi-VN')}đ</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              tx.payment_status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}>
                              {tx.payment_status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">{tx.sepay_transaction_id || '—'}</td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            <p>Tạo: {new Date(tx.created_at).toLocaleString('vi-VN')}</p>
                            {tx.paid_at && <p className="text-emerald-600">TT: {new Date(tx.paid_at).toLocaleString('vi-VN')}</p>}
                          </td>
                        </tr>
                      ))}
                      {filteredPayments.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Chưa có giao dịch thanh toán</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
              )}


              {activeTab === 'hotels' && (
              <section className="mt-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="text-xl font-black font-serif">Quản lý Phòng Khách sạn</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Danh sách các phòng hiện có trong hệ thống</p>
                  </div>
                  <button onClick={openCreateRoom} className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white">
                    <Plus className="size-4" />
                    Thêm phòng mới
                  </button>
                </div>
                <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-widest text-xs">
                      <tr>
                        <th className="px-6 py-4 text-left">Tên phòng</th>
                        <th className="px-6 py-4 text-left">Loại phòng</th>
                        <th className="px-6 py-4 text-left">Sức chứa</th>
                        <th className="px-6 py-4 text-left">Giá mỗi đêm</th>
                        <th className="px-6 py-4 text-left">Trạng thái</th>
                        <th className="px-6 py-4 text-left">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                      {rooms.map((room) => (
                        <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{room.name}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{room.type}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{room.beds} giường · {room.guests} khách</td>
                          <td className="px-6 py-4 font-black text-blue-700 dark:text-blue-400">{room.price.toLocaleString('vi-VN')}đ</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              room.status === 'available'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                            }`}>
                              {room.status === 'available' ? 'Trống' : 'Đã đặt'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button aria-label="Edit room" onClick={() => openEditRoom(room)} disabled={roomActionLoading} className="text-blue-600 hover:text-blue-700 disabled:opacity-50">
                                <Edit className="size-4" />
                              </button>
                              <button aria-label="Delete room" onClick={() => handleDeleteRoom(room.id)} disabled={roomActionLoading} className="text-red-500 hover:text-red-600 disabled:opacity-50">
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {rooms.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                            Chưa có phòng nào được tạo.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
              )}


              {activeTab === 'settings' && (
              <section className="mt-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm p-8">
                <h3 className="text-xl font-black font-serif mb-2">Cấu hình thanh toán SePay</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Thiết lập biến môi trường <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">SEPAY_BANK_ACCOUNT</code>, webhook URL và API key trong file <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.env</code>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                    <p className="font-bold mb-1">Webhook URL</p>
                    <p className="text-slate-500 break-all">{WEBHOOK_PUBLIC_URL}/api/payments/webhook/sepay</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">

                    <p className="font-bold mb-1">Môi trường dev</p>
                    <p className="text-slate-500">Dùng nút &quot;Mô phỏng thanh toán&quot; trên trang QR để test không cần chuyển khoản thật.</p>

                  </div>
                </div>
              </section>
              )}
            </>
          )}
        </div>
      </main>

      <TourFormDialog
        open={tourDialogOpen}
        onOpenChange={setTourDialogOpen}
        initial={editingTour}
        onSubmit={handleSaveTour}
      />
      <RoomFormDialog
        open={roomDialogOpen}
        onOpenChange={setRoomDialogOpen}
        initial={editingRoom}
        onSubmit={handleSaveRoom}
      />
    </div>
  );
}
