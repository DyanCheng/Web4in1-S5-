"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import TourFormDialog, { type TourRecord } from '@/components/admin/TourFormDialog';
import RoomFormDialog, { type RoomRecord } from '@/components/admin/RoomFormDialog';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import {
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Edit,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  Users,
  X,
  Download,
  FileText,
  ArrowLeft
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

interface RevenuePoint {
  month?: number;
  monthName?: string;
  totalRevenue: number;
  orderCount: number;
}

interface RevenueStatisticsResponse {
  year?: number;
  startDate?: string;
  endDate?: string;
  totalRevenue: number;
  totalOrders: number;
  data: RevenuePoint[];
}

interface PaymentTransaction {
  order_payment_id: number;
  payment_code: string;
  user_id: number | null;
  user_email: string;
  user_name: string | null;
  amount: number;
  payment_status: string;
  order_items: Array<{ serviceType?: string; title?: string; price?: number; quantity?: number; guests?: number; date?: string; lineTotal?: number; bookingRef?: string }>;
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

type AdminTab = 'overview' | 'tours' | 'orders' | 'payments' | 'hotels' | 'settings' | 'users';
type RevenuePeriod = 'today' | 'week' | 'month' | 'custom';

const sidebarItems = [
  { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
  { id: 'users', label: 'Quản lý người dùng', icon: Users },
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
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('month');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [tourDialogOpen, setTourDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [tourActionLoading, setTourActionLoading] = useState(false);
  const [detailModal, setDetailModal] = useState<{ type: 'transaction' | 'period_transactions' | 'tour' | 'customer', data: any, parent?: any } | null>(null);

  const handleExportCSV = () => {
    const filteredTx = paymentTransactions.filter(tx => {
      const txDate = new Date(tx.paid_at || tx.created_at);
      if (revenuePeriod === 'month') {
        const today = new Date();
        return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
      } else if (revenuePeriod === 'week') {
        const today = new Date();
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        firstDayOfWeek.setHours(0, 0, 0, 0);
        return txDate >= firstDayOfWeek;
      } else if (revenuePeriod === 'today') {
        const today = new Date();
        return txDate.getDate() === today.getDate() && txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
      } else if (revenuePeriod === 'custom') {
        if (!selectedDate) return true;
        const sDate = new Date(selectedDate);
        return txDate.getDate() === sDate.getDate() && txDate.getMonth() === sDate.getMonth() && txDate.getFullYear() === sDate.getFullYear();
      }
      return true;
    });

    const headers = ['Mã giao dịch', 'Khách hàng', 'Email', 'Dịch vụ', 'SL/Khách', 'Mã Đặt Chỗ', 'Số tiền', 'Trạng thái', 'Thời gian', 'Mã Sepay'];
    const rows = filteredTx.map(tx => {
      const serviceName = tx.order_items?.map(item => item.title).join(' + ') || 'Không rõ';
      const totalGuestsOrQty = tx.order_items?.reduce((sum, item) => sum + (item.guests || item.quantity || 0), 0) || 0;
      
      return [
        tx.payment_code,
        tx.user_name || 'Khách vãng lai',
        tx.user_email,
        serviceName,
        totalGuestsOrQty.toString(),
        tx.booking_refs?.join(' | ') || 'N/A',
        tx.amount,
        tx.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán',
        tx.paid_at ? new Date(tx.paid_at).toLocaleString('vi-VN') : '—',
        tx.sepay_transaction_id || 'N/A'
      ];
    });
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BaoCaoDoanhThu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomActionLoading, setRoomActionLoading] = useState(false);

  const adminHeaders = () => ({
    'Content-Type': 'application/json',
    'X-User-Role': user?.role ?? '',
  });

  const formatCurrency = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;



  const fetchData = async () => {
    try {
      setLoading(true);
      const [toursResponse, bookingsResponse, roomsResponse, summaryResponse, transactionsResponse] = await Promise.all([
        fetch(apiUrl('/api/tours')),
        fetch(apiUrl('/api/bookings')),
        fetch(apiUrl('/api/rooms')),
        fetch(apiUrl('/api/payments/admin/summary')),
        fetch(apiUrl('/api/payments/admin/transactions')),
      ]);
      const toursData = toursResponse.ok ? await toursResponse.json() : [];
      const bookingsData = bookingsResponse.ok ? await bookingsResponse.json() : [];
      const roomsData = roomsResponse.ok ? await roomsResponse.json() : [];

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

      setRooms(roomsData.length ? roomsData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user?.role !== 'admin') {
      router.push('/login');
      return;
    }
    void fetchData();
  }, [user, router]);



  const filteredTours = useMemo(
    () =>
      tours.filter((tour) =>
        tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.location.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, tours]
  );

  const monthlyRevenue = useMemo(() => {
    // Calculate last 6 months (including current month) robustly
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth(); // 0-11
    const data = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = currentMonthIndex - (5 - i);
      const d = new Date(currentYear, monthIndex, 1); // Date() will adjust year/month boundaries correctly
      const monthNum = d.getMonth() + 1;
      const year = d.getFullYear();
      const monthName = `Tháng ${monthNum}`;
      return {
        month: monthNum,
        year,
        monthName,
        totalRevenue: 0,
        orderCount: 0,
      };
    });

    paymentTransactions.forEach((tx) => {
      if (tx.payment_status === 'paid' && tx.paid_at) {
        const date = new Date(tx.paid_at);
        const txMonth = date.getMonth() + 1;
        const txYear = date.getFullYear();
        
        const dataItem = data.find(d => d.month === txMonth && d.year === txYear);
        if (dataItem) {
          dataItem.totalRevenue += Number(tx.amount || 0);
          dataItem.orderCount += 1;
        }
      }
    });

    const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalOrders = data.reduce((sum, item) => sum + item.orderCount, 0);

    return {
      totalRevenue,
      totalOrders,
      data,
    };
  }, [paymentTransactions]);

  const rangeRevenue = useMemo(() => {
    let startDate: Date;
    let endDate: Date;
    const today = new Date();

    if (revenuePeriod === 'today') {
      startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    } else if (revenuePeriod === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    } else if (revenuePeriod === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    } else if (revenuePeriod === 'custom' && selectedDate) {
      startDate = new Date(`${selectedDate}T00:00:00`);
      endDate = new Date(`${selectedDate}T23:59:59`);
    } else {
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
    }

    let totalRevenue = 0;
    let totalOrders = 0;

    paymentTransactions.forEach((tx) => {
      if (tx.payment_status === 'paid' && tx.paid_at) {
        const paidDate = new Date(tx.paid_at);
        if (paidDate >= startDate && paidDate <= endDate) {
          totalRevenue += Number(tx.amount || 0);
          totalOrders += 1;
        }
      }
    });

    return {
      totalRevenue,
      totalOrders,
    };
  }, [paymentTransactions, revenuePeriod, selectedDate]);

  const totalRevenue = paymentSummary?.total_revenue ?? bookings.reduce((sum, booking) => sum + Number(booking.total), 0);
  const pendingBookings = paymentSummary?.pending_count ?? bookings.filter((booking) => booking.status !== 'confirmed').length;
  const paidCount = paymentSummary?.paid_count ?? bookings.filter((booking) => booking.status === 'confirmed').length;
  const todayRevenue = paymentSummary?.today_revenue ?? 0;
  const selectedRevenue = rangeRevenue?.totalRevenue ?? 0;
  const selectedOrders = rangeRevenue?.totalOrders ?? 0;
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

  const topTours = useMemo(() => {
    const salesMap = new Map<string, { title: string; revenue: number; orders: number; guests: number }>();

    const addSale = (title: string, revenue: number, orders: number, guests: number) => {
      const existing = salesMap.get(title);
      if (existing) {
        existing.revenue += revenue;
        existing.orders += orders;
        existing.guests += guests;
      } else {
        salesMap.set(title, { title, revenue, orders, guests });
      }
    };

    bookings.forEach((booking) => {
      addSale(booking.tourTitle, Number(booking.total), 1, booking.guests);
    });

    paymentTransactions.forEach((transaction) => {
      if (transaction.payment_status !== 'paid') {
        return;
      }

      (transaction.order_items || []).forEach((item) => {
        const title = item.title || 'Dịch vụ';
        const quantity = Number(item.quantity || item.guests || 1);
        const lineTotal = Number(item.lineTotal || transaction.amount || 0);
        addSale(title, lineTotal, 1, quantity);
      });
    });

    return Array.from(salesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
  }, [bookings, paymentTransactions]);

  const topCustomers = useMemo(() => {
    const customerMap = new Map<string, { email: string; revenue: number; orders: number }>();

    const addCustomer = (email: string, revenue: number) => {
      if (!email) return;
      const existing = customerMap.get(email);
      if (existing) {
        existing.revenue += revenue;
        existing.orders += 1;
      } else {
        customerMap.set(email, { email, revenue, orders: 1 });
      }
    };

    bookings.forEach((booking) => {
      addCustomer(booking.userEmail, Number(booking.total));
    });

    paymentTransactions.forEach((transaction) => {
      if (transaction.payment_status === 'paid') {
        addCustomer(transaction.user_email, Number(transaction.amount));
      }
    });

    return Array.from(customerMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
  }, [bookings, paymentTransactions]);

  const revenuePeriodOptions: Array<{ id: RevenuePeriod; label: string }> = [
    { id: 'today', label: 'Hôm nay' },
    { id: 'week', label: 'Tuần' },
    { id: 'month', label: 'Tháng' },
    { id: 'custom', label: 'Tùy chọn' },
  ];

  const revenuePeriodLabel = revenuePeriod === 'custom'
    ? `Ngày ${selectedDate}`
    : revenuePeriod === 'today'
      ? 'Hôm nay'
      : revenuePeriod === 'week'
        ? '7 ngày qua'
        : 'Tháng này';

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
      const response = await fetch(`${getBackendUrl()}/api/tours/${id}`, {
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
      ? `${getBackendUrl()}/api/tours/${editingTour.id}`
      : `${getBackendUrl()}/api/tours`;
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
      const response = await fetch(`${getBackendUrl()}/api/rooms/${id}`, {
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
      ? `${getBackendUrl()}/api/rooms/${editingRoom.id}`
      : `${getBackendUrl()}/api/rooms`;
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
    users: { title: 'Quản lý người dùng', subtitle: 'Xem danh sách và thao tác Khóa / Mở khóa tài khoản.' },
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex ${theme === 'dark' ? 'dark' : ''}`}>
      <aside className="hidden xl:flex w-70 flex-col border-r border-slate-200/70 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 h-screen overflow-y-auto">
        <div className="p-8">
          <div className="text-left">
            <h1 className="text-3xl font-black text-blue-700 dark:text-blue-400 font-sans tracking-tight">CMC Travel</h1>
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
          <Link
            href="/employee/support"
            className="w-full flex items-center gap-3 rounded-2xl px-4 py-4 text-left font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/70"
          >
            <MessageSquare className="size-5" />
            Hỗ trợ chat
          </Link>
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
              <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight">{tabTitles[activeTab].title}</h2>
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
              {activeTab === 'users' && <AdminUserManagement />}
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
                <section className="mt-8 rounded-[32px] border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-900 dark:text-white shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        <Sparkles className="size-4 text-blue-600 dark:text-blue-400" />
                        Doanh thu & bán hàng
                      </div>
                      <h3 className="mt-4 text-2xl font-black font-sans tracking-tight">Phân tích doanh thu theo thời gian</h3>
                      <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                        Theo dõi hiệu quả theo ngày, tuần, tháng hoặc một thời điểm cụ thể để ra quyết định nhanh hơn.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-full border border-slate-150 dark:border-slate-800">
                        {revenuePeriodOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setRevenuePeriod(option.id)}
                            className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${
                              revenuePeriod === option.id
                                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors border border-emerald-200 dark:border-emerald-800"
                        title="Xuất dữ liệu CSV"
                      >
                        <Download className="size-4" /> Xuất CSV
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-3xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Giai đoạn đang xem</p>
                          <p className="mt-1 text-xl font-black text-slate-800 dark:text-slate-200">{revenuePeriodLabel}</p>
                        </div>
                        <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 p-3 text-blue-600 dark:text-blue-400">
                          <TrendingUp className="size-5" />
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950/50 p-4 shadow-xs">
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold">Doanh thu</p>
                          <p className="mt-2 text-xl font-black text-slate-800 dark:text-slate-100">{formatCurrency(selectedRevenue)}</p>
                        </div>
                        <div 
                          className="rounded-2xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950/50 p-4 shadow-xs cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
                          onClick={() => setDetailModal({ type: 'period_transactions', data: { periodLabel: revenuePeriodLabel } })}
                        >
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold group-hover:text-blue-500 transition-colors">Đơn hàng</p>
                          <p className="mt-2 text-xl font-black text-slate-800 dark:text-slate-100">{selectedOrders}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950/50 p-4 shadow-xs">
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold">TB/đơn</p>
                          <p className="mt-2 text-xl font-black text-slate-800 dark:text-slate-100">{selectedOrders > 0 ? formatCurrency(selectedRevenue / selectedOrders) : '0đ'}</p>
                        </div>
                      </div>

                      {revenuePeriod === 'custom' && (
                        <div className="mt-4 flex items-center gap-3">
                          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <CalendarDays className="size-4 text-slate-400" />
                            <input
                              type="date"
                              value={selectedDate}
                              onChange={(event) => setSelectedDate(event.target.value)}
                              className="bg-transparent outline-none"
                            />
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="rounded-3xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-5">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                        <CalendarDays className="size-4 text-blue-600 dark:text-blue-400" />
                        Xu hướng doanh thu 6 tháng gần đây
                      </div>
                      <div className="mt-4 space-y-3">
                        {(monthlyRevenue?.data ?? []).map((item, idx) => {
                          const dataArr = monthlyRevenue?.data ?? [];
                          const maxValue = Math.max(...dataArr.map((entry) => entry.totalRevenue), 0);
                          const widthPct = maxValue > 0 ? (item.totalRevenue / maxValue) * 100 : 0;
                          return (
                            <div key={`${item.year ?? ''}-${item.month ?? item.monthName}-${idx}`} className="flex items-center gap-3">
                              <div className="w-20 text-sm text-slate-400 font-semibold">{item.monthName || '—'}</div>
                              <div className="h-2.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800/80">
                                {item.totalRevenue > 0 ? (
                                  <div
                                    className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400"
                                    style={{ width: `${widthPct}%` }}
                                  />
                                ) : null}
                              </div>
                              <div className="w-24 text-right text-sm font-black text-slate-800 dark:text-slate-200">{formatCurrency(item.totalRevenue)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-3xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-black flex items-center gap-2 text-slate-800 dark:text-slate-100"><Sparkles className="size-4 text-blue-600 dark:text-blue-400" /> Top tour bán chạy</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tour mang lại doanh thu cao nhất.</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        {topTours.map((tour, index) => (
                          <div 
                            key={`${tour.title}-${index}`} 
                            onClick={() => setDetailModal({ type: 'tour', data: tour })}
                            className="rounded-2xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950/50 p-4 flex items-center gap-4 transition-all hover:scale-[1.01] hover:border-blue-300 dark:hover:border-blue-700 shadow-xs cursor-pointer"
                          >
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 font-black">
                              #{index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{tour.title}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{tour.guests} khách · {tour.orders} đơn</p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-blue-600 dark:text-blue-400">{formatCurrency(tour.revenue)}</p>
                            </div>
                          </div>
                        ))}
                        {topTours.length === 0 && (
                          <div className="rounded-2xl bg-slate-100/50 dark:bg-slate-950/30 p-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                            Chưa có dữ liệu bán hàng.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-black flex items-center gap-2 text-slate-800 dark:text-slate-100"><Users className="size-4 text-emerald-600 dark:text-emerald-400" /> Top khách hàng</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Khách hàng chi tiêu nhiều nhất.</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        {topCustomers.map((customer, index) => (
                          <div 
                            key={`${customer.email}-${index}`} 
                            onClick={() => setDetailModal({ type: 'customer', data: customer })}
                            className="rounded-2xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950/50 p-4 flex items-center gap-4 transition-all hover:scale-[1.01] hover:border-emerald-300 dark:hover:border-emerald-700 shadow-xs cursor-pointer"
                          >
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 font-black">
                              #{index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{customer.email}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{customer.orders} đơn hàng</p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(customer.revenue)}</p>
                            </div>
                          </div>
                        ))}
                        {topCustomers.length === 0 && (
                          <div className="rounded-2xl bg-slate-100/50 dark:bg-slate-950/30 p-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                            Chưa có dữ liệu khách hàng.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'overview' && (
                <section className="mt-8 grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6">
                <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200/70 dark:border-slate-800">
                    <h3 className="text-xl font-black font-sans tracking-tight">Giao dịch gần đây</h3>
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
                    <h3 className="text-xl font-black font-sans tracking-tight mb-5">Thao tác nhanh</h3>
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
                    <h3 className="text-xl font-black font-sans tracking-tight mb-5">Hoạt động gần đây</h3>
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
                    <h3 className="text-xl font-black font-sans tracking-tight">Quản lý tour</h3>
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
                    <h3 className="text-xl font-black font-sans tracking-tight">Đơn đặt chỗ</h3>
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
                    <h3 className="text-xl font-black font-sans tracking-tight">Lịch sử giao dịch SePay</h3>
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
                                  [{item.serviceType || 'tour'}] {item.title || 'Dịch vụ'} × {item.quantity || 1}
                                  {item.guests ? ` · ${item.guests} khách` : ''}
                                  {item.lineTotal ? ` · ${Number(item.lineTotal).toLocaleString('vi-VN')}đ` : ''}
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
                    <h3 className="text-xl font-black font-sans tracking-tight">Quản lý Phòng Khách sạn</h3>
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
                <h3 className="text-xl font-black font-sans tracking-tight mb-2">Cấu hình thanh toán SePay</h3>
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

      {detailModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setDetailModal(null); }}>
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
                {detailModal.parent && (
                  <button onClick={() => setDetailModal(detailModal.parent)} className="mr-1 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft className="size-5 text-slate-600 dark:text-slate-400" />
                  </button>
                )}
                {detailModal.type === 'transaction' && <><FileText className="size-5 text-blue-600" /> Chi tiết giao dịch</>}
                {detailModal.type === 'period_transactions' && <><ShoppingBag className="size-5 text-blue-600" /> Danh sách đơn hàng ({detailModal.data.periodLabel})</>}
                {detailModal.type === 'tour' && <><Sparkles className="size-5 text-purple-600" /> Khách mua Tour: {detailModal.data.title}</>}
                {detailModal.type === 'customer' && <><Users className="size-5 text-emerald-600" /> Lịch sử mua của: {detailModal.data.email}</>}
              </h2>
              <button onClick={() => setDetailModal(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="size-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/20">
              {detailModal.type === 'transaction' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
                    <div><p className="text-sm text-slate-500 font-semibold mb-1">Mã GD</p><p className="font-bold text-slate-900 dark:text-slate-100">{detailModal.data.payment_code}</p></div>
                    <div><p className="text-sm text-slate-500 font-semibold mb-1">Số tiền</p><p className="font-bold text-blue-600 text-lg">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(detailModal.data.amount)}</p></div>
                    <div><p className="text-sm text-slate-500 font-semibold mb-1">Khách hàng</p><p className="font-bold text-slate-900 dark:text-slate-100">{detailModal.data.user_name || 'Khách vãng lai'}</p></div>
                    <div><p className="text-sm text-slate-500 font-semibold mb-1">Email</p><p className="font-bold text-slate-900 dark:text-slate-100">{detailModal.data.user_email}</p></div>
                    <div><p className="text-sm text-slate-500 font-semibold mb-1">Trạng thái</p>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${detailModal.data.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'}`}>
                        {detailModal.data.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </div>
                    <div><p className="text-sm text-slate-500 font-semibold mb-1">Thời gian</p><p className="font-bold text-slate-900 dark:text-slate-100">{detailModal.data.paid_at ? new Date(detailModal.data.paid_at).toLocaleString('vi-VN') : '—'}</p></div>
                  </div>
                  {detailModal.data.order_items && detailModal.data.order_items.length > 0 && (
                    <div>
                      <p className="font-bold mb-3 text-slate-800 dark:text-slate-200">Sản phẩm / Dịch vụ đã mua:</p>
                      <ul className="space-y-3">
                        {detailModal.data.order_items.map((item: any, i: number) => (
                          <li key={i} className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
                            {item.image && <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-xl" />}
                            <div className="flex-1">
                              <p className="font-bold text-slate-900 dark:text-slate-100">{item.title}</p>
                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                                <span>Loại: <b>{item.serviceType === 'tour' ? 'Tour du lịch' : 'Phòng khách sạn'}</b></span>
                                <span>Số lượng: <b>{item.quantity}</b></span>
                                <span>Đơn giá: <b>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</b></span>
                              </div>
                              <p className="mt-2 text-sm font-black text-blue-600">Thành tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.lineTotal)}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {detailModal.type === 'period_transactions' && (
                <div className="space-y-3">
                  {paymentTransactions
                    .filter(tx => {
                      const txDate = new Date(tx.paid_at || tx.created_at);
                      if (revenuePeriod === 'month') {
                        const today = new Date();
                        return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
                      } else if (revenuePeriod === 'week') {
                        const today = new Date();
                        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
                        firstDayOfWeek.setHours(0, 0, 0, 0);
                        return txDate >= firstDayOfWeek;
                      } else if (revenuePeriod === 'today') {
                        const today = new Date();
                        return txDate.getDate() === today.getDate() && txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
                      } else if (revenuePeriod === 'custom') {
                        if (!selectedDate) return true;
                        const sDate = new Date(selectedDate);
                        return txDate.getDate() === sDate.getDate() && txDate.getMonth() === sDate.getMonth() && txDate.getFullYear() === sDate.getFullYear();
                      }
                      return true;
                    })
                    .sort((a, b) => new Date(b.paid_at || b.created_at).getTime() - new Date(a.paid_at || a.created_at).getTime())
                    .map((tx, i) => (
                      <div key={i} onClick={() => setDetailModal({ type: 'transaction', data: tx, parent: detailModal })} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between items-center cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{tx.user_email || tx.payment_code}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{new Date(tx.paid_at || tx.created_at).toLocaleString('vi-VN')} · <span className={tx.payment_status === 'paid' ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>{tx.payment_status === 'paid' ? 'Thành công' : 'Chưa thanh toán'}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-blue-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount)}</p>
                          <p className="text-xs text-slate-400 mt-1 font-mono">{tx.payment_code}</p>
                        </div>
                      </div>
                  ))}
                  {paymentTransactions.length === 0 && (
                    <div className="text-center py-8 text-slate-500">Không có giao dịch nào trong giai đoạn này.</div>
                  )}
                </div>
              )}
              {detailModal.type === 'tour' && (
                <div className="space-y-3">
                  {paymentTransactions
                    .filter(tx => tx.payment_status === 'paid' && tx.order_items?.some((i: any) => i.referenceId === detailModal.data.id || i.title === detailModal.data.title))
                    .sort((a, b) => new Date(b.paid_at || b.created_at).getTime() - new Date(a.paid_at || a.created_at).getTime())
                    .map((tx, i) => (
                      <div key={i} onClick={() => setDetailModal({ type: 'transaction', data: tx, parent: detailModal })} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between items-center cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors shadow-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{tx.user_email}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{new Date(tx.paid_at || tx.created_at).toLocaleString('vi-VN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-blue-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount)}</p>
                          <p className="text-xs text-slate-400 mt-1 font-mono">{tx.payment_code}</p>
                        </div>
                      </div>
                  ))}
                  {paymentTransactions.filter(tx => tx.payment_status === 'paid' && tx.order_items?.some((i: any) => i.referenceId === detailModal.data.id || i.title === detailModal.data.title)).length === 0 && (
                    <div className="text-center py-8 text-slate-500">Chưa có giao dịch chi tiết nào được ghi nhận cho tour này.</div>
                  )}
                </div>
              )}
              {detailModal.type === 'customer' && (
                <div className="space-y-3">
                  {paymentTransactions
                    .filter(tx => tx.user_email === detailModal.data.email)
                    .sort((a, b) => new Date(b.paid_at || b.created_at).getTime() - new Date(a.paid_at || a.created_at).getTime())
                    .map((tx, i) => (
                      <div key={i} onClick={() => setDetailModal({ type: 'transaction', data: tx, parent: detailModal })} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between items-center cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{tx.payment_code}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{new Date(tx.paid_at || tx.created_at).toLocaleString('vi-VN')} · <span className={tx.payment_status === 'paid' ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>{tx.payment_status === 'paid' ? 'Thành công' : 'Chưa thanh toán'}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-emerald-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount)}</p>
                        </div>
                      </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
