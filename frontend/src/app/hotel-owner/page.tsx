"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Plane, Hotel, Plus, Edit, Trash2, Calendar, DollarSign, Users, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5200';

interface Room {
  id: number;
  name: string;
  type: string;
  price: number;
  beds: number;
  guests: number;
  status: string;
}

export default function HotelOwnerDashboard() {
  const router = useRouter();
  const navigate = (url: string) => router.push(url);
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${BACKEND_URL}/api/rooms`);
      if (!response.ok) throw new Error('Không thể kết nối máy chủ');
      const data = await response.json();
      setRooms(data);
    } catch {
      // Local fallback
      setRooms([
        { id: 1, name: 'Deluxe Ocean View', type: 'Deluxe', price: 3980000, status: 'available', beds: 2, guests: 4 },
        { id: 2, name: 'Premium Suite', type: 'Suite', price: 5980000, status: 'booked', beds: 1, guests: 2 },
        { id: 3, name: 'Standard Twin Room', type: 'Standard', price: 2580000, status: 'available', beds: 2, guests: 2 },
        { id: 4, name: 'Family Room', type: 'Family', price: 4980000, status: 'available', beds: 3, guests: 6 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'hotel_owner') {
      router.push('/login');
    } else {
      fetchRooms();
    }
  }, [user, router]);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoom.name,
          type: newRoom.type,
          price: parseInt(newRoom.price),
          beds: parseInt(newRoom.beds),
          guests: parseInt(newRoom.guests)
        }),
      });

      if (!response.ok) throw new Error('Lỗi thêm phòng');
      alert('Đã thêm phòng thành công!');
      setShowAddRoom(false);
      setNewRoom({ name: '', type: 'Standard', price: '', beds: '1', guests: '2' });
      fetchRooms();
    } catch {
      // Direct local fallback
      const fallbackRoom: Room = {
        id: rooms.length + 1,
        name: newRoom.name,
        type: newRoom.type,
        price: parseInt(newRoom.price) || 2000000,
        status: 'available',
        beds: parseInt(newRoom.beds) || 1,
        guests: parseInt(newRoom.guests) || 2
      };
      setRooms(prev => [...prev, fallbackRoom]);
      setShowAddRoom(false);
      setNewRoom({ name: '', type: 'Standard', price: '', beds: '1', guests: '2' });
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa phòng này?')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Xóa thất bại');
      alert('Đã xóa phòng thành công!');
      fetchRooms();
    } catch {
      setRooms(prev => prev.filter(r => r.id !== id));
    }
  };

  // Stats computation
  const totalRooms = rooms.length;
  const bookedRooms = rooms.filter(r => r.status === 'booked').length;
  const monthlyRevenue = bookings.reduce((sum, b) => sum + b.total, 0);
  const totalGuests = bookings.length;

  const stats = [
    { label: 'Tổng số phòng', value: totalRooms.toString(), icon: <Hotel className="size-8" />, color: 'bg-blue-100 text-blue-600' },
    { label: 'Phòng đã đặt', value: bookedRooms.toString(), icon: <Calendar className="size-8" />, color: 'bg-green-100 text-green-700' },
    { label: 'Doanh thu dự tính', value: `${monthlyRevenue.toLocaleString('vi-VN')}đ`, icon: <DollarSign className="size-8" />, color: 'bg-purple-100 text-purple-600' },
    { label: 'Lượt khách đặt', value: totalGuests.toString(), icon: <Users className="size-8" />, color: 'bg-orange-100 text-orange-600' }
  ];

  if (!user || user.role !== 'hotel_owner') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-700 font-medium">
        Đang chuyển hướng quyền truy cập...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Hotel className="size-8 text-blue-600" />
              <span className="text-2xl text-gray-900 font-bold">Quản lý Khách sạn</span>
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
          <h1 className="text-3xl text-gray-900 font-bold">Khu vực Hotel Owner</h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
            ← Về trang chủ
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-left">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
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
              <button
                onClick={() => setActiveTab('rooms')}
                className={`py-4 border-b-2 transition-colors font-semibold cursor-pointer ${
                  activeTab === 'rooms'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Quản lý phòng
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 border-b-2 transition-colors font-semibold cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Đơn đặt phòng khách sạn
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600 font-medium">Đang tải danh sách phòng...</span>
              </div>
            ) : (
              <>
                {/* Rooms Tab */}
                {activeTab === 'rooms' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl text-gray-900 font-bold">Danh sách phòng</h2>
                      <button
                        onClick={() => setShowAddRoom(true)}
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold cursor-pointer"
                      >
                        <Plus className="size-5" />
                        Thêm phòng mới
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {rooms.map((room) => (
                        <div key={room.id} className="border rounded-xl p-6 bg-white shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between mb-4">
                              <h3 className="text-xl text-gray-900 font-bold">{room.name}</h3>
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  room.status === 'available'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {room.status === 'available' ? 'Còn trống' : 'Đã đặt'}
                              </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600 font-medium mb-6">
                              <p>Loại phòng: <span className="text-gray-955 font-semibold">{room.type}</span></p>
                              <p>Số giường: <span className="text-gray-955 font-semibold">{room.beds} giường</span></p>
                              <p>Sức chứa: <span className="text-gray-955 font-semibold">{room.guests} người</span></p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <span className="text-xl text-blue-600 font-bold">{room.price.toLocaleString('vi-VN')}đ<span className="text-xs text-gray-500 font-semibold">/đêm</span></span>
                            <div className="flex gap-2">
                              <button onClick={() => alert('Chỉnh sửa phòng')} className="p-2 border rounded-lg hover:bg-gray-50 transition-colors text-blue-600 cursor-pointer">
                                <Edit className="size-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="p-2 border rounded-lg hover:bg-gray-55 transition-colors text-red-600 cursor-pointer"
                              >
                                <Trash2 className="size-4" />
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
                    <h2 className="text-2xl text-gray-900 mb-6 font-bold">Lịch đặt phòng khách sạn</h2>
                    <div className="overflow-x-auto border rounded-xl">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Mã đơn</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Phòng</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Khách hàng</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Check In</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Check Out</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Tổng tiền</th>
                            <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase font-semibold">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y font-medium text-sm text-gray-800 bg-white">
                          {bookings.map((b) => (
                            <tr key={b.id}>
                              <td className="px-6 py-4 font-bold">{b.id}</td>
                              <td className="px-6 py-4 font-semibold">{b.room}</td>
                              <td className="px-6 py-4">{b.customer}</td>
                              <td className="px-6 py-4">{b.checkIn}</td>
                              <td className="px-6 py-4">{b.checkOut}</td>
                              <td className="px-6 py-4 text-blue-600 font-bold">{b.total.toLocaleString('vi-VN')}đ</td>
                              <td className="px-6 py-4 text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    b.status === 'confirmed'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}
                                >
                                  {b.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                                </span>
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

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full text-left">
            <h3 className="text-xl text-gray-900 mb-6 font-bold">Thêm phòng mới</h3>
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2 font-semibold">Tên phòng</label>
                <input
                  type="text"
                  required
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="Ví dụ: Suite Ocean view"
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-semibold">Loại phòng</label>
                  <select
                    value={newRoom.type}
                    onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  >
                    <option>Standard</option>
                    <option>Deluxe</option>
                    <option>Suite</option>
                    <option>Family</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-semibold">Giá phòng / đêm</label>
                  <input
                    type="number"
                    required
                    value={newRoom.price}
                    onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                    placeholder="đ"
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-semibold">Số giường</label>
                  <input
                    type="number"
                    min="1"
                    value={newRoom.beds}
                    onChange={(e) => setNewRoom({ ...newRoom, beds: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2 font-semibold">Sức chứa tối đa</label>
                  <input
                    type="number"
                    min="1"
                    value={newRoom.guests}
                    onChange={(e) => setNewRoom({ ...newRoom, guests: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddRoom(false)}
                  className="flex-1 py-2.5 border rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors cursor-pointer text-center"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors cursor-pointer text-center"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
