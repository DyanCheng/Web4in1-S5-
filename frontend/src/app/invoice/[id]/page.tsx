"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Printer, ArrowLeft } from 'lucide-react';
import { apiUrl } from '@/lib/backendUrl';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        // Since we don't have a single booking endpoint yet, fetch all and find
        const response = await fetch(apiUrl(`/api/bookings/user/${encodeURIComponent(user.email)}`));
        if (!response.ok) throw new Error('Không thể tải dữ liệu hóa đơn');
        const data = await response.json();
        const found = data.find((b: any) => b.id === id);
        if (!found) throw new Error('Không tìm thấy hóa đơn này');
        setBooking(found);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [user, id]);

  const handlePrint = () => {
    window.print();
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 font-bold">
        <Loader2 className="size-8 animate-spin text-blue-600 mb-4" />
        Đang tải dữ liệu hóa đơn...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 font-bold">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-blue-600 text-white rounded-full">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-3xl mx-auto">
        {/* Controls - Hidden on print */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold">
            <ArrowLeft className="size-5" /> Trở về
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors">
            <Printer className="size-5" /> In hóa đơn
          </button>
        </div>

        {/* Invoice Paper */}
        <div className="bg-white p-10 sm:p-16 rounded-2xl shadow-xl print:shadow-none print:rounded-none">
          <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
            <div>
              <h1 className="text-4xl font-black text-blue-900 tracking-tight">HÓA ĐƠN</h1>
              <p className="text-slate-500 font-bold mt-1">Dịch vụ đặt tour trực tuyến</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-slate-900">Web4in1 Tour</h2>
              <p className="text-slate-500 text-sm mt-1">123 Đường Du Lịch, Quận 1, TP.HCM</p>
              <p className="text-slate-500 text-sm">support@web4in1.com</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Khách hàng</p>
              <h3 className="text-lg font-black text-slate-900">{user.name}</h3>
              <p className="text-slate-600 text-sm">{user.email}</p>
            </div>
            <div className="text-right">
              <div className="mb-4">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">Mã hóa đơn</p>
                <p className="font-bold text-slate-900">{booking.id}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">Ngày lập</p>
                <p className="font-bold text-slate-900">{new Date().toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          </div>

          <table className="w-full text-left mb-12">
            <thead className="bg-slate-50">
              <tr>
                <th className="py-3 px-4 font-black text-slate-600 uppercase text-xs tracking-widest rounded-l-lg">Chi tiết dịch vụ</th>
                <th className="py-3 px-4 font-black text-slate-600 uppercase text-xs tracking-widest">Thời gian</th>
                <th className="py-3 px-4 font-black text-slate-600 uppercase text-xs tracking-widest">Khách</th>
                <th className="py-3 px-4 font-black text-slate-600 uppercase text-xs tracking-widest text-right rounded-r-lg">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-6 px-4">
                  <p className="font-bold text-slate-900">{booking.tourTitle}</p>
                  <p className="text-sm text-slate-500 mt-1">Gói dịch vụ tour trọn gói</p>
                </td>
                <td className="py-6 px-4 text-slate-700 font-medium">{booking.date}</td>
                <td className="py-6 px-4 text-slate-700 font-medium">{booking.guests}</td>
                <td className="py-6 px-4 text-right font-black text-slate-900">{Number(booking.total).toLocaleString('vi-VN')}đ</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-full sm:w-1/2">
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="font-bold text-slate-600">Tạm tính</span>
                <span className="font-bold text-slate-900">{Number(booking.total).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="font-bold text-slate-600">Thuế (VAT 0%)</span>
                <span className="font-bold text-slate-900">0đ</span>
              </div>
              <div className="flex justify-between py-4 mt-2 bg-blue-50/50 rounded-xl px-4 border border-blue-100">
                <span className="font-black text-blue-900">Tổng cộng</span>
                <span className="font-black text-blue-700 text-xl">{Number(booking.total).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t-2 border-slate-100 text-center text-slate-500 text-sm font-medium">
            <p>Cảm ơn quý khách đã sử dụng dịch vụ của Web4in1.</p>
            <p className="mt-1">Nếu có thắc mắc về hóa đơn, vui lòng liên hệ hotline: 1900 xxxx.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
