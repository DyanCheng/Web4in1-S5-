import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Plane, Hotel, Plus, Edit, Trash2, Calendar, DollarSign, Users } from 'lucide-react';

export default function HotelOwnerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('rooms');

  const stats = [
    { label: 'Tổng phòng', value: '24', icon: <Hotel className="size-8" />, color: 'bg-blue-100 text-blue-600' },
    { label: 'Đã đặt', value: '18', icon: <Calendar className="size-8" />, color: 'bg-green-100 text-green-600' },
    { label: 'Doanh thu tháng', value: '$12,450', icon: <DollarSign className="size-8" />, color: 'bg-purple-100 text-purple-600' },
    { label: 'Khách hàng', value: '156', icon: <Users className="size-8" />, color: 'bg-orange-100 text-orange-600' }
  ];

  const [rooms, setRooms] = useState([
    { id: 1, name: 'Deluxe Ocean View', type: 'Deluxe', price: 3980000, status: 'available', beds: 2, guests: 4 },
    { id: 2, name: 'Premium Suite', type: 'Suite', price: 5980000, status: 'booked', beds: 1, guests: 2 },
    { id: 3, name: 'Standard Twin Room', type: 'Standard', price: 2580000, status: 'available', beds: 2, guests: 2 },
    { id: 4, name: 'Family Room', type: 'Family', price: 4980000, status: 'available', beds: 3, guests: 6 }
  ]);

  const [bookings, setBookings] = useState([
    { id: 'BK-001', room: 'Deluxe Ocean View', customer: 'Nguyễn Văn A', checkIn: '2026-06-15', checkOut: '2026-06-20', total: 19900000, status: 'confirmed' },
    { id: 'BK-002', room: 'Premium Suite', customer: 'Trần Thị B', checkIn: '2026-06-18', checkOut: '2026-06-22', total: 23920000, status: 'pending' },
    { id: 'BK-003', room: 'Standard Twin', customer: 'Lê Văn C', checkIn: '2026-06-20', checkOut: '2026-06-25', total: 12900000, status: 'confirmed' }
  ]);

  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    type: 'Standard',
    price: '',
    beds: '1',
    guests: '2'
  });

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const room = {
      id: rooms.length + 1,
      name: newRoom.name,
      type: newRoom.type,
      price: parseInt(newRoom.price),
      status: 'available' as const,
      beds: parseInt(newRoom.beds),
      guests: parseInt(newRoom.guests)
    };
    setRooms([...rooms, room]);
    setShowAddRoom(false);
    setNewRoom({ name: '', type: 'Standard', price: '', beds: '1', guests: '2' });
  };

  const handleDeleteRoom = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa phòng này?')) {
      setRooms(rooms.filter(r => r.id !== id));
    }
  };

  if (!user || user.role !== 'hotel_owner') {
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
              <Hotel className="size-8 text-blue-600" />
              <span className="text-2xl text-gray-900">Hotel Management</span>
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
          <h1 className="text-3xl text-gray-900">Quản lý khách sạn</h1>
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
              {['rooms', 'bookings', 'pricing'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab === 'rooms' && 'Quản lý phòng'}
                  {tab === 'bookings' && 'Đặt phòng'}
                  {tab === 'pricing' && 'Giá & Khuyến mãi'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Rooms Tab */}
            {activeTab === 'rooms' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl text-gray-900">Danh sách phòng</h2>
                  <button
                    onClick={() => setShowAddRoom(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="size-5" />
                    Thêm phòng
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map((room) => (
                    <div key={room.id} className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg text-gray-900 mb-1">{room.name}</h3>
                          <p className="text-sm text-gray-500">{room.type}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            room.status === 'available'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {room.status === 'available' ? 'Trống' : 'Đã đặt'}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Số giường:</span>
                          <span className="text-gray-900">{room.beds}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Số khách:</span>
                          <span className="text-gray-900">{room.guests}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-2xl text-blue-600">{room.price.toLocaleString('vi-VN')}đ/đêm</div>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-700">
                            <Edit className="size-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="size-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-2xl text-gray-900 mb-6">Quản lý đặt phòng</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Mã đặt</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Phòng</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Khách hàng</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Check-in</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Check-out</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Tổng tiền</th>
                        <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">{booking.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{booking.room}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{booking.customer}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{booking.checkIn}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{booking.checkOut}</td>
                          <td className="px-6 py-4 text-sm text-blue-600">{booking.total.toLocaleString('vi-VN')}đ</td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div>
                <h2 className="text-2xl text-gray-900 mb-6">Quản lý giá & khuyến mãi</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-xl p-6">
                    <h3 className="text-lg text-gray-900 mb-4">Giá theo mùa</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-gray-700">Mùa thấp điểm</span>
                        <span className="text-blue-600">-20%</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-gray-700">Mùa cao điểm</span>
                        <span className="text-blue-600">+30%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Cuối tuần</span>
                        <span className="text-blue-600">+15%</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-xl p-6">
                    <h3 className="text-lg text-gray-900 mb-4">Mã khuyến mãi hiện tại</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-green-700">SUMMER2026</span>
                          <span className="text-green-600">-15%</span>
                        </div>
                        <p className="text-xs text-green-600">Hết hạn: 31/08/2026</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-blue-700">WEEKEND20</span>
                          <span className="text-blue-600">-20%</span>
                        </div>
                        <p className="text-xs text-blue-600">Áp dụng cuối tuần</p>
                      </div>
                    </div>
                    <button className="w-full mt-4 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      Tạo mã mới
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl text-gray-900 mb-6">Thêm phòng mới</h2>

            <form onSubmit={handleAddRoom} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Tên phòng</label>
                <input
                  type="text"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Loại phòng</label>
                <select
                  value={newRoom.type}
                  onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Standard</option>
                  <option>Deluxe</option>
                  <option>Suite</option>
                  <option>Family</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Số giường</label>
                  <input
                    type="number"
                    value={newRoom.beds}
                    onChange={(e) => setNewRoom({ ...newRoom, beds: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Số khách</label>
                  <input
                    type="number"
                    value={newRoom.guests}
                    onChange={(e) => setNewRoom({ ...newRoom, guests: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Giá/đêm ($)</label>
                <input
                  type="number"
                  value={newRoom.price}
                  onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddRoom(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thêm phòng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
