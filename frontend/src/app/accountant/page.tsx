"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Bell,
  Search,
  LayoutGrid,
  CalendarDays,
  Wallet,
  Settings,
  HelpCircle,
  LogOut,
  TrendingUp,
  CreditCard,
  Briefcase,
  ChevronRight,
  Plus,
  Info,
  Banknote,
  LineChart
} from 'lucide-react';

export default function AccountantDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // In this static UI recreation, we use mock data to perfectly match the screenshot.
  // We can hook it up to real backend endpoints later.

  useEffect(() => {
    if (!user || user?.role !== 'accountant') {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || user?.role !== 'accountant') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-bold">
        Đang chuyển hướng quyền truy cập...
      </div>
    );
  }

  const transactions = [
    { id: '#TRV-8822', date: '14/05/2024', partner: 'Hanoi City Tour', type: 'TOUR', amount: '4,200,000 đ' },
    { id: '#TRV-8823', date: '14/05/2024', partner: 'Bamboo Airways', type: 'TRANSPORT', amount: '2,850,000 đ' },
    { id: '#TRV-8824', date: '13/05/2024', partner: 'Sapa Express', type: 'TRANSPORT', amount: '1,200,000 đ' },
    { id: '#TRV-8825', date: '12/05/2024', partner: 'Halong Cruise', type: 'TOUR', amount: '8,500,000 đ' },
  ];

  const partners = [
    { name: 'Vinpearl Resorts', txCount: 12, amount: '145.2M', prefix: 'V', color: 'bg-blue-100 text-blue-700' },
    { name: 'Muong Thanh Hotels', txCount: 8, amount: '92.8M', prefix: 'M', color: 'bg-indigo-100 text-indigo-700' },
    { name: 'Air Asia Partner', txCount: 15, amount: '210.5M', prefix: 'A', color: 'bg-sky-100 text-sky-700' },
    { name: 'Sun Group', txCount: 22, amount: '396.8M', prefix: 'S', color: 'bg-blue-100 text-blue-700' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex font-sans">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 border-r border-slate-200 bg-slate-50/50 flex flex-col fixed h-full left-0 top-0">
        <div className="p-6">
          <h1 className="text-xl font-black text-blue-700 tracking-tight">CMC Travel</h1>
        </div>

        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="size-10 rounded-full bg-slate-200 overflow-hidden">
            <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">Kế toán</p>
          </div>
        </div>

        <nav className="px-4 space-y-1.5 flex-1">
          <button className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-blue-700 bg-blue-100/50 transition-colors text-left">
            <Wallet className="size-5" strokeWidth={2.5} />
            Quản lý doanh thu
          </button>
        </nav>

        <div className="px-4 pb-6 mt-4 space-y-1">
          <button onClick={logout} className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors text-left">
            <LogOut className="size-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[260px] flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6">
          <div>
            <h2 className="text-xl font-medium text-slate-800">Kế toán & Tổng hợp doanh thu</h2>
            <p className="text-sm text-slate-500 mt-1">Tổng quan tài chính hệ thống TravelHub</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm giao dịch..." 
                className="w-64 rounded-xl bg-slate-100/80 border-none px-10 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <button className="relative p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
              <Bell className="size-5" />
              <span className="absolute top-2 right-2.5 size-2 rounded-full bg-red-500 border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="px-8 pb-8 flex-1">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-start justify-between mb-8">
                <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <TrendingUp className="size-5" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  +12.5% <TrendingUp className="size-3" />
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tổng doanh thu (Gross)</p>
              <p className="text-xl font-bold text-slate-800">2,450,000,000 <span className="underline decoration-1 underline-offset-2">đ</span></p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-start justify-between mb-8">
                <div className="size-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Banknote className="size-5" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  +8.2% <TrendingUp className="size-3" />
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Doanh thu thuần (Net)</p>
              <p className="text-xl font-bold text-slate-800">1,890,200,000 <span className="underline decoration-1 underline-offset-2">đ</span></p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-start justify-between mb-8">
                <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Wallet className="size-5" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Số dư khả dụng</p>
              <p className="text-xl font-bold text-slate-800">560,450,000 <span className="underline decoration-1 underline-offset-2">đ</span></p>
            </div>

            {/* Card 4 */}
            <div className="bg-blue-700 rounded-3xl p-6 shadow-md shadow-blue-700/20 text-white flex flex-col">
              <div className="flex items-start justify-between mb-8">
                <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <LineChart className="size-5" strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-[11px] font-bold text-blue-200 uppercase tracking-wider mb-2">Lợi nhuận dự tính</p>
              <p className="text-xl font-bold">425,000,000 <span className="underline decoration-1 underline-offset-2">đ</span></p>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_320px] gap-6">
            
            {/* Left Column (Chart + Table) */}
            <div className="space-y-6">
              
              {/* Chart Section */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm min-h-[380px] flex flex-col relative">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">Doanh thu theo thời gian</h3>
                    <p className="text-sm text-slate-500 mt-1">Phân tích dòng tiền hàng kỳ</p>
                  </div>
                  <div className="flex bg-slate-100/80 p-1 rounded-xl">
                    <button className="px-4 py-1.5 text-xs font-semibold text-slate-500 rounded-lg">Ngày</button>
                    <button className="px-4 py-1.5 text-xs font-semibold text-slate-500 rounded-lg">Tuần</button>
                    <button className="px-4 py-1.5 text-xs font-bold text-blue-700 bg-white rounded-lg shadow-sm">Tháng</button>
                    <button className="px-4 py-1.5 text-xs font-semibold text-slate-500 rounded-lg">Năm</button>
                  </div>
                </div>
                
                {/* Mock Chart Area */}
                <div className="flex-1 w-full flex items-end justify-between px-4 pb-2 pt-10">
                  {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'].map((month, idx) => (
                    <div key={month} className="flex flex-col items-center gap-3">
                      <div className="relative flex items-end justify-center w-8">
                        {/* Hidden bars just for visual spacing since screenshot chart lines aren't exact */}
                      </div>
                      <span className={`text-xs font-bold ${month === 'T6' ? 'text-blue-700' : 'text-slate-400'}`}>
                        {month}
                      </span>
                    </div>
                  ))}
                </div>
                {/* A light line for x axis */}
                <div className="absolute bottom-[36px] left-6 right-6 h-px bg-slate-100" />
              </div>

              {/* Table Section */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 flex items-center justify-between border-b border-slate-100">
                  <h3 className="text-base font-semibold text-slate-800">Bảng giao dịch gần đây</h3>
                  <button className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:text-blue-700">
                    Xem tất cả <ChevronRight className="size-4" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">ID Giao Dịch</th>
                        <th className="px-6 py-4">Ngày</th>
                        <th className="px-6 py-4">Đối Tác</th>
                        <th className="px-6 py-4">Dịch Vụ</th>
                        <th className="px-6 py-4 text-right">Số Tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-semibold text-blue-600">{tx.id}</td>
                          <td className="px-6 py-4 text-slate-600">{tx.date}</td>
                          <td className="px-6 py-4 font-medium text-slate-800">{tx.partner}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${
                              tx.type === 'TOUR' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900">{tx.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column (Settlements) */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col min-h-full">
              <div className="flex items-center gap-2 mb-6 text-slate-800">
                <CreditCard className="size-5" />
                <h3 className="font-semibold text-base">Quyết toán đối tác</h3>
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-5 mb-8 border border-blue-100/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-600">Tổng cần thanh toán</span>
                  <Info className="size-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-700">845,300,000 <span className="underline decoration-1 underline-offset-2">đ</span></p>
                <p className="text-[11px] text-slate-500 mt-2">Dự kiến thanh toán vào Thứ 6 tới</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 tracking-wider mb-4">DANH SÁCH CHỜ</p>
                <div className="space-y-4">
                  {partners.map((partner) => (
                    <div key={partner.name} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-xl flex items-center justify-center font-bold text-sm ${partner.color}`}>
                          {partner.prefix}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{partner.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{partner.txCount} Giao dịch</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-slate-900">{partner.amount}</p>
                        <button className="text-[9px] font-bold text-blue-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity mt-1">Chi tiết</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-auto pt-6">
                <button className="w-full rounded-xl bg-slate-900 text-white font-bold text-sm py-3 hover:bg-slate-800 transition-colors">
                  Xuất Báo Cáo Quyết Toán
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto px-8 py-5 bg-slate-900 text-white flex items-center justify-between text-xs">
          <div className="font-bold">TravelHub</div>
          <div className="flex items-center gap-6 text-slate-400">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Newsletter</span>
          </div>
          <div className="text-slate-500">
            © 2024 TravelHub. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}
