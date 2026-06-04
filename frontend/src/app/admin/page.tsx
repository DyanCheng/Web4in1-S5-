"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Users, DollarSign, Plus, Edit, Trash2, Search, Loader2, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

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

export default function AdminDashboard() {
  const router = useRouter();
  const navigate = (url: string) => router.push(url);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [tours, setTours] = useState<Tour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const toursResponse = await fetch(`${BACKEND_URL}/api/tours`);
      const toursData = await toursResponse.json();
      setTours(toursData);

      const bookingsResponse = await fetch(`${BACKEND_URL}/api/bookings`);
      const bookingsData = await bookingsResponse.json();
      setBookings(bookingsData);
    } catch (err: any) {
      console.error(err);
      setError('Không thể kết nối tới máy chủ. Hiển thị dữ liệu dự phòng.');
      // Local fallbacks
      setTours([
        { id: '1', title: "Du ngoạn Vịnh Hạ Long", location: "Quảng Ninh", price: 3500000, duration: "2 ngày 1 đêm", image: "https://images.unsplash.com/photo-1643029891412-92f9a81a8c16", rating: 4.9, reviews: 1234 },
        { id: '2', title: "Thiên đường Phú Quốc", location: "Kiên Giang", price: 5200000, duration: "4 ngày 3 đêm", image: "https://images.unsplash.com/photo-1732243395944-cb3ff9311091", rating: 4.8, reviews: 892 },
        { id: '3', title: "Mù Cang Chải - Sa Pa", location: "Lào Cai", price: 4800000, duration: "3 ngày 2 đêm", image: "https://images.unsplash.com/photo-1649530928914-c2df337e3007", rating: 4.9, reviews: 756 },
        { id: '4', title: "Biển xanh Đà Nẵng", location: "Đà Nẵng", price: 3200000, duration: "3 ngày 2 đêm", image: "https://images.unsplash.com/photo-1723142282970-1fd415eec1ad", rating: 4.7, reviews: 1089 },
        { id: '5', title: "Phố cổ Hội An", location: "Quảng Nam", price: 2800000, duration: "2 ngày 1 đêm", image: "https://images.unsplash.com/photo-1664650440553-ab53804814b3", rating: 5.0, reviews: 1456 }
      ]);
      setBookings([
        { id: 'ORD-1715234567890', tourId: '1', tourTitle: 'Du ngoạn Vịnh Hạ Long', tourImage: 'https://images.unsplash.com/photo-1643029891412-92f9a81a8c16', userId: '3', userEmail: 'user@travelhub.com', date: '2026-07-15', guests: 2, total: 7000000, status: 'confirmed' },
        { id: 'ORD-1714123456789', tourId: '2', tourTitle: 'Thiên đường Phú Quốc', tourImage: 'https://images.unsplash.com/photo-1732243395944-cb3ff9311091', userId: '3', userEmail: 'user@travelhub.com', date: '2026-08-20', guests: 3, total: 15600000, status: 'pending' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
    } else {
      fetchData();
    }
  }, [user, router]);

  // Statistics calculation
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.total), 0);
  const totalOrders = bookings.length;
  const uniqueUsersCount = new Set(bookings.map(b => b.userEmail)).size;
  const activeToursCount = tours.length;

  const stats = [
    { label: 'Tổng doanh thu', value: `${totalRevenue.toLocaleString('vi-VN')}đ`, icon: <DollarSign className="size-6" />, color: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' },
    { label: 'Tổng đơn hàng', value: totalOrders.toString(), icon: <Package className="size-6" />, color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' },
    { label: 'Khách hàng', value: uniqueUsersCount.toString(), icon: <Users className="size-6" />, color: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400' },
    { label: 'Hành trình', value: activeToursCount.toString(), icon: <Package className="size-6" />, color: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' }
  ];

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Bạn có chắc muốn hủy đơn đặt tour này?')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/bookings/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Hủy thất bại');
      alert('Hủy đặt tour thành công!');
      fetchData();
    } catch {
      // Local fallback
      setBookings(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleConfirmBooking = async (id: string) => {
    alert('Đã phê duyệt và xác nhận đơn đặt tour!');
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-700 dark:text-slate-400 font-bold">
        Đang chuyển hướng quyền truy cập...
      </div>
    );
  }

  // Filter tours
  const filteredTours = tours.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen bg-slate-50/50 dark:bg-slate-955 font-sans transition-colors duration-300 flex flex-col ${
      theme === 'dark' ? 'dark text-white' : 'text-slate-900'
    }`}>
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-4 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-2xl font-black text-blue-900 dark:text-blue-400 font-serif italic tracking-wide">
                VoyagerElite Admin
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="size-5 text-yellow-400" /> : <Moon className="size-5" />}
              </button>

              <span className="text-slate-750 dark:text-slate-200 font-bold text-sm">{user.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-full transition-all text-xs font-bold cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>

          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full text-left">
        
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="inline-block px-4 py-1.5 text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-full border border-blue-100/30 uppercase tracking-widest mb-3">
              Khu vực quản trị
            </span>
            <h1 className="text-3xl font-black font-serif text-slate-900 dark:text-white">Hệ Thống VoyagerElite</h1>
          </div>
          <Link href="/" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
            ← Về trang chủ
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100/40 dark:border-slate-800/40 shadow-sm flex items-center gap-4">
              <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs and tables */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100/40 dark:border-slate-800/40 shadow-sm overflow-hidden mb-10">
          <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 px-6">
            <div className="flex gap-8">
              {['overview', 'tours', 'orders'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 border-b-2 transition-colors font-bold text-sm tracking-wider cursor-pointer ${
                    activeTab === tab
                      ? 'border-blue-605 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-205'
                  }`}
                >
                  {tab === 'overview' && 'TỔNG QUAN'}
                  {tab === 'tours' && 'QUẢN LÝ TOUR'}
                  {tab === 'orders' && 'DANH SÁCH ĐƠN HÀNG'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-slate-500 dark:text-slate-400 font-bold">Đang tải dữ liệu quản trị...</span>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4 font-serif">Đơn đặt tour mới nhất</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                        {bookings.slice(0, 4).map((order) => (
                          <div key={order.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900 shadow-xxs flex justify-between items-center">
                            <div>
                              <p className="text-slate-900 dark:text-white font-extrabold text-sm">{order.userEmail}</p>
                              <p className="text-slate-400 dark:text-slate-500 mt-1">{order.tourTitle}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-1 uppercase tracking-wider">Khởi hành: {order.date}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-blue-900 dark:text-blue-400 font-black text-sm block">{Number(order.total).toLocaleString('vi-VN')}đ</span>
                              <span
                                className={`text-[9px] px-2.5 py-0.5 rounded-full font-black tracking-wide uppercase inline-block mt-2 ${
                                  order.status === 'confirmed'
                                    ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                }`}
                              >
                                {order.status === 'confirmed' ? 'Đã duyệt' : 'Chờ duyệt'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4 font-serif">Hành trình đang có sẵn</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
                        {tours.slice(0, 4).map((t) => (
                          <div key={t.id} className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900 shadow-xxs flex items-center gap-3">
                            <img src={t.image} alt={t.title} className="size-11 rounded-xl object-cover shrink-0" />
                            <div>
                              <p className="text-slate-900 dark:text-white font-extrabold text-sm line-clamp-1">{t.title}</p>
                              <p className="text-slate-400 dark:text-slate-500 mt-1">{t.location} • {Number(t.price).toLocaleString('vi-VN')}đ</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tours Tab */}
                {activeTab === 'tours' && (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif">Quản lý tour du lịch</h2>
                      <button 
                        onClick={() => alert('Chức năng thêm Tour mới được kích hoạt!')}
                        className="px-4 py-2.5 bg-blue-900 hover:bg-blue-955 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-colors flex items-center gap-2 font-bold text-xs cursor-pointer shadow-md"
                      >
                        <Plus className="size-4" />
                        Thêm tour mới
                      </button>
                    </div>

                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Tìm kiếm tour theo tên hoặc địa điểm..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-800 dark:text-slate-100 font-bold text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Hình ảnh & Tên tour</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Địa điểm</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Thời gian</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Đơn giá</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Đánh giá</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-105 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                            {filteredTours.map((t) => (
                              <tr key={t.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                                <td className="px-6 py-4 font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                                  <img src={t.image} alt={t.title} className="size-10 rounded-lg object-cover shrink-0" />
                                  <span className="line-clamp-1">{t.title}</span>
                                </td>
                                <td className="px-6 py-4">{t.location}</td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{t.duration}</td>
                                <td className="px-6 py-4 text-blue-900 dark:text-blue-400 font-black">{Number(t.price).toLocaleString('vi-VN')}đ</td>
                                <td className="px-6 py-4 text-amber-600 dark:text-amber-500 font-bold">★ {t.rating} ({t.reviews})</td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-3">
                                    <button onClick={() => alert('Sửa thông tin tour')} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 cursor-pointer">
                                      <Edit className="size-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm('Bạn muốn xóa tour này?')) {
                                          setTours(prev => prev.filter(item => item.id !== t.id));
                                        }
                                      }}
                                      className="text-red-500 hover:text-red-700 cursor-pointer"
                                    >
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
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif mb-6">Đơn hàng đặt từ khách</h2>
                    
                    <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Mã đơn</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Khách hàng</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Hành trình</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Khởi hành</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Số lượng</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-550 uppercase tracking-widest font-black">Tổng chi phí</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-550 uppercase tracking-widest font-black">Trạng thái</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-550 uppercase tracking-widest font-black">Phê duyệt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                            {bookings.map((order) => (
                              <tr key={order.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{order.id}</td>
                                <td className="px-6 py-4">{order.userEmail}</td>
                                <td className="px-6 py-4">{order.tourTitle}</td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{order.date}</td>
                                <td className="px-6 py-4">{order.guests} người</td>
                                <td className="px-6 py-4 text-blue-900 dark:text-blue-400 font-black">{Number(order.total).toLocaleString('vi-VN')}đ</td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase ${
                                      order.status === 'confirmed'
                                        ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                    }`}
                                  >
                                    {order.status === 'confirmed' ? 'Đã duyệt' : 'Chờ duyệt'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                    {order.status !== 'confirmed' && (
                                      <button 
                                        onClick={() => handleConfirmBooking(order.id)}
                                        className="px-3 py-1 bg-green-600 text-white rounded-xl text-xxs hover:bg-green-705 font-bold cursor-pointer transition-colors shadow-xxs"
                                      >
                                        Duyệt
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteBooking(order.id)}
                                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xxs font-bold cursor-pointer transition-colors"
                                    >
                                      Hủy
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
