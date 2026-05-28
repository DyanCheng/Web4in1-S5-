"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Plane, Package, Users, DollarSign, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';

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
    { label: 'Tổng doanh thu', value: `${totalRevenue.toLocaleString('vi-VN')}đ`, icon: <DollarSign className="size-8" />, color: 'bg-green-100 text-green-600' },
    { label: 'Tổng đơn hàng', value: totalOrders.toString(), icon: <Package className="size-8" />, color: 'bg-blue-100 text-blue-600' },
    { label: 'Khách đặt tour', value: uniqueUsersCount.toString(), icon: <Users className="size-8" />, color: 'bg-purple-100 text-purple-600' },
    { label: 'Tours đang có', value: activeToursCount.toString(), icon: <Plane className="size-8" />, color: 'bg-orange-100 text-orange-600' }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-700 font-medium">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Plane className="size-8 text-blue-600" />
              <span className="text-2xl text-gray-900 font-bold">TravelHub Admin</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">{user.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl text-gray-900 font-bold">Quản trị hệ thống</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
            ← Về trang chủ
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-left">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm shadow-indigo-100/50">
              <div className="flex items-center justify-between mb-4">
                <div className={`size-16 rounded-lg flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1 font-semibold">{stat.label}</p>
              <p className="text-3xl text-gray-900 font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl mb-8 border border-gray-100 shadow-sm text-left">
          <div className="border-b bg-gray-50/50 rounded-t-xl">
            <div className="flex gap-8 px-6">
              {['overview', 'tours', 'orders'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 border-b-2 transition-colors capitalize font-semibold cursor-pointer ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'overview' && 'Tổng quan'}
                  {tab === 'tours' && 'Quản lý Tour'}
                  {tab === 'orders' && 'Đơn hàng đặt'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600 font-medium">Đang tải dữ liệu...</span>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl text-gray-900 font-bold">Hoạt động gần đây</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg text-gray-900 mb-4 font-semibold">Đơn đặt tour mới</h3>
                        <div className="space-y-3 font-medium text-sm">
                          {bookings.slice(0, 3).map((order) => (
                            <div key={order.id} className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-center">
                              <div>
                                <p className="text-gray-900 font-bold">{order.userEmail}</p>
                                <p className="text-xs text-gray-500 font-semibold mt-0.5">{order.tourTitle}</p>
                                <p className="text-xxs text-gray-400 font-semibold mt-1">Khởi hành: {order.date}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-blue-600 font-bold block">{Number(order.total).toLocaleString('vi-VN')}đ</span>
                                <span
                                  className={`text-xxs px-2 py-0.5 rounded-full font-bold inline-block mt-1 ${
                                    order.status === 'confirmed'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-yellow-100 text-yellow-700'
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
                        <h3 className="text-lg text-gray-900 mb-4 font-semibold">Danh sách Tour có sẵn</h3>
                        <div className="space-y-3 font-medium text-sm">
                          {tours.slice(0, 3).map((t) => (
                            <div key={t.id} className="border rounded-lg p-4 bg-white shadow-sm flex items-center gap-3">
                              <img src={t.image} alt={t.title} className="size-12 rounded object-cover" />
                              <div>
                                <p className="text-gray-900 font-bold">{t.title}</p>
                                <p className="text-xs text-gray-500 font-semibold">{t.location} • {Number(t.price).toLocaleString('vi-VN')}đ</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tours Tab */}
                {activeTab === 'tours' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl text-gray-900 font-bold">Danh sách Tour du lịch</h2>
                      <button 
                        onClick={() => alert('Chức năng thêm Tour mới được kích hoạt!')}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold cursor-pointer"
                      >
                        <Plus className="size-5" />
                        Thêm tour mới
                      </button>
                    </div>

                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Tìm kiếm tour theo tên hoặc địa điểm..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto border rounded-xl">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Tên tour</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Địa điểm</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Thời gian</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Đơn giá</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Đánh giá</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y font-medium text-sm text-gray-800 bg-white">
                          {filteredTours.map((t) => (
                            <tr key={t.id}>
                              <td className="px-6 py-4 font-bold flex items-center gap-2">
                                <img src={t.image} alt={t.title} className="size-10 rounded object-cover" />
                                {t.title}
                              </td>
                              <td className="px-6 py-4">{t.location}</td>
                              <td className="px-6 py-4">{t.duration}</td>
                              <td className="px-6 py-4 text-blue-600 font-bold">{Number(t.price).toLocaleString('vi-VN')}đ</td>
                              <td className="px-6 py-4 text-yellow-600">★ {t.rating} ({t.reviews})</td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex gap-2">
                                  <button onClick={() => alert('Sửa thông tin tour')} className="text-blue-600 hover:text-blue-700 cursor-pointer">
                                    <Edit className="size-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm('Bạn muốn xóa tour này?')) {
                                        setTours(prev => prev.filter(item => item.id !== t.id));
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-700 cursor-pointer"
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
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div>
                    <h2 className="text-2xl text-gray-900 mb-6 font-bold">Danh sách Đơn đặt tour</h2>
                    <div className="overflow-x-auto border rounded-xl">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Mã đơn</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Khách hàng (Email)</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Tour</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Khởi hành</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Số người</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Tổng tiền</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y font-medium text-sm text-gray-800 bg-white">
                          {bookings.map((order) => (
                            <tr key={order.id}>
                              <td className="px-6 py-4 font-bold">{order.id}</td>
                              <td className="px-6 py-4 font-semibold">{order.userEmail}</td>
                              <td className="px-6 py-4">{order.tourTitle}</td>
                              <td className="px-6 py-4">{order.date}</td>
                              <td className="px-6 py-4">{order.guests} người</td>
                              <td className="px-6 py-4 text-blue-600 font-bold">{Number(order.total).toLocaleString('vi-VN')}đ</td>
                              <td className="px-6 py-4 text-sm">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    order.status === 'confirmed'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-yellow-100 text-yellow-700'
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
                                      className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 font-semibold cursor-pointer"
                                    >
                                      Duyệt
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteBooking(order.id)}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 font-semibold cursor-pointer"
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
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
