"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  Bell,
  Search,
  LayoutGrid,
  Settings,
  Mail,
  Loader2,
  Phone,
  X,
  Save,
  CheckCircle2,
  User,
  FileText,
  MessageSquare,
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface Booking {
  id: string;
  tourId: string;
  tourTitle: string;
  tourImage: string;
  userId: string;
  userEmail: string;
  date: string;
  guests: number;
  quantity?: number;
  total: number;
  status: string;
}

interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  note: string;
  index: number;
}

export default function EmployeeDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'has_notes' | 'no_notes'>('all');
  
  // Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Load custom notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('employee_customer_notes');
    if (savedNotes) {
      try {
        setNotesMap(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Error loading notes from localStorage:', e);
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const bookingsResponse = await fetch(`${BACKEND_URL}/api/bookings`);
      const bookingsData = bookingsResponse.ok ? await bookingsResponse.json() : [];
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user?.role !== 'employee') {
      router.push('/login');
      return;
    }
    fetchData();
  }, [user, router]);

  if (!user || user?.role !== 'employee') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-bold">
        Đang chuyển hướng quyền truy cập...
      </div>
    );
  }

  // Get initials for avatar
  const getInitials = (email: string) => {
    const namePart = email.split('@')[0];
    return namePart.substring(0, 2).toUpperCase();
  };

  // Mock notes for visual completeness as requested
  const mockNotes = [
    "Yêu cầu phòng hướng biển, ăn chay",
    "Dị ứng hải sản, không ăn cay",
    "Khách hủy do bận việc đột xuất",
    "Đón tại sân bay lúc 9h sáng",
    "Cần xe lăn cho người lớn tuổi"
  ];

  // Helper to generate consistent phone numbers based on email
  const getStablePhone = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const part = Math.abs(hash).toString().substring(0, 8).padEnd(8, '0');
    return `09${part.substring(0, 2)} ${part.substring(2, 5)} ${part.substring(5, 8)}`;
  };

  // Extract unique customers from bookings
  const uniqueCustomers: Customer[] = Array.from(
    new Map(
      bookings.map((booking, idx) => {
        const email = booking.userEmail;
        const name = email.split('@')[0];
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        const phone = getStablePhone(email);
        const note = notesMap[email] !== undefined ? notesMap[email] : mockNotes[idx % mockNotes.length];
        
        return [
          email,
          {
            id: booking.userId || `usr-${idx}`,
            email,
            name: formattedName,
            phone,
            note,
            index: idx
          }
        ];
      })
    ).values()
  );

  // Filter unique customers based on search and filter options
  const filteredCustomers = uniqueCustomers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.note.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (filterType === 'has_notes') {
      return matchesSearch && customer.note.trim() !== '';
    }
    if (filterType === 'no_notes') {
      return matchesSearch && customer.note.trim() === '';
    }
    return matchesSearch;
  });

  // Handle open modal
  const handleOpenModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditNoteText(customer.note);
  };

  // Handle save note
  const handleSaveNote = () => {
    if (!selectedCustomer) return;
    
    const updatedNotes = {
      ...notesMap,
      [selectedCustomer.email]: editNoteText
    };
    
    setNotesMap(updatedNotes);
    localStorage.setItem('employee_customer_notes', JSON.stringify(updatedNotes));
    
    // Show success toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
    
    // Close modal
    setSelectedCustomer(null);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex font-sans">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 bg-[#f8faff] border-r border-slate-200 flex flex-col fixed h-full left-0 top-0 z-10">
        <div className="px-6 py-8">
          <h1 className="text-xl font-black text-blue-700 tracking-tight">CMC Travel</h1>
          <p className="text-xs font-bold text-slate-500 mt-1">Management Portal</p>
        </div>

        <nav className="px-4 space-y-2 mt-4 flex-1">
          <button className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-[#1e3a8a] bg-blue-50/50 shadow-sm border border-blue-100/50 transition-colors text-left">
            <LayoutGrid className="size-5 text-blue-600" />
            Thông Tin Khách Hàng
          </button>
          <Link
            href="/employee/support"
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <MessageSquare className="size-5" />
            Hỗ trợ chat
          </Link>
        </nav>

        <div className="px-4 pb-8 space-y-2">
          <div className="h-px bg-slate-200 mb-4 mx-2" />
          <button onClick={logout} className="w-full flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors text-left">
            <Settings className="size-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[260px] flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm tên, email, số điện thoại, ghi chú..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full bg-[#f4f7fb] border-none px-10 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none text-slate-700"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="text-slate-500 hover:text-slate-700 transition-colors">
              <Bell className="size-5" />
            </button>
            <button className="text-slate-500 hover:text-slate-700 transition-colors">
              <Mail className="size-5" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer"  title="Click to logout">
              <div className="size-8 rounded-full bg-slate-200 overflow-hidden">
                <img src={user.avatar || '/default-avatar.png'} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-sm font-semibold text-slate-700">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 flex-1">
          {loading ? (
             <div className="flex items-center justify-center py-20">
               <Loader2 className="size-8 animate-spin text-blue-600" />
             </div>
          ) : (
            <>
              {/* Title & Actions */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Thông Tin & Ghi Chú Khách Hàng</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Xem thông tin liên lạc và quản lý ghi chú yêu cầu đặc biệt của khách hàng.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="all">Tất cả khách hàng</option>
                    <option value="has_notes">Có ghi chú đặc biệt</option>
                    <option value="no_notes">Không có ghi chú</option>
                  </select>
                </div>
              </div>

              {/* Table Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8faff] border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-5">Khách Hàng</th>
                        <th className="px-6 py-5 w-[200px]">Số Điện Thoại</th>
                        <th className="px-6 py-5">Ghi Chú Yêu Cầu</th>
                        <th className="px-6 py-5 w-[180px] text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.email} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5 align-top">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100/50">
                                {getInitials(customer.email)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{customer.name}</p>
                                <p className="text-xs text-slate-500 truncate">{customer.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-middle text-slate-600 font-medium">
                            <div className="flex items-center gap-2">
                              <Phone className="size-4 text-slate-400" />
                              <span>{customer.phone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            {customer.note ? (
                              <span className="inline-block px-3 py-1.5 rounded-lg bg-orange-50 text-orange-800 border border-orange-100 text-xs font-medium max-w-[400px] break-words">
                                {customer.note}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-xs">Chưa có ghi chú</span>
                            )}
                          </td>
                          <td className="px-6 py-5 align-middle text-right">
                            <button
                              onClick={() => handleOpenModal(customer)}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100"
                            >
                              Xem & Cập Nhật
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                            Không tìm thấy khách hàng nào khớp với tìm kiếm
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal chi tiết & Cập nhật ghi chú */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                <User className="size-5 text-blue-600" />
                Chi Tiết Khách Hàng
              </h3>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Customer Info Card */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0 border border-blue-200/50">
                  {getInitials(selectedCustomer.email)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-950 text-base">{selectedCustomer.name}</h4>
                  <p className="text-sm text-slate-500 font-medium">{selectedCustomer.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Số điện thoại</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Phone className="size-3.5 text-slate-400" />
                    {selectedCustomer.phone}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">ID Khách Hàng</span>
                  <span className="font-mono font-semibold text-slate-800 mt-0.5 block">{selectedCustomer.id}</span>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mb-6">
              <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FileText className="size-4 text-slate-400" />
                Ghi Chú Yêu Cầu & Chăm Sóc
              </label>
              <textarea
                value={editNoteText}
                onChange={(e) => setEditNoteText(e.target.value)}
                placeholder="Nhập yêu cầu đặc biệt, dị ứng, phòng ở, đưa đón, hoặc ghi chú khác của khách hàng..."
                className="w-full min-h-[120px] rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 placeholder:text-slate-400 transition-all resize-none shadow-inner"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
              >
                <Save className="size-4" />
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white rounded-xl px-4 py-3 shadow-xl flex items-center gap-2.5 z-50 border border-slate-800 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <CheckCircle2 className="size-5 text-emerald-500" />
          <span className="text-sm font-bold">Đã cập nhật ghi chú thành công!</span>
        </div>
      )}
    </div>
  );
}
