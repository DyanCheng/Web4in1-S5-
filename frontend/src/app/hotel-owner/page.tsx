"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Hotel, Plus, Edit, Trash2, Calendar, DollarSign, Users, Loader2, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

import { apiUrl } from '@/lib/backendUrl';
import { authFetch } from '@/lib/authFetch';

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
  const { theme, toggleTheme } = useTheme();
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
      const response = await fetch(apiUrl('/api/rooms'));
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
    if (!user || user?.role !== 'hotel_owner') {
      router.push('/login');
    } else {
      fetchRooms();
    }
  }, [user, router]);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authFetch('/api/rooms', {
        method: 'POST',
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
      const response = await authFetch(`/api/rooms/${id}`, {
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
    { label: 'Tổng số phòng', value: totalRooms.toString(), icon: <Hotel className="size-6" />, color: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' },
    { label: 'Phòng đã đặt', value: bookedRooms.toString(), icon: <Calendar className="size-6" />, color: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400' },
    { label: 'Doanh thu dự tính', value: `${monthlyRevenue.toLocaleString('vi-VN')}đ`, icon: <DollarSign className="size-6" />, color: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400' },
    { label: 'Lượt đặt phòng', value: totalGuests.toString(), icon: <Users className="size-6" />, color: 'bg-orange-50 dark:bg-orange-950/40 text-orange-655 dark:text-orange-400' }
  ];

  if (!user || user?.role !== 'hotel_owner') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-700 dark:text-slate-400 font-bold">
        Đang chuyển hướng quyền truy cập...
      </div>
    );
  }

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
                CMC Travel Hotels
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

              <span className="text-slate-750 dark:text-slate-205 font-bold text-sm">{user.name}</span>
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
              Quản lý đối tác khách sạn
            </span>
            <h1 className="text-3xl font-black font-serif text-slate-900 dark:text-white">Bảng Điều Khiển Hotel Owner</h1>
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

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100/40 dark:border-slate-800/40 shadow-sm overflow-hidden mb-10">
          <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 px-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`py-4 border-b-2 transition-colors font-bold text-sm tracking-wider cursor-pointer ${
                  activeTab === 'rooms'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                QUẢN LÝ PHÒNG
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-4 border-b-2 transition-colors font-bold text-sm tracking-wider cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                LỊCH ĐẶT PHÒNG KHÁCH SẠN
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-slate-500 dark:text-slate-400 font-bold">Đang tải danh sách phòng...</span>
              </div>
            ) : (
              <>
                {/* Rooms Tab */}
                {activeTab === 'rooms' && (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif">Danh sách phòng</h2>
                      <button
                        onClick={() => setShowAddRoom(true)}
                        className="px-4 py-2.5 bg-blue-900 hover:bg-blue-955 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl transition-colors flex items-center gap-2 font-bold text-xs cursor-pointer shadow-md"
                      >
                        <Plus className="size-4" />
                        Thêm phòng mới
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-bold text-xs">
                      {rooms.map((room) => (
                        <div key={room.id} className="border border-slate-100 dark:border-slate-800 rounded-3xl p-6 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:shadow transition-shadow">
                          <div>
                            <div className="flex items-start justify-between mb-4">
                              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{room.name}</h3>
                              <span
                                className={`px-2.5 py-0.5 rounded-full uppercase tracking-wide text-[9px] font-black ${
                                  room.status === 'available'
                                    ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                                    : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                                }`}
                              >
                                {room.status === 'available' ? 'Còn trống' : 'Đã đặt'}
                              </span>
                            </div>

                            <div className="space-y-2 text-slate-500 dark:text-slate-400 font-semibold mb-6">
                              <p>Loại phòng: <span className="text-slate-800 dark:text-slate-200 font-extrabold">{room.type}</span></p>
                              <p>Số giường: <span className="text-slate-800 dark:text-slate-200 font-extrabold">{room.beds} giường</span></p>
                              <p>Sức chứa: <span className="text-slate-800 dark:text-slate-200 font-extrabold">{room.guests} người</span></p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-xl font-black text-blue-900 dark:text-blue-400">{room.price.toLocaleString('vi-VN')}đ<span className="text-xxs text-slate-450 dark:text-slate-500 font-bold">/đêm</span></span>
                            <div className="flex gap-2">
                              <button onClick={() => alert('Chỉnh sửa phòng')} className="p-2 border border-slate-150 dark:border-slate-850 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-blue-600 dark:text-blue-400 cursor-pointer">
                                <Edit className="size-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="p-2 border border-slate-150 dark:border-slate-850 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-855 transition-colors text-red-500 cursor-pointer"
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
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif mb-6">Lịch đặt phòng khách sạn</h2>
                    
                    <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Mã đơn</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Phòng đặt</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Khách hàng</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Check In</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black">Check Out</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-550 uppercase tracking-widest font-black">Tổng chi phí</th>
                              <th className="px-6 py-3.5 text-left text-xs text-slate-400 dark:text-slate-555 uppercase tracking-widest font-black">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-105 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                            {bookings.map((b) => (
                              <tr key={b.id} className="hover:bg-slate-55/30 dark:hover:bg-slate-800/10">
                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{b.id}</td>
                                <td className="px-6 py-4 font-bold">{b.room}</td>
                                <td className="px-6 py-4">{b.customer}</td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{b.checkIn}</td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{b.checkOut}</td>
                                <td className="px-6 py-4 text-blue-900 dark:text-blue-400 font-black">{b.total.toLocaleString('vi-VN')}đ</td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase ${
                                      b.status === 'confirmed'
                                        ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                    }`}
                                  >
                                    {b.status === 'confirmed' ? 'Xác nhận' : 'Chờ duyệt'}
                                  </span>
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

      {/* Add Room Modal */}
      {showAddRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-left border border-slate-105/40 dark:border-slate-800/40 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6 font-serif">Thêm phòng mới</h3>
            
            <form onSubmit={handleAddRoom} className="space-y-4 font-bold text-xs">
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-550 mb-2">Tên phòng</label>
                <input
                  type="text"
                  required
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="Ví dụ: Suite Ocean view"
                  className="w-full px-4 py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-800 dark:text-slate-100 font-bold text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-555 mb-2">Loại phòng</label>
                  <select
                    value={newRoom.type}
                    onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-800 dark:text-slate-100 font-bold text-sm bg-white dark:bg-slate-900"
                  >
                    <option>Standard</option>
                    <option>Deluxe</option>
                    <option>Suite</option>
                    <option>Family</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-555 mb-2">Giá phòng / đêm</label>
                  <input
                    type="number"
                    required
                    value={newRoom.price}
                    onChange={(e) => setNewRoom({ ...newRoom, price: e.target.value })}
                    placeholder="đ"
                    className="w-full px-4 py-3 border border-slate-150 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-800 dark:text-slate-100 font-bold text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-555 mb-2">Số giường</label>
                  <input
                    type="number"
                    min="1"
                    value={newRoom.beds}
                    onChange={(e) => setNewRoom({ ...newRoom, beds: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-155 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-800 dark:text-slate-100 font-bold text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 dark:text-slate-555 mb-2">Sức chứa tối đa</label>
                  <input
                    type="number"
                    min="1"
                    value={newRoom.guests}
                    onChange={(e) => setNewRoom({ ...newRoom, guests: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-155 dark:border-slate-800 bg-transparent rounded-2xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-800 dark:text-slate-100 font-bold text-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddRoom(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850 font-bold text-slate-700 dark:text-slate-350 transition-all cursor-pointer text-center text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-900 dark:bg-blue-600 text-white rounded-2xl hover:bg-blue-955 dark:hover:bg-blue-700 font-bold transition-all cursor-pointer text-center text-xs shadow"
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
