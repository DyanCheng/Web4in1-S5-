import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plane, Package, Users, DollarSign, Plus, Edit, Trash2, Search } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Tổng doanh thu', value: '$125,430', icon: <DollarSign className="size-8" />, color: 'bg-green-100 text-green-600' },
    { label: 'Tổng đơn hàng', value: '256', icon: <Package className="size-8" />, color: 'bg-blue-100 text-blue-600' },
    { label: 'Khách hàng', value: '1,245', icon: <Users className="size-8" />, color: 'bg-purple-100 text-purple-600' },
    { label: 'Tour đang hoạt động', value: '48', icon: <Plane className="size-8" />, color: 'bg-orange-100 text-orange-600' }
  ];

  const [tours, setTours] = useState([
    { id: 1, name: 'Du ngoạn Vịnh Hạ Long', location: 'Quảng Ninh', price: 3500000, status: 'active', bookings: 245 },
    { id: 2, name: 'Thiên đường Phú Quốc', location: 'Kiên Giang', price: 5200000, status: 'active', bookings: 189 },
    { id: 3, name: 'Mù Cang Chải - Sa Pa', location: 'Lào Cai', price: 4800000, status: 'active', bookings: 156 },
    { id: 4, name: 'Biển xanh Đà Nẵng', location: 'Đà Nẵng', price: 3200000, status: 'active', bookings: 278 },
    { id: 5, name: 'Phố cổ Hội An', location: 'Quảng Nam', price: 2800000, status: 'active', bookings: 312 },
    { id: 6, name: 'Nha Trang - Vịnh xanh', location: 'Khánh Hòa', price: 3900000, status: 'inactive', bookings: 98 }
  ]);

  const [orders, setOrders] = useState([
    { id: 'ORD-001', customer: 'Nguyễn Văn A', tour: 'Vịnh Hạ Long', date: '2026-05-20', amount: 7000000, status: 'confirmed' },
    { id: 'ORD-002', customer: 'Trần Thị B', tour: 'Phú Quốc', date: '2026-05-21', amount: 15600000, status: 'pending' },
    { id: 'ORD-003', customer: 'Lê Văn C', tour: 'Sa Pa', date: '2026-05-22', amount: 14400000, status: 'confirmed' }
  ]);

  const [customers, setCustomers] = useState([
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', bookings: 3, total: 16200000, joined: '2026-01-15' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', bookings: 2, total: 10400000, joined: '2026-02-20' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', bookings: 5, total: 24800000, joined: '2025-12-10' }
  ]);

  const handleDeleteTour = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa tour này?')) {
      setTours(tours.filter(t => t.id !== id));
    }
  };

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Plane className="size-8 text-blue-600" />
              <span className="text-2xl text-gray-900">TravelHub Admin</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl text-gray-900">Quản trị hệ thống</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            ← Về trang chủ
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`size-16 rounded-lg flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-3xl text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl mb-8">
          <div className="border-b">
            <div className="flex gap-8 px-6">
              {['overview', 'tours', 'orders', 'customers'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'overview' && 'Tổng quan'}
                  {tab === 'tours' && 'Quản lý Tour'}
                  {tab === 'orders' && 'Đơn hàng'}
                  {tab === 'customers' && 'Khách hàng'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl text-gray-900">Hoạt động gần đây</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg text-gray-900 mb-4">Đơn hàng mới nhất</h3>
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-gray-900">{order.customer}</p>
                              <p className="text-sm text-gray-500">{order.tour}</p>
                            </div>
                            <span className="text-blue-600">{order.amount.toLocaleString('vi-VN')}đ</span>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {order.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg text-gray-900 mb-4">Tour phổ biến</h3>
                    <div className="space-y-3">
                      {tours.slice(0, 3).map((tour) => (
                        <div key={tour.id} className="border rounded-lg p-4">
                          <p className="text-gray-900 mb-1">{tour.name}</p>
                          <p className="text-sm text-gray-500">{tour.bookings} đặt chỗ</p>
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
                  <h2 className="text-2xl text-gray-900">Quản lý Tour</h2>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Plus className="size-5" />
                    Thêm tour mới
                  </button>
                </div>

                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm tour..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Tên tour</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Địa điểm</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Giá</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Đặt chỗ</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {tours.map((tour) => (
                        <tr key={tour.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">{tour.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{tour.location}</td>
                          <td className="px-6 py-4 text-sm text-blue-600">{tour.price.toLocaleString('vi-VN')}đ</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{tour.bookings}</td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                tour.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {tour.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <button className="text-blue-600 hover:text-blue-700">
                                <Edit className="size-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTour(tour.id)}
                                className="text-red-600 hover:text-red-700"
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
                <h2 className="text-2xl text-gray-900 mb-6">Quản lý Đơn hàng</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Mã đơn</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Khách hàng</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Tour</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Ngày</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Số tiền</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">{order.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{order.customer}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{order.tour}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                          <td className="px-6 py-4 text-sm text-blue-600">{order.amount.toLocaleString('vi-VN')}đ</td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                order.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {order.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && (
              <div>
                <h2 className="text-2xl text-gray-900 mb-6">Quản lý Khách hàng</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Tên</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Số đơn</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Tổng chi tiêu</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Ngày tham gia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {customers.map((customer) => (
                        <tr key={customer.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">{customer.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{customer.bookings}</td>
                          <td className="px-6 py-4 text-sm text-blue-600">{customer.total.toLocaleString('vi-VN')}đ</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{customer.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
