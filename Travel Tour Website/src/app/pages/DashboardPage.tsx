import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plane, Package, FileText, User, Download, Trash2, Star, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');

  const mockBookings = [
    {
      id: 'ORD-1715234567890',
      tour: 'Du ngoạn Vịnh Hạ Long',
      location: 'Quảng Ninh',
      date: '2026-07-15',
      guests: 2,
      total: 7000000,
      status: 'confirmed',
      image: 'https://images.unsplash.com/photo-1643029891412-92f9a81a8c16'
    },
    {
      id: 'ORD-1714123456789',
      tour: 'Thiên đường Phú Quốc',
      location: 'Kiên Giang',
      date: '2026-08-20',
      guests: 3,
      total: 15600000,
      status: 'pending',
      image: 'https://images.unsplash.com/photo-1732243395944-cb3ff9311091'
    }
  ];

  const [reviews, setReviews] = useState([
    {
      id: 1,
      tour: 'Phố cổ Hội An',
      rating: 5,
      comment: 'Tour tuyệt vời! Phố cổ Hội An lung linh đèn lồng rất đẹp. Tôi rất hài lòng với chuyến đi này.',
      date: '2026-04-20'
    }
  ]);

  const handleDeleteBooking = (id: string) => {
    if (confirm('Bạn có chắc muốn hủy đặt tour này?')) {
      alert('Đã hủy đặt tour thành công!');
    }
  };

  const handleDownloadInvoice = (id: string) => {
    alert(`Đang tải hóa đơn ${id}...`);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <Plane className="size-8 text-blue-600" />
              <span className="text-2xl text-gray-900">TravelHub</span>
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
        <h1 className="text-3xl text-gray-900 mb-8">Dashboard của tôi</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-4 space-y-2">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'bookings'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="size-5" />
                <span>Đặt tour của tôi</span>
              </button>

              <button
                onClick={() => setActiveTab('invoices')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'invoices'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText className="size-5" />
                <span>Hóa đơn</span>
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'reviews'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Star className="size-5" />
                <span>Đánh giá của tôi</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="size-5" />
                <span>Thông tin cá nhân</span>
              </button>
            </div>

            <Link
              to="/"
              className="block mt-4 text-center text-blue-600 hover:text-blue-700"
            >
              ← Quay về trang chủ
            </Link>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                <h2 className="text-2xl text-gray-900 mb-4">Tour đã đặt</h2>
                {mockBookings.map((booking) => (
                  <div key={booking.id} className="bg-white rounded-xl p-6">
                    <div className="flex gap-4">
                      <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={booking.image} alt={booking.tour} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl text-gray-900 mb-1">{booking.tour}</h3>
                            <p className="text-gray-600 flex items-center gap-1">
                              <MapPin className="size-4" />
                              {booking.location}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-gray-500">Mã đơn</p>
                            <p className="text-gray-900">{booking.id}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Ngày khởi hành</p>
                            <p className="text-gray-900">{booking.date}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Số người</p>
                            <p className="text-gray-900">{booking.guests} người</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="text-2xl text-blue-600">{booking.total.toLocaleString('vi-VN')}đ</div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownloadInvoice(booking.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                              <Download className="size-4" />
                              Tải hóa đơn
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="size-4" />
                              Hủy tour
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div>
                <h2 className="text-2xl text-gray-900 mb-4">Hóa đơn</h2>
                <div className="bg-white rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Mã hóa đơn</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Tour</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Ngày</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Tổng tiền</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {mockBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">{booking.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{booking.tour}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{booking.date}</td>
                          <td className="px-6 py-4 text-sm text-blue-600">{booking.total.toLocaleString('vi-VN')}đ</td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleDownloadInvoice(booking.id)}
                              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <Download className="size-4" />
                              Tải xuống
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-2xl text-gray-900 mb-4">Đánh giá của tôi</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-xl p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg text-gray-900">{review.tour}</h3>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <div className="flex gap-1 mb-2">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="size-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}

                  {/* Add Review Form */}
                  <div className="bg-white rounded-xl p-6">
                    <h3 className="text-lg text-gray-900 mb-4">Viết đánh giá mới</h3>
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Chọn tour</label>
                        <select className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Du ngoạn Vịnh Hạ Long</option>
                          <option>Thiên đường Phú Quốc</option>
                          <option>Phố cổ Hội An</option>
                          <option>Biển xanh Đà Nẵng</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Đánh giá</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" className="hover:scale-110 transition-transform">
                              <Star className="size-8 fill-yellow-400 text-yellow-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Nhận xét</label>
                        <textarea
                          rows={4}
                          className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Chia sẻ trải nghiệm của bạn..."
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
              <div className="bg-white rounded-xl p-6">
                <h2 className="text-2xl text-gray-900 mb-6">Thông tin cá nhân</h2>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Họ và tên</label>
                      <input
                        type="text"
                        defaultValue={user.name}
                        className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        placeholder="+84 XXX XXX XXX"
                        className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-2">Ngày sinh</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Địa chỉ</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Lưu thay đổi
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
